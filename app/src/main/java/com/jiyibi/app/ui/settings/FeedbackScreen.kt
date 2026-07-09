package com.jiyibi.app.ui.settings

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jiyibi.app.core.designsystem.component.Corner
import com.jiyibi.app.core.designsystem.component.GlassCard
import com.jiyibi.app.core.designsystem.component.Spacing
import com.jiyibi.app.core.designsystem.component.UnifiedCard
import com.jiyibi.app.core.designsystem.component.UnifiedCardVariant
import com.jiyibi.app.core.designsystem.theme.gradientBrush

/** 反馈收件邮箱 */
private const val FEEDBACK_EMAIL = "2745392461@qq.com"

/**
 * 意见反馈页：展示联系方式，引导用户自行通过邮箱反馈意见。
 * 点击邮箱行可复制到剪贴板，点击「发送邮件」可调起邮件应用。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("意见反馈") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = Spacing.l, vertical = Spacing.l),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // 顶部渐变 Hero 区：圆角渐变底 + 毛玻璃圆形图标 + 引导标题 + 引导文案（白色）
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(Corner.large))
                    .background(gradientBrush())
                    .padding(vertical = Spacing.xxl),
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(Spacing.s),
                ) {
                    // 毛玻璃圆形底包裹的邮箱图标（36dp 圆角 = 72dp 直径的一半，形成正圆）
                    GlassCard(
                        modifier = Modifier.size(72.dp),
                        cornerRadius = 36.dp,
                        contentPadding = PaddingValues(0.dp),
                    ) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Email,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(36.dp),
                            )
                        }
                    }
                    // 引导标题（白色加粗）
                    Text(
                        text = "欢迎反馈你的意见",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                    )
                    // 引导文案（白色半透明）
                    Text(
                        text = "你的每一条建议、问题或想法都是我们改进的动力。\n请通过以下方式联系我们，期待你的声音！",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.9f),
                        modifier = Modifier.padding(horizontal = Spacing.l),
                    )
                }
            }

            Spacer(Modifier.size(Spacing.l))

            // 邮箱联系卡：实心卡片，点击复制到剪贴板，文字用主题色保证可读
            UnifiedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        copyToClipboard(context, FEEDBACK_EMAIL)
                        Toast.makeText(context, "邮箱已复制", Toast.LENGTH_SHORT).show()
                    },
                variant = UnifiedCardVariant.ELEVATED,
                cornerRadius = Corner.large,
                contentPadding = PaddingValues(Spacing.l),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // 邮箱图标（主题色）
                    Icon(
                        imageVector = Icons.Filled.Email,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.size(Spacing.m))
                    Column(modifier = Modifier.weight(1f)) {
                        // 标签（次要文本色）
                        Text(
                            text = "邮箱",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        // 邮箱地址（主要文本色）
                        Text(
                            text = FEEDBACK_EMAIL,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                    }
                    // 复制图标（主题色）
                    Icon(
                        imageVector = Icons.Filled.ContentCopy,
                        contentDescription = "复制",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
            }

            Spacer(Modifier.size(Spacing.m))

            // 提示文案
            Text(
                text = "点击邮箱可复制，方便粘贴到任意渠道",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.size(Spacing.l))

            // 发送邮件按钮：主题色渐变，圆角，调起邮件应用
            UnifiedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { sendEmail(context) },
                variant = UnifiedCardVariant.GRADIENT,
                cornerRadius = Corner.large,
                contentPadding = PaddingValues(Spacing.l),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Send,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(Modifier.size(Spacing.s))
                    Text(
                        text = "发送邮件",
                        style = MaterialTheme.typography.titleSmall,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

/** 复制文本到剪贴板 */
private fun copyToClipboard(context: Context, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("记一笔反馈邮箱", text))
}

/** 调起邮件应用发送反馈，若无邮件应用则提示 */
private fun sendEmail(context: Context) {
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "message/rfc822"
        putExtra(Intent.EXTRA_EMAIL, arrayOf(FEEDBACK_EMAIL))
        putExtra(Intent.EXTRA_SUBJECT, "[记一笔反馈]")
    }
    if (intent.resolveActivity(context.packageManager) != null) {
        context.startActivity(Intent.createChooser(intent, "选择邮件应用"))
    } else {
        Toast.makeText(context, "未找到邮件应用，已为你复制邮箱", Toast.LENGTH_SHORT).show()
        copyToClipboard(context, FEEDBACK_EMAIL)
    }
}
