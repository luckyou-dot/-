package com.jiyibi.app.ui.debt

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.domain.model.Debt
import com.jiyibi.app.core.domain.model.DebtDirection
import com.jiyibi.app.core.domain.repository.DebtRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** 借贷页 UI 状态：合并的借贷列表 + 待收/待付汇总。 */
data class DebtListUiState(
    val debts: List<Debt> = emptyList(),
    val totalOwedToMe: Long = 0L,   // 未结清的别人欠我总额
    val totalOwedByMe: Long = 0L,   // 未结清的我欠别人总额
    val isLoading: Boolean = false,
)

@HiltViewModel
class DebtListViewModel @Inject constructor(
    private val debtRepository: DebtRepository,
) : ViewModel() {

    // 使用 observeAll 合并展示所有借贷记录，按 createdAt 倒序排列
    val uiState: StateFlow<DebtListUiState> = debtRepository.observeAll()
        .map { list ->
            val sorted = list.sortedByDescending { it.createdAt }
            val unsettled = list.filter { !it.settled }
            DebtListUiState(
                debts = sorted,
                totalOwedToMe = unsettled
                    .filter { it.direction == DebtDirection.OWED_TO_ME }
                    .sumOf { it.amount },
                totalOwedByMe = unsettled
                    .filter { it.direction == DebtDirection.OWED_BY_ME }
                    .sumOf { it.amount },
                isLoading = false,
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), DebtListUiState())

    fun saveDebt(
        counterparty: String,
        direction: DebtDirection,
        amount: Long,
        note: String,
        dueDate: Long?,
        onDone: () -> Unit,
    ) {
        viewModelScope.launch {
            debtRepository.upsert(
                Debt(
                    counterparty = counterparty,
                    direction = direction,
                    amount = amount,
                    note = note,
                    dueDate = dueDate,
                    settled = false,
                    createdAt = System.currentTimeMillis(),
                ),
            )
            onDone()
        }
    }

    /** 切换结清状态：未结清 -> 已结清（记录结清时间），已结清 -> 未结清（清除结清时间） */
    fun toggleSettled(debt: Debt) {
        viewModelScope.launch {
            debtRepository.markSettled(debt.id, !debt.settled)
        }
    }

    fun deleteDebt(id: Long) {
        viewModelScope.launch { debtRepository.delete(id) }
    }
}
