---
name: capmap-init
description: >-
  初始化或对齐仓库文档根目录（docs_root 名任意）：选定并写入 .agents/skills/capmap-system/capmap.yaml，
  创建文档首页、主题能力底图、规范/运维/归档索引、gitignore、可选 Obsidian。
  适用于「初始化 docs」「整理文档目录」「按能力底图体系建文档」「对齐文档结构」时使用。
---

# capmap-init — 初始化 / 对齐

原则：[capmap-system](../capmap-system/SKILL.md)  
契约：[directory-contract](../capmap-system/reference/directory-contract.md)  
配置：[project-config](../capmap-system/reference/project-config.md)  
模板：[templates](../capmap-system/reference/templates.md) · Tag：[status-tags](../capmap-system/reference/status-tags.md)

## 第一件事：统一 docs_root

目录叫什么**无所谓**，但**一个仓库只能有一个**，且必须持久化：

1. 询问用户：文档根目录相对仓库根叫什么？（例：`docs` / `doc` / `handbook` / `aigc-maop-server`）
2. 若已存在 `.agents/skills/capmap-system/capmap.yaml` → 读取并确认是否沿用
3. 若磁盘上已有文档树但无配置 → 探测候选目录（含 `文档首页.md` 或 `方案/能力底图-*`），请用户确认后写入配置
4. **写入/更新** `.agents/skills/capmap-system/capmap.yaml` 的 `docs_root`（及其他字段）
5. 之后本 Skill 与其它 capmap-* **只使用该路径**

不要默认「一定叫 docs」。

## 模式

| 模式 | 条件 | 行为 |
|------|------|------|
| **新建** | docs_root 不存在或为空 | 创建完整骨架 + 写配置 |
| **对齐检查** | 已有体系 + 已有配置 | 对照契约列缺口，只补缺失 |

## 执行前确认的参数

| 参数 | 说明 |
|------|------|
| `docs_root` | **必填**，任意合法目录名 |
| `themes[]` | 可空；有则生成对应能力底图空壳 |
| `main_branch` | 默认 `develop` |
| `obsidian` | 默认 true |
| gitignore | 是否按 docs_root 放开知识文档、只忽略产物 |

## Checklist

```
- [ ] 1. 选定 docs_root（询问 / 探测 / 确认）
- [ ] 2. 写入 .agents/skills/capmap-system/capmap.yaml
- [ ] 3. 创建 <docs_root>/ 下：方案/<主题>、测试/<主题>、规范、交付、运维、_archive/方案
- [ ] 4. 写 文档首页.md、能力总览.md、方案/测试/规范等 *索引.md
- [ ] 5. 每主题 能力底图-<可读名>.md；文件名唯一；禁止 README 当底图；空壳文首 `tags: [能力底图]`（无 §1 行则暂不写 `状态/*`）
- [ ] 6. 可选：Obsidian使用说明.md + <docs_root>/.obsidian/（说明含状态 Tag 用法）
- [ ] 7. gitignore：针对 <docs_root>
- [ ] 8. 验收：配置可解析；闭环目录（方案/测试/规范/归档）齐全
- [ ] 9. 若对齐已有文档：方案文首回链底图；底图 §0/文首用唯一文件名挂方案；无 Obsidian 孤儿
```

## 不负责

- 不根据已有方案正文**推断并填满**底图 §1 / `状态/*`（存量补全用 capmap-backfill / capmap-scheme）
- 方案 / 开发标识 / 测试 / 规范 / 反补 / 归档 → 见 capmap-scheme、capmap-dev、capmap-test、capmap-norm、capmap-backfill、capmap-archive

## 对齐检查输出格式

```markdown
## 文档根对齐结果
- docs_root（配置）：…
- 已存在：…
- 缺失（将创建）：…
- 违规：如 方案/xx/README.md 当作底图
- 跳过（不覆盖）：…
```
