package com.jiyibi.app.core.data

import com.jiyibi.app.core.database.Converters
import com.jiyibi.app.core.database.entity.AccountEntity
import com.jiyibi.app.core.database.entity.BudgetEntity
import com.jiyibi.app.core.database.entity.CategoryEntity
import com.jiyibi.app.core.database.entity.DebtEntity
import com.jiyibi.app.core.database.entity.RecurringRuleEntity
import com.jiyibi.app.core.database.entity.TransactionEntity
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.AccountType
import com.jiyibi.app.core.domain.model.Budget
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.CategoryKind
import com.jiyibi.app.core.domain.model.Debt
import com.jiyibi.app.core.domain.model.DebtDirection
import com.jiyibi.app.core.domain.model.RecurringFrequency
import com.jiyibi.app.core.domain.model.RecurringRule
import com.jiyibi.app.core.domain.model.Transaction
import com.jiyibi.app.core.domain.model.TransactionType

/** 复用 Room 的 Converters 进行 tags 的 JSON 序列化/反序列化 */
private val converters = Converters()

internal fun TransactionEntity.toDomain() = Transaction(
    id = id,
    type = TransactionType.valueOf(type),
    amount = amount,
    accountId = accountId,
    toAccountId = toAccountId,
    categoryId = categoryId,
    note = note,
    tags = converters.stringToTags(tags),
    date = date,
    recurringRuleId = recurringRuleId,
)

internal fun Transaction.toEntity(createdAt: Long, updatedAt: Long) = TransactionEntity(
    id = id,
    type = type.name,
    amount = amount,
    accountId = accountId,
    toAccountId = toAccountId,
    categoryId = categoryId,
    note = note,
    tags = converters.tagsToString(tags),
    date = date,
    recurringRuleId = recurringRuleId,
    createdAt = createdAt,
    updatedAt = updatedAt,
)

internal fun AccountEntity.toDomain() = Account(
    id = id,
    name = name,
    type = runCatching { AccountType.valueOf(type) }.getOrDefault(AccountType.OTHER),
    balance = balance,
    color = color,
    sortOrder = sortOrder,
    archived = archived,
)

internal fun Account.toEntity(initialBalance: Long, createdAt: Long) = AccountEntity(
    id = id,
    name = name,
    type = type.name,
    balance = balance,
    initialBalance = initialBalance,
    color = color,
    sortOrder = sortOrder,
    archived = archived,
    createdAt = createdAt,
)

internal fun CategoryEntity.toDomain() = Category(
    id = id,
    name = name,
    kind = CategoryKind.valueOf(kind),
    icon = icon,
    color = color,
    builtin = builtin,
)

internal fun BudgetEntity.toDomain() = Budget(
    id = id,
    periodStart = periodStart,
    periodEnd = periodEnd,
    categoryId = categoryId,
    amountLimit = amountLimit,
    alertThreshold = alertThreshold,
)

internal fun RecurringRuleEntity.toDomain() = RecurringRule(
    id = id,
    title = title,
    amount = amount,
    type = TransactionType.valueOf(type),
    accountId = accountId,
    categoryId = categoryId,
    frequency = RecurringFrequency.valueOf(frequency),
    interval = interval,
    nextRunAt = nextRunAt,
    autoRecord = autoRecord,
    enabled = enabled,
)

internal fun DebtEntity.toDomain() = Debt(
    id = id,
    counterparty = counterparty,
    direction = DebtDirection.valueOf(direction),
    amount = amount,
    note = note,
    dueDate = dueDate,
    settled = settled,
    createdAt = createdAt,
    settledAt = settledAt,
)
