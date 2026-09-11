/**
 * Extension Host ↔ Webview 消息协议（切片 01 骨架；03 接真实现）。
 */

export type CapMapHostEndpoint = 'parse' | 'watchStart' | 'revision' | 'read' | 'open';

export interface CapMapRequest {
  type: 'request';
  id: string;
  endpoint: CapMapHostEndpoint;
  payload?: unknown;
}

export interface CapMapResponseOk {
  type: 'response';
  id: string;
  ok: true;
  result: unknown;
}

export interface CapMapResponseErr {
  type: 'response';
  id: string;
  ok: false;
  error: { message: string; code?: string };
}

export type CapMapResponse = CapMapResponseOk | CapMapResponseErr;

/** Host → Webview 推送（如 watch revision）。 */
export interface CapMapEvent {
  type: 'event';
  event: 'revision';
  payload: { revision: number; docsRoot?: string };
}

export type CapMapHostToWebview = CapMapResponse | CapMapEvent;
export type CapMapWebviewToHost = CapMapRequest;

/** 桩：无 Host 真实现时 Webview 展示用。 */
export interface CapMapStubGraph {
  theme: string | null;
  docsRoot: string;
  nodes: Array<{ id: string; title: string; type: string }>;
  edges: Array<{ source: string; target: string; kind: string }>;
  stub: true;
}

export const STUB_GRAPH: CapMapStubGraph = {
  theme: null,
  docsRoot: '(stub)',
  nodes: [
    { id: 'stub-map', title: '能力底图（桩）', type: 'map' },
    { id: 'stub-scheme', title: '方案（桩）', type: 'scheme' },
  ],
  edges: [{ source: 'stub-map', target: 'stub-scheme', kind: 'semantic' }],
  stub: true,
};
