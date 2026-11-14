# QA 报告：阶段 11（1–4）娱乐设施 / 灯箱缩放 / 图片整改 / 城市地图（qa-stage11）

> 测试日期：2026-11-14 · 测试环境：http://127.0.0.1:8080/ · 工作目录：`D:\VibeCoding\出来去哪玩`
> 测试人：lead（自测 + 浏览器回归）· 任务：阶段 11 第 1–4 项验收

## QA 结论

**阶段 11 第 1–4 项可以交付。**

- 第 1 项娱乐设施品类：7 个细分类（KTV / 剧本杀 / 密室逃脱 / 桌游 / 电玩城 / 影院 / Livehouse）在首页、去哪、发布、详情、种子数据全链路贯通，共 7/7 分类筛选与抽签通过。
- 第 2 项灯箱滚轮缩放：1.0×–4.0× 上下限、滚轮/按钮/键盘缩放、放大后拖动、双击与复位按钮复位、遮罩/×/Esc 关闭全部通过；点图片不误关。
- 第 3 项图片匹配整改：种子引用的 86 张图片全部存在，既有 14 个地点封面/图库逐条复核并替换，CREDITS 已同步。
- 第 4 项城市地图体验重做：高德 JS API 2.0 成功加载（`window.AMap` 可用，`.map-stage-canvas.is-amap`），默认全城视野 fitView（4 个城市聚合点，当前数量 10/8/8/20），城市切换后按城市聚合（杭州 10、成都 8、上海 8、广州 20），聚合点击下钻与标记点击卡片联动均通过；Leaflet/OSM/SVG 三级降级保留。
- 浏览器 console 无 error；`node --check` 全部 JS 通过；当前种子基线 46 地点（杭州 10 / 成都 8 / 上海 8 / 广州 20），5 用户、4 搭子、13 打卡、142 条评论（114 条带图）。

## 1. 环境与测试数据

| 项 | 内容 |
|---|---|
| 被测地址 | `http://127.0.0.1:8080/` |
| 浏览器 | DSH 内置 Chromium；DSH browser session |
| 基线数据 | 重置演示数据后：46 个地点、5 个用户、4 个搭子、13 条 checkins、142 条评论（114 条带图） |
| 分类计数 | ktv/script/escape/board/arcade/cinema/livehouse 各 1 个 |
| 静态检查 | `node --check` 全部 JS 通过（fail=0） |
| 清理 | 测试结束前 `W.Store.reset()`；最终 46 地点、u1 当前用户、城市筛选 all、分类 all |

## 2. 第 1 项：娱乐设施品类逐项结果

| 检查点 | 结果 | 证据 |
|---|---|---|
| 分类枚举 | **PASS** | `W.UI.categories` 含 all/food/fun/ktv/script/escape/board/arcade/cinema/livehouse/nature/photo/night/other；7 个娱乐分类均标 `group:'play'` |
| 首页双行筛选 | **PASS** | 第一行按题材 6 类 + 全部；第二行娱乐设施 7 类；点 KTV/剧本杀/密室逃脱/桌游/电玩城/影院/Livehouse 各返回 1 张卡，且卡片 category 与 chip 一致（s15–s21） |
| 首页城市切换 | **PASS** | 分类为「全部」时：杭州 10、成都 8、上海 8、广州 20、全部城市 46（阶段 11 测试时广州为 4、总数 21，后续广州及内容扩充） |
| 去哪盲盒 | **PASS** | PLAY TYPE 行 7 个 chip：KTV→ktv、剧本杀→script、密室逃脱→escape、桌游→board、电玩城→arcade、看电影→cinema、看演出→livehouse，抽签结果分类 7/7 正确 |
| 发布页 | **PASS** | 13 个分类 chip（不含「全部」），含 Livehouse；发布表单仍可正常提交 |
| 详情页分类名 | **PASS** | s15 KTV / s16 剧本杀 / s17 密室逃脱 / s18 桌游 / s19 电玩城 / s20 影院 / s21 Livehouse，`.hero-cat-zh` 全部正确 |
| 种子数据 | **PASS** | s15 纯K·湖滨店、s16 图灵秘境·沉浸式剧本杀、s17 X先生密室·西湖店、s18 骰子俱乐部·春熙路桌游吧、s19 星际玩家电玩城、s20 中国电影国际影城·滨江店、s21 MAO Livehouse·上海；c17–c23 共 7 条评论 |

**第 1 项汇总：PASS 7 / FAIL 0。**

## 3. 第 2 项：灯箱滚轮缩放逐项结果

| 检查点 | 结果 | 证据 |
|---|---|---|
| 打开灯箱 | **PASS** | 点首页 `.spot-thumb img` 打开 `.img-lightbox[role=dialog]`，初始 `.img-lightbox-zoom` 为 `1.0×`，body 加 `lightbox-open` |
| 滚轮放大 | **PASS** | 中心点 wheel `deltaY=-100` 后 `1.0×→1.2×`（实际 1.18 取一位小数） |
| 最大缩放 | **PASS** | 连续向上滚动后封顶 `4.0×`，transform `scale(4)` |
| 最小缩放 | **PASS** | 连续向下滚动后回落 `1.0×`，transform `scale(1)`，位移归零 |
| 按钮缩放 | **PASS** | 点「放大图片」一次 `1.0×→1.4×`（1.35 取一位小数），「缩小图片」对应回退 |
| 放大后拖动 | **PASS** | pointerdown/pointermove/pointerup 拖动 (+60,+30) 后 transform 由 `translate3d(0,0,0)` 变为 `translate3d(60px,30px,0)` |
| 复位 | **PASS** | 点「复位」`1.4×→1.0×`；双击图片同样复位；键盘 `0` 复位 |
| 键盘 +/− | **PASS** | 键盘 `+` 放大到 `1.4×`，`-` 回退 |
| 关闭与防误触 | **PASS** | 点图片本身灯箱保持打开；点遮罩 layer 关闭；× 关闭；Esc 关闭；关闭后 `body.lightbox-open` 移除、无残留 DOM |
| 移动端安全 | **PASS（结构）** | `@media (max-width:360px)` 下调 padding 与 `max-height:76vh`；× 按钮 34×34 可点，遮罩点击关闭逻辑不依赖 hover；未在真机 iOS/Android 做触控回归（见 §6） |

**第 2 项汇总：PASS 10 / FAIL 0。**

## 4. 第 3 项：图片匹配整改逐项结果

| 检查点 | 结果 | 证据 |
|---|---|---|
| 图片引用完整性 | **PASS** | `js/seed.js` 共 86 个唯一 `assets/photos/*.jpg` 引用，`Test-Path` 86/86 存在；浏览器 HTTP 检查 86/86 为 200 |
| 既有 14 地点复核 | **PASS** | s1 西湖日落/游船、s2 河坊街两张、s3 灵隐寺+灵隐寺补充图、s4 西溪湿地+西溪湿地补充图、s5 杭州天际线+CBD 夜景、s6 武林夜市+烤串、s7 宽窄巷+小吃、s8 太古里两张、s9 外滩夜景两张、s10 武康路两张、s11 广州塔+海心桥、s12 永庆坊+永庆坊牌坊、s13 北京路两张、s14 沙面建筑+沙面街景 |
| 淘汰错图 | **PASS** | 原编号图 04-wetland（沙漠公路）、09-bund（纽约街景）、11-architecture（现代建筑局部）等不再被种子引用 |
| 新娱乐地点图片 | **PASS** | s15 KTV 包厢+门店、s16 剧本杀店招+霓虹、s17 密室主题房两张、s18 桌游咖啡馆+桌游店、s19 电玩城机台+门面、s20 影院影厅两张、s21 Livehouse 演出舞台+场馆；后续广州内容扩充 s22 KTV、s23 剧本杀、s24 Livehouse、s25 电玩城复用同品类图片 |
| 广州评论记录扩充 | **PASS** | 广州 20 个地点共 64 条评论：s11 广州塔 4 条、s12 永庆坊 4 条、s13 北京路 5 条、s14 沙面 3 条、s22 KTV 2 条、s23 剧本杀 2 条、s24 Livehouse 2 条、s25 电玩城 2 条、s35 白云山 3 条、s36 珠江夜游 3 条、s37 陈家祠 3 条、s38 上下九 3 条、s39–s46 珠江新城周边各 3 条；覆盖好玩的地方、好吃的美食与娱乐设施 |
| CREDITS 同步 | **PASS** | `assets/photos/CREDITS.md` 覆盖当前使用 86 张图，含文件名、标题、作者、授权、Commons 页面；`ktv-front.jpg` 已换为 `Yakata Karaoke Lounge 20160405`（玄史生，CC0）并更新记录 |

**第 3 项汇总：PASS 5 / FAIL 0。**

## 5. 第 4 项：城市地图体验重做逐项结果

| 检查点 | 结果 | 证据 |
|---|---|---|
| 高德 JS API 加载 | **PASS** | `window.AMap` 为 object，`.map-stage-canvas.is-amap` 为 true；地图容器内渲染 `.wqwn-amap-marker` / `.wqwn-amap-cluster`，无 console error |
| 全城默认视野 | **PASS** | 首页初始 `fitView` 后 zoom 4.55、center≈[112.78,27.25]；4 个城市聚合点数量为杭州 10 / 成都 8 / 上海 8 / 广州 20 |
| 城市切换 | **PASS** | 选择杭州：10 卡、zoom 11.28、聚合标记显示 10 个点（5 个体 + 1 个 5 点聚合）；成都：8 卡；上海：8 卡；广州：20 卡；切回全部：46 卡、4 个城市聚合 |
| 聚合下钻 | **PASS** | 点击「10 PLACES」杭州聚合：zoom 4.55→11.28，center 落到杭州，聚合拆为 11 个体标记 + 3 个次级聚合 |
| 标记↔卡片联动 | **PASS** | 点击编号标记「03」后 `.spot-card.is-active` 为 `s3`；点击详情/卡片时 `mapHandle.focus` 会聚焦对应标记 |
| 自定义视觉 | **PASS** | 编号标记为朱砂橙圆点 + 白色编号 + 纸色描边；聚合点为墨色圆 + 朱砂描边 + `N PLACES` mono 标签；底图使用 `amap://styles/whitesmoke` 并做暖调滤镜 |
| 坐标纠偏 | **PASS** | 高德分支渲染前按 WGS-84→GCJ-02 转换（如杭州中心经度由 120.1551 转至约 120.16），避免 WGS/GCJ 偏移 |
| 三级降级 | **PASS（结构）** | AMap 脚本加载失败/超时 5s → Leaflet + OSM（原有 `tileerror` 1.8s → SVG）；`isFallback` 仅在 SVG 为 true；本轮未真实模拟断网 |

**第 4 项汇总：PASS 8 / FAIL 0。**

## 6. 回归与边界检查

| 项 | 结果 | 证据 |
|---|---|---|
| 全 JS 语法 | **PASS** | `node --check` 全部 JS 文件通过 |
| 种子重置 | **PASS** | `W.Store.reset()` 后 34 spots，s21 cover=`livehouse-stage.jpg`，无测试残留 |
| 首页/去哪/发布/详情 | **PASS** | 首页 34 卡；去哪 7 个 PLAY TYPE 全部抽到对应分类；发布 13 个分类 chip；详情 s15–s21 分类名正确 |
| Console error | **PASS** | 测试过程中 `dsh_browser_console` 无任何 error/warn 日志 |
| 响应式 | **部分 PASS** | 既有阶段 10 QA 已验证 430/360 无横向溢出；本轮新增 `.chip-row--wrap` 允许娱乐分类换行，桌面截图未见挤压；本轮未重新跑全路由 360 模拟 |

## 7. 未覆盖项与风险

1. 地图 Key 的安全域名当前按用户提供配置为 `127.0.0.1`；若改用 `localhost`、其他端口或线上域名，需要在 `js/map.js` 同步 Key/securityJsCode 并在高德控制台配置对应安全域名，否则会退回 Leaflet/SVG。
2. 灯箱移动端仅在 430px 桌面窗口与 CSS 360px 媒体规则下检查，未在真机 iOS Safari / Android Chrome 验证双指缩放与边缘手势；滚轮交互本身为桌面能力，移动端可用按钮/双击。
3. 图片内容以 Wikimedia Commons 素材为主，部分为国外场景（如 KTV 门店、桌游店），已优先选择能辨识品类的照片；若后续有用户实拍图可直接替换同名文件。
4. 本轮未做像素级视觉回归与性能测试；新增图片均为本地 jpg，单张 100–600KB，首屏加载在本地静态服务器下正常。

## 8. 证据索引

- 分类与种子：`js/ui.js` `CATEGORIES`、`js/seed.js` s15–s21 / c17–c23。
- 活动点周边：`js/seed.js` s39–s46 / c119–c142，`assets/photos/zhujiang-park-*.jpg`、`tianhe-park-*.jpg`、`liede-bridge-*.jpg`、`flower-city-square-*.jpg`、`guangzhou-opera-house-*.jpg`、`guangdong-museum-*.jpg`、`guangzhou-library-*.jpg`、`party-pier-*.jpg`。
- 灯箱：`js/ui.js` `openLightbox` / `zoomAt` / `resetView`；`css/style.css` `.img-lightbox-*`。
- 地图：`js/map.js`（`AMAP_KEY` / `AMAP_SECURITY_JS_CODE`、`loadAMap`、`initAmap`、`buildAmapGroups`、`drawAmapMarkers`、`wgs84ToGcj02`）、`css/style.css` `.wqwn-amap-*`、`.map-stage-canvas`。
- 图片：`assets/photos/CREDITS.md`、`js/seed.js` 86 个唯一图片引用。
- 文档：`README.md` §四/§八、`.codeartsdoer/plans/wanna-play/PROGRESS.md` 阶段 11、`task.md` / `design.md` 阶段 11。

## 9. 内容完善回归（2026-11-14）

| 检查点 | 结果 | 证据 |
|---|---|---|
| 四城地点均衡 | **PASS** | `W.Store.reset()` 后 46 个地点：杭州 10、成都 8、上海 8、广州 20；首页卡片 46 张 |
| 每地点评论数 | **PASS** | 142 条评论（114 条带图），46 个地点最少 3 条、无低于 3 条的地点 |
| 新增广州地点 | **PASS** | s35 白云山·摩星岭（自然风景，3 评论）、s36 珠江夜游·天字码头（夜生活，3）、s37 陈家祠·广东民间工艺博物馆（拍照打卡，3）、s38 上下九步行街·西关小吃（美食，3） |
| 新增成都地点 | **PASS** | s26 成都大熊猫繁育研究基地（自然风景，3 评论）、s27 人民公园·鹤鸣茶社（玩乐，3）、s28 九眼桥·安顺廊桥夜景（夜生活，3）、s29 成都博物馆（拍照打卡，3） |
| 新增上海地点 | **PASS** | s30 上海迪士尼乐园（玩乐，3）、s31 豫园·城隍庙（美食，3）、s32 南京路步行街（玩乐，3）、s33 上海博物馆·人民广场馆（拍照打卡，3）、s34 田子坊·弄堂小店（玩乐，3） |
| 首页城市口碑条 | **PASS** | 选择广州后标题为「广州 · 大家都在夸」、显示 64 条好评、6 条口碑全部来自广州地点；切回全部城市恢复 142 条好评与全站口碑 |
| 图片与 CREDITS | **PASS** | 86 个唯一地点图片路径 HTTP 200 全部通过；`assets/photos/CREDITS.md` 86 个文件均有来源与授权记录 |
| 地图聚合 | **PASS** | 全城 4 个城市聚合「10/8/8/20 PLACES」，`.map-stage-canvas.is-amap` 为 true |

**内容完善回归：PASS 8 / FAIL 0。**

## 10. 珠江新城平月路活动点周边（2026-11-14）

> 演示锚点：广州市天河区珠江新城平月路 161 号（南国酒店·珠江新城店），坐标 23.1200966, 113.3522594。

| 检查点 | 结果 | 证据 |
|---|---|---|
| 广州中心切换 | **PASS** | 选择「广州」后卡片 20 张、地图 20 个地点，距离图例显示「距珠江新城平月路活动点」 |
| 3km 周边演示 | **PASS** | 点「3km」后显示 8 个地点：珠江公园、天河公园、猎德大桥、广州图书馆、广东省博物馆、珠江琶醍、花城广场、活力无限KTV；距离从 840m 到约 3km，全部围绕活动点 |
| 平月路搜索 | **PASS** | 首页搜索「平月路」显示 8 个活动点周边地点（s39–s46），无需先切城市 |
| 1km 步行范围 | **PASS** | 点「1km」显示珠江公园·棕榈草坪（840m），适合活动间隙短距离散步 |
| 周边新增详情 | **PASS** | s39–s46 共 8 个地点，详情标题/分类/封面正确，每处 3 条评论，共 c119–c142 |
| 新增图片 | **PASS** | 16 张周边图片已加入 `assets/photos`，当前 86 个唯一图片路径 HTTP 200 全部通过，`CREDITS.md` 均有记录 |
| 浏览器回归 | **PASS** | 首页 46 卡、广州 20 卡、3km 8 卡；地图聚合「10/8/8/20 PLACES」；console 无 error |

**活动点周边回归：PASS 7 / FAIL 0。**
