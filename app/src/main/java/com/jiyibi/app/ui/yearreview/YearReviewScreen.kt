package com.jiyibi.app.ui.yearreview

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.AnimatedNumber
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.GlassCard
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.theme.BudgetAmber
import com.jiyibi.app.core.designsystem.theme.ExpenseRed
import com.jiyibi.app.core.designsystem.theme.IncomeGreen
import com.jiyibi.app.core.designsystem.theme.gradientBrush
import com.jiyibi.app.core.domain.model.centsToYuan

/**
 * 年度回顾视图：5 块卡片 — 头图 / 关键数据 / 月度柱状图 / 年度之最 / 分享按钮。
 *
 * 内部使用 Column + forEach 渲染（不嵌套 LazyColumn），可被外层 LazyColumn 通过 item {} 复用。
 * 本页无独立 Scaffold（内嵌在 StatisticsScreen 年档 LazyColumn 的 item {} 中），保持。
 */
@Composable
fun YearReviewScreen(
    viewModel: YearReviewViewModel = hiltViewModel(),
) {
    val data by viewModel.yearData.collectAsStateWithLifecycle()
    val review = data
    if (review == null) {
        // 数据未加载完成：占位（避免空白闪烁）
        Box(Modifier.fillMaxWidth().padding(Spacing.xxl), contentAlignment = Alignment.Center) {
            Text(
                "年度账单加载中…",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        return
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.m),
    ) {
        // 1. 年度账单头图（渐变 Hero）
        YearHeaderCard(review, index = 0)

        // 2. 年度关键数据 4 宫格
        YearKeyStatsCard(review, index = 1)

        // 3. 月度柱状图
        MonthlyBarChartCard(review, index = 2)

        // 4. 年度之最列表
        YearExtremesCard(review, index = 3)

        // 5. 分享按钮
        ShareButton(data = review, index = 4)
    }
}

// ==================== 1. 头图（渐变 Hero） ====================

@Composable
private fun YearHeaderCard(data: YearReviewData, index: Int) {
    // 顶部渐变 Hero：Box + 主题渐变背景 + 大圆角，数字用 AnimatedNumber 等宽白色
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index)
            .clip(RoundedCornerShape(Corner.large))
            .background(gradientBrush()),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(Spacing.xl),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(Spacing.s),
        ) {
            Text("🏆", fontSize = 40.sp)
            Text(
                "${data.year} 年度账单",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Color.White,
            )
            Text(
                "记账第 ${data.recordDays} 天 · 坚持就很了不起",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White,
            )
            Spacer(Modifier.height(Spacing.xs))
            Text(
                "本年总支出",
                style = MaterialTheme.typography.labelMedium,
                color = Color.White,
            )
            // 总支出：AnimatedNumber 平滑过渡，等宽字体 + 白色保证数字稳定可读
            AnimatedNumber(
                targetValue = data.totalExpense.centsToYuan().toDouble(),
                prefix = "¥",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                ),
                color = Color.White,
            )
            // 同比：去年同期有数据才显示
            if (data.lastYearExpense > 0L) {
                val change = (data.totalExpense.toFloat() / data.lastYearExpense.toFloat()) - 1f
                val sign = if (change >= 0f) "+" else ""
                val text = "同比去年 ${sign}${(change * 100).toInt()}%"
                Text(
                    text,
                    style = MaterialTheme.typography.labelMedium,
                    color = Color.White,
                )
            }
        }
    }
}

// ==================== 2. 关键数据 4 宫格 ====================

@Composable
private fun YearKeyStatsCard(data: YearReviewData, index: Int) {
    UnifiedCard(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index),
        variant = UnifiedCardVariant.ELEVATED,
    ) {
        Text("年度关键数据", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(Spacing.m))
        // 2x2 网格：用两行 Row + weight 实现
        val maxTxAmt = data.maxTransaction?.amount ?: 0L
        val topCatName = data.topCategory?.first ?: "—"
        val items = listOf(
            "最大单笔" to "¥${maxTxAmt.centsToYuan().toPlainString()}",
            "记账天数" to "${data.recordDays} 天",
            "日均支出" to "¥${data.dailyAvg.centsToYuan().toPlainString()}",
            "最高频分类" to topCatName,
        )
        items.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                row.forEach { (label, value) ->
                    KeyStatCell(label = label, value = value, modifier = Modifier.weight(1f))
                }
                // 奇数项补齐占位（4 项分两行时无需补，但保险起见）
                if (row.size == 1) {
                    Spacer(Modifier.weight(1f))
                }
            }
            Spacer(Modifier.height(Spacing.m))
        }
    }
}

@Composable
private fun KeyStatCell(label: String, value: String, modifier: Modifier = Modifier) {
    // 单格使用毛玻璃卡 GlassCard：半透明 + 模糊（API 31+），低版本/深色模式降级描边
    GlassCard(
        modifier = modifier,
        cornerRadius = Corner.medium,
        contentPadding = PaddingValues(Spacing.m),
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(Spacing.xs))
        Text(
            value,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface,
        )
    }
}

// ==================== 3. 月度柱状图 ====================

@Composable
private fun MonthlyBarChartCard(data: YearReviewData, index: Int) {
    val maxAmount = (data.monthlyExpenses.maxOfOrNull { it.second } ?: 0L)
        .coerceAtLeast(1L)
    val peakMonthIdx = data.monthlyExpenses
        .maxByOrNull { it.second }?.first ?: 1

    UnifiedCard(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index),
        variant = UnifiedCardVariant.ELEVATED,
    ) {
        Text("月度支出", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(Spacing.xs))
        Text(
            "峰值：${peakMonthIdx} 月 ¥${maxAmount.centsToYuan().toPlainString()}",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(Spacing.l))

        // 12 根柱：Row + Box(weight=1f, height 按比例)
        // 上半：柱条 —— 非峰值用主题色 primary，峰值用 ExpenseRed，移除硬编码
        Row(
            modifier = Modifier.fillMaxWidth().height(140.dp),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            verticalAlignment = Alignment.Bottom,
        ) {
            data.monthlyExpenses.forEach { (month, amount) ->
                val ratio = amount.toFloat() / maxAmount.toFloat()
                val barHeight = (ratio * 130f).coerceAtLeast(2f) // 最少 2dp 显示
                val isPeak = month == peakMonthIdx && amount > 0L
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(barHeight.dp)
                        .clip(RoundedCornerShape(topStart = Corner.small, topEnd = Corner.small))
                        .background(if (isPeak) ExpenseRed else MaterialTheme.colorScheme.primary),
                )
            }
        }
        Spacer(Modifier.height(Spacing.xs))
        // 下半：月份标签
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            data.monthlyExpenses.forEach { (month, _) ->
                Text(
                    "${month}",
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

// ==================== 4. 年度之最列表 ====================

@Composable
private fun YearExtremesCard(data: YearReviewData, index: Int) {
    UnifiedCard(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index),
        variant = UnifiedCardVariant.ELEVATED,
    ) {
        Text("年度之最", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(Spacing.s))

        val maxMonthText = data.maxMonth?.let { (m, amount) ->
            "${m} 月 ¥${amount.centsToYuan().toPlainString()}"
        } ?: "—"
        val minMonthText = data.minMonth?.let { (m, amount) ->
            "${m} 月 ¥${amount.centsToYuan().toPlainString()}"
        } ?: "—"
        val streakText = "${data.longestStreak} 天"
        val budgetText = if (data.budgetHitRate.second > 0) {
            "${data.budgetHitRate.first}/${data.budgetHitRate.second} 月"
        } else {
            "未设置预算"
        }

        ExtremeRow("最贵一月", maxMonthText, ExpenseRed)
        ExtremeRow("最省一月", minMonthText, IncomeGreen)
        ExtremeRow("最长连续记账", streakText, BudgetAmber)
        ExtremeRow("预算达成率", budgetText, MaterialTheme.colorScheme.primary)
    }
}

@Composable
private fun ExtremeRow(label: String, value: String, valueColor: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            value,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Medium,
            color = valueColor,
        )
    }
}

// ==================== 5. 分享按钮 ====================

@Composable
private fun ShareButton(data: YearReviewData, index: Int) {
    val context = LocalContext.current
    Button(
        onClick = {
            YearReviewShareHelper.sharePoster(context, data)
        },
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index),
    ) {
        Text("📤 分享我的年度账单")
    }
}
