package com.jiyibi.app.core.domain.model

/** 交易类型 */
enum class TransactionType { EXPENSE, INCOME, TRANSFER }

/** 收支分类归属 */
enum class CategoryKind { EXPENSE, INCOME }

/** 账户类型 */
enum class AccountType {
    CASH, BANK, ALIPAY, WECHAT, CREDIT_CARD, OTHER
}

/** 周期频率 */
enum class RecurringFrequency { DAILY, WEEKLY, MONTHLY, YEARLY }

/** 借贷方向 */
enum class DebtDirection { OWED_TO_ME, OWED_BY_ME }

/** 统计周期 */
enum class StatPeriod { DAILY, WEEKLY, MONTHLY, YEARLY }
