# 项目配置 `.agents/skills/capmap-system/capmap.yaml`

由 **capmap-init** 在初始化时写入（或对齐时更新）。所有 `capmap-*` 阶段启动时先读此文件。

## 示例

```yaml
# 相对仓库根；不要前导 ./ ；不要尾部 /
docs_root: docs

main_branch: develop
curator_mode: true
obsidian: true
archive_policy: no_stub   # no_stub = 落地删除活跃副本

themes:
  - id: 权限-abac
    map: 能力底图-权限与ABAC.md
  - id: 部署-nacos
    map: 能力底图-Nacos注册与停机.md
```

## 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `docs_root` | 是 | 文档根目录名，任意合法目录名 |
| `main_branch` | 建议 | 反补用分支，默认 `develop` |
| `curator_mode` | 否 | 默认 true：个人策展反补 |
| `obsidian` | 否 | 默认 true |
| `archive_policy` | 否 | 默认 `no_stub` |
| `themes` | 否 | 主题 id + 底图文件名；init 时可生成 |

> **主源**：权威副本在 **capmap-skills** 公开仓；业务仓只同步，不在业务仓单边演进。

## Agent 规则

1. **先读配置再动文件**；无文件则问用户 `docs_root` 或跑 capmap-init。
2. 所有路径 = `docs_root + "/" + 相对契约路径`。
3. Obsidian Vault = **docs_root 指向的文件夹**（不是仓库根）。
4. 改名 docs_root：更新本 yaml + 移动目录 + 修正 gitignore；不要只改一半。
5. 文档体系改动后宜跑 `python .agents/skills/capmap-lint/capmap_lint.py`。
