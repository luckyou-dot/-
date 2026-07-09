package com.jiyibi.app.core.common

import java.util.Calendar
import java.util.TimeZone

/**
 * 日期范围工具，用于日/周/月/年账单与预算周期。
 *
 * 所有方法返回 [start, end) 的 epoch millis（毫秒）。
 */
object TimeRange {

    private fun cal(): Calendar =
        Calendar.getInstance(TimeZone.getDefault()).apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

    /** 今日 [00:00, 次日 00:00) */
    fun today(): Pair<Long, Long> {
        val c = cal()
        val start = c.timeInMillis
        c.add(Calendar.DAY_OF_YEAR, 1)
        return start to c.timeInMillis
    }

    /** 本月 [月初, 下月初) */
    fun thisMonth(): Pair<Long, Long> {
        val c = cal().apply {
            set(Calendar.DAY_OF_MONTH, 1)
        }
        val start = c.timeInMillis
        c.add(Calendar.MONTH, 1)
        return start to c.timeInMillis
    }

    /** 本周 [周一, 下周一)，按 ISO 周一为首日 */
    fun thisWeek(): Pair<Long, Long> {
        val c = cal()
        val delta = (c.get(Calendar.DAY_OF_WEEK) + 5) % 7 // 周一=0
        c.add(Calendar.DAY_OF_YEAR, -delta)
        val start = c.timeInMillis
        c.add(Calendar.DAY_OF_YEAR, 7)
        return start to c.timeInMillis
    }

    /** 本年 [年初, 次年初) */
    fun thisYear(): Pair<Long, Long> {
        val c = cal().apply { set(Calendar.DAY_OF_YEAR, 1) }
        val start = c.timeInMillis
        c.add(Calendar.YEAR, 1)
        return start to c.timeInMillis
    }
}
