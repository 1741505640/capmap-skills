import * as vscode from 'vscode';
import type { CapMapHost } from '../host/CapMapHost';
import { dispatchCapMapRpc, revisionEvent } from '../host/rpcDispatch';
import { CapMapPanel } from './CapMapPanel';
import type { CapMapRequest } from '../protocol';

/**
 * Activity Bar 侧栏：索引 / 主题文件树。
 * 单击 → 打开主面板并选中；双击 → 打开源文件。
 */
export class CapMapSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'capmapViz.sidebar';

  private view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly host: CapMapHost,
    private readonly context: vscode.ExtensionContext,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);

    const subs: vscode.Disposable[] = [];
    subs.push(
      webviewView.webview.onDidReceiveMessage((msg) => {
        void this.onMessage(msg);
      }),
    );
    subs.push(
      this.host.onRevision((_root, revision, docsRoot) => {
        void webviewView.webview.postMessage(revisionEvent(revision, docsRoot));
      }),
    );
    webviewView.onDidDispose(() => {
      for (const d of subs) d.dispose();
      if (this.view === webviewView) this.view = undefined;
    });
  }

  private async onMessage(msg: unknown): Promise<void> {
    if (!this.view || !msg || typeof msg !== 'object') return;
    const raw = msg as Record<string, unknown>;
    const kind = String(raw.type ?? '');
    if (kind === 'ui') {
      if (String(raw.action ?? '') === 'reveal') {
        CapMapPanel.show(this.context, this.host, {
          selectId: typeof raw.id === 'string' ? raw.id : undefined,
        });
      }
      return;
    }
    if (kind === 'request') {
      await dispatchCapMapRpc(this.host, this.view.webview, msg as CapMapRequest);
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'panel.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'sidebar.js'));
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
  <title>CapMap Tree</title>
</head>
<body class="sidebar-tree">
  <header class="sidebar-bar">
    <strong>能力底图</strong>
    <span id="status" class="muted">加载中…</span>
  </header>
  <pre id="error" class="stub-json error-box" hidden></pre>
  <div id="tree" class="drawer sidebar-drawer"></div>
  <script src="${jsUri}"></script>
</body>
</html>`;
  }
}
