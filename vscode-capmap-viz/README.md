# CapMap Viz（VS Code / Cursor 扩展）

CapMap 文档体系可视化：选中工作区 → 读 `capmap.yaml` → `docs_root` → 语义图谱 + 能力面板。

图谱右下角可调 **斥力 / 距离 / 中心 / 标签**，并可开关持续微动画。

## 安装（本地 VSIX）

1. 打包：

```powershell
cd vscode-capmap-viz
npm install
npm run package
```

产出：`chenjh12.capmap-viz-0.1.0.vsix`（同目录）。

2. 安装到 VS Code / Cursor（任选其一）：

- **图形界面**：Extensions（扩展）→ 右上角 `…` → **Install from VSIX…** → 选上一步的 `.vsix`
- **命令行**（Cursor 把 `code` 换成 `cursor`）：

```powershell
code --install-extension .\chenjh12.capmap-viz-0.1.0.vsix
# 或
cursor --install-extension .\chenjh12.capmap-viz-0.1.0.vsix
```

3. 安装后 **Reload Window**（重新加载窗口），打开含 CapMap 文档的工作区。

4. 侧栏 Activity Bar 点 **CapMap** 图标进入能力底图侧栏；标题栏图标或命令面板运行 **CapMap: Open Visualization** 打开主图谱。

升级同一版本号时：先卸载旧扩展或改 `package.json` 的 `version` 再打包，否则可能装不上新包。

## 使用要点

1. 侧栏 **CapMap** → 索引 / 主题文件树（可折叠）。
2. **单击**树节点 → 打开主面板并定位图谱 + 详情；**双击** → 打开源文件。
3. 多根工作区可用命令 **CapMap: Select Workspace Root** 切换根目录。
4. 改 `docs_root` 下 md → 侧栏与图谱随 revision 刷新。

## 开发（F5）

在**仓库根**（`capmap-skills`）打开 VS Code / Cursor：

```powershell
cd vscode-capmap-viz
npm install
npm run compile
```

然后用调试配置 **Run CapMap Viz Extension**（仓库根 `.vscode/launch.json`）。

## 单测（解析器 / 图谱核，无需 GUI）

```powershell
cd vscode-capmap-viz
npm test
```

## 布局

```text
src/
├── extension.ts      # activate / Activity Bar sidebar / 命令
├── protocol.ts       # Host↔Webview 消息协议
├── panel/            # 主编辑区 Webview 面板壳
├── host/             # parse/watch/revision/read/open
├── webview/          # 浏览器侧图谱（esbuild → media/webview.js）
├── parser/           # 自 dsh-capmap-viz 内嵌（Cordis-free）
├── graph/            # model + colors 纯函数
└── setupHint.ts      # 缺 docs_root 文案
media/                # 图标、CSS、webview.js
```
