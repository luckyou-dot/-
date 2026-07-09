package com.jiyibi.app.core.backup

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
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.DebtRepository
import com.jiyibi.app.core.domain.repository.RecurringRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * 本地明文 JSON 备份与恢复。
 *
 * 导出：读取全部 Room 数据（账户、分类、交易、周期规则、借贷、预算）→ JSON 字符串。
 * 导入：解析 JSON → 清空所有表 → 按外键依赖顺序回写，实现干净的覆盖恢复。
 */
@Singleton
class MigrateBackup @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val categoryRepository: CategoryRepository,
    private val budgetRepository: BudgetRepository,
    private val recurringRepository: RecurringRepository,
    private val debtRepository: DebtRepository,
) {

    companion object {
        private const val VERSION = 1
    }

    // ---- 本地明文备份（无加密，用于本地备份与恢复） ----

    /** 导出明文 JSON 备份（不加密），用于本地备份。返回 JSON 字符串。 */
    suspend fun exportPlainBackup(): String = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val accounts = accountRepository.observeAll().first()
        val categories = categoryRepository.observeAll().first()
        val transactions = transactionRepository.observeRange(0L, Long.MAX_VALUE).first()
        val recurringRules = recurringRepository.observeAll().first()
        val debts = debtRepository.observeAll().first()
        val budgets = budgetRepository.observeActive(now).first()
        buildBackupJson(accounts, categories, transactions, recurringRules, debts, budgets, now)
    }

    /** 从明文 JSON 恢复数据（覆盖当前数据）。成功返回 true。 */
    suspend fun importPlainBackup(json: String): Boolean = withContext(Dispatchers.IO) {
        try {
            applyBackupJson(json)
            true
        } catch (e: Exception) {
            false
        }
    }

    // ---- JSON 序列化 ----

    private fun buildBackupJson(
        accounts: List<Account>,
        categories: List<Category>,
        transactions: List<Transaction>,
        recurringRules: List<RecurringRule>,
        debts: List<Debt>,
        budgets: List<Budget>,
        exportedAt: Long,
    ): String {
        val root = JSONObject()
        root.put("version", VERSION)
        root.put("exportedAt", exportedAt)

        val accArr = JSONArray()
        accounts.forEach { a ->
            accArr.put(JSONObject().apply {
                put("id", a.id)
                put("name", a.name)
                put("type", a.type.name)
                put("balance", a.balance)
                put("color", a.color)
                put("sortOrder", a.sortOrder)
                put("archived", a.archived)
            })
        }
        root.put("accounts", accArr)

        val catArr = JSONArray()
        categories.forEach { c ->
            catArr.put(JSONObject().apply {
                put("id", c.id)
                put("name", c.name)
                put("kind", c.kind.name)
                put("icon", c.icon)
                put("color", c.color)
                put("builtin", c.builtin)
            })
        }
        root.put("categories", catArr)

        val txArr = JSONArray()
        transactions.forEach { t ->
            txArr.put(JSONObject().apply {
                put("id", t.id)
                put("type", t.type.name)
                put("amount", t.amount)
                put("accountId", t.accountId)
                if (t.toAccountId != null) put("toAccountId", t.toAccountId) else put("toAccountId", JSONObject.NULL)
                if (t.categoryId != null) put("categoryId", t.categoryId) else put("categoryId", JSONObject.NULL)
                put("note", t.note)
                put("date", t.date)
                if (t.recurringRuleId != null) put("recurringRuleId", t.recurringRuleId) else put("recurringRuleId", JSONObject.NULL)
                // 标签数组
                val tagArr = JSONArray()
                t.tags.forEach { tagArr.put(it) }
                put("tags", tagArr)
            })
        }
        root.put("transactions", txArr)

        val recArr = JSONArray()
        recurringRules.forEach { r ->
            recArr.put(JSONObject().apply {
                put("id", r.id)
                put("title", r.title)
                put("amount", r.amount)
                put("type", r.type.name)
                put("accountId", r.accountId)
                if (r.categoryId != null) put("categoryId", r.categoryId) else put("categoryId", JSONObject.NULL)
                put("frequency", r.frequency.name)
                put("interval", r.interval)
                put("nextRunAt", r.nextRunAt)
                put("autoRecord", r.autoRecord)
                put("enabled", r.enabled)
            })
        }
        root.put("recurring_rules", recArr)

        val debtArr = JSONArray()
        debts.forEach { d ->
            debtArr.put(JSONObject().apply {
                put("id", d.id)
                put("counterparty", d.counterparty)
                put("direction", d.direction.name)
                put("amount", d.amount)
                put("note", d.note)
                if (d.dueDate != null) put("dueDate", d.dueDate) else put("dueDate", JSONObject.NULL)
                put("settled", d.settled)
                put("createdAt", d.createdAt)
                if (d.settledAt != null) put("settledAt", d.settledAt) else put("settledAt", JSONObject.NULL)
            })
        }
        root.put("debts", debtArr)

        val budArr = JSONArray()
        budgets.forEach { b ->
            budArr.put(JSONObject().apply {
                put("id", b.id)
                put("periodStart", b.periodStart)
                put("periodEnd", b.periodEnd)
                if (b.categoryId != null) put("categoryId", b.categoryId) else put("categoryId", JSONObject.NULL)
                put("amountLimit", b.amountLimit)
                put("alertThreshold", b.alertThreshold)
            })
        }
        root.put("budgets", budArr)

        return root.toString()
    }

    // ---- JSON 反序列化与回写 ----

    private suspend fun applyBackupJson(json: String) {
        val root = JSONObject(json)
        // 恢复前先清空所有表，确保恢复结果是干净的覆盖而非合并。
        // 清空顺序遵循外键依赖：先删子表（transactions），再删父表（accounts/categories）。
        clearAllData()

        // 按外键依赖顺序：先账户与分类，再交易/周期规则，最后预算与借贷
        val accounts = root.optJSONArray("accounts")
        if (accounts != null) {
            for (i in 0 until accounts.length()) {
                val o = accounts.getJSONObject(i)
                accountRepository.upsert(
                    Account(
                        id = o.getLong("id"),
                        name = o.getString("name"),
                        type = AccountType.valueOf(o.getString("type")),
                        balance = o.getLong("balance"),
                        color = o.optInt("color", 0),
                        sortOrder = o.optInt("sortOrder", 0),
                        archived = o.optBoolean("archived", false),
                    )
                )
            }
        }

        val categories = root.optJSONArray("categories")
        if (categories != null) {
            for (i in 0 until categories.length()) {
                val o = categories.getJSONObject(i)
                categoryRepository.upsert(
                    Category(
                        id = o.getLong("id"),
                        name = o.getString("name"),
                        kind = CategoryKind.valueOf(o.getString("kind")),
                        icon = o.getString("icon"),
                        color = o.optInt("color", 0),
                        builtin = o.optBoolean("builtin", false),
                    )
                )
            }
        }

        // 先插入周期规则，再插入交易（Transaction.recurringRuleId 外键引用 RecurringRule）
        val recurring = root.optJSONArray("recurring_rules")
        if (recurring != null) {
            for (i in 0 until recurring.length()) {
                val o = recurring.getJSONObject(i)
                recurringRepository.upsert(
                    RecurringRule(
                        id = o.getLong("id"),
                        title = o.getString("title"),
                        amount = o.getLong("amount"),
                        type = TransactionType.valueOf(o.getString("type")),
                        accountId = o.getLong("accountId"),
                        categoryId = if (o.isNull("categoryId")) null else o.getLong("categoryId"),
                        frequency = RecurringFrequency.valueOf(o.getString("frequency")),
                        interval = o.optInt("interval", 1),
                        nextRunAt = o.getLong("nextRunAt"),
                        autoRecord = o.optBoolean("autoRecord", false),
                        enabled = o.optBoolean("enabled", true),
                    )
                )
            }
        }

        val transactions = root.optJSONArray("transactions")
        if (transactions != null) {
            for (i in 0 until transactions.length()) {
                val o = transactions.getJSONObject(i)
                // 读取标签数组
                val tagList = mutableListOf<String>()
                val tagArr = o.optJSONArray("tags")
                if (tagArr != null) {
                    for (ti in 0 until tagArr.length()) {
                        tagList.add(tagArr.getString(ti))
                    }
                }
                transactionRepository.upsert(
                    Transaction(
                        id = o.getLong("id"),
                        type = TransactionType.valueOf(o.getString("type")),
                        amount = o.getLong("amount"),
                        accountId = o.getLong("accountId"),
                        toAccountId = if (o.isNull("toAccountId")) null else o.getLong("toAccountId"),
                        categoryId = if (o.isNull("categoryId")) null else o.getLong("categoryId"),
                        note = o.optString("note", ""),
                        date = o.getLong("date"),
                        recurringRuleId = if (o.isNull("recurringRuleId")) null else o.getLong("recurringRuleId"),
                        tags = tagList,
                    )
                )
            }
        }

        val budgets = root.optJSONArray("budgets")
        if (budgets != null) {
            for (i in 0 until budgets.length()) {
                val o = budgets.getJSONObject(i)
                budgetRepository.upsert(
                    Budget(
                        id = o.getLong("id"),
                        periodStart = o.getLong("periodStart"),
                        periodEnd = o.getLong("periodEnd"),
                        categoryId = if (o.isNull("categoryId")) null else o.getLong("categoryId"),
                        amountLimit = o.getLong("amountLimit"),
                        alertThreshold = o.optDouble("alertThreshold", 0.8).toFloat(),
                    )
                )
            }
        }

        val debts = root.optJSONArray("debts")
        if (debts != null) {
            for (i in 0 until debts.length()) {
                val o = debts.getJSONObject(i)
                debtRepository.upsert(
                    Debt(
                        id = o.getLong("id"),
                        counterparty = o.getString("counterparty"),
                        direction = DebtDirection.valueOf(o.getString("direction")),
                        amount = o.getLong("amount"),
                        note = o.optString("note", ""),
                        dueDate = if (o.isNull("dueDate")) null else o.getLong("dueDate"),
                        settled = o.optBoolean("settled", false),
                        createdAt = o.getLong("createdAt"),
                        settledAt = if (o.has("settledAt") && !o.isNull("settledAt")) o.getLong("settledAt") else null,
                    )
                )
            }
        }
    }

    // ---- 清空数据（恢复前调用） ----

    /**
     * 清空所有表数据，用于从备份恢复前确保干净的覆盖。
     *
     * 清空顺序遵循外键依赖逆序：先删子表（transactions/recurring_rules/budgets/debts），
     * 再删父表（categories/accounts）。Transaction → Account 为 RESTRICT，
     * 若先删 accounts 会触发约束失败，因此必须先删 transactions。
     */
    private suspend fun clearAllData() {
        // 子表（有外键引用）
        transactionRepository.deleteAll()
        recurringRepository.deleteAll()
        budgetRepository.deleteAll()
        debtRepository.deleteAll()
        // 父表（被外键引用）
        categoryRepository.deleteAll()
        accountRepository.deleteAll()
    }
}
