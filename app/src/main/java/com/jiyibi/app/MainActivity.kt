package com.jiyibi.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.theme.JiYiBiTheme
import com.jiyibi.app.nav.JiYiBiApp
import com.jiyibi.app.ui.settings.ThemeViewModel
import dagger.hilt.android.AndroidEntryPoint

/**
 * 唯一 Activity，承载 Compose 导航与所有页面。
 *
 * 在根部订阅 [ThemeViewModel.theme]，将用户在「我的 → 主题风格」
 * 选择的主题应用到整个 Compose 树。
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val themeViewModel: ThemeViewModel = hiltViewModel()
            val appTheme by themeViewModel.theme.collectAsStateWithLifecycle()
            JiYiBiTheme(appTheme = appTheme) {
                JiYiBiApp()
            }
        }
    }
}
