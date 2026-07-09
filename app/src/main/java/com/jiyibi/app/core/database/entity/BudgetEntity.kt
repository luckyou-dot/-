package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * 预算：按月或按分类设定额度，接近/超出时推送通知。
 */
@Entity(
    tableName = "budgets",
    indices = [Index(value = ["periodStart", "categoryId"], unique = true)],
)
data class BudgetEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val periodStart: Long,       // 周期起始 epoch millis（按月即月初）
    val periodEnd: Long,         // 周期结束
    val categoryId: Long? = null,  // null = 月度总预算
    val amountLimit: Long,      // 预算额度（分）
    val alertThreshold: Float = 0.8f,  // 触发提醒的占比
)
