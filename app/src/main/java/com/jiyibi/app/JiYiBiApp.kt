package com.jiyibi.app

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.jiyibi.app.core.work.RecurringScheduler
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * 应用入口。
 *
 * 负责：
 * - 触发 Hilt 依赖注入图初始化
 * - 配置 WorkManager（用于记账提醒、周期性记账等后台任务）
 * - 启动周期性记账 Worker 调度
 */
@HiltAndroidApp
class JiYiBiApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var recurringScheduler: RecurringScheduler

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        // 启动周期性记账轮询（每 15 分钟检查一次到期规则）
        recurringScheduler.schedule()
    }
}
