package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 账户：现金、银行卡、微信、支付宝、信用卡等。
 *
 * balance 单位为「分」，与交易金额一致。
 */
@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val type: String,           // AccountType 名称：CASH / BANK / ALIPAY / WECHAT / CREDIT_CARD ...
    val balance: Long = 0,      // 当前余额（分）
    val initialBalance: Long = 0,
    val color: Int = 0,         // ARGB 颜色，用于 UI 区分
    val sortOrder: Int = 0,
    val archived: Boolean = false,
    val createdAt: Long,
)
