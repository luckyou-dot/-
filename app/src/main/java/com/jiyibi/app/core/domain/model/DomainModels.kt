package com.jiyibi.app.core.domain.model

import java.math.BigDecimal

/**
 * 把以「分」为单位的 Long 转成元（BigDecimal），用于 UI 显示与导出。
 */
fun Long.centsToYuan(): BigDecimal = BigDecimal.valueOf(this).movePointLeft(2)

/** 把用户输入的元转成「分」。 */
fun Double.yuanToCents(): Long = BigDecimal.valueOf(this).movePointRight(2).longValueExact()

/** 一笔交易（领域模型，与 UI/DB 解耦）。 */
data class Transaction(
    val id: Long = 0,
    val type: TransactionType,
    val amount: Long,                 // 分
    val accountId: Long,
    val toAccountId: Long? = null,
    val categoryId: Long? = null,
    val note: String = "",
    val tags: List<String> = emptyList(),
    val date: Long,
    val recurringRuleId: Long? = null,
)

data class Account(
    val id: Long = 0,
    val name: String,
    val type: AccountType,
    val balance: Long,
    val color: Int,
    val sortOrder: Int,
    val archived: Boolean = false,
)

data class Category(
    val id: Long = 0,
    val name: String,
    val kind: CategoryKind,
    val icon: String,
    val color: Int,
    val builtin: Boolean,
)

data class Budget(
    val id: Long = 0,
    val periodStart: Long,
    val periodEnd: Long,
    val categoryId: Long?,
    val amountLimit: Long,
    val alertThreshold: Float = 0.8f,
)

data class RecurringRule(
    val id: Long = 0,
    val title: String,
    val amount: Long,
    val type: TransactionType,
    val accountId: Long,
    val categoryId: Long?,
    val frequency: RecurringFrequency,
    val interval: Int = 1,
    val nextRunAt: Long,
    val autoRecord: Boolean,
    val enabled: Boolean,
)

data class Debt(
    val id: Long = 0,
    val counterparty: String,
    val direction: DebtDirection,
    val amount: Long,
    val note: String,
    val dueDate: Long?,
    val settled: Boolean,
    val createdAt: Long,
    val settledAt: Long? = null,
)

/** 分类统计项，用于饼图。 */
data class CategoryStat(
    val categoryId: Long,
    val categoryName: String,
    val color: Int,
    val icon: String = "",
    val total: Long,
)

/** 时间趋势点，用于折线图。 */
data class TrendPoint(
    val timestamp: Long,
    val expense: Long,
    val income: Long,
)
