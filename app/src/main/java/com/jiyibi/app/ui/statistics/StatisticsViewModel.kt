package com.jiyibi.app.ui.statistics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.CategoryStat
import com.jiyibi.app.core.domain.model.StatPeriod
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.model.TrendPoint
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.Calendar
import java.util.TimeZone
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

/** 统计页 UI 状态 */
data class StatisticsUiState(
    val period: StatPeriod = StatPeriod.MONTHLY,
    val totalExpense: Long = 0L,
    val totalIncome: Long = 0L,
    val categoryStats: List<CategoryStat> = emptyList(),
    val trend: List<TrendPoint> = emptyList(),
    /** 环比变化（当前周期 expense / 上一周期 expense - 1），仅月档有值 */
    val momChange: Float? = null,
    /** 同比变化（当前周期 expense / 去年同期 expense - 1），仅月档有值 */
    val yoyChange: Float? = null,
    /** 各账户消费占比（按金额降序） */
    val accountStats: List<AccountStat> = emptyList(),
)

/** 账户消费统计项：账户 + 消费金额 + 占比 */
data class AccountStat(
    val account: Account,
    val amount: Long,
    val percentage: Float,
)

/** 四元组，用于在嵌套 combine 中打包 expense/income/stats/trend */
private data class Quad<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D,
)

@HiltViewModel
class StatisticsViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
) : ViewModel() {

    // 当前选中的统计周期，默认 MONTHLY
    private val currentPeriod = MutableStateFlow(StatPeriod.MONTHLY)
    // 当前展开的分类 id（用于下钻展示该分类下的交易明细）
    private val selectedCategoryId = MutableStateFlow<Long?>(null)

    /** 设置/取消选中分类（点击同一分类再次点击将取消） */
    fun toggleCategory(categoryId: Long) {
        selectedCategoryId.value =
            if (selectedCategoryId.value == categoryId) null else categoryId
    }

    /** 当前选中分类下的交易明细（按时间倒序） */
    @OptIn(ExperimentalCoroutinesApi::class)
    val selectedCategoryTransactions: StateFlow<List<Transaction>> =
        combine(currentPeriod, selectedCategoryId) { period, categoryId ->
            period to categoryId
        }.flatMapLatest { (period, categoryId) ->
            if (categoryId == null) {
                flowOf(emptyList())
            } else {
                val (start, end) = timeRangeFor(period)
                transactionRepository.observeRange(start, end)
                    .map { txs ->
                        txs.filter { it.categoryId == categoryId }
                            .sortedByDescending { it.date }
                    }
            }
        }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /** 各账户消费占比：随周期切换，按金额降序 */
    @OptIn(ExperimentalCoroutinesApi::class)
    val accountStats: StateFlow<List<AccountStat>> = currentPeriod
        .flatMapLatest { period ->
            val (start, end) = timeRangeFor(period)
            combine(
                transactionRepository.observeRange(start, end),
                accountRepository.observeAll(),
            ) { txs, accounts ->
                val byAccount = txs.filter { it.type == TransactionType.EXPENSE }
                    .groupBy { it.accountId }
                    .mapValues { (_, list) -> list.sumOf { it.amount } }
                val total = byAccount.values.sum().coerceAtLeast(1L)
                accounts.mapNotNull { acc ->
                    val amount = byAccount[acc.id] ?: 0L
                    if (amount > 0L) AccountStat(acc, amount, amount.toFloat() / total) else null
                }.sortedByDescending { it.amount }
            }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<StatisticsUiState> = currentPeriod
        .flatMapLatest { period ->
            // 当前周期时间范围
            val (start, end) = timeRangeFor(period)
            val periodMs = periodMillis(period)

            // 当前周期数据流
            val currentExpenseFlow = transactionRepository.observeTotalExpense(start, end)
            val currentIncomeFlow = transactionRepository.observeTotalIncome(start, end)
            val categoryStatsFlow = transactionRepository.observeCategoryStats(start, end)
            val trendFlow = transactionRepository.observeTrend(start, end, periodMs)

            // 同比 / 环比（仅月档计算，其他档返回 0L 占位，UI 显示「—」）
            val isMonthly = period == StatPeriod.MONTHLY
            val prevRange = if (isMonthly) previousMonthRange() else null
            val yoyRange = if (isMonthly) sameMonthLastYearRange() else null
            val prevExpenseFlow: Flow<Long> =
                if (prevRange != null) transactionRepository.observeTotalExpense(prevRange.first, prevRange.second)
                else flowOf(0L)
            val yoyExpenseFlow: Flow<Long> =
                if (yoyRange != null) transactionRepository.observeTotalExpense(yoyRange.first, yoyRange.second)
                else flowOf(0L)

            // 在 uiState combine 中追加 accountStats：嵌套 combine 解决多流不同类型问题
            combine(
                combine(currentExpenseFlow, currentIncomeFlow, categoryStatsFlow, trendFlow) { expense, income, stats, trend ->
                    Quad(expense, income, stats, trend)
                },
                combine(prevExpenseFlow, yoyExpenseFlow) { prev, yoy -> prev to yoy },
                accountStats,
            ) { (expense, income, stats, trend), (prevExpense, yoyExpense), accStats ->
                StatisticsUiState(
                    period = period,
                    totalExpense = expense,
                    totalIncome = income,
                    categoryStats = stats,
                    trend = trend,
                    momChange = if (isMonthly && prevExpense > 0L)
                        (expense.toFloat() / prevExpense.toFloat()) - 1f else null,
                    yoyChange = if (isMonthly && yoyExpense > 0L)
                        (expense.toFloat() / yoyExpense.toFloat()) - 1f else null,
                    accountStats = accStats,
                )
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = StatisticsUiState(),
        )

    /** 切换统计周期 */
    fun setPeriod(period: StatPeriod) {
        currentPeriod.value = period
    }

    /** 当前周期对应的时间范围 [start, end) */
    private fun timeRangeFor(period: StatPeriod): Pair<Long, Long> = when (period) {
        StatPeriod.DAILY -> TimeRange.today()
        StatPeriod.WEEKLY -> TimeRange.thisWeek()
        StatPeriod.MONTHLY -> TimeRange.thisMonth()
        StatPeriod.YEARLY -> TimeRange.thisYear()
    }

    /** 趋势采样粒度（毫秒），用于 observeTrend
     *  日档：按小时采样（4 小时一段，避免单点）
     *  周/月档：按日采样，得到每日支出曲线
     *  年档：按月采样
     */
    private fun periodMillis(period: StatPeriod): Long = when (period) {
        StatPeriod.DAILY -> 86_400_000L
        StatPeriod.WEEKLY -> 86_400_000L
        StatPeriod.MONTHLY -> 86_400_000L
        StatPeriod.YEARLY -> 86_400_000L * 30
    }

    /** 上一个月的 [start, end)，用于环比 */
    private fun previousMonthRange(): Pair<Long, Long> {
        val (start, _) = TimeRange.thisMonth()
        val cal = Calendar.getInstance(TimeZone.getDefault()).apply {
            timeInMillis = start
            add(Calendar.MONTH, -1)
        }
        // 上月起点 → 本月起点
        return cal.timeInMillis to start
    }

    /** 去年同月的 [start, end)，用于同比 */
    private fun sameMonthLastYearRange(): Pair<Long, Long> {
        val (start, end) = TimeRange.thisMonth()
        val calStart = Calendar.getInstance(TimeZone.getDefault()).apply {
            timeInMillis = start
            add(Calendar.YEAR, -1)
        }
        val calEnd = Calendar.getInstance(TimeZone.getDefault()).apply {
            timeInMillis = end
            add(Calendar.YEAR, -1)
        }
        return calStart.timeInMillis to calEnd.timeInMillis
    }
}
