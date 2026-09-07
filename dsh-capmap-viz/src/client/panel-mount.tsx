/**
 * Mount CapMap panel into the center column.
 */
import { createElement } from 'react'
import type { CapMapPanelController } from './panel-controller.ts'
import { CapMapPanel, type CapMapPanelProps } from './CapMapPanel.tsx'
import { mountCenterPanel } from './panel-mount-core.ts'

export const BOARD_VIEW_SELECTOR = '[data-dsh-capmap-view]'

export function mountPanel(
  controller: CapMapPanelController,
  panelProps: Omit<CapMapPanelProps, 'controller'>,
): () => void {
  return mountCenterPanel({
    render: (root) => {
      root.render(createElement(CapMapPanel, { ...panelProps, controller }))
    },
    viewDatasetKey: 'dshCapmapView',
    pluginName: 'capmap-viz',
    activeAttribute: 'data-dsh-capmap-active',
    siblings: [
      { activeAttribute: 'data-dsh-taskboard-active', panelName: 'taskboard' },
      { activeAttribute: 'data-dsh-ssh-active', panelName: 'ssh' },
    ],
    panelName: 'capmap',
    isOpen: () => controller.isOpen(),
    close: () => controller.closePanel(),
    subscribe: (listener) => controller.subscribe(listener),
  })
}
