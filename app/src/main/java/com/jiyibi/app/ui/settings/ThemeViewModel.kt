package com.jiyibi.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jiyibi.app.core.data.repository.ThemeRepository
import com.jiyibi.app.core.designsystem.theme.AppTheme
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

/**
 * 全局主题 ViewModel：用于 MainActivity 读取并应用当前主题。
 *
 * 与 [SettingsViewModel] 共享同一个 [ThemeRepository] Singleton，
 * 因此任一处调用 [SettingsViewModel.setTheme] 后，本 ViewModel 的
 * [theme] 会同步更新，全 App 主题随之响应。
 */
@HiltViewModel
class ThemeViewModel @Inject constructor(
    private val themeRepository: ThemeRepository,
) : ViewModel() {

    val theme: StateFlow<AppTheme> = themeRepository.theme
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppTheme.MINT)
}
