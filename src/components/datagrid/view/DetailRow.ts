import { Component, ComponentBase, createSignal, untracked } from '@motifx/core';
import type { DetailContext } from '../detail-context';
import type { GridModel } from '../model/GridModel';
import { AdaptiveForm } from './AdaptiveForm';
import type { DetailHost } from './detail-host';
import { textPart } from '../../../core/draw-parts';
import { css, mark, put } from '../../../core/part-writes';

/**
 * The details of one row (`masterDetail`): a row element under its master row with one cell across
 * the grid, holding what the template made for the row. It is not pooled: the content belongs to its
 * row, is created the first time the details show and is kept while the row is open, also out of view
 * (parked: laid out but not drawn, so the content keeps its scroll positions), until it is disposed.
 * A row's adaptive detail (`kind: 'adaptive'`, the values of the columns the width hides) is one too,
 * with content of its own (`make`). The row, its cell and the box are components: the content is a
 * child of the box.
 */
export class DetailRow<T> {
  /** The row's component, a child of the body. */
  readonly part: Component<HTMLDivElement>;
  readonly element: HTMLDivElement;
  /** The one cell, across the grid. */
  readonly cellPart: Component<HTMLDivElement>;
  /** What holds the content, named after the row (a cell named apart from its content would read wrong). */
  private readonly boxPart: Component<HTMLDivElement>;
  /** Grid index of the master row while drawn; -1 while parked. */
  index = -1;
  /** Measured height; 0 until it was drawn. */
  height = 0;
  /** When it was last drawn (a count of layouts), so the ones seen longest ago go first. */
  seen = 0;
  private content: ComponentBase | null = null;
  private built = false;
  private drawn = false;
  private readonly version = createSignal(0);

  constructor(
    private readonly model: GridModel<T>,
    private readonly host: DetailHost<T>,
    /** The row's key as text, and the key itself. */
    readonly id: string,
    readonly key: unknown,
    public row: T,
    elementId: string,
    readonly kind: 'detail' | 'adaptive' = 'detail',
    /** Makes the content instead of `masterDetail.template`. */
    private readonly make: ((ctx: DetailContext<T>) => unknown) | null = null,
  ) {
    this.part = new Component<HTMLDivElement>('div');
    const el = this.part.element;
    this.part.class.add(kind === 'adaptive' ? 'mx-data-grid__detail-row mx-data-grid__adaptive-row' : 'mx-data-grid__detail-row');
    this.part.attr.add({ role: 'row', id: elementId });
    // Hidden with the attribute, not core's hide: out of view, the row stays laid out but is not drawn (see the
    // stylesheet), so its content keeps its scroll and frames; taken out of the page, it would lose them.
    mark(this.part, 'hidden', true);
    const cellPart = new Component<HTMLDivElement>('div');
    cellPart.class.add('mx-data-grid__detail-cell');
    cellPart.attr.add({ role: 'gridcell', 'aria-colindex': '1' });
    put(cellPart, 'tabindex', '-1');
    this.boxPart = new Component<HTMLDivElement>('div');
    this.boxPart.class.add('mx-data-grid__detail-content');
    this.boxPart.attr.add({ role: 'group' });
    cellPart.controls.add(this.boxPart);
    this.part.controls.add(cellPart);
    this.element = el;
    this.cellPart = cellPart;
  }

  /** What the content was created as, once it is: a component, or `null`. */
  get component(): ComponentBase | null {
    return this.content;
  }

  /** Whether it is drawn now. */
  get shown(): boolean {
    return this.drawn;
  }

  /** Draws the details of grid row `index` at `top`, as wide as the viewport and kept in it while the rows scroll sideways. */
  use(index: number, row: T, top: number, left: number, width: number, columns: number) {
    if (this.index !== index || this.row !== row) {
      this.index = index;
      this.row = row;
      this.version.value = this.version.peek() + 1;
    }
    if (!this.built) this.build();
    this.drawn = true;
    mark(this.part, 'hidden', false);
    css(this.part, 'inline-size', `${width}px`);
    css(this.part, 'transform', `translate(${left}px, ${top}px)`);
    const label = this.model.text(this.kind === 'adaptive' ? 'gridAdaptiveOf' : 'gridDetailsOf', { row: this.model.formatter.count(index + 1) });
    put(this.boxPart, 'aria-label', label);
    // Grouped, the grid is a tree: the details sit at the level of their row.
    const levels = this.model.groups.state.items.length;
    if (levels) put(this.part, 'aria-level', String(levels + 1));
    else put(this.part, 'aria-level', null);
    put(this.cellPart, 'aria-colspan', String(Math.max(1, columns)));
    // A height of its own: the content scrolls inside.
    const fixed = this.kind === 'detail' ? this.model.details.options.get('height') : undefined;
    const height = typeof fixed === 'function' ? untracked(() => fixed(row)) : fixed;
    css(this.cellPart, 'block-size', height === undefined ? '' : `${Math.max(0, height)}px`);
    mark(this.cellPart, 'data-fixed', height !== undefined);
  }

  /** What the content reads of the row through its context is read again (`grid.repaint()`); its adaptive form draws its texts again. */
  redraw() {
    this.version.value = this.version.peek() + 1;
    if (this.content instanceof AdaptiveForm) this.content.redraw();
  }

  /** Out of view: kept, not drawn. */
  park() {
    if (!this.drawn) return;
    this.drawn = false;
    mark(this.part, 'hidden', true);
    css(this.part, 'transform', '');
    this.index = -1;
  }

  /** Disposes the content and takes the row out of the body. */
  dispose() {
    this.content = null;
    if (this.part.parent) this.part.parent.controls.remove(this.part);
    else if (!this.part.isDisposed) void this.part.dispose({ skipLeaveTransition: true });
  }

  /** Makes the content from the template, once. */
  private build() {
    this.built = true;
    const template = this.make ?? this.model.details.options.get('template');
    if (!template) return;
    const content = untracked(() => template(this.context()));
    if (content instanceof ComponentBase) {
      this.boxPart.controls.add(content);
      this.content = content;
    } else if (content !== undefined && content !== null) textPart(this.boxPart, String(content));
  }

  private context(): DetailContext<T> {
    const view = this;
    const host = this.host;
    return {
      get row() {
        void view.version.value;
        return view.row;
      },
      key: this.key,
      get rowIndex() {
        void view.version.value;
        return view.index;
      },
      grid: host.grid,
      collapse: () => host.collapse(this.key),
    };
  }
}
