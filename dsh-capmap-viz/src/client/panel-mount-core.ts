/**
 * Center-column panel takeover (adapted from dsh-task-board panel-mount-core).
 * Supports multiple sibling panels (task-board + ssh).
 */
import { createRoot, type Root } from 'react-dom/client'

export interface SiblingPanel {
  activeAttribute: string
  panelName: string
}

export interface CenterPanelMountOptions {
  render: (root: Root) => void
  viewDatasetKey: string
  pluginName: string
  viewClassName?: string
  activeAttribute: string
  siblings: readonly SiblingPanel[]
  panelName: string
  isOpen: () => boolean
  close: () => void
  subscribe: (listener: () => void) => () => void
}

const CONVERSATION_COLUMN_SELECTOR = '[data-pane="conversation"], [class*="centerCol"]'
const ACTIVATE_EVENT = 'dsh-panel-activate'
const SIDEBAR_ROW_SELECTOR =
  '[class*="sessionRow"], [class*="projectRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="newSession"]'

function conversationColumn(): HTMLElement | undefined {
  return document.querySelector(CONVERSATION_COLUMN_SELECTOR) ?? undefined
}

export function mountCenterPanel(options: CenterPanelMountOptions): () => void {
  let root: Root | undefined
  let container: HTMLDivElement | undefined
  const siblingNames = new Set(options.siblings.map((s) => s.panelName))

  const ensure = (): void => {
    if (container !== undefined) {
      if (container.isConnected) return
      root?.unmount()
      root = undefined
      container.remove()
      container = undefined
    }
    const column = conversationColumn()
    if (column === undefined) return
    container = document.createElement('div')
    container.dataset[options.viewDatasetKey] = ''
    container.dataset.dshPlugin = options.pluginName
    if (options.viewClassName) container.className = options.viewClassName
    column.appendChild(container)
    root = createRoot(container)
    options.render(root)
  }

  const waitObserver = new MutationObserver(() => {
    ensure()
  })
  waitObserver.observe(document.body, { childList: true, subtree: true })

  const applyActive = (): void => {
    if (options.isOpen()) {
      for (const sibling of options.siblings) {
        document.documentElement.removeAttribute(sibling.activeAttribute)
      }
      document.documentElement.setAttribute(options.activeAttribute, '')
      document.dispatchEvent(new CustomEvent(ACTIVATE_EVENT, { detail: options.panelName }))
    } else {
      document.documentElement.removeAttribute(options.activeAttribute)
    }
  }

  const onOtherActivate = (event: Event): void => {
    const detail = (event as CustomEvent).detail
    if (siblingNames.has(detail) && options.isOpen()) {
      options.close()
    }
  }

  const onClickSidebarRow = (event: MouseEvent): void => {
    if (!options.isOpen()) return
    const target = event.target as HTMLElement | null
    if (target === null) return
    if (target.closest(SIDEBAR_ROW_SELECTOR) !== null) options.close()
  }

  document.addEventListener('click', onClickSidebarRow, true)
  document.addEventListener(ACTIVATE_EVENT, onOtherActivate)
  const unsubscribe = options.subscribe(applyActive)
  applyActive()
  ensure()

  return () => {
    document.removeEventListener('click', onClickSidebarRow, true)
    document.removeEventListener(ACTIVATE_EVENT, onOtherActivate)
    waitObserver.disconnect()
    unsubscribe()
    document.documentElement.removeAttribute(options.activeAttribute)
    root?.unmount()
    root = undefined
    container?.remove()
    container = undefined
  }
}
