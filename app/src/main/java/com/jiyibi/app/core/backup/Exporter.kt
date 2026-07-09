package com.jiyibi.app.core.backup

import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.centsToYuan
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 数据导出器：CSV / Excel。
 *
 * Excel 采用最简方案——输出带 BOM 的 UTF-8 CSV，可被 Excel 直接识别，
 * 避免引入 Apache POI 这类重型依赖。
 */
@Singleton
class Exporter @Inject constructor() {

    private val isoTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    fun exportCsv(transactions: List<Transaction>, out: OutputStream) {
        // UTF-8 BOM，确保 Excel 正确识别中文
        out.write(byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte()))
        out.write("日期,类型,金额(元),账户ID,分类ID,备注\n".toByteArray(Charsets.UTF_8))
        transactions.forEach { t ->
            val line = listOf(
                isoTime.format(Date(t.date)),
                t.type.name,
                t.amount.centsToYuan().toPlainString(),
                t.accountId.toString(),
                (t.categoryId ?: "").toString(),
                t.note.replace("\n", " "),
            ).joinToString(",") { escape(it) } + "\n"
            out.write(line.toByteArray(Charsets.UTF_8))
        }
        out.flush()
    }

    private fun escape(field: String): String =
        if (field.contains(',') || field.contains('"') || field.contains('\n')) {
            "\"${field.replace("\"", "\"\"")}\""
        } else field
}
