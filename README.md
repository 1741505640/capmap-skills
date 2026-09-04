# capmap-skills

Agent Skills for **capability-map curation**（能力底图策展）：方案 → 开发标识 → 测试 → 规范 → 归档。

这不是「随便写 docs」的 skill，而是一套可跨仓库复用的文档体系闭环：以**能力底图**为真相源，配合 Obsidian wikilink + Markdown 双轨，并用 `capmap-lint` 做结构校验。

## 套件一览

| Skill | 用途 |
|-------|------|
| `capmap-system` | 总入口、硬规则、契约 reference |
| `capmap-init` | 选定 `docs_root`、建目录骨架、写 `capmap.yaml` |
| `capmap-scheme` | 写/改进行中方案（含变更记录与 grilling 反问） |
| `capmap-dev` | 开发完成后更新底图 §1/§2，方案标到「已开发」 |
| `capmap-test` | 测试计划与通过记录 |
| `capmap-norm` | 长期使用/配置规范 |
| `capmap-backfill` | 从 git 反补底图 §4 |
| `capmap-archive` | 方案归档进 `_archive`（不留 stub） |
| `capmap-lint` | 断链 / 状态门禁 / 变更记录等校验 + CI action |

## 安装到业务仓库

目标布局：

```text
your-repo/
  .agents/skills/capmap-*/     ← 本仓 skills/ 下全部目录
  .agents/skills/capmap-system/capmap.yaml   ← 由 capmap-init 生成（勿提交本仓 example）
  .github/workflows/capmap-lint.yml          ← 可选，见 install/
  .cursor/rules/capmap-status-no-skip.mdc    ← 可选，见 install/
  <docs_root>/                 ← 任意名：docs / handbook / …
```

### Windows (PowerShell)

```powershell
# 在 capmap-skills 仓库根执行
.\scripts\install.ps1 -TargetRepo D:\path\to\your-repo
```

### macOS / Linux

```bash
./scripts/install.sh /path/to/your-repo
```

### 手动

```bash
mkdir -p your-repo/.agents/skills
cp -R skills/capmap-* your-repo/.agents/skills/
# 可选：
cp install/github-workflows/capmap-lint.yml your-repo/.github/workflows/
cp install/cursor-rules/capmap-status-no-skip.mdc your-repo/.cursor/rules/
```

然后在业务仓用 Agent 触发 **capmap-init**（选定 `docs_root`），或复制：

```bash
cp examples/capmap.yaml your-repo/.agents/skills/capmap-system/capmap.yaml
# 再按项目改 docs_root / themes
```

## 本地校验

在**业务仓库根**：

```bash
pip install pyyaml   # 若尚未安装
python .agents/skills/capmap-lint/capmap_lint.py
python .agents/skills/capmap-lint/capmap_lint.py --strict
```

## 设计要点（摘要）

1. 真相源 = **能力底图**，不是全局变更台账  
2. `docs_root` **名任意**，以 `capmap.yaml` 为准  
3. 方案必须有 `## 变更记录`；归档不留 stub  
4. 进度 Tag 挂在**方案**上；能力底图禁止 `状态/*`  
5. **禁止跳步**：未「已验证」不得「落地中 / 已落地」  
6. Obsidian：`[[唯一文件名]]` + Markdown 旁路链接  

细节见 `skills/capmap-system/reference/`。

## 目录结构（本仓库）

```text
capmap-skills/
  skills/           # 拷贝到业务仓 .agents/skills/
  install/          # 可选：CI workflow、Cursor rule
  examples/         # capmap.yaml 示例
  scripts/          # install.ps1 / install.sh
  README.md
  LICENSE
```

## 主源与贡献

- **权威副本 = 本仓库**（`capmap-skills`）  
- 业务仓只同步，不在业务仓单边改 Skill 契约  
- Issue / PR 欢迎；改契约请同步更新 `reference/decisions.md`

## License

MIT
