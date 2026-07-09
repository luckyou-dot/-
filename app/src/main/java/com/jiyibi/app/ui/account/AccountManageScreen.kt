package com.jiyibi.app.ui.account

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
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
import com.jiyibi.app.core.designsystem.theme.gradientBrush
import com.jiyibi.app.core.domain.model.Account
import com.jiyibi.app.core.domain.model.AccountType
import com.jiyibi.app.core.domain.model.centsToYuan
import com.jiyibi.app.core.domain.model.yuanToCents

/** 预设颜色：墨绿 / 蓝 / 红 / 琥珀 / 紫 / 青绿 */
private val PresetColors = listOf(
    Color(0xFF2E7D6F),
    Color(0xFF1976D2),
    Color(0xFFE53935),
    Color(0xFFFFB300),
    Color(0xFF8E24AA),
    Color(0xFF00897B),
)

/** 账户类型 → 图标。 */
private fun AccountType.icon(): ImageVector = when (this) {
    AccountType.CASH -> Icons.Filled.AccountBalanceWallet
    AccountType.BANK -> Icons.Filled.AccountBalance
    AccountType.ALIPAY -> Icons.Filled.Payment
    AccountType.WECHAT -> Icons.Filled.Payments
    AccountType.CREDIT_CARD -> Icons.Filled.CreditCard
    AccountType.OTHER -> Icons.Filled.Wallet
}

/** 账户类型 → 中文标签。 */
private fun AccountType.label(): String = when (this) {
    AccountType.CASH -> "现金"
    AccountType.BANK -> "银行卡"
    AccountType.ALIPAY -> "支付宝"
    AccountType.WECHAT -> "微信"
    AccountType.CREDIT_CARD -> "信用卡"
    AccountType.OTHER -> "其他"
}

/** 编辑对话框承载的状态：null 表示当前未显示。 */
private sealed class DialogState {
    data object New : DialogState()
    data class Edit(val account: Account) : DialogState()
}

/**
 * 账户管理页：总资产卡片 + 账户列表 + 新增/编辑/删除。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountManageScreen(
    onBack: () -> Unit,
    viewModel: AccountManageViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // 当前显示的对话框（新增 / 编辑 / 删除确认）
    var editDialog by remember { mutableStateOf<DialogState?>(null) }
    var pendingDelete by remember { mutableStateOf<Account?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    // 监听删除失败事件（账户下有交易记录）
    LaunchedEffect(Unit) {
        viewModel.deleteError.collect { event ->
            when (event) {
                is AccountDeleteEvent.HasTransactions -> {
                    snackbarHostState.showSnackbar("该账户下有交易记录，无法删除")
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("账户管理") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            // FAB 保持
            FloatingActionButton(onClick = { editDialog = DialogState.New }) {
                Icon(Icons.Filled.Add, contentDescription = "新增账户")
            }
        },
    ) { padding ->
        if (state.accounts.isEmpty() && !state.isLoading) {
            // 空状态
            Box(modifier = Modifier.padding(padding)) {
                EmptyState(
                    icon = Icons.Filled.AccountBalanceWallet,
                    title = "还没有账户",
                    subtitle = "点击右下角按钮添加第一个账户",
                    actionText = "添加账户",
                    onAction = { editDialog = DialogState.New },
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                // 边距与间距统一使用设计令牌
                contentPadding = PaddingValues(Spacing.l),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                // 1. 顶部渐变总览卡片
                item { TotalBalanceCard(state.totalBalance) }

                // 2. 账户列表标题
                item {
                    Text(
                        text = "我的账户",
                        style = MaterialTheme.typography.titleMedium,
                    )
                }

                // 3. 账户行（带进入动画）
                itemsIndexed(state.accounts, key = { _, acc -> acc.id }) { index, acc ->
                    AccountRow(
                        account = acc,
                        index = index,
                        onClick = { editDialog = DialogState.Edit(acc) },
                        onDelete = { pendingDelete = acc },
                    )
                }
            }
        }
    }

    // 新增/编辑对话框
    editDialog?.let { state2 ->
        when (state2) {
            is DialogState.New -> AccountEditDialog(
                initial = null,
                onDismiss = { editDialog = null },
                onSave = { name, type, balance, color ->
                    viewModel.saveAccount(
                        id = null,
                        name = name,
                        type = type,
                        balance = balance,
                        color = color,
                    ) { editDialog = null }
                },
            )
            is DialogState.Edit -> AccountEditDialog(
                initial = state2.account,
                onDismiss = { editDialog = null },
                onSave = { name, type, balance, color ->
                    // 编辑模式：传 id 走 UPDATE
                    viewModel.saveAccount(
                        id = state2.account.id,
                        name = name,
                        type = type,
                        balance = balance,
                        color = color,
                    ) { editDialog = null }
                },
            )
        }
    }

    // 删除确认对话框
    pendingDelete?.let { acc ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("确认删除此账户？") },
            text = { Text("将删除「${acc.name}」，删除后无法恢复。") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteAccount(acc.id)
                    pendingDelete = null
                }) { Text("删除", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("取消") }
            },
        )
    }
}

/**
 * 顶部渐变总资产卡片：Box.background(gradientBrush()) + 圆角，
 * 总资产数字用 [AnimatedNumber]（等宽字体、白色，原 IncomeGreen 改白）。
 */
@Composable
private fun TotalBalanceCard(totalBalance: Long) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Corner.large))
            .background(gradientBrush()),
    ) {
        Column(Modifier.padding(Spacing.l)) {
            Text(
                text = "总资产",
                style = MaterialTheme.typography.labelMedium,
                color = Color.White.copy(alpha = 0.85f),
            )
            Spacer(Modifier.height(Spacing.xs))
            // 等宽字体 + 白色数字滚动动效
            AnimatedNumber(
                targetValue = totalBalance.centsToYuan().toDouble(),
                prefix = "¥",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontFamily = FontFamily.Monospace,
                ),
                color = Color.White,
            )
        }
    }
}

/**
 * 单个账户行：UnifiedCard(ELEVATED) + 进入动画。
 *
 * - 左：圆形渐变图标底（账户色 → 半透明，Brush.linearGradient），白色图标
 * - 中：账户名 titleMedium + 类型 labelSmall + 余额 bodyMedium
 * - 右：编辑 / 删除按钮
 */
@Composable
private fun AccountRow(
    account: Account,
    index: Int,
    onClick: () -> Unit,
    onDelete: () -> Unit,
) {
    UnifiedCard(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index)
            .clickable { onClick() },
        variant = UnifiedCardVariant.ELEVATED,
        cornerRadius = Corner.large,
        contentPadding = PaddingValues(Spacing.m),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.m),
        ) {
            // 左：圆形渐变底（账户色 → 半透明）+ 白色图标
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(
                                Color(account.color),
                                Color(account.color).copy(alpha = 0.4f),
                            )
                        )
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = account.type.icon(),
                    contentDescription = null,
                    tint = Color.White,
                )
            }
            // 中：账户名 + 类型 + 余额
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = account.name,
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    text = account.type.label(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    text = "余额 ¥${account.balance.centsToYuan().toPlainString()}",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            // 右：编辑 / 删除
            IconButton(onClick = onClick) {
                Icon(Icons.Filled.Edit, contentDescription = "编辑")
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = "删除")
            }
        }
    }
}

/**
 * 新增/编辑账户对话框。
 *
 * - 名称 OutlinedTextField
 * - 类型 ExposedDropdownMenuBox（6 选项）
 * - 初始余额 OutlinedTextField（keyboardType=Decimal，prefix ¥）
 * - 颜色：6 个预设色块
 * - 「保存」+「取消」
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AccountEditDialog(
    initial: Account?,
    onDismiss: () -> Unit,
    onSave: (name: String, type: AccountType, balance: Long, color: Int) -> Unit,
) {
    var name by remember { mutableStateOf(initial?.name ?: "") }
    var type by remember { mutableStateOf(initial?.type ?: AccountType.CASH) }
    var balanceText by remember {
        mutableStateOf(initial?.balance?.centsToYuan()?.toPlainString() ?: "")
    }
    var selectedColor by remember {
        mutableStateOf(initial?.color?.let { Color(it) } ?: PresetColors.first())
    }
    var typeExpanded by remember { mutableStateOf(false) }

    val nameValid = name.isNotBlank()
    val balanceValid = balanceText.toDoubleOrNull()?.let { it >= 0 } ?: false
    val canSave = nameValid && balanceValid

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (initial == null) "新增账户" else "编辑账户") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                // 名称
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("账户名称") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )

                // 类型下拉（6 选项）
                ExposedDropdownMenuBox(
                    expanded = typeExpanded,
                    onExpandedChange = { typeExpanded = it },
                ) {
                    OutlinedTextField(
                        value = type.label(),
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("账户类型") },
                        trailingIcon = {
                            ExposedDropdownMenuDefaults.TrailingIcon(expanded = typeExpanded)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                    )
                    DropdownMenu(
                        expanded = typeExpanded,
                        onDismissRequest = { typeExpanded = false },
                    ) {
                        AccountType.values().forEach { t ->
                            DropdownMenuItem(
                                text = { Text(t.label()) },
                                onClick = {
                                    type = t
                                    typeExpanded = false
                                },
                            )
                        }
                    }
                }

                // 初始余额
                OutlinedTextField(
                    value = balanceText,
                    onValueChange = {
                        balanceText = it.filter { ch -> ch.isDigit() || ch == '.' }
                    },
                    label = { Text(if (initial == null) "初始余额" else "余额") },
                    prefix = { Text("¥") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                )

                // 颜色：6 个预设色块
                Text(
                    text = "颜色",
                    style = MaterialTheme.typography.labelLarge,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.s),
                ) {
                    PresetColors.forEach { color ->
                        val isSelected = color == selectedColor
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(color)
                                .then(
                                    if (isSelected) {
                                        Modifier.border(2.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                    } else {
                                        Modifier
                                    },
                                )
                                .clickable { selectedColor = color },
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val cents = balanceText.toDoubleOrNull()?.yuanToCents() ?: 0L
                    onSave(name.trim(), type, cents, selectedColor.toArgb())
                },
                enabled = canSave,
            ) { Text("保存") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("取消") }
        },
    )
}
