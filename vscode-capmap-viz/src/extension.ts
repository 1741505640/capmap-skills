import * as vscode from 'vscode';
import { CapMapHost } from './host/CapMapHost';
import { pickProjectRoot } from './host/workspaceRoot';
import { CapMapPanel } from './panel/CapMapPanel';
import { CapMapSidebarProvider } from './panel/CapMapSidebar';

export function activate(context: vscode.ExtensionContext): void {
  const host = new CapMapHost();
  context.subscriptions.push({ dispose: () => host.dispose() });

  const sidebar = new CapMapSidebarProvider(context.extensionUri, host, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CapMapSidebarProvider.viewType, sidebar, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('capmapViz.open', () => {
      CapMapPanel.show(context, host);
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('capmapViz.selectWorkspace', async () => {
      const root = await pickProjectRoot();
      if (root) {
        void vscode.window.showInformationMessage(`CapMap 工作区根：${root}`);
        CapMapPanel.show(context, host);
      }
    }),
  );
}

export function deactivate(): void {
  // no-op
}
