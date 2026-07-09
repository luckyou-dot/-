package com.jiyibi.app.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.jiyibi.app.core.database.entity.DebtEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DebtDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(debt: DebtEntity): Long

    @Query("DELETE FROM debts WHERE id = :id")
    suspend fun deleteById(id: Long)

    /** 清空所有借贷记录，用于从备份恢复前清空。 */
    @Query("DELETE FROM debts")
    suspend fun deleteAll()

    @Query("UPDATE debts SET settled = :settled, settledAt = :settledAt WHERE id = :id")
    suspend fun markSettled(id: Long, settled: Boolean, settledAt: Long?)

    @Query("SELECT * FROM debts WHERE settled = 0 ORDER BY createdAt DESC")
    fun observeUnsettled(): Flow<List<DebtEntity>>

    /** 所有借贷记录（含已结清），按创建时间倒序。用于借贷页保留已结清记录展示。 */
    @Query("SELECT * FROM debts ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<DebtEntity>>
}
