package com.jiyibi.app.ui.tag

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

/** 标签 + 关联交易数。 */
data class TagWithCount(val name: String, val count: Int)

@HiltViewModel
class TagManageViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
) : ViewModel() {

    /** 当前展开查看的标签名，null 表示未展开任何标签 */
    private val _expandedTag = MutableStateFlow<String?>(null)
    val expandedTag: StateFlow<String?> = _expandedTag

    /** 全部标签 + 关联交易数 */
    val tags: StateFlow<List<TagWithCount>> = transactionRepository
        .observeRange(0L, Long.MAX_VALUE)
        .map { txs ->
            txs.flatMap { it.tags }
                .groupingBy { it }
                .eachCount()
                .entries
                .map { TagWithCount(it.key, it.value) }
                .sortedByDescending { it.count }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    /** 当前展开标签下的交易列表（按日期倒序） */
    val tagTransactions: StateFlow<List<Transaction>> = combine(
        transactionRepository.observeRange(0L, Long.MAX_VALUE),
        _expandedTag,
    ) { txs, tag ->
        if (tag == null) emptyList()
        else txs.filter { tag in it.tags }.sortedByDescending { it.date }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /** 切换标签展开状态：点击同标签再次折叠 */
    fun toggleTag(name: String) {
        _expandedTag.value = if (_expandedTag.value == name) null else name
    }
}
