package com.jiyibi.app.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.yuanToCents
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** 搜索过滤条件 */
data class SearchFilters(
    val keyword: String = "",
    val startDate: Long? = null,
    val endDate: Long? = null,
    val minAmount: Long? = null,   // 元
    val maxAmount: Long? = null,   // 元
    val categoryIds: Set<Long> = emptySet(),
)

/** 搜索页 UI 状态 */
data class SearchUiState(
    val filters: SearchFilters = SearchFilters(),
    val results: List<Transaction> = emptyList(),
    val categories: List<Category> = emptyList(),
    val isLoading: Boolean = false,
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val categoryRepository: CategoryRepository,
) : ViewModel() {

    private val _filters = MutableStateFlow(SearchFilters())

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<SearchUiState> = _filters
        .flatMapLatest { filters ->
            // search() 处理 keyword/日期/金额区间；categoryIds 在内存过滤
            combine(
                transactionRepository.search(
                    keyword = filters.keyword,
                    start = filters.startDate,
                    end = filters.endDate,
                    minAmount = filters.minAmount?.toDouble()?.yuanToCents(),
                    maxAmount = filters.maxAmount?.toDouble()?.yuanToCents(),
                ),
                categoryRepository.observeAll(),
            ) { raw, categories ->
                val filtered = if (filters.categoryIds.isEmpty()) raw
                               else raw.filter { it.categoryId in filters.categoryIds }
                SearchUiState(filters, filtered, categories, false)
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = SearchUiState(isLoading = true),
        )

    fun updateKeyword(v: String) {
        _filters.update { it.copy(keyword = v) }
    }

    fun updateDateRange(start: Long?, end: Long?) {
        _filters.update { it.copy(startDate = start, endDate = end) }
    }

    fun updateAmountRange(min: Long?, max: Long?) {
        _filters.update { it.copy(minAmount = min, maxAmount = max) }
    }

    fun toggleCategory(id: Long) {
        _filters.update { f ->
            val newSet = if (id in f.categoryIds) f.categoryIds - id else f.categoryIds + id
            f.copy(categoryIds = newSet)
        }
    }

    fun clearFilters() {
        _filters.value = SearchFilters()
    }

    fun deleteTransaction(id: Long) {
        viewModelScope.launch { transactionRepository.delete(id) }
    }
}
