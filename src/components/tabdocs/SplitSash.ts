import { Component } from '@motifx/core';
import { focusOn } from '../../core/focus';
import { rectOf } from '../../core/measure';
import { mark, put } from '../../core/part-writes';
import { followPointer } from '../../parts/window/follow-pointer';
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
  private drag: { sizes: number[] } | null = null;

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
    const vertical = this.split.orientation === 'vertical';
    this.drag = { sizes: [...this.split.sizes] };
    mark(this.manager, 'data-resizing', true);
    // Along the split, growing in the reading direction, counted from the grid that holds the sash (the manager's, or a
    // floating window's), which the sizes do not move: a scroll keeps the sash under the pointer.
    followPointer(this.part, e, (dx, dy) => this.move(vertical ? dy : rtl ? -dx : dx), (end) => this.end(end), () => {
      const box = rectOf(this.part.parent ?? this.manager);
      return { x: box.left, y: box.top };
    });
  }

  private move(moved: number): void {
    const drag = this.drag;
    if (!drag) return;
    this.split.sizes = [...drag.sizes];
    this.split.resizeBy(this.index, moved);
  }

  private end(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    this.part.attr.add({ releasePointerCapture: e.pointerId });
    mark(this.manager, 'data-resizing', false);
    this.manager.endResize(e.type === 'pointerup', this.split);
  }
}
