package com.jiyibi.app.ui.account

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.data.repository.AccountInUseException
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.AccountType
import com.jiyibi.app.core.domain.repository.AccountRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** 账户管理页 UI 状态。 */
data class AccountManageUiState(
    val accounts: List<Account> = emptyList(),
    val totalBalance: Long = 0L,
    val isLoading: Boolean = false,
)

/** 删除账户错误事件：用于通知 UI 展示 Snackbar */
sealed class AccountDeleteEvent {
    data class HasTransactions(val accountId: Long) : AccountDeleteEvent()
}

@HiltViewModel
class AccountManageViewModel @Inject constructor(
    private val accountRepository: AccountRepository,
) : ViewModel() {
    val uiState: StateFlow<AccountManageUiState> = combine(
        accountRepository.observeAll(),
        accountRepository.observeTotalBalance(),
    ) { accounts, total -> AccountManageUiState(accounts, total, false) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AccountManageUiState())

    /** 删除失败事件流 */
    private val _deleteError = MutableSharedFlow<AccountDeleteEvent>()
    val deleteError: SharedFlow<AccountDeleteEvent> = _deleteError.asSharedFlow()

    fun saveAccount(
        id: Long?,
        name: String,
        type: AccountType,
        balance: Long,
        color: Int,
        onDone: () -> Unit,
    ) {
        viewModelScope.launch {
            accountRepository.upsert(
                Account(
                    id = id ?: 0L,
                    name = name,
                    type = type,
                    balance = balance,
                    color = color,
                    sortOrder = 0,
                ),
            )
            onDone()
        }
    }

    fun deleteAccount(id: Long) {
        viewModelScope.launch {
            try {
                accountRepository.delete(id)
            } catch (e: AccountInUseException) {
                _deleteError.emit(AccountDeleteEvent.HasTransactions(id))
            }
        }
    }
}
