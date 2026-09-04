# 定稿决策（防反复争论）

来源：能力底图策展实践。变更须维护者明确同意。  
迭代全文与变更轨迹：本仓 [`docs/方案/文档体系/能力底图-文档能力体系.md`](../../../docs/方案/文档体系/能力底图-文档能力体系.md)；归档方案见 `docs/_archive/方案/文档体系/`。  
业务仓只同步 Skill，**不**再维护「文档体系」主题。

| # | 决策 |
|---|------|
| 1 | 主索引 = **能力底图**，不是全局变更台账 |
| 2 | 维护模式 = **个人策展**从 git/PR 反补；团队 commit 规范有则更好、不强制 |
| 3 | 进行中方案用文内 **`## 变更记录`**（触发 / 决策 / 未采纳） |
| 4 | 方案落地 = 压缩进底图 + 移 `_archive` + **删除**活跃副本（不留 stub） |
| 5 | **无** `ledger_id` / **无** `CL-YYYY-NNN` 全局编号 |
| 6 | Obsidian Vault = **`docs_root`**；图谱靠**唯一文件名**；默认不用 Canvas |
| 7 | 链接双轨：`[[wikilink]]`（Obsidian）+ Markdown（GitHub/Cursor） |
| 8 | 工作单元粒度（策展时）：一次合入主分支的相关改动可合并进底图 §4 一行/能力 |
| 9 | 小 fix：只更新底图 §4 或 §5，不强制写方案 |
| 10 | Skill：统一入口 `capmap-system` + 各阶段可独立（init/scheme/dev/test/norm/backfill/archive/**lint**） |
| 11 | **`docs_root` 名任意**；在 `capmap-init` 选定并写入 `.agents/skills/capmap-system/capmap.yaml`；其它阶段只认配置 |
| 12 | 闭环含 **开发标识 / 测试 / 使用规范**：方案≠已落地；已开发=代码+底图§1/§2；长期契约进 `规范/`；测试进 `测试/` |
| 13 | 能力状态建议：方案中 → 开发中 → 已开发 → 已验证 → 已落地 |
| 14 | **主源 = capmap-skills 公开仓**；业务仓同步 Skill/契约，不在业务仓单边演进 |
| 15 | **capmap-lint**：脚本与 CI action 均在 `.agents/skills/capmap-lint/`；GitHub 仅保留薄入口 `.github/workflows/capmap-lint.yml` → `uses: ./…/capmap-lint` |
| 16 | **能力进度只看底图 §1**；方案 Tag 只表示该方案文档生命周期 |
| 17 | **脚本/配置与 Skill 同目录**：项目配置在 `capmap-system/capmap.yaml`；禁止再散落到 `scripts/` 或 `.agents/` 根 |
| 18 | **状态 Tag（V3 纠偏）**：进度挂**方案**（含开发中/已落地等）；**能力底图禁止状态 Tag**；测试 `测试中→已验证`；归档方案 `已归档` |
| 19 | **套件命名 = `capmap-skills`**；Skill 前缀 `capmap-*`（入口 `capmap-system`）。弃用易与「文档操作」混淆的 `docs-*` / `docs-capability-*` |
| 20 | **套件迭代 Vault = 本仓 `docs/`**；业务仓不维护「文档体系」主题；底图+归档方案只在公开仓演进 |
| 21 | **V4 分支状态机**：`已确认` 时 Agent 建议体量、用户确认后写 `体量/小\|大`；大需求须 `规格中`→`已拆分`→`开发中` |
| 22 | **V4 执行 skill**：自建 `capmap-spec` / `capmap-slice` / `capmap-gate`；不依赖 mattpocock/skills |
| 23 | **切片 DAG**：`Blocked by` 无环；frontier 可并行；用户点名才开跑；slice 可推荐模式但禁止主动开跑 |
| 24 | **切片验收（B）**：交票须 Demo 步骤 + 自测摘要；人确认才 `已验收`；整功能仍走 `capmap-test`；不强制每切片测试文 |
| 25 | **切片落盘**：`方案/<主题>/切片/<方案stem>/` + 文件名带方案前缀（全局唯一）；随方案归档；进度用类型 `切片` | 同主题共用一个扁平 `切片/`（多方案冲突）；短名无前缀（Obsidian 撞名） |

## 明确废弃

- `docs/变更台账.md`（及任何全局变更台账）
- `.agents/skills/change-ledger/`
- `.agents/skills/capability-map/`、`.agents/skills/docs-*`（已迁移至 `capmap-*`）
- 主题目录下的归档 stub 文件
- 在 Skill 中写死文档根必须叫 `docs/`
- 双仓对等改 Skill（易漂移；以本仓为准）
- `scripts/docs_lint.py`、`.agents/docs-capability.yaml`（已迁入对应 skill 目录；现为 `capmap-lint/capmap_lint.py`、`capmap-system/capmap.yaml`）
- 能力底图 YAML 上的 `状态/*`（进度改挂方案）
- 方案仅三态、进度只挂底图的旧分轨说法
- 跨仓打包目录名 `docs-capability-portable/`（现为本公开仓 `capmap-skills`）
- 业务仓（如 atlas-desk `olympus-docs`）内的「文档体系」主题底图与归档方案（已迁入本仓 `docs/`）
- 外委 Matt 执行链作为默认；仅改路由不造 skill
- 切片强制全局串行；Agent 主动开跑 / spawn 多会话
- 切片口头一句即验收（无 Demo/自测）；每切片强制独立测试文档
