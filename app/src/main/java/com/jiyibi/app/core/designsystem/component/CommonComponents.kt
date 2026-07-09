package com.jiyibi.app.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.BreakfastDining
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.ChildCare
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Subscriptions
import androidx.compose.material.icons.filled.Work
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material.icons.filled.CurrencyExchange
import androidx.compose.material.icons.filled.Redeem
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/** 分类可选图标键名列表（用于分类管理图标选择网格） */
val CategoryIconKeys: List<String> = listOf(
    "Restaurant", "Fastfood", "BreakfastDining", "DirectionsCar", "ShoppingBag",
    "SportsEsports", "Home", "LocalHospital", "School", "HealthAndSafety",
    "Flight", "Pets", "ChildCare", "Subscriptions", "Payments", "Business",
    "Work", "Undo", "Category",
    // 收入类常用图标
    "Savings", "AccountBalanceWallet", "TrendingUp", "Paid", "CurrencyExchange",
    "Redeem", "CardGiftcard", "EmojiEvents", "SwapHoriz",
)

/**
 * 根据分类存储的图标键名解析为 Material [ImageVector]。
 * 未知键名回退到 [Icons.Filled.Category]。
 */
fun categoryIconByKey(key: String?): ImageVector = when (key) {
    "Restaurant" -> Icons.Filled.Restaurant
    "Fastfood" -> Icons.Filled.Fastfood
    "BreakfastDining" -> Icons.Filled.BreakfastDining
    "DirectionsCar" -> Icons.Filled.DirectionsCar
    "ShoppingBag" -> Icons.Filled.ShoppingBag
    "SportsEsports" -> Icons.Filled.SportsEsports
    "Home" -> Icons.Filled.Home
    "LocalHospital" -> Icons.Filled.LocalHospital
    "School" -> Icons.Filled.School
    "HealthAndSafety" -> Icons.Filled.HealthAndSafety
    "Flight" -> Icons.Filled.Flight
    "Pets" -> Icons.Filled.Pets
    "ChildCare" -> Icons.Filled.ChildCare
    "Subscriptions" -> Icons.Filled.Subscriptions
    "Payments" -> Icons.Filled.Payments
    "Business" -> Icons.Filled.Business
    "Work" -> Icons.Filled.Work
    "Undo" -> Icons.AutoMirrored.Filled.Undo
    "Savings" -> Icons.Filled.Savings
    "AccountBalanceWallet" -> Icons.Filled.AccountBalanceWallet
    "TrendingUp" -> Icons.Filled.TrendingUp
    "Paid" -> Icons.Filled.Paid
    "CurrencyExchange" -> Icons.Filled.CurrencyExchange
    "Redeem" -> Icons.Filled.Redeem
    "CardGiftcard" -> Icons.Filled.CardGiftcard
    "EmojiEvents" -> Icons.Filled.EmojiEvents
    "SwapHoriz" -> Icons.Filled.SwapHoriz
    else -> Icons.Filled.Category
}

/**
 * 通用脚手架：TopAppBar + 可选返回按钮 + 可选 actions。
 *
 * 用于二级页面统一头部样式，避免每个 Screen 重复写 Scaffold/TopAppBar 样板。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JiyibiScaffold(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "返回",
                            )
                        }
                    }
                },
                actions = actions,
            )
        }
    ) { padding ->
        content(padding)
    }
}

/**
 * 空状态占位：居中显示图标 + 标题 + 副标题 + 可选主按钮。
 */
@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    actionText: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )
            }
            if (actionText != null && onAction != null) {
                Button(onClick = onAction) { Text(actionText) }
            }
        }
    }
}

/**
 * 加载中状态：居中显示 CircularProgressIndicator。
 */
@Composable
fun LoadingState(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        CircularProgressIndicator()
    }
}

/**
 * 错误状态：居中错误图标 + 消息 + 可选「重试」按钮。
 */
@Composable
fun ErrorState(
    message: String,
    onRetry: (() -> Unit)? = null,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(
                imageVector = Icons.Filled.ErrorOutline,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.error,
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
            if (onRetry != null) {
                Button(onClick = onRetry) { Text("重试") }
            }
        }
    }
}

/**
 * 左滑删除容器：左滑到阈值时触发 onDelete。
 *
 * 背景显示红色 + 右侧删除图标，content 区域显示正常内容。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeToDeleteItem(
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    // 左滑（EndToStart 方向）到达阈值时回调 onDelete
    val dismissState = rememberSwipeToDismissBoxState(
        confirmValueChange = { value ->
            if (value == SwipeToDismissBoxValue.EndToStart) {
                onDelete()
                true
            } else {
                false
            }
        }
    )
    SwipeToDismissBox(
        state = dismissState,
        modifier = modifier,
        backgroundContent = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(Corner.large))
                    .background(MaterialTheme.colorScheme.error)
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterEnd,
            ) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "删除",
                    tint = MaterialTheme.colorScheme.onError,
                )
            }
        },
        content = { content() },
    )
}
