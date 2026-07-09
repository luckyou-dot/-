package com.jiyibi.app.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.jiyibi.app.core.database.dao.AccountDao
import com.jiyibi.app.core.database.dao.BudgetDao
import com.jiyibi.app.core.database.dao.CategoryDao
import com.jiyibi.app.core.database.dao.DebtDao
import com.jiyibi.app.core.database.dao.RecurringRuleDao
import com.jiyibi.app.core.database.dao.TransactionDao
import com.jiyibi.app.core.database.entity.AccountEntity
import com.jiyibi.app.core.database.entity.BudgetEntity
import com.jiyibi.app.core.database.entity.CategoryEntity
import com.jiyibi.app.core.database.entity.DebtEntity
import com.jiyibi.app.core.database.entity.RecurringRuleEntity
import com.jiyibi.app.core.database.entity.TransactionEntity

/**
 * Room 数据库，应用唯一数据源。
 *
 * 版本号自 1 起，后续 schema 变更需提供 Migration。
 */
@Database(
    entities = [
        TransactionEntity::class,
        AccountEntity::class,
        CategoryEntity::class,
        BudgetEntity::class,
        RecurringRuleEntity::class,
        DebtEntity::class,
    ],
    version = 2,
    exportSchema = true,
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun accountDao(): AccountDao
    abstract fun categoryDao(): CategoryDao
    abstract fun budgetDao(): BudgetDao
    abstract fun recurringRuleDao(): RecurringRuleDao
    abstract fun debtDao(): DebtDao

    companion object {
        const val DB_NAME = "jiyibi.db"
    }
}
