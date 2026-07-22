package com.jiyibi.app.core.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** DataStore 扩展属性：账户偏好独立 preferences 文件 */
private val Context.accountDataStore by preferencesDataStore(name = "account_preferences")

/**
 * 账户偏好仓库：持久化用户设置的「默认支出账户」和「默认收入账户」id。
 *
 * 通过 DataStore Preferences 存储账户 id（Long），未设置时返回 null。
 * 「记一笔」页面新建交易时读取对应默认账户 id 作为初始选中；
 * 「我的」页面提供入口让用户配置。
 *
 * 默认账户失效（被删除）时由消费方回退到账户列表第一个，本仓库不负责清理。
 */
@Singleton
class AccountPreferencesRepository @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        private val KEY_DEFAULT_EXPENSE_ACCOUNT = longPreferencesKey("default_expense_account_id")
        private val KEY_DEFAULT_INCOME_ACCOUNT = longPreferencesKey("default_income_account_id")
    }

    /** 默认支出账户 id Flow：未设置时为 null */
    val defaultExpenseAccountId: Flow<Long?> = context.accountDataStore.data.map { prefs ->
        prefs[KEY_DEFAULT_EXPENSE_ACCOUNT]
    }

    /** 默认收入账户 id Flow：未设置时为 null */
    val defaultIncomeAccountId: Flow<Long?> = context.accountDataStore.data.map { prefs ->
        prefs[KEY_DEFAULT_INCOME_ACCOUNT]
    }

    /** 持久化默认支出账户 id；传入 null 清除设置 */
    suspend fun setDefaultExpenseAccount(id: Long?) {
        context.accountDataStore.edit { prefs ->
            if (id == null) {
                prefs.remove(KEY_DEFAULT_EXPENSE_ACCOUNT)
            } else {
                prefs[KEY_DEFAULT_EXPENSE_ACCOUNT] = id
            }
        }
    }

    /** 持久化默认收入账户 id；传入 null 清除设置 */
    suspend fun setDefaultIncomeAccount(id: Long?) {
        context.accountDataStore.edit { prefs ->
            if (id == null) {
                prefs.remove(KEY_DEFAULT_INCOME_ACCOUNT)
            } else {
                prefs[KEY_DEFAULT_INCOME_ACCOUNT] = id
            }
        }
    }
}
