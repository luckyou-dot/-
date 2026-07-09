package com.jiyibi.app.ui.debt

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Handshake
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.AnimatedNumber
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.EmptyState
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.theme.ExpenseRed
import com.jiyibi.app.core.designsystem.theme.IncomeGreen
import com.jiyibi.app.core.designsystem.theme.gradientBrush
import com.jiyibi.app.core.domain.model.Debt
import com.jiyibi.app.core.domain.model.DebtDirection
import com.jiyibi.app.core.domain.model.centsToYuan
import com.jiyibi.app.core.domain.model.yuanToCents
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 借贷记录页：合并展示所有借贷记录（谁欠我 + 我欠谁），按创建时间倒序排列。
 *
 * 每条记录通过方向标识（绿色「收」/ 红色「付」）区分。
 * 支持新增借贷（FAB）、标记结清、删除（带二次确认）。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DebtListScreen(
    onBack: () -> Unit,
    viewModel: DebtListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // 对话框状态
    var showEditDialog by remember { mutableStateOf(false) }
    var deleteTarget by remember { mutableLongStateOf(-1L) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("借贷记录") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showEditDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "新增借贷")
            }
        },
    ) { padding ->
        if (state.debts.isEmpty()) {
            EmptyState(
                icon = Icons.Filled.Handshake,
                title = "还没有借贷记录",
                subtitle = "点击右下角添加",
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(Spacing.l),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                // 顶部渐变汇总卡
                item { DebtSummaryCard(state) }

                // 列表项：逐项入场动画
                itemsIndexed(state.debts, key = { _, debt -> debt.id }) { index, debt ->
                    DebtRow(
                        debt = debt,
                        onToggleSettled = { viewModel.toggleSettled(debt) },
                        onDelete = { deleteTarget = debt.id },
                        modifier = Modifier.listItemEnterAnimation(index),
                    )
                }
            }
        }
    }

    // 新增借贷对话框
    if (showEditDialog) {
        DebtEditDialog(
            onDismiss = { showEditDialog = false },
            onConfirm = { counterparty, direction, amount, note, dueDate ->
                viewModel.saveDebt(counterparty, direction, amount, note, dueDate) {
                    showEditDialog = false
                }
            },
        )
    }

    // 删除确认对话框
    if (deleteTarget > 0L) {
        AlertDialog(
            onDismissRequest = { deleteTarget = -1L },
            title = { Text("删除借贷记录") },
            text = { Text("确定删除这条借贷记录吗？此操作不可撤销。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteDebt(deleteTarget)
                        deleteTarget = -1L
                    },
                ) {
                    Text("删除", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { deleteTarget = -1L }) {
                    Text("取消")
                }
            },
        )
    }
}

/**
 * 顶部渐变汇总卡：使用主题渐变色作为背景，
 * 待收/待付两栏以等宽白色 AnimatedNumber 展示，
 * 净额用半透明白底胶囊（毛玻璃风格）包裹，数字使用语义色。
 */
@Composable
private fun DebtSummaryCard(state: DebtListUiState) {
    val net = state.totalOwedToMe - state.totalOwedByMe
    val netLabel = if (net >= 0) "净待收" else "净待付"
    val netValue = if (net >= 0) net else -net
    val netColor = if (net >= 0) IncomeGreen else ExpenseRed

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Corner.large))
            .background(gradientBrush())
            .padding(Spacing.l),
    ) {
        Column {
            // 标题
            Text(
                text = "借贷汇总",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
            )
            Spacer(Modifier.height(Spacing.m))

            // 待收 / 待付 两栏，数字使用等宽白色 AnimatedNumber
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    // 方向标签：半透明白底胶囊（毛玻璃风格，在渐变上）
                    GlassChip(text = "收", textColor = Color.White)
                    Spacer(Modifier.height(Spacing.xs))
                    Text(
                        text = "待收（别人欠我）",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.8f),
                    )
                    AnimatedNumber(
                        targetValue = state.totalOwedToMe.centsToYuan().toDouble(),
                        prefix = "¥",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontFamily = FontFamily.Monospace,
                        ),
                        color = Color.White,
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    GlassChip(text = "付", textColor = Color.White)
                    Spacer(Modifier.height(Spacing.xs))
                    Text(
                        text = "待付（我欠别人）",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.8f),
                    )
                    AnimatedNumber(
                        targetValue = state.totalOwedByMe.centsToYuan().toDouble(),
                        prefix = "¥",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontFamily = FontFamily.Monospace,
                        ),
                        color = Color.White,
                    )
                }
            }

            Spacer(Modifier.height(Spacing.m))

            // 净额：半透明白底胶囊 + 语义色动画数字
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(Corner.full)
                    .background(Color.White.copy(alpha = 0.2f))
                    .padding(horizontal = Spacing.l, vertical = Spacing.s),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = netLabel,
                    style = MaterialTheme.typography.labelLarge,
                    color = Color.White,
                )
                AnimatedNumber(
                    targetValue = netValue.centsToYuan().toDouble(),
                    prefix = "¥",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontFamily = FontFamily.Monospace,
                    ),
                    color = netColor,
                )
            }
        }
    }
}

/**
 * 半透明白底胶囊（毛玻璃风格）：用于在渐变背景上展示简短标签。
 */
@Composable
private fun GlassChip(
    text: String,
    textColor: Color,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(Corner.full)
            .background(Color.White.copy(alpha = 0.25f))
            .padding(horizontal = Spacing.s, vertical = Spacing.xs),
    ) {
        Text(
            text = text,
            color = textColor,
            style = MaterialTheme.typography.labelSmall,
        )
    }
}

/**
 * 单条借贷记录：UnifiedCard（ELEVATED）内展示对方、金额、到期日、状态、备注，及操作按钮。
 *
 * 已结清项：对方姓名与金额加划线，显示结清时间，按钮变为「取消结清」。
 * 方向标签与状态标签使用半透明语义色胶囊（毛玻璃风格）替代原 AssistChip。
 */
@Composable
private fun DebtRow(
    debt: Debt,
    onToggleSettled: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val isOwedToMe = debt.direction == DebtDirection.OWED_TO_ME
    val amountColor = if (isOwedToMe) IncomeGreen else ExpenseRed
    val amountPrefix = if (isOwedToMe) "+" else "-"
    val directionLabel = if (isOwedToMe) "收" else "付"
    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    // 已结清时文字加划线
    val textDecoration = if (debt.settled) TextDecoration.LineThrough else TextDecoration.None

    UnifiedCard(
        modifier = modifier.fillMaxWidth(),
        variant = UnifiedCardVariant.ELEVATED,
    ) {
        // 第一行：方向标签（半透明胶囊）+ 对方姓名 + 金额（带正负号与颜色，已结清加划线）
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // 方向标签：半透明语义色胶囊（毛玻璃风格）
                Box(
                    modifier = Modifier
                        .clip(Corner.full)
                        .background(amountColor.copy(alpha = 0.15f))
                        .padding(horizontal = Spacing.s, vertical = Spacing.xs),
                ) {
                    Text(
                        text = directionLabel,
                        color = amountColor,
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
                Spacer(Modifier.width(Spacing.s))
                Text(
                    text = debt.counterparty,
                    style = MaterialTheme.typography.titleMedium,
                    textDecoration = textDecoration,
                    color = if (debt.settled) MaterialTheme.colorScheme.onSurfaceVariant
                    else MaterialTheme.colorScheme.onSurface,
                )
            }
            Text(
                text = "$amountPrefix ¥${debt.amount.centsToYuan().toPlainString()}",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontFamily = FontFamily.Monospace,
                ),
                color = if (debt.settled) MaterialTheme.colorScheme.onSurfaceVariant else amountColor,
                textDecoration = textDecoration,
            )
        }

        Spacer(Modifier.height(Spacing.xs))

        // 第二行：到期日 + 状态胶囊
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (debt.dueDate != null) {
                Text(
                    text = "到期：${dateFormat.format(Date(debt.dueDate))}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                Spacer(Modifier.height(0.dp))
            }
            // 状态胶囊：半透明语义色
            val statusColor = if (debt.settled) IncomeGreen
            else MaterialTheme.colorScheme.onSurfaceVariant
            Box(
                modifier = Modifier
                    .clip(Corner.full)
                    .background(statusColor.copy(alpha = 0.15f))
                    .padding(horizontal = Spacing.s, vertical = Spacing.xs),
            ) {
                Text(
                    text = if (debt.settled) "已结清" else "未结清",
                    color = statusColor,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
        }

        // 已结清时显示结清时间
        if (debt.settled && debt.settledAt != null) {
            Spacer(Modifier.height(Spacing.xs))
            Text(
                text = "已于 ${dateFormat.format(Date(debt.settledAt))} 结清",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        // 备注（仅在有内容时展示）
        if (debt.note.isNotBlank()) {
            Spacer(Modifier.height(Spacing.s))
            Text(
                text = debt.note,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        Spacer(Modifier.height(Spacing.s))

        // 操作行：结清/取消结清按钮 + 删除图标
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = onToggleSettled) {
                Text(if (debt.settled) "取消结清" else "标记已结清")
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = "删除")
            }
        }
    }
}

/**
 * 新增借贷对话框：填写对方姓名、方向、金额、到期日、备注后保存。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DebtEditDialog(
    onDismiss: () -> Unit,
    onConfirm: (counterparty: String, direction: DebtDirection, amount: Long, note: String, dueDate: Long?) -> Unit,
) {
    var counterparty by remember { mutableStateOf("") }
    var direction by remember { mutableStateOf(DebtDirection.OWED_TO_ME) }
    var amountText by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var dueDate by remember { mutableLongStateOf(0L) }    // 0 表示未选择
    var showDatePicker by remember { mutableStateOf(false) }

    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    val amountValid = amountText.toDoubleOrNull()?.let { it > 0 } ?: false
    val canSave = counterparty.isNotBlank() && amountValid

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("新增借贷") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                // 对方姓名
                OutlinedTextField(
                    value = counterparty,
                    onValueChange = { counterparty = it },
                    label = { Text("对方姓名") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )

                // 方向：别人欠我 / 我欠别人
                SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                    val options = listOf(
                        "别人欠我" to DebtDirection.OWED_TO_ME,
                        "我欠别人" to DebtDirection.OWED_BY_ME,
                    )
                    options.forEachIndexed { idx, (label, dir) ->
                        SegmentedButton(
                            selected = direction == dir,
                            onClick = { direction = dir },
                            shape = SegmentedButtonDefaults.itemShape(idx, options.size),
                        ) {
                            Text(label)
                        }
                    }
                }

                // 金额（Decimal 键盘 + ¥ 前缀）
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it.filter { ch -> ch.isDigit() || ch == '.' } },
                    label = { Text("金额") },
                    prefix = { Text("¥") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                )

                // 到期日（只读，点击 trailingIcon 弹 DatePickerDialog）
                OutlinedTextField(
                    value = if (dueDate > 0) dateFormat.format(Date(dueDate)) else "",
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("到期日") },
                    singleLine = true,
                    trailingIcon = {
                        IconButton(onClick = { showDatePicker = true }) {
                            Icon(Icons.Filled.CalendarMonth, contentDescription = "选择日期")
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                )

                // 备注
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("备注") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    // 元转分
                    val cents = amountText.toDoubleOrNull()?.yuanToCents() ?: 0L
                    onConfirm(
                        counterparty.trim(),
                        direction,
                        cents,
                        note,
                        if (dueDate > 0) dueDate else null,
                    )
                },
                enabled = canSave,
            ) {
                Text("保存")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("取消") }
        },
    )

    // 日期选择器
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = if (dueDate > 0) dueDate else System.currentTimeMillis(),
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { dueDate = it }
                        showDatePicker = false
                    },
                ) {
                    Text("确定")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("取消") }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}
