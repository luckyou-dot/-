package com.jiyibi.app.ui.recurring

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.EmptyState
import com.jiyibi.app.core.designsystem.component.LoadingState
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.theme.ExpenseRed
import com.jiyibi.app.core.designsystem.theme.IncomeGreen
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.RecurringFrequency
import com.jiyibi.app.core.domain.model.RecurringRule
import com.jiyibi.app.core.domain.model.TransactionType
import com.jiyibi.app.core.domain.model.centsToYuan
import com.jiyibi.app.core.domain.model.yuanToCents
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** 频率中文标签：DAILY=每日, WEEKLY=每周, MONTHLY=每月, YEARLY=每年 */
private fun RecurringFrequency.label(): String = when (this) {
    RecurringFrequency.DAILY -> "每日"
    RecurringFrequency.WEEKLY -> "每周"
    RecurringFrequency.MONTHLY -> "每月"
    RecurringFrequency.YEARLY -> "每年"
}

/**
 * 周期性记账列表页。
 *
 * 展示所有 RecurringRule，支持新增/编辑（对话框）、暂停/启用（状态胶囊）、删除（确认对话框）。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecurringListScreen(
    onBack: () -> Unit,
    viewModel: RecurringListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // 新增/编辑对话框状态：非 null 表示对话框已打开
    var editingRule by remember { mutableStateOf<RecurringRule?>(null) }
    // 删除确认对话框
    var confirmDelete by remember { mutableStateOf<RecurringRule?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("周期性记账") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { editingRule = newRule() }) {
                Icon(Icons.Filled.Add, contentDescription = "添加")
            }
        },
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            when {
                state.isLoading -> LoadingState()
                state.rules.isEmpty() -> EmptyState(
                    icon = Icons.Filled.Repeat,
                    title = "还没有周期性记账",
                    subtitle = "点击右下角添加",
                    actionText = "添加",
                    onAction = { editingRule = newRule() },
                )
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    // 列表边距 16dp，项间间距 12dp
                    contentPadding = PaddingValues(Spacing.l),
                    verticalArrangement = Arrangement.spacedBy(Spacing.m),
                ) {
                    // 列表项：逐项入场动画（淡入 + 向上位移，按 index 错开延迟）
                    itemsIndexed(state.rules, key = { _, rule -> rule.id }) { index, rule ->
                        // 根据 accountId / categoryId 查找账户名和分类名
                        val accountName = state.accounts
                            .firstOrNull { it.id == rule.accountId }?.name
                        val categoryName = (if (rule.type == TransactionType.EXPENSE)
                            state.expenseCategories else state.incomeCategories)
                            .firstOrNull { it.id == rule.categoryId }?.name
                        RuleRow(
                            rule = rule,
                            accountName = accountName,
                            categoryName = categoryName,
                            onToggle = { viewModel.toggleEnabled(rule.id, rule) },
                            onToggleAutoRecord = { viewModel.toggleAutoRecord(rule) },
                            onEdit = { editingRule = rule },
                            onDelete = { confirmDelete = rule },
                            modifier = Modifier.listItemEnterAnimation(index),
                        )
                    }
                }
            }
        }
    }

    // 新增/编辑对话框
    editingRule?.let { rule ->
        RuleEditDialog(
            rule = rule,
            accounts = state.accounts,
            expenseCategories = state.expenseCategories,
            incomeCategories = state.incomeCategories,
            onDismiss = { editingRule = null },
            onSave = { saved ->
                viewModel.saveRule(saved) { editingRule = null }
            },
        )
    }

    // 删除确认对话框
    confirmDelete?.let { rule ->
        AlertDialog(
            onDismissRequest = { confirmDelete = null },
            title = { Text("删除周期性记账") },
            text = { Text("确定删除「${rule.title}」吗？") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteRule(rule.id)
                    confirmDelete = null
                }) { Text("删除", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { confirmDelete = null }) { Text("取消") }
            },
        )
    }
}

/** 构造一条默认的新规则（id=0 表示新建）。 */
private fun newRule(): RecurringRule = RecurringRule(
    id = 0L,
    title = "",
    amount = 0L,
    type = TransactionType.EXPENSE,
    accountId = 0L,
    categoryId = null,
    frequency = RecurringFrequency.MONTHLY,
    interval = 1,
    nextRunAt = System.currentTimeMillis(),
    autoRecord = false,
    enabled = true,
)

/**
 * 单条规则卡片（UnifiedCard ELEVATED）：
 * - Row1 标题 + 金额(支出红/收入绿) + 下次执行日(labelSmall)
 * - Row2 频率 + 自动记账 Switch（可直接点击切换）
 * - Row3 账户/分类信息
 * - Row4 半透明胶囊状态「启用/暂停」(点击切换) + 编辑 IconButton + 删除 IconButton
 *
 * @param modifier 外部修饰符，用于叠加列表入场动画
 */
@Composable
private fun RuleRow(
    rule: RecurringRule,
    accountName: String?,
    categoryName: String?,
    onToggle: () -> Unit,
    onToggleAutoRecord: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    // 金额按类型语义色：支出红 / 收入绿
    val amountColor = if (rule.type == TransactionType.EXPENSE) ExpenseRed else IncomeGreen
    // 状态色：启用为绿、暂停为灰
    val statusColor = if (rule.enabled) IncomeGreen
    else MaterialTheme.colorScheme.onSurfaceVariant

    UnifiedCard(
        modifier = modifier.fillMaxWidth(),
        variant = UnifiedCardVariant.ELEVATED,
    ) {
        // 第一行：标题 + 金额 + 下次执行日
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = rule.title.ifBlank { "未命名" },
                    style = MaterialTheme.typography.titleMedium,
                )
                Spacer(Modifier.height(Spacing.xs))
                Text(
                    "下次执行：${dateFormat.format(Date(rule.nextRunAt))}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            // 金额使用等宽字体，颜色按类型语义
            Text(
                "¥${rule.amount.centsToYuan().toPlainString()}",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontFamily = FontFamily.Monospace,
                ),
                color = amountColor,
            )
        }

        Spacer(Modifier.height(Spacing.s))

        // 第二行：频率 + 自动记账 Switch
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "频率：${rule.frequency.label()}每${rule.interval}",
                style = MaterialTheme.typography.bodyMedium,
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
            ) {
                Text(
                    "自动记账",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                // 直接点击切换自动记账，无需打开编辑对话框
                Switch(
                    checked = rule.autoRecord,
                    onCheckedChange = { onToggleAutoRecord() },
                )
            }
        }

        Spacer(Modifier.height(Spacing.xs))

        // 账户 / 分类信息行（如未配置则显示提示）
        val accountText = accountName ?: "未指定账户"
        val categoryText = categoryName ?: "未指定分类"
        Text(
            text = "账户：$accountText · 分类：$categoryText",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(Modifier.height(Spacing.s))

        // 第三行：半透明胶囊状态标签（点击切换 enabled） + 编辑 + 删除
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // 半透明胶囊状态标签：替代原 AssistChip，启用绿色、暂停灰色，整颗胶囊可点击切换
            Box(
                modifier = Modifier
                    .clip(Corner.full)
                    .background(statusColor.copy(alpha = 0.15f))
                    .clickable { onToggle() }
                    .padding(horizontal = Spacing.m, vertical = Spacing.xs),
            ) {
                Text(
                    text = if (rule.enabled) "启用" else "暂停",
                    color = statusColor,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
            Row {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Filled.Edit, contentDescription = "编辑")
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "删除")
                }
            }
        }
    }
}

/**
 * 新增/编辑对话框：标题、金额、类型(支出/收入)、账户、分类、频率、间隔、下次执行日、自动记账。
 *
 * 表单控件按「基本信息 / 账户分类 / 频率与日期 / 自动记账」分组，
 * 每组以 UnifiedCard(OUTLINED) 包裹，外层再用 UnifiedCard(ELEVATED) 承载标题与所有分组。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RuleEditDialog(
    rule: RecurringRule,
    accounts: List<Account>,
    expenseCategories: List<Category>,
    incomeCategories: List<Category>,
    onDismiss: () -> Unit,
    onSave: (RecurringRule) -> Unit,
) {
    // 表单状态：以 rule 为 key，切换 rule 时重新初始化
    var title by remember(rule) { mutableStateOf(rule.title) }
    var amountText by remember(rule) {
        mutableStateOf(if (rule.id == 0L) "" else rule.amount.centsToYuan().toPlainString())
    }
    var type by remember(rule) { mutableStateOf(rule.type) }
    var accountId by remember(rule) { mutableStateOf(rule.accountId) }
    var categoryId by remember(rule) { mutableStateOf(rule.categoryId) }
    var frequency by remember(rule) { mutableStateOf(rule.frequency) }
    var intervalText by remember(rule) { mutableStateOf(rule.interval.toString()) }
    var nextRunAt by remember(rule) { mutableStateOf(rule.nextRunAt) }
    var autoRecord by remember(rule) { mutableStateOf(rule.autoRecord) }

    var freqExpanded by remember { mutableStateOf(false) }
    var accountExpanded by remember { mutableStateOf(false) }
    var categoryExpanded by remember { mutableStateOf(false) }
    var showDatePicker by remember { mutableStateOf(false) }
    val datePickerState = rememberDatePickerState(initialSelectedDateMillis = nextRunAt)
    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }

    // 切换类型时清空 categoryId（避免类型切换后分类不匹配）
    val availableCategories = if (type == TransactionType.EXPENSE) expenseCategories else incomeCategories
    val categoryValid = availableCategories.any { it.id == categoryId }
    val effectiveCategoryId = if (categoryValid) categoryId else null

    // 基本校验：标题非空、金额大于 0、已选账户
    val amountValid = amountText.toDoubleOrNull()?.let { it > 0 } ?: false
    val canSave = title.isNotBlank() && amountValid && accountId > 0L

    Dialog(onDismissRequest = onDismiss) {
        // 外层 ELEVATED 卡片：承载标题与所有分组
        UnifiedCard(
            modifier = Modifier.fillMaxWidth(),
            variant = UnifiedCardVariant.ELEVATED,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 600.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                Text(
                    if (rule.id == 0L) "新增周期性记账" else "编辑周期性记账",
                    style = MaterialTheme.typography.titleMedium,
                )

                // 分组卡 1：基本信息（标题、金额、类型）
                UnifiedCard(variant = UnifiedCardVariant.OUTLINED) {
                    Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                        // 标题
                        OutlinedTextField(
                            value = title,
                            onValueChange = { title = it },
                            label = { Text("标题") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                        )

                        // 金额
                        OutlinedTextField(
                            value = amountText,
                            onValueChange = { amountText = it.filter { ch -> ch.isDigit() || ch == '.' } },
                            label = { Text("金额") },
                            prefix = { Text("¥") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                        )

                        // 类型：支出 / 收入
                        SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                            val options = listOf(
                                TransactionType.EXPENSE to "支出",
                                TransactionType.INCOME to "收入",
                            )
                            options.forEachIndexed { idx, (t, label) ->
                                SegmentedButton(
                                    selected = type == t,
                                    onClick = {
                                        type = t
                                        // 切换类型后清空分类选择
                                        categoryId = 0L
                                    },
                                    shape = SegmentedButtonDefaults.itemShape(idx, options.size),
                                ) { Text(label) }
                            }
                        }
                    }
                }

                // 分组卡 2：账户与分类
                UnifiedCard(variant = UnifiedCardVariant.OUTLINED) {
                    Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                        // 账户下拉
                        ExposedDropdownMenuBox(
                            expanded = accountExpanded,
                            onExpandedChange = { accountExpanded = it },
                        ) {
                            OutlinedTextField(
                                value = accounts.firstOrNull { it.id == accountId }?.name
                                    ?: "选择账户",
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("账户") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = accountExpanded)
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                            )
                            DropdownMenu(
                                expanded = accountExpanded,
                                onDismissRequest = { accountExpanded = false },
                            ) {
                                accounts.forEach { acc ->
                                    DropdownMenuItem(
                                        text = { Text("${acc.name}（¥${acc.balance.centsToYuan().toPlainString()}）") },
                                        onClick = {
                                            accountId = acc.id
                                            accountExpanded = false
                                        },
                                    )
                                }
                            }
                        }

                        // 分类下拉
                        ExposedDropdownMenuBox(
                            expanded = categoryExpanded,
                            onExpandedChange = { categoryExpanded = it },
                        ) {
                            OutlinedTextField(
                                value = availableCategories.firstOrNull { it.id == effectiveCategoryId }?.name
                                    ?: "选择分类（可选）",
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("分类") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded)
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                            )
                            DropdownMenu(
                                expanded = categoryExpanded,
                                onDismissRequest = { categoryExpanded = false },
                            ) {
                                availableCategories.forEach { cat ->
                                    DropdownMenuItem(
                                        text = { Text(cat.name) },
                                        onClick = {
                                            categoryId = cat.id
                                            categoryExpanded = false
                                        },
                                    )
                                }
                            }
                        }
                    }
                }

                // 分组卡 3：频率 / 间隔 / 下次执行日
                UnifiedCard(variant = UnifiedCardVariant.OUTLINED) {
                    Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                        // 频率下拉：日 / 周 / 月 / 年
                        ExposedDropdownMenuBox(
                            expanded = freqExpanded,
                            onExpandedChange = { freqExpanded = it },
                        ) {
                            OutlinedTextField(
                                value = frequency.label(),
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("频率") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = freqExpanded)
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                            )
                            DropdownMenu(
                                expanded = freqExpanded,
                                onDismissRequest = { freqExpanded = false },
                            ) {
                                RecurringFrequency.values().forEach { f ->
                                    DropdownMenuItem(
                                        text = { Text(f.label()) },
                                        onClick = {
                                            frequency = f
                                            freqExpanded = false
                                        },
                                    )
                                }
                            }
                        }

                        // 间隔
                        OutlinedTextField(
                            value = intervalText,
                            onValueChange = { intervalText = it.filter { ch -> ch.isDigit() } },
                            label = { Text("间隔") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                        )

                        // 下次执行日：只读输入框 + 日历图标 → DatePickerDialog
                        OutlinedTextField(
                            value = dateFormat.format(Date(nextRunAt)),
                            onValueChange = { },
                            readOnly = true,
                            label = { Text("下次执行日") },
                            trailingIcon = {
                                IconButton(onClick = { showDatePicker = true }) {
                                    Icon(Icons.Filled.CalendarMonth, contentDescription = "选择日期")
                                }
                            },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                // 分组卡 4：自动记账开关
                UnifiedCard(variant = UnifiedCardVariant.OUTLINED) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("自动记账")
                        Switch(checked = autoRecord, onCheckedChange = { autoRecord = it })
                    }
                }

                // 保存 / 取消
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.m),
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                    ) { Text("取消") }
                    Button(
                        onClick = {
                            val cents = amountText.toDoubleOrNull()?.yuanToCents() ?: 0L
                            val intervalInt = intervalText.toIntOrNull()?.coerceAtLeast(1) ?: 1
                            onSave(
                                rule.copy(
                                    title = title.trim(),
                                    amount = cents,
                                    type = type,
                                    accountId = accountId,
                                    categoryId = effectiveCategoryId,
                                    frequency = frequency,
                                    interval = intervalInt,
                                    nextRunAt = nextRunAt,
                                    autoRecord = autoRecord,
                                ),
                            )
                        },
                        enabled = canSave,
                        modifier = Modifier.weight(1f),
                    ) { Text("保存") }
                }
            }
        }
    }

    // 日期选择器
    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                Button(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { nextRunAt = it }
                        showDatePicker = false
                    },
                ) { Text("确定") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("取消") }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}
