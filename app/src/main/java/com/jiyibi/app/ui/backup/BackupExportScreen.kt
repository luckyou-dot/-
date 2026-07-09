package com.jiyibi.app.ui.backup

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Restore
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.AnimatedNumber
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.LoadingState
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.theme.gradientBrush
import kotlinx.coroutines.launch

/**
 * 导出与备份页。
 *
 * - CSV 导出：通过 MediaStore 写入 Downloads/记一笔（Android 10+）
 * - JSON 备份/恢复：明文 JSON 全量备份，可从文件恢复
 * - 格式说明：CSV 含 UTF-8 BOM，Excel 可直接打开中文不乱码
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BackupExportScreen(
    onBack: () -> Unit,
    viewModel: BackupExportViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // 对话框状态
    var showFormatDialog by remember { mutableStateOf(false) }
    var showRestoreConfirm by remember { mutableStateOf(false) }
    // 待恢复的文件 Uri（用户选择后先弹确认，再执行恢复）
    var pendingRestoreUri by remember { mutableStateOf<android.net.Uri?>(null) }

    // 文件选择器：选择 JSON 备份文件恢复
    val restoreLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri ->
        if (uri != null) {
            pendingRestoreUri = uri
            showRestoreConfirm = true
        }
    }

    /**
     * 触发 CSV 导出；offerShare=true 时在成功后弹「是否分享？」Snackbar + 分享动作。
     */
    fun triggerExport(offerShare: Boolean) {
        viewModel.exportCsv { success, message ->
            scope.launch {
                if (offerShare && success) {
                    val result = snackbarHostState.showSnackbar(
                        message = "已导出，是否分享？",
                        actionLabel = "分享",
                        duration = SnackbarDuration.Long,
                    )
                    if (result == SnackbarResult.ActionPerformed) {
                        // 简化分享：以文本形式分享导出结果（message 已含路径）
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, message)
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "分享"))
                    }
                } else {
                    snackbarHostState.showSnackbar(message)
                }
            }
        }
    }

    /** 触发 JSON 备份 */
    fun triggerBackup() {
        viewModel.backupToJson { success, message ->
            scope.launch { snackbarHostState.showSnackbar(message) }
        }
    }

    /** 执行恢复（用户确认后调用） */
    fun executeRestore(uri: android.net.Uri) {
        viewModel.restoreFromJson(uri) { success, message ->
            scope.launch { snackbarHostState.showSnackbar(message) }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("导出与备份") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    start = Spacing.l,
                    end = Spacing.l,
                    top = Spacing.m,
                    bottom = Spacing.xxl,
                ),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                // 1. 顶部渐变统计卡：渐变背景 + 圆角，显示总交易笔数（AnimatedNumber 等宽白色）
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(Corner.large))
                            .background(gradientBrush())
                            .padding(horizontal = Spacing.xl, vertical = Spacing.xl),
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                            Text(
                                text = "总交易笔数",
                                style = MaterialTheme.typography.labelLarge,
                                color = Color.White.copy(alpha = 0.85f),
                            )
                            // 数字滚动动效：等宽字体 + 白色，保证渐变背景上清晰可读
                            AnimatedNumber(
                                targetValue = state.totalTransactions.toDouble(),
                                decimals = 0,
                                style = MaterialTheme.typography.displaySmall.copy(
                                    fontFamily = FontFamily.Monospace,
                                ),
                                color = Color.White,
                            )
                        }
                    }
                }

                // 2. 数据导出分组
                item { SectionHeader("数据导出") }
                item {
                    UnifiedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .listItemEnterAnimation(0),
                        variant = UnifiedCardVariant.ELEVATED,
                        contentPadding = PaddingValues(vertical = Spacing.xs),
                    ) {
                        BackupActionItem(
                            icon = Icons.Filled.Download,
                            title = "导出 CSV",
                            subtitle = "保存到下载目录",
                            onClick = { triggerExport(offerShare = false) },
                        )
                        BackupActionItem(
                            icon = Icons.Filled.Share,
                            title = "分享 CSV",
                            subtitle = "导出后分享",
                            onClick = { triggerExport(offerShare = true) },
                        )
                    }
                }

                // 3. 备份与恢复分组
                item { SectionHeader("备份与恢复") }
                item {
                    UnifiedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .listItemEnterAnimation(1),
                        variant = UnifiedCardVariant.ELEVATED,
                        contentPadding = PaddingValues(vertical = Spacing.xs),
                    ) {
                        BackupActionItem(
                            icon = Icons.Filled.CloudUpload,
                            title = "备份到本地",
                            subtitle = "JSON 全量备份，保存到下载目录",
                            onClick = { triggerBackup() },
                        )
                        BackupActionItem(
                            icon = Icons.Filled.Restore,
                            title = "从备份恢复",
                            subtitle = "从 JSON 文件恢复，将覆盖当前数据",
                            onClick = {
                                // 弹出文件选择器，选择 JSON 文件
                                restoreLauncher.launch(arrayOf("application/json", "application/octet-stream", "*/*"))
                            },
                        )
                    }
                }

                // 4. 关于分组
                item { SectionHeader("关于") }
                item {
                    UnifiedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .listItemEnterAnimation(2),
                        variant = UnifiedCardVariant.ELEVATED,
                        contentPadding = PaddingValues(vertical = Spacing.xs),
                    ) {
                        BackupActionItem(
                            icon = Icons.Filled.Info,
                            title = "导出格式说明",
                            subtitle = "CSV / JSON 格式说明",
                            onClick = { showFormatDialog = true },
                        )
                    }
                }
            }

            // 加载中覆盖（半透明黑蒙层）
            if (state.isLoading) {
                LoadingState(
                    modifier = Modifier.background(Color.Black.copy(alpha = 0.4f)),
                )
            }
        }
    }

    // 格式说明对话框
    if (showFormatDialog) {
        AlertDialog(
            onDismissRequest = { showFormatDialog = false },
            title = { Text("导出格式说明") },
            text = {
                Text(
                    "CSV 导出：UTF-8（含 BOM），Excel 可直接打开，中文不乱码。\n" +
                        "字段顺序：日期, 类型, 金额(元), 账户ID, 分类ID, 备注。\n\n" +
                        "JSON 备份：全量数据备份（账户、分类、交易、周期规则、借贷、预算）。\n" +
                        "可用于换机或重装后恢复。",
                )
            },
            confirmButton = {
                TextButton(onClick = { showFormatDialog = false }) { Text("知道了") }
            },
        )
    }

    // 恢复确认对话框（覆盖警告）
    if (showRestoreConfirm && pendingRestoreUri != null) {
        AlertDialog(
            onDismissRequest = {
                showRestoreConfirm = false
                pendingRestoreUri = null
            },
            title = { Text("从备份恢复") },
            text = {
                Text(
                    "恢复操作将覆盖当前所有数据，且不可撤销。\n" +
                        "建议先备份当前数据。\n\n" +
                        "确认要继续恢复吗？",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    pendingRestoreUri?.let { executeRestore(it) }
                    showRestoreConfirm = false
                    pendingRestoreUri = null
                }) { Text("确认恢复", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = {
                    showRestoreConfirm = false
                    pendingRestoreUri = null
                }) { Text("取消") }
            },
        )
    }
}

/** 分组标题：小号主色文本，左侧带轻量留白。 */
@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = Spacing.xs, top = Spacing.s, bottom = Spacing.xs),
    )
}

/**
 * 备份操作项：圆形主题色底图标 + 标题/副标题 + 右侧箭头。
 *
 * @param icon 主图标
 * @param title 主标题
 * @param subtitle 副标题
 * @param onClick 点击回调
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BackupActionItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    ListItem(
        modifier = Modifier.clickable(onClick = onClick),
        leadingContent = {
            // 圆形主题色底 + 主题色图标
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp),
                )
            }
        },
        headlineContent = { Text(title) },
        supportingContent = { Text(subtitle) },
        trailingContent = {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    )
}
