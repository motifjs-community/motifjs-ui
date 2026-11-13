import { Component } from '@motifx/core';
import { focusOn } from '../../core/focus';
import { mark, put } from '../../core/part-writes';
import type { LayoutOrientation } from '../layout/layout-orientation';
import type { SashOwner } from './sash-owner';
import type { TabDocumentManager } from './TabDocumentManager';
import { layoutPart } from './place-node';

/**
 * The splitter between two neighbors of a split, or between a dock area and the documents (the
 * ARIA window splitter pattern): the pointer drags it, the keys move it (see the manager's `keys`),
 * a double click evens a split's sizes or gives a dock area its first size again.
 */
export class SplitSash {
  /** As a component of the layout. */
  readonly part: Component<HTMLDivElement>;
  private drag: { pointer: number; from: number; sizes: number[]; rtl: boolean } | null = null;

  constructor(
    readonly split: SashOwner,
    private readonly manager: TabDocumentManager,
  ) {
    this.part = new Component<HTMLDivElement>('div');
    layoutPart(this.part);
    this.part.class.add('mx-tabdocs__sash');
    put(this.part, 'tabindex', '0');
    this.part.attr.add({ role: 'separator', 'aria-valuemin': '0', 'aria-valuemax': '100' });
    this.part.motif.on('pointerdown', (_, e) => this.start(e));
    this.part.motif.on('pointermove', (_, e) => this.move(e));
    this.part.motif.on('pointerup', (_, e) => this.end(e));
    this.part.motif.on('pointercancel', (_, e) => this.end(e));
    this.part.motif.on('dblclick', () => split.resetSizes());
  }

  /** The index of the child before it. */
  get index(): number {
    return this.split.sashIndex(this);
  }

  private start(e: PointerEvent): void {
    if (e.button !== 0 || !this.manager.isEnabled) return;
    // The direction is read once, before anything is written.
    const rtl = this.split.orientation === 'horizontal' && this.split.rtl;
    if (!this.manager.beginResize(this.split)) return;
    e.preventDefault();
    focusOn(this.part, { preventScroll: true });
    this.part.attr.add({ setPointerCapture: e.pointerId });
    this.drag = { pointer: e.pointerId, from: position(e, this.split.orientation, rtl), sizes: [...this.split.sizes], rtl };
    mark(this.manager, 'data-resizing', true);
  }

  private move(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    this.split.sizes = [...drag.sizes];
    this.split.resizeBy(this.index, position(e, this.split.orientation, drag.rtl) - drag.from);
  }

  private end(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    this.drag = null;
    this.part.attr.add({ releasePointerCapture: e.pointerId });
    mark(this.manager, 'data-resizing', false);
    this.manager.endResize(e.type === 'pointerup', this.split);
  }
}

/** Where the pointer is along a split, growing in the reading direction. */
function position(e: PointerEvent, orientation: LayoutOrientation, rtl: boolean): number {
  if (orientation === 'vertical') return e.clientY;
  return rtl ? -e.clientX : e.clientX;
}
