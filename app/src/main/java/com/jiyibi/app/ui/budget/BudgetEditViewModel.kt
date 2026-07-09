package com.jiyibi.app.ui.budget

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.domain.model.Budget
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.centsToYuan
import com.jiyibi.app.core.domain.model.yuanToCents
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** 预算编辑页 UI 状态。 */
data class BudgetEditUiState(
    val isNew: Boolean = true,
    val amountText: String = "",
    val threshold: Float = 0.8f,
    val isTotal: Boolean = true,   // true=月度总预算, false=分类预算
    val selectedCategoryId: Long? = null,
    val categories: List<Category> = emptyList(),
    val initialized: Boolean = false,  // 编辑模式下是否已预填表单
    /** 当前月已存在的总预算（用于新建总预算时提示用户是否覆盖） */
    val existingTotalBudget: Budget? = null,
)

@HiltViewModel
class BudgetEditViewModel @Inject constructor(
    private val budgetRepository: BudgetRepository,
    private val categoryRepository: CategoryRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    /** 从 nav arg 读取预算 id，-1 表示新建 */
    val budgetId: Long = savedStateHandle.get<Long>("budgetId") ?: -1L

    /** 从 nav arg 读取 forceCategory 参数：true 表示强制进入分类预算模式 */
    val forceCategory: Boolean = savedStateHandle.get<Boolean>("forceCategory") ?: false

    /** 是否为编辑模式（id > 0） */
    val isEditMode: Boolean get() = budgetId > 0L

    /** 表单状态源（UI 通过 update* 方法修改） */
    private val formState = MutableStateFlow(
        BudgetEditUiState(isNew = !isEditMode, isTotal = !forceCategory)
    )

    init {
        // 编辑模式：从 DB 加载预算并预填表单（只执行一次，避免覆盖用户输入）
        if (isEditMode) {
            viewModelScope.launch {
                val budget = budgetRepository.observeActive(System.currentTimeMillis())
                    .map { list -> list.firstOrNull { it.id == budgetId } }
                    .filterNotNull()
                    .first()
                formState.update {
                    it.copy(
                        amountText = budget.amountLimit.centsToYuan().toPlainString(),
                        threshold = budget.alertThreshold,
                        isTotal = budget.categoryId == null,
                        selectedCategoryId = budget.categoryId,
                        initialized = true,
                    )
                }
            }
        } else {
            // 新建模式：直接标记为已初始化
            formState.update { it.copy(initialized = true) }
        }
    }

    /** 当前月已存在的月度总预算（categoryId == null） */
    private val existingTotalBudgetFlow: Flow<Budget?> =
        budgetRepository.observeActive(System.currentTimeMillis())
            .map { list -> list.firstOrNull { it.categoryId == null } }

    /** UI 状态：combine 表单 + 分类列表 + 当月已存在总预算 */
    val uiState: StateFlow<BudgetEditUiState> = combine(
        formState,
        categoryRepository.observeAll(),
        existingTotalBudgetFlow,
    ) { form, categories, existingTotal ->
        form.copy(categories = categories, existingTotalBudget = existingTotal)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = BudgetEditUiState(
            isNew = !isEditMode,
            isTotal = !forceCategory,
        ),
    )

    /** 更新金额输入 */
    fun updateAmount(text: String) {
        formState.update { it.copy(amountText = text) }
    }

    /** 更新提醒阈值 */
    fun updateThreshold(v: Float) {
        formState.update { it.copy(threshold = v) }
    }

    /** 更新预算类型（true=月度总预算, false=分类预算） */
    fun updateType(isTotal: Boolean) {
        formState.update { it.copy(isTotal = isTotal) }
    }

    /** 更新选中分类 */
    fun updateCategory(id: Long?) {
        formState.update { it.copy(selectedCategoryId = id) }
    }

    /** 保存预算（新建或更新） */
    fun save(onDone: () -> Unit) {
        viewModelScope.launch {
            val s = formState.value
            val existingTotal = uiState.value.existingTotalBudget
            val cents = s.amountText.toDoubleOrNull()?.yuanToCents() ?: 0L
            val (start, end) = TimeRange.thisMonth()
            val categoryId = if (s.isTotal) null else s.selectedCategoryId
            // 新建月度总预算但本月已存在：复用已存在预算的 id 以更新而非新建
            val existingId = if (!isEditMode && s.isTotal && existingTotal != null) {
                existingTotal.id
            } else {
                if (isEditMode) budgetId else 0L
            }
            val budget = Budget(
                id = existingId,
                periodStart = start,
                periodEnd = end,
                categoryId = categoryId,
                amountLimit = cents,
                alertThreshold = s.threshold,
            )
            budgetRepository.upsert(budget)
            onDone()
        }
    }

    /** 删除预算（仅编辑模式可用） */
    fun delete(onDone: () -> Unit) {
        if (!isEditMode) return
        viewModelScope.launch {
            budgetRepository.delete(budgetId)
            onDone()
        }
    }
}
