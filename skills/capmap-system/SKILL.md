---
name: capmap-system
description: >-
  capmap-skills 总入口（能力底图策展，非普通 docs 操作）：方案→（大：规格/切片/门禁）→开发标识→测试→使用规范→归档；
  git 反补、docs_root、capmap-lint。配置 .agents/skills/capmap-system/capmap.yaml。
  主源仓库 capmap-skills（本套件）。当用户提到 capmap、能力底图、文档体系、测试文档、使用规范、归档、
  文档 lint、规格切片门禁、或不确定该用哪个 capmap-* 阶段时使用。各阶段 Skill 可独立触发。
---

# capmap-skills（总入口）

## 完整闭环

```text
方案（决策+体量）   capmap-scheme
        │
        ├─【小】──────────────────────────────┐
        │                                     │
        └─【大】capmap-spec → capmap-slice     │
                 → capmap-gate（用户点名）──────┤
                                              ↓
开发收尾                 capmap-dev   ← 底图 §1/§2「已开发」
        ↓
测试验证                 capmap-test
        ↓
使用规范                 capmap-norm
        ↓
方案归档                 capmap-archive
        ↑
日常反补                 capmap-backfill
```

| 阶段产物 | 落点 |
|----------|------|
| 设计决策 | `<docs_root>/方案/<主题>/*.md` + `## 变更记录` |
| 规格/切片（大） | `方案/<主题>/切片/<方案stem>/` |
| 功能完善标识 | 能力底图 §1 状态 + §2 代码路径 |
| 测试 | `<docs_root>/测试/<主题>/` |
| 使用/配置规范 | `<docs_root>/规范/`（长期） |
| 已结束方案全文 | `<docs_root>/_archive/方案/<主题>/`（含切片目录） |

## 阶段 Skill（均可单独使用）

| 阶段 | Skill | 触发示例 |
|------|--------|----------|
| 初始化 / 对齐 | [capmap-init](../capmap-init/SKILL.md) | 「初始化文档目录」 |
| 写/改方案 | [capmap-scheme](../capmap-scheme/SKILL.md) | 「写方案」「需求又变了」 |
| 大：执行规格 | [capmap-spec](../capmap-spec/SKILL.md) | 「写规格」「to-spec」 |
| 大：拆切片 | [capmap-slice](../capmap-slice/SKILL.md) | 「拆切片」「to-tickets」 |
| 大：门禁/frontier | [capmap-gate](../capmap-gate/SKILL.md) | 「看 frontier」「开 01」「验收通过」 |
| 开发完成标识 | [capmap-dev](../capmap-dev/SKILL.md) | 「功能开发完了」「底图标记已开发」 |
| 测试计划与记录 | [capmap-test](../capmap-test/SKILL.md) | 「写测试点」「回归范围」「测试通过记一下」 |
| 使用/配置规范 | [capmap-norm](../capmap-norm/SKILL.md) | 「写权限配置规范」「AG-UI 调用约定」 |
| git 反补底图 | [capmap-backfill](../capmap-backfill/SKILL.md) | 「反补变更轨迹」 |
| 方案归档 | [capmap-archive](../capmap-archive/SKILL.md) | 「方案归档」「方案已闭环」 |
| 文档校验 | [capmap-lint](../capmap-lint/SKILL.md) | 「文档 lint」「检查文档体系」 |

> [templates](reference/templates.md) · [status-tags](reference/status-tags.md) · [decisions](reference/decisions.md) · [directory-contract](reference/directory-contract.md) · [project-config](reference/project-config.md) · [lifecycle](reference/lifecycle.md)

## 路径约定

1. 先读 `.agents/skills/capmap-system/capmap.yaml` → `docs_root`
2. 无配置 → [capmap-init](../capmap-init/SKILL.md)
3. 文中 `<docs_root>` = 配置值；**不要写死目录名**

## 路由

1. 匹配上表 → 加载对应阶段 Skill。
2. 只问规范/闭环怎么走 → 本 Skill + lifecycle。
3. **体量/大** 且在规格/拆分/切片执行期 → spec / slice / gate（勿跳过直接 dev）。
4. 写代码 → 领域 skill；**开发收尾**提示 `capmap-dev`，再视需要 `capmap-test` / `capmap-norm` / `capmap-archive`。

## 硬规则

1. 真相源 = 能力底图（策展反补）。
2. 禁止全局变更台账 / ledger_id / CL-ID。
3. 禁止能力底图用 `README.md` 命名。
4. 进行中方案必须有 **`## 变更记录`**。
5. **已开发** = 代码合入 + 底图 §1/§2 已更新；**体量/大** 另须切片全 `已验收`（见 capmap-dev）。
6. **长期「怎么用/怎么配」** 进 `规范/`，不进一次性方案；底图 §3 链接之。
7. **测试计划与记录** 进 `测试/`；底图可链到对应测试文档。
8. 方案归档宜在「开发标识 +（如需）测试/规范」之后；归档不留 stub；大需求切片目录随方案归档。
9. Obsidian Vault = docs_root；`[[wikilink]]` + Markdown 双轨。
10. 图谱靠**唯一文件名** wikilink；切片文件名须带 `<方案stem>-` 前缀。
11. 改能力/方案/切片状态时同步 YAML `状态/*`；禁止只改 Tag 不改底图 §1（能力进度）。
12. **进度 Tag 挂方案**；切片用类型 `切片`；**能力底图禁止 `状态/*`**；测试文 `测试中|已验证`。
13. **主状态禁止跳步（硬）**：体量分支 + 验证门；详见 [status-tags](reference/status-tags.md)。违反 → capmap-lint。
14. **主源 = capmap-skills 公开仓**；业务仓只同步 Skill/契约。
15. 改完文档体系相关文件后宜跑 `python .agents/skills/capmap-lint/capmap_lint.py`。
16. **脚本与配置放在对应 skill 目录**；禁止再散落到 `scripts/` 或 `.agents/` 根。
17. 切片：**用户点名才开跑**；交票须 Demo+自测；Agent 不得自评 `已验收`。

## 锚点

- 配置：本目录 [`capmap.yaml`](capmap.yaml)
- Skill：`.agents/skills/capmap-system/`
- 校验：`.agents/skills/capmap-lint/`（`capmap_lint.py` + `action.yml`）
- CI 薄入口：`.github/workflows/capmap-lint.yml`
- 安装：将本仓 `skills/capmap-*` 拷贝到业务仓 `.agents/skills/`（见仓库 README）
