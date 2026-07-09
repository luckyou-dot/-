package com.jiyibi.app.core.ml

import android.graphics.Bitmap
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.suspendCancellableCoroutine

/**
 * 小票/发票 OCR 识别器。
 *
 * 使用 ML Kit 中文文字识别，从拍摄图片中提取金额（优先匹配 ¥ 与数字）。
 */
@Singleton
class ReceiptOcr @Inject constructor() {

    private val recognizer by lazy {
        TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
    }

    data class Result(
        val rawText: String,
        val amounts: List<Long>,   // 识别到的金额，单位：分
    )

    suspend fun recognize(bitmap: Bitmap): Result = suspendCancellableCoroutine { cont ->
        val image = InputImage.fromBitmap(bitmap, 0)
        recognizer.process(image)
            .addOnSuccessListener { visionText ->
                val amounts = extractAmounts(visionText.text)
                cont.resume(Result(visionText.text, amounts))
            }
            .addOnFailureListener { cont.resumeWithException(it) }
    }

    /** 匹配形如 ¥12.34 / 12.34 元 / 总计 88.00 的金额。 */
    private fun extractAmounts(text: String): List<Long> {
        val regex = Regex("""(?:¥|￥|总计|合计|金额|total)?\s*\D?(\d+(?:\.\d{1,2})?)\s*(?:元| CNY)?""", RegexOption.IGNORE_CASE)
        return regex.findAll(text)
            .mapNotNull { it.groupValues.getOrNull(1)?.toDoubleOrNull() }
            .filter { it > 0 }
            .map { (it * 100).toLong() }
            .toList()
    }
}
