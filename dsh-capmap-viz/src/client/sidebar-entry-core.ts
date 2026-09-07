/**
 * Shared sidebar entry injection core (adapted from dsh-task-board / shared).
 * DSH shell has no external sidebar slot — inject after New Session and self-heal.
 */

export interface SidebarEntryOptions {
  rowAttribute: string
  rowSelector: string
  plugin?: string
  icon: string
  css: Record<string, string>
  label(): string
  tooltip?(): string
  refresh?: { subscribe(listener: () => void): () => void }
  onToggle(): void
  position: 'before' | 'after'
  familySelectors: readonly string[]
  active?: {
    subscribe(listener: () => void): () => void
    isOpen(): boolean
  }
}

function sidebarRoot(): HTMLElement | undefined {
  const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]')
  if (column === null) return undefined
  const logoOwner = column.querySelector('[class*="logoRow"]')?.parentElement
  return logoOwner ?? (column.firstElementChild as HTMLElement | undefined)
}

function newSessionButton(root: HTMLElement): HTMLButtonElement | undefined {
  const nested = root.querySelector('button[class*="newSession"]')
  if (nested !== null) return nested as HTMLButtonElement
  for (const child of root.children) {
    if (child.tagName === 'BUTTON') return child as HTMLButtonElement
  }
  return undefined
}

function createEntry(options: SidebarEntryOptions): {
  entry: HTMLButtonElement
  applyLabel: () => void
} {
  const entry = document.createElement('button')
  entry.type = 'button'
  entry.setAttribute(options.rowAttribute, '')
  if (options.plugin !== undefined) {
    entry.setAttribute('data-dsh-plugin', options.plugin)
    entry.setAttribute('data-dsh-part', 'sidebar-entry')
  }
  entry.className = options.css['entry'] ?? ''
  const labelSpan = document.createElement('span')
  labelSpan.className = options.css['entryLabel'] ?? ''
  const iconSpan = document.createElement('span')
  iconSpan.className = options.css['entryIcon'] ?? ''
  iconSpan.innerHTML = options.icon
  entry.append(iconSpan, labelSpan)
  const applyLabel = (): void => {
    entry.setAttribute('aria-label', options.label())
    if (options.tooltip !== undefined) entry.setAttribute('title', options.tooltip())
    labelSpan.textContent = options.label()
  }
  applyLabel()
  entry.addEventListener('click', options.onToggle)
  return { entry, applyLabel }
}

function placeEntry(
  root: HTMLElement,
  entry: HTMLButtonElement,
  options: SidebarEntryOptions,
): boolean {
  const button = newSessionButton(root)
  if (button === undefined) return false
  if (entry.parentElement !== root) {
    const row = button.closest('[class*="logoRow"]')
    const base = row !== null && row.parentElement === root ? row : button
    const family = Array.from(root.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el.matches(options.familySelectors.join(', ')),
    )
    const anchor =
      options.position === 'before'
        ? family.length > 0
          ? family[0]
          : base.nextElementSibling
        : family.length > 0
          ? family[family.length - 1]!.nextElementSibling
          : base.nextElementSibling
    root.insertBefore(entry, anchor)
  }
  return true
}

export function mountSidebarEntry(options: SidebarEntryOptions): () => void {
  if (typeof document !== 'undefined' && document.querySelector(options.rowSelector) !== null) {
    return () => {}
  }
  const { entry, applyLabel } = createEntry(options)
  let root: HTMLElement | undefined
  let placed = false
  let unsubscribeRefresh: (() => void) | undefined
  if (options.refresh !== undefined) {
    try {
      unsubscribeRefresh = options.refresh.subscribe(applyLabel)
    } catch {
      /* keep mount-time label */
    }
  }

  const tryPlace = (): void => {
    if (root !== undefined && !root.isConnected) {
      rootObserver.disconnect()
      root = undefined
      placed = false
    }
    if (placed) {
      if (document.body.contains(entry)) return
      rootObserver.disconnect()
      root = undefined
      placed = false
    }
    root ??= sidebarRoot()
    if (root === undefined) return
    placed = placeEntry(root, entry, options)
    if (placed) {
      rootObserver.observe(root, { childList: true, subtree: true })
    }
  }

  const waitObserver = new MutationObserver(() => {
    tryPlace()
  })
  waitObserver.observe(document.body, { childList: true, subtree: true })

  const rootObserver = new MutationObserver(() => {
    if (root === undefined || !root.isConnected) {
      placed = false
      tryPlace()
      return
    }
    if (!root.contains(entry)) {
      placed = placeEntry(root, entry, options)
    }
  })

  const unsubscribeActive =
    options.active === undefined
      ? undefined
      : (() => {
          const syncActive = (): void => {
            if (options.active!.isOpen()) entry.dataset.active = 'true'
            else delete entry.dataset.active
          }
          const unsubscribe = options.active.subscribe(syncActive)
          syncActive()
          return unsubscribe
        })()

  tryPlace()

  return () => {
    waitObserver.disconnect()
    rootObserver.disconnect()
    unsubscribeRefresh?.()
    unsubscribeActive?.()
    entry.remove()
  }
}
