package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * 交易记录（一笔收入/支出/转账）。
 *
 * - type：EXPENSE / INCOME / TRANSFER
 * - tags：标签 JSON（如 "报销中"、"AA待收"），用 [Converter] 与 List<String> 互转
 */
@Entity(
    tableName = "transactions",
    foreignKeys = [
        ForeignKey(
            entity = AccountEntity::class,
            parentColumns = ["id"],
            childColumns = ["accountId"],
            onDelete = ForeignKey.RESTRICT,
        ),
        ForeignKey(
            entity = CategoryEntity::class,
            parentColumns = ["id"],
            childColumns = ["categoryId"],
            onDelete = ForeignKey.SET_NULL,
        ),
    ],
    indices = [Index("accountId"), Index("categoryId"), Index("date")],
)
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val type: String,          // TransactionType 名称
    val amount: Long,          // 以「分」为单位，避免浮点误差
    val accountId: Long,
    val toAccountId: Long? = null,   // 转账目标账户
    val categoryId: Long? = null,
    val note: String = "",
    val tags: String = "[]",          // JSON 数组字符串
    val date: Long,                   // epoch millis
    val recurringRuleId: Long? = null, // 关联周期性记账规则
    val createdAt: Long,
    val updatedAt: Long,
)
