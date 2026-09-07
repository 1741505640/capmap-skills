/** Inject CapMap shell styles once (no CSS-modules in the client esbuild). */

const STYLE_ID = 'dsh-capmap-viz-shell-css'

const CSS = `
[data-pane='conversation'],
[class*='centerCol'] {
  position: relative;
}

[data-dsh-capmap-view] {
  position: absolute;
  inset: 0;
  display: none;
  z-index: 60;
  background: var(--dsw-alias-bg-base, #0b1220);
  color: var(--dsw-alias-text-primary, #e5e7eb);
}

html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-dsh-capmap-view] {
  display: block;
}

html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-pane='conversation'] > :not([data-dsh-capmap-view]),
html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [class*='centerCol'] > :not([data-dsh-capmap-view]) {
  display: none !important;
}

.dsh-capmap-entry {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9ca3af);
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.dsh-capmap-entry:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.06));
  color: var(--dsw-alias-label-primary, #e5e7eb);
}

.dsh-capmap-entry[data-active] {
  background: var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.1));
  color: var(--dsw-alias-label-primary, #e5e7eb);
  font-weight: 600;
}

.dsh-capmap-entryIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: none;
  font-size: 14px;
}

.dsh-capmap-entryLabel {
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-dsh-frame][data-sidebar-collapsed] .dsh-capmap-entry,
[data-sidebar-collapsed] .dsh-capmap-entry {
  justify-content: center;
  padding: 0;
  width: 36px;
  height: 36px;
  margin: 0 auto 12px;
  border-radius: 50%;
}

[data-dsh-frame][data-sidebar-collapsed] .dsh-capmap-entryLabel,
[data-sidebar-collapsed] .dsh-capmap-entryLabel {
  display: none;
}
`

export function ensureCapMapStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

/** Class-name map consumed by sidebar-entry-core. */
export const entryCss = {
  entry: 'dsh-capmap-entry',
  entryIcon: 'dsh-capmap-entryIcon',
  entryLabel: 'dsh-capmap-entryLabel',
} as const
