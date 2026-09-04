---
name: capmap-system
description: >-
  capmap-skills 总入口（能力底图策展，非普通 docs 操作）：方案→开发标识→测试→使用规范→归档；
  git 反补、docs_root、capmap-lint。配置 .agents/skills/capmap-system/capmap.yaml。
  主源仓库 capmap-skills（本套件）。当用户提到 capmap、能力底图、文档体系、测试文档、使用规范、归档、
  文档 lint、或不确定该用哪个 capmap-* 阶段时使用。各阶段 Skill 可独立触发。
---

# capmap-skills（总入口）

## 完整闭环

```text
方案文档（决策）     capmap-scheme
        ↓
开发落地（代码）     领域 skill + capmap-dev   ← 底图 §1/§2 标识「已开发」
        ↓
测试验证             capmap-test               ← 测什么 / 影响面 / 记录
        ↓
使用规范             capmap-norm               ← 配置/调用等长期规范
        ↓
方案归档             capmap-archive            ← 一次性方案进 _archive
        ↑
日常反补             capmap-backfill           ← 任意时刻用 git 补 §4
```

| 阶段产物 | 落点 |
|----------|------|
| 设计决策 | `<docs_root>/方案/<主题>/*.md` + `## 变更记录` |
| 功能完善标识 | 能力底图 §1 状态 + §2 代码路径（代码本身在 `apps/` 等） |
| 测试 | `<docs_root>/测试/<主题>/` |
| 使用/配置规范 | `<docs_root>/规范/`（长期） |
| 已结束方案全文 | `<docs_root>/_archive/方案/<主题>/` |

## 阶段 Skill（均可单独使用）

| 阶段 | Skill | 触发示例 |
|------|--------|----------|
| 初始化 / 对齐 | [capmap-init](../capmap-init/SKILL.md) | 「初始化文档目录」 |
| 写/改方案 | [capmap-scheme](../capmap-scheme/SKILL.md) | 「写方案」「需求又变了」 |
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
3. 写代码 → 领域 skill；**开发收尾**提示 `capmap-dev`，再视需要 `capmap-test` / `capmap-norm` / `capmap-archive`。

## 硬规则

1. 真相源 = 能力底图（策展反补）。
2. 禁止全局变更台账 / ledger_id / CL-ID。
3. 禁止能力底图用 `README.md` 命名。
4. 进行中方案必须有 **`## 变更记录`**。
5. **已开发** = 代码合入 + 底图 §1/§2 已更新（见 capmap-dev）。
6. **长期「怎么用/怎么配」** 进 `规范/`，不进一次性方案；底图 §3 链接之。
7. **测试计划与记录** 进 `测试/`；底图可链到对应测试文档。
8. 方案归档宜在「开发标识 +（如需）测试/规范」之后；归档不留 stub。
9. Obsidian Vault = docs_root；`[[wikilink]]` + Markdown 双轨。
10. 图谱靠**唯一文件名** wikilink（`[[系统架构]]`）；底图↔方案必须双向；禁止模板/`\|` 转义把链接写坏。
11. 改能力/方案状态时同步 YAML `tags` 中的 `状态/*`（见 [status-tags](reference/status-tags.md)）；禁止只改 Tag 不改底图 §1。
12. **进度 Tag 挂方案**（`方案中`…`开发中`…`已落地`→`已归档`）；**能力底图禁止 `状态/*`**；测试文 `测试中|已验证`。筛开发中：`tag:#状态/开发中 tag:#方案`。
13. **主状态禁止跳步（硬）**：未 `已验证` 不得 `落地中`/`已落地`；测试文仍为 `测试中` 时方案不得落地；详见 [status-tags](reference/status-tags.md)。违反 → capmap-lint `status_skip`。
14. **主源 = capmap-skills 公开仓**；业务仓只同步 Skill/契约，勿在业务仓单边演进。
15. 改完文档体系相关文件后宜跑 `python .agents/skills/capmap-lint/capmap_lint.py`（见 [capmap-lint](../capmap-lint/SKILL.md)）。
16. **脚本与配置放在对应 skill 目录**（配置→`capmap-system/`，lint→`capmap-lint/`）；禁止再散落到 `scripts/` 或 `.agents/` 根。

## 锚点

- 配置：本目录 [`capmap.yaml`](capmap.yaml)
- Skill：`.agents/skills/capmap-system/`
- 校验：`.agents/skills/capmap-lint/`（`capmap_lint.py` + `action.yml`）
- CI 薄入口：`.github/workflows/capmap-lint.yml`（GitHub 强制路径；逻辑在 skill）
- 安装：将本仓 `skills/capmap-*` 拷贝到业务仓 `.agents/skills/`（见仓库 README）
