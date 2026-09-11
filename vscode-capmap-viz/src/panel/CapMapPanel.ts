import * as vscode from 'vscode';
import type { CapMapHost } from '../host/CapMapHost';
import { dispatchCapMapRpc, revisionEvent } from '../host/rpcDispatch';
import type { CapMapRequest } from '../protocol';

export interface CapMapPanelShowOpts {
  /** 打开后选中节点（来自侧栏树）。 */
  selectId?: string;
}

/**
 * 主编辑区 Webview：图谱 + 详情（目录树在 Activity Bar 侧栏）。
 */
export class CapMapPanel {
  public static readonly viewType = 'capmapViz.panel';

  public static current: CapMapPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly host: CapMapHost;
  private readonly disposables: vscode.Disposable[] = [];
  private pendingSelectId: string | undefined;

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    host: CapMapHost,
    opts?: CapMapPanelShowOpts,
  ) {
    this.panel = panel;
    this.host = host;
    this.pendingSelectId = opts?.selectId;
    this.panel.webview.html = this.getHtml(this.panel.webview, extensionUri);
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (msg) => {
        void this.onMessage(msg);
      },
      null,
      this.disposables,
    );
    this.disposables.push(
      host.onRevision((_root, revision, docsRoot) => {
        void this.panel.webview.postMessage(revisionEvent(revision, docsRoot));
      }),
    );
  }

  static show(
    context: vscode.ExtensionContext,
    host: CapMapHost,
    opts?: CapMapPanelShowOpts,
  ): CapMapPanel {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
    if (CapMapPanel.current) {
      CapMapPanel.current.panel.reveal(column);
      if (opts?.selectId) CapMapPanel.current.select(opts.selectId);
      return CapMapPanel.current;
    }
    const panel = vscode.window.createWebviewPanel(
      CapMapPanel.viewType,
      'CapMap Viz',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
      },
    );
    CapMapPanel.current = new CapMapPanel(panel, context.extensionUri, host, opts);
    return CapMapPanel.current;
  }

  select(id: string): void {
    void this.panel.webview.postMessage({
      type: 'event',
      event: 'select',
      payload: { id },
    });
  }

  private async onMessage(msg: unknown): Promise<void> {
    if (!msg || typeof msg !== 'object') return;
    const raw = msg as Record<string, unknown>;
    const kind = String(raw.type ?? '');
    if (kind === 'ui') {
      if (this.pendingSelectId && String(raw.action ?? '') === 'ready') {
        this.select(this.pendingSelectId);
        this.pendingSelectId = undefined;
      }
      return;
    }
    if (kind === 'request') {
      await dispatchCapMapRpc(this.host, this.panel.webview, msg as CapMapRequest);
    }
  }

  private getHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'panel.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview.js'));
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src ${webview.cspSource}`,
    ].join('; ');
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>CapMap Viz</title>
</head>
<body class="panel-body">
  <header class="bar">
    <strong>CapMap Viz</strong>
    <span id="status" class="muted">加载中…</span>
  </header>
  <pre id="error" class="stub-json error-box" hidden></pre>
  <div id="shell" class="shell shell-graph-only">
    <div id="graph" class="graph-host"></div>
    <aside id="detail" class="detail" aria-label="详情">
      <div class="detail-empty muted">点选图谱节点或侧栏目录查看详情</div>
    </aside>
  </div>
  <div id="preview" class="preview-mask" hidden></div>
  <script src="${jsUri}"></script>
</body>
</html>`;
  }

  dispose(): void {
    CapMapPanel.current = undefined;
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }
}
