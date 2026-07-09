package com.jiyibi.app.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.jiyibi.app.core.database.entity.BudgetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BudgetDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(budget: BudgetEntity): Long

    @Query("DELETE FROM budgets WHERE id = :id")
    suspend fun deleteById(id: Long)

    /** 清空所有预算，用于从备份恢复前清空。 */
    @Query("DELETE FROM budgets")
    suspend fun deleteAll()

    /** 周期内生效的预算（含月度总预算与分类预算）。 */
    @Query(
        "SELECT * FROM budgets WHERE periodStart <= :now AND periodEnd >= :now"
    )
    fun observeActive(now: Long): Flow<List<BudgetEntity>>
}
