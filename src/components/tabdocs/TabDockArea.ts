import { createSignal } from '@motifx/core';
import { nextId } from '../../core/next-id';
import type { LayoutOrientation } from '../layout/layout-orientation';
import type { AutoHideStrip } from './AutoHideStrip';
import type { LayoutItem } from './layout-item';
import type { SashOwner } from './sash-owner';
import { SplitSash } from './SplitSash';
import { TabBarSettings } from './TabBarSettings';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * A dock area of a `TabDocumentManager`: one side around the documents, with groups of its own
 * (split and resized as the documents' groups are), a size, and a splitter against the documents.
 * Folded (`autoHide`), only its tab titles stay along the manager's edge and it slides out over the
 * documents when one is chosen. The manager makes the area when something is docked there, and
 * takes it away once it is empty. Its strips are compact by default (the manager's `compact…`
 * props); its own settings (`scrollButtons`, `tabSize`, `tabMinWidth`, `singleTabTitle`,
 * `barButtons`) win.
 */
export class TabDockArea extends TabBarSettings implements SashOwner {
  readonly element: HTMLDivElement;
  /** @internal */
  readonly sash: SplitSash;
  /** @internal The top of its layout. */
  root: LayoutItem | null = null;
  /** @internal Its tab titles along the manager's edge, while it is folded. */
  strip: AutoHideStrip | null = null;
  private readonly sizeSignal = createSignal<number | string>(0);
  private readonly folded = createSignal(false);
  private readonly openSignal = createSignal(false);

  constructor(
    private readonly owner: TabDocumentManager,
    readonly side: TabDockSide,
    size: number | string,
  ) {
    super();
    const el = (this.element = owner.element.ownerDocument.createElement('div'));
    el.className = 'mx-tabdocs__area';
    el.id = nextId('tabdocs-area');
    el.dataset.side = side;
    // A group, not a landmark: a page may hold many managers.
    el.setAttribute('role', 'group');
    this.sash = new SplitSash(this, owner);
    this.sash.element.classList.add('mx-tabdocs__area-sash');
    this.sizeSignal.value = size;
  }

  get manager(): TabDocumentManager {
    return this.owner;
  }
  /** As set: pixels, or a share of the manager such as `'25%'`. Reactive. */
  get size(): number | string {
    return this.sizeSignal.value;
  }
  /** Folded to the manager's edge. Reactive. */
  get autoHidden(): boolean {
    return this.folded.value;
  }
  /** Folded and slid out over the documents now. Reactive. */
  get isOpen(): boolean {
    return this.openSignal.value;
  }
  /** Its groups, in layout order. Reactive. */
  get groups(): readonly TabGroup[] {
    return this.owner.groups.filter((g) => g.dockArea === this);
  }
  /** Reactive. */
  get documents(): readonly TabDocument[] {
    return this.groups.flatMap((g) => g.documents);
  }
  /** Its place in the manager's `dockAreas`, the outermost first. Reactive. */
  get index(): number {
    return this.owner.dockAreas.indexOf(this);
  }
  /** Where it is on the screen now (empty while folded and not slid out). */
  get rect(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  /** Sets its size: pixels, or a share of the manager such as `'25%'`. */
  resize(size: number | string): boolean {
    return this.owner.resizeDockArea(this, size);
  }

  /** Folds it to the manager's edge (`true`), or brings it back. */
  autoHide(on = true): boolean {
    return this.owner.autoHide(this, on);
  }

  /** Folded: slides it out over the documents with `document` (else its active one). */
  show(document?: TabDocument): boolean {
    const doc = document ?? this.groups[0]?.activeDocument ?? this.documents[0];
    return !!doc && this.owner.showAutoHidden(doc);
  }

  // A splitter between the area and the documents.

  get orientation(): LayoutOrientation {
    return this.side === 'left' || this.side === 'right' ? 'horizontal' : 'vertical';
  }
  get rtl(): boolean {
    const view = this.element.ownerDocument.defaultView;
    return !!view && view.getComputedStyle(this.owner.element).direction === 'rtl';
  }
  /** @internal Its size in pixels, as a drag starts from. */
  get sizes(): number[] {
    return [this.pixels()];
  }
  set sizes(value: number[]) {
    this.setPixels(value[0]);
  }
  sashIndex(): number {
    return 0;
  }
  /** @internal The splitter moved `delta` pixels in the reading direction: towards the documents the area grows. */
  resizeBy(_index: number, delta: number): boolean {
    const grows = this.side === 'left' || this.side === 'top' ? delta : -delta;
    this.setPixels(this.pixels() + grows);
    return true;
  }
  /** @internal A double click gives it the size areas of its side start with. */
  resetSizes(): void {
    this.owner.resizeDockArea(this, this.owner.dockAreaSize[this.side] ?? 240, true);
  }

  // Called by the manager.

  /** @internal Its size in pixels now, within its smallest and largest. */
  pixels(): number {
    return this.owner.clampAreaSize(this, this.rawPixels());
  }

  /** @internal Its size in pixels as set, not kept within anything. */
  rawPixels(): number {
    return toPixels(this.size, this.room());
  }

  /** @internal Sets the size in pixels, as a share again when it was one. */
  setPixels(px: number): void {
    const room = this.room();
    const next = this.owner.clampAreaSize(this, px);
    const share = typeof this.size === 'string' && this.size.trim().endsWith('%');
    this.sizeSignal.value = share && room > 0 ? `${Math.round((next / room) * 1000) / 10}%` : Math.round(next);
    this.owner.renderDock();
  }

  /** @internal */
  setSize(size: number | string): void {
    this.sizeSignal.value = size;
  }

  /** @internal */
  markFolded(on: boolean): void {
    this.folded.value = on;
    this.element.toggleAttribute('data-auto-hide', on);
    if (!on) this.markOpen(false);
  }

  /** @internal */
  markOpen(on: boolean): void {
    this.openSignal.value = on;
    this.element.toggleAttribute('data-open', on);
  }

  /** @internal The length of the manager along which the area's size runs. */
  room(): number {
    const box = this.owner.element.getBoundingClientRect();
    return this.orientation === 'horizontal' ? box.width : box.height;
  }

  /** @internal */
  dispose(): void {
    this.sash.element.remove();
    this.element.remove();
  }
}

/** Pixels, or a share of `room` (`'25%'`). */
function toPixels(size: number | string, room: number): number {
  const text = String(size).trim();
  const n = parseFloat(text);
  if (!(n >= 0)) return 0;
  return text.endsWith('%') ? (room * n) / 100 : n;
}
