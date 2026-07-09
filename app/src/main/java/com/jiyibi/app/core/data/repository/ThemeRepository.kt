package com.jiyibi.app.core.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.jiyibi.app.core.designsystem.theme.AppTheme
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** DataStore 扩展属性：每个 Context 关联一个独立的 preferences DataStore */
private val Context.themeDataStore by preferencesDataStore(name = "theme_preferences")

/**
 * 主题仓库：持久化用户选择的应用主题。
 *
 * 通过 DataStore Preferences 存储 [AppTheme.key]，应用启动时读取并
 * 在「我的 → 主题风格」中切换时写入。整个 App 通过 observe 返回的
 * [Flow] 响应主题变化。
 */
@Singleton
class ThemeRepository @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        private val KEY_THEME = stringPreferencesKey("app_theme")
    }

    /** 当前主题 Flow：首次启动返回默认主题 [AppTheme.MINT] */
    val theme: Flow<AppTheme> = context.themeDataStore.data.map { prefs ->
        AppTheme.fromKey(prefs[KEY_THEME])
    }

    /** 持久化切换后的主题 */
    suspend fun setTheme(theme: AppTheme) {
        context.themeDataStore.edit { prefs ->
            prefs[KEY_THEME] = theme.key
        }
    }
}
