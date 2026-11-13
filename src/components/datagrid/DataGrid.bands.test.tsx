import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumnItem } from './grid-column-item';

type Row = { id: number; first: string; last: string; email: string; phone: string; city: string; amount: number };

const rows = (): Row[] =>
  Array.from({ length: 12 }, (_, i) => ({ id: i + 1, first: `First ${i + 1}`, last: `Last ${i + 1}`, email: `p${i + 1}@mail.test`, phone: `555-${i}`, city: ['Ankara', 'Bursa'][i % 2], amount: i * 10 }));

const columns = (): GridColumnItem<Row>[] => [
  { field: 'id', title: 'Id', width: 60 },
  {
    name: 'person',
    title: 'Person',
    columns: [
      { field: 'first', title: 'First', width: 100 },
      { field: 'last', title: 'Last', width: 100 },
      { name: 'contact', title: 'Contact', columns: [{ field: 'email', title: 'Email', width: 160 }, { field: 'phone', title: 'Phone', width: 100 }] },
    ],
  },
  { field: 'city', title: 'City', width: 100 },
  { field: 'amount', title: 'Amount', type: 'number', width: 90 },
];

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rows: rows(), rowKey: 'id', columns: columns(), rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return grid;
}

const head = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__head')!;
const bandRows = (grid: DataGrid<any>) => Array.from(head(grid).querySelectorAll<HTMLElement>('.mx-data-grid__row--band'));
const band = (grid: DataGrid<any>, id: string) => head(grid).querySelector<HTMLElement>(`[data-band="${id}"]`);
const headerRow = (grid: DataGrid<any>) => head(grid).querySelector<HTMLElement>('.mx-data-grid__row--header:not(.mx-data-grid__row--band)')!;
const headerOf = (grid: DataGrid<any>, field: string) => headerRow(grid).querySelector<HTMLElement>(`[data-field="${field}"]`)!;
const order = (grid: DataGrid<any>) => grid.getVisibleColumns().map((c) => c.field);
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('band headers', () => {
  it('lays a row per level over the header, each band over its columns, with the ARIA of a multi-row header', async () => {
    const grid = make();
    await settle();
    const levels = bandRows(grid);
    expect(levels).toHaveLength(2);
    expect(levels.map((r) => r.getAttribute('aria-rowindex'))).toEqual(['1', '2']);
    expect(headerRow(grid).getAttribute('aria-rowindex')).toBe('3');
    const person = band(grid, 'person')!;
    expect(person.parentElement).toBe(levels[0]);
    expect(person.getAttribute('role')).toBe('columnheader');
    expect(person.textContent).toBe('Person');
    expect(person.getAttribute('aria-colindex')).toBe('2');
    expect(person.getAttribute('aria-colspan')).toBe('4');
    expect(person.style.gridColumn).toBe('2 / span 4');
    const contact = band(grid, 'contact')!;
    expect(contact.parentElement).toBe(levels[1]);
    expect(contact.getAttribute('aria-colindex')).toBe('4');
    expect(contact.getAttribute('aria-colspan')).toBe('2');
    // The leaves keep their own column index; the first row comes after the three header rows.
    expect(headerOf(grid, 'email').getAttribute('aria-colindex')).toBe('4');
    const first = grid.element.querySelector<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')!;
    expect(first.getAttribute('aria-rowindex')).toBe('4');
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-rowcount')).toBe(String(12 + 3));
  });

  it('a band hides with all its columns, and shrinks to those that show; its own `hidden` hides them all', async () => {
    const grid = make();
    await settle();
    grid.columnOption('email', 'visible', false);
    grid.columnOption('phone', 'visible', false);
    await settle();
    expect(band(grid, 'contact')).toBeNull();
    expect(bandRows(grid)).toHaveLength(1);
    expect(headerRow(grid).getAttribute('aria-rowindex')).toBe('2');
    expect(band(grid, 'person')!.getAttribute('aria-colspan')).toBe('2');
    grid.columnOption('person', 'visible', false);
    await settle();
    expect(bandRows(grid)).toHaveLength(0);
    expect(order(grid)).toEqual(['id', 'city', 'amount']);
    grid.columnOption('person', 'visible', true);
    grid.columnOption('email', 'visible', true);
    await settle();
    expect(order(grid)).toEqual(['id', 'first', 'last', 'email', 'city', 'amount']);
    expect(band(grid, 'contact')!.getAttribute('aria-colspan')).toBe('1');
  });

  it('moves a column only inside its band, and a band with all its columns', async () => {
    const grid = make();
    await settle();
    const cols = (grid as any).model.columns;
    expect(cols.siblings('first')).toEqual(['first', 'last', 'contact']);
    expect(cols.move('first', 9)).toBe(true);
    expect(order(grid)).toEqual(['id', 'last', 'email', 'phone', 'first', 'city', 'amount']);
    expect(cols.move('email', 1)).toBe(true);
    expect(order(grid)).toEqual(['id', 'last', 'phone', 'email', 'first', 'city', 'amount']);
    // The band moves among the top columns; `visibleIndex` counts the columns and bands beside it.
    grid.columnOption('person', 'visibleIndex', 2);
    expect(order(grid)).toEqual(['id', 'city', 'last', 'phone', 'email', 'first', 'amount']);
    expect(grid.columnOption('person', 'visibleIndex')).toBe(2);
    expect(grid.columnOption('first', 'visibleIndex')).toBe(2);
    grid.columnOption('first', 'visibleIndex', 0);
    expect(order(grid)).toEqual(['id', 'city', 'first', 'last', 'phone', 'email', 'amount']);
    // A band that cannot move keeps its place, and so do the columns around it.
    grid.columnSettings('person').movable = false;
    expect(cols.move('city', 3)).toBe(false);
    await settle();
    expect(band(grid, 'person')!.style.gridColumn).toBe('3 / span 4');
  });

  it('moves a column with the keyboard inside its band, and a band from its own menu', async () => {
    const grid = make();
    await settle();
    (grid as any).startAdjust('move', 'last');
    const cell = headerOf(grid, 'last');
    key(cell, 'ArrowRight');
    key(cell, 'ArrowRight');
    key(cell, 'ArrowRight');
    key(cell, 'Enter');
    expect(order(grid)).toEqual(['id', 'first', 'email', 'phone', 'last', 'city', 'amount']);
    (grid as any).startAdjust('move', 'person');
    key(band(grid, 'person')!, 'ArrowRight');
    key(band(grid, 'person')!, 'Enter');
    expect(order(grid)).toEqual(['id', 'city', 'first', 'email', 'phone', 'last', 'amount']);
  });

  it('resizes a column under a band; the band follows its columns', async () => {
    const grid = make();
    await settle();
    grid.columnOption('email', 'width', 220);
    await settle();
    const vp = grid.element.querySelector<HTMLElement>('.mx-data-grid__viewport')!;
    expect(vp.style.getPropertyValue('--_columns')).toBe('60px 100px 100px 220px 100px 100px 90px');
    expect(grid.layout.columns.find((c) => c.field === 'email')!.width).toBe(220);
    expect(band(grid, 'contact')!.getAttribute('aria-colspan')).toBe('2');
  });

  it('pins a band as a whole: pinning one of its columns pins the band at the top', async () => {
    const grid = make();
    await settle();
    grid.columnOption('email', 'sticky', 'start');
    expect(grid.columnOption('person', 'sticky')).toBe('start');
    expect(order(grid)).toEqual(['first', 'last', 'email', 'phone', 'id', 'city', 'amount']);
    expect(grid.layout.bands).toContainEqual({ name: 'person', hidden: false, sticky: 'start' });
    expect(grid.layout.columns.find((c) => c.field === 'email')!.sticky).toBeNull();
    grid.columnOption('person', 'sticky', null);
    expect(order(grid)).toEqual(['id', 'first', 'last', 'email', 'phone', 'city', 'amount']);
  });

  it('keeps an empty piece over a pinned column no band covers, so the band rows scroll under it', async () => {
    const grid = make({ settings: { selection: 'multiple' } });
    grid.columnOption('id', 'sticky', 'start');
    await settle();
    const [top] = bandRows(grid);
    const pieces = Array.from(top.querySelectorAll<HTMLElement>('.mx-data-grid__band-filler'));
    expect(pieces.map((p) => p.dataset.field)).toEqual(['mx:select', 'id']);
    expect(pieces.every((p) => p.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(band(grid, 'person')!.getAttribute('aria-colindex')).toBe('3');
  });

  it('a band header is not sortable; Up goes from a column to its band, Down back, Left and Right along the bands', async () => {
    const grid = make({ columns: [...columns(), { name: 'more', title: 'More', columns: [{ field: 'note' as keyof Row & string, title: 'Note' }] }] });
    await settle();
    band(grid, 'person')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(grid.sort).toEqual([]);
    grid.focusCell(-1, 'email');
    key(document.activeElement!, 'ArrowUp');
    expect(grid.activeField).toBe('contact');
    expect(document.activeElement).toBe(band(grid, 'contact'));
    key(document.activeElement!, 'ArrowUp');
    expect(grid.activeField).toBe('person');
    key(document.activeElement!, 'Enter');
    expect(grid.sort).toEqual([]);
    key(document.activeElement!, 'ArrowRight');
    expect(grid.activeField).toBe('more');
    key(document.activeElement!, 'ArrowLeft');
    key(document.activeElement!, 'ArrowDown');
    expect(grid.activeField).toBe('first');
    expect(document.activeElement).toBe(headerOf(grid, 'first'));
  });

  it("opens a band's menu with Alt+Down: pin, move and hide the band", async () => {
    const grid = make();
    await settle();
    grid.focusCell(-1, 'person');
    key(document.activeElement!, 'ArrowDown', { altKey: true });
    const menu = (grid as any).menu;
    expect(menu.opened).toBe(true);
    const texts = Array.from(menu.list.element.querySelectorAll('[role^="menuitem"]')).map((el: any) => el.textContent.trim());
    expect(texts).toEqual(['Pin to start', 'Pin to end', 'Unpin', 'Move', 'Hide band', 'Columns', 'Reset layout']);
    expect(texts).not.toContain('Sort ascending');
  });

  it('the column chooser shows the columns as a tree under their bands, and unchecking a band hides its columns', async () => {
    const grid = make({ settings: { columnChooserButton: true } });
    await settle();
    const changed = vi.fn();
    grid.onLayoutChange(changed);
    grid.showColumnChooser();
    const tree = (grid as any).menu.tree;
    expect(tree).not.toBeNull();
    const items = Array.from(tree.treePart.element.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    const text = (el: HTMLElement) => el.querySelector('.mx-tree-view__text')!.textContent;
    expect(items.map(text)).toEqual(['Id', 'Person', 'First', 'Last', 'Contact', 'Email', 'Phone', 'City', 'Amount']);
    const contact = items.find((el) => text(el) === 'Contact')!;
    expect(contact.querySelector('[role="group"] [role="treeitem"]')).not.toBeNull();
    contact.querySelector<HTMLElement>(':scope > .mx-tree-view__row > .mx-tree-view__check')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(order(grid)).toEqual(['id', 'first', 'last', 'city', 'amount']);
    expect(changed).toHaveBeenCalled();
    await settle();
    expect(band(grid, 'contact')).toBeNull();
  });

  it('keeps the order, widths and hidden columns of the leaves and the bands in the layout, and puts a band back together', async () => {
    const grid = make({ layoutKey: 'bands' });
    await settle();
    grid.columnOption('person', 'visibleIndex', 2);
    grid.columnOption('phone', 'visible', false);
    grid.columnOption('contact', 'sticky', 'end');
    const layout = grid.layout;
    expect(layout.columns.map((c) => c.field)).toEqual(['id', 'city', 'first', 'last', 'email', 'phone', 'amount']);
    expect(layout.bands).toEqual([
      { name: 'person', hidden: false, sticky: 'end' },
      { name: 'contact', hidden: false, sticky: null },
    ]);
    void grid.dispose();
    const again = make({ layoutKey: 'bands' });
    await settle();
    expect(order(again)).toEqual(['id', 'city', 'amount', 'first', 'last', 'email']);
    expect(again.columnOption('person', 'sticky')).toBe('end');
    // A layout that tears a band apart: its columns come together where its first one is, in the order they come.
    again.layout = { ...again.layout, columns: ['first', 'id', 'email', 'city', 'last', 'phone', 'amount'].map((field) => ({ field, width: 100, flex: 0, hidden: false, sticky: null })), bands: [] };
    expect(again.layout.columns.map((c) => c.field)).toEqual(['first', 'email', 'phone', 'last', 'id', 'city', 'amount']);
    again.resetLayout();
    expect(order(again)).toEqual(['id', 'first', 'last', 'email', 'phone', 'city', 'amount']);
  });

  it('takes bands given flat: `isBand` and the columns that name it in `ownerBand`', async () => {
    const grid = make({
      columns: [
        { field: 'id', title: 'Id' },
        { field: 'email', title: 'Email', ownerBand: 'contact' },
        { isBand: true, name: 'contact', title: 'Contact' },
        { field: 'city', title: 'City' },
        { field: 'phone', title: 'Phone', ownerBand: 2 },
      ],
    });
    await settle();
    expect(order(grid)).toEqual(['id', 'email', 'phone', 'city']);
    expect(band(grid, 'contact')!.getAttribute('aria-colspan')).toBe('2');
  });

  it('exports the band rows above the titles: CSV lines, and sheet rows with the cells to merge', async () => {
    const grid = make();
    await settle();
    const csv = await grid.exportCsv({ download: false, separator: ',', bom: false });
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe(',Person,,,,,');
    expect(lines[1]).toBe(',,,Contact,,,');
    expect(lines[2]).toBe('Id,First,Last,Email,Phone,City,Amount');
    const sheet = await grid.exportSheet({ loadPanel: false }, (s) => s);
    expect(sheet.headerRows).toBe(3);
    expect(sheet.rows.slice(0, 3).map((r) => r.cells.map((c) => c.value))).toEqual([
      ['Id', 'Person', null, null, null, 'City', 'Amount'],
      [null, 'First', 'Last', 'Contact', null, null, null],
      [null, null, null, 'Email', 'Phone', null, null],
    ]);
    expect(sheet.merges).toEqual(
      expect.arrayContaining([
        { row: 0, column: 1, rows: 1, columns: 4 },
        { row: 1, column: 3, rows: 1, columns: 2 },
        { row: 0, column: 0, rows: 3, columns: 1 },
        { row: 1, column: 1, rows: 2, columns: 1 },
      ]),
    );
    expect(sheet.merges).toHaveLength(7);
    expect(sheet.rows[0].cells[1].gridCell.band?.title).toBe('Person');
  });
});
