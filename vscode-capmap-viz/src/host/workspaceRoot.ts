import * as vscode from 'vscode';

/** 当前用于 CapMap 的工作区根（默认 folders[0]；可命令切换）。 */
let selectedRoot: string | undefined;

export function getProjectRoot(): string | undefined {
  if (selectedRoot) {
    const still = vscode.workspace.workspaceFolders?.some((f) => f.uri.fsPath === selectedRoot);
    if (still) return selectedRoot;
    selectedRoot = undefined;
  }
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export async function pickProjectRoot(): Promise<string | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) {
    void vscode.window.showWarningMessage('CapMap：当前没有打开的工作区文件夹。');
    return undefined;
  }
  if (folders.length === 1) {
    selectedRoot = folders[0].uri.fsPath;
    return selectedRoot;
  }
  const picked = await vscode.window.showQuickPick(
    folders.map((f) => ({
      label: f.name,
      description: f.uri.fsPath,
      root: f.uri.fsPath,
    })),
    { title: 'CapMap：选择工作区根' },
  );
  if (!picked) return getProjectRoot();
  selectedRoot = picked.root;
  return selectedRoot;
}

export function setProjectRoot(root: string | undefined): void {
  selectedRoot = root;
}
