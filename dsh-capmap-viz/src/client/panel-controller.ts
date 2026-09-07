/** Tiny open-state controller for CapMap center panel + sidebar entry. */

export type CapMapPanelListener = () => void

export class CapMapPanelController {
  private open = false
  private readonly listeners = new Set<CapMapPanelListener>()

  getSnapshot(): { panelOpen: boolean } {
    return { panelOpen: this.open }
  }

  isOpen(): boolean {
    return this.open
  }

  subscribe(listener: CapMapPanelListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }

  openPanel(): void {
    if (this.open) return
    this.open = true
    this.emit()
  }

  closePanel(): void {
    if (!this.open) return
    this.open = false
    this.emit()
  }

  togglePanel(): void {
    this.open = !this.open
    this.emit()
  }
}
