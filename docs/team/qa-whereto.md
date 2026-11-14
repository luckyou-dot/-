# 「今天去哪」QA 验收计划与执行报告

- 项目：出来去哪玩（WQWN）· 纯前端静态原型
- 文档：`docs/team/qa-whereto.md`
- 对应任务：task-4（QA｜第五标签验收、回归与缺陷报告）
- 作者：qa-runner
- 版本：v1.0 **已执行 · PASS**
- 日期：2026-11-13
- 状态说明：task-3 已完成（revision 4）；本文件已按最终代码执行 QA-WT-01~14、原有 25 项回归与 430/360 布局抽查，结果见 §8。执行期间未修改任何业务代码。

---

## 1. 测试依据与范围

### 1.1 依据

1. `docs/team/product-whereto.md` —— 12 条验收案例 AC-01～AC-12、文案表 §7、空态/异常数据矩阵 §3.4，是本轮验收的**最终判定口径**。
2. `docs/team/arch-whereto.md` —— §6 `data-*` 契约与 Playwright 验证点、§7 风险与已知边界；选择器以此为准。
3. 既有回归基线：`C:\Users\luck\AppData\Local\Temp\wqwn-test-all.mjs`（25 项检查）、`wqwn-layout.mjs`（430/360 布局检查）。

> 冲突处理：架构文档 §9 明确「若产品文案与示例文案不一致，结构/状态机/data-* 契约不变，仅替换文案」。因此**文案与状态判定以产品文档为准**，选择器以架构文档为准；两者冲突处（错误态是否与 no-spots 合并、chip 文案、池=1 toast 文案）在 §7 风险中单独记录。

### 1.2 测试范围

**新功能（P0）**

- 底部 5 个 tab 的顺序、路由、`aria-current`、发布圆钮位置；
- `#/whereto` 直接访问与首次进入自动抽签、结果卡字段；
- 7 个心情筛选 chip 与分类过滤；
- 「再摇一次」不连续重复、快速连点稳定性；
- 池中仅 1 个地点时的 toast 与结果保持；
- 「就去这里」跳详情、标题一致；
- 切 tab / 浏览器后退保留本次结果与心情；
- 全站空态、分类空态、数据读取异常、脏数据兜底；
- 430 / 360 两档宽度无横向溢出、5 列 tabbar 等宽、触控高度；
- 基础可访问性与 `prefers-reduced-motion`。

**回归（P0）**

- 原有 25 项自动化流程（首页、详情、发布、搭子、个人中心）；
- 六视图不回归、控制台无未捕获异常。

**不在本轮范围**

- 修改任何业务代码（QA 只写报告与临时测试脚本）；
- 真实后端/多端同步/地图底图等既有已知限制；
- 详情页返回按钮固定回 `#/home` 的已知体验缺口（产品 §5.3 已接受，用浏览器后退验证会话保留）。

### 1.3 测试环境

| 项 | 值 |
|---|---|
| 应用地址 | `http://127.0.0.1:8080/`（`python -m http.server 8080`） |
| 浏览器 | Playwright + 本机 Chrome（`chromium.launch({ channel: 'chrome' })`） |
| Playwright 模块 | `file:///C:/Users/luck/.dsh/profiles/desktop/node_modules/playwright/index.mjs` |
| Node | `C:\Users\luck\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe` |
| 主视口 | 430×932（`isMobile: true, hasTouch: true`） |
| 布局视口 | 360×800、430×932 |
| 网络 | 拦截 `tile.openstreetmap.org` 瓦片请求，避免外部网络影响 |
| 数据 | `localStorage['wqwn.v3']`，每个用例前清空 → 种子 10 个地点（food 2 / fun 1 / nature 3 / photo 2 / night 1 / other 1） |

### 1.4 测试脚本

| 脚本 | 用途 | 状态 |
|---|---|---|
| `C:\Users\luck\AppData\Local\Temp\wqwn-whereto-test.mjs` | 本轮新功能自动化验收（本计划 §4 用例） | 已执行：PASS 167 / FAIL 0（2026-11-13 22:34） |
| `C:\Users\luck\AppData\Local\Temp\wqwn-test-all.mjs` | 原有 25 项回归（§5） | 已执行：25 passed / 0 failed |
| `C:\Users\luck\AppData\Local\Temp\wqwn-layout.mjs` | 六视图 430/360 布局抽查 | 已执行：12/12 组合无横向溢出 |

---

## 2. 测试策略与数据准备

### 2.1 隔离与复位

- 每个用例使用独立 browser context；打开首页后 `localStorage.clear()` 并 reload，确保种子数据。
- 需要特殊数据的用例，通过 `page.evaluate` 构造 `W.Seed.build()` 后写入 `localStorage['wqwn.v3']`，再整页导航，让 `W.Store.init()` 读取新状态。
- 同一用例内避免依赖前一个用例留下的数据；发布/评论等回归脚本保持其原有顺序执行（脚本本身有状态累积，属预期）。

### 2.2 随机性断言原则

- **只断言不变量，不断言具体 id/标题**：初始卡 id 必须属于当前筛选池；「再摇一次」新 id ≠ 旧 id；筛选后 `data-category` 必须匹配；池=1 时 id 保持不变。
- 不写「连抽 100 次均不同」这类概率性断言。
- 如实现提供 `window.__WQWN_TEST_RNG__`，测试不依赖它；不因未实现该 seam 判失败。

### 2.3 选择器约定（来自架构 §6.1）

| 选择器 | 用途 |
|---|---|
| `[data-view="whereto"]` | whereto 页面挂载 |
| `#tabbar [data-tab]` | 5 个 tab 顺序/数量 |
| `#tabbar [data-tab="whereto"][aria-current="page"]` | 当前 tab 高亮 |
| `[data-role="mood-row"]` / `[data-mood="…"]` | 心情筛选容器 / chip（`aria-pressed`） |
| `[data-role="oracle-stage"]` | 抽签舞台 / aria-live |
| `[data-role="oracle-card"]` | 结果卡（`data-spot-id`、`data-category`） |
| `[data-role="oracle-title"]` | 结果标题 |
| `[data-role="whereto-empty"]` | 空态（`data-reason`） |
| `[data-action="redraw"]` / `[data-action="go-detail"]` | 换一个 / 就去这里 |

### 2.4 测试数据夹具

| 夹具 | 构造方式 | 用途 |
|---|---|---|
| 种子 | `localStorage.clear()` + reload | 默认 10 地点 |
| 全站空 | `W.Seed.build()` 后 `spots: []` | no-spots 空态 |
| 分类空 | 只保留 food 2 条，点击「夜游一下」 | no-match 空态 |
| 池=1 | 只保留 food 1 条（s2） | 单张提示 |
| 脏数据 | `spots: [{ id: 'dirty1' }]` | 标题/封面/价格/城市/评论缺失兜底 |
| 新地点 | `W.Store.addSpot({ title:'测试地点', category:'food', … })` | 新发布入池 |

---

## 3. 通过标准

- 新功能 P0 用例全部 PASS；
- 原有 25 项回归全部 PASS；
- 无 P0/P1 缺陷（P2 文案/间距问题可记录并评估是否阻塞）；
- 控制台无未捕获异常（`pageerror` 为空）；外部资源加载失败类 console error 不计入应用异常；
- 430/360 两档 `document.documentElement.scrollWidth <= window.innerWidth`；
- 缺陷均有复现步骤与证据（截图/控制台/实际文案）。

---

## 4. 新功能用例映射（AC-01～AC-12 + 补充）

> 状态列初始为「待执行」。执行后填 PASS / FAIL / BLOCKED，FAIL 需在 §8 缺陷记录中登记编号。

| 用例 | 对应 AC | 场景 | 关键步骤 | 期望结果 | 脚本断言 | 状态 |
|---|---|---|---|---|---|---|
| QA-WT-01 | AC-01 | 五个 tab 顺序与 active 状态 | 打开首页，读取 `#tabbar [data-tab]`；依次点击 5 个 tab | 顺序 `home/whereto/publish/buddies/profile`，共 5 项；发布第 3 项且保留 `tab-publish`；每次点击后 URL 正确且唯一 `aria-current="page"` | `WT-01` | PASS |
| QA-WT-02 | AC-02 | 首次进入自动抽签 | 种子数据下从首页点「去哪」（并单独验证直接打开 `#/whereto`） | 1.2s 内出现且仅 1 张结果卡；页面标题「今天去哪」、眉题 `TODAY'S DRAW · 今日一签`；卡内 id 属于 `W.Store.listSpots()`；tab 高亮；不触发定位、不发业务网络请求、无 JS 错误 | `WT-02` | PASS |
| QA-WT-03 | AC-03 | 7 个心情筛选只出对应分类 | 断言 chip 数量/键/文案；依次点击「都可以/吃点好的/玩点新鲜的/看看风景/拍点照片/夜游一下/随便逛逛」 | 7 个 chip 键 `all/food/fun/nature/photo/night/other`；每次选中 chip `aria-pressed="true"` 其余为 `false`；结果卡 `data-category` 与所选一致（`all` 不限）；种子各池均非空 | `WT-03` | PASS |
| QA-WT-04 | AC-04 | 再摇一次不连续重复 | 记录当前卡 id，连续点击「再摇一次」5 次，每次等待新卡 | 每次新 id ≠ 上一张，且属于当前池；页面始终只有 1 张卡；按钮短暂禁用不叠加点击；控制台无报错 | `WT-04` | PASS |
| QA-WT-05 | AC-05 | 池中只剩 1 个地点 | 构造仅 1 条 food 地点，打开 `#/whereto`，点「再摇一次」 | 结果仍为该地点、页面不清空不报错；出现 toast「签筒里只剩这一张了。」 | `WT-05` | PASS |
| QA-WT-06 | AC-06 | 就去这里跳详情且标题一致 | 记录卡片 id/标题/分类，点「就去这里」 | URL `#/spot/{id}`；详情 `.hero-title` 与卡片标题一致；详情封面/地址/评论区正常；底部「首页」按现有路由契约高亮 | `WT-06` | PASS |
| QA-WT-07 | AC-07 | 切走再回来保留结果 | 选中某心情抽到 A；切「首页」再回「去哪」；另从详情页浏览器后退返回 | 均仍显示 A、心情保持、不重新翻签；整页刷新后才重置抽签 | `WT-07` | PASS |
| QA-WT-08 | AC-08 | 空态与恢复 | ① `spots: []` 刷新 `#/whereto`；② 只保留 food，点击「夜游一下」 | ① 显示「签筒里还没有地点。」+「去发布」，点击到 `#/publish`，无卡、无 JS 错误；② 显示「这一签，签筒是空的。」+「换个心情」，点击后回到「都可以」并重新出签 | `WT-08` | PASS |
| QA-WT-09 | AC-09 | 脏数据兜底 | `spots: [{ id:'dirty1' }]`，打开 `#/whereto` 抽到它 | 显示「未命名地点」「价格待定」「城市未填」等安全占位；无 `undefined`/`NaN`/破图；无 JS 错误；「就去这里」可点 | `WT-09` | PASS |
| QA-WT-10 | AC-10 | 数据读取异常错误态 | 控制台将 `W.Store.listSpots` 替换为抛错函数后打开 `#/whereto`；恢复后点重试 | 显示「今天抽不了签。」与「重新抽一次」；不白屏、无未捕获异常；恢复原函数点重试可正常出签 | `WT-10` | PASS |
| QA-WT-11 | AC-11 | 430/360 宽度与 5 列布局 | 分别在 360×800、430×932 打开 `#/whereto` 并抽到结果 | `scrollWidth <= innerWidth`；tabbar 5 等分（误差≤1px）、文字不换行不截断、发布圆钮居中；结果卡图片不变形；「就去这里」「再摇一次」高度 ≥44px 可点击 | `WT-11` | PASS |
| QA-WT-12 | AC-12 | 新发布地点自动进入签筒 | `W.Store.addSpot({title:'测试地点',category:'food'})` 后回 `#/whereto`，切「吃点好的」，多次抽签 | 总签筒 10→11、food 2→3（无需刷新）；多次抽签能抽到新地点（洗牌袋轮完必现） | `WT-12` | PASS |
| QA-WT-13 | 补充（P0 a11y） | 基础可访问性 | 检查 mood chips、结果区、图片、按钮 | chips 为 `<button>` 且有 `aria-pressed`；结果区或隐藏播报节点有 `aria-live="polite"`；封面 `img` 有非空 alt（无图时用占位）；操作按钮 `type="button"`；tab 图标 `aria-hidden="true"` | `WT-13` | PASS |
| QA-WT-14 | 补充（稳定性） | 快速连点 / reduced motion | 连续同步点击「再摇一次」8 次；`emulateMedia({reducedMotion:'reduce'})` 下打开页面 | 最终仅 1 张卡、按钮仍可用、无 pageerror；reduced motion 下卡片无需等待长动画即可见 | `WT-14` | PASS |

### 4.1 用例详细说明

#### QA-WT-01 五个底部标签

1. 打开 `http://127.0.0.1:8080/`，等待首页渲染。
2. `#tabbar [data-tab]` 的 `data-tab` 数组应为 `['home','whereto','publish','buddies','profile']`。
3. 第 3 个 `<a>` 必须是 `publish` 且保留 `.tab-publish`（橙色圆钮）。
4. 依次点击五个 tab，断言 `location.hash` 分别为 `#/home`、`#/whereto`、`#/publish`、`#/buddies`、`#/profile`；每次只有当前 tab 有 `aria-current="page"`。

#### QA-WT-02 初始自动抽签

1. 种子数据、清除 localStorage 后从首页点击「去哪」。
2. 计时从点击到 `[data-role="oracle-card"]` 可见，应 ≤1200ms。
3. 断言页面包含 `[data-view="whereto"]`、标题「今天去哪」、眉题含 `TODAY'S DRAW`。
4. 断言 `.oracle-card` 数量 = 1；`data-spot-id` ∈ `W.Store.listSpots().map(s=>s.id)`；标题文本 = `W.Store.getSpot(id).title`。
5. 断言 `[data-tab="whereto"][aria-current="page"]` 存在且唯一。
6. 页面加载时注入的 `navigator.geolocation` 计数器应保持 0（进入 whereto 不得请求定位）。

#### QA-WT-03 心情筛选

1. 断言 `[data-role="mood-row"] [data-mood]` 共 7 个，键为 `all,food,fun,nature,photo,night,other`。
2. 断言 chip 文案符合产品 §7.1：都可以 / 吃点好的 / 玩点新鲜的 / 看看风景 / 拍点照片 / 夜游一下 / 随便逛逛。
3. 依次点击每个 chip，等待结果或空态；非 all 时断言卡片 `data-category` 等于 chip 键；断言当前 chip `aria-pressed="true"`、其余全部 `false`。
4. 种子每类均有地点，不应出现空态。

#### QA-WT-04 再摇一次

1. 进入 `#/whereto`，记录 `data-spot-id`。
2. 循环 5 次：点击 `[data-action="redraw"]`，等待 `data-spot-id` 变化；断言新 id ≠ 旧 id，并在当前池 id 集合内；断言 `.oracle-card` 数量始终为 1。
3. 每次点击后等待翻签结束（以 id 变化为准），避免测试竞态。
4. 断言 console 中无应用 JS 报错。

#### QA-WT-05 池=1

1. 将种子 spots 过滤为仅 `s2`（food），刷新 `#/whereto`。
2. 卡片应为 s2；点击「再摇一次」。
3. 断言卡片 id 仍为 s2、页面上仍只有 1 张卡。
4. 断言 `#toast-layer` 出现含「签筒里只剩这一张了」的提示（若实现文案不同，按产品文案记为 P2 缺陷并在报告注明）。

#### QA-WT-06 就去这里

1. 在 `#/whereto` 记录卡片 `data-spot-id`、标题、分类。
2. 点击 `[data-action="go-detail"]`。
3. 断言 URL 为 `#/spot/{id}`；`.hero-title` 文本与卡标题一致。
4. 断言详情页存在封面（`.hero-track`/`.hero-slide`）与地址（`.detail-route`）与评论（`.comment-item` 或评论区容器）。
5. 断言 `#tabbar [data-tab="home"][aria-current="page"]`（现有路由契约：详情归属首页）。

#### QA-WT-07 会话恢复

1. 在 `#/whereto` 选「吃点好的」，记录当前卡 id。
2. 点「首页」tab，再点「去哪」tab：断言同一 id、food chip 仍 `aria-pressed="true"`、无重新翻签（卡片立即可见）。
3. 从「就去这里」进详情后 `page.goBack()`：断言回到 `#/whereto`，同一 id 仍显示。
4. 整页 reload 后：断言重新抽签（存在卡片即可；mood 若重置为 all 也符合 P1 可选行为，不作强断言）。

#### QA-WT-08 空态

- 全站空：`spots: []`，刷新 `#/whereto`；断言 `[data-role="whereto-empty"][data-reason="no-spots"]` 可见、`.oracle-card` 数量 0、按钮「去发布」→ `#/publish`、页面无 `pageerror`。
- 分类空：只保留 food 2 条，点击「夜游一下」；断言 `[data-role="whereto-empty"][data-reason="no-match"]`、卡片数量 0；点击空态第一个动作按钮后回到「都可以」并重新出现卡片。

#### QA-WT-09 脏数据

1. 写入 `spots: [{ id: 'dirty1' }]`（保留种子 users）。
2. 打开 `#/whereto`，等待卡片。
3. 断言标题「未命名地点」；元信息含「价格待定」「城市未填」；全页文本不含 `undefined`、`NaN`。
4. 断言封面使用占位块、无破图（不可见 `img` 的 `naturalWidth===0`）。
5. 点击「就去这里」，断言 URL 变为 `#/spot/dirty1` 且页面未白屏。

#### QA-WT-10 异常态

1. 首页加载完成后，在页面上下文保存 `W.Store.listSpots` 原函数，并替换为 `function(){ throw new Error('boom'); }`。
2. 调用 `W.Router.go('#/whereto')` 进入页面。
3. 断言 `[data-role="whereto-empty"]` 存在且文案含「今天抽不了签。」与「重新抽一次」；页面不白屏；`pageerror` 为空。
4. 恢复原函数，点击「重新抽一次」，断言出现结果卡。
5. 若实现将异常与 no-spots 合并（显示「签筒里还没有地点」），按 AC-10 记为 **P1 缺陷**（产品 §8.5 明确两者必须分开）。

#### QA-WT-11 430/360 布局

1. 两个 viewport 各自打开 `#/whereto` 并等待结果卡。
2. 断言 `document.documentElement.scrollWidth <= window.innerWidth`，并检查 `body *` 无右溢出的可见元素。
3. 断言 5 个 tab 宽度最大差 ≤1px；`publish` 中心与 tabbar 中心差 ≤1px；每个 `.tab-label` 单行（`scrollWidth <= clientWidth + 1`）。
4. 断言 `.oracle-actions .btn` 高度均 ≥44px；结果卡图片容器宽度不超过视口。

#### QA-WT-12 新地点入池

1. 种子数据下记录总池数 10。
2. `W.Store.addSpot({title:'测试地点', category:'food', ...})`，记录新 id。
3. 重新渲染 `#/whereto`（点 tab 或 `W.Router.go`），断言 store 总数 11、food 池 3（若页面有池计数节点，断言计数文案含 11）。
4. 点击「吃点好的」，多次点「再摇一次」（最多 12 次）收集卡片 id，断言新 id 至少出现一次；每次卡片 `data-category === 'food'`。

#### QA-WT-13 可访问性

1. mood chips 必须是 `<button>`，每个有 `aria-pressed`；当前选中项值为 `true`。
2. 结果动态区有 `aria-live="polite"`（`[data-role="oracle-stage"]` 或 `[data-role="oracle-announce"]`）。
3. 结果卡内所有 `img` 的 `alt` 非空；无图时存在 `.oracle-cover-fallback`。
4. `[data-action]` 按钮均有 `type="button"`；tab 图标 `aria-hidden="true"`。

#### QA-WT-14 稳定性与 reduced motion

1. 正常视口打开 `#/whereto`，在页面上下文对 `[data-action="redraw"]` 连续同步 `click()` 8 次，等待 800ms。
2. 断言 `.oracle-card` 数量 = 1、按钮存在且可点击、`pageerror` 为空。
3. 新建 `reducedMotion: 'reduce'` 的 context，打开 `#/whereto`；断言结果卡正常可见，且卡片 `animation-duration` / `transition-duration` ≤ 0.05s（不要求长动画）。

---

## 5. 原有 25 项回归清单

来源：`C:\Users\luck\AppData\Local\Temp\wqwn-test-all.mjs`（按原顺序执行、状态累积）。执行前清空 localStorage，使用 430×932 视口。

| 编号 | 模块 | 检查项（脚本原文） | 期望 | 状态 |
|---|---|---|---|---|
| R-01 | 首页 | home renders 10 cards | 10 张 `.spot-card` | PASS |
| R-02 | 首页 | home renders 10 map markers | 10 个 SVG 标记 | PASS |
| R-03 | 首页 | home renders 6 review chips | 6 条口碑卡 | PASS |
| R-04 | 首页 | home map meta | 含 `3 CITIES · 10 PLACES` | PASS |
| R-05 | 首页 | food filter gives 2 cards | 美食筛选 2 张卡 | PASS |
| R-06 | 首页 | no-result empty state | 空结果 + 1 个 `.empty` | PASS |
| R-07 | 详情 | detail opens | `#/spot/s1`、标题正确 | PASS |
| R-08 | 详情 | detail description visible | 描述文本 >10 字 | PASS |
| R-09 | 详情 | detail comments | 2 条评论 | PASS |
| R-10 | 详情 | favorite toggles | 收藏状态 class 变化 | PASS |
| R-11 | 详情 | like toggles | `.is-liked` 出现 | PASS |
| R-12 | 详情 | comment added | 评论数 2→3 且内容正确 | PASS |
| R-13 | 发布 | publish tab | `.publish-page` 存在 | PASS |
| R-14 | 发布 | publish creates spot and opens detail | 新地点详情标题一致 | PASS |
| R-15 | 搭子 | buddies tab | `.buddies-page` 存在 | PASS |
| R-16 | 搭子 | buddies list 4 | 初始 4 张搭子卡 | PASS |
| R-17 | 搭子 | buddy created and opens detail | 新搭子详情标题一致 | PASS |
| R-18 | 搭子 | buddy list has 5 | 返回列表 5 张 | PASS |
| R-19 | 搭子 | buddy detail opens | `.buddy-detail-page` 存在 | PASS |
| R-20 | 搭子 | creator sees pending request | 有「同意」按钮 | PASS |
| R-21 | 搭子 | approval toast | toast 含「已同意」 | PASS |
| R-22 | 搭子 | apply toast | toast 含「申请已提交」 | PASS |
| R-23 | 我的 | profile renders | 小来、5 个分区 | PASS |
| R-24 | 我的 | profile tab switch | 「加入」分区激活 | PASS |
| R-25 | 我的 | identity switch | 切换为 Momo | PASS |

补充布局回归：`wqwn-layout.mjs` 的 6 个视图 × 430/360 无横向溢出、字体符合预期；执行后记录关键输出。

---

## 6. 缺陷记录模板与分级

### 6.1 分级

| 级别 | 定义 | 例子 |
|---|---|---|
| P0 阻塞 | 页面不可用/白屏/JS 未捕获异常/5 tab 缺失，主流程不可完成 | whereto 白屏、点 tab 无反应 |
| P1 严重 | 验收 AC 不满足，但页面可用 | 筛选分类错误、连续重复、错误态缺失、布局溢出 |
| P2 一般 | 文案/间距/视觉与产品文档不一致 | chip 文案不符、池=1 toast 用词不同 |
| P3 建议 | 体验优化、非验收项 | 动画时长微调 |

### 6.2 记录表（执行时填写）

| 缺陷 ID | 级别 | 对应 AC | 标题 | 复现步骤 | 期望 vs 实际 | 证据 | 状态 |
|---|---|---|---|---|---|---|---|
| — | — | — | 本轮未发现缺陷 | — | 167 项新功能断言、25 项回归、12 组布局抽查全部通过 | 见 §8.4 截图与 §8.5 日志 | 已关闭 |

> 说明：未发现 P0/P1/P2 缺陷。开发实现采用架构约定 `pickSpot(pool, excludeId, history, rng)`，不是产品字面「每分类洗牌袋」；按 Lead 口径只断言相邻不重复与池=1 行为，不按袋轮完验收（QA-WT-04 / QA-WT-12 的随机命中用它作为候选池可达性证据，不构成袋轮完断言）。

---

## 7. 风险与判定口径备注

1. **错误态 vs 空态合并风险**：产品 AC-10 要求 `listSpots()` 抛异常时显示「今天抽不了签。」；架构 §3.4 把异常 catch 成 `[]` 走 no-spots。若实现按架构合并，按产品 AC-10 记 P1。
2. **chip 文案差异风险**：架构 §2.5 示例用「全部/美食/玩乐…」，产品 §7.1 用「都可以/吃点好的…」。按产品文案判定，架构 §9 已说明结构不变仅换文案。
3. **池=1 toast 文案**：产品「签筒里只剩这一张了。」；架构示例「今天只有一个地点可选」。按产品判定，措辞不同记 P2。
4. **详情页返回**：详情返回按钮仍回 `#/home` 属产品 §5.3 已接受的已知缺口；QA 只验证浏览器后退可回 `#/whereto` 且结果保留。
5. **随机不可控**：测试只断言集合归属与相邻不重复，不依赖具体随机值；若概率性失败，先复现 3 次再判缺陷。
6. **图片加载**：种子图片为本地 JPEG；若浏览器第一次加载较慢，等待 `img` 完成或忽略尚未 decode 的图片，仅以 `naturalWidth===0` 的可见破图判定。
7. **控制台噪声**：拦截 OSM 瓦片与外部 CDN 的 `net::ERR` 不计入应用 JS 异常；`pageerror` 必判。

---

## 8. 执行记录（v1.0 · PASS）

- 执行人：qa-runner
- 执行时间：2026-11-13 22:34:25 ~ 22:36:52（Asia/Shanghai）
- 代码版本：task-3 完成版本（revision 4；dev-builder 报告 `js/views/whereto.js` 723 行，`index.html` / `js/app.js` / `css/style.css` 已定稿）
- 浏览器/视口：Chrome via Playwright（`channel: 'chrome'`），430×932 / 360×800
- 结果汇总：**新功能 PASS 167 / FAIL 0 / BLOCKED 0（14 个用例）**；**原有 25 项回归 25 passed / 0 failed**；**布局抽查 12/12 组合 `scrollWidth == innerWidth`**
- 控制台异常：新功能测试 `pageerror` = 0，无应用未捕获异常；外部瓦片/资源加载噪声已过滤。WT-10 的异常注入路径会触发实现主动 `console.error` 的已捕获错误日志，不属于未捕获异常（AC-10 判定为 PASS）。
- 缺陷清单：无（见 §6.2）
- 回归结果：原有 25 项全部 PASS；`wqwn-layout.mjs` 六视图两档宽度全部通过
- 结论：**PASS**，AC-01~AC-12 全部满足，可交付。

### 8.1 执行命令

```powershell
& "C:\Users\luck\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\luck\AppData\Local\Temp\wqwn-whereto-test.mjs"
& "C:\Users\luck\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\luck\AppData\Local\Temp\wqwn-test-all.mjs"
& "C:\Users\luck\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\luck\AppData\Local\Temp\wqwn-layout.mjs"
```

### 8.2 逐用例结果

| 用例 | 结果 | 实际观察/证据 |
|---|---|---|
| QA-WT-01 | PASS | `#tabbar` 共 5 项，顺序 `home/whereto/publish/buddies/profile`；第 3 项为 `publish.tab-publish`；五次点击后路由与唯一 `aria-current="page"` 均正确；截图 `09-tabbar-430.png`。 |
| QA-WT-02 | PASS | 首页点「去哪」868ms 出现唯一结果卡，`data-spot-id=s8` 属于 10 条种子；直接打开 `#/whereto` 也自动出签（`s6`）；`__geo_calls=0`，无定位；截图 `01-whereto-initial-430.png`。 |
| QA-WT-03 | PASS | 7 个 chip 键与文案完全匹配产品 §7.1；依次点击 7 个心情，结果 `data-category` 全部匹配（food/fun/nature/photo/night/other），`aria-pressed` 始终唯一；food 选中时签筒计数显示「从 2 个地点里抽到这一签」；截图 `02-whereto-food-430.png`。 |
| QA-WT-04 | PASS | 记录初始 `s6`；连续点击「再摇一次」5 次依次为 `s1→s5→s9→s8→s7`，每次相邻 id 不同、始终仅 1 张卡、无 `pageerror`。 |
| QA-WT-05 | PASS | 构造仅 `s2` 的 food 池；点击「再摇一次」后仍为 `s2`，页面不清空、不报错，toast 精确显示「签筒里只剩这一张了。」。 |
| QA-WT-06 | PASS | 卡片 `s2` → `#/spot/s2`；详情 `.hero-title` 与卡片标题一致；封面、地址、评论容器均存在；底部「首页」`aria-current="page"`；截图 `07-whereto-detail-430.png`（另一张 s7 详情）。 |
| QA-WT-07 | PASS | 选「吃点好的」得到 `s8`；切「首页」再回「去哪」仍 `s8` 且 food 保持；从详情 `page.goBack()` 回 `#/whereto` 仍 `s8`；整页刷新后重新出签（`s4`）。 |
| QA-WT-08 | PASS | `spots:[]` 显示「签筒里还没有地点。」+「去发布」→ `#/publish`，无卡；only-food 点「夜游一下」显示「这一签，签筒是空的。」+「换个心情」，点击后回到 `all` 并重新出签；截图 `03-whereto-empty-430.png` / `04-whereto-no-match-430.png`。 |
| QA-WT-09 | PASS | `{id:'dirty1'}` 显示「未命名地点」「城市未填」「价格待定」；页面无 `undefined`/`NaN`、无可见破图；「就去这里」→ `#/spot/dirty1` 不白屏；截图 `06-whereto-dirty-430.png`。 |
| QA-WT-10 | PASS | 注入 `listSpots` 抛错后显示「今天抽不了签。」+「重新抽一次」，不白屏、`pageerror=0`；恢复原函数后点重试正常出签（`s9`）；截图 `05-whereto-error-430.png`。 |
| QA-WT-11 | PASS | 360×800：`scrollWidth=360=innerWidth`，tab 宽度 `[72,72,72,72,72]`（差 0），发布圆钮中心 180=tabbar 中心，按钮高度均 44px；430×932：`scrollWidth=430=innerWidth`，`[86×5]`，按钮高度 46px；无页面级右溢出元素；截图 `08-whereto-360.png`。 |
| QA-WT-12 | PASS | `W.Store.addSpot({title:'测试地点',category:'food'})` 后总签筒 10→11、food 2→3，无需刷新；切 food 后多次抽签收集到新 id `s_mwf2v7jq1ywh`，每次 `data-category=food`。 |
| QA-WT-13 | PASS | 7 个 mood chip 均为 `<button>` 且带 `aria-pressed`；`[data-role="oracle-stage"]`/播报节点 `aria-live="polite"`；封面 `img` alt 为「河坊街小吃扫街 的封面」；两个操作按钮均 `type="button"`；`#tabbar .tab-icon` 5/5 `aria-hidden="true"`。 |
| QA-WT-14 | PASS | 连续同步点击「再摇一次」8 次仅 1 次实际触发（按钮禁用生效），最终 1 张卡、按钮仍可用、`pageerror=0`；`reducedMotion:'reduce'` 下卡片 33ms 可见，`animation-duration` / `transition-duration` 均为 `1e-05s` ≤ 0.05s。 |

### 8.3 回归与布局结果

- **原有 25 项回归** `wqwn-test-all.mjs`：`25 passed, 0 failed`。覆盖首页 10 卡/10 地图标记/6 口碑 chip/地图 meta、food 筛选 2 卡、空结果、详情标题与评论、收藏/点赞/评论新增、发布新地点、搭子列表/详情/审批/toast、我的页与身份切换；未发现回归。
- **布局抽查** `wqwn-layout.mjs`：430/360 × `home/buddies/publish/profile/detail/buddyDetail` 共 12 组均 `scrollWidth == innerWidth`；`home`/`detail` 日志中的 `overflow` 项为轮播/装饰元素，位于 `overflow-x` 裁切容器内，不构成页面级横向滚动（`wqwn-layout.mjs` 原脚本以页面 scrollWidth 为判据，全部通过）。
- **新功能布局**：WT-11 已额外覆盖 `#/whereto` 的 360×800 与 430×932 两档，均无页面级横向溢出。

### 8.4 证据截图

目录：`C:\Users\luck\AppData\Local\Temp\wqwn-qa-evidence\`

| 文件 | 内容 |
|---|---|
| `01-whereto-initial-430.png` | 430 种子数据初始抽签结果卡（五 tab、今日签、心情 chips） |
| `02-whereto-food-430.png` | 点击「吃点好的」后的 food 结果（签筒计数 2） |
| `03-whereto-empty-430.png` | 全站空态「签筒里还没有地点。」+「去发布」 |
| `04-whereto-no-match-430.png` | 分类空态「这一签，签筒是空的。」+「换个心情」 |
| `05-whereto-error-430.png` | 数据读取异常态「今天抽不了签。」+「重新抽一次」 |
| `06-whereto-dirty-430.png` | 脏数据兜底（未命名地点/城市未填/价格待定） |
| `07-whereto-detail-430.png` | 「就去这里」跳转后的详情页 |
| `08-whereto-360.png` | 360×800 布局 |
| `09-tabbar-430.png` | 五个底部 tab 顺序与发布橙色圆钮特写 |

### 8.5 执行日志

| 日志 | 关键结果 |
|---|---|
| `C:\Users\luck\AppData\Local\Temp\wqwn-whereto-result.log` | `===== SUMMARY: PASS 167 / FAIL 0 / TOTAL 167 =====`，退出码 0 |
| `C:\Users\luck\AppData\Local\Temp\wqwn-regression-result.log` | `25 passed, 0 failed`，退出码 0 |
| `C:\Users\luck\AppData\Local\Temp\wqwn-layout-result.log` | 12 行 6 视图 × 430/360，全部 `scrollWidth == innerWidth`，退出码 0 |

### 8.6 非阻塞观察

1. `js/views/whereto.js:121` 在 `W.Store.listSpots()` 抛错时主动 `console.error(e)` 记录已捕获异常；`pageerror` 为 0，不影响 AC-10，属诊断日志，非缺陷。
2. 实现随机策略为架构约定的 `pickSpot(pool, excludeId, history, rng)`，不是产品字面「每分类洗牌袋」；按 Lead 口径只验收相邻不重复与池=1 行为，本轮 WT-04/WT-12 均通过，不作「袋轮完」断言。
3. 详情页返回按钮仍固定回 `#/home` 为产品 §5.3 已接受的已知缺口；浏览器后退路径按 WT-07 验证通过。

