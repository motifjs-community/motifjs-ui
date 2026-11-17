import type { Component, ComponentBase } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { holdsFocus } from '../../core/focus';
import { boxOf, measure as ask, onLayout, onLookChange, rectOf, scrollBy, styleOf, whenMeasured } from '../../core/measure';
import { css, kept } from '../../core/part-writes';
import type { ScrollView } from '../../components/scrollview/ScrollView';
import type { WindowListSource } from './window-list-source';

/** How far beyond the view, in view heights, parts stay on the page. */
const OVERSCAN = 1;
/** The least overscan, in pixels, for a short view. */
const LEAST_OVERSCAN = 400;
/** Before the view has a size, the parts of the last items are placed until their estimates fill this much. */
const FIRST_FILL = 1600;
/** Rounds of an update: parts measured smaller than estimated can leave room for more. */
const MOST_PASSES = 4;

interface Slot<T> {
  item: T;
  part: ComponentBase | null;
  /** The part's height as last measured, or the estimate. */
  height: number;
  measured: boolean;
  /** The item changed while it had no part: its height is estimated again. */
  stale: boolean;
}

/**
 * A list of items of any height in a `ScrollView` that has only the parts in and near the view. A part is made from its
 * item when the item comes near the view and disposed when it goes far: only the item and the part's measured height
 * are kept, and it is made again when it comes back. Heights are estimated until measured; spacers stand for the items
 * with no part, and the part on screen stays where it is while estimates turn into measures or items are added above.
 * A part holding focus is not disposed.
 */
export class WindowList<T> {
  /** The list's element: a spacer, the parts on the page in order, a spacer. */
  readonly host: Component<HTMLDivElement>;
  private readonly before: Component<HTMLDivElement>;
  private readonly after: Component<HTMLDivElement>;
  private slots: Slot<T>[] = [];
  private readonly bySlot = new Map<T, Slot<T>>();
  /** The slots on the page: `[first, last)`. */
  private first = 0;
  private last = 0;
  private gapValue = -1;
  private updating = false;
  private queued = false;
  private noticing = false;
  private passes = 0;
  private sized = false;
  /** The browser keeps the view where it is as parts above it change size (scroll anchoring): nothing to make up for. */
  private readonly anchored = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('overflow-anchor', 'auto');

  constructor(
    private readonly scroller: ScrollView,
    private readonly source: WindowListSource<T>,
    className: string
  ) {
    this.host = loose<HTMLDivElement>('div', `mx-window-list ${className}`);
    this.before = part<HTMLDivElement>(this.host, 'div', 'mx-window-list__spacer');
    this.after = part<HTMLDivElement>(this.host, 'div', 'mx-window-list__spacer');
    kept(this.before, false);
    kept(this.after, false);
    scroller.onScrolled(() => this.update());
    onLayout(scroller, 'size', () => this.noticed(), { owner: this.host });
    // A part that changed size after it was drawn (a button that learned its size, an image that loaded).
    onLayout(this.host, 'size', () => this.noticed(), { owner: this.host });
    // Another density or design language: another gap, other heights.
    this.host.motif.setDisposable(
      onLookChange(this.host, () => {
        this.gapValue = -1;
        for (const slot of this.slots) slot.measured = false;
        this.noticed();
      })
    );
  }

  get items(): T[] {
    return this.slots.map((s) => s.item);
  }

  get count(): number {
    return this.slots.length;
  }

  has(item: T): boolean {
    return this.bySlot.has(item);
  }

  /** The part of `item` while it is on the page. */
  partOf(item: T): ComponentBase | null {
    return this.bySlot.get(item)?.part ?? null;
  }

  /** Another list: every part goes, and those in and near the view are made from the new items. */
  set(items: readonly T[]): void {
    const keep = new Set(items);
    for (const slot of this.slots) {
      if (keep.has(slot.item)) this.takeOff(slot);
      else this.drop(slot);
    }
    this.slots = items.map((item) => this.bySlot.get(item) ?? this.slotOf(item));
    this.first = this.last = 0;
    this.drawSpacers();
    this.update();
  }

  /** Adds an item at the end; at the end of the window, its part is made and placed at once. */
  append(item: T): void {
    if (this.bySlot.has(item)) return;
    const slot = this.slotOf(item);
    this.slots.push(slot);
    if (this.last === this.slots.length - 1) {
      this.put(slot, this.after);
      this.last++;
      this.measure(slot);
    }
    this.drawSpacers();
    this.update();
  }

  /** Adds items before `index`; what is on screen stays where it is. */
  insert(index: number, items: readonly T[]): void {
    const fresh = items.filter((item) => !this.bySlot.has(item)).map((item) => this.slotOf(item));
    if (!fresh.length) return;
    this.hold(() => {
      this.slots.splice(index, 0, ...fresh);
      if (index <= this.first) {
        this.first += fresh.length;
        this.last += fresh.length;
      } else if (index < this.last) {
        // Inside the window: their parts are made and placed in order.
        const at = this.host.controls.items.indexOf(this.slots[index + fresh.length].part!);
        fresh.forEach((slot, i) => {
          slot.part = this.source.make(slot.item);
          this.host.controls.insert(at + i, slot.part);
          this.measure(slot);
        });
        this.last += fresh.length;
      }
      this.drawSpacers();
    });
    // After the scroll that keeps the view: it is made a microtask later.
    this.passes = 0;
    this.later();
  }

  remove(item: T): void {
    const slot = this.bySlot.get(item);
    if (!slot) return;
    const at = this.slots.indexOf(slot);
    this.hold(() => {
      this.drop(slot);
      this.slots.splice(at, 1);
      if (at < this.first) {
        this.first--;
        this.last--;
      } else if (at < this.last) {
        this.last--;
      }
      this.drawSpacers();
    }, slot.part);
    this.passes = 0;
    this.later();
  }

  /** The item changed: its part on the page is made again from it, in its place; with no part, its height is estimated again. */
  refresh(item: T): void {
    const slot = this.bySlot.get(item);
    if (!slot) return;
    const old = slot.part;
    if (!old || old.parent !== this.host) {
      slot.height = Math.max(1, this.source.estimate(item));
      slot.measured = false;
      this.drawSpacers();
      this.update();
      return;
    }
    this.hold(() => {
      const at = this.host.controls.items.indexOf(old);
      this.host.controls.remove(old);
      slot.part = this.source.make(item);
      this.host.controls.insert(at, slot.part);
      this.measure(slot);
      this.drawSpacers();
    }, old);
    this.passes = 0;
    this.later();
  }

  /** The item changed while it has no part (a reply written far from the view): its height is estimated again, once a frame. */
  stale(item: T): void {
    const slot = this.bySlot.get(item);
    if (!slot || slot.part) return;
    slot.stale = true;
    ask(this.host, this.readNothing, this.estimateStale);
  }

  /**
   * Makes `change` (above the view) and keeps the part first on screen where it is; `leaving` is no anchor, and only a
   * part of `[from, to)` is, when given: a part the change disposes has no place to keep.
   */
  hold(change: () => void, leaving: ComponentBase | null = null, from = this.first, to = this.last): void {
    const anchor = this.anchor(leaving, from, to);
    if (anchor) this.scroller.holdPosition(anchor, change);
    else change();
  }

  /** Places on the page the parts in and near the view, takes off the others, and keeps the view where it is. */
  update(): void {
    this.passes = 0;
    this.step();
  }

  /**
   * A notice of the layout layer: the window reads the page, so it is looked at once the layer's run is over (still
   * before the paint), once for all the notices of that run.
   */
  private noticed(): void {
    if (this.noticing) return;
    this.noticing = true;
    void whenMeasured(this.host).then(() => {
      this.noticing = false;
      this.update();
    });
  }

  /**
   * One round, then another until nothing changes. A round that moved the view goes on a microtask later: core makes
   * the scroll it wrote a microtask later, and the next round reads where the view really is.
   */
  private step(): void {
    if (this.host.isDisposed) return;
    if (this.updating) {
      this.later();
      return;
    }
    this.updating = true;
    let changed = false;
    try {
      changed = this.pass();
    } finally {
      this.updating = false;
    }
    if (changed && ++this.passes < MOST_PASSES) this.later();
    else if (this.sized) this.source.settled?.();
  }

  private later(): void {
    if (this.queued) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      this.step();
    });
  }

  /** One round: returns whether the window changed. */
  private pass(): boolean {
    const n = this.slots.length;
    const box = boxOf(this.scroller);
    this.sized = box.clientHeight > 0;
    let first: number;
    let last: number;
    if (!box.clientHeight) {
      // No size yet: the last items, as many as their estimates fill.
      last = n;
      first = n;
      for (let fill = 0; first > 0 && fill < FIRST_FILL; ) fill += this.slots[--first].height;
    } else {
      // The view was moved to make up for parts above it: the window is looked at once core has made the scroll.
      if (this.measureAll()) return true;
      const gap = this.gap();
      const top = box.scrollTop - (rectOf(this.host).top - rectOf(this.scroller).top + box.scrollTop);
      const reach = Math.max(LEAST_OVERSCAN, box.clientHeight * OVERSCAN);
      const from = top - reach;
      const to = top + box.clientHeight + reach;
      first = n;
      last = n;
      let y = 0;
      for (let i = 0; i < n; i++) {
        const pitch = this.slots[i].height + gap;
        if (first === n && y + pitch > from) first = i;
        if (y >= to) {
          last = i;
          break;
        }
        y += pitch;
      }
      if (first === n) first = Math.max(0, n - 1);
    }
    // A part holding focus stays on the page: the window reaches it.
    for (let i = this.first; i < this.last; i++) {
      const p = this.slots[i]?.part;
      if (p && holdsFocus(p)) {
        first = Math.min(first, i);
        last = Math.max(last, i + 1);
      }
    }
    if (first === this.first && last === this.last) return false;
    const atEnd = this.scroller.isAtEnd && this.scroller.stickToEnd;
    const change = () => this.place(first, last);
    if (atEnd) {
      change();
      this.scroller.stickNow();
    } else {
      // Only a part that stays on the page keeps the view: after a jump far away, none does.
      this.hold(change, null, Math.max(first, this.first), Math.min(last, this.last));
    }
    return true;
  }

  /** Disposes the parts that leave `[first, last)` and places the ones that come, in order, then sizes the spacers. */
  private place(first: number, last: number): void {
    const apart = last <= this.first || first >= this.last;
    for (let i = this.first; i < this.last; i++) if (apart || i < first || i >= last) this.takeOff(this.slots[i]);
    if (apart) {
      for (let i = first; i < last; i++) this.put(this.slots[i], this.after);
    } else {
      // New parts above go before the first part kept, in order; new parts below go at the end.
      const keptFirst = this.slots[Math.max(first, this.first)].part!;
      for (let i = first; i < this.first; i++) this.put(this.slots[i], keptFirst);
      for (let i = Math.max(this.last, first); i < last; i++) this.put(this.slots[i], this.after);
    }
    this.first = first;
    this.last = last;
    for (let i = first; i < last; i++) if (!this.slots[i].measured) this.measure(this.slots[i]);
    this.drawSpacers();
  }

  /** Puts a slot's part on the page before `next`, making it from its item. */
  private put(slot: Slot<T>, next: ComponentBase): void {
    slot.part ??= this.source.make(slot.item);
    if (slot.part.parent === this.host) return;
    this.host.controls.insert(this.host.controls.items.indexOf(next), slot.part);
  }

  /** Disposes a slot's part; the item and its measured height stay. */
  private takeOff(slot: Slot<T>): void {
    const part = slot.part;
    if (!part) return;
    slot.part = null;
    if (part.parent) part.parent.controls.remove(part);
    else if (!part.isDisposed) void part.dispose();
  }

  private drop(slot: Slot<T>): void {
    this.bySlot.delete(slot.item);
    if (slot.part && !slot.part.isDisposed) {
      if (slot.part.parent) slot.part.parent.controls.remove(slot.part);
      else void slot.part.dispose();
    }
    slot.part = null;
  }

  private slotOf(item: T): Slot<T> {
    const slot: Slot<T> = { item, part: null, height: Math.max(1, this.source.estimate(item)), measured: false, stale: false };
    this.bySlot.set(item, slot);
    return slot;
  }

  private measure(slot: Slot<T>): void {
    if (!slot.part) return;
    const height = rectOf(slot.part).height;
    if (height > 0) {
      slot.height = height;
      slot.measured = true;
    }
  }

  /**
   * Parts on the page change (a reply grows, the width changes, a part learns its size after it is drawn): their
   * heights are read again. Without scroll anchoring in the browser, what the parts before the first one that starts
   * in the view gained or lost moved that part: the view goes with it. Returns whether it scrolled.
   */
  private measureAll(): boolean {
    let changed = false;
    // What the parts before it gained or lost so far; the anchor is the first part whose top, before that, was in view.
    let gained = 0;
    let moved: number | null = null;
    const viewTop = this.anchored ? 0 : rectOf(this.scroller).top;
    for (let i = this.first; i < this.last; i++) {
      const slot = this.slots[i];
      const before = slot.height;
      const wasMeasured = slot.measured;
      this.measure(slot);
      if (slot.height !== before) changed = true;
      if (this.anchored || moved !== null || !slot.part) continue;
      if (rectOf(slot.part).top - gained >= viewTop - 0.5) moved = gained;
      else if (wasMeasured) gained += slot.height - before;
    }
    if (changed) this.drawSpacers();
    const shift = moved ?? gained;
    const atEnd = this.scroller.isAtEnd && this.scroller.stickToEnd;
    if (Math.abs(shift) < 0.5 || atEnd) return false;
    scrollBy(this.scroller, { top: shift });
    return true;
  }

  private readonly readNothing = (): null => null;

  private readonly estimateStale = (): void => {
    let changed = false;
    for (const slot of this.slots) {
      if (!slot.stale) continue;
      slot.stale = false;
      if (slot.part) continue;
      slot.height = Math.max(1, this.source.estimate(slot.item));
      slot.measured = false;
      changed = true;
    }
    if (changed) this.drawSpacers();
  };

  /** The spacers stand for the items with no part above and below: their heights and the gaps between them. */
  private drawSpacers(): void {
    const gap = this.gap();
    let above = 0;
    for (let i = 0; i < this.first; i++) above += this.slots[i].height + gap;
    let below = 0;
    for (let i = this.last; i < this.slots.length; i++) below += this.slots[i].height + gap;
    this.size(this.before, above - gap);
    this.size(this.after, below - gap);
  }

  private size(spacer: Component<HTMLDivElement>, height: number): void {
    // An empty spacer is no flex item: it would add a gap.
    kept(spacer, height > 0);
    css(spacer, 'block-size', height > 0 ? `${height}px` : '');
  }

  /** The first part of `[from, to)` on the page that shows in the view. */
  private anchor(leaving: ComponentBase | null, from: number, to: number): ComponentBase | null {
    const view = rectOf(this.scroller);
    for (let i = Math.max(from, this.first); i < Math.min(to, this.last); i++) {
      const p = this.slots[i].part;
      if (!p || p === leaving) continue;
      const rect = rectOf(p);
      if (rect.bottom > view.top && rect.top < view.bottom) return p;
    }
    return null;
  }

  /** The space between items, from the list's style. */
  private gap(): number {
    if (this.gapValue < 0) {
      const value = parseFloat(styleOf(this.host, ['row-gap'])['row-gap']);
      if (!Number.isNaN(value)) this.gapValue = value;
    }
    return Math.max(0, this.gapValue);
  }
}
