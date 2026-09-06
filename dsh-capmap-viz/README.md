# dsh-capmap-viz

CapMap 文档体系可视化 DSH 插件（双半）：选中本地项目 → 读 `capmap.yaml` → 定位 `docs_root` → 渲染 **Obsidian Graph View 风格语义图谱 + 能力面板**。

方案与规格见本仓 `docs/方案/文档体系/CapMap可视化-DSH插件.md`。

## 目录

```text
src/
├── index.ts          # Host 插件体（CapMapService + /capmap RPC）
├── client/           # Client 插件体（shell.overlay 浮层 + canvas 图谱）
├── parser/           # CapMapParser（Cordis-free 纯函数 + 单测）
└── invariant.ts      # 包级 invariant 伴生
cordis.patch.yml      # web profile 的 Host 插入层
```

## 本地跑通（Web GUI）

在 `dsh-capmap-viz/`：

```sh
npm install
npm run build
```

**Windows：** pnpm 的 `link:D:/...` 会被当成相对路径（接到 `%USERPROFILE%\.dsh\profiles\web\D:\...`），插件装不上。用 profile 内相对 junction：

```powershell
$web = "$env:USERPROFILE\.dsh\profiles\web"
New-Item -ItemType Directory -Force -Path "$web\vendor" | Out-Null
cmd /c mklink /J "$web\vendor\dsh-capmap-viz" "D:\python\capmap-skills\dsh-capmap-viz"
dsh plugin --profile web add link:vendor/dsh-capmap-viz
dsh web --dump-config
```

组成树末尾应有 `# == @deepseek-ai/dsh-capmap-viz` 以及 `id: capmap-viz`。若 `add` 只写成普通依赖、没有进 bundles，把 `@deepseek-ai/dsh-capmap-viz` 加进 `$web\package.json` 的 `dsh.profile.bundles`，并保证 `node_modules\@deepseek-ai\dsh-capmap-viz` 指向 `vendor\dsh-capmap-viz`。

然后 `dsh web` 打开浏览器。

浏览器打开后：

1. 全屏浮层应直接出现；右上角可「关闭」，右下角按钮可再打开。
2. 项目根填 `D:\python\capmap-skills`（或本仓库绝对路径）→ **加载**。
3. 应见图谱：类型填色、状态描边；hover ≥200ms 迷你卡；click 1-hop；滚轮缩放 / 拖空白平移 / 拖节点 / Fit。

改源码后重新 `npm run build`，并重启 `dsh web`（bundle 插件不热更 Host）。

可用 `dsh web --dump-config` 确认组成里出现 `capmap-viz`。

## 单测（无需 GUI）

```sh
npm test
```
