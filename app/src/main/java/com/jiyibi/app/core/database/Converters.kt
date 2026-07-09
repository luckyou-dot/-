package com.jiyibi.app.core.database

import androidx.room.TypeConverter
import org.json.JSONArray

/**
 * Room 类型转换器。
 *
 * tags 字段在数据库中以 JSON 数组字符串存储，业务层使用 List<String>。
 */
class Converters {

    @TypeConverter
    fun tagsToString(tags: List<String>): String {
        val arr = JSONArray()
        tags.forEach { arr.put(it) }
        return arr.toString()
    }

    @TypeConverter
    fun stringToTags(value: String): List<String> {
        if (value.isBlank()) return emptyList()
        val arr = JSONArray(value)
        return (0 until arr.length()).map { arr.getString(it) }
    }
}
