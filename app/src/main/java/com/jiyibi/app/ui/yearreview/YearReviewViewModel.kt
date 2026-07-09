package com.jiyibi.app.ui.yearreview

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.Calendar
import java.util.TimeZone
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn

/** 年度回顾数据聚合体。所有金额单位均为「分」。 */
data class YearReviewData(
    val year: Int,
    /** 本年总支出（分） */
    val totalExpense: Long,
    /** 去年同期总支出，用于同比计算；为 0 表示无去年数据 */
    val lastYearExpense: Long,
    /** 本年最大单笔支出（仅支出） */
    val maxTransaction: Transaction?,
    /** 本年记账天数（有交易的不同日期数） */
    val recordDays: Int,
    /** 日均支出（分），按本年总支出 / 365 估算 */
    val dailyAvg: Long,
    /** 最高频分类（分类名, 笔数） */
    val topCategory: Pair<String, Int>?,
    /** 月度支出列表 [(月, 金额)]，固定 12 项，月份从 1~12 */
    val monthlyExpenses: List<Pair<Int, Long>>,
    /** 最贵一月 (月, 金额) */
    val maxMonth: Pair<Int, Long>?,
    /** 最省一月 (月, 金额)，仅统计有支出的月份 */
    val minMonth: Pair<Int, Long>?,
    /** 最长连续记账天数 */
    val longestStreak: Int,
    /** 预算达成率 (达成月数, 总月数)；无预算时总月数为 0 */
    val budgetHitRate: Pair<Int, Int>,
)

@HiltViewModel
class YearReviewViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val categoryRepository: CategoryRepository,
    private val budgetRepository: BudgetRepository,
) : ViewModel() {

    /** 年度回顾数据流：当年交易 + 去年同期 + 分类 + 预算聚合。 */
    @OptIn(ExperimentalCoroutinesApi::class)
    val yearData: StateFlow<YearReviewData?> = flowOf(Unit).flatMapLatest {
        val cal = Calendar.getInstance(TimeZone.getDefault())
        val year = cal.get(Calendar.YEAR)
        val (yearStart, yearEnd) = TimeRange.thisYear()

        // 当年交易
        val txs = transactionRepository.observeRange(yearStart, yearEnd).first()
        // 去年同期交易（仅用于同期总支出，简化获取）
        val lastYearTxs = runCatching {
            val (lysStart, lysEnd) = shiftYear(yearStart, yearEnd, -1)
            transactionRepository.observeRange(lysStart, lysEnd).first()
        }.getOrDefault(emptyList())

        // 仅统计支出
        val expenses = txs.filter { it.type == TransactionType.EXPENSE }
        val totalExpense = expenses.sumOf { it.amount }
        val lastYearExpense = lastYearTxs
            .filter { it.type == TransactionType.EXPENSE }
            .sumOf { it.amount }

        // 最大单笔
        val maxTransaction = expenses.maxByOrNull { it.amount }

        // 记账天数：按「日」去重（用 Calendar 提取年月日）
        val daySet = txs.map { it.date.toLocalDayKey() }.toSet()
        val recordDays = daySet.size

        // 日均支出（按 365 天估算，避免闰年差异）
        val dailyAvg = totalExpense / 365L

        // 最高频分类（按笔数）
        val categories = categoryRepository.observeAll().first()
        val topCategory = expenses
            .filter { it.categoryId != null }
            .groupingBy { it.categoryId }
            .eachCount()
            .maxByOrNull { it.value }
            ?.let { (catId, count) ->
                val cat = categories.firstOrNull { it.id == catId }
                (cat?.name ?: "未分类") to count
            }

        // 月度支出：固定 12 项
        val monthlyExpenses = (1..12).map { m ->
            val monthSum = expenses
                .filter { it.date.toCalendarMonth() == m }
                .sumOf { it.amount }
            m to monthSum
        }
        val maxMonth = monthlyExpenses.maxByOrNull { it.second }
        val minMonth = monthlyExpenses
            .filter { it.second > 0L }
            .minByOrNull { it.second }

        // 最长连续记账天数
        val longestStreak = calcLongestStreak(daySet)

        // 预算达成率：取当前生效的「总预算」（categoryId == null），逐月比较
        val nowMs = System.currentTimeMillis()
        val budgets = budgetRepository.observeActive(nowMs).first()
        val totalBudget = budgets.firstOrNull { it.categoryId == null }
        val (hit, total) = if (totalBudget != null) {
            val hitCount = monthlyExpenses.count { (_, amount) ->
                amount <= totalBudget.amountLimit
            }
            hitCount to 12
        } else {
            0 to 0
        }

        flowOf<YearReviewData?>(
            YearReviewData(
                year = year,
                totalExpense = totalExpense,
                lastYearExpense = lastYearExpense,
                maxTransaction = maxTransaction,
                recordDays = recordDays,
                dailyAvg = dailyAvg,
                topCategory = topCategory,
                monthlyExpenses = monthlyExpenses,
                maxMonth = maxMonth,
                minMonth = minMonth,
                longestStreak = longestStreak,
                budgetHitRate = hit to total,
            )
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Lazily,
        initialValue = null,
    )

    /** 把 [start, end) 整体平移 deltaYears 年，返回新范围。 */
    private fun shiftYear(start: Long, end: Long, deltaYears: Int): Pair<Long, Long> {
        val s = Calendar.getInstance(TimeZone.getDefault()).apply {
            timeInMillis = start
            add(Calendar.YEAR, deltaYears)
        }
        val e = Calendar.getInstance(TimeZone.getDefault()).apply {
            timeInMillis = end
            add(Calendar.YEAR, deltaYears)
        }
        return s.timeInMillis to e.timeInMillis
    }

    /** 把毫秒时间戳转为「年月日」整数 key，方便去重统计记账天数。 */
    private fun Long.toLocalDayKey(): Int {
        val c = Calendar.getInstance(TimeZone.getDefault()).apply { timeInMillis = this@toLocalDayKey }
        return c.get(Calendar.YEAR) * 10_000 +
            (c.get(Calendar.MONTH) + 1) * 100 +
            c.get(Calendar.DAY_OF_MONTH)
    }

    /** 把毫秒时间戳转为月份（1~12）。 */
    private fun Long.toCalendarMonth(): Int {
        val c = Calendar.getInstance(TimeZone.getDefault()).apply { timeInMillis = this@toCalendarMonth }
        return c.get(Calendar.MONTH) + 1
    }

    /** 计算最长连续记账天数：对日期 key 升序后逐日+1 累计。 */
    private fun calcLongestStreak(dayKeys: Set<Int>): Int {
        if (dayKeys.isEmpty()) return 0
        // 转 epoch day（按天递增 1）方便处理跨月/跨年
        val epochDays = dayKeys.map { key ->
            val c = Calendar.getInstance(TimeZone.getDefault()).apply {
                clear()
                set(key / 10_000, (key % 10_000) / 100 - 1, key % 100)
            }
            c.timeInMillis / 86_400_000L
        }.sorted()
        var max = 1
        var cur = 1
        for (i in 1 until epochDays.size) {
            if (epochDays[i] == epochDays[i - 1] + 1) {
                cur += 1
                if (cur > max) max = cur
            } else if (epochDays[i] != epochDays[i - 1]) {
                cur = 1
            }
        }
        return max
    }
}
