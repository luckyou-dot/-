package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 周期性记账规则：房租、水电煤、会员订阅等固定支出。
 *
 * - frequency：DAILY / WEEKLY / MONTHLY / YEARLY
 * - nextRunAt：下一次应执行/提醒的时间，WorkManager 据此调度
 * - autoRecord：true=自动生成交易；false=仅提醒
 */
@Entity(tableName = "recurring_rules")
data class RecurringRuleEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val amount: Long,
    val type: String,                 // TransactionType
    val accountId: Long,
    val categoryId: Long? = null,
    val frequency: String,            // RecurringFrequency
    val interval: Int = 1,            // 间隔（如每 2 周）
    val nextRunAt: Long,
    val autoRecord: Boolean = false,
    val enabled: Boolean = true,
    val endDate: Long? = null,
)
