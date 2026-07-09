package com.jiyibi.app.ui.budget

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.LoadingState
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.domain.model.Category
import com.jiyibi.app.core.domain.model.centsToYuan
import kotlinx.coroutines.launch

/**
 * 新增/编辑预算页。
 *
 * - 月度总预算：覆盖当月所有支出
 * - 分类预算：针对单个支出分类设定额度
 *
 * 接近/超出阈值时由 WorkManager 推送通知（Task 8 接入）。
 *
 * 视觉结构：表单按 UnifiedCard(ELEVATED) 分为三组——类型选择、额度输入、提醒阈值。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BudgetEditScreen(
    onBack: () -> Unit,
    viewModel: BudgetEditViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // 当尝试新建月度总预算但本月已存在时，弹出确认框
    var showOverwriteConfirm by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (state.isNew) "添加预算" else "编辑预算") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        // 编辑模式：预算未加载完成时显示加载态
        if (!state.isNew && !state.initialized) {
            LoadingState(modifier = Modifier.padding(padding))
            return@Scaffold
        }

        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                // 页面边距 Spacing.l(16dp)，卡片间距 Spacing.m(12dp)
                .padding(horizontal = Spacing.l, vertical = Spacing.m),
            verticalArrangement = Arrangement.spacedBy(Spacing.m),
        ) {
            // 1. 类型选择组：月度总预算 / 分类预算，分类预算时附带分类下拉
            UnifiedCard(
                modifier = Modifier.fillMaxWidth(),
                variant = UnifiedCardVariant.ELEVATED,
                cornerRadius = Corner.large,
            ) {
                SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                    val options = listOf("月度总预算" to true, "分类预算" to false)
                    options.forEachIndexed { idx, (label, isTotal) ->
                        SegmentedButton(
                            selected = state.isTotal == isTotal,
                            onClick = { viewModel.updateType(isTotal) },
                            shape = SegmentedButtonDefaults.itemShape(idx, options.size),
                        ) {
                            Text(label)
                        }
                    }
                }

                // 分类预算模式：在类型选择下方追加分类下拉
                if (!state.isTotal) {
                    Spacer(Modifier.height(Spacing.m))
                    CategoryDropdown(
                        categories = state.categories,
                        selectedId = state.selectedCategoryId,
                        onSelect = { viewModel.updateCategory(it) },
                    )
                }
            }

            // 2. 额度输入组
            UnifiedCard(
                modifier = Modifier.fillMaxWidth(),
                variant = UnifiedCardVariant.ELEVATED,
                cornerRadius = Corner.large,
            ) {
                OutlinedTextField(
                    value = state.amountText,
                    onValueChange = {
                        viewModel.updateAmount(it.filter { ch -> ch.isDigit() || ch == '.' })
                    },
                    label = { Text("预算额度") },
                    prefix = { Text("¥") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                )
            }

            // 3. 提醒阈值组：当前百分比 + 主题色滑杆 + 说明文案
            UnifiedCard(
                modifier = Modifier.fillMaxWidth(),
                variant = UnifiedCardVariant.ELEVATED,
                cornerRadius = Corner.large,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                    Text(
                        "提醒阈值：${(state.threshold * 100).toInt()}%",
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    // 主题色滑杆：activeTrack 用 primary，inactiveTrack 用 primary 半透明作轨道色
                    Slider(
                        value = state.threshold,
                        onValueChange = { viewModel.updateThreshold(it) },
                        valueRange = 0.5f..1.0f,
                        colors = SliderDefaults.colors(
                            activeTrackColor = MaterialTheme.colorScheme.primary,
                            inactiveTrackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.24f),
                        ),
                    )

                }
            }

            Spacer(Modifier.height(Spacing.xs))

            // 4. 底部按钮：新建仅保存；编辑提供删除 + 保存
            val amountValid = state.amountText.toDoubleOrNull()?.let { it > 0 } ?: false
            val categoryValid = state.isTotal || state.selectedCategoryId != null

            if (state.isNew) {
                Button(
                    onClick = {
                        if (!amountValid || !categoryValid) {
                            scope.launch {
                                snackbarHostState.showSnackbar(
                                    if (!amountValid) "请输入大于 0 的额度" else "请选择分类",
                                )
                            }
                        } else if (state.isTotal && state.existingTotalBudget != null) {
                            // 新建月度总预算但本月已存在：弹窗确认是否覆盖
                            showOverwriteConfirm = true
                        } else {
                            viewModel.save(onBack)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("保存")
                }
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.m),
                ) {
                    TextButton(
                        onClick = { viewModel.delete(onBack) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("删除", color = MaterialTheme.colorScheme.error)
                    }
                    Button(
                        onClick = {
                            if (!amountValid || !categoryValid) {
                                scope.launch {
                                    snackbarHostState.showSnackbar(
                                        if (!amountValid) "请输入大于 0 的额度" else "请选择分类",
                                    )
                                }
                            } else {
                                viewModel.save(onBack)
                            }
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("保存")
                    }
                }
            }
        }
    }

    // 覆盖月度总预算确认对话框
    if (showOverwriteConfirm) {
        val existingAmount = state.existingTotalBudget?.amountLimit?.centsToYuan()?.toPlainString() ?: "0"
        AlertDialog(
            onDismissRequest = { showOverwriteConfirm = false },
            title = { Text("本月预算已存在") },
            text = {
                Text("本月已设置月度总预算 ¥$existingAmount，是否更改为新额度？")
            },
            confirmButton = {
                TextButton(onClick = {
                    showOverwriteConfirm = false
                    viewModel.save(onBack)
                }) { Text("确认更改") }
            },
            dismissButton = {
                TextButton(onClick = { showOverwriteConfirm = false }) { Text("取消") }
            },
        )
    }
}

/** 分类下拉选择 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategoryDropdown(
    categories: List<Category>,
    selectedId: Long?,
    onSelect: (Long) -> Unit,
) {
    val selected = categories.firstOrNull { it.id == selectedId }
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
    ) {
        OutlinedTextField(
            value = selected?.name ?: "请选择分类",
            onValueChange = { },
            readOnly = true,
            label = { Text("分类") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
        )
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
        ) {
            categories.forEach { cat ->
                DropdownMenuItem(
                    text = { Text(cat.name) },
                    onClick = {
                        onSelect(cat.id)
                        expanded = false
                    },
                )
            }
        }
    }
}
