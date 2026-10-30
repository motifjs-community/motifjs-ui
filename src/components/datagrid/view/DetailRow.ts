import { ComponentBase, createSignal, untracked } from '@motifx/core';
import type { DetailContext } from '../detail-context';
import type { GridModel } from '../model/GridModel';
import { AdaptiveForm } from './AdaptiveForm';
import type { DetailHost } from './detail-host';
import { isNode } from '../../../core/node-kind';

/**
 * The details of one row (`masterDetail`): a row element under its master row with one cell across
 * the grid, holding what the template made for the row. It is not pooled: the content belongs to its
 * row, is made the first time the details show and is kept while the row is open, also out of view
 * (parked: laid out but not drawn, so the content keeps its scroll positions), until it is disposed.
 * A row's adaptive detail (`kind: 'adaptive'`, the values of the columns the width hides) is one too,
 * with content of its own (`make`).
 */
export class DetailRow<T> {
  readonly element: HTMLDivElement;
  readonly cell: HTMLDivElement;
  /** What holds the content, named after the row (a cell named apart from its content would read wrong). */
  private readonly box: HTMLDivElement;
  /** Grid index of the master row while drawn; -1 while parked. */
  index = -1;
  /** Measured height; 0 until it was drawn. */
  height = 0;
  /** When it was last drawn (a count of layouts), so the ones seen longest ago go first. */
  seen = 0;
  private content: ComponentBase | null = null;
  private built = false;
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
    const el = document.createElement('div');
    el.className = kind === 'adaptive' ? 'mx-data-grid__detail-row mx-data-grid__adaptive-row' : 'mx-data-grid__detail-row';
    el.setAttribute('role', 'row');
    el.id = elementId;
    el.hidden = true;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__detail-cell';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-colindex', '1');
    cell.tabIndex = -1;
    const box = document.createElement('div');
    box.className = 'mx-data-grid__detail-content';
    box.setAttribute('role', 'group');
    cell.append(box);
    el.append(cell);
    this.element = el;
    this.cell = cell;
    this.box = box;
  }

  /** What the content was made as, once it is: a component, or `null`. */
  get component(): ComponentBase | null {
    return this.content;
  }

  /** Whether it is drawn now. */
  get shown(): boolean {
    return !this.element.hidden;
  }

  /** Draws the details of grid row `index` at `top`, as wide as the viewport and kept in it while the rows scroll sideways. */
  use(index: number, row: T, top: number, left: number, width: number, columns: number) {
    if (this.index !== index || this.row !== row) {
      this.index = index;
      this.row = row;
      this.version.value = this.version.peek() + 1;
    }
    const el = this.element;
    if (!this.built) this.build();
    el.hidden = false;
    el.style.inlineSize = `${width}px`;
    el.style.transform = `translate(${left}px, ${top}px)`;
    const label = this.model.text(this.kind === 'adaptive' ? 'gridAdaptiveOf' : 'gridDetailsOf', { row: this.model.formatter.count(index + 1) });
    if (this.box.getAttribute('aria-label') !== label) this.box.setAttribute('aria-label', label);
    // Grouped, the grid is a tree: the details sit at the level of their row.
    const levels = this.model.groups.state.items.length;
    if (levels) el.setAttribute('aria-level', String(levels + 1));
    else el.removeAttribute('aria-level');
    const span = String(Math.max(1, columns));
    if (this.cell.getAttribute('aria-colspan') !== span) this.cell.setAttribute('aria-colspan', span);
    // A height of its own: the content scrolls inside.
    const fixed = this.kind === 'detail' ? this.model.details.options.get('height') : undefined;
    const height = typeof fixed === 'function' ? untracked(() => fixed(row)) : fixed;
    const size = height === undefined ? '' : `${Math.max(0, height)}px`;
    if (this.cell.style.blockSize !== size) this.cell.style.blockSize = size;
    this.cell.toggleAttribute('data-fixed', height !== undefined);
  }

  /** What the content reads of the row through its context is read again (`grid.repaint()`); its adaptive form draws its texts again. */
  redraw() {
    this.version.value = this.version.peek() + 1;
    if (this.content instanceof AdaptiveForm) this.content.redraw();
  }

  /** Out of view: kept, not drawn. */
  park() {
    if (this.element.hidden) return;
    this.element.hidden = true;
    this.element.style.transform = '';
    this.index = -1;
  }

  /** Disposes the content and takes the row out of the body. */
  dispose() {
    const content = this.content;
    this.content = null;
    if (content && !content.isDisposed) void content.dispose();
    this.element.remove();
  }

  /** Makes the content from the template, once. */
  private build() {
    this.built = true;
    const template = this.make ?? this.model.details.options.get('template');
    if (!template) return;
    const content = untracked(() => template(this.context()));
    if (content instanceof ComponentBase) {
      this.host.owner.controls.add(content);
      this.box.append(content.element as Node);
      this.content = content;
    } else if (isNode(content)) this.box.append(content);
    else if (content !== undefined && content !== null) this.box.append(String(content));
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
