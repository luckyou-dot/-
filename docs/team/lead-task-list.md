# 出来去哪玩 · 90 分钟共创交付 Task List

> 目标：在已完成的「城市漫游手册」视觉重构基础上，补齐第 5 个底部标签「今天去哪」盲盒/随机抽签，同时保持原有 8 项核心功能不回归。
> 更新：2026-11-13 · Team Lead

## 角色与分工

| 角色 | Teammate | 职责 | 主要交付物 |
|---|---|---|---|
| 产品 | product-designer | 用户旅程、功能边界、交互状态、验收案例 | `docs/team/product-whereto.md` |
| 架构/前端 | arch-frontend | 路由、视图接口、DOM/CSS 约定、测试点 | `docs/team/arch-whereto.md` |
| 开发 | dev-builder（✅ 已完成） | 第五标签全部代码与样式 | `js/views/whereto.js`、`index.html`、`js/app.js`、`css/style.css` |
| QA | qa-runner（✅ 已完成） | 验收执行、回归测试、缺陷报告 | `docs/team/qa-whereto.md` |
| Lead | lead | 目标拆解、接口协调、冲突决策、最终验收与文档 | 本文件、`docs/screens/`、README、PROGRESS、最终答复 |

## Task List

| # | 任务 | 负责人 | 依赖 | 可并行 | 预期交付 |
|---|---|---|---|---|---|
| T1 | 产品方案：第五标签「今天去哪」定义与验收 | product-designer | — | 与 T2 并行 | ✅ 产品文档（431 行，AC-01~12） |
| T2 | 架构方案：路由、视图接口、CSS 与测试点 | arch-frontend | — | 与 T1 并行 | ✅ 架构文档（726 行，C-WHERETO@1） |
| T3 | 开发：5 个 tab + `#/whereto` 盲盒页 | dev-builder | T1、T2 | 否（依赖方案） | ✅ 可运行代码（whereto.js 723 行） |
| T4 | QA：新功能验收 + 原有 25 项回归 | qa-runner | T3 | 否 | ✅ QA 报告（167/167 + 25/25 + 12/12） |
| T5 | Lead 集成：视觉复核、截图归档、README/PROGRESS | lead | T3、T4 | 与 T4 部分并行 | ✅ 七视图截图、README/PROGRESS 定稿 |

## 执行结果（2026-11-13 22:40）

- T1 产品：completed；12 条 AC、7 心情文案、空态/异常矩阵齐备。
- T2 架构：completed；路由 `/whereto`、`W.Views.whereto.render`、`data-role` 契约、5 列 tabbar 方案。
- T3 开发：completed；`js/views/whereto.js`、`index.html`、`js/app.js`、`css/style.css` 已落盘；自测 27+8 项通过，旧 25 项回归 25/25。
- T4 QA：completed；新功能 167/167 PASS，原 25 项回归 25/25 PASS，430/360 布局 12/12 PASS，未发现 P0/P1/P2 缺陷。
- T5 Lead：completed；`docs/screens/07-whereto.jpg` 与七视图 `_overview.jpg` 已归档；README / PROGRESS / design / QA 文档同步。

## 决策记录

- **第五个标签选择「今天去哪」**：用户原始需求里「不知道去哪玩」是核心痛点，候选方案中的「今天去哪转盘/盲盒」最贴合；不做成独立地图或收藏，因为地图已在首页、收藏已在详情/个人中心覆盖。
- **保持技术栈**：不引入构建工具、不新增后端；只使用现有 `W.Store.listSpots()`、`W.UI`、`W.Router`。
- **视觉方向**：继续沿用「城市漫游手册」editorial 系统（`--paper:#f1efea`、`--ink:#111110`、`--accent:#e85d2a`、宋体标题、等宽元信息、细线、留白）。
- **不回归**：现有 25 项自动化测试与 430/360 布局检查必须全绿。

## 验收口径（摘要）

1. 底部 5 个 tab 顺序：首页 / 去哪 / 发布 / 搭子 / 我的；发布保持中间橙色圆钮。
2. `#/whereto` 首次进入出一张随机地点卡；心情筛选只出对应分类；「换一个」不连续重复。
3. 「就去这里」跳转对应 `/spot/:id` 且标题一致。
4. 页面在 430/360 宽度无页面级横向溢出；键盘可操作；无 JS page error。
5. 原有首页、详情、搭子、发布、个人中心流程全部通过。
