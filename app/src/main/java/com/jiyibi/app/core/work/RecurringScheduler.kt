package com.jiyibi.app.core.work

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 调度周期性记账 Worker。
 *
 * 使用 WorkManager 周期任务（最小周期 15 分钟）轮询到期规则。
 * 应用启动时调用 [schedule] 一次即可，重复调用会被 KEEP 策略去重。
 */
@Singleton
class RecurringScheduler @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun schedule() {
        val request = PeriodicWorkRequestBuilder<RecurringWorker>(
            REPEAT_INTERVAL_MIN,
            TimeUnit.MINUTES,
        ).build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            request,
        )
    }

    companion object {
        private const val WORK_NAME = "recurring_worker"
        private const val REPEAT_INTERVAL_MIN = 15L
    }
}
