/** Persist last CapMap workspace choice. */

export const LS_WORKSPACE_KEY = 'dsh.capmapViz.lastWorkspace'

export interface StoredWorkspace {
  workspaceId: string
  path: string
  title: string
}

export function readStoredWorkspace(): StoredWorkspace | null {
  try {
    const raw = localStorage.getItem(LS_WORKSPACE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredWorkspace
    if (!parsed?.workspaceId || !parsed?.path) return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredWorkspace(ws: StoredWorkspace): void {
  try {
    localStorage.setItem(LS_WORKSPACE_KEY, JSON.stringify(ws))
  } catch {
    /* ignore quota */
  }
}

export function clearStoredWorkspace(): void {
  try {
    localStorage.removeItem(LS_WORKSPACE_KEY)
  } catch {
    /* ignore */
  }
}
