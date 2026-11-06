import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { ChildSettings } from './ChildSettings';
import type { GridCell } from './grid-cell';
import type { GridFlow } from './grid-flow';
import type { GridJustify } from './grid-justify';
import type { GridProps } from './grid-props';
import type { GridTracks } from './grid-tracks';
import type { LayoutAlign } from './layout-align';
import type { LayoutSpace } from './layout-space';
import { setPadding } from './set-padding';
import { setSpace } from './set-space';
import { trackList } from './track-list';

const OWN = ['rows', 'columns', 'gap', 'rowGap', 'columnGap', 'padding', 'autoRows', 'autoColumns', 'flow', 'align', 'justify', 'inline'] as const;

const CELL = ['row', 'column', 'rowSpan', 'columnSpan'] as const;

const PLACEMENT = ['grid-row-start', 'grid-row-end', 'grid-column-start', 'grid-column-end'];

const CHILDREN = Symbol('mx.grid');

/** A line for CSS: a number as it is, a string passed through. */
function line(value: unknown): string {
  return typeof value === 'number' || typeof value === 'string' ? String(value) : '';
}

function span(value: unknown): string {
  const n = Number(value);
  return n > 1 ? `span ${Math.floor(n)}` : '';
}

/**
 * Rows and columns defined up front, in a CSS-like form (`columns="auto 1fr 2fr 120"`). Children fill
 * the cells in order, or declare their position in their own props: `row`, `column`, `rowSpan` and
 * `columnSpan`, counted from 1.
 *
 * @example
 * <Grid columns="auto 1fr" gap="sm">
 *   <TextBox label="Name" column={2} />
 *   <TextBox label="Notes" column={1} columnSpan={2} />
 * </Grid>
 *
 * const grid = new Grid({ columns: 3 });
 * grid.controls.add(new Button({ text: 'Wide', columnSpan: 2 }));
 */
export class Grid extends Control<HTMLDivElement, GridProps> {
  constructor(props?: IBaseProp<GridProps>) {
    super('div', props);
    const own = (this.props ?? {}) as GridProps;
    const el = this.element;
    el.classList.add('mx-grid');
    this.observeProperty<GridTracks>('rows', (rows) => this.writeStyle('grid-template-rows', trackList(rows)));
    this.observeProperty<GridTracks>('columns', (columns) => this.writeStyle('grid-template-columns', trackList(columns)));
    // A number here is a size, not a count.
    this.observeProperty<number | string>('autoRows', (rows) => this.writeStyle('grid-auto-rows', trackList(typeof rows === 'number' ? [rows] : rows)));
    this.observeProperty<number | string>('autoColumns', (columns) => this.writeStyle('grid-auto-columns', trackList(typeof columns === 'number' ? [columns] : columns)));
    this.observeProperty<LayoutSpace>('gap', (gap) => setSpace(el, '--_gap', gap));
    this.observeProperty<LayoutSpace>('rowGap', (gap) => setSpace(el, '--_row-gap', gap));
    this.observeProperty<LayoutSpace>('columnGap', (gap) => setSpace(el, '--_column-gap', gap));
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(el, padding));
    this.observeProperty<GridFlow>('flow', (flow) => this.writeStyle('grid-auto-flow', flow ?? ''));
    this.observeProperty<LayoutAlign>('align', (align) => (el.dataset.align = align ?? 'stretch'));
    this.observeProperty<GridJustify>('justify', (justify) => (el.dataset.justify = justify ?? 'stretch'));
    this.observeProperty<boolean>('inline', (inline) => el.toggleAttribute('data-inline', !!inline));
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    void this.settings;
    if (this.childs?.length) this.controls.add(...this.childs);
  }

  get rows(): GridTracks | undefined {
    return this.getProperty<GridTracks | undefined>('rows');
  }
  set rows(value: Bind<GridTracks | undefined>) {
    this.assignProperty('rows', value);
  }
  get columns(): GridTracks | undefined {
    return this.getProperty<GridTracks | undefined>('columns');
  }
  set columns(value: Bind<GridTracks | undefined>) {
    this.assignProperty('columns', value);
  }
  get gap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('gap');
  }
  set gap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('gap', value);
  }
  get rowGap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('rowGap');
  }
  set rowGap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('rowGap', value);
  }
  get columnGap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('columnGap');
  }
  set columnGap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('columnGap', value);
  }
  get padding(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('padding');
  }
  set padding(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('padding', value);
  }
  get autoRows(): number | string | undefined {
    return this.getProperty<number | string | undefined>('autoRows');
  }
  set autoRows(value: Bind<number | string | undefined>) {
    this.assignProperty('autoRows', value);
  }
  get autoColumns(): number | string | undefined {
    return this.getProperty<number | string | undefined>('autoColumns');
  }
  set autoColumns(value: Bind<number | string | undefined>) {
    this.assignProperty('autoColumns', value);
  }
  get flow(): GridFlow {
    return this.getProperty<GridFlow | undefined>('flow') ?? 'row';
  }
  set flow(value: Bind<GridFlow>) {
    this.assignProperty('flow', value);
  }
  get align(): LayoutAlign {
    return this.getProperty<LayoutAlign | undefined>('align') ?? 'stretch';
  }
  set align(value: Bind<LayoutAlign>) {
    this.assignProperty('align', value);
  }
  get justify(): GridJustify {
    return this.getProperty<GridJustify | undefined>('justify') ?? 'stretch';
  }
  set justify(value: Bind<GridJustify>) {
    this.assignProperty('justify', value);
  }
  get inline(): boolean {
    return !!this.getProperty<boolean>('inline');
  }
  set inline(value: Bind<boolean>) {
    this.assignProperty('inline', value, Boolean);
  }

  /** The cell of a child, from its props or as set with {@link setCell}. */
  cellOf(child: ComponentBase): GridCell {
    const cell: Record<string, unknown> = {};
    for (const name of CELL) {
      const value = this.settings.get(child, name);
      if (value !== undefined) cell[name] = value;
    }
    return cell as GridCell;
  }

  /** Places a child programmatically. Each field is a value or a tracked function, and omitted fields do not change. */
  setCell(child: ComponentBase, cell: GridCell): void {
    for (const name of CELL) if (cell[name] !== undefined) this.settings.set(child, name, cell[name]);
  }

  private get settings(): ChildSettings {
    const self = this as unknown as { [CHILDREN]?: ChildSettings };
    if (self[CHILDREN]) return self[CHILDREN];
    self[CHILDREN] = new ChildSettings(this, CELL, {
      changed: (child, el) => {
        const get = (name: string) => this.settings.get(child, name);
        this.place(el, 'grid-row-start', line(get('row')));
        this.place(el, 'grid-row-end', span(get('rowSpan')));
        this.place(el, 'grid-column-start', line(get('column')));
        this.place(el, 'grid-column-end', span(get('columnSpan')));
      },
      left: (_child, el) => {
        for (const name of PLACEMENT) el.style.removeProperty(name);
      },
    });
    return self[CHILDREN].addPresent();
  }

  private place(el: HTMLElement, name: string, value: string): void {
    if (value) el.style.setProperty(name, value);
    else el.style.removeProperty(name);
  }

  private writeStyle(name: string, value: string): void {
    this.place(this.element, name, value);
  }
}
