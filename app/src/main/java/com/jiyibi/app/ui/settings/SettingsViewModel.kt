package com.jiyibi.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.common.TimeRange
import com.jiyibi.app.core.data.repository.ThemeRepository
import com.jiyibi.app.core.designsystem.theme.AppTheme
import com.jiyibi.app.core.domain.model.DebtDirection
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.DebtRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * 我的页「资产看板」卡片所需聚合数据（金额单位均为「分」）。
 *
 * @property totalAssets         全部账户余额合计
 * @property monthBalance        本月结余 = 本月收入 - 本月支出
 * @property pendingReceivable   待收 = 未结清的 OWED_TO_ME 借贷总额
 */
data class AssetBoard(
    val totalAssets: Long,
    val monthBalance: Long,
    val pendingReceivable: Long,
)

/**
 * 我的页 ViewModel：聚合账户余额 / 本月收支 / 待收借贷，供资产看板卡片展示。
 *
 * 注意：[DebtRepository] 仅提供 [DebtRepository.observeUnsettled]，
 * 而看板恰好只需要「未结清 OWED_TO_ME」，因此直接订阅未结清列表，
 * 内部对 `settled` 的过滤为防御性写法（observeUnsettled 已保证 settled=false）。
 */
@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val accountRepository: AccountRepository,
    private val transactionRepository: TransactionRepository,
    private val debtRepository: DebtRepository,
    private val themeRepository: ThemeRepository,
) : ViewModel() {

    /** 当前应用主题（持久化于 DataStore，初始默认 [AppTheme.MINT]） */
    val currentTheme: StateFlow<AppTheme> = themeRepository.theme
        .stateIn(viewModelScope, SharingStarted.Lazily, AppTheme.MINT)

    /** 切换应用主题并持久化 */
    fun setTheme(theme: AppTheme) {
        viewModelScope.launch { themeRepository.setTheme(theme) }
    }

    val assetBoard: StateFlow<AssetBoard> = combine(
        accountRepository.observeAll(),
        flowOf(TimeRange.thisMonth()).flatMapLatest { (start, end) ->
            transactionRepository.observeRange(start, end)
        },
        debtRepository.observeUnsettled(),
    ) { accounts, monthTxs, debts ->
        AssetBoard(
            totalAssets = accounts.sumOf { it.balance },
            monthBalance = monthTxs.filter { it.type == TransactionType.INCOME }.sumOf { it.amount } -
                monthTxs.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount },
            pendingReceivable = debts
                .filter { it.direction == DebtDirection.OWED_TO_ME && !it.settled }
                .sumOf { it.amount },
        )
    }.stateIn(viewModelScope, SharingStarted.Lazily, AssetBoard(0, 0, 0))

    /**
     * 是否存在交易数据。用于「修改总资产」前提示用户：已有交易数据时修改总资产
     * 会调整首个账户余额以匹配新值，可能与实际账目不符，需用户确认。
     */
    val hasTransactions: StateFlow<Boolean> = transactionRepository.observeRange(0L, Long.MAX_VALUE)
        .map { it.isNotEmpty() }
        .stateIn(viewModelScope, SharingStarted.Lazily, false)

    /** 是否存在可用账户（未归档）。无账户时不允许编辑总资产。 */
    val hasAccounts: StateFlow<Boolean> = accountRepository.observeAll()
        .map { it.isNotEmpty() }
        .stateIn(viewModelScope, SharingStarted.Lazily, false)

    /**
     * 手动设置总资产：调整首个账户的余额，使所有账户余额总和等于 [targetCents]。
     *
     * 用于「资产看板」卡片的总资产编辑入口。调整首个账户是为了持久化到 DB，
     * 并让 [assetBoard] 的 totalAssets 自动反映新值。
     * 若无任何账户，则不做任何操作（UI 应保证有账户时才允许编辑）。
     *
     * @param targetCents 目标总资产（分）
     */
    fun setTotalAssets(targetCents: Long) {
        viewModelScope.launch {
            val accounts = accountRepository.observeAll().first()
            if (accounts.isEmpty()) return@launch
            val currentTotal = accounts.sumOf { it.balance }
            val delta = targetCents - currentTotal
            if (delta != 0L) {
                accountRepository.adjustBalance(accounts.first().id, delta)
            }
        }
    }
}
