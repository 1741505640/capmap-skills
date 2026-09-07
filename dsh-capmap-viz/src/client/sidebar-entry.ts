/**
 * CapMap sidebar entry — plain DOM row after New Session.
 */
import type { CapMapPanelController } from './panel-controller.ts'
import { mountSidebarEntry as mountSharedSidebarEntry } from './sidebar-entry-core.ts'
import { entryCss } from './styles.ts'

export const ENTRY_SELECTOR = '[data-dsh-capmap-entry]'

const ICON = '◈'

export function mountSidebarEntry(controller: CapMapPanelController): () => void {
  return mountSharedSidebarEntry({
    rowAttribute: 'data-dsh-capmap-entry',
    rowSelector: ENTRY_SELECTOR,
    plugin: 'capmap-viz',
    icon: ICON,
    css: entryCss,
    label: () => '能力底图',
    tooltip: () => '能力底图',
    onToggle: () => {
      controller.togglePanel()
    },
    position: 'after',
    familySelectors: [
      '[data-dsh-taskboard-entry]',
      '[data-dsh-ssh-entry]',
      '[data-dsh-capmap-entry]',
    ],
    active: {
      subscribe: (listener) => controller.subscribe(listener),
      isOpen: () => controller.isOpen(),
    },
  })
}
