package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 借贷记录：简单的「谁欠我 / 我欠谁」管理。
 *
 * - direction：OWED_TO_ME（别人欠我）/ OWED_BY_ME（我欠别人）
 * - settled：是否已结清
 */
@Entity(tableName = "debts")
data class DebtEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val counterparty: String,        // 对方姓名/备注
    val direction: String,           // DebtDirection
    val amount: Long,
    val note: String = "",
    val dueDate: Long? = null,
    val settled: Boolean = false,
    val createdAt: Long,
    val settledAt: Long? = null,
)
