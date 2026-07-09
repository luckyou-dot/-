package com.jiyibi.app.ui.tag

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Label
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.JiyibiScaffold
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.theme.ExpenseRed
import com.jiyibi.app.core.designsystem.theme.IncomeGreen
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.model.centsToYuan
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 标签管理二级页：聚合所有交易的 tags 字段，展示标签 + 关联交易数。
 * 点击标签可展开/折叠该标签下的关联交易列表。
 * 数据来源：TransactionRepository（不新建 TagDao）。
 */
@Composable
fun TagManageScreen(
    onBack: () -> Unit,
    viewModel: TagManageViewModel = hiltViewModel(),
) {
    val tags by viewModel.tags.collectAsStateWithLifecycle()
    val expandedTag by viewModel.expandedTag.collectAsStateWithLifecycle()
    val tagTransactions by viewModel.tagTransactions.collectAsStateWithLifecycle()
    val dateFormat = remember { SimpleDateFormat("MM-dd HH:mm", Locale.getDefault()) }

    JiyibiScaffold(
        title = "标签管理",
        onBack = onBack,
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            // 空状态
            if (tags.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "暂无标签，记账时添加标签后会在此显示",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                return@Column
            }
            // 标签列表（含展开区）
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(Spacing.l),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                itemsIndexed(tags, key = { _, it -> it.name }) { index, tag ->
                    val isExpanded = expandedTag == tag.name
                    UnifiedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .listItemEnterAnimation(index)
                            .clickable { viewModel.toggleTag(tag.name) },
                        variant = UnifiedCardVariant.ELEVATED,
                        cornerRadius = Corner.large,
                        contentPadding = PaddingValues(Spacing.m),
                    ) {
                        // 标签行：圆形主题色图标底 + 名称 + 半透明胶囊笔数 + 展开箭头
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(Spacing.m),
                        ) {
                            // 圆形主题色底图标
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primaryContainer),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.Label,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp),
                                )
                            }
                            // 标签名称
                            Text(
                                text = tag.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.weight(1f),
                            )
                            // 半透明胶囊：关联交易笔数
                            Box(
                                modifier = Modifier
                                    .clip(Corner.full)
                                    .background(
                                        MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                                    )
                                    .padding(horizontal = Spacing.s, vertical = Spacing.xs),
                            ) {
                                Text(
                                    text = "${tag.count} 笔",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Medium,
                                )
                            }
                            // 展开/折叠箭头
                            Icon(
                                imageVector = if (isExpanded) {
                                    Icons.Filled.ExpandLess
                                } else {
                                    Icons.Filled.ExpandMore
                                },
                                contentDescription = if (isExpanded) "折叠" else "展开",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }

                        // 展开后：该标签下的关联交易列表（淡入 + 纵向展开组合动画）
                        AnimatedVisibility(
                            visible = isExpanded,
                            enter = expandVertically() + fadeIn(),
                            exit = shrinkVertically() + fadeOut(),
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = Spacing.m),
                                verticalArrangement = Arrangement.spacedBy(Spacing.xs),
                            ) {
                                if (isExpanded && expandedTag == tag.name) {
                                    if (tagTransactions.isEmpty()) {
                                        Text(
                                            "暂无关联交易",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(vertical = Spacing.s),
                                        )
                                    } else {
                                        tagTransactions.forEach { tx ->
                                            TagTransactionRow(
                                                type = tx.type,
                                                amount = tx.amount,
                                                note = tx.note,
                                                date = tx.date,
                                                dateFormat = dateFormat,
                                            )
                                            HorizontalDivider(
                                                color = MaterialTheme.colorScheme.outlineVariant,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/** 单条交易行：左日期+备注，右金额（收入绿/支出红） */
@Composable
private fun TagTransactionRow(
    type: TransactionType,
    amount: Long,
    note: String,
    date: Long,
    dateFormat: SimpleDateFormat,
) {
    val isIncome = type == TransactionType.INCOME
    val prefix = if (isIncome) "+" else "-"
    val color = if (isIncome) IncomeGreen else ExpenseRed
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 40.dp)
            .padding(vertical = Spacing.xs),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = note.ifBlank { if (isIncome) "收入" else "支出" },
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
            )
            Text(
                text = dateFormat.format(Date(date)),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Text(
            text = "$prefix ¥${amount.centsToYuan().toPlainString()}",
            style = MaterialTheme.typography.bodyMedium,
            color = color,
            fontWeight = FontWeight.Medium,
        )
    }
}
