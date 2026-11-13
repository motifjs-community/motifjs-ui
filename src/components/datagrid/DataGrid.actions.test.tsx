import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mount, settled } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
import { uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridAction } from './grid-action';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; done: boolean };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', editable: false },
  { field: 'name', title: 'Name' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, done: i % 2 === 1 }));

async function settle() {
  await settled(4);
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>>, rows: Row[] = makeRows(5)) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  // The buttons' widths are read with the window's next measuring round; the rows fit them after it.
  await whenMeasured(grid);
  await settle();
  return grid;
}

const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"]`) as HTMLElement;
const buttons = (grid: DataGrid<any>, i: number) => [...rowEl(grid, i).querySelectorAll<HTMLButtonElement>('.mx-data-grid__actions > button:not([hidden])')];
const ids = (grid: DataGrid<any>, i: number) => buttons(grid, i).map((b) => b.dataset.action ?? 'more');
/** Columns in display order, the grid's own included. */
const visibleHeaders = (grid: DataGrid<any>) => (grid as any).model.columns.visible() as string[];
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

const approve: GridAction<Row> = { id: 'approve', text: 'Approve', visible: (row) => !row.done, onclick: (row) => (row.done = true) };
const print: GridAction<Row> = { id: 'print', text: 'Print', onclick: vi.fn() };
const mail: GridAction<Row> = { id: 'mail', text: 'Mail', disabled: true, onclick: vi.fn() };

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
  vi.restoreAllMocks();
});

describe('DataGrid row actions', () => {
  it.each(dataKinds)('draws each row its own buttons, asks again on refreshActions(), and names the ready ones (%s data)', async (_, kind) => {
    const rows = kind(makeRows(4));
    const asked: Row[] = [];
    const grid = await make(
      {
        actions: (row, s) => {
          asked.push(row);
          return s.isRemoved ? ['restore'] : [approve, print, 'remove'];
        },
      } as Partial<DataGridProps<Row>>,
      rows,
    );
    expect(asked).toContain(rows[0]);
    expect(visibleHeaders(grid).at(-1)).toBe('mx:actions');
    expect(ids(grid, 0)).toEqual(['approve', 'print', 'remove']);
    expect(ids(grid, 1)).toEqual(['print', 'remove']);
    const remove = buttons(grid, 0)[2];
    expect(remove.getAttribute('aria-label')).toBe('Delete');
    expect(remove.dataset.hint).toBe('Delete');
    expect(remove.dataset.tone).toBe('danger');
    expect(remove.querySelector('.mx-button__icon')).not.toBeNull();
    expect(buttons(grid, 0)[0].textContent).toBe('Approve');
    buttons(grid, 0)[0].click();
    await settle();
    expect(rows[0].done).toBe(true);
    // The row is read as it is: the change shows once the actions are asked again.
    expect(ids(grid, 0)).toEqual(['approve', 'print', 'remove']);
    grid.refreshActions();
    await settle();
    expect(ids(grid, 0)).toEqual(['print', 'remove']);
    buttons(grid, 1)[0].click();
    expect(print.onclick).toHaveBeenCalledWith(rows[1], expect.objectContaining({ index: 1, isNew: false, isRemoved: false }));
    expect(vi.mocked(print.onclick!).mock.calls.at(-1)![0]).toBe(rows[1]);
    await grid.dispose();
  });

  it('puts what does not fit into the "more" menu, in order, disabled ones dimmed', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('mx-data-grid__action') ? 40 : 0;
    });
    const grid = await make({ actions: [print, approve, mail, 'remove'] as never, settings: { actionsWidth: 140 } });
    expect(ids(grid, 0)).toEqual(['print', 'approve', 'more']);
    const more = buttons(grid, 0).at(-1)!;
    expect(more.getAttribute('aria-haspopup')).toBe('menu');
    expect(more.getAttribute('aria-label')).toBe('More actions for row 1');
    expect(more.dataset.hint).toBe('More actions');
    more.click();
    await settle();
    const menu = grid.element.querySelector('.mx-data-grid__menu:not([hidden]) [role="menu"]')!;
    const items = [...menu.querySelectorAll('[role^="menuitem"]')];
    expect(items.map((i) => i.textContent)).toEqual(['Mail', 'Delete']);
    expect(items[0].getAttribute('aria-disabled')).toBe('true');
    grid.settings.actionsWidth = 400;
    await settle();
    expect(ids(grid, 0)).toEqual(['print', 'approve', 'mail', 'remove']);
    await grid.dispose();
  });

  it('runs the ready actions: delete and restore in batch mode, edit opens the editor, cancel drops edits', async () => {
    const rows = makeRows(3);
    const grid = await make({ actions: (_row, s) => (s.isRemoved ? ['restore'] : ['edit', 'save', 'cancel', 'remove']), saveMode: 'batch', settings: { editable: true } }, rows);
    expect(ids(grid, 0)).toEqual(['edit', 'remove']);
    buttons(grid, 0)[1].click();
    await settle();
    expect(rowEl(grid, 0).dataset.status).toBe('removed');
    expect(ids(grid, 0)).toEqual(['restore']);
    buttons(grid, 0)[0].click();
    await settle();
    expect(rowEl(grid, 0).dataset.status).toBeUndefined();
    buttons(grid, 1)[0].click();
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__editor')).not.toBeNull();
    expect(grid.activeField).toBe('name');
    const input = grid.element.querySelector('.mx-data-grid__editor input') as HTMLInputElement;
    input.value = 'Changed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    key(input, 'Enter');
    await settle();
    expect(ids(grid, 1)).toEqual(['save', 'cancel', 'remove']);
    buttons(grid, 1)[1].click();
    await settle();
    expect(rows[1].name).toBe('Name 2');
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
  });

  it('moves the column to the start or the end, pinned or not, and turns it off, live', async () => {
    const grid = await make({ actions: ['remove'], settings: { editable: true } });
    const cols = (grid as any).model.columns;
    expect(cols.sideOf('mx:actions')).toBe('end');
    grid.settings.actionsPosition = 'start';
    await settle();
    expect(visibleHeaders(grid).slice(0, 2)).toEqual(['mx:status', 'mx:actions']);
    grid.settings.actionsSticky = false;
    await settle();
    expect(cols.sideOf('mx:actions')).toBeNull();
    expect(visibleHeaders(grid)[1]).toBe('mx:actions');
    grid.settings.actionsColumn = false;
    await settle();
    expect(visibleHeaders(grid)).not.toContain('mx:actions');
    await grid.dispose();
  });

  it('moves between the buttons with Left and Right, and on to the cells at the ends', async () => {
    const grid = await make({ actions: [print, 'remove'] as never });
    const [first, second] = buttons(grid, 0);
    first.focus();
    expect(grid.activeField).toBe('mx:actions');
    key(first, 'ArrowRight');
    expect(document.activeElement).toBe(second);
    key(second, 'ArrowRight');
    expect(document.activeElement).toBe(second);
    key(second, 'ArrowLeft');
    key(first, 'ArrowLeft');
    await settle();
    expect(grid.activeField).toBe('name');
    key(document.activeElement!, 'ArrowRight');
    await settle();
    expect(document.activeElement).toBe(first);
    expect(first.getAttribute('tabindex')).toBe('0');
    await grid.dispose();
  });

  it('writes its texts from uiLocale', async () => {
    await uiLocale.use('tr');
    const grid = await make({ actions: ['remove'] });
    expect(buttons(grid, 0)[0].getAttribute('aria-label')).toBe('Sil');
    expect(grid.element.querySelector('[role="columnheader"][data-field="mx:actions"]')!.textContent).toContain('İşlemler');
    // Another text is written on the same button, its icon left as it is.
    const button = buttons(grid, 0)[0];
    const icon = button.querySelector('.mx-button__icon > *');
    await uiLocale.use('en');
    await settle();
    expect(buttons(grid, 0)[0]).toBe(button);
    expect(button.getAttribute('aria-label')).toBe('Delete');
    expect(button.querySelector('.mx-button__icon > *')).toBe(icon);
    await grid.dispose();
  });
});
