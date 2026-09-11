import type { CapMapHost } from '../host/CapMapHost';
import { getProjectRoot } from '../host/workspaceRoot';
import type { CapMapEvent, CapMapRequest, CapMapResponse } from '../protocol';

/** Panel / Sidebar 共用的 Host RPC 处理。 */
export async function dispatchCapMapRpc(
  host: CapMapHost,
  webview: { postMessage(msg: unknown): Thenable<boolean> },
  msg: CapMapRequest,
): Promise<void> {
  const root = getProjectRoot();
  let payload = msg.payload;
  if (
    msg.endpoint === 'parse' ||
    msg.endpoint === 'watchStart' ||
    msg.endpoint === 'revision' ||
    msg.endpoint === 'read' ||
    msg.endpoint === 'open'
  ) {
    const obj = {
      ...((payload != null && typeof payload === 'object' ? payload : {}) as Record<string, unknown>),
    };
    if (typeof obj.root !== 'string' || obj.root === '') {
      if (!root) {
        const reply: CapMapResponse = {
          type: 'response',
          id: msg.id,
          ok: false,
          error: {
            message:
              'CapMap：未打开工作区文件夹。请 File → Open Folder 打开含 capmap.yaml 的仓库根。',
            code: 'no_workspace',
          },
        };
        await webview.postMessage(reply);
        return;
      }
      obj.root = root;
    }
    payload = obj;
  }

  if (msg.endpoint === 'open') {
    const p = payload as { root?: string; path?: string };
    try {
      if (typeof p?.root !== 'string' || p.root === '') throw new Error('capmap.open: root 必填');
      if (typeof p?.path !== 'string' || p.path === '') throw new Error('capmap.open: path 必填');
      const result = await host.open(p.root, p.path);
      await webview.postMessage({ type: 'response', id: msg.id, ok: true, result } satisfies CapMapResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await webview.postMessage({
        type: 'response',
        id: msg.id,
        ok: false,
        error: { message },
      } satisfies CapMapResponse);
    }
    return;
  }

  const result = host.handle(msg.endpoint, payload);
  const reply: CapMapResponse = result.ok
    ? { type: 'response', id: msg.id, ok: true, result: result.result }
    : { type: 'response', id: msg.id, ok: false, error: result.error };
  await webview.postMessage(reply);
}

export function revisionEvent(revision: number, docsRoot: string): CapMapEvent {
  return { type: 'event', event: 'revision', payload: { revision, docsRoot } };
}
