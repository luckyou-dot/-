package com.jiyibi.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 收支分类：餐饮、交通、购物、娱乐、工资等，支持自定义。
 *
 * - kind：EXPENSE / INCOME
 * - icon：Material 图标 key，UI 层解析为 ImageVector
 * - builtin：预设分类（不可删除）与自定义分类
 */
@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val kind: String,           // CategoryKind 名称
    val icon: String,           // Material Icons 名称
    val color: Int = 0,
    val sortOrder: Int = 0,
    val builtin: Boolean = false,
    val archived: Boolean = false,
)
