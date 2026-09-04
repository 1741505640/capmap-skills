# capmap-skills

Vibe Coding 时代的**能力底图策展**套件：把「方案 → 开发 → 测试 → 落地 → 归档」做成可复用的 Agent Skills 闭环，并用 Obsidian 把方案关系画成图谱。

核心理念：**代码给 Agent 看，文档给人看**——人靠可读的方案与底图理解系统；Agent 靠契约化文档与状态机把开发节奏跑完整。

## 为什么需要

高频用 AI 写代码时，常见几组矛盾会同时出现：

| 矛盾 | 表现 |
|------|------|
| 感知下降 | 改动很快，人对模块边界、函数意图的掌握变浅，Review 变难 |
| 方案膨胀 | 每次开发都会产出 Plan / 方案；久而久之仓库里文档越来越多，难检索、难淘汰 |
| 关联断裂 | 方案与真实代码路径、git 合入历史弱关联；事后很难回答「这个能力落在哪、怎么来的」 |
| 关系隐形 | 方案与方案之间有依赖、替代、分叉，散落 Markdown 里看不出来 |

直觉上「多写文档」并不能自动解决这些问题。capmap-skills 换了一条路径：

1. **人读文档**：方案写清决策与变更；能力底图写清「有什么能力、代码在哪、怎么用」。
2. **Agent 跟契约**：按阶段 Skill 推进，状态不可跳步，改完可 lint。
3. **图谱给人导航**：以 `docs_root` 为 Obsidian Vault，用唯一文件名的 `[[wikilink]]` 把底图、方案、测试、规范连成图。

## 这套 Skill 能做什么

- **初始化**：选定任意名的 `docs_root`，生成目录骨架与 `capmap.yaml`
- **写方案**：进行中方案带 `## 变更记录`，可配合 grilling 反问把模糊需求问清楚
- **开发收尾**：代码合入后更新能力底图 §1/§2，方案标到「已开发」（不等于已落地）
- **测试与规范**：测试进 `测试/`，长期用法进 `规范/`，再谈落地
- **反补与归档**：从 git 反补底图变更轨迹；闭环方案进 `_archive`（不留 stub）
- **结构校验**：`capmap-lint` 查断链、状态跳步、变更记录等；可接 CI
- **Obsidian 可视化**：底图 ↔ 方案双向链接，方案关系可在图谱中查看

### 闭环

```text
方案（决策）     capmap-scheme
      ↓
开发（代码）     领域 skill + capmap-dev     ← 底图 §1/§2「已开发」
      ↓
测试             capmap-test                 ← 测什么 / 影响面 / 记录
      ↓
规范             capmap-norm                 ← 配置 / 调用等长期契约
      ↓
归档             capmap-archive              ← 一次性方案进 _archive
      ↑
反补             capmap-backfill             ← 任意时刻用 git 补底图 §4
```

方案主状态（禁止跳步：未「已验证」不得「落地中 / 已落地」）：

```text
方案中 → 已确认 → 开发中 → 已开发 → 验证中 → 已验证 → 落地中 → 已落地 → 已归档
```

### 套件一览

| Skill | 用途 |
|-------|------|
| `capmap-system` | 总入口、硬规则、契约 reference |
| `capmap-init` | 选定 `docs_root`、建骨架、写 `capmap.yaml` |
| `capmap-scheme` | 写/改进行中方案 |
| `capmap-dev` | 开发完成后更新底图，方案标「已开发」 |
| `capmap-test` | 测试计划与通过记录 |
| `capmap-norm` | 长期使用 / 配置规范 |
| `capmap-backfill` | 从 git 反补底图 §4 |
| `capmap-archive` | 方案归档进 `_archive` |
| `capmap-lint` | 断链 / 状态门禁等校验 + CI action |

细节见 `skills/capmap-system/reference/`（生命周期、状态 Tag、目录契约、模板等）。

## 怎么用（业务仓库）

安装完成后，在业务仓对 Agent 说自然语言即可，例如：

| 你说 | 通常触发 |
|------|----------|
| 「初始化文档目录 / 按能力底图建文档」 | `capmap-init` |
| 「写个方案 / 需求又变了」 | `capmap-scheme` |
| 「功能开发完了，更新底图」 | `capmap-dev` |
| 「写测试点 / 记一下测试通过」 | `capmap-test` |
| 「写调用约定 / 权限配置规范」 | `capmap-norm` |
| 「从 git 反补变更轨迹」 | `capmap-backfill` |
| 「方案归档」 | `capmap-archive` |
| 「检查文档体系 / 跑 lint」 | `capmap-lint` |

不确定阶段时，说「按 capmap 来」即可走 `capmap-system` 路由。

**推荐日常节奏**

1. 新主题先 `capmap-init`（或确认已有 `capmap.yaml`）
2. 开需求 → `capmap-scheme`（评审通过后再标「已确认」）
3. 编码合入 → `capmap-dev`
4. 需要验证 → `capmap-test`；稳定契约 → `capmap-norm`
5. 闭环结束 → `capmap-archive`；平时随时 `capmap-backfill`
6. 改完文档跑一次 lint

把 Obsidian 打开到业务仓的 `docs_root`，即可浏览方案图谱。

## 安装

本套件**权威落点**是业务仓的 `.agents/skills/capmap-*`（配置与 lint 路径都按此约定）。Cursor / Codex / Deep Agents 等多数工具直接读该目录；Claude Code 另需 `.claude/skills/` 发现入口（见下文）。

目标布局：

```text
your-repo/
  .agents/skills/capmap-*/              ← 本仓 skills/ 下全部目录
  .agents/skills/capmap-system/capmap.yaml   ← capmap-init 生成（勿提交本仓 example 当生产配置）
  .github/workflows/capmap-lint.yml     ← 可选
  .cursor/rules/capmap-status-no-skip.mdc  ← 可选（Cursor）
  <docs_root>/                          ← 任意名：docs / handbook / …
```

### 方式 A：本仓安装脚本（推荐，保证契约路径一致）

在 **capmap-skills 仓库根**执行：

**Windows (PowerShell)**

```powershell
.\scripts\install.ps1 -TargetRepo D:\path\to\your-repo
# 可选：CI + Cursor rule
.\scripts\install.ps1 -TargetRepo D:\path\to\your-repo -WithExtras
# 可选：写入示例配置（再改 docs_root）
.\scripts\install.ps1 -TargetRepo D:\path\to\your-repo -WithExampleConfig
```

**macOS / Linux**

```bash
./scripts/install.sh /path/to/your-repo
./scripts/install.sh --with-extras /path/to/your-repo
./scripts/install.sh --with-example-config /path/to/your-repo
```

然后在业务仓让 Agent 跑 **capmap-init**，或手动复制并编辑：

```bash
cp examples/capmap.yaml your-repo/.agents/skills/capmap-system/capmap.yaml
```

### 方式 B：`npx skills`（按 Agent 分发）

若仓库已发布到 GitHub，可用 [skills CLI](https://skills.sh/)：

```bash
# 安装到当前项目，并写入所指定 Agent 的 skills 目录
npx skills add 1741505640/capmap-skills --skill '*' -y

# 指定 Agent（可多选）
npx skills add 1741505640/capmap-skills --agent cursor codex claude-code deepagents --skill '*' -y

# 装到全部已检测 Agent
npx skills add 1741505640/capmap-skills --agent '*' --skill '*' -y
```

> 若 CLI 只把文件链到 `.claude/skills/` 等目录、而未落到 `.agents/skills/`，请再用方式 A 补一份到 `.agents/skills/`，否则 `capmap.yaml` / lint 的约定路径会对不上。

### 方式 C：手动拷贝

```bash
mkdir -p your-repo/.agents/skills
cp -R skills/capmap-* your-repo/.agents/skills/
# 可选
mkdir -p your-repo/.github/workflows your-repo/.cursor/rules
cp install/github-workflows/capmap-lint.yml your-repo/.github/workflows/
cp install/cursor-rules/capmap-status-no-skip.mdc your-repo/.cursor/rules/
```

### 各 Agent 怎么装

| Agent | 项目级发现目录 | 建议做法 |
|-------|----------------|----------|
| **Cursor** | `.agents/skills/`（亦认 `.cursor/skills/`） | 方式 A 即可；可选 `-WithExtras` 装禁止跳步 rule。聊天里 `/capmap-…` 或自然语言触发 |
| **Codex** | `.agents/skills/`；全局也可在 `$CODEX_HOME/skills` | 方式 A 或 `npx skills add … --agent codex` |
| **Claude Code** | `.claude/skills/` | 先方式 A 装到 `.agents/skills/`，再为每个 skill 建发现入口（见下） |
| **Deep Agents** | `.agents/skills/`；全局 `~/.deepagents/agent/skills` | 方式 A，或 `npx skills add … --agent deepagents` |
| **其他**（Cline、OpenCode、Amp、Goose…） | 多数兼容 `.agents/skills/` | 方式 A；或 `npx skills add … --agent <name>` |

**Claude Code 发现入口示例**（在业务仓根，PowerShell）：

```powershell
New-Item -ItemType Directory -Force -Path .claude\skills | Out-Null
Get-ChildItem .agents\skills -Directory -Filter "capmap-*" | ForEach-Object {
  $link = Join-Path ".claude\skills" $_.Name
  if (Test-Path $link) { Remove-Item $link -Recurse -Force }
  New-Item -ItemType Junction -Path $link -Target $_.FullName | Out-Null
}
```

macOS / Linux：

```bash
mkdir -p .claude/skills
for d in .agents/skills/capmap-*; do
  ln -sfn "$(pwd)/$d" ".claude/skills/$(basename "$d")"
done
```

配置与校验仍以 `.agents/skills/capmap-system/capmap.yaml` 和 `capmap-lint` 为准；Claude Code 只是多一条 skill 发现路径。

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

## 本仓库结构

```text
capmap-skills/
  skills/           # 拷贝到业务仓 .agents/skills/
  docs/             # 本套件自身迭代 Vault（能力底图 + 归档方案）
  install/          # 可选：CI workflow、Cursor rule
  examples/         # 业务仓 capmap.yaml 示例
  scripts/          # install.ps1 / install.sh
  README.md
  LICENSE
```

套件迭代记录：[能力底图-文档能力体系](docs/方案/文档体系/能力底图-文档能力体系.md) · [docs/](docs/)

## 主源与贡献

- **权威副本 = 本仓库**（`capmap-skills`）
- 业务仓只同步，不在业务仓单边改 Skill 契约
- Issue / PR 欢迎；改契约请同步更新 `skills/capmap-system/reference/decisions.md`

## License

MIT
