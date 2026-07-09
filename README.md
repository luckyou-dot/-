# 记一笔 (JiYiBi)

一款基于 Kotlin + Jetpack Compose 的 Android 个人记账应用。采用 Material 3 设计语言，支持多主题切换、OCR 小票识别、周期性记账、预算管理、债务追踪等丰富功能。

## 功能特性

### 记账核心

- **收支记录**：支持支出、收入、转账三种交易类型，以「分」为精度存储避免浮点误差
- **OCR 小票识别**：集成 ML Kit 中文文字识别，拍照自动提取小票/发票金额，快速完成记账
- **多账户管理**：支持现金、支付宝、微信、银行卡、信用卡等多种账户类型，独立维护余额
- **分类体系**：预置 8 个支出分类 + 9 个收入分类，支持自定义分类，每个分类独立图标与配色
- **标签系统**：为交易添加自定义标签，灵活归类

### 预算管理

- **总预算与分类预算**：支持设置月度总预算或按分类设定预算上限
- **超支预警**：预算进度达 80% 时自动变色提醒，超支后红色高亮
- **首页预算进度**：Hero 区实时显示本月预算使用进度

### 统计分析

- **多维度统计**：支持日、周、月、年四种统计周期
- **分类饼图**：按分类汇总收支占比
- **趋势折线图**：展示收支随时间变化趋势
- **月度柱状图**：对比各月收支情况
- **日历热力图**：首页展示当月每日支出强度，点击可查看当日明细

### 周期性记账

- **自动记账**：支持按日、周、月、年设置周期性交易规则
- **自动入账**：开启 autoRecord 后，WorkManager 后台自动执行到期规则并调整账户余额
- **灵活间隔**：可自定义执行间隔（如每 2 周、每 3 个月）

### 债务管理

- **借出 / 欠入**：区分「别人欠我」和「我欠别人」两种方向
- **到期提醒**：支持设置还款日期
- **结清标记**：一键标记债务已结清

### 其他功能

- **年度回顾**：生成年度账单海报，支持分享
- **数据导出**：CSV 格式导出交易记录，兼容 Excel 直接打开
- **搜索功能**：按备注、分类、金额等条件快速检索交易
- **多主题切换**：内置多套主题配色（薄荷清新、经典蓝等），支持深色模式
- **桌面小组件**：基于 Glance 的 App Widget，桌面快捷查看今日支出

## 技术架构

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Kotlin 2.0 |
| UI 框架 | Jetpack Compose + Material 3 |
| 数据库 | Room 2.6 |
| 依赖注入 | Hilt 2.51 |
| 注解处理 | KSP 2.0 |
| 后台任务 | WorkManager 2.9 |
| OCR | ML Kit Text Recognition (Chinese) |
| 图表 | Vico 2.0 |
| 图片加载 | Coil 2.6 |
| 桌面组件 | Glance 1.1 |
| 偏好存储 | DataStore Preferences |
| 二维码 | ZXing 3.5 |

### 架构模式

采用 **MVVM + Clean Architecture** 分层架构：

```
com.jiyibi.app/
├── core/                    # 核心层
│   ├── backup/              # 数据导出（CSV）
│   ├── common/              # 通用工具（TimeRange）
│   ├── data/                # 数据层实现
│   │   └── repository/      # Repository 实现
│   ├── database/            # Room 数据库
│   │   ├── dao/             # 数据访问对象
│   │   └── entity/          # 数据库实体
│   ├── designsystem/        # 设计系统
│   │   ├── component/       # 通用组件（GlassCard, AnimatedNumber 等）
│   │   └── theme/           # 主题配色与排版
│   ├── domain/              # 领域层
│   │   ├── model/           # 领域模型与枚举
│   │   └── repository/      # Repository 接口
│   ├── ml/                  # 机器学习（OCR）
│   └── work/                # 后台任务（周期记账）
├── di/                      # Hilt 依赖注入模块
├── nav/                     # 导航路由定义
└── ui/                      # UI 层
    ├── account/             # 账户管理
    ├── backup/              # 备份导出
    ├── budget/              # 预算管理
    ├── category/            # 分类管理
    ├── debt/                # 债务管理
    ├── home/                # 首页
    ├── recurring/           # 周期性记账
    ├── search/              # 搜索
    ├── settings/            # 设置（主题/关于/反馈）
    ├── statistics/          # 统计分析
    ├── tag/                 # 标签管理
    ├── transaction/         # 交易编辑
    └── yearreview/          # 年度回顾
```

### 数据模型

应用使用 6 张核心数据表：

| 实体 | 说明 |
|------|------|
| `TransactionEntity` | 交易记录（支出/收入/转账） |
| `AccountEntity` | 账户（含余额、类型、颜色） |
| `CategoryEntity` | 分类（含图标、颜色、内置标记） |
| `BudgetEntity` | 预算（支持总预算和分类预算） |
| `RecurringRuleEntity` | 周期性记账规则 |
| `DebtEntity` | 债务记录 |

### 设计系统

- **GlassCard**：毛玻璃效果卡片，用于首页 Hero 区
- **UnifiedCard**：统一卡片组件，支持 ELEVATED / FILLED / OUTLINED 三种变体
- **AnimatedNumber**：数字滚动动效组件
- **AnimatedProgressIndicator**：进度条动效组件
- **SwipeToDeleteItem**：滑动删除列表项
- **EmptyState**：空状态占位组件
- **渐变背景**：基于 LocalGradientColors 的主题渐变系统

## 环境要求

- Android Studio Hedgehog (2023.1.1) 或更高版本
- JDK 17
- Android SDK 34（compileSdk / targetSdk）
- minSdk 26（Android 8.0）

## 构建与运行

```bash
# 克隆项目
git clone https://github.com/luckyou-dot/-.git
cd jiyibi

# 构建 Debug APK
./gradlew assembleDebug

# 安装到连接的设备
./gradlew installDebug
```

## 项目结构

```
├── app/                          # 应用模块
│   ├── build.gradle.kts          # 应用级构建配置
│   ├── proguard-rules.pro        # 混淆规则
│   └── src/main/
│       ├── AndroidManifest.xml   # 应用清单
│       ├── java/                 # Kotlin 源码
│       └── res/                  # 资源文件
├── design-preview/               # 设计预览（HTML）
├── gradle/
│   ├── libs.versions.toml        # 版本目录
│   └── wrapper/                  # Gradle Wrapper
├── build.gradle.kts              # 项目级构建配置
├── settings.gradle.kts           # 项目设置
└── gradle.properties             # Gradle 属性
```

## 权限说明

| 权限 | 用途 |
|------|------|
| `CAMERA` | 拍照识别小票/发票（OCR） |

## 预置数据

首次安装时自动初始化：

- **4 个默认账户**：现金、支付宝、微信、银行卡
- **8 个支出分类**：餐饮、交通、购物、娱乐、居住、医疗、教育、其他
- **9 个收入分类**：工资、副业、理财收益、储蓄、退款、报销、红包礼金、中奖、其他

## License

本项目仅供个人学习使用。
