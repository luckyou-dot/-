# 架构方案｜第五标签「今天去哪」（whereto）路由、视图与组件接口

> 项目：`D:\VibeCoding\出来去哪玩`
> 文档：`docs/team/arch-whereto.md`（task-2 交付，供 task-3 开发、task-4 QA 使用）
> 状态：v1 定稿；本文只做方案，不修改任何业务代码
> 基线：`index.html`（63 行）、`js/app.js`（220 行）、`js/ui.js`（339 行）、`js/store.js`（587 行）、`js/views/home.js`（607 行）、`js/views/detail.js`（413 行）、`css/style.css`（2519 行）
> 涉及契约：`C-SHELL@1`（应用外壳/路由）、`C-UI@1`（W.UI）、`C-STORE@1`（W.Store）；本文新增视图契约 **`C-WHERETO@1`**

## 0. 结论摘要

- 底部标签最终顺序固定为：**首页 `home` → 去哪 `whereto` → 发布 `publish` → 搭子 `buddies` → 我的 `profile`**，共 5 项。`publish` 是第 3 个 `<a>`，在 5 等分网格中正好是中间列，现有橙色圆钮的 `margin-top: -20px` 方案不需要重做。
- 路由新增 `#/whereto`：`key: 'whereto'`、`tab: 'whereto'`、无参数。
- 新视图 `js/views/whereto.js` 只暴露 `W.Views.whereto.render(root, params)`；模块级内部状态为 `mood`、`currentId`、`history`，路由离开再回来保持上次结果。
- 数据流只读：每次抽取调用一次 `W.Store.listSpots()` 拿全量快照，再按 `mood` 本地过滤；不写 Store、不新增 localStorage key、不改 `seed.js`。
- 视图根节点用 `div.page.whereto-page`，可自动复用 `.page` 的内边距与 `#view-root > .page` 的入场动画。
- 已知边界：详情路由沿用 `tab: 'home'`，从「去哪」点「就去这里」进入详情后底部会高亮「首页」；v1 接受该行为，完整分析与备选方案见 §7.1。

---

## 1. 集成清单

### 1.1 `index.html`：tabbar 从 4 项调整为 5 项

现状（`index.html:18-43`）：`home → buddies → publish → profile`，4 个 `<a class="tab">`，`#tabbar` 由 CSS 固定 4 列。

改动要求：

1. **调整 DOM 顺序**为 `home → whereto → publish → buddies → profile`。注意：`publish` 必须位于第 3 个子元素，5 列下才会居中；不能只插入新 tab 而保持旧的 `buddies` 在 `publish` 前面。
2. 在 `home` 与 `publish` 之间插入「去哪」tab，结构与现有 tab 完全一致（`data-tab` 用于高亮匹配，`href` 用于事件委托取地址）。

新增 tab 的推荐标记（inline SVG 骰子，线性风格，和现有图标统一 `viewBox="0 0 24 24"`、`stroke-width="1.5"`、`stroke-linecap="square"`）：

```html
<a class="tab" data-tab="whereto" href="#/whereto">
  <span class="tab-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2"/>
      <circle cx="8.3" cy="8.3" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15.7" cy="15.7" r="1" fill="currentColor" stroke="none"/>
    </svg>
  </span>
  <span class="tab-label">去哪</span>
</a>
```

最终 `#tabbar` 子元素顺序（用 `data-tab` 表示）：

```
home → whereto → publish → buddies → profile
```

标签文案：tab 上显示「去哪」（2 字，360px 下每列 72px 也放得下）；页面内标题用「今天去哪」。这是有意区分：tab 是导航短标签，页面标题承载完整产品名。

### 1.2 `js/app.js`：ROUTES 增加 `/whereto`

在 `js/app.js:8`（`/home` 路由之后）插入一行即可，建议保持在浏览类路由最前面：

```js
{ pattern: /^\/whereto$/i, key: 'whereto', tab: 'whereto', params: null },
```

不需要改：

- `normalizePath()`：`#/whereto` 会正常归一为 `/whereto`；
- `matchRoute()`：无参数路由 `params` 为 `null`，匹配后返回 `{}`；
- `renderTabs()`：按 `data-tab` 找元素设置 `aria-current="page"`，新 tab 自动生效；
- `start()` 里的 tabbar 事件委托：`closest('[data-tab]')` + `href` 已覆盖新 tab，无需单独绑定；
- `render()` 的视图查找：`W.Views[route.key]` 即 `W.Views.whereto`。

验证路由匹配顺序：`/spot/:id` 与 `/whereto` 不冲突（正则前缀不同），放在数组任意位置都可，但放 `/home` 之后可读性最好。

### 1.3 脚本顺序

`index.html` 现有脚本顺序（`index.html:51-61`）：

```
js/ui.js → js/store.js → js/seed.js → js/map.js
→ js/views/home.js → js/views/publish.js → js/views/detail.js
→ js/views/buddies.js → js/views/buddyDetail.js → js/views/profile.js
→ js/app.js
```

调整为（新增一行紧随 `home.js`）：

```html
<script src="js/views/home.js"></script>
<script src="js/views/whereto.js"></script>
<script src="js/views/publish.js"></script>
```

约束（什么时候可以放别处）：

- 必须在 `js/ui.js`、`js/store.js` 之后：视图里会调用 `W.UI.el(...)`、`W.Store.listSpots()`；
- 必须在 `js/app.js` 之前：`app.js` 末尾立即 `start()`，启动时就会渲染当前 hash，若 `whereto.js` 未加载会走进 `renderError`「视图 whereto 未加载」；
- 与其它 view 的先后无依赖，放在 `home.js` 后只是让「浏览类视图」相邻、便于维护。

### 1.4 不改动清单（防回归）

| 文件 | 是否改动 | 说明 |
|---|---|---|
| `js/store.js` | ❌ 不改 | 只用公开的 `listSpots()`，不新增存储字段 |
| `js/seed.js` | ❌ 不改 | 种子 10 个地点已足够抽签 |
| `js/ui.js` | ❌ 不改（推荐） | 现有 `el/icon/money/categoryName/stars/empty` 已覆盖需求；如确需骰子图标，只在 `ICONS` 增加一个 key，属可选增强 |
| `js/map.js` | ❌ 不改 | whereto 不渲染地图 |
| `css/style.css` | ✅ 只追加 + 1 处值修改 | `#tabbar` 改 5 列；新增 `17.` 之后的 `whereto` 样式段，不动既有规则 |
| `index.html` / `js/app.js` | ✅ 最小改动 | 见 §1.1 / §1.2 |

---

## 2. 新视图 `js/views/whereto.js`

### 2.1 职责边界

**做：**

- 渲染「今天去哪」整页：标题区、心情 chips、抽签舞台、结果卡、操作按钮、空态；
- 维护本视图内状态：`mood`（分类筛选）、`currentId`（当前结果）、`history`（最近抽中记录，用于避免近期重复）；
- 从 `W.Store.listSpots()` 只读取数，内存中筛选、随机、渲染；
- 「换一个」重新抽取；「就去这里」跳 `#/spot/:id`；
- 处理 0 地点、筛选无结果、图片加载失败、评论为空等边界。

**不做：**

- 不写 Store（不调用 `toggleLike` / `viewSpot` / `addSpot` / `addComment`）；
- 不持久化抽签历史（刷新即重置；localStorage 仅由 Store 使用）；
- 不渲染地图、不做定位、不做详情页内联预览；
- 不接受 URL 参数（`params` 恒为 `{}`），不从 query 读取状态；
- 不修改底部 tabbar / header（由 `app.js` 的 `renderHeader`/`renderTabs` 统一负责）。

### 2.2 模块接口（契约 `C-WHERETO@1`）

```js
(function () {
  'use strict';
  window.W = window.W || {};
  window.W.Views = window.W.Views || {};

  // ... 私有实现 ...

  W.Views.whereto = {
    /**
     * 渲染「今天去哪」页面。
     * @param {HTMLElement} root  #view-root，已由 Router 清空
     * @param {Object} params     路由参数，本路由恒为 {}
     * @returns {void}
     */
    render: render
  };
})();
```

接口约定：

1. `render(root, params)` 每次调用必须能从零重建页面，不依赖上一次 DOM 节点；模块级 `state` 允许跨调用保留。
2. 必须在 `root` 内只追加一个根节点：`div.page.whereto-page`（`class="page whereto-page"`），并带 `data-view="whereto"`。
3. 不向全局挂任何调试对象（测试通过 DOM 的 `data-*` 断言，见 §6）；如需 RNG 注入，只读取 `window.__WQWN_TEST_RNG__`（见 §6.3）。
4. 不抛出异常：内部读取/渲染异常应降级为空态（`try/catch` + `W.UI.empty`），避免 Router 的 `renderError` 白屏。
5. 不依赖模块加载顺序中的其它 view。

### 2.3 内部状态

```js
var HISTORY_LIMIT = 6;
var REVIEW_TEXT_LIMIT = 64;

var state = {
  mood: 'all',       // W.UI.categories 的 key；'all' 表示不筛
  currentId: null,   // 当前展示的 spot.id
  history: []        // 最近抽中的 spot.id，最新在前，最多 HISTORY_LIMIT 条
};
```

字段语义与不变量：

| 字段 | 类型 | 初始值 | 不变量 |
|---|---|---|---|
| `mood` | `string` | `'all'` | 必须是 `W.UI.categories` 中存在的 key（`all/food/fun/nature/photo/night/other`）；非法值回退 `'all'` |
| `currentId` | `string \| null` | `null` | 非 null 时必须能在当前 `mood` 的候选池里找到；`render()` 时校验，失效则重抽 |
| `history` | `string[]` | `[]` | 只存已成功展示过的 id；`unshift` 去重后 `slice(0, HISTORY_LIMIT)`；切换 `mood` 时清空 |

状态生命周期：

- **模块级持久**：用户在 `#/whereto` 点「就去这里」→ 详情 → 浏览器后退/再次点 tab 回到 `#/whereto`，仍显示上次结果（不重新随机），符合"我刚刚抽到的那个"预期；
- **刷新页面重置**：整页 reload 后 `state` 回到初始值，重新抽；
- **Store 重置后**：`W.Store.reset()` 不通知 whereto，但下次 `render()` 会拿新数据校验 `currentId`，不存在则重抽，不会显示幽灵卡。

### 2.4 随机选择策略

核心目标：**不要连续抽到同一张卡**；筛选后必须在新池里重抽；池子只有 1 个地点时不能死循环。

推荐纯函数（无副作用，便于预测）：

```js
function pickSpot(pool, excludeId, history, rng) {
  if (!pool || !pool.length) return null;

  // 1) 先排除当前卡
  var candidates = pool.filter(function (s) { return s.id !== excludeId; });

  // 2) 池子只有 1 个（或排除后为空）时，只能保留它
  if (!candidates.length) candidates = pool.slice();

  // 3) 软避重：优先抽近期没出现过的；全抽过就允许重复（不会卡死）
  var fresh = candidates.filter(function (s) { return history.indexOf(s.id) === -1; });
  if (fresh.length) candidates = fresh;

  // 4) 随机下标（rng 默认 Math.random，可由测试注入）
  var index = Math.floor(rng() * candidates.length);
  index = Math.max(0, Math.min(candidates.length - 1, index));
  return candidates[index];
}
```

调用规则：

| 场景 | `excludeId` | 是否清空 `history` | 结果要求 |
|---|---|---|---|
| 首次进入 / 无当前卡 | `null` | 否 | 从当前池随机 1 个 |
| 点「换一个」 | `state.currentId` | 否 | 池 >1 时必须与旧卡不同 |
| 切换心情 | `state.currentId`（或 null） | **是**（先清空） | 在新分类池里随机；池为空展示 no-match |
| 返回页面（`currentId` 仍有效） | — | — | 不重抽，保留上次卡 |
| Store 重置 / 卡片 id 失效 | `null` | 否 | 重新抽；池空展示 no-spots |
| 池只有 1 个地点 | `state.currentId` | 否 | 允许同一卡；可 toast「今天只有一个地点可选」 |

实现细节：

- `rng` 默认 `Math.random`；生产不覆盖。测试可注入 `window.__WQWN_TEST_RNG__`（函数）以获得稳定序列，详见 §6.3。
- 若 `pool.length > 1` 且排除当前后 `candidates` 非空，则抽取结果必然 ≠ `currentId`，这是「换一个」可稳定断言的基础。
- `history` 只影响「优先」，不影响「能否」，因此不会因为历史耗尽而抽不出结果。
- 切换 `mood` 时先 `state.history = []`，避免旧分类的记录压制新分类候选。

### 2.5 DOM 结构

根节点：`<div class="page whereto-page" data-view="whereto">`。推荐树：

```
div.page.whereto-page[data-view="whereto"]
├─ header.whereto-hero
│   ├─ div.page-kicker                     // "ORACLE · 今日盲盒"
│   ├─ h1.page-title                        // "今天去哪"
│   ├─ p.page-deck                          // 一句产品文案（产品文档定稿）
│   └─ span.whereto-mark[aria-hidden=true]  // 装饰符号 "✦" / "?"
├─ section.whereto-mood
│   ├─ div.filter-label-row
│   │   ├─ span.filter-label                // "今天的心情"
│   │   └─ span.filter-label-en             // "MOOD"
│   └─ div.mood-row.chip-row[data-role="mood-row"][role="group"][aria-label="按心情筛选"]
│       ├─ button.chip[data-mood="all"][aria-pressed="true"]        // 全部
│       ├─ button.chip[data-mood="food"][aria-pressed="false"]      // 美食
│       ├─ button.chip[data-mood="fun"] …                            // 玩乐
│       ├─ button.chip[data-mood="nature"] …                         // 自然风景
│       ├─ button.chip[data-mood="photo"] …                          // 拍照打卡
│       ├─ button.chip[data-mood="night"] …                          // 夜生活
│       └─ button.chip[data-mood="other"] …                          // 其他
├─ section.oracle-stage[data-role="oracle-stage"][aria-live="polite"]
│   ├─ article.oracle-card[data-role="oracle-card"][data-spot-id][data-category]
│   │   ├─ div.oracle-cover
│   │   │   ├─ img.oracle-cover-img[alt=spot.title]
│   │   │   ├─ div.oracle-cover-fallback[hidden]     // 图片加载失败时显示
│   │   │   └─ span.oracle-number                    // "NO.01"
│   │   └─ div.oracle-body
│   │       ├─ div.oracle-kicker
│   │       │   ├─ span.oracle-cat-en                // FOOD / PLAY / NATURE…
│   │       │   └─ span.oracle-cat-zh                // W.UI.categoryName()
│   │       ├─ h2.oracle-title[data-role="oracle-title"]
│   │       ├─ div.oracle-meta
│   │       │   ├─ span.oracle-meta-item             // 城市
│   │       │   ├─ span.meta-divider                 // "/"
│   │       │   ├─ span.oracle-meta-item             // W.UI.money(price)
│   │       │   └─ span.oracle-meta-item             // W.UI.stars(rating)
│   │       └─ blockquote.oracle-review[data-role="oracle-review"]
│   │           ├─ span.oracle-review-text           // 「最高评分评论，截断 64 字」
│   │           └─ cite.oracle-review-author         // — 用户名
│   └─ div.whereto-empty[data-role="whereto-empty"][data-reason][hidden]
│       └─ (W.UI.empty(...) 的 .empty 节点，额外加 .whereto-empty 类)
├─ div.oracle-actions[data-role="oracle-actions"]
│   ├─ button.btn.btn-ghost.oracle-redraw[data-action="redraw"][type="button"]   // "↻ 换一个"
│   └─ button.btn.btn-primary.oracle-go[data-action="go-detail"][type="button"]  // "就去这里 →"
└─ span.sr-only[data-role="oracle-announce"][aria-live="polite"]  // 抽签结果播报
```

要点：

- `.oracle-stage` 是**动态区**：只替换其中的 `.oracle-card` / `.whereto-empty`；`.mood-row` 与 `.oracle-actions` 是**稳定区**，避免每次重抽重建按钮导致焦点丢失和重复绑定。
- 空态时：`.oracle-card` 不存在（或 `hidden`），`.whereto-empty` 显示；`.oracle-actions` 加 `hidden` 属性（无卡可操作），切回有结果时移除。
- `.oracle-stage` 不包 `.oracle-actions`，这样 stack 伪元素只作用于卡片，按钮不受影响。
- `aria-live` 放在 `.oracle-stage` 与隐藏播报节点两处之一即可，推荐隐藏播报：`textContent = '抽到了：' + spot.title`，避免整卡重读。`sr-only` 需在 CSS 新增（如无现成类）：`position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;`。

### 2.6 事件与状态流转

| 触发 | 条件 | `state` 变化 | DOM 变化 |
|---|---|---|---|
| `render()`（路由进入/刷新） | `currentId` 存在且仍在当前 `mood` 池中 | 不变 | 直接复用当前卡；不重抽 |
| `render()`（路由进入/刷新） | `currentId` 为空或已失效 | 按 §2.4 抽 1 个，写 `currentId`、更新 `history` | 渲染卡；隐藏空态 |
| 点击 `[data-mood]` chip | key 与当前 `mood` 相同 → 直接 return | — | — |
| 点击 `[data-mood]` chip | key 变化 | `mood = key`；`history = []`；`draw()` | 更新 chip `.is-active` + `aria-pressed`；按新池渲染卡或 no-match 空态 |
| 点击 `[data-action="redraw"]` | `state.mood` 对应池非空 | `draw({ excludeId: state.currentId })`，更新 `currentId/history` | 卡片重建 + `is-drawing` 动画重触发；焦点保留在按钮上 |
| 点击 `[data-action="go-detail"]` | `currentId` 非空 | 不变（详情页自己 `viewSpot` 增长浏览） | `W.Router.go('#/spot/' + encodeURIComponent(state.currentId))` |
| 空态按钮「查看全部」 | `data-reason="no-match"` | `mood='all'`；`history=[]`；`draw()` | 全部 chip 激活；渲染卡 |
| 空态按钮「去发布」 | `data-reason="no-spots"` | 不变 | `W.Router.go('#/publish')` |

`draw(options)` 内部流程（伪代码）：

```
draw({ excludeId, reason }):
  all = try W.Store.listSpots() catch []
  if all.length === 0:
      state.currentId = null
      state.history = []
      showEmpty('no-spots', '还没有可选地点', '先去发布一个地点，再回来抽签。', '去发布', → #/publish)
      return
  pool = state.mood === 'all' ? all : all.filter(s => s.category === state.mood)
  if pool.length === 0:
      showEmpty('no-match', '这个心情还没有地点', '换一个心情，或者看看全部地点。', '查看全部', resetToAll)
      return
  spot = pickSpot(pool, excludeId, state.history, getRng())
  state.currentId = spot.id
  state.history = [spot.id].concat(state.history.filter(id => id !== spot.id)).slice(0, HISTORY_LIMIT)
  hideEmpty(); showActions()
  stage.replaceChild(buildCard(spot), oldCard)
  announce('抽到了：' + spot.title)
  replayAnimation(newCard)   // 移除 .is-drawing → void offsetWidth → 加回
```

### 2.7 渲染骨架建议

```js
function render(root, params) {
  refs.root = root;

  var page = W.UI.el('div', { class: 'page whereto-page', dataset: { view: 'whereto' } });
  page.appendChild(buildHero());
  page.appendChild(buildMoodSection());   // 创建 refs.moodRow 与 chips
  page.appendChild(buildStage());         // 创建 refs.stage / refs.cardHost / refs.emptyHost
  page.appendChild(buildActions());       // 创建 refs.actions / redraw / go
  page.appendChild(buildLiveRegion());    // refs.announce
  root.appendChild(page);

  syncMoodChips();
  var all = safeListSpots();
  var pool = filterByMood(all, state.mood);
  if (state.currentId && pool.some(s => s.id === state.currentId)) {
    paintSpot(findById(pool, state.currentId), { animate: false });
  } else {
    draw({ excludeId: null });
  }
}
```

`params` 不使用，但保留签名以符合 Router 调用约定。`refs` 在每次 `render()` 开头重置，避免引用上一轮已销毁的 DOM（Router 会 `root.innerHTML = ''`）。

---

## 3. 数据流

### 3.1 读取：只读 `W.Store.listSpots()`

`W.Store.listSpots(filter)` 的行为（`js/store.js:127-158`）：

- 无参调用返回全部 `spot` 的深拷贝（`clone`），按 `createdAt` 降序；
- 支持 `{ q, category, near }` 过滤，`category: 'all'` 等于不过滤；
- 返回值是副本，**修改它不会写回 Store**。

whereto 采用**一次读取 + 本地过滤**，便于同时拿到"全量"和"筛选池"两个数：

```js
function safeListSpots() {
  try {
    var list = W.Store.listSpots() || [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (window.console && console.error) console.error(e);
    return [];
  }
}

function filterByMood(all, mood) {
  if (!mood || mood === 'all') return all;
  return all.filter(function (s) { return s && s.category === mood; });
}
```

为什么不用 `listSpots({ category: mood })`：需要区分「一个地点都没有」（no-spots）和「这个分类没有地点」（no-match），一次全量读取即可同时判断；且每次抽取都重新读，发布新地点后回到本页即可看到（无需订阅 Store）。

### 3.2 最高赞评论

评论模型（`js/store.js:309-333`）字段：`id/userId/userName/rating/content/createdAt/photos`，**没有评论点赞字段**。因此产品叫「最高赞评论」时，实现口径与首页 `home.js:85-97` 的 `topComment()` 保持一致：**评分最高，同分取最新**。

```js
function topComment(comments) {
  var best = null;
  (comments || []).forEach(function (c) {
    if (!c) return;
    if (!best) { best = c; return; }
    var rating = Number(c.rating) || 0;
    var bestRating = Number(best.rating) || 0;
    if (rating > bestRating ||
      (rating === bestRating && (c.createdAt || 0) > (best.createdAt || 0))) {
      best = c;
    }
  });
  return best;
}
```

展示规则：

- 有评论：`W.UI.stars(review.rating)` + 「「」引号包裹的 `trimText(review.content, 64)` + `— review.userName || '匿名'`；
- 无评论：`.oracle-review.oracle-review--empty` 显示「还没有评价，等你来做第一个分享的人。」，不显示星星；
- `trimText` 用 `Array.from(text)` 按 Unicode 字符截断，避免 emoji 被切半（同 `home.js:71-75`）；内容为空字符串视同无评论。

### 3.3 封面图与降级

优先级：`spot.cover → (spot.images || [])[0] → topReview.photos[0] → ''`。

- 无 URL：显示 `.oracle-cover-fallback`（`✦` + `CATEGORY_EN[spot.category] || 'PLACE'`），样式复用 `home.js` 的 `spot-thumb-fallback` 视觉思路；
- 有 URL：`img.loading='lazy'`、`decoding='async'`、`alt=spot.title`；监听 `error` → `img.style.display='none'`，追加 fallback（参考 `home.js:203-220`）；
- 不使用外链图片；种子封面全部是 `assets/photos/` 本地文件。

### 3.4 0 数据、异常与空态

| 情形 | 判定 | `data-reason` | 标题 / 描述 / 动作 |
|---|---|---|---|
| 全站 0 地点 | `all.length === 0` | `no-spots` | 「还没有可选地点」/「先去发布一个地点，再回来抽签。」/「去发布」→ `#/publish` |
| 当前心情 0 地点 | `all.length > 0 && pool.length === 0` | `no-match` | 「这个心情还没有地点」/「换一个心情，或者看看全部地点。」/「查看全部」→ mood='all' 重抽 |
| `listSpots()` 抛异常 | `catch` 后视作 `[]` | `no-spots` | 同上；可选 `console.error` 便于排查 |
| `currentId` 对应地点被删/换库 | `render` 校验池中不存在 | — | 直接重抽，不展示旧卡 |

空态容器：先 `W.UI.empty(...)` 生成 `.empty`，再 `className += ' whereto-empty'`、`dataset.role='whereto-empty'`、`dataset.reason=reason`。空态只替换 `.oracle-stage` 内容，心情 chips 仍可点击，保证用户可自救。

---

## 4. 复用 `W.UI` API

所有 DOM 一律用 `W.UI.el` 构建，禁止手写字符串拼接 HTML（避免 XSS 与转义遗漏）。

| API | 签名 | 在 whereto 的用途 | 注意 |
|---|---|---|---|
| `W.UI.el` | `el(tag, attrs, children) => HTMLElement` | 构建全部节点；`attrs` 支持 `class`、`dataset`、`onClick`、`type`、`hidden`、`aria-*` | `children` 为字符串且以 `<` 开头时会被 `insertAdjacentHTML`（`ui.js:39-46`）；用户评论/标题拼字符串时先加前缀「「」或走 `textContent` |
| `W.UI.icon` | `icon(name, cls) => string`（SVG 字符串） | 「就去这里」可加 `icon('arrow')`；空态由 `W.UI.empty` 内部用 `pin` | 现有 key：`search/arrow/back/pin/clock/users/heart/comment/eye/bookmark/star/plus/close/external/calendar/check`；无需新增；「换一个」用文本 `↻` 更轻 |
| `W.UI.money` | `money(n) => string` | 价格：`0 → '免费'`、非法/空 → `''`、其余 `¥n` | 不要自己拼 `¥`；详情页同款口径 |
| `W.UI.categoryName` | `categoryName(cat) => string` | 结果卡中文分类；`other/未知 → '其他'` | 英文 kicker 需本文件维护 `CATEGORY_EN`（与 `home.js:13-20` 一致） |
| `W.UI.stars` | `stars(rating) => string` | 评论星级 `'★★★★☆'` | 自动 `Math.round` 并 clamp 0–5；`null` 返回 `'☆☆☆☆☆'` |
| `W.UI.empty` | `empty(title, desc, actionText, onAction) => HTMLElement` | 两种空态 | 返回 `.empty`；需要追加 `.whereto-empty` 类与 `data-*` |
| `W.UI.toast` | `toast(msg, type, ms)`（可选） | 「今天只有一个地点可选」「已换一个」等轻提示 | 不阻断主流程；同屏会被新 toast 顶掉 |
| `W.UI.pics` | `string[]`（可选） | 不需要 | 抽签卡只用 spot 自带图 |

安全提示：`W.UI.el` 的字符串子节点若以 `<` 开头会被当作 HTML 片段。评论内容来自用户输入，展示时统一写成 `W.UI.el('span', {}, '「' + content + '」')` 或先设置 `textContent`，绝不要把 `content` 直接作为 children。

---

## 5. CSS 要点

所有新增样式追加到 `css/style.css` 末尾（建议新开 `/* ---------- 17. Whereto ---------- */` 段，放在现有 `16. Page motion` 之后、`17. Desktop framing` 之前或直接末尾均可），只使用现有 token：`--paper/--paper-2/--paper-3/--ink/--ink-2/--muted/--muted-2/--line/--accent/--accent-ink/--serif/--sans/--mono/--shell/--pad/--tabbar-h`。

### 5.1 5 列 tabbar（唯一必须修改的既有规则）

`css/style.css:174-190` 当前：

```css
#tabbar {
  ...
  grid-template-columns: repeat(4, 1fr);
  ...
}
```

改为：

```css
#tabbar {
  ...
  grid-template-columns: repeat(5, 1fr);
  ...
}
```

影响评估：

- `#tabbar` 高度不变（`--tabbar-h: 64px` + safe-area），5 列每列宽度 430/5 = 86px、360/5 = 72px，`.tab-icon` 20px、`.tab-label` 8px 均可容纳；
- `.tab-publish .tab-icon` 是 46px 圆形 + `margin-top: -20px`，第 3 列（5 列正中）水平居中，无需额外 `transform`；
- 现有 `.tab[aria-current='page']:not(.tab-publish)::before` 顶部 28px 短线仍按每个 tab 居中，无需改；
- 不要给 `#tabbar` 加 `gap`：会破坏 5 等分的视觉节奏，且出版圆钮的对齐会受影响。

### 5.2 whereto 页面样式要点

| 类名 | 作用 | 关键样式 |
|---|---|---|
| `.whereto-page` | 页面根 | 继承 `.page` 的左右内边距；`padding-bottom: 28px`；可选 `overflow: hidden` 防装饰溢出 |
| `.whereto-hero` | 标题区 | `position: relative; padding: 30px var(--pad) 16px; border-bottom: 1px solid var(--ink);` 复用 `.page-kicker/.page-title/.page-deck` 排版 |
| `.whereto-mark` | 装饰符号 | 绝对定位到右上，`font-family: var(--serif); font-size: 96px; color: var(--paper-3); line-height: 1; pointer-events: none;`，不参与布局 |
| `.whereto-mood` | 心情区 | `padding: 18px var(--pad) 0;` |
| `.mood-row` | chips 行 | 直接复用 `.chip-row` 的横向滚动；`gap: 7px`；`padding-bottom: 2px`；小屏可滑动 |
| `.oracle-stage` | 抽签舞台 | `position: relative; margin: 26px var(--pad) 0; padding: 0 2px;` 作为 stack 伪元素定位上下文 |
| `.oracle-card` | 结果卡 | `position: relative; z-index: 1; border: 1px solid var(--ink); background: var(--paper); box-shadow: 0 16px 36px rgba(17,17,16,.10);` |
| `.oracle-cover` | 封面区 | `position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--paper-2); border-bottom: 1px solid var(--line);` |
| `.oracle-cover-img` | 封面图 | `width:100%; height:100%; object-fit:cover; filter: saturate(.82) contrast(1.03) sepia(.06);` |
| `.oracle-cover-fallback` | 无图/加载失败 | flex 居中，`✦` + 分类英文，参考 `.spot-thumb-fallback` |
| `.oracle-number` | 编号角标 | 左上角，`background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 8px; padding: 4px 7px;` |
| `.oracle-body` | 文字区 | `padding: 18px var(--pad) 20px;` |
| `.oracle-kicker` | 分类行 | mono 7px、`letter-spacing: .14em`、`color: var(--accent-ink)`；中文分类 `.oracle-cat-zh` 用 sans 10px |
| `.oracle-title` | 地点标题 | `font-family: var(--serif); font-size: 27px; font-weight: 600; line-height: 1.32; margin: 6px 0 10px;` |
| `.oracle-meta` | 元信息 | `display:flex; flex-wrap:wrap; gap:6px; font-family: var(--mono); font-size: 8px; color: var(--muted);` 分隔符用 `.meta-divider` |
| `.oracle-review` | 评论引用 | `margin: 14px 0 0; padding: 10px 0 0 12px; border-top: 1px solid var(--line); border-left: 2px solid var(--accent); font-family: var(--serif); font-size: 14px; line-height: 1.8; color: var(--ink-2);` |
| `.oracle-review-author` | 评论者 | block，`margin-top: 6px; font-family: var(--mono); font-size: 7.5px; color: var(--muted-2); font-style: normal;` |
| `.oracle-actions` | 操作区 | `display: flex; gap: 10px; margin: 22px var(--pad) 0;`；`.oracle-actions .btn { flex: 1; }`；`.oracle-actions[hidden] { display: none; }` |
| `.oracle-redraw` | 换一个 | `flex: 0 0 40%;`（次要动作）；`.oracle-go { flex: 1; }` |
| `.whereto-empty` | 空态 | 复用 `.empty` 虚线框；`margin: 0 2px;`；必须和卡片同宽，避免跳变 |
| `.sr-only` | 读屏专用 | 见 §2.5 |

### 5.3 结果卡的 stack 效果

用 `.oracle-stage::before / ::after` 两片纸做「一叠卡」的层次感，不额外加 DOM：

```css
.oracle-stage::before,
.oracle-stage::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  top: 10px;
  bottom: -6px;
  z-index: 0;
  border: 1px solid var(--line);
  background: var(--paper-2);
  pointer-events: none;
}
.oracle-stage::before { transform: rotate(-1.4deg); }
.oracle-stage::after  { transform: rotate(1.1deg) translateY(5px); background: var(--paper-3); }
```

要点：

- `z-index: 1` 的 `.oracle-card` 要高于伪元素；`.oracle-actions` 在 stage 外部，不受影响；
- `pointer-events: none` 防止伪元素遮挡卡片点击；
- 旋转角度控制在 1–2°，不要抢标题；`prefers-reduced-motion` 下保留静态层，不参与动画。

### 5.4 抽卡动画与 reduced motion

```css
.oracle-card.is-drawing {
  animation: oracle-draw 0.36s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes oracle-draw {
  from { opacity: 0; transform: translateY(10px) rotate(-0.6deg) scale(0.985); }
  to   { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
}
```

- 每次重抽先 `card.classList.remove('is-drawing')` → 强制 reflow（`void card.offsetWidth`）→ 再加回，保证动画可重复触发；
- 不写 `setTimeout` 清理，避免快速连点时旧 timer 操作新节点；
- `css/style.css:2512-2519` 已有全局 `@media (prefers-reduced-motion: reduce)` 会把 `animation-duration` / `transition-duration` 压到 `0.01ms`，本功能不需要额外媒体查询；不要用 JS 判断并跳过渲染，直接依赖 CSS 即可。

### 5.5 响应式（430 / 360 / 桌面）

| 断点 | 处理 |
|---|---|
| `--shell: 430px`（默认） | 页面本身就是 430px 手机画布；`.oracle-title` 27px、`.oracle-body` 20px 内边距为基准 |
| `@media (max-width: 360px)` | 全局 `--pad: 16px` 已生效；追加：`.oracle-title { font-size: 22px; }`、`.oracle-body { padding: 14px 16px 18px; }`、`.oracle-cover { aspect-ratio: 4 / 3; }`、`.oracle-actions { gap: 8px; }`、`.oracle-actions .btn { padding: 12px 14px; font-size: 9px; }` |
| `@media (min-width: 640px)` | 沿用桌面居中 430px 画布，不新增布局；`#tabbar` 仍 `max-width: var(--shell)` 居中 |
| 横向溢出 | `.mood-row` 用 `.chip-row` 的 `overflow-x: auto`；`.whereto-page` 不设 `width` 超过 100%；长标题加 `word-break: break-word;`；验收见 §6.2 第 8 条 |

---

## 6. 可测试选择器与 Playwright 验证点

### 6.1 `data-*` 契约（实现必须保留）

| 选择器 | 所在节点 | 用途/断言 |
|---|---|---|
| `[data-view="whereto"]` | `.whereto-page` | 确认页面已挂载 |
| `#tabbar [data-tab]` | 5 个 `<a>` | 断言数量=5、顺序=`home,whereto,publish,buddies,profile` |
| `#tabbar [data-tab="whereto"][aria-current="page"]` | 当前 tab | 断言高亮 |
| `[data-role="mood-row"]` | `.mood-row` | 心情筛选容器 |
| `[data-mood="food"]` 等 | 每个 chip | 点击筛选；`aria-pressed="true/false"` 断言选中态；`is-active` 类同步 |
| `[data-role="mood-count"]`（可选） | 计数 span | 显示当前池数量，便于断言筛选结果 |
| `[data-role="oracle-stage"]` | `.oracle-stage` | 抽签动态区 |
| `[data-role="oracle-card"]` | `.oracle-card` | 结果卡存在；带 `data-spot-id`、`data-category` |
| `[data-role="oracle-title"]` | `h2` | 断言标题与 Store 数据一致 |
| `[data-role="oracle-review"]` | `blockquote` | 断言评论内容/作者；无评论时是否存在 `--empty` |
| `[data-role="whereto-empty"]` | 空态 | 带 `data-reason="no-spots" / "no-match"` |
| `[data-action="redraw"]` | 换一个按钮 | 点击重抽 |
| `[data-action="go-detail"]` | 就去这里按钮 | 点击跳详情 |
| `[data-role="oracle-announce"]` | sr-only 播报 | 可选：断言 `textContent` 含「抽到了」 |

命名约定：`data-role` 只用于「读/断言」，`data-action` 只用于「可点击操作」，不要混用；不要把业务 id 写进 class（class 只表达样式）。

### 6.2 Playwright 验证点（至少覆盖以下 9 条）

前置：本地静态服务 `python -m http.server 8080`，打开 `http://127.0.0.1:8080/`；每个用例前用 `page.evaluate(() => W.Store.reset())` 或 `localStorage.removeItem('wqwn.v3')` + reload 恢复种子。种子数据 10 个地点，足够验证「不重复」。

| # | 用例 | 断言 |
|---|---|---|
| 1 | 五个 tab 与顺序 | `$$eval('#tabbar [data-tab]', els => els.map(e => e.dataset.tab))` 深等于 `['home','whereto','publish','buddies','profile']`；`.tab` 数量 5 |
| 2 | 进入 whereto 且高亮 | 点 `[data-tab="whereto"]` → URL 含 `#/whereto`；`[data-view="whereto"]` 可见；`[data-tab="whereto"]` 有 `aria-current="page"` |
| 3 | 初始随机卡 | `[data-role="oracle-card"]` 存在；`data-spot-id` ∈ `W.Store.listSpots().map(s=>s.id)`；标题 = `W.Store.getSpot(id).title` |
| 4 | 心情筛选 | 点 `[data-mood="food"]` → 卡 `data-category === 'food'`；chip `aria-pressed="true"`；其余 chip `aria-pressed="false"`；无结果时显示 `[data-role="whereto-empty"][data-reason="no-match"]` |
| 5 | 换一个不连续重复 | 记录旧 `data-spot-id`，点 `[data-action="redraw"]`，新 id ≠ 旧 id；连续点 5 次，每次都 ≠ 上一次，且都 ∈ 当前池 |
| 6 | 就去这里跳详情 | 记录卡 id 与标题；点 `[data-action="go-detail"]` → URL 匹配 `/#\/spot\/.+/`；详情页 `.hero-title` 文本 = 卡标题 |
| 7 | 空态（0 数据） | `localStorage.setItem('wqwn.v3', JSON.stringify({version:1,currentUserId:'u1',users:[],spots:[],buddies:[]}))` 后 reload `#/whereto` → `[data-role="whereto-empty"][data-reason="no-spots"]` 可见，`oracle-card` 数量 0，`[data-action="redraw"]` 隐藏 |
| 8 | 430/360 无横向溢出 | `page.setViewportSize({width:360,height:800})`；`document.documentElement.scrollWidth <= window.innerWidth`（允许 0，不允许正数）；430 同理；5 个 tab 宽度相等（误差 ≤1px），publish 的中心 = tabbar 中心（误差 ≤1px） |
| 9 | 连点稳定性 / reduced motion | 快速点击 `[data-action="redraw"]` 8 次：页面仅 1 张 `.oracle-card`、无 console error、按钮仍可点；`emulateMedia({reducedMotion:'reduce'})` 下卡片立即可见（`getComputedStyle(card).animationDuration` 为 `0.01ms`） |

### 6.3 随机数测试稳定性

随机是唯一不确定源，策略：

1. **只断言不变量，不断言具体 id**：初始卡 id 属于当前池；「换一个」≠ 上一张；筛选后 `data-category` 匹配。不要写 `expect(id).toBe('s1')` 这类脆弱断言。
2. **单测纯函数**：如果实现把 `pickSpot` 暴露为模块内私有，可通过「池为 1 时必返回该 id」「池为 2 且 exclude 当前时必返回另一张」等边界断言，不依赖 Math.random 分布。
3. **可选 RNG seam（供 QA 用，非生产依赖）**：实现里 `var rng = typeof window.__WQWN_TEST_RNG__ === 'function' ? window.__WQWN_TEST_RNG__ : Math.random;`，Playwright 可在 `page.addInitScript(() => { let i=0; window.__WQWN_TEST_RNG__ = () => [0.1,0.7,0.3][i++%3]; })` 注入固定序列，截图/快照稳定。若实现者不采用，第 1、2 条已足够覆盖。

### 6.4 参考测试脚手架

```js
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/#/whereto');
  await page.evaluate(() => W.Store.reset());
  await page.reload();
});

test('5 tabs + whereto card + redraw', async ({ page }) => {
  const tabs = await page.$$eval('#tabbar [data-tab]', els => els.map(e => e.dataset.tab));
  expect(tabs).toEqual(['home', 'whereto', 'publish', 'buddies', 'profile']);
  await expect(page.locator('[data-view="whereto"]')).toBeVisible();
  const card = page.locator('[data-role="oracle-card"]');
  const before = await card.getAttribute('data-spot-id');
  await page.click('[data-action="redraw"]');
  await expect(card).not.toHaveAttribute('data-spot-id', before);
});

test('mood filter + go detail', async ({ page }) => {
  await page.click('[data-mood="food"]');
  await expect(page.locator('[data-role="oracle-card"]')).toHaveAttribute('data-category', 'food');
  const title = await page.locator('[data-role="oracle-title"]').textContent();
  await page.click('[data-action="go-detail"]');
  await expect(page).toHaveURL(/#\/spot\/.+/);
  await expect(page.locator('.hero-title')).toHaveText(title);
});
```

---

## 7. 风险与边界

### 7.1 路由跳详情后的 tab 高亮（已知，v1 接受）

- **现象**：`js/app.js` 中 `/spot/:id` 路由固定 `tab: 'home'`。从「去哪」点「就去这里」后，详情页底部高亮会变为「首页」而不是「去哪」。这是现有路由契约的自然结果（详情属于首页浏览叙事），不影响功能与链接正确性。
- **v1 决策**：不改 Router，接受该行为。理由：改动 Router 需要引入"来源 tab"状态，`W.Router.go()` 内部先 `render(path)`、随后 hashchange 还会再触发一次 `render()`，简单的 `lastRoute` 判断会在第二次渲染退化；引入 `tabOverride` 又增加回归面，收益仅是视觉高亮，风险大于收益。
- **备选（若产品坚持保留来源高亮，单独开 task）**：
  1. `W.Router.go(hash, options)` 增加可选 `tab` 覆盖，路由匹配后暂存 `tabOverride = { key: 'detail', tab: 'whereto' }`，仅在当前 `route.key === 'detail'` 时应用，离开详情清空；
  2. 或在详情页返回按钮/面包屑上明确「返回去哪」，用导航语义弥补 tab 高亮，不改路由；
  3. 不建议 `#/spot/:id?from=whereto`：现有 `^\/spot\/([^/]+)$` 正则不匹配 query，会落到 unknown → 重定向 `/home`，属于破坏性改动。

### 7.2 随机数测试不稳定

- **风险**：`Math.random()` 让「初始卡」「换一个」的断言依赖概率；若测试断言具体 id 会偶发失败（10 个地点时「换一个」同卡概率虽低但非零）。
- **规避**：实现必须保证池 >1 时排除当前 id（确定性不重复）；测试只断言集合归属与「新 ≠ 旧」；可选 `window.__WQWN_TEST_RNG__` 注入固定序列（§6.3）。CI 上不要跑概率性「连抽 100 次不重复」类断言。

### 7.3 重复点击「换一个」/ 快速切换心情

- **风险**：旧实现若用 `setTimeout` 做动画清理，快速点击会让旧 timer 移除新卡的 class，导致动画丢失；连续点击可能叠加多个卡片节点或焦点跳走。
- **规避**：`draw()` 同步更新 `state` 与 DOM；`.oracle-card` 每次整体替换（只保留一个）；动画用「移除 class → 强制 reflow → 加 class」，不写 timer；`[data-action="redraw"]` 在无候选（no-spots/no-match）时 `hidden` 且点击早退；空态与卡之间切换用 `hidden` 而不是重复 append。

### 7.4 只有一个候选地点

- **风险**：`excludeId` 排除后池为空，若代码写成 `while (next.id === currentId)` 会死循环；用户感觉「换一个没反应」。
- **规避**：按 §2.4 的回退逻辑直接返回该唯一地点；可用 `W.UI.toast('今天只有一个地点可选', 'info')` 提示；测试覆盖池=1 的场景（可用分类筛选构造，或临时 localStorage 只留 1 个 spot）。

### 7.5 图片/评论/字段缺失

- **风险**：`spot.cover` 为空、图片 404、`comments` 为空数组、`spot.title` 为空、旧 localStorage 数据缺字段。
- **规避**：封面三级回退 + `img.onerror`；评论 `topComment` 做 null 判断；标题 `spot.title || '未命名地点'`；`W.Store.normalize` 已补齐 `spots/buddies/users`，但视图仍用防御式读取（`(spot.images || [])`、`(spot.comments || [])`）。不要假设 `price` 是数字，统一走 `W.UI.money()`。

### 7.6 底部 tabbar 5 列回归

- **风险**：只改 `index.html` 不把 `grid-template-columns` 改为 5 列 → 5 个 tab 挤在 4 列里换行/溢出；或只改 CSS 不改 DOM 顺序 → 发布圆钮不在正中。
- **规避**：两处必须成对修改（§1.1 + §5.1）；验收 360/430 两档：5 个 tab 等宽、publish 圆形凸起居中、无横向滚动、`aria-current` 只在当前 tab。

### 7.7 视图状态与 Store 重置不一致

- **风险**：用户在「我的」点「重置演示数据」后回到「去哪」，`state.currentId` 还是旧 id（种子重置后 id 可能相同，但若旧数据是用户新增的 id 则不存在），会渲染空卡或报错。
- **规避**：`render()` 与 `draw()` 每次都重新 `listSpots()` 并用 `currentId` 在池中校验；找不到直接重抽；`buildCard` 前判空。

### 7.8 安全 / 可访问性边界

- **XSS**：`W.UI.el` 对以 `<` 开头的字符串子节点走 `insertAdjacentHTML`，用户评论/标题不可直接作为 children 传入；统一加「」前缀或设置 `textContent`。
- **A11y**：chips 必须有 `aria-pressed`；卡片图 `alt` 用地点名；`.oracle-stage` 或隐藏播报节点用 `aria-live="polite"`；操作按钮 `type="button"`；装饰伪元素/符号 `aria-hidden="true"`；键盘 Tab 顺序：chips → 换一个 → 就去这里。
- **触控**：按钮最小高度建议 ≥44px（`.btn` 现有 padding 13px + 字号已接近 44px，360 下不要压到 40px 以下）。

---

## 8. 实现顺序与 Definition of Done

### 8.1 建议实现顺序（task-3）

1. `index.html`：调整 tabbar 顺序 + 插入 whereto tab；
2. `js/app.js`：加路由；
3. `js/views/whereto.js`：先静态骨架 + 假数据渲染，再接 `W.Store.listSpots()`；
4. `css/style.css`：5 列 tabbar → whereto 基础排版 → stack/动画 → 360 适配；
5. 手工走查 + Playwright 9 条用例 + 原有 25 项回归。

### 8.2 DoD 检查清单

- [ ] `#tabbar` 5 个 tab，顺序 `home/whereto/publish/buddies/profile`，publish 是第 3 个且圆形凸起居中；
- [ ] `#/whereto` 可直接访问、可刷新、无白屏；
- [ ] 初始随机卡存在，标题/分类/城市/价格/最高评分评论/图片均正确；
- [ ] 心情 chips 切换后只出现对应分类；无结果时 `data-reason="no-match"`；
- [ ] 「换一个」池 >1 时必不相同；连点 8 次无重复节点、无报错；
- [ ] 「就去这里」跳转 `/spot/:id`，详情标题与卡标题一致；
- [ ] 0 地点时 `data-reason="no-spots"`，不影响其它页面；
- [ ] 430/360 无横向溢出，tabbar 5 列等宽；
- [ ] `prefers-reduced-motion: reduce` 下无长动画；
- [ ] 不修改 `js/store.js` / `js/seed.js`，不新增依赖，不新增 localStorage key；
- [ ] 原有 25 项自动化流程与六视图截图回归通过。

---

## 9. 与其它文档的关系

- 产品定义、用户旅程、验收文案以 `docs/team/product-whereto.md` 为准；本文只定「怎么接、暴露什么、DOM/数据/样式契约」。
- 若产品文案与本文示例文案不一致，**结构、状态机、`data-*` 契约不变**，仅替换 `.whereto-hero` 的 kicker/title/deck 与空态文案。
- 开发实现完成后，QA 按 `docs/team/qa-whereto.md` 执行；选择器以 §6.1 为准。
