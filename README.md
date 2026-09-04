# capmap-skills

Vibe Coding 时代的**能力底图策展**套件：把「方案 → 开发 → 测试 → 落地 → 归档」做成可复用的 Agent Skills 闭环，并用 Obsidian 把方案关系画成图谱。

核心理念：**代码给 Agent 看，文档给人看**——人靠可读的方案与底图理解系统；Agent 靠契约化文档与状态机把开发节奏跑完整。

## 为什么需要

高频用 AI 写代码时，几组矛盾会同时出现：

| 矛盾 | 表现 |
|------|------|
| 感知下降 | 改动很快，人对模块边界、函数意图的掌握变浅，Review 变难 |
| 方案膨胀 | 每次开发都会产出 Plan / 方案；文档越来越多，难检索、难淘汰 |
| 关联断裂 | 方案与真实代码路径、git 合入历史弱关联 |
| 关系隐形 | 方案之间的依赖、替代、分叉，散落 Markdown 里看不出来 |

capmap-skills 的解法：

1. **人读文档**：方案写清决策与变更；能力底图写清「有什么能力、代码在哪、怎么用」
2. **Agent 跟契约**：按阶段 Skill 推进，状态不可跳步，改完可 lint
3. **图谱给人导航**：以 `docs_root` 为 Obsidian Vault，用唯一文件名 `[[wikilink]]` 连成图（init 预置状态颜色组）

## 能做什么

| 能力 | 说明 |
|------|------|
| 初始化 | 选定任意名的 `docs_root`，建骨架、写 `capmap.yaml`，写入 Obsidian `graph.json` 颜色组 |
| 写方案 | 进行中方案带 `## 变更记录` |
| 开发收尾 | 合入后更新底图 §1/§2，方案标「已开发」（≠ 已落地） |
| 测试 / 规范 | 测试进 `测试/`，长期用法进 `规范/`，再谈落地 |
| 反补 / 归档 | git 反补底图 §4；闭环方案进 `_archive`（不留 stub） |
| 校验 | `capmap-lint` 查断链、状态跳步等；skill 内含 GitHub `action.yml` |

### 闭环

```text
方案（决策+体量）  capmap-scheme
      │
      ├─【小】────────────────────────────┐
      └─【大】spec → slice → gate（点名）──┤
                                          ↓
开发收尾              capmap-dev
      ↓
测试 / 规范 / 归档    capmap-test → norm → archive
      ↑
反补                  capmap-backfill
```

方案主状态（**禁止跳步**；大需求多 `规格中`→`已拆分`）：

```text
小：方案中 → 已确认 → 开发中 → 已开发 → 验证中 → 已验证 → 落地中 → 已落地 → 已归档
大：方案中 → 已确认 → 规格中 → 已拆分 → 开发中 → 已开发 → …（同上）
```

### 套件

| Skill | 用途 |
|-------|------|
| `capmap-system` | 总入口、硬规则、契约 reference |
| `capmap-init` | `docs_root`、骨架、`capmap.yaml`、Obsidian 颜色组 |
| `capmap-scheme` | 写/改方案；升已确认时体量判断+询问 |
| `capmap-spec` | 大需求：执行规格 |
| `capmap-slice` | 大需求：垂直切片 DAG；推荐运行模式后停住 |
| `capmap-gate` | 大需求：frontier / 点名开干 / 交票验收 |
| `capmap-dev` | 开发完成后更新底图（大：须切片全验收） |
| `capmap-test` | 测试计划与记录 |
| `capmap-norm` | 长期使用 / 配置规范 |
| `capmap-backfill` | 从 git 反补底图 §4 |
| `capmap-archive` | 方案归档 |
| `capmap-lint` | 结构校验 + `action.yml` |

契约细节：`skills/capmap-system/reference/`。

## 安装

本套件只发布 `skills/capmap-*`。权威落点是业务仓的 **`.agents/skills/`**（`capmap.yaml` 与 lint 路径都按此约定）。

装完后目标布局：

```text
your-repo/
  .agents/skills/capmap-*/                 ← 本仓 skills/ 下全部目录
  .agents/skills/capmap-system/capmap.yaml ← 由 capmap-init 生成
  <docs_root>/                             ← 任意名；init 时选定
```

### 推荐：`npx skills`

在**业务仓根目录**：

```bash
npx skills add 1741505640/capmap-skills --skill '*' -y

# 指定 Agent（可多选）
npx skills add 1741505640/capmap-skills --agent cursor codex claude-code --skill '*' -y

# 检测到的全部 Agent
npx skills add 1741505640/capmap-skills --agent '*' --skill '*' -y
```

装的是 `skills/` 下各 skill 整目录（含 `reference/`、`capmap_lint.py`、`assets/obsidian/graph.json` 等），不是整仓其它文件。

然后对 Agent 说：**「按 capmap-init 初始化文档目录」**（选定 `docs_root`）。没有这一步，方案/底图没有落点。

> Cursor / Codex 等项目级目录是 `.agents/skills/`，路径与契约一致。  
> 若只装到 Claude Code 的 `.claude/skills/`，请保证业务仓仍有一份 `.agents/skills/capmap-*`（或对 `.agents` 做 junction/symlink），否则读不到 `capmap.yaml`。

### 手动拷贝

```bash
mkdir -p your-repo/.agents/skills
cp -R skills/capmap-* your-repo/.agents/skills/
```

### 各 Agent

| Agent | 项目级发现目录 | 做法 |
|-------|----------------|------|
| **Cursor** | `.agents/skills/`（亦认 `.cursor/skills/`） | `npx skills add … --agent cursor` 或手动拷贝 |
| **Codex** | `.agents/skills/` | `--agent codex` 或手动拷贝 |
| **Claude Code** | `.claude/skills/` | 先保证 `.agents/skills/` 有实体，再链到 `.claude/skills/`（见下） |
| **其他**（Deep Agents、Cline、OpenCode…） | 多数认 `.agents/skills/` | `--agent <name>` 或手动拷贝 |

**Claude Code 发现入口**（业务仓根已有 `.agents/skills/capmap-*` 时）：

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Force -Path .claude\skills | Out-Null
Get-ChildItem .agents\skills -Directory -Filter "capmap-*" | ForEach-Object {
  $link = Join-Path ".claude\skills" $_.Name
  if (Test-Path $link) { Remove-Item $link -Recurse -Force }
  New-Item -ItemType Junction -Path $link -Target $_.FullName | Out-Null
}
```

```bash
# macOS / Linux
mkdir -p .claude/skills
for d in .agents/skills/capmap-*; do
  ln -sfn "$(pwd)/$d" ".claude/skills/$(basename "$d")"
done
```

可选 CI：把业务仓 `.github/workflows/` 写成调用 `uses: ./.agents/skills/capmap-lint`（逻辑已在 skill 的 `action.yml`）。

## 怎么用

| 你说 | 通常触发 |
|------|----------|
| 「初始化文档目录」 | `capmap-init` |
| 「写方案 / 需求又变了」 | `capmap-scheme` |
| 「写规格」 | `capmap-spec`（体量/大） |
| 「拆切片」 | `capmap-slice` |
| 「看 frontier / 开 01 / 验收通过」 | `capmap-gate` |
| 「功能开发完了，更新底图」 | `capmap-dev` |
| 「写测试点 / 测试通过记一下」 | `capmap-test` |
| 「写调用约定 / 配置规范」 | `capmap-norm` |
| 「从 git 反补变更轨迹」 | `capmap-backfill` |
| 「方案归档」 | `capmap-archive` |
| 「检查文档体系 / 跑 lint」 | `capmap-lint` |

不确定阶段时说「按 capmap 来」→ `capmap-system`。

**日常节奏**：  
- **小**：init → scheme（已确认+体量/小）→ 编码 → dev → test → norm → archive  
- **大**：scheme（体量/大）→ spec → slice（推荐模式后停住）→ **你点名** → gate 循环 → 全验收 → dev → test → …  
随时 backfill；改完文档跑 lint。

Obsidian 打开业务仓的 `docs_root` 即可看图谱（颜色按状态 Tag 区分）。

### 本地 lint

```bash
pip install pyyaml
python .agents/skills/capmap-lint/capmap_lint.py
python .agents/skills/capmap-lint/capmap_lint.py --strict
```

## 设计要点

1. 真相源 = **能力底图**，不是全局变更台账  
2. `docs_root` **名任意**，以 `capmap.yaml` 为准  
3. 方案必须有 **`## 变更记录`**；归档不留 stub  
4. 进度 Tag 挂在**方案**上；切片用类型 `切片`；能力底图禁止状态 Tag  
5. **禁止跳步**：验证门 + 大需求规格/拆分门 + 切片全验收才已开发  
6. 切片落盘：`方案/<主题>/切片/<方案stem>/` + 唯一文件名；用户点名才开跑  
7. Obsidian：`[[唯一文件名]]` + Markdown 旁路；init 写入 `graph.json` 颜色组  

## 本仓库

```text
capmap-skills/
  skills/     # 唯一需要安装到业务仓的内容 → .agents/skills/
  README.md
  LICENSE
```

- **权威副本 = 本仓库**；业务仓只同步 Skill，勿单边改契约  
- 改契约请同步更新 `skills/capmap-system/reference/decisions.md`

## License

MIT
