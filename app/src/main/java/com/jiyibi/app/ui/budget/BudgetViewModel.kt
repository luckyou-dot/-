package com.jiyibi.app.ui.budget

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.domain.model.Budget
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

/** 单个分类预算项，含已用金额与进度（used/amountLimit）。 */
data class CategoryBudgetItem(
    val budget: Budget,
    val category: Category?,
    val used: Long,
    val progress: Float,
)

/** 预算页 UI 状态。 */
data class BudgetUiState(
    val totalBudget: Budget? = null,
    val totalUsed: Long = 0L,
    val categoryBudgets: List<CategoryBudgetItem> = emptyList(),
    val categories: List<Category> = emptyList(),
)

@HiltViewModel
class BudgetViewModel @Inject constructor(
    private val budgetRepository: BudgetRepository,
    private val transactionRepository: TransactionRepository,
    private val categoryRepository: CategoryRepository,
) : ViewModel() {

    private val month = TimeRange.thisMonth()

    val uiState: StateFlow<BudgetUiState> = combine(
        budgetRepository.observeActive(System.currentTimeMillis()),
        transactionRepository.observeTotalExpense(month.first, month.second),
        transactionRepository.observeCategoryStats(month.first, month.second),
        categoryRepository.observeAll(),
    ) { budgets, totalExpense, categoryStats, categories ->
        // categoryId == null 表示月度总预算
        val totalBudget = budgets.firstOrNull { it.categoryId == null }
        val categoryBudgets = budgets
            .filter { it.categoryId != null }
            .map { budget ->
                val category = categories.firstOrNull { it.id == budget.categoryId }
                val used = categoryStats
                    .firstOrNull { it.categoryId == budget.categoryId }
                    ?.total ?: 0L
                val progress = if (budget.amountLimit > 0) {
                    (used.toFloat() / budget.amountLimit).coerceIn(0f, 2f)
                } else {
                    0f
                }
                CategoryBudgetItem(budget, category, used, progress)
            }
        BudgetUiState(
            totalBudget = totalBudget,
            totalUsed = if (totalBudget != null) totalExpense else 0L,
            categoryBudgets = categoryBudgets,
            categories = categories,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = BudgetUiState(),
    )

    /** 刷新入口（StateFlow 自动随上游变化更新，此处保留供外部调用约定）。 */
    fun refresh() = Unit
}
