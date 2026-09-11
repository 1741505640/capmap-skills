# CapMap Viz（VS Code 扩展）

CapMap 文档体系可视化：选中工作区 → 读 `capmap.yaml` → `docs_root` → 语义图谱 + 能力面板。

本目录为进行中实现（切片 01/02）；图谱真渲染与 Host 真解析见后续切片。

## 开发（F5）

在**仓库根**（`capmap-skills`）打开 VS Code / Cursor：

```powershell
cd vscode-capmap-viz
npm install
npm run compile
```

然后用调试配置 **Run CapMap Viz Extension**（仓库根 `.vscode/launch.json`）。

1. 侧栏 Activity Bar **CapMap** → 直接看到索引 / 主题文件树（可折叠）。
2. **单击**树节点 → 打开主面板并定位图谱 + 详情；**双击** → 打开源文件。
3. 标题栏图标或命令 **CapMap: Open Visualization** 也可打开主面板（图谱 + 详情）。
4. 多根工作区可用 **CapMap: Select Workspace Root** 切换根目录。
5. 改 `docs/` 下 md → 侧栏与图谱随 revision 刷新。

## 单测（解析器 / 图谱核，无需 GUI）

```powershell
cd vscode-capmap-viz
npm test
```

## 打包本地 .vsix

```powershell
cd vscode-capmap-viz
npm run package
```

产出 `chenjh12.capmap-viz-0.1.0.vsix`（脚本 `scripts/pack-vsix.ps1`，内含 Host 依赖 `js-yaml`；webview 的 d3-force 已打进 `media/webview.js`）。

安装：VS Code / Cursor → Extensions → … → Install from VSIX。

## 布局

```text
src/
├── extension.ts      # activate / Activity Bar sidebar / 命令
├── protocol.ts       # Host↔Webview 消息协议
├── panel/            # 主编辑区 Webview 面板壳
├── host/             # parse/watch/revision/read
├── webview/          # 浏览器侧图谱（esbuild → media/webview.js）
├── parser/           # 自 dsh-capmap-viz 内嵌（Cordis-free）
├── graph/            # model + colors 纯函数
└── setupHint.ts      # 缺 docs_root 文案
media/                # 图标、CSS、webview.js
```
