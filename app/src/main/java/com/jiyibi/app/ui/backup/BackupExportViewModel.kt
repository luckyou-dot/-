package com.jiyibi.app.ui.backup

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.backup.Exporter
import com.jiyibi.app.core.backup.MigrateBackup
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** 备份导出页 UI 状态。 */
data class BackupExportUiState(
    val totalTransactions: Int = 0,
    val lastExportPath: String? = null,
    val isLoading: Boolean = false,
)

@HiltViewModel
class BackupExportViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val exporter: Exporter,
    private val migrateBackup: MigrateBackup,
    @ApplicationContext private val context: Context,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BackupExportUiState())
    val uiState: StateFlow<BackupExportUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            // 全量交易（start=0, end=Long.MAX_VALUE）
            transactionRepository.observeRange(0L, Long.MAX_VALUE).collect { list ->
                _uiState.update { it.copy(totalTransactions = list.size) }
            }
        }
    }

    /** 导出 CSV 到 Downloads 目录 */
    fun exportCsv(onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true) }
                val transactions = transactionRepository.observeRange(0L, Long.MAX_VALUE).first()
                val fileName = "jiyibi_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.csv"
                // Android 10+ 用 MediaStore.Downloads；Android 9 及以下用外部存储公共目录
                val savedPath = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    saveToDownloadsViaMediaStore(fileName, transactions)
                } else {
                    saveToLegacyExternalStorage(fileName, transactions)
                }
                _uiState.update { it.copy(isLoading = false, lastExportPath = savedPath) }
                onResult(true, "已导出至 $savedPath")
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false) }
                onResult(false, "导出失败：${e.message}")
            }
        }
    }

    /** 导出 JSON 备份到 Downloads 目录 */
    fun backupToJson(onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true) }
                val json = migrateBackup.exportPlainBackup()
                val fileName = "jiyibi_backup_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.json"
                val savedPath = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    saveJsonViaMediaStore(fileName, json)
                } else {
                    saveJsonToLegacyExternalStorage(fileName, json)
                }
                _uiState.update { it.copy(isLoading = false, lastExportPath = savedPath) }
                onResult(true, "已备份至 $savedPath")
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false) }
                onResult(false, "备份失败：${e.message}")
            }
        }
    }

    /** 从 JSON Uri 恢复数据 */
    fun restoreFromJson(uri: Uri, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true) }
                val json = context.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) }
                    ?: throw IOException("无法读取备份文件")
                val success = migrateBackup.importPlainBackup(json)
                _uiState.update { it.copy(isLoading = false) }
                if (success) onResult(true, "恢复成功")
                else onResult(false, "恢复失败：备份文件格式错误")
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false) }
                onResult(false, "恢复失败：${e.message}")
            }
        }
    }

    private suspend fun saveToDownloadsViaMediaStore(fileName: String, transactions: List<Transaction>): String {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "text/csv")
            put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/记一笔")
        }
        val uri = resolver.insert(MediaStore.Files.getContentUri("external"), values)
            ?: throw IOException("无法创建文件")
        resolver.openOutputStream(uri)?.use { out -> exporter.exportCsv(transactions, out) }
            ?: throw IOException("无法打开输出流")
        return "Download/记一笔/$fileName"
    }

    private suspend fun saveJsonViaMediaStore(fileName: String, json: String): String {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/json")
            put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/记一笔")
        }
        val uri = resolver.insert(MediaStore.Files.getContentUri("external"), values)
            ?: throw IOException("无法创建文件")
        resolver.openOutputStream(uri)?.use { out -> out.write(json.toByteArray(Charsets.UTF_8)) }
            ?: throw IOException("无法打开输出流")
        return "Download/记一笔/$fileName"
    }

    private fun saveToLegacyExternalStorage(fileName: String, transactions: List<Transaction>): String {
        // Android 9 及以下需 WRITE_EXTERNAL_STORAGE 权限，本简化版直接抛出
        throw IOException("Android 9 及以下暂不支持，请升级系统")
    }

    private fun saveJsonToLegacyExternalStorage(fileName: String, json: String): String {
        throw IOException("Android 9 及以下暂不支持，请升级系统")
    }
}
