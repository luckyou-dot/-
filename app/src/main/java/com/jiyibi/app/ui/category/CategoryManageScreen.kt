package com.jiyibi.app.ui.category

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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.EmptyState
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.component.listItemEnterAnimation
import com.jiyibi.app.core.designsystem.component.CategoryIconKeys
import com.jiyibi.app.core.designsystem.component.categoryIconByKey
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.CategoryKind

/** 预设颜色：红 / 橙 / 黄 / 绿 / 蓝 / 紫 */
private val PresetColors = listOf(
    Color(0xFFE53935),
    Color(0xFFFB8C00),
    Color(0xFFFDD835),
    Color(0xFF43A047),
    Color(0xFF1E88E5),
    Color(0xFF8E24AA),
)

/** 编辑对话框承载的状态：null 表示当前未显示。 */
private sealed class DialogState {
    data class New(val kind: CategoryKind) : DialogState()
    data class Edit(val category: Category) : DialogState()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryManageScreen(onBack: () -> Unit, viewModel: CategoryManageViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // 当前显示的对话框（新增 / 编辑 / 删除确认）
    var editDialog by remember { mutableStateOf<DialogState?>(null) }
    var pendingDelete by remember { mutableStateOf<Category?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("分类管理") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "返回",
                        )
                    }
                },
            )
        },
        floatingActionButton = {
            // FAB：新增分类，默认进入支出新增
            FloatingActionButton(onClick = { editDialog = DialogState.New(CategoryKind.EXPENSE) }) {
                Icon(Icons.Filled.Add, contentDescription = "新增分类")
            }
        },
    ) { padding ->
        val total = state.expenseCategories.size + state.incomeCategories.size
        if (total == 0 && !state.isLoading) {
            EmptyState(
                icon = Icons.Filled.Category,
                title = "暂无分类",
                subtitle = "点击右下角按钮添加第一个分类",
            )
        } else {
            // 列表：支出/收入两组各自用 UnifiedCard(ELEVATED) 包裹
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(Spacing.l),
                verticalArrangement = Arrangement.spacedBy(Spacing.m),
            ) {
                // 支出分类组
                item {
                    UnifiedCard(
                        modifier = Modifier.fillMaxWidth(),
                        variant = UnifiedCardVariant.ELEVATED,
                    ) {
                        SectionHeader(text = "支出分类")
                        state.expenseCategories.forEachIndexed { index, category ->
                            CategoryRow(
                                category = category,
                                index = index,
                                onClick = { editDialog = DialogState.Edit(category) },
                                onDelete = { pendingDelete = category },
                            )
                            // 行间分隔线（最后一项不画）
                            if (index < state.expenseCategories.lastIndex) {
                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                            }
                        }
                    }
                }
                // 收入分类组
                item {
                    UnifiedCard(
                        modifier = Modifier.fillMaxWidth(),
                        variant = UnifiedCardVariant.ELEVATED,
                    ) {
                        SectionHeader(text = "收入分类")
                        state.incomeCategories.forEachIndexed { index, category ->
                            CategoryRow(
                                category = category,
                                index = index,
                                onClick = { editDialog = DialogState.Edit(category) },
                                onDelete = { pendingDelete = category },
                            )
                            if (index < state.incomeCategories.lastIndex) {
                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                            }
                        }
                    }
                }
            }
        }
    }

    // 新增/编辑对话框
    editDialog?.let { state2 ->
        when (state2) {
            is DialogState.New -> CategoryEditDialog(
                mode = EditDialogMode.New,
                initialName = "",
                initialKind = state2.kind,
                initialIcon = "",
                initialColor = PresetColors.first(),
                onDismiss = { editDialog = null },
                onSave = { name, kind, icon, color ->
                    viewModel.saveCategory(
                        id = null,
                        name = name,
                        kind = kind,
                        icon = icon,
                        color = color,
                        builtin = false,
                    ) { editDialog = null }
                },
            )
            is DialogState.Edit -> CategoryEditDialog(
                mode = EditDialogMode.Edit(state2.category),
                initialName = state2.category.name,
                initialKind = state2.category.kind,
                initialIcon = state2.category.icon,
                initialColor = Color(state2.category.color),
                onDismiss = { editDialog = null },
                onSave = { name, kind, icon, color ->
                    // 编辑模式：传 id 走 UPDATE；保留 builtin 标记
                    viewModel.saveCategory(
                        id = state2.category.id,
                        name = name,
                        kind = kind,
                        icon = icon,
                        color = color,
                        builtin = state2.category.builtin,
                    ) { editDialog = null }
                },
            )
        }
    }

    // 删除确认对话框
    pendingDelete?.let { category ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("确认删除此分类？") },
            text = { Text("将删除「${category.name}」，删除后无法恢复。") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteCategory(category.id)
                    pendingDelete = null
                }) { Text("删除") }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("取消") }
            },
        )
    }
}

/** 列表段落标题：组卡内的小标题。 */
@Composable
private fun SectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(bottom = Spacing.s),
    )
}

/**
 * 单个分类项：组卡内的一行
 *
 * - 左：圆形渐变底图标（分类色 → 半透明，Brush.linearGradient）
 * - 中：分类名 + 「内置」/「自定义」标签
 * - 右：非内置显示删除按钮；内置隐藏删除按钮
 * - 点击行：弹出编辑对话框
 * - 入场动画：listItemEnterAnimation(index) 淡入 + 从下方位移
 *
 * @param index 在组内的序号，用于错开入场动画延迟
 */
@Composable
private fun CategoryRow(
    category: Category,
    index: Int,
    onClick: () -> Unit,
    onDelete: () -> Unit,
) {
    val categoryColor = Color(category.color)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .listItemEnterAnimation(index)
            .clip(RoundedCornerShape(Corner.medium))
            .clickable { onClick() }
            .padding(vertical = Spacing.s),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 左：圆形渐变底图标（分类色 → 半透明）
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(
                        listOf(categoryColor, categoryColor.copy(alpha = 0.15f))
                    )
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = categoryIconByKey(category.icon),
                contentDescription = null,
                tint = Color.White,
            )
        }
        Spacer(modifier = Modifier.size(Spacing.m))
        // 中：分类名 + 标签
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = category.name,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = if (category.builtin) "内置" else "自定义",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        // 右：删除按钮（内置不显示）
        if (!category.builtin) {
            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "删除",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

/** 编辑对话框模式：新增 / 编辑（编辑模式禁用 kind 切换） */
private sealed class EditDialogMode {
    data object New : EditDialogMode()
    data class Edit(val category: Category) : EditDialogMode()
}

/**
 * 新增/编辑对话框。
 *
 * - 名称：OutlinedTextField
 * - 归属：SegmentedButton（支出/收入），编辑模式禁用
 * - 图标：6 列圆形图标网格，圆形主题色底，选中加描边
 * - 颜色：6 个预设色块，点击选中
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategoryEditDialog(
    mode: EditDialogMode,
    initialName: String,
    initialKind: CategoryKind,
    initialIcon: String,
    initialColor: Color,
    onDismiss: () -> Unit,
    onSave: (name: String, kind: CategoryKind, icon: String, color: Int) -> Unit,
) {
    var name by remember { mutableStateOf(initialName) }
    var kind by remember { mutableStateOf(initialKind) }
    var icon by remember { mutableStateOf(initialIcon) }
    var selectedColor by remember { mutableStateOf(initialColor) }

    val isEditMode = mode is EditDialogMode.Edit
    val title = if (isEditMode) "编辑分类" else "新增分类"

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.m)) {
                // 名称
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("分类名称") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )

                // 归属（支出/收入）：编辑模式禁用
                SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                    CategoryKind.values().forEachIndexed { idx, k ->
                        SegmentedButton(
                            selected = kind == k,
                            onClick = { if (!isEditMode) kind = k },
                            enabled = !isEditMode,
                            shape = SegmentedButtonDefaults.itemShape(idx, CategoryKind.values().size),
                        ) {
                            Text(if (k == CategoryKind.EXPENSE) "支出" else "收入")
                        }
                    }
                }

                // 图标选择网格：圆形主题色底，选中加描边
                Text(
                    text = "图标",
                    style = MaterialTheme.typography.labelLarge,
                )
                LazyVerticalGrid(
                    columns = GridCells.Fixed(6),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 180.dp),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.s),
                    verticalArrangement = Arrangement.spacedBy(Spacing.s),
                ) {
                    items(CategoryIconKeys, key = { it }) { key ->
                        val isSelected = key == icon
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isSelected) selectedColor.copy(alpha = 0.2f)
                                    else MaterialTheme.colorScheme.surfaceVariant,
                                )
                                .then(
                                    if (isSelected) {
                                        Modifier.border(2.dp, selectedColor, CircleShape)
                                    } else {
                                        Modifier
                                    },
                                )
                                .clickable { icon = key },
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                imageVector = categoryIconByKey(key),
                                contentDescription = key,
                                tint = if (isSelected) selectedColor
                                       else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(22.dp),
                            )
                        }
                    }
                }

                // 颜色：6 个预设色块，点击选中
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
                                    }
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
                    val finalIcon = icon.ifBlank { "Category" }
                    onSave(name.trim(), kind, finalIcon, selectedColor.toArgb())
                },
                enabled = name.trim().isNotEmpty(),
            ) { Text("保存") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("取消") }
        },
    )
}
