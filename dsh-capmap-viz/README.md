# dsh-capmap-viz

CapMap 文档体系可视化 DSH 插件（双半）：选中本地工作区 → 读 `capmap.yaml` → 定位 `docs_root` → 渲染 **Obsidian Graph View 风格语义图谱 + 能力面板**。

方案见本仓 `docs/_archive/方案/文档体系/CapMap可视化-DSH插件V4.md`（V1/V2/V3 同目录）。

## 目录

```text
src/
├── index.ts          # Host 插件体（CapMapService + /capmap RPC）
├── client/           # Client：侧栏 DOM 入口 + 中栏面板 + canvas 图谱
├── parser/           # CapMapParser（Cordis-free 纯函数 + 单测）
└── invariant.ts      # 包级 invariant 伴生
cordis.patch.yml      # web profile 的 Host 插入层
```

## 安装（已发布 npm）

```powershell
dsh plugin --profile web add @chenjh12/dsh-capmap-viz
dsh web --dump-config
```

组成树应有 `# == @chenjh12/dsh-capmap-viz` 与 `id: capmap-viz`。然后 `dsh web`。

打开工作区后若提示 **未找到 docs_root**：点 **一键安装 Skill 并初始化**：先装 skill（`npx skills add`，失败则 **git sparse** 回退拷贝 `skills/capmap-*`），再写 `<工作区名>-docs` 骨架。仅有 `capmap.yaml`、没有 `SKILL.md` 会视为未安装并重试。安装失败会在面板标红（骨架仍可能已写入）。

```bash
npx skills add 1741505640/capmap-skills --skill '*' -y
```

完成后自动重新加载图谱。手动命令仍可在面板「手动命令（备用）」展开。

## 本地开发（Web GUI）

在 `dsh-capmap-viz/`：

```sh
npm install
npm run build
```

**Windows：** 不要用 `link:D:/...` 绝对路径。用 profile 内相对 junction：

```powershell
$web = "$env:USERPROFILE\.dsh\profiles\web"
New-Item -ItemType Directory -Force -Path "$web\vendor" | Out-Null
cmd /c mklink /J "$web\vendor\dsh-capmap-viz" "D:\python\capmap-skills\dsh-capmap-viz"
dsh plugin --profile web add link:vendor/dsh-capmap-viz
dsh web --dump-config
```

校验：`# == @chenjh12/dsh-capmap-viz`、`id: capmap-viz`。若未进 bundles，把 `@chenjh12/dsh-capmap-viz` 加进 `$web\package.json` 的 `dsh.profile.bundles`，并保证 `node_modules\@chenjh12\dsh-capmap-viz` 指向 `vendor\dsh-capmap-viz`。

## 发布到 npm

需已 `npm login`（账号 `chenjh12`）。在 `dsh-capmap-viz/`：

```sh
npm run build
npm version patch
npm publish --access public --registry https://registry.npmjs.org
```

升版：改 `package.json` 的 `version` 后再 `npm publish`。

## 使用

1. `dsh web` 后侧栏可见「能力底图」入口（宽栏文字 / 折叠轨图标）。
2. 点入口 → 选 Workspace → 图谱加载；类型填色、状态描边；hover / 1-hop / 缩放平移 / Fit。
3. 「关闭」交回会话；可「更换工作区」。

改源码后 `npm run build` 并重启 `dsh web`（Host 不热更）。

## 图谱配色

权威源码：`src/client/graph/colors.ts`（节点 **填充=类型**，**描边=生命周期状态**；已归档另用虚线描边）。

### 类型填充

| 类型 | 色值 | 观感 |
|------|------|------|
| map（底图） | `#3b82f6` | 蓝 |
| scheme（方案） | `#22c55e` | 绿 |
| test（测试） | `#eab308` | 黄 |
| norm（规范） | `#a855f7` | 紫 |
| index（索引） | `#9ca3af` | 灰 |
| archive（归档路径节点） | `#6b7280` | 深灰 |
| overview（全貌） | `#f97316` | 橙 |
| 未知 | `#9ca3af` | 灰（默认） |

### 状态描边

相邻阶段刻意拉开色相：灰(构思) → 紫(规格) → 橙(开发中) → 青(已开发) → 黄(验证) → 绿(落地)。

| 状态 | 色值 | 观感 |
|------|------|------|
| 方案中 | `#e2e8f0` | 浅灰 |
| 已确认 | `#94a3b8` | 石板灰 |
| 规格中 | `#818cf8` | 靛紫 |
| 已拆分 | `#c084fc` | 浅紫 |
| 开发中 | `#f97316` | 橙 |
| 已开发 | `#22d3ee` | 青 |
| 验证中 | `#eab308` | 黄 |
| 已验证 | `#4ade80` | 亮绿 |
| 落地中 | `#2dd4bf` | 青绿 |
| 已落地 | `#34d399` | 翠绿 |
| 已归档 | `#6b7280` | 深灰 + 虚线 |
| 测试中 | `#fbbf24` | 琥珀（测试文轨） |
| 无状态 | `#111827` | 近黑（默认描边） |

目录「生命周期」条与详情状态 pill 与上表同一套色。

## 单测（无需 GUI）

```sh
npm test
```
