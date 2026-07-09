package com.jiyibi.app.ui.transaction

import android.graphics.Bitmap
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.ml.ReceiptOcr
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 小票 OCR 结果处理：把 [ReceiptOcr] 识别出的原始文本与金额进一步加工为
 * 可直接填入交易表单的数据（金额 + 分类猜测）。
 *
 * 该类不持有任何状态，可在 Compose / ViewModel 中按需调用。
 */
@Singleton
class OcrResultHandler @Inject constructor(
    private val receiptOcr: ReceiptOcr,
) {

    /** 转发 [ReceiptOcr.recognize]：对小票 Bitmap 做中文 OCR。 */
    suspend fun recognize(bitmap: Bitmap): ReceiptOcr.Result = receiptOcr.recognize(bitmap)

    /**
     * 根据 OCR 识别出的原始文本猜测交易分类。
     *
     * 遍历 [categoryKeywords]，命中关键词后从 [currentCategories] 中查找同名分类，
     * 返回对应 [Category.id]；未命中返回 null。
     *
     * @param rawText OCR 原始文本
     * @param currentCategories 当前可用的分类列表（按当前交易类型筛选后的列表）
     */
    fun guessCategory(text: String, currentCategories: List<Category>): Long? {
        if (text.isBlank() || currentCategories.isEmpty()) return null
        val lower = text.lowercase()
        for ((catName, keywords) in categoryKeywords) {
            // 命中任一关键词：先按完整名称匹配分类，避免「餐饮」「餐」前缀冲突
            if (keywords.any { kw -> lower.contains(kw.lowercase()) }) {
                val matched = currentCategories.firstOrNull { it.name == catName }
                if (matched != null) return matched.id
            }
        }
        return null
    }
}

/**
 * 分类关键词字典：分类名称 → 关键词列表。
 *
 * 用于 [OcrResultHandler.guessCategory] 从 OCR 文本中识别消费场景。
 * 命中任一关键词即视为该分类。
 */
private val categoryKeywords: Map<String, List<String>> = mapOf(
    "餐饮" to listOf("餐", "饭", "店", "餐", "饮", "食", "coffee", "咖啡", "tea", "奶茶", "外卖", "美团", "饿了么", "小吃"),
    "交通" to listOf("车", "出租", "滴滴", "地铁", "公交", "高铁", "火车", "飞机", "票", "停车", "油"),
    "购物" to listOf("购", "买", "店", "商", "超市", "便利店", "京东", "淘宝", "拼多多", "亚马逊"),
    "娱乐" to listOf("影", "电影", "KTV", "游戏", "演唱会", "演出", "剧本", "密室"),
    "工资" to listOf("工资", "薪", "奖金", "绩效", "补贴"),
)