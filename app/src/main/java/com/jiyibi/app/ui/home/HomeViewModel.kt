package com.jiyibi.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.Calendar
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** 一天的毫秒数，用于按日聚合与单日范围查询 */
private const val MILLIS_PER_DAY = 86_400_000L

/**
 * 当月日历热力图单元格。
 *
 * @property day    当月几号（1~31）
 * @property date   当天 0 点 epoch millis（点击时作为查询区间的起点）
 * @property amount 当天支出总额（分）
 * @property level  颜色深浅档位，0~4：0 无支出，1~4 由低到高
 */
data class HeatmapCell(
    val day: Int,
    val date: Long,
    val amount: Long,
    val level: Int,
)

/**
 * 最近交易列表项：在 [Transaction] 基础上关联账户名与分类，供 UI 直接渲染。
 *
 * @property tx          原始交易
 * @property accountName 交易来源账户名称（找不到时为 "未知账户"）
 * @property category    关联分类（可能为 null：旧数据或分类被删除）
 */
data class RecentTransactionItem(
    val tx: Transaction,
    val accountName: String,
    val category: Category?,
)

/**
 * 首页 UI 状态。
 *
 * @property todayExpense       选定日期范围支出（分）；保留原字段名但语义已改为「选定范围支出」
 * @property monthExpense      本月支出（分），始终基于本月
 * @property monthIncome       本月收入（分），始终基于本月
 * @property monthBudget       月度预算额度（分），0 表示未设置
 * @property recent            最近交易列表（最多 5 条，已按搜索关键词内存过滤）
 * @property searchKeyword     当前内嵌搜索关键词
 * @property selectedDateRange 当前选定的日期范围 [start, end)
 * @property monthHeatmap      当月日历热力图单元格列表
 * @property selectedHeatmapDay 当前选中的热力图天（0 点 timestamp），null 表示未选中
 * @property dayTransactions    选中日的交易明细（点击单元格后填充）
 * @property isLoading         是否加载中
 */
data class HomeUiState(
    val todayExpense: Long = 0,
    val monthExpense: Long = 0,
    val monthIncome: Long = 0,
    val monthBudget: Long = 0,
    val recent: List<RecentTransactionItem> = emptyList(),
    val searchKeyword: String = "",
    val selectedDateRange: Pair<Long, Long> = TimeRange.today(),
    val monthHeatmap: List<HeatmapCell> = emptyList(),
    val selectedHeatmapDay: Long? = null,
    val dayTransactions: List<Transaction> = emptyList(),
    val isLoading: Boolean = false,
)

/**
 * 选定日期范围的衍生数据：聚合 range / 范围内支出 / 最近交易列表。
 *
 * 把这 3 个值合并为一个 Flow 源，避免外层 combine 超过 5 个 typed 参数上限。
 *
 * 注意：recent 始终使用 observeRecent(5)，与 selectedDateRange 解耦，
 *       保证"最近交易"始终显示最新 5 笔，不受日期 Pill 切换影响。
 */
private data class RangeData(
    val range: Pair<Long, Long>,
    val expense: Long,
    val recent: List<RecentTransactionItem>,
)

/**
 * 热力图相关数据：单元格列表 + 当前选中的天 + 当日交易列表。
 *
 * 与 RangeData 同理，合并为单个 Flow 源以接入外层 combine。
 */
private data class HeatmapData(
    val cells: List<HeatmapCell>,
    val selectedDay: Long?,
    val dayTransactions: List<Transaction>,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val budgetRepository: BudgetRepository,
    private val accountRepository: AccountRepository,
    private val categoryRepository: CategoryRepository,
) : ViewModel() {

    /** 当前选定的日期范围 [start, end)，默认今日 */
    private val selectedDateRange: MutableStateFlow<Pair<Long, Long>> =
        MutableStateFlow(TimeRange.today())

    /** 内嵌搜索关键词，空串表示不过滤 */
    private val searchKeyword: MutableStateFlow<String> = MutableStateFlow("")

    /** 本月范围（始终固定为 TimeRange.thisMonth()，与用户选择的日期 Pill 无关） */
    private val month = TimeRange.thisMonth()

    /** 本月收支合并数据：expense to income，避免外层 combine 超过 5 个 typed 参数上限 */
    private val monthData: StateFlow<Pair<Long, Long>> = combine(
        transactionRepository.observeTotalExpense(month.first, month.second),
        transactionRepository.observeTotalIncome(month.first, month.second),
    ) { expense, income -> expense to income }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = 0L to 0L,
        )

    /** 当前选中的热力图单元格对应的天（0 点 epoch millis），null 表示未选中 */
    private val selectedHeatmapDay: MutableStateFlow<Long?> = MutableStateFlow(null)

    /** 选定日期范围聚合数据：range + 范围支出 + 最近交易列表（已关联账户名与分类）
     *  recent 始终用 observeRecent(5)，与 selectedDateRange 解耦。 */
    private val rangeData: StateFlow<RangeData> = selectedDateRange
        .flatMapLatest { range ->
            val (start, end) = range
            combine(
                transactionRepository.observeTotalExpense(start, end),
                transactionRepository.observeRecent(5),
                accountRepository.observeAll(),
                categoryRepository.observeAll(),
            ) { expense, recent, accounts, categories ->
                val accountMap = accounts.associateBy { it.id }
                val categoryMap = categories.associateBy { it.id }
                val items = recent.map { tx ->
                    RecentTransactionItem(
                        tx = tx,
                        accountName = accountMap[tx.accountId]?.name ?: "未知账户",
                        category = tx.categoryId?.let { categoryMap[it] },
                    )
                }
                RangeData(range = range, expense = expense, recent = items)
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = RangeData(
                range = selectedDateRange.value,
                expense = 0L,
                recent = emptyList(),
            ),
        )

    /**
     * 当月日历热力图：按日聚合 EXPENSE 类型交易，并按强度划分 5 档（0~4）。
     * 始终基于 TimeRange.thisMonth()，与日期 Pill 选择无关。
     */
    val monthHeatmap: StateFlow<List<HeatmapCell>> = flowOf(TimeRange.thisMonth())
        .flatMapLatest { (start, end) ->
            transactionRepository.observeRange(start, end).map { txs ->
                // 按日聚合：以「当天 0 点 timestamp」为 key（与下方循环中 dayStart 一致，避免时区错位）
                val cal = Calendar.getInstance()
                val byDay = txs.groupBy { tx ->
                    cal.timeInMillis = tx.date
                    cal.set(Calendar.HOUR_OF_DAY, 0)
                    cal.set(Calendar.MINUTE, 0)
                    cal.set(Calendar.SECOND, 0)
                    cal.set(Calendar.MILLISECOND, 0)
                    cal.timeInMillis
                }.mapValues { (_, list) ->
                    list.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
                }
                val maxAmount = byDay.values.maxOrNull() ?: 1L
                val cells = mutableListOf<HeatmapCell>()
                cal.timeInMillis = start
                // end 为下月初 0 点（exclusive），用 < 避免把下月 1 号也画进当月热力图
                while (cal.timeInMillis < end) {
                    val day = cal.get(Calendar.DAY_OF_MONTH)
                    val dayStart = cal.timeInMillis
                    val amount = byDay[dayStart] ?: 0L
                    val level = when {
                        amount == 0L -> 0
                        amount < maxAmount * 0.25 -> 1
                        amount < maxAmount * 0.5 -> 2
                        amount < maxAmount * 0.75 -> 3
                        else -> 4
                    }
                    cells.add(HeatmapCell(day, dayStart, amount, level))
                    cal.add(Calendar.DAY_OF_MONTH, 1)
                }
                cells
            }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    /**
     * 选中日的交易明细：监听 [dayStart, dayStart+1day) 区间。
     * selectedHeatmapDay 为 null 时返回空列表。
     */
    val dayTransactions: StateFlow<List<Transaction>> = selectedHeatmapDay
        .flatMapLatest { dayStart ->
            if (dayStart == null) {
                flowOf(emptyList())
            } else {
                transactionRepository.observeRange(dayStart, dayStart + MILLIS_PER_DAY)
            }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    /** 热力图整体数据：合并 cells / selectedDay / dayTransactions，避免外层 combine 超 5 参 */
    private val heatmapData: StateFlow<HeatmapData> = combine(
        monthHeatmap,
        selectedHeatmapDay,
        dayTransactions,
    ) { cells, selectedDay, dayTxs ->
        HeatmapData(cells, selectedDay, dayTxs)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = HeatmapData(emptyList(), null, emptyList()),
    )

    val uiState: StateFlow<HomeUiState> = combine(
        rangeData,
        monthData,
        searchKeyword,
        budgetRepository.observeActive(System.currentTimeMillis()),
        heatmapData,
    ) { rangeData, monthPair, keyword, budgets, heatmap ->
        val (monthExpense, monthIncome) = monthPair
        // categoryId == null 表示月度总预算
        val monthBudget = budgets.firstOrNull { it.categoryId == null }?.amountLimit ?: 0L
        // 关键词非空时对 recent 内存过滤：匹配备注与标签（Transaction 模型无分类名字段，故用 tags 兜底）
        val filteredRecent = if (keyword.isBlank()) {
            rangeData.recent.take(5)
        } else {
            rangeData.recent
                .filter { item ->
                    item.tx.note.contains(keyword, ignoreCase = true) ||
                        item.tx.tags.any { it.contains(keyword, ignoreCase = true) }
                }
                .take(5)
        }
        HomeUiState(
            todayExpense = rangeData.expense,
            monthExpense = monthExpense,
            monthIncome = monthIncome,
            monthBudget = monthBudget,
            recent = filteredRecent,
            searchKeyword = keyword,
            selectedDateRange = rangeData.range,
            monthHeatmap = heatmap.cells,
            selectedHeatmapDay = heatmap.selectedDay,
            dayTransactions = heatmap.dayTransactions,
            isLoading = false,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = HomeUiState(isLoading = true),
    )

    /** 删除一笔交易 */
    fun delete(id: Long) {
        viewModelScope.launch {
            transactionRepository.delete(id)
        }
    }

    /** 刷新（StateFlow 自动响应上游；保留供调用约定） */
    fun refresh() = Unit

    /** 设置日期范围 [start, end) */
    fun setDateRange(range: Pair<Long, Long>) {
        selectedDateRange.value = range
    }

    /** 设置内嵌搜索关键词；空串表示清除过滤 */
    fun setSearchKeyword(kw: String) {
        searchKeyword.value = kw
    }

    /** 选中热力图某天（0 点 timestamp）；传 null 关闭弹窗 */
    fun selectHeatmapDay(dayStart: Long?) {
        selectedHeatmapDay.value = dayStart
    }
}
