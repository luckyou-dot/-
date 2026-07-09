package com.jiyibi.app.di

import android.content.Context
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.jiyibi.app.core.database.AppDatabase
import com.jiyibi.app.core.database.dao.AccountDao
import com.jiyibi.app.core.database.dao.BudgetDao
import com.jiyibi.app.core.database.dao.CategoryDao
import com.jiyibi.app.core.database.dao.DebtDao
import com.jiyibi.app.core.database.dao.RecurringRuleDao
import com.jiyibi.app.core.database.dao.TransactionDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, AppDatabase.DB_NAME)
            .fallbackToDestructiveMigration() // 开发期，正式版需提供 Migration
            .addCallback(object : RoomDatabase.Callback() {
                // 首次创建数据库时预置默认账户与分类，避免「记一笔」页选择不到账户/分类
                override fun onCreate(db: SupportSQLiteDatabase) {
                    super.onCreate(db)
                    seedDefaultData(db)
                }
            })
            .build()

    /** 预置：4 个默认账户 + 8 个支出分类 + 4 个收入分类 */
    private fun seedDefaultData(db: SupportSQLiteDatabase) {
        val now = System.currentTimeMillis()

        // 默认账户：现金 / 支付宝 / 微信 / 银行卡
        listOf(
            Triple("现金", "CASH", 0xFF2E7D6F.toInt()),
            Triple("支付宝", "ALIPAY", 0xFF1976D2.toInt()),
            Triple("微信", "WECHAT", 0xFF00897B.toInt()),
            Triple("银行卡", "BANK", 0xFFFFB300.toInt()),
        ).forEachIndexed { idx, (name, type, color) ->
            db.execSQL(
                "INSERT INTO accounts (name, type, balance, initialBalance, color, sortOrder, archived, createdAt) " +
                    "VALUES ('$name', '$type', 0, 0, $color, $idx, 0, $now)",
            )
        }

        // 默认支出分类（含色值）
        val expenseCategories = listOf(
            Triple("餐饮", "Restaurant", 0xFFFF7043.toInt()),
            Triple("交通", "DirectionsCar", 0xFF42A5F5.toInt()),
            Triple("购物", "ShoppingBag", 0xFFAB47BC.toInt()),
            Triple("娱乐", "SportsEsports", 0xFF26A69A.toInt()),
            Triple("居住", "Home", 0xFF8D6E63.toInt()),
            Triple("医疗", "LocalHospital", 0xFFEF5350.toInt()),
            Triple("教育", "School", 0xFF5C6BC0.toInt()),
            Triple("其他", "Category", 0xFF78909C.toInt()),
        )
        expenseCategories.forEachIndexed { idx, (name, icon, color) ->
            db.execSQL(
                "INSERT INTO categories (name, kind, icon, color, sortOrder, builtin, archived) " +
                    "VALUES ('$name', 'EXPENSE', '$icon', $color, $idx, 1, 0)",
            )
        }

        // 默认收入分类（9 个，覆盖常见收入场景，含色值）
        val incomeCategories = listOf(
            Triple("工资", "Work", 0xFF66BB6A.toInt()),
            Triple("副业", "Business", 0xFF26C6DA.toInt()),
            Triple("理财收益", "TrendingUp", 0xFFFFCA28.toInt()),
            Triple("储蓄", "Savings", 0xFF7E57C2.toInt()),
            Triple("退款", "Undo", 0xFF42A5F5.toInt()),
            Triple("报销", "Paid", 0xFF9CCC65.toInt()),
            Triple("红包礼金", "CardGiftcard", 0xFFEC407A.toInt()),
            Triple("中奖", "EmojiEvents", 0xFFFFA726.toInt()),
            Triple("其他", "Category", 0xFF78909C.toInt()),
        )
        incomeCategories.forEachIndexed { idx, (name, icon, color) ->
            db.execSQL(
                "INSERT INTO categories (name, kind, icon, color, sortOrder, builtin, archived) " +
                    "VALUES ('$name', 'INCOME', '$icon', $color, $idx, 1, 0)",
            )
        }
    }

    @Provides fun transactionDao(db: AppDatabase): TransactionDao = db.transactionDao()
    @Provides fun accountDao(db: AppDatabase): AccountDao = db.accountDao()
    @Provides fun categoryDao(db: AppDatabase): CategoryDao = db.categoryDao()
    @Provides fun budgetDao(db: AppDatabase): BudgetDao = db.budgetDao()
    @Provides fun recurringRuleDao(db: AppDatabase): RecurringRuleDao = db.recurringRuleDao()
    @Provides fun debtDao(db: AppDatabase): DebtDao = db.debtDao()
}
