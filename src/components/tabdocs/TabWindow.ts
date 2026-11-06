import { createSignal, untracked } from '@motifx/core';
import { nextId } from '../../core/next-id';
import { windowStack, type StackedWindow } from '../../core/window-stack';
import { followPointer } from '../../parts/window/follow-pointer';
import { resizeBox } from '../../parts/window/resize-box';
import { resizeFrame } from '../../parts/window/resize-frame';
import type { WindowBox } from '../../parts/window/window-box';
import type { WindowEdge } from '../../parts/window/window-edge';
import type { LayoutItem } from './layout-item';
import { TabBarSettings } from './TabBarSettings';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/**
 * A floating window of a `TabDocumentManager`, in the page. It holds groups as the document area
 * does (split and resized in the same way) and moves by the empty part of its strips. It resizes
 * from its edges and corners, comes to the front when clicked, and maximizes within the page. The
 * manager creates and closes windows (`float`, `closeWindow`), and the methods here call the manager
 * and raise its events. Its strips are compact by default (the manager's `compact…` props). Its own
 * settings (`scrollButtons`, `tabSize`, `tabMinWidth`, `singleTabTitle`, `barButtons`) take precedence.
 */
export class TabWindow extends TabBarSettings {
  readonly element: HTMLDivElement;
  /** @internal Where its layout goes. */
  readonly body: HTMLDivElement;
  /** @internal The top of its layout. */
  root: LayoutItem | null = null;
  /** @internal Where "Dock" puts it back: a dock area, or a group among the documents (or in an area). */
  lastDock: { side: TabDockSide | null; group: TabGroup | null } = { side: null, group: null };
  private readonly box = createSignal<TabRect>({ x: 0, y: 0, width: 0, height: 0 });
  private readonly maximized = createSignal(false);
  private readonly active = createSignal(false);
  private readonly entry: StackedWindow;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly owner: TabDocumentManager,
    rect: TabRect,
  ) {
    super();
    const doc = owner.element.ownerDocument;
    const el = (this.element = doc.createElement('div'));
    el.className = 'mx-tabdocs__window';
    el.id = nextId('tabdocs-window');
    el.setAttribute('role', 'dialog');
    this.body = doc.createElement('div');
    this.body.className = 'mx-tabdocs__window-body';
    const frame = resizeFrame(doc, 'mx-tabdocs__window-frame', 'mx-tabdocs__window-edge');
    el.append(this.body, frame);
    this.entry = { element: el, setActive: (on) => this.markActive(on) };
    // A click or focus anywhere in it brings it to the front.
    const front = () => untracked(() => this.bringToFront());
    el.addEventListener('pointerdown', front, true);
    el.addEventListener('focusin', front);
    frame.addEventListener('pointerdown', (e) => untracked(() => this.resizeStart(e)));
    const view = doc.defaultView;
    if (view) {
      const keep = () => untracked(() => owner.keepWindowInView(this));
      view.addEventListener('resize', keep);
      this.stops.push(() => view.removeEventListener('resize', keep));
    }
    this.place(rect);
  }

  get manager(): TabDocumentManager {
    return this.owner;
  }
  /** Its position and size in the viewport, in pixels (as restored). Reactive. */
  get rect(): TabRect {
    return this.box.value;
  }
  /** Indicates whether it is maximized. Reactive. */
  get isMaximized(): boolean {
    return this.maximized.value;
  }
  /** Indicates whether it is the front window of the page. Reactive. */
  get isActive(): boolean {
    return this.active.value;
  }
  /** Its groups, in layout order. Reactive. */
  get groups(): readonly TabGroup[] {
    return this.owner.groups.filter((g) => g.window === this);
  }
  /** The documents of its groups. Reactive. */
  get documents(): readonly TabDocument[] {
    return this.groups.flatMap((g) => g.documents);
  }
  /** Its position in the manager's `floatingWindows`, with the one at the back first. Reactive. */
  get index(): number {
    return this.owner.floatingWindows.indexOf(this);
  }

  /** Moves it: `x` from the left of the viewport, `y` from the top. */
  move(x: number, y: number): boolean {
    return this.owner.moveWindow(this, x, y);
  }

  resize(width: number, height: number): boolean {
    return this.owner.resizeWindow(this, width, height);
  }

  maximize(): boolean {
    return this.owner.maximizeWindow(this);
  }

  restore(): boolean {
    return this.owner.restoreWindow(this);
  }

  /** Closes it with its documents. Resolves to `false` when one stays open. */
  close(): Promise<boolean> {
    return this.owner.closeWindow(this);
  }

  /** Docks it with its contents: in the dock area of `side`, or back where it was docked. */
  dock(side?: TabDockSide, size?: number | string): boolean {
    return this.owner.dock(this, side, size);
  }

  /** Brings it to the front and sets focus on what last had focus in it. */
  focus(): boolean {
    return this.owner.focusWindow(this);
  }

  // Called by the manager.

  /** @internal Puts it where `rect` says (kept as the place it is restored to). */
  place(rect: TabRect): void {
    const r = { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(Math.max(0, rect.width)), height: Math.round(Math.max(0, rect.height)) };
    this.box.value = r;
    const style = this.element.style;
    style.setProperty('--_x', `${r.x}px`);
    style.setProperty('--_y', `${r.y}px`);
    style.setProperty('--_w', `${r.width}px`);
    style.setProperty('--_h', `${r.height}px`);
  }

  /** @internal */
  markMaximized(on: boolean): void {
    this.maximized.value = on;
    this.element.toggleAttribute('data-maximized', on);
  }

  /** @internal Shows it on top of the others. */
  bringToFront(): void {
    if (!this.element.isConnected) return;
    windowStack.bringToFront(this.entry);
    this.owner.windowRaised();
  }

  /** @internal While it is moved by the pointer: drops under it are seen through it. */
  markMoving(on: boolean): void {
    this.element.toggleAttribute('data-moving', on);
  }

  /** @internal The smallest size the window's style allows. */
  minSize(): { w: number; h: number } {
    const view = this.element.ownerDocument.defaultView;
    const css = view?.getComputedStyle(this.element);
    return { w: parseFloat(css?.minInlineSize || css?.minWidth || '') || 0, h: parseFloat(css?.minBlockSize || css?.minHeight || '') || 0 };
  }

  /** @internal The room it moves in: the viewport. */
  room(): { w: number; h: number } {
    const root = this.element.ownerDocument.documentElement;
    const view = this.element.ownerDocument.defaultView;
    return { w: root.clientWidth || view?.innerWidth || 0, h: root.clientHeight || view?.innerHeight || 0 };
  }

  /** @internal */
  dispose(): void {
    for (const stop of this.stops.splice(0)) stop();
    windowStack.remove(this.entry);
    this.element.remove();
  }

  private markActive(on: boolean): void {
    this.active.value = on;
    this.element.toggleAttribute('data-active', on);
    // Another window came to the front: the manager's list follows the stack.
    if (!on) this.owner.windowRaised();
  }

  private get rtl(): boolean {
    const view = this.element.ownerDocument.defaultView;
    return !!view && view.getComputedStyle(this.element).direction === 'rtl';
  }

  /** A click on an edge or a corner: the window follows it until it is let go. */
  private resizeStart(e: PointerEvent): void {
    const handle = (e.target as Element).closest<HTMLElement>('.mx-tabdocs__window-edge');
    const owner = this.owner;
    if (e.button !== 0 || !handle || this.isMaximized || !owner.isEnabled || !owner.windowChanging('resizeWindow', this, true)) return;
    e.preventDefault();
    const edge = handle.dataset.edge as WindowEdge;
    const rtl = this.rtl;
    const room = this.room();
    const r = this.rect;
    // In the box `resizeBox` takes, x runs from the start edge.
    const start: WindowBox = { x: rtl ? room.w - r.x - r.width : r.x, y: r.y, w: r.width, h: r.height };
    const bounds = owner.keepFloatingInView ? room : { w: Infinity, h: Infinity };
    const min = this.minSize();
    this.element.toggleAttribute('data-resizing', true);
    followPointer(
      handle,
      e,
      (dx, dy) => {
        const b = resizeBox(edge, start, rtl ? -dx : dx, dy, min, bounds);
        this.place({ x: rtl ? room.w - b.x - b.w : b.x, y: b.y, width: b.w, height: b.h });
      },
      () => {
        this.element.removeAttribute('data-resizing');
        owner.windowChanged('resizeWindow', this, true);
      },
    );
  }
}
