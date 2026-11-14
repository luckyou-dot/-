# R13 避雷 / 实况评论 + R10 城市探索护照打卡 · 产品验收规格

- 项目：出来去哪玩（WQWN）· 纯前端零构建原型（localStorage key `wqwn.v3`）
- 版本：v1.0（2026-11-13）
- 作者：product-designer
- 状态：已评审并实现（2026-11-13）
- 范围：阶段 10 优先级 1（R13）与优先级 2（R10）的产品行为、DOM 契约与验收标准；不涉及代码实现
- 关联契约：`C-STORE@1`、`C-UI@1`、`C-VIEW@1`、`C-DETAIL-REDESIGN@1`；本文新增 `C-R13@1`、`C-R10@1`

---
## 0. 决策摘要（TL;DR）

- **详情页按“先避雷、再打卡、后地址”的顺序组织**：统计条之后是避雷提示，随后是城市护照打卡卡，再接既有地址、信息、关于、实况、评论；hero、四项统计条、评论结构不动。
- **避雷是轻量表态**：每用户每地点最多 1 条，6 个固定标签，备注可选且 ≤60 字；可修改、可取消，不新增第二条。**实况是现场情报**：1–140 字 + 最多 3 张内置图库照片，倒序展示最新 8 条。**打卡是幂等动作**：`State.checkins` 同一用户同一地点只记 1 条，重复点击不产生第二条；个人中心新增「护照 PASSPORT」分段，含封面式 4 项统计、城市印章网格与 6 枚固定徽章。
- **技术边界不变**：只读写 `localStorage` 的 `wqwn.v3`，不新增网络请求、不新增路由、不新增底部 tab、不引入第三方库。

---
## 1. 用户价值与目标

### 1.1 要解决的问题

| 功能 | 现状 | 用户损失 | 本次改变 |
|---|---|---|---|
| R13 避雷 / 实况 | 详情页只有官方描述与好评式评论，看不到“此刻怎样”“哪里可能踩雷” | 到现场才发现排队、关闭、名不副实，白跑一趟 | 增加“避雷提示 + 实况速报”两层现场情报 |
| R10 城市探索护照 | 点赞、收藏只代表“想去”，没有“去过”的记录 | 逛完就忘，缺少探索下一站的动力 | 一次点击留下脚印，用护照、城市印章和徽章把到访变成可回看的资产 |

### 1.2 目标用户与场景

| 场景 | 用户动作 | 期望结果 |
|---|---|---|
| 周五 18:30 准备出门 | 打开 `#/spot/s1`，先看避雷人数和最新实况 | 30 秒内判断“现在去会不会踩雷” |
| 已经到地点附近 | 发一条实况“排队 10 分钟，日落 17:20 最好看” | 后来者看到 10 分钟前的事实，而不是旧攻略 |
| 刚逛完一个地点 | 在详情页点「打卡签到」 | 一次点击完成，toast 告诉我是第几个脚印、是否获得新徽章 |
| 周末回看个人中心 | 点「护照」分段看封面统计、城市印章和徽章墙 | 知道自己去过几处、几座城、还差什么徽章 |

### 1.3 产品目标与衡量口径

- **R13 可发现**：进入任一详情，向下 2 屏内看到避雷人数与实况区；两者都有明确空态。
- **R13 可完成**：从详情到提交避雷 ≤3 次点击；到发布实况 ≤3 次点击。
- **R13 可持久**：提交后刷新仍存在；同一用户对同一地点的避雷记录始终 ≤1 条。
- **R10 可完成**：详情打卡 1 次点击完成；重复点击或重复调用不新增记录。
- **R10 可解释**：护照 4 项统计、6 枚徽章均可由 `checkins` 与地点分类复算；未获得徽章显示真实进度。
- **R10 可回看**：城市印章点击可回到对应地点详情。
- **全局底线**：无新增 JS 报错；评论、点赞、收藏、发布、搭子、个人中心原有分段全部不回归。

### 1.4 设计原则

1. **事实优先于评价**：避雷与实况指向“此刻/最近的事实”，不做星级、不做长篇攻略。
2. **轻量表达**：避雷是标签 + 可选备注，实况是短句 + 少量图库照片，不增加写作负担。
3. **不制造焦虑**：用“N 人在这里踩过雷”陈述事实，不夸大、不排序恐吓；空态友好。
4. **可撤回**：避雷可改可撤，实况本人可删，所有写操作都有 toast 回执。
5. **荣誉可解释**：每枚徽章都有明确目标与当前进度，用户知道下一枚怎么拿。

---
## 2. 信息架构与页面结构

### 2.1 页面地图

| 页面 | 路由 | 新增区块 | 位置 |
|---|---|---|---|
| 地点详情 | `#/spot/:id` | `section.warn-panel` 避雷提示 | `detail-stats` 之后、`detail-route` 之前 |
| 地点详情 | `#/spot/:id` | `section.checkin-card` 城市护照打卡 | 避雷面板之后、`detail-route` 之前 |
| 地点详情 | `#/spot/:id` | `section.live-section` 实况速报 | `detail-desc`（ABOUT）之后、`comment-section`（COMMENTS）之前 |
| 个人中心 | `#/profile` | `div.archive-section.passport-section` 护照分段 | 分段第 2 项「护照 / PASSPORT」，原有 5 段顺序不变 |
| 数据层 | 无新路由 | `State.checkins`、`Spot.live`、`Spot.warns` | 只做增量字段与只读查询，不改变既有字段 |

### 2.2 C-R13@1：避雷提示与实况速报（READY）

- Provider / Consumers: **P1**（`js/store.js`、`js/seed.js` 提供数据与写操作） / **C1**（`js/views/detail.js` 唯一渲染消费者）、**S1**（`css/style.css` 仅追加样式）
- Ownership（写集互斥）：P1 只写 `js/store.js`、`js/seed.js`；C1 只写 `js/views/detail.js`；S1 只追加 `.warn-*`、`.live-*` 样式。均不得修改 `index.html`、`js/app.js`、`js/views/profile.js`、`js/ui.js`。
- Requirements: R13

**数据模型（Spot 增量字段，旧数据在 `init` 时内存补 `[]`）：**

```js
Spot.live: Array<{ id, userId, userName, content, photos: string[], createdAt }>
// content 1–140 字（trim 后非空）；photos 0–3 张，只能来自 W.UI.pics
Spot.warns: Array<{ id, userId, userName, tags: string[], content, createdAt }>
// tags 为固定 6 值中至少 1 个并去重；content 可选 ≤60 字；同一 spot 内 userId 唯一
```

**Public surface：**

```js
W.Store.getWarnTags() => string[]   // ['排队太久','名不副实','环境嘈杂','性价比低','交通不便','临时关闭']
W.Store.getWarnInfo(spotId, userId) => { count, tags: [{name, count}], myWarn: Warn|null, latest: Warn|null }
// tags 仅返回出现过的标签；计数降序，同分按固定顺序；count 按 userId 去重
W.Store.setWarn(spotId, {userId, userName, tags, content})
  => {ok:true, created:boolean, warn:Warn} | {ok:false, error:'INVALID_WARN'|'NOT_FOUND'|'NOT_FOUND_USER'}
// 同一 userId 已存在时更新原记录（created=false），绝不追加第二条
W.Store.removeWarn(spotId, userId) => {ok:true, removed:boolean} | {ok:false, error}
W.Store.listLivePosts(spotId, limit=8) => LivePost[]   // createdAt 倒序，limit 1–20
W.Store.addLivePost(spotId, {userId, userName, content, photos}) => LivePost|null
// 空内容或 >140 字抛 Error('INVALID_LIVE')；photos 取前 3 张；未知 spot 返回 null
W.Store.deleteLivePost(spotId, postId, userId) => boolean   // 仅本人可删
```

- Failure semantics: `spotId` 不存在时 `getWarnInfo` 返回 `{count:0,tags:[],myWarn:null,latest:null}`，`setWarn` 返回 `NOT_FOUND`，`listLivePosts` 返回 `[]`，`addLivePost` 返回 `null`；非法标签被过滤，过滤后为空返回 `INVALID_WARN`；旧地点缺 `live/warns` 时内存补 `[]`，不覆盖用户数据。
- Interaction semantics: 单写者、全量落盘 + `notify()`；视图只经 Store 读写，不直接访问 `localStorage`；提交成功后详情视图 `W.Router.refresh()`；评论区、点赞、收藏的既有写操作不变。

**C-R13@1 DOM 区块层级（class 与 data-role 逐字一致）：**

```html
div.detail-shell > div.detail-body
├─ div.detail-stats                                   <!-- 既有：评论/浏览/喜欢/收藏四项 -->
├─ section.warn-panel#detail-warn-box[data-role="warn-panel"][data-warn-count]
│  ├─ div.warn-head > div.warn-heading (span.section-label "WARNING / 避雷提示" + p.warn-headline) + span.warn-count
│  ├─ div.warn-tags[data-role="warn-tags"] > span.warn-tag[data-tag][data-count] ×0–6
│  │  └─ span.warn-tag-name + b.warn-tag-num
│  ├─ p.warn-quote > span.warn-quote-text + span.warn-quote-by      <!-- 最新一条；无则不渲染 -->
│  ├─ div.warn-mine[data-role="warn-mine"]                          <!-- 我的标记；无则不渲染 -->
│  │  └─ span.warn-mine-label + span.warn-mine-tags
│  │     + button.warn-link[data-action="warn-edit"] + button.warn-link.warn-link--danger[data-action="warn-remove"]
│  ├─ div.warn-form[data-role="warn-form"][hidden]
│  │  ├─ div.section-label "选择标签（可多选）"
│  │  ├─ div.warn-choices[role="group"][aria-label="避雷标签"] > button.warn-choice[data-tag][aria-pressed] ×6
│  │  ├─ textarea.warn-input[maxlength="60"]
│  │  ├─ div.form-error[data-role="warn-error"]
│  │  └─ button.btn.btn-primary.warn-submit[data-action="submit-warn"]
│  └─ button.warn-toggle[data-role="warn-toggle"]
├─ section.checkin-card#detail-checkin-box[data-role="checkin-card"]  <!-- 见 C-R10@1 -->
├─ div.detail-route                                  <!-- 既有地址条 -->
├─ section.detail-info                               <!-- 既有 -->
├─ section.detail-desc                               <!-- 既有 ABOUT -->
├─ section.live-section#detail-live-box[data-role="live-section"]
│  ├─ div.section-head.section-head--live > div.section-head-left (span.section-no "02" + h2.section-title "实况速报" + span.section-en "LIVE") + span.section-meta
│  ├─ div.live-compose-wrap
│  │  ├─ button.live-trigger[data-role="live-trigger"] > span.live-trigger-plus + span + span.live-trigger-hint
│  │  └─ div.live-composer[data-role="live-composer"][hidden]
│  │     ├─ textarea.live-input[maxlength="140"]
│  │     ├─ div.live-compose-foot > span.live-count + span.live-compose-hint
│  │     ├─ div.pic-grid.pic-grid--compact.live-pic-grid[data-role="live-photo-picker"]
│  │     │  └─ button.pic-cell[data-photo-index][aria-pressed] ×6
│  │     ├─ div.form-error[data-role="live-error"]
│  │     └─ div.live-compose-actions > button.live-cancel[data-action="cancel-live"] + button.btn.btn-primary.live-submit[data-action="submit-live"]
│  ├─ div.live-list[data-role="live-list"] > article.live-item[data-live-id] ×0–8
│  │  ├─ div.live-head > span.live-index + 头像 + div.live-author (span.live-name + span.live-time)
│  │  ├─ p.live-text
│  │  ├─ div.live-photos > img.live-photo ×0–3
│  │  └─ button.live-delete[data-action="delete-live"]   <!-- 仅本人 -->
│  └─ div.live-empty[data-role="live-empty"]             <!-- 无实况时 -->
│     └─ span.live-empty-mark + p.live-empty-title + p.live-empty-desc
└─ section.comment-section#detail-comment-box         <!-- 既有，section-no 仍为 "03" -->
```

### 2.3 C-R10@1：城市探索护照打卡（READY）

- Provider / Consumers: **P1**（`js/store.js`、`js/seed.js`） / **C1**（`js/views/detail.js` 打卡卡）、**C2**（`js/views/profile.js` 护照分段）、**S1**（`css/style.css` 仅追加样式）
- Ownership（写集互斥）：P1 只写 `js/store.js`、`js/seed.js`；C1 只写 `js/views/detail.js` 打卡卡代码块；C2 只写 `js/views/profile.js` 的 `passport` 分段代码块；S1 只追加 `.checkin-*`、`.passport-*`、`.stamp-*` 样式。任何一方不得改动既有 `profile-hero`、`profile-stats`、`demo-panel` 结构。
- Requirements: R10

**数据模型（State 增量字段，旧数据在 `init` 时补 `[]`）：**

```js
State.checkins: Array<{ id: string, userId: string, spotId: string, createdAt: number }>
// 唯一性：同一 (userId, spotId) 最多 1 条；重复调用不新增
```

**Public surface：**

```js
W.Store.getPassport(userId) => {
  userId, total, cityCount, streak, earnedCount,
  cityList: [{city, count}],
  checkins: [{checkin: Checkin, spot: Spot}],   // createdAt 倒序
  badges: [{id, name, en, mark, desc, target, current, earned}],
  firstAt, latestAt
}
W.Store.listMyCheckins(userId) => [{checkin, spot}]
W.Store.getCheckinStats(spotId) => {total, userCount, nationalUserCount}
// total=本地点打卡记录数；userCount=本地点去重人数；nationalUserCount=全站有过打卡的去重用户数
W.Store.checkinSpot(spotId, userId) => {ok:true, created:boolean, checkin, newBadges:Badge[], passport} | {ok:false, error:'NOT_FOUND'|'NOT_FOUND_USER'}
```

- Failure semantics: 未知地点返回 `NOT_FOUND`，未知用户返回 `NOT_FOUND_USER`；重复打卡返回 `created:false` 与已有记录，不写盘、不产生新 id；`getPassport` 遇到已删除地点的脏 checkin 时跳过，不抛异常；旧数据无 `checkins` 时视为空数组。
- Interaction semantics: 打卡只经 `W.Store.checkinSpot`，成功后 `W.Router.refresh()`；个人中心只读 `getPassport`，不自行缓存；护照分段切换不改变当前演示身份。

**C-R10@1 DOM 区块层级（class 与 data-role 逐字一致）：**

```html
<!-- 详情页打卡卡：warn-panel 之后、detail-route 之前 -->
section.checkin-card#detail-checkin-box[data-role="checkin-card"][data-checked="0|1"]
├─ div.checkin-copy
│  ├─ div.checkin-kicker > span.section-label "CITY PASSPORT / 城市护照" + span.checkin-state
│  ├─ p.checkin-title
│  └─ p.checkin-sub
└─ button.checkin-btn[data-action="checkin"]   <!-- 未打卡「打卡签到」；已打卡「已打卡 ✓」+ disabled -->

<!-- 个人中心护照分段：插在「发布」之后、「发起」之前 -->
div.page.profile-page
├─ section.profile-hero / div.profile-stats      <!-- 既有，不改 -->
├─ div.profile-tabs-wrap > div.segmented.segmented--editorial
│  └─ button.seg-btn[data-seg="spots|passport|myBuddies|joined|applies|liked"] ×6
└─ div.archive-panel > div.archive-section.passport-section[data-role="passport-section"]
   ├─ div.archive-heading                        <!-- "城市探索护照" + 计数 -->
   ├─ section.passport-cover#profile-passport[data-role="passport-cover"]
   │  ├─ div.passport-cover-top > span.passport-kicker "CITY PASSPORT" + span.passport-kicker.passport-kicker--zh "城市探索护照"
   │  ├─ div.passport-cover-main
   │  │  ├─ div.passport-cover-name > span.passport-owner-label + h3.passport-owner + p.passport-cover-city
   │  │  └─ div.passport-seal > span.passport-seal-mark "✦" + span.passport-seal-text "WQWN"
   │  ├─ div.passport-cover-stats > div.passport-stat ×4 (b.passport-stat-num + span.passport-stat-label)
   │  └─ div.passport-cover-foot > span.passport-foot-k ×2 (ISSUED / LAST ENTRY)
   ├─ div.passport-cities > span.passport-city ×N (span.passport-city-name + b.passport-city-count)
   ├─ div.passport-divider > span.passport-divider-title "STAMPS / 城市印章" + span.passport-divider-meta
   ├─ div.passport-stamps[data-role="passport-stamps"] > button.passport-stamp[data-spot-id] ×N
   │  └─ span.stamp-ring (span.stamp-city + span.stamp-date + span.stamp-mark) + span.stamp-spot
   ├─ div.passport-divider > span.passport-divider-title "BADGES / 徽章墙" + span.passport-divider-meta
   └─ div.passport-badges[data-role="badge-wall"]
      └─ div.passport-badge[data-badge="first|walker|collector|tricity|nightowl|foodie"].is-earned|.is-locked ×6
         └─ span.passport-badge-mark + div.passport-badge-copy
            ├─ div.passport-badge-name > span + span.passport-badge-en
            ├─ p.passport-badge-desc
            └─ div.passport-badge-progress > i.passport-badge-bar[style="width:{percent}%"] + span.passport-badge-count
```

### 2.4 统计与徽章口径

| 指标 | 口径 |
|---|---|
| 打卡地点数 `total` | 当前用户 `checkins` 中可解析到地点的 `spotId` 去重数量 |
| 到访城市数 `cityCount` | 上述地点 `spot.city` 去重数量；城市为空按「未知城市」计 |
| 连续天数 `streak` | 按本地自然日：从最近一次打卡日向前数连续有打卡的天数；最近一次不在今天/昨天则为 0 |
| 获得徽章数 `earnedCount` | 6 枚徽章中 `earned=true` 的数量 |
| 初见 / 漫游者 / 收藏家 | 打卡地点数达到 1 / 5 / 10 |
| 三城记 | 到访城市数达到 3 |
| 夜行者 / 老饕 | 已打卡地点中 `category === 'night'/'food'` 的去重地点数达到 3 |
| 避雷人数 | 该地点 `warns` 记录数（每用户最多 1 条，按 userId 去重） |
| 高频标签 | 每个标签被多少条避雷记录包含；计数降序，同分按固定标签顺序 |
| 本地点 / 全国打卡人数 | 本地点去重 userId 数 / 全站至少有一条 `checkins` 的去重 userId 数 |

### 2.5 演示数据基线

- 种子保留现有 10 个地点（杭州 6、成都 2、上海 2），并补充 `live/warns`：至少 s1、s2 各有 ≥2 条实况和 ≥2 条避雷，s3、s5、s6、s7 各有 ≥1 条，便于展示与空态对照；`checkins` 至少 10 条覆盖 u1–u4，u1 在 s1、s2 各一条（连续两天），用于验收护照封面与「初见」徽章；6 枚徽章顺序固定：初见、漫游者、收藏家、三城记、夜行者、老饕。阶段 10 补充实现后最终种子为 5 用户 / 14 地点（杭州 6、成都 2、上海 2、广州 4）/ 13 条打卡，R13/R10 的验收基线仍按 u1–u4、s1–s10 计算。

---
## 3. 交互流程

### 3.1 R13 避雷流程

1. **进入详情**：读取 `getWarnInfo`，面板默认收起；显示避雷人数、计数降序标签、最新一条引用、我的标记状态。
2. **展开**：未标记点「我也踩过雷」，已标记点「修改我的避雷标记」或「修改」；按钮变「收起」，表单显示 6 个固定标签与可选备注。
3. **提交**：至少 1 个标签；备注 ≤60 字；成功 toast「避雷标记已提交」或「避雷标记已更新」并刷新。
4. **修改**：同一用户再次提交走更新逻辑，原记录 id 不变，`created=false`，避雷人数不变。
5. **取消**：点我的标记行「取消」→ `UI.confirm('确定取消你的避雷标记吗？')`；确认后 toast「避雷标记已取消」，人数减 1。
6. **收起/重复点击**：点「收起」仅关闭表单，不保存；提交按钮在写操作完成前禁用或忽略第二次点击，一次提交最多产生 1 条记录。
7. **错误**：Store 失败时保留表单内容，行内「提交失败，请重试」，不刷新。
8. **空态/脏数据**：无避雷时人数「—」、`暂无避雷标记，你来做第一个提醒者`，不渲染标签/引用/我的标记；`warns` 非数组、标签非法、记录缺 userId 时按空/忽略处理。

### 3.2 R13 实况流程

1. **进入详情**：`listLivePosts(spot.id, 8)` 取最新 8 条按 `createdAt` 倒序；头部「实况速报 / LIVE」+ 两位补零条数。
2. **空态**：无实况时显示「还没有实况 / 路过的话，发一条给后来的人看看」。
3. **展开输入**：点「+ 发一条实况」展开并聚焦；显示 `0 / 140`、6 张内置图库缩略图与「最多 3 张图库照片」。
4. **校验**：空内容「写点什么再发布吧」；>140 字「实况不能超过 140 字」；选第 4 张图 toast「最多 3 张照片」且不选中。
5. **发布**：成功后 toast「实况已发布」，刷新后新实况在第一条，显示用户名、`timeAgo` 与照片。
6. **取消/重复**：取消清空文字、计数与已选照片；发布按钮写操作完成前禁用或忽略重复点击。
7. **删除/图片失败**：本人实况可「删除」并确认；图片加载失败隐藏该图，不出现破图。
8. **无数据兜底**：`live` 缺失或记录缺 id/内容时按空数组处理，不渲染空壳。

### 3.3 R10 详情页打卡流程

1. **进入详情**：读取 `getPassport(me.id)` 与 `getCheckinStats(spot.id)`，判断是否已打卡。
2. **未打卡**：`NOT YET`、标题「到此一游，盖个章吧」、副文案「{N} 人已在这里打卡」或「成为第一个打卡的人」，按钮「打卡签到」可点。
3. **打卡**：点「打卡签到」→ `checkinSpot`；成功 toast「打卡成功 · 第 {N} 个脚印」，有新徽章时 toast「打卡成功 · 获得徽章「{徽章名}」」；刷新后按钮「已打卡 ✓」disabled，状态 `CHECKED IN ✓`。
4. **重复点击**：已打卡按钮 disabled；程序重复调用 `created=false`，不新增记录，可 toast「已经打过卡啦」。
5. **已打卡展示**：显示「已打卡 ✓」与「全国 {nationalUserCount} 人 · 本地点 {userCount} 人打卡」。
6. **错误/无数据**：失败 toast「打卡失败，请重试」并保持未打卡；无人打卡时本地点人数 0，全国 0，不出现 `NaN`。

### 3.4 R10 个人中心护照流程

1. **进入**：默认仍「发布」；点第 2 项「护照 / PASSPORT」，分段高亮，`archive-panel` 重渲染，URL 保持 `#/profile`。
2. **封面**：展示 `CITY PASSPORT / 城市探索护照`、持有人、BASED IN 城市、4 项统计、ISSUED 与 LAST ENTRY。
3. **城市印章**：每条有效打卡一枚（城市、日期、地点名）；点击跳 `#/spot/{spotId}`；从详情返回后仍停留护照分段。
4. **徽章墙**：6 枚固定；已获得「已获得」高亮；未获得显示 `{current} / {target}` 与进度条，宽度 `round(current/target*100)%`，不超过 100%。
5. **空态**：无打卡时封面四项 `00`，印章区「护照还是空的 / 去地点详情页打个卡，留下你的第一个城市印章。/ 去首页逛逛」，按钮到 `#/home`；6 枚徽章全部未获得。
6. **无数据兜底**：`checkins` 指向已删除地点时跳过该条；城市名为空显示「未知城市」；切换分段不改数据。

### 3.5 空态 / 错误 / 重复点击 / 超长 / 无数据兜底矩阵

| 场景 | 触发条件 | 期望表现 |
|---|---|---|
| 避雷空态 | `warns=[]` | 人数「—」、标题「暂无避雷标记，你来做第一个提醒者」、无标签/引用/我的标记 |
| 避雷未选标签 | 无选中标签点提交 | 行内「请至少选择一个避雷标签」，不写盘、不刷新 |
| 避雷备注超长 | 备注 >60 字 | 行内「补充说明不能超过 60 字」，不写盘；textarea `maxlength=60` 先行限制 |
| 避雷重复提交 | 同一用户同地点再次提交 | 更新原记录，`created=false`，人数不变，不新增第二条 |
| 避雷写失败 | Store 返回失败 | 行内「提交失败，请重试」，保留已选标签与备注 |
| 实况空态 | `live=[]` | 「还没有实况 / 路过的话，发一条给后来的人看看」 |
| 实况空内容 / 超长 | 未输入 / >140 字 | 「写点什么再发布吧」/「实况不能超过 140 字」，不写盘 |
| 实况第 4 张图 | 已选 3 张再点第 4 张 | toast「最多 3 张照片」，第 4 张不选中 |
| 实况写失败 | Store 返回 null | 行内「发布失败，请重试」，保留输入与已选图 |
| 打卡重复 | 已打卡再次点击/调用 | 按钮 disabled；调用 `created=false`，记录数不变 |
| 打卡写失败 | Store 返回失败 | toast「打卡失败，请重试」，卡保持未打卡 |
| 护照空态 | 当前用户无打卡 | 封面全 `00`；「护照还是空的 / 去地点详情页打个卡…」；徽章全锁定 |
| 旧数据缺字段 | localStorage 无 `live/warns/checkins` | 自动补空数组，页面正常，不触发重置 |
| 脏打卡引用 | `checkins` 指向不存在 spotId | 跳过该条，不影响其余印章与统计 |

---
## 4. 文案表

### 4.1 R13 避雷文案

| 类型 | 文案 |
|---|---|
| 标题/状态 | `WARNING / 避雷提示`；有数据 `{N} 人在这里踩过雷`；空态 `暂无避雷标记，你来做第一个提醒者`；计数 `—`（空）或两位补零 |
| 按钮 | `我也踩过雷` / `修改我的避雷标记` / `收起` / `修改` / `取消` / `提交避雷标记` / `保存修改` |
| 表单 | `选择标签（可多选）`；备注占位 `补充一句（可选，最多 60 字）`；我的标记标签 `我的标记` |
| 错误 | `请至少选择一个避雷标签` / `补充说明不能超过 60 字` / `提交失败，请重试` / `操作失败，请重试` |
| toast/确认 | `避雷标记已提交` / `避雷标记已更新` / `避雷标记已取消`；确认 `确定取消你的避雷标记吗？` |

### 4.2 R13 实况文案

| 类型 | 文案 |
|---|---|
| 标题/状态 | `实况速报` / `LIVE`；条数 `{NN} REPORTS`（两位补零，当前展示条数） |
| 入口/表单 | `+ 发一条实况` + `让后来的人知道此刻的样子`；占位 `此刻这里怎么样？人多吗、天气如何、有什么新发现…`；`{n} / 140`；`最多 3 张图库照片` |
| 按钮 | `取消` / `发布实况` / `删除` |
| 空态 | `还没有实况` / `路过的话，发一条给后来的人看看` |
| 错误 | `写点什么再发布吧` / `实况不能超过 140 字` / `最多 3 张照片` / `发布失败，请重试` |
| toast/确认 | `实况已发布` / `实况已删除`；确认 `确定删除这条实况吗？` |

### 4.3 R10 打卡与护照文案

| 类型 | 文案 |
|---|---|
| 详情卡 | `CITY PASSPORT / 城市护照`；`NOT YET` / `CHECKED IN ✓`；`到此一游，盖个章吧` / `已留下你的脚印`；`成为第一个打卡的人` / `{N} 人已在这里打卡` / `全国 {X} 人 · 本地点 {Y} 人打卡`；`打卡签到` / `已打卡 ✓` |
| toast | `打卡成功 · 第 {N} 个脚印` / `打卡成功 · 获得徽章「{徽章名}」` / `已经打过卡啦` / `打卡失败，请重试` |
| 护照分段 | `护照` / `PASSPORT`；`CITY PASSPORT` / `城市探索护照`；`HOLDER / 持有人`；`BASED IN · {城市}` |
| 护照统计 | `打卡地点` / `到访城市` / `连续天数` / `获得徽章`；`ISSUED · yyyy.mm.dd` / `LAST ENTRY · yyyy.mm.dd` |
| 区块标题 | `STAMPS / 城市印章` + `{N} ENTRIES`；`BADGES / 徽章墙` + `{earned} / 6 EARNED` |
| 徽章状态 | `已获得` / `{current} / {target}` |
| 空态 | `护照还是空的` / `去地点详情页打个卡，留下你的第一个城市印章。` / `去首页逛逛` |

### 4.4 文案原则

- 中文短句、口语化，不使用“必打卡”“绝绝子”等营销词；英文只做排版元信息，不承载功能含义。所有数量文案都带单位与对象（如「3 人在这里踩过雷」「0 / 140」），不出现裸数字。
- 错误文案说明“哪里不对 + 怎么改”，不指责用户；toast 不超过 20 字。

---
## 5. 验收标准

### 5.1 R13（AC-R13-01 ~ AC-R13-12）

| ID | Given | When | Then |
|---|---|---|---|
| AC-R13-01 | 打开种子地点 `#/spot/s1`（有避雷数据） | 自上而下查看详情主体 | 顺序为四项统计条 → 「WARNING / 避雷提示」→「CITY PASSPORT / 城市护照」→「ADDRESS / 地址」→ 信息 → 关于 →「实况速报」→「真实评价」；避雷面板在地址条之前且不遮挡统计数字 |
| AC-R13-02 | 地点 A 有 3 条避雷：2 条含「排队太久」，1 条含「环境嘈杂」，1 条含「性价比低」 | 打开 A 的详情 | 标题「3 人在这里踩过雷」，人数 `03`；标签「排队太久 ×2」在前，同分的「环境嘈杂 ×1」「性价比低 ×1」按固定标签顺序排列；未出现标签不渲染 |
| AC-R13-03 | 当前用户未标记地点 A | 点「我也踩过雷」 | 表单展开、按钮变「收起」；6 个标签按「排队太久、名不副实、环境嘈杂、性价比低、交通不便、临时关闭」顺序展示且均未选中；备注占位「补充一句（可选，最多 60 字）」；不显示「我的标记」行 |
| AC-R13-04 | 当前用户未标记 A，表单已展开 | 选中「排队太久」「交通不便」，备注「周末排队一小时」，点「提交避雷标记」 | toast「避雷标记已提交」；刷新后人数 +1、对应标签计数 +1；出现「我的标记」行显示两个标签与备注；按钮变「修改我的避雷标记」；`localStorage` 中 A 的 `warns` 新增 1 条且 `userId` 为当前用户 |
| AC-R13-05 | 当前用户已在 A 留下避雷，人数 N | 点「修改」→ 改选「名不副实」→ 点「保存修改」 | toast「避雷标记已更新」；人数仍为 N；`localStorage` 中 A 的 `warns` 里当前用户记录仅 1 条，标签已更新，原记录 id 不变 |
| AC-R13-06 | 当前用户已在 A 留下避雷，人数 N | 点我的标记行「取消」，确认框点「确定」 | toast「避雷标记已取消」；人数 N-1；「我的标记」行消失；`localStorage` 无当前用户该条记录，其他用户避雷不变 |
| AC-R13-07 | 避雷表单已展开、未选任何标签 | 点「提交避雷标记」 | 行内「请至少选择一个避雷标签」，不写盘、不刷新；选 1 个标签并在备注输入 61 字（可用控制台赋值绕过 maxlength）后提交，行内「补充说明不能超过 60 字」，同样不写盘 |
| AC-R13-08 | 打开无任何避雷的地点（如种子 `s4`） | 查看避雷面板 | 显示「—」与「暂无避雷标记，你来做第一个提醒者」；不显示标签、引用和我的标记行；「我也踩过雷」按钮可见且可展开表单 |
| AC-R13-09 | 打开种子地点 `#/spot/s1`（有 2 条实况） | 查看 ABOUT 之后、COMMENTS 之前的区域 | 显示「实况速报 / LIVE」与 `02 REPORTS`；L01「大熊」约 12 分钟前的内容在上，L02「阿茶」约 48 分钟前的内容在下；每条含用户名、相对时间、1–140 字正文，照片 ≤3 张 |
| AC-R13-10 | 打开无实况的地点（如种子 `s3`） | 点「+ 发一条实况」，不输入直接点「发布实况」 | 行内「写点什么再发布吧」；输入 141 个字（控制台绕过 maxlength）提交显示「实况不能超过 140 字」；输入合法内容并选 2 张图库照片提交后，toast「实况已发布」，刷新后该实况在第一条，正文与 2 张照片正确显示，`live` 数量 +1 |
| AC-R13-11 | 地点 B 没有实况，实况区已展开 | 查看空态并依次点第 1–4 张图库照片 | 空态显示「还没有实况 / 路过的话，发一条给后来的人看看」；前 3 张选中，第 4 张出现 toast「最多 3 张照片」且不选中；已选数量始终 ≤3 |
| AC-R13-12 | 打开 `#/spot/s1`，记录当前评论数、喜欢数、收藏数 | 依次点赞、再次点赞、收藏、再次收藏、发布一条合法评论、删除自己刚发的评论 | 点赞 +1/−1 与「已点赞 / 已取消点赞」正确；收藏 +1/−1 与「已收藏 / 已取消收藏」正确；评论发布 toast「评论已发布」且新评论在顶部，删除确认后移除；避雷/实况操作不改变以上计数，页面无 JS 报错 |

### 5.2 R10（AC-R10-01 ~ AC-R10-12）

| ID | Given | When | Then |
|---|---|---|---|
| AC-R10-01 | 当前用户 u1 未在 `s3` 打卡 | 打开 `#/spot/s3` | 「CITY PASSPORT / 城市护照」卡位于避雷面板之后、地址条之前；状态 `NOT YET`，标题「到此一游，盖个章吧」，按钮「打卡签到」可点；副文案为「{N} 人已在这里打卡」或「成为第一个打卡的人」 |
| AC-R10-02 | u1 尚未在 `s3` 打卡，个人已有 2 次打卡 | 点「打卡签到」 | toast「打卡成功 · 第 3 个脚印」或「打卡成功 · 获得徽章「{徽章名}」」；卡片刷新为 `CHECKED IN ✓`、标题「已留下你的脚印」、按钮「已打卡 ✓」且 disabled；`localStorage` 的 `checkins` 新增 1 条 `{userId:'u1', spotId:'s3'}` |
| AC-R10-03 | u1 已在 `s1` 打卡 | 打开 `#/spot/s1`，并在控制台连续调用 `W.Store.checkinSpot('s1','u1')` 两次 | 两次均返回 `created:false`；`checkins` 中 `(u1,s1)` 始终 1 条；详情页按钮保持「已打卡 ✓」disabled；无重复 toast 或报错 |
| AC-R10-04 | 种子中全站有 u1–u4 共 4 人打卡，`s1` 有 u1、u2 两人打卡 | 以 u1 打开 `#/spot/s1` | 已打卡状态显示「全国 4 人 · 本地点 2 人打卡」；切换到未在 `s1` 打卡的用户时，本地点人数仍为 2，不把全国人数当成地点人数 |
| AC-R10-05 | 打开 `#/profile` | 查看分段栏并点「护照 / PASSPORT」 | 分段共 6 项，顺序「发布 / 护照 / 发起 / 加入 / 申请 / 点赞」；默认进入「发布」高亮；点「护照」后该项高亮唯一，面板显示「城市探索护照」封面，URL 保持 `#/profile` |
| AC-R10-06 | u1 的种子打卡为 s1、s2，均为杭州且连续两天 | 打开护照分段 | 封面四项：打卡地点 `02`、到访城市 `01`、连续天数 `02`、获得徽章 `01`；ISSUED 与 LAST ENTRY 显示对应日期；持有人「小来」，BASED IN「杭州」 |
| AC-R10-07 | u1 有 2 条打卡 | 查看城市印章区并点第 1 枚印章 | 显示 2 枚印章，每枚含城市、日期、地点名；点击后 URL 变为对应 `#/spot/{id}`；浏览器返回 `#/profile` 后仍停留在「护照」分段 |
| AC-R10-08 | u1 只有 s1、s2 两条打卡（杭州，nature + food） | 查看徽章墙 | 共 6 枚，顺序初见、漫游者、收藏家、三城记、夜行者、老饕；「初见」显示「已获得」；其余显示漫游者 `2 / 5`、收藏家 `2 / 10`、三城记 `1 / 3`、夜行者 `0 / 3`、老饕 `1 / 3`；进度条约 40%、20%、33%、0%、33% |
| AC-R10-09 | 通过发布/打卡构造一个用户：打卡 10 个地点、覆盖 3 座城市、3 个 `night`、3 个 `food` 地点 | 打开该用户护照分段 | 6 枚徽章全部 `is-earned`，获得徽章 `06`，徽章区 `6 / 6 EARNED`；所有进度条 ≤100%；少一个条件时对应徽章仍锁定，不倒扣、不误判 |
| AC-R10-10 | 将当前用户 `checkins` 置空并刷新 `#/profile` | 打开护照分段 | 封面四项均为 `00`；不显示城市印章；显示「护照还是空的 / 去地点详情页打个卡，留下你的第一个城市印章。」与「去首页逛逛」；点按钮到 `#/home`；6 枚徽章全部未获得 |
| AC-R10-11 | u1 已在 `s3` 完成打卡 | 整页刷新 `#/spot/s3`，再进入 `#/profile` 护照分段 | 详情页仍显示「已打卡 ✓」disabled；护照打卡地点数包含 `s3`，印章区出现 s3 印章；`localStorage` 中 `(u1,s3)` 仍只有 1 条 |
| AC-R10-12 | 打开 `#/profile` | 依次点「发布 / 发起 / 加入 / 申请 / 点赞」并核对顶部统计 | 五个原有分段均能正常渲染原有列表或空态；顶部 4 项统计仍为「发布地点/发起搭子/加入搭子/点赞地点」且数值与改动前一致；「DEMO / 演示设置」身份切换与「重置演示数据」照常；新增护照分段不影响以上行为 |

---
## 6. 与现有功能的回归边界

### 6.1 数据与兼容

- `wqwn.v3` 的 key、`version: 1`、`users/spots/buddies` 结构不变；新增 `checkins` 为顶层数组，`live/warns` 为 `Spot` 增量数组。
- `init()` 对旧数据只内存补字段（`live/warns=[]`、`checkins=[]`），不覆盖、不迁移、不删除已有数据；补字段失败时回退种子并 toast「本地存储不可用，数据仅在本次会话有效」。
- `reset()` 恢复种子时包含演示用 `live/warns/checkins`；重置后护照、避雷、实况同时回到种子基线。
- 新增 Store 方法不得改动既有 26 个方法签名、返回值与副作用；`subscribe` 的 `meta` 最多增加 `checkinsCount`，不得删除 `spotsCount/buddiesCount`。

### 6.2 页面与交互回归清单

| # | 回归项 | 必须保持 |
|---|---|---|
| 1 | 详情页 hero | 封面轮播、返回、收藏/点赞图标、标题、分类、副信息、轮播点正常 |
| 2 | 详情四项统计 | 评论/浏览/喜欢/收藏数字与文案不变；打开详情 `viewSpot` 仍只 +1 一次 |
| 3 | 地址与导航 | 「ADDRESS / 地址」、`导航前往 ↗` 位置与行为不变 |
| 4 | 信息与关于 | `INFORMATION / 信息` 三行与 `ABOUT / 关于` 描述不变 |
| 5 | 评论 | 倒序、1–200 字、最多 3 图、作者可删、空态「还没有评论」、`section-no "03"` 不变 |
| 6 | 点赞/收藏 | `toggleLike` / `toggleFavorite` 幂等；数字与图标就地更新；toast 不变 |
| 7 | 个人中心统计 | 4 项统计结构与数值不变，不被护照统计替代 |
| 8 | 个人中心分段 | 原「发布/发起/加入/申请/点赞」5 项全部保留且可切换，默认仍「发布」 |
| 9 | 演示设置 | 身份切换、重置演示数据、demo-note 全部可用 |
| 10 | 全局 | 5 个底部 tab、路由、430/360 无横向溢出、无 JS page error |

### 6.3 不可接受的回归

- 新增区块导致详情 hero 或统计条错位、重复渲染、空白占位；避雷/实况/打卡写操作直接写 `localStorage`，或刷新后丢失。
- 同一用户同一地点出现 2 条避雷或 2 条打卡。
- 护照统计与 `checkins` 不一致，或徽章进度出现负数、超过 100%、`NaN`。
- 新增 CSS 覆盖/删除既有 `.detail-*`、`.profile-*`、`.segmented`、`.archive-*`，导致原有元素不可见或不可点。

---
## 7. 不做什么

| 不做 | 原因 |
|---|---|
| 不做避雷星级评分、长文评价、图片上传 | 避雷是轻量标签表态，图片与长文由评论承担 |
| 不做避雷点赞/回复/举报/审核流，也不做实况点赞/评论/转发/@ 好友 | 本期无后端与权限体系；避雷是轻量表态，实况定位为“现场快报”，互动仍走评论 |
| 不做实时推送、轮询刷新、WebSocket、多设备同步、账号体系、云端备份 | 纯前端本地原型，进入详情时读取即最新；继续使用 localStorage `wqwn.v3`，无后端 |
| 不做避雷/实况跨地点聚合页、排行榜、热搜 | 本期只服务单地点详情判断，不新增页面 |
| 不做定位围栏自动打卡、拍照验证、防作弊 | 无定位权限与后端校验，打卡为演示型动作 |
| 不做护照排行榜、积分商城、徽章兑换、分享海报 | 本期只做记录与展示，不引入社交比较和权益 |
| 不新增底部 tab、不新增一级路由、不引入第三方依赖 | 保持 5 tab 与零构建原型边界 |
| 不把评论、点赞、收藏替换为避雷/实况/打卡 | 三者是新增信息层，不改变原有社交行为 |
| 不做未登录/匿名状态 | 原型始终有当前演示用户，所有写操作归属该用户 |
