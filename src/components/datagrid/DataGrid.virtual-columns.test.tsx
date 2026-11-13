import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumnItem } from './grid-column-item';

type Row = Record<string, number | string>;

const COLUMNS = 40;
const fields = Array.from({ length: COLUMNS }, (_, i) => `c${i}`);
const makeColumns = (): GridColumnItem<Row>[] => [{ field: 'id', title: 'Id', type: 'number', width: 80 }, ...fields.map((field, i) => ({ field, title: `Column ${i}`, width: 100 }))];
const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, r) => Object.fromEntries([['id', r + 1], ...fields.map((f, i) => [f, `${r + 1}.${i}`])]));

async function settle() {
  await settled(6);
}

function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(
    new DataGrid<Row>({
      rowKey: 'id',
      columns: makeColumns(),
      rows: makeRows(50),
      rowHeight: 36,
      settings: { columnRenderingMode: 'virtual', rowStatus: false },
      ...props,
    } as DataGridProps<Row>),
  );
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let left = 0;
  Object.defineProperty(vp, 'scrollLeft', { configurable: true, get: () => left, set: (v: number) => (left = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => 800 });
  // How far the rows can scroll sideways: a scroll into view stops there.
  Object.defineProperty(vp, 'scrollWidth', { configurable: true, get: () => 80 + COLUMNS * 100 });
  (grid as any).measure();
  return {
    grid,
    vp,
    async scrollTo(px: number) {
      vp.scrollLeft = px;
      vp.dispatchEvent(new Event('scroll'));
      await settle();
    },
  };
}

const headerFields = (grid: DataGrid<any>) => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__row--header:not(.mx-data-grid__row--band) > .mx-data-grid__header-cell')].map((c) => c.dataset.field);
const firstRow = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')!;
const rowFields = (grid: DataGrid<any>) => [...firstRow(grid).children].map((c) => (c as HTMLElement).dataset.field);
const bodyCells = (grid: DataGrid<any>) => grid.element.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden]) > .mx-data-grid__cell').length;
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DataGrid virtual columns', () => {
  it('gives cells only to the columns in view and the extra ones, and follows a sideways scroll', async () => {
    const { grid, scrollTo } = make();
    await settle();
    // 800 px: id (80) and c0…c7 show, c8 and c9 are the extra ones.
    const first = ['id', ...fields.slice(0, 10)];
    expect(headerFields(grid)).toEqual(first);
    expect(rowFields(grid)).toEqual(first);
    const rows = grid.element.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden])').length;
    expect(bodyCells(grid)).toBe(rows * first.length);
    // 2000 px in: c19…c27 show (id ends at 80), two more on each side; id is the active column.
    await scrollTo(2000);
    expect(headerFields(grid)).toEqual(['id', ...fields.slice(17, 30)]);
    expect(rowFields(grid)).toEqual(['id', ...fields.slice(17, 30)]);
    expect(firstRow(grid).querySelector<HTMLElement>('[data-field="c20"]')!.textContent).toBe('1.20');
    // The cells keep their tracks and their place for assistive technology.
    const cell = firstRow(grid).querySelector<HTMLElement>('[data-field="c20"]')!;
    expect(cell.getAttribute('aria-colindex')).toBe('22');
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-colcount')).toBe(String(COLUMNS + 1));
    const sheet = (grid as any).styles.css as string;
    expect(sheet).toContain('[data-field="c20"]{grid-column:22;grid-row:1}');
    // More extra columns, live.
    grid.settings.extraColumns = 4;
    await settle();
    expect(headerFields(grid)).toEqual(['id', ...fields.slice(15, 32)]);
  });

  it('always draws pinned columns, the active column and columns that keep their cells', async () => {
    const columns = makeColumns();
    (columns[0] as any).sticky = 'start';
    (columns[30] as any).columnRenderingMode = 'standard';
    const { grid, scrollTo } = make({ columns, settings: { columnRenderingMode: 'virtual', rowStatus: false, editable: true } });
    await settle();
    expect(headerFields(grid)).toContain('c29');
    grid.focusCell(0, 'c1');
    await scrollTo(2500);
    const shown = headerFields(grid);
    expect(shown[0]).toBe('id');
    expect(shown).toContain('c1');
    expect(shown).toContain('c29');
    expect(rowFields(grid)).toContain('c1');
    // Standard for the grid: only the columns that ask for it are virtual.
    grid.settings.columnRenderingMode = 'standard';
    await settle();
    expect(headerFields(grid)).toHaveLength(COLUMNS + 1);
    expect((grid as any).styles.css).not.toContain('grid-column');
  });

  it('spans a band header over its columns drawn only', async () => {
    const columns: GridColumnItem<Row>[] = [{ field: 'id', title: 'Id', type: 'number', width: 80 }, { title: 'Wide', columns: fields.slice(0, 30).map((field) => ({ field, title: field, width: 100 })) }, ...fields.slice(30).map((field) => ({ field, title: field, width: 100 }))];
    const { grid, scrollTo } = make({ columns });
    await settle();
    const band = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__band')!;
    expect([band().style.gridColumn, band().getAttribute('aria-colindex'), band().getAttribute('aria-colspan')]).toEqual(['2 / span 10', '2', '30']);
    await scrollTo(2000);
    expect(band().style.gridColumn).toBe('19 / span 13');
    await scrollTo(3800);
    expect(band()?.isConnected ?? false).toBe(false);
  });

  it('builds a column the keyboard moves to and scrolls it into view', async () => {
    const { grid, vp } = make();
    await settle();
    grid.focusCell(0, 'c2');
    key(grid.getCellPart(0, 'c2')!.element, 'End');
    await settle();
    const last = fields.at(-1)!;
    expect(grid.activeField).toBe(last);
    const cell = grid.getCellPart(0, last)!.element;
    expect(cell).toBeDefined();
    expect(document.activeElement).toBe(cell);
    expect(vp.scrollLeft).toBe(80 + COLUMNS * 100 - 800);
    expect(headerFields(grid)).toContain(last);
    // Arrow keys build the column before.
    key(cell, 'ArrowLeft');
    await settle();
    expect(document.activeElement).toBe(grid.getCellPart(0, fields.at(-2)!)?.element);
    // Back with Home: the first data column.
    key(document.activeElement!, 'Home');
    await settle();
    expect([grid.activeField, vp.scrollLeft, document.activeElement === grid.getCellPart(0, 'id')?.element]).toEqual(['id', 0, true]);
  });

  it('lets the filter row, the totals and the group rows follow, and exports every column', async () => {
    const { grid, scrollTo } = make({
      settings: { columnRenderingMode: 'virtual', rowStatus: false, filterRow: true },
      summary: { totalItems: fields.map((field) => ({ column: field, summaryType: 'count' as const })) },
    });
    await settle();
    const filterFields = () => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__row--filter > .mx-data-grid__filter-cell')].map((c) => c.dataset.field);
    const totalFields = () => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__total-row > .mx-data-grid__cell')].map((c) => c.dataset.field);
    expect(filterFields()).toEqual(['id', ...fields.slice(0, 10)]);
    expect(totalFields()).toEqual(['id', ...fields.slice(0, 10)]);
    await scrollTo(2000);
    expect(filterFields()).toEqual(['id', ...fields.slice(17, 30)]);
    expect(totalFields()).toEqual(['id', ...fields.slice(17, 30)]);
    expect(grid.element.querySelector<HTMLElement>('.mx-data-grid__total-row > [data-field="c20"]')!.textContent).toBe('Count: 50');
    const csv = await grid.exportCsv({ download: false, separator: ',' });
    expect(csv.split('\n')[0].split(',')).toHaveLength(COLUMNS + 1);
    const sheet = await grid.exportSheet({}, (s) => s);
    expect(sheet.columns).toHaveLength(COLUMNS + 1);
  });

  it('draws the items of the group rows and the group footers under the columns drawn only', async () => {
    const columns = makeColumns();
    columns.push({ field: 'kind', title: 'Kind', width: 100, groupIndex: 0, value: (r: Row) => (Number(r.id) % 2 ? 'odd' : 'even') } as GridColumnItem<Row>);
    const { grid, scrollTo } = make({
      columns,
      rows: makeRows(6),
      summary: { groupItems: ['c3', 'c25'].flatMap((column) => [{ column, summaryType: 'count' as const, alignByColumn: true }, { column, summaryType: 'count' as const, showInGroupFooter: true }]) },
    });
    await settle();
    const group = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__body > .mx-data-grid__group-row:not([hidden])')!;
    const footer = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__body > .mx-data-grid__group-footer:not([hidden])')!;
    const aligned = () => [...group().querySelectorAll<HTMLElement>('.mx-data-grid__summary-cell:not([hidden])')].map((c) => c.dataset.field);
    const footerFields = () => [...footer().children].map((c) => (c as HTMLElement).dataset.field);
    expect(aligned()).toEqual(['c3']);
    expect(footerFields()).toContain('c3');
    expect(footerFields()).not.toContain('c25');
    await scrollTo(2000);
    expect(aligned()).toEqual(['c25']);
    expect(footerFields()).toContain('c25');
    expect(footer().querySelector('[data-field="c25"]')!.textContent).toBe('Count: 3');
  });

  it('draws the columns that came into view once the sideways scrolling stops, with renderAsync', async () => {
    const { grid, scrollTo } = make({ settings: { columnRenderingMode: 'virtual', rowStatus: false, renderAsync: true, columnRenderingDelay: 400 } });
    await settle();
    await scrollTo(2000);
    expect(headerFields(grid)).not.toContain('c20');
    await new Promise((r) => setTimeout(r, 450));
    expect(headerFields(grid)).toContain('c20');
    // 'auto': at once while drawing them is quick.
    grid.settings.renderAsync = 'auto';
    await scrollTo(3000);
    expect(headerFields(grid)).toContain('c30');
  });

  it('still resizes, moves and fits columns, also those without cells', async () => {
    const { grid } = make();
    await settle();
    grid.columnOption('c35', 'width', 140);
    await settle();
    expect(grid.layout.columns.find((c) => c.field === 'c35')!.width).toBe(140);
    grid.columnOption('c35', 'visibleIndex', 2);
    await settle();
    expect(headerFields(grid)).toContain('c35');
    // Fitting every column measures those without cells too (jsdom measures nothing: the smallest width).
    grid.autoSizeColumns();
    await settle();
    expect(grid.layout.columns.find((c) => c.field === 'c39')!.width).toBe(48);
    expect(headerFields(grid).length).toBeLessThan(COLUMNS + 1);
  });
});
