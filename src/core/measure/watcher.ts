import type { ComponentBase, IDisposable } from '@motifx/core';
import { viewOf } from './element-of';
import type { View } from './view';
import type { WindowBound } from './window-bound';

/**
 * What the layer keeps for one component: the window it is in, whether it is in the page, what is held for it there and
 * what ends with it. Made once and registered with the component once, however many watches come and go.
 */
export class Watcher implements IDisposable {
  private static readonly made = new WeakMap<ComponentBase, Watcher>();
  /** Held in the window the component is in: attached there, detached when it leaves. */
  private readonly bound = new Set<WindowBound>();
  /** Held elsewhere, ending with the component: watches it owns on other components. */
  private readonly owned = new Set<WindowBound>();
  private view: View | null;
  private active = true;
  private attached = false;
  private leaving = false;
  private placed = false;
  private listening = false;
  private disposed = false;

  private constructor(private readonly component: ComponentBase) {
    this.view = viewOf(component);
    component.motif.register(this);
  }

  static of(component: ComponentBase): Watcher {
    let watcher = Watcher.made.get(component);
    if (!watcher) {
      watcher = new Watcher(component);
      Watcher.made.set(component, watcher);
    }
    return watcher;
  }

  /** In the page now: not hidden, not taken out. */
  get isActive(): boolean {
    return this.active && !this.disposed;
  }

  /** Core reported it mounted: look, page and scroll notices wait for it. */
  get isPlaced(): boolean {
    return this.placed;
  }

  /** Holds `item` in the window the component is in, from its mount and after every move; it ends with the component. */
  hold(item: WindowBound): void {
    if (this.disposed) return item.stop();
    this.listen();
    this.bound.add(item);
    if (!this.attached && !(this.active && this.placed && this.view)) return;
    this.attached = true;
    item.attach();
    if (this.active && this.placed) item.arrived(false);
  }

  /** Ends `item` with the component too. */
  own(item: WindowBound): void {
    if (this.disposed) item.stop();
    else this.owned.add(item);
  }

  release(item: WindowBound): void {
    if (this.bound.delete(item)) item.detach();
    this.owned.delete(item);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    Watcher.made.delete(this.component);
    const items = [...this.bound, ...this.owned];
    this.bound.clear();
    this.owned.clear();
    for (const item of items) item.stop();
  }

  private listen(): void {
    if (this.listening) return;
    this.listening = true;
    const motif = this.component.motif;
    void motif.on('x:mounted', () => {
      this.placed = true;
      this.arrive();
    });
    void motif.on('x:activated', () => this.arrive());
    void motif.on('x:deactivated', () => this.leave());
  }

  /** In a page again: shown, put back, or moved into another window, where what is held starts again. */
  private arrive(): void {
    if (this.disposed) return;
    const view = viewOf(this.component);
    const moved = view !== this.view;
    this.active = true;
    this.leaving = false;
    if (this.attached && moved) for (const item of this.bound) item.detach();
    const start = !this.attached || moved;
    this.view = view;
    this.attached = view !== null;
    if (!view) return;
    for (const item of [...this.bound]) {
      if (start) item.attach();
      if (this.placed) item.arrived(moved);
    }
  }

  /**
   * Out of the page. Taken out to be put in again at once (a move to another parent, another window) it keeps what it
   * holds: only what is still out at the end of the task stops.
   */
  private leave(): void {
    if (!this.active || this.disposed) return;
    this.active = false;
    this.leaving = true;
    queueMicrotask(() => {
      if (!this.leaving || this.disposed) return;
      this.leaving = false;
      if (!this.attached) return;
      this.attached = false;
      for (const item of this.bound) item.detach();
    });
  }
}
