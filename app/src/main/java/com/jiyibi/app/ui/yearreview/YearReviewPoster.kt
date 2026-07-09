package com.jiyibi.app.ui.yearreview

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.jiyibi.app.core.designsystem.theme.ExpenseRed
import com.jiyibi.app.core.designsystem.theme.IncomeGreen
import com.jiyibi.app.core.designsystem.theme.BudgetAmber
import com.jiyibi.app.core.domain.model.centsToYuan
import kotlin.math.min

/**
 * 年度账单海报生成器：将 YearReviewData 绘制成一张竖版海报图片。
 *
 * 海报尺寸：1080 x 1920 (9:16 竖版，适配微信朋友圈)
 * 风格：渐变背景 + 毛玻璃卡片 + 数据可视化
 */
object YearReviewPoster {

    private const val POSTER_WIDTH = 1080
    private const val POSTER_HEIGHT = 1920

    fun generate(context: Context, data: YearReviewData): Bitmap {
        val bitmap = Bitmap.createBitmap(POSTER_WIDTH, POSTER_HEIGHT, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        drawBackground(canvas)
        drawHeader(canvas, data)
        drawKeyStats(canvas, data)
        drawMonthlyChart(canvas, data)
        drawExtremes(canvas, data)
        drawFooter(canvas, data)

        return bitmap
    }

    // ==================== 背景 ====================

    private fun drawBackground(canvas: Canvas) {
        val paint = Paint().apply {
            isAntiAlias = true
            style = Paint.Style.FILL
        }

        val colors = intArrayOf(
            Color(0xFF667EEA).toArgb(),
            Color(0xFF764BA2).toArgb(),
        )
        val gradient = android.graphics.LinearGradient(
            0f, 0f, 0f, POSTER_HEIGHT.toFloat(),
            colors, null, android.graphics.Shader.TileMode.CLAMP
        )
        paint.shader = gradient
        canvas.drawRect(0f, 0f, POSTER_WIDTH.toFloat(), POSTER_HEIGHT.toFloat(), paint)
        paint.shader = null

        val dotsPaint = Paint().apply {
            color = Color.White.copy(alpha = 0.06f).toArgb()
            isAntiAlias = true
        }
        for (i in 0..40) {
            val x = (i * 97) % POSTER_WIDTH.toFloat()
            val y = (i * 53 * 1.5f) % POSTER_HEIGHT.toFloat()
            canvas.drawCircle(x, y, 30f + (i % 5) * 20f, dotsPaint)
        }
    }

    // ==================== 头部 ====================

    private fun drawHeader(canvas: Canvas, data: YearReviewData) {
        val centerX = POSTER_WIDTH / 2f

        val trophyText = "\uD83C\uDFC6"
        val trophyPaint = Paint().apply {
            textSize = 120f
            isAntiAlias = true
        }
        val trophyY = 200f
        canvas.drawText(trophyText, centerX - trophyPaint.measureText(trophyText) / 2, trophyY, trophyPaint)

        val titleText = "${data.year} 年度账单"
        val titlePaint = Paint().apply {
            color = Color.White.toArgb()
            textSize = 72f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(titleText, centerX - titlePaint.measureText(titleText) / 2, trophyY + 120f, titlePaint)

        val subtitleText = "记账第 ${data.recordDays} 天 · 坚持就很了不起"
        val subtitlePaint = Paint().apply {
            color = Color.White.copy(alpha = 0.85f).toArgb()
            textSize = 36f
            isAntiAlias = true
        }
        canvas.drawText(subtitleText, centerX - subtitlePaint.measureText(subtitleText) / 2, trophyY + 180f, subtitlePaint)

        drawGlassCard(canvas, 80f, 430f, POSTER_WIDTH - 160f, 320f) { cardCanvas, cardLeft, cardTop, cardW, cardH ->
            val labelPaint = Paint().apply {
                color = Color.White.copy(alpha = 0.7f).toArgb()
                textSize = 32f
                isAntiAlias = true
            }
            val labelY = cardTop + 70f
            val label = "本年总支出"
            cardCanvas.drawText(label, cardLeft + cardW / 2 - labelPaint.measureText(label) / 2, labelY, labelPaint)

            val amountText = "¥${data.totalExpense.centsToYuan().toPlainString()}"
            val amountPaint = Paint().apply {
                color = Color.White.toArgb()
                textSize = 96f
                typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
                isAntiAlias = true
            }
            val amountY = labelY + 110f
            cardCanvas.drawText(amountText, cardLeft + cardW / 2 - amountPaint.measureText(amountText) / 2, amountY, amountPaint)

            if (data.lastYearExpense > 0L) {
                val change = (data.totalExpense.toFloat() / data.lastYearExpense.toFloat()) - 1f
                val sign = if (change >= 0f) "+" else ""
                val yoyText = "同比去年 $sign${(change * 100).toInt()}%"
                val yoyPaint = Paint().apply {
                    color = Color.White.copy(alpha = 0.8f).toArgb()
                    textSize = 30f
                    isAntiAlias = true
                }
                cardCanvas.drawText(yoyText, cardLeft + cardW / 2 - yoyPaint.measureText(yoyText) / 2, amountY + 60f, yoyPaint)
            }
        }
    }

    // ==================== 关键数据 4 宫格 ====================

    private fun drawKeyStats(canvas: Canvas, data: YearReviewData) {
        val cardTop = 800f
        val cardHeight = 380f
        val padding = 80f

        drawGlassCard(canvas, padding, cardTop, POSTER_WIDTH - padding * 2, cardHeight) { cardCanvas, cardLeft, cardTop, cardW, cardH ->
            val titlePaint = Paint().apply {
                color = Color.White.toArgb()
                textSize = 42f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            val title = "年度关键数据"
            cardCanvas.drawText(title, cardLeft + 40f, cardTop + 70f, titlePaint)

            val maxTxAmt = data.maxTransaction?.amount ?: 0L
            val topCatName = data.topCategory?.first ?: "—"
            val items = listOf(
                "最大单笔" to "¥${maxTxAmt.centsToYuan().toPlainString()}",
                "记账天数" to "${data.recordDays} 天",
                "日均支出" to "¥${data.dailyAvg.centsToYuan().toPlainString()}",
                "最高频分类" to topCatName,
            )

            val cellPadding = 30f
            val cellW = (cardW - cellPadding * 3) / 2
            val cellH = (cardH - 100f - cellPadding) / 2
            val startY = cardTop + 110f

            items.forEachIndexed { idx, (label, value) ->
                val row = idx / 2
                val col = idx % 2
                val cellLeft = cardLeft + col * (cellW + cellPadding)
                val cellTop = startY + row * (cellH + cellPadding)

                drawMiniGlassCard(cardCanvas, cellLeft, cellTop, cellW, cellH) { cc, cl, ct, cw, ch ->
                    val labelP = Paint().apply {
                        color = Color.White.copy(alpha = 0.6f).toArgb()
                        textSize = 28f
                        isAntiAlias = true
                    }
                    cc.drawText(label, cl + 24f, ct + 50f, labelP)

                    val valueP = Paint().apply {
                        color = Color.White.toArgb()
                        textSize = 44f
                        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                        isAntiAlias = true
                    }
                    val displayValue = if (value.length > 10) value.take(8) + "…" else value
                    cc.drawText(displayValue, cl + 24f, ct + 105f, valueP)
                }
            }
        }
    }

    // ==================== 月度柱状图 ====================

    private fun drawMonthlyChart(canvas: Canvas, data: YearReviewData) {
        val cardTop = 1230f
        val cardHeight = 460f
        val padding = 80f

        drawGlassCard(canvas, padding, cardTop, POSTER_WIDTH - padding * 2, cardHeight) { cardCanvas, cardLeft, cardTop, cardW, cardH ->
            val titlePaint = Paint().apply {
                color = Color.White.toArgb()
                textSize = 42f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            cardCanvas.drawText("月度支出", cardLeft + 40f, cardTop + 70f, titlePaint)

            val maxAmount = (data.monthlyExpenses.maxOfOrNull { it.second } ?: 0L).coerceAtLeast(1L)
            val peakMonthIdx = data.monthlyExpenses.maxByOrNull { it.second }?.first ?: 1
            val peakAmount = maxAmount

            val subtitlePaint = Paint().apply {
                color = Color.White.copy(alpha = 0.6f).toArgb()
                textSize = 28f
                isAntiAlias = true
            }
            val subtitle = "峰值：${peakMonthIdx}月 ¥${peakAmount.centsToYuan().toPlainString()}"
            cardCanvas.drawText(subtitle, cardLeft + cardW - 40f - subtitlePaint.measureText(subtitle), cardTop + 70f, subtitlePaint)

            val chartLeft = cardLeft + 40f
            val chartRight = cardLeft + cardW - 40f
            val chartTop = cardTop + 130f
            val chartBottom = cardTop + cardH - 80f
            val chartW = chartRight - chartLeft
            val chartH = chartBottom - chartTop

            val barCount = data.monthlyExpenses.size
            val gap = chartW * 0.025f
            val barW = (chartW - gap * (barCount - 1)) / barCount
            val maxBarH = chartH * 0.85f

            data.monthlyExpenses.forEachIndexed { i, (month, amount) ->
                val ratio = amount.toFloat() / maxAmount.toFloat()
                val barH = (ratio * maxBarH).coerceAtLeast(6f)
                val barLeft = chartLeft + i * (barW + gap)
                val barBottom = chartBottom
                val barTop = barBottom - barH
                val isPeak = month == peakMonthIdx && amount > 0L

                val barPaint = Paint().apply {
                    color = if (isPeak) ExpenseRed.toArgb() else Color.White.copy(alpha = 0.85f).toArgb()
                    isAntiAlias = true
                    style = Paint.Style.FILL
                }

                val rect = RectF(barLeft, barTop, barLeft + barW, barBottom)
                val radius = min(barW / 2, 16f)
                cardCanvas.drawRoundRect(rect, radius, radius, barPaint)

                val monthLabel = "$month"
                val labelPaint = Paint().apply {
                    color = Color.White.copy(alpha = 0.6f).toArgb()
                    textSize = 24f
                    isAntiAlias = true
                    textAlign = Paint.Align.CENTER
                }
                cardCanvas.drawText(monthLabel, barLeft + barW / 2, barBottom + 40f, labelPaint)
            }
        }
    }

    // ==================== 年度之最 ====================

    private fun drawExtremes(canvas: Canvas, data: YearReviewData) {
        val cardTop = 1740f
        val cardHeight = 360f
        val padding = 80f

        drawGlassCard(canvas, padding, cardTop, POSTER_WIDTH - padding * 2, cardHeight) { cardCanvas, cardLeft, cardTop, cardW, cardH ->
            val titlePaint = Paint().apply {
                color = Color.White.toArgb()
                textSize = 42f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            cardCanvas.drawText("年度之最", cardLeft + 40f, cardTop + 70f, titlePaint)

            val maxMonthText = data.maxMonth?.let { (m, amount) ->
                "${m}月 ¥${amount.centsToYuan().toPlainString()}"
            } ?: "—"
            val minMonthText = data.minMonth?.let { (m, amount) ->
                "${m}月 ¥${amount.centsToYuan().toPlainString()}"
            } ?: "—"
            val streakText = "${data.longestStreak} 天"
            val budgetText = if (data.budgetHitRate.second > 0) {
                "${data.budgetHitRate.first}/${data.budgetHitRate.second}月"
            } else {
                "未设置预算"
            }

            val rows = listOf(
                "最贵一月" to (maxMonthText to ExpenseRed),
                "最省一月" to (minMonthText to IncomeGreen),
                "最长连续记账" to (streakText to BudgetAmber),
                "预算达成率" to (budgetText to Color(0xFF667EEA)),
            )

            val rowHeight = (cardH - 100f) / rows.size
            val startY = cardTop + 110f

            rows.forEachIndexed { i, (label, pair) ->
                val (value, valueColor) = pair
                val rowY = startY + i * rowHeight + rowHeight / 2 + 10f

                val labelPaint = Paint().apply {
                    color = Color.White.copy(alpha = 0.7f).toArgb()
                    textSize = 32f
                    isAntiAlias = true
                }
                cardCanvas.drawText(label, cardLeft + 40f, rowY, labelPaint)

                val valuePaint = Paint().apply {
                    color = valueColor.toArgb()
                    textSize = 36f
                    typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                    isAntiAlias = true
                    textAlign = Paint.Align.RIGHT
                }
                cardCanvas.drawText(value, cardLeft + cardW - 40f, rowY, valuePaint)
            }
        }
    }

    // ==================== 底部水印 ====================

    private fun drawFooter(canvas: Canvas, data: YearReviewData) {
        val centerX = POSTER_WIDTH / 2f
        val footerY = 1840f

        val watermark = "来自「记一笔」· 用数据看见生活"
        val paint = Paint().apply {
            color = Color.White.copy(alpha = 0.5f).toArgb()
            textSize = 28f
            isAntiAlias = true
        }
        canvas.drawText(watermark, centerX - paint.measureText(watermark) / 2, footerY, paint)
    }

    // ==================== 毛玻璃卡片工具 ====================

    private inline fun drawGlassCard(
        canvas: Canvas,
        left: Float,
        top: Float,
        width: Float,
        height: Float,
        drawContent: (Canvas, Float, Float, Float, Float) -> Unit,
    ) {
        val rect = RectF(left, top, left + width, top + height)
        val radius = 40f

        val bgPaint = Paint().apply {
            color = Color.White.copy(alpha = 0.15f).toArgb()
            isAntiAlias = true
            style = Paint.Style.FILL
        }
        canvas.drawRoundRect(rect, radius, radius, bgPaint)

        val strokePaint = Paint().apply {
            color = Color.White.copy(alpha = 0.2f).toArgb()
            strokeWidth = 2f
            isAntiAlias = true
            style = Paint.Style.STROKE
        }
        canvas.drawRoundRect(rect, radius, radius, strokePaint)

        drawContent(canvas, left, top, width, height)
    }

    private inline fun drawMiniGlassCard(
        canvas: Canvas,
        left: Float,
        top: Float,
        width: Float,
        height: Float,
        drawContent: (Canvas, Float, Float, Float, Float) -> Unit,
    ) {
        val rect = RectF(left, top, left + width, top + height)
        val radius = 24f

        val bgPaint = Paint().apply {
            color = Color.White.copy(alpha = 0.12f).toArgb()
            isAntiAlias = true
            style = Paint.Style.FILL
        }
        canvas.drawRoundRect(rect, radius, radius, bgPaint)

        drawContent(canvas, left, top, width, height)
    }
}
