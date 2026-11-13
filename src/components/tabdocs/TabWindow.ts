import { Component, createSignal, untracked } from '@motifx/core';
import { isInPage, isRtl, measure, onLayout, pageOf, styleOf } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { css, mark } from '../../core/part-writes';
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
import { dropPart, layoutPart } from './place-node';

/**
 * A floating window of a `TabDocumentManager`, in the page. It holds groups as the document area
 * does (split and resized in the same way) and moves by the empty part of its strips. It resizes
 * from its edges and corners, comes to the front when clicked, and maximizes within the page. The
 * manager creates and closes windows (`float`, `closeWindow`), and the methods here call the manager
 * and raise its events. Its strips are compact by default (the manager's `compact…` props). Its own
 * settings (`scrollButtons`, `tabSize`, `tabMinWidth`, `singleTabTitle`, `barButtons`) take precedence.
 */
export class TabWindow extends TabBarSettings {
  /** As a component of the layout. */
  readonly part: Component<HTMLDivElement>;
  /** @internal Where its layout goes. */
  readonly bodyPart: Component<HTMLDivElement>;
  /** @internal The top of its layout. */
  root: LayoutItem | null = null;
  /** @internal Where "Dock" puts it back: a dock area, or a group among the documents (or in an area). */
  lastDock: { side: TabDockSide | null; group: TabGroup | null } = { side: null, group: null };
  private readonly box = createSignal<TabRect>({ x: 0, y: 0, width: 0, height: 0 });
  private readonly maximized = createSignal(false);
  private readonly active = createSignal(false);
  private readonly entry: StackedWindow;
  private readonly stops: (() => void)[] = [];
  private readonly readRoom = () => this.room();
  private readonly keepInView = (room: { w: number; h: number }) => this.owner.keepWindowInView(this, room);

  constructor(
    private readonly owner: TabDocumentManager,
    rect: TabRect,
  ) {
    super();
    this.part = new Component<HTMLDivElement>('div');
    this.part.class.add('mx-tabdocs__window');
    this.part.attr.add({ id: nextId('tabdocs-window'), role: 'dialog' });
    this.bodyPart = new Component<HTMLDivElement>('div');
    this.bodyPart.class.add('mx-tabdocs__window-body');
    // A press on a handle resizes it from that side or corner.
    const { frame, handles } = resizeFrame('mx-tabdocs__window-frame', 'mx-tabdocs__window-edge');
    for (const [edge, handle] of handles) handle.motif.on('pointerdown', (_, e) => untracked(() => this.resizeStart(handle, edge, e)));
    this.part.controls.add(this.bodyPart, frame);
    layoutPart(this.part);
    layoutPart(this.bodyPart);
    this.entry = { part: this.part, setActive: (on) => this.markActive(on) };
    // A click or focus anywhere in it brings it to the front.
    const front = () => untracked(() => this.bringToFront());
    this.part.motif.on('pointerdown:capture', front);
    this.part.motif.on('focusin', front);
    // The page window changes size: the window stays in view.
    this.stops.push(onLayout(this.part, 'page', () => measure(this.part, this.readRoom, this.keepInView)));
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
    css(this.part, '--_x', `${r.x}px`);
    css(this.part, '--_y', `${r.y}px`);
    css(this.part, '--_w', `${r.width}px`);
    css(this.part, '--_h', `${r.height}px`);
  }

  /** @internal */
  markMaximized(on: boolean): void {
    this.maximized.value = on;
    mark(this.part, 'data-maximized', on);
  }

  /** @internal Shows it on top of the others. */
  bringToFront(): void {
    if (!isInPage(this.part)) return;
    windowStack.bringToFront(this.entry);
    this.owner.windowRaised();
  }

  /** @internal While it is moved by the pointer: drops under it are seen through it. */
  markMoving(on: boolean): void {
    if (!this.part.isDisposed) mark(this.part, 'data-moving', on);
  }

  /** @internal The smallest size the window's style allows. */
  minSize(): { w: number; h: number } {
    const style = styleOf(this.part, ['min-inline-size', 'min-width', 'min-block-size', 'min-height']);
    return { w: parseFloat(style['min-inline-size'] || style['min-width']) || 0, h: parseFloat(style['min-block-size'] || style['min-height']) || 0 };
  }

  /** @internal The room it moves in: the viewport. */
  room(): { w: number; h: number } {
    const page = pageOf(this.part);
    return { w: page.width, h: page.height };
  }

  /** @internal */
  dispose(): void {
    for (const stop of this.stops.splice(0)) stop();
    windowStack.remove(this.entry);
    dropPart(this.part);
  }

  private markActive(on: boolean): void {
    // The manager going away disposes its windows' parts first: the stack still tells the ones left.
    if (this.part.isDisposed) return;
    this.active.value = on;
    mark(this.part, 'data-active', on);
    // Another window came to the front: the manager's list follows the stack.
    if (!on) this.owner.windowRaised();
  }

  /** A press on the handle of an edge or a corner: the window follows the pointer until it is let go. */
  private resizeStart(handle: Component<HTMLDivElement>, edge: WindowEdge, e: PointerEvent): void {
    const owner = this.owner;
    if (e.button !== 0 || this.isMaximized || !owner.isEnabled || !owner.windowChanging('resizeWindow', this, true)) return;
    e.preventDefault();
    const rtl = isRtl(this.part);
    const room = this.room();
    const r = this.rect;
    // In the box `resizeBox` takes, x runs from the start edge.
    const start: WindowBox = { x: rtl ? room.w - r.x - r.width : r.x, y: r.y, w: r.width, h: r.height };
    const bounds = owner.keepFloatingInView ? room : { w: Infinity, h: Infinity };
    const min = this.minSize();
    mark(this.part, 'data-resizing', true);
    followPointer(
      handle,
      e,
      (dx, dy) => {
        const b = resizeBox(edge, start, rtl ? -dx : dx, dy, min, bounds);
        this.place({ x: rtl ? room.w - b.x - b.w : b.x, y: b.y, width: b.w, height: b.h });
      },
      () => {
        mark(this.part, 'data-resizing', false);
        owner.windowChanged('resizeWindow', this, true);
      },
    );
  }
}
