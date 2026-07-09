package com.jiyibi.app.core.data.repository

import com.jiyibi.app.core.data.toDomain
import com.jiyibi.app.core.data.toEntity
import com.jiyibi.app.core.database.dao.AccountDao
import com.jiyibi.app.core.database.dao.BudgetDao
import com.jiyibi.app.core.database.dao.CategoryDao
import com.jiyibi.app.core.database.dao.DebtDao
import com.jiyibi.app.core.database.dao.RecurringRuleDao
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.Budget
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.Debt
import com.jiyibi.app.core.domain.model.RecurringRule
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.DebtRepository
import com.jiyibi.app.core.domain.repository.RecurringRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AccountRepositoryImpl @Inject constructor(
    private val dao: AccountDao,
) : AccountRepository {
    override fun observeAll(): Flow<List<Account>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    override fun observeTotalBalance(): Flow<Long> = dao.observeTotalBalance()

    override suspend fun upsert(account: Account): Long {
        // 编辑模式（记录已存在）：用 @Update 避免 @Insert(REPLACE) 内部 DELETE 触发 FK RESTRICT
        // 恢复模式（id != 0 但记录不存在，如 deleteAll 后恢复）：走 @Insert(REPLACE) 保留原 id
        val existing = if (account.id != 0L) dao.getById(account.id) else null
        val initialBalance = existing?.initialBalance ?: account.balance
        val createdAt = existing?.createdAt ?: System.currentTimeMillis()
        val entity = account.toEntity(initialBalance = initialBalance, createdAt = createdAt)
        return if (existing != null) {
            dao.update(entity)
            account.id
        } else {
            dao.upsert(entity)
        }
    }

    /** 删除账户：若该账户下有交易记录（FK RESTRICT），抛出 [AccountInUseException] */
    override suspend fun delete(id: Long) {
        try {
            dao.deleteById(id)
        } catch (e: android.database.sqlite.SQLiteConstraintException) {
            throw AccountInUseException(id, e)
        }
    }

    override suspend fun deleteAll() = dao.deleteAll()

    override suspend fun adjustBalance(id: Long, delta: Long) = dao.adjustBalance(id, delta)
}

/** 账户下仍有交易记录时抛出，用于 UI 提示用户无法删除 */
class AccountInUseException(val accountId: Long, cause: Throwable) :
    RuntimeException("账户 $accountId 下仍有交易记录，无法删除", cause)

@Singleton
class CategoryRepositoryImpl @Inject constructor(
    private val dao: CategoryDao,
) : CategoryRepository {
    override fun observeAll(): Flow<List<Category>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    override fun observeByKind(kind: String): Flow<List<Category>> =
        dao.observeByKind(kind).map { list -> list.map { it.toDomain() } }

    override suspend fun upsert(category: Category): Long = dao.upsert(
        com.jiyibi.app.core.database.entity.CategoryEntity(
            id = category.id,
            name = category.name,
            kind = category.kind.name,
            icon = category.icon,
            color = category.color,
            builtin = category.builtin,
        )
    )

    override suspend fun delete(id: Long) = dao.deleteById(id)
    override suspend fun deleteAll() = dao.deleteAll()
}

@Singleton
class BudgetRepositoryImpl @Inject constructor(
    private val dao: BudgetDao,
) : BudgetRepository {
    override fun observeActive(now: Long): Flow<List<Budget>> =
        dao.observeActive(now).map { list -> list.map { it.toDomain() } }

    override suspend fun upsert(budget: Budget): Long = dao.upsert(
        com.jiyibi.app.core.database.entity.BudgetEntity(
            id = budget.id,
            periodStart = budget.periodStart,
            periodEnd = budget.periodEnd,
            categoryId = budget.categoryId,
            amountLimit = budget.amountLimit,
            alertThreshold = budget.alertThreshold,
        )
    )

    override suspend fun delete(id: Long) = dao.deleteById(id)
    override suspend fun deleteAll() = dao.deleteAll()
}

@Singleton
class RecurringRepositoryImpl @Inject constructor(
    private val dao: RecurringRuleDao,
) : RecurringRepository {
    override fun observeAll(): Flow<List<RecurringRule>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    override suspend fun upsert(rule: RecurringRule): Long = dao.upsert(
        com.jiyibi.app.core.database.entity.RecurringRuleEntity(
            id = rule.id,
            title = rule.title,
            amount = rule.amount,
            type = rule.type.name,
            accountId = rule.accountId,
            categoryId = rule.categoryId,
            frequency = rule.frequency.name,
            interval = rule.interval,
            nextRunAt = rule.nextRunAt,
            autoRecord = rule.autoRecord,
            enabled = rule.enabled,
        )
    )

    override suspend fun delete(id: Long) = dao.deleteById(id)
    override suspend fun deleteAll() = dao.deleteAll()
    override suspend fun getDue(now: Long): List<RecurringRule> =
        dao.getDue(now).map { it.toDomain() }

    override suspend fun advanceNextRun(id: Long, nextRunAt: Long) =
        dao.updateNextRun(id, nextRunAt)
}

@Singleton
class DebtRepositoryImpl @Inject constructor(
    private val dao: DebtDao,
) : DebtRepository {
    override fun observeUnsettled(): Flow<List<Debt>> =
        dao.observeUnsettled().map { list -> list.map { it.toDomain() } }

    override fun observeAll(): Flow<List<Debt>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    override suspend fun upsert(debt: Debt): Long = dao.upsert(
        com.jiyibi.app.core.database.entity.DebtEntity(
            id = debt.id,
            counterparty = debt.counterparty,
            direction = debt.direction.name,
            amount = debt.amount,
            note = debt.note,
            dueDate = debt.dueDate,
            settled = debt.settled,
            createdAt = debt.createdAt,
            settledAt = debt.settledAt,
        )
    )

    override suspend fun delete(id: Long) = dao.deleteById(id)
    override suspend fun deleteAll() = dao.deleteAll()

    override suspend fun markSettled(id: Long, settled: Boolean) =
        dao.markSettled(id, settled, if (settled) System.currentTimeMillis() else null)
}
