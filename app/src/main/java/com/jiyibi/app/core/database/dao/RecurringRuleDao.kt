package com.jiyibi.app.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.jiyibi.app.core.database.entity.RecurringRuleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RecurringRuleDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(rule: RecurringRuleEntity): Long

    @Query("DELETE FROM recurring_rules WHERE id = :id")
    suspend fun deleteById(id: Long)

    /** 清空所有周期规则，用于从备份恢复前清空。 */
    @Query("DELETE FROM recurring_rules")
    suspend fun deleteAll()

    @Query("SELECT * FROM recurring_rules ORDER BY enabled DESC, nextRunAt")
    fun observeAll(): Flow<List<RecurringRuleEntity>>

    /** 查询已到点需要执行/提醒的规则。 */
    @Query("SELECT * FROM recurring_rules WHERE enabled = 1 AND nextRunAt <= :now")
    suspend fun getDue(now: Long): List<RecurringRuleEntity>

    @Query("UPDATE recurring_rules SET nextRunAt = :nextRunAt WHERE id = :id")
    suspend fun updateNextRun(id: Long, nextRunAt: Long)
}
