import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridAction } from './grid-action';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; done: boolean };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', editable: false },
  { field: 'name', title: 'Name' },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, done: false }));

/** A pretend server of `size` rows that loads by blocks. */
class ServerAdapter extends data.DataAdapter<Row, number> {
  constructor(private readonly size: number) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: false, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    const skip = options.skip ?? 0;
    const n = Math.max(0, Math.min(options.take ?? this.size, this.size - skip));
    return { rows: makeRows(n, skip + 1), total: options.count ? this.size : undefined };
  }
}

/** Rows in an array whose removals the test counts. */
class TestRows extends data.ArrayAdapter<Row, number> {
  removed: number[] = [];

  protected override removeRow(key: number): Promise<void> {
    this.removed.push(key);
    return super.removeRow(key);
  }
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
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
  return grid;
}

const shown = (el: Element | null) => !!el && el.isConnected && (el as HTMLElement).style.display !== 'none' && !(el as HTMLElement).hidden && !el.closest('[hidden]');
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"]`) as HTMLElement;
const cell = (grid: DataGrid<any>, i: number, f: string) => rowEl(grid, i).querySelector(`[data-field="${f}"]`) as HTMLElement;
const rowIds = (grid: DataGrid<any>, i: number) => [...rowEl(grid, i).querySelectorAll<HTMLButtonElement>('.mx-data-grid__actions > button:not([hidden])')].map((b) => b.dataset.action ?? 'more');
const barButtons = (grid: DataGrid<any>, where: 'toolbar' | 'bar-actions') =>
  [...grid.element.querySelectorAll<HTMLElement>(`.mx-data-grid__${where} .mx-data-grid__bar-action`)].filter(shown);
const faceOf = (el: HTMLElement) => (el.classList.contains('mx-button__face') ? el : el.querySelector<HTMLElement>('.mx-button__face')!);
const columnsShown = (grid: DataGrid<any>) => (grid as any).model.columns.visible() as string[];
const click = (el: Element, init: MouseEventInit = {}) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const openMenu = () => document.querySelector('.mx-data-grid__menu:not([hidden]) [role="menu"]') as HTMLElement | null;
const menuTexts = () => [...(openMenu()?.querySelectorAll('[role^="menuitem"]') ?? [])].map((i) => i.textContent?.trim());

const approve = (): GridAction<Row> => ({ id: 'approve', text: 'Approve', visible: (row) => !row.done, onclick: (row) => (row.done = true) });
const print = (): GridAction<Row> => ({ id: 'print', text: 'Print', onclick: vi.fn() });

afterEach(() => {
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
});

describe('DataGrid actions in the bars', () => {
  it('puts the actions where the grid or the action says; the column shows only while one sits in the row', async () => {
    const a = approve();
    const p = { ...print(), location: 'row' as const };
    const grid = await make({ actions: [a, p], settings: { selection: 'multiple', actionsLocation: 'toolbar' } });
    expect(columnsShown(grid)).toContain('mx:actions');
    expect(rowIds(grid, 0)).toEqual(['print']);
    const only = await make({ actions: [approve()], settings: { selection: 'multiple', actionsLocation: 'toolbar' } });
    expect(columnsShown(only)).not.toContain('mx:actions');
    only.settings.actionsLocation = 'row';
    await settle();
    expect(columnsShown(only)).toContain('mx:actions');
    await grid.dispose();
    await only.dispose();
  });

  it('shows nothing without a target, the row\'s own set for one row, the common set with the count for several', async () => {
    const mail: GridAction<Row> = { id: 'mail', text: 'Mail', disabled: (row) => row.id === 2, onclick: vi.fn() };
    const grid = await make({ actions: [approve(), print(), mail, 'edit', { id: 'one', text: 'One', multiple: false, onclick: vi.fn() }], settings: { selection: 'multiple', actionsLocation: 'toolbar', editable: true } });
    const bar = () => grid.element.querySelector('.mx-data-grid__toolbar');
    expect(shown(bar())).toBe(false);
    expect(grid.barActions).toEqual([]);
    grid.selectedKeys = [1];
    await settle();
    expect(shown(bar())).toBe(true);
    expect(barButtons(grid, 'toolbar').map((b) => b.dataset.action)).toEqual(['approve', 'print', 'mail', 'edit', 'one']);
    expect(barButtons(grid, 'toolbar')[0].textContent).toBe('Approve');
    const rows = grid.dataSource.rows as Row[];
    rows[2].done = true;
    grid.selectedKeys = [1, 2, 3];
    await settle();
    expect((grid as any).model.state.announcement).toBe('Actions for 3 selected rows');
    // Approve is not visible for row 3; edit and One are for one row only.
    expect(grid.barActions.map((a) => a.action.id)).toEqual(['print', 'mail']);
    const [printButton, mailButton] = barButtons(grid, 'toolbar');
    expect(printButton.textContent).toBe('Print (3)');
    expect(faceOf(printButton).getAttribute('aria-label')).toBe('Print, 3 rows');
    expect(faceOf(mailButton).getAttribute('aria-disabled') === 'true' || (faceOf(mailButton) as HTMLButtonElement).disabled).toBe(true);
    const target = grid.element.querySelector('.mx-data-grid__bar-target')!;
    expect(target.textContent).toBe('Actions for 3 selected rows');
    expect(faceOf(printButton).getAttribute('aria-describedby')).toBe(target.id);
    grid.settings.actionsMultipleEnabled = 'any';
    await settle();
    expect(grid.barActions.find((a) => a.action.id === 'mail')).toMatchObject({ disabled: false, count: 2 });
    grid.settings.actionsShowCount = false;
    await settle();
    expect(barButtons(grid, 'toolbar')[0].textContent).toBe('Print');
    await grid.dispose();
  });

  it('acts on the active row with no selection, or as actionsTarget says', async () => {
    const grid = await make({ actions: [print()], settings: { actionsLocation: 'bottom' } });
    expect(grid.actionTargets.map((r) => r.id)).toEqual([1]);
    expect(barButtons(grid, 'bar-actions').map((b) => b.textContent)).toEqual(['Print']);
    const bar = grid.element.querySelector('.mx-data-grid__bar-actions')!;
    expect(bar.getAttribute('role')).toBe('toolbar');
    expect(bar.getAttribute('aria-label')).toBe('Actions for the current row');
    grid.focusCell(2, 'name');
    await settle();
    expect(grid.actionTargets.map((r) => r.id)).toEqual([3]);
    grid.settings.selection = 'multiple';
    await settle();
    expect(grid.actionTargets).toEqual([]);
    expect(barButtons(grid, 'bar-actions')).toEqual([]);
    grid.settings.actionsTarget = 'focused';
    await settle();
    expect(grid.actionTargets.map((r) => r.id)).toEqual([3]);
    await grid.dispose();
  });

  it('runs onclickMany once with every row, else onclick row by row with progress, Stop and the failures counted', async () => {
    const many = vi.fn();
    const ran: any[] = [];
    let release: (() => void)[] = [];
    const slow: GridAction<Row> = {
      id: 'slow',
      text: 'Slow',
      onclick: (row) =>
        new Promise<boolean>((resolve) => release.push(() => resolve(row.id !== 2))),
    };
    const grid = await make({
      actions: [{ id: 'many', text: 'Many', onclick: vi.fn(), onclickMany: many }, slow],
      settings: { selection: 'multiple', actionsLocation: 'toolbar' },
      onActionRan: (e) => ran.push(e),
    });
    grid.selectedKeys = [1, 2, 3];
    await settle();
    click(faceOf(barButtons(grid, 'toolbar')[0]));
    expect(many).toHaveBeenCalledTimes(1);
    expect(many.mock.calls[0][0].map((r: Row) => r.id)).toEqual([1, 2, 3]);
    expect(many.mock.calls[0][1]).toMatchObject({ location: 'toolbar' });
    await settle();
    expect(ran[0]).toMatchObject({ done: 3, failed: 0, canceled: false });

    click(faceOf(barButtons(grid, 'toolbar')[1]));
    await settle();
    const panel = grid.element.querySelector('.mx-data-grid__export-panel') as HTMLElement;
    expect(shown(panel)).toBe(true);
    expect(panel.textContent).toContain('Slow…');
    expect(grid.barActions.length).toBe(2);
    release.shift()!();
    await settle();
    release.shift()!();
    await settle();
    expect(panel.textContent).toContain('2 of 3 rows');
    release.shift()!();
    await settle();
    expect(shown(panel)).toBe(false);
    expect(ran[1]).toMatchObject({ done: 2, failed: 1, canceled: false });
    expect((grid as any).model.state.announcement).toBe('Slow: 2 of 3 done, 1 failed');

    // Stop leaves the rows not started.
    release = [];
    click(faceOf(barButtons(grid, 'toolbar')[1]));
    await settle();
    click(grid.element.querySelector('.mx-data-grid__export-cancel .mx-button__face, .mx-data-grid__export-cancel')!);
    release.shift()!();
    await settle();
    expect(ran[2]).toMatchObject({ done: 1, failed: 0, canceled: true });
    expect(release.length).toBe(0);
    await grid.dispose();
  });

  it('stops at the first failure with stopOnError, an action\'s own value winning', async () => {
    const seen: number[] = [];
    const fail: GridAction<Row> = {
      id: 'fail',
      text: 'Fail',
      onclick: (row) => {
        seen.push(row.id);
        if (row.id === 1) throw new Error('no');
      },
    };
    const ran: any[] = [];
    const grid = await make({ actions: [fail], settings: { selection: 'multiple', actionsLocation: 'toolbar', actionsStopOnError: true }, onActionRan: (e) => ran.push(e) });
    grid.selectedKeys = [1, 2];
    await settle();
    await grid.runAction('fail');
    expect(seen).toEqual([1]);
    expect(ran[0]).toMatchObject({ done: 0, failed: 1 });
    expect(ran[0].errors[0].error.message).toBe('no');
    fail.stopOnError = false;
    await grid.runAction('fail');
    expect(seen).toEqual([1, 1, 2]);
    expect(ran[1]).toMatchObject({ done: 1, failed: 1 });
    await grid.dispose();
  });

  it('over a server with "select all" shows only the actions that take the selection', async () => {
    const onSelection = vi.fn();
    const source = new data.DataSource<Row, number>({ adapter: new ServerAdapter(10_000), loadMode: 'blocks', pageSize: 50 });
    const grid = await make({
      dataSource: source,
      actions: [print(), { id: 'archive', text: 'Archive', onclick: vi.fn(), onclickSelection: onSelection }],
      settings: { selection: 'multiple', actionsLocation: 'toolbar' },
    });
    grid.selectedKeys = [1, 2];
    await settle();
    expect(grid.barActions.map((a) => a.action.id)).toEqual(['print', 'archive']);
    grid.selectAll();
    await settle();
    expect(grid.barActions.map((a) => [a.action.id, a.count])).toEqual([['archive', 10_000]]);
    expect(grid.actionTargets).toEqual([]);
    click(faceOf(barButtons(grid, 'toolbar')[0]));
    await settle();
    expect(onSelection).toHaveBeenCalledWith(expect.objectContaining({ all: true, except: [] }), expect.objectContaining({ location: 'toolbar' }));
    await grid.dispose();
  });

  it('deletes several rows with the ready action: batch marks all, wait sends each', async () => {
    const batch = await make({ actions: (_r, s) => (s.isRemoved ? ['restore'] : ['remove']), saveMode: 'batch', settings: { selection: 'multiple', actionsLocation: 'toolbar' } });
    batch.selectedKeys = [1, 2, 3];
    await settle();
    expect(batch.barActions.map((a) => a.action.id)).toEqual(['remove']);
    await batch.runAction('remove');
    await settle();
    expect(batch.changes.removed.length).toBe(3);
    expect(batch.barActions.map((a) => [a.action.id, a.count])).toEqual([['restore', 3]]);
    await batch.dispose();

    const adapter = new TestRows({ data: makeRows(5), key: 'id' });
    const wait = await make({ dataSource: new data.DataSource<Row, number>({ adapter }), actions: ['remove'], saveMode: 'wait', settings: { selection: 'multiple', actionsLocation: 'bottom' } });
    wait.selectedKeys = [2, 4];
    await settle();
    const result = await wait.runAction('remove');
    await settle();
    expect(result).toMatchObject({ done: 2, failed: 0 });
    expect(adapter.removed).toEqual([2, 4]);
    expect(wait.total).toBe(3);
    await wait.dispose();

    const background = new TestRows({ data: makeRows(5), key: 'id' });
    const bg = await make({ dataSource: new data.DataSource<Row, number>({ adapter: background }), actions: ['remove'], saveMode: 'background', settings: { selection: 'multiple', actionsLocation: 'bottom' } });
    bg.selectedKeys = [1, 5];
    await settle();
    await bg.runAction('remove');
    await settle();
    expect(background.removed).toEqual([1, 5]);
    await bg.dispose();
  });

  it('asks onActionRunning, which can cancel; runAction takes given rows', async () => {
    const p = print();
    const running: any[] = [];
    let cancel = true;
    const grid = await make({
      actions: [p],
      settings: { selection: 'multiple', actionsLocation: 'toolbar' },
      onActionRunning: (e) => {
        running.push(e);
        e.cancel = cancel;
      },
    });
    grid.selectedKeys = [1, 2];
    await settle();
    click(faceOf(barButtons(grid, 'toolbar')[0]));
    await settle();
    expect(p.onclick).not.toHaveBeenCalled();
    expect(running[0]).toMatchObject({ location: 'toolbar', selection: expect.objectContaining({ keys: [1, 2] }) });
    expect(running[0].rows.map((r: Row) => r.id)).toEqual([1, 2]);
    cancel = false;
    const rows = grid.dataSource.rows as Row[];
    const result = await grid.runAction('print', [rows[4]]);
    expect(result).toMatchObject({ done: 1, location: 'code' });
    expect(p.onclick).toHaveBeenCalledWith(rows[4], expect.objectContaining({ index: 4 }));
    expect(await grid.runAction('nothing')).toBeNull();
    await grid.dispose();
  });

  it('runs the actions of a row press through the same events', async () => {
    const p = print();
    const ran = vi.fn();
    const grid = await make({ actions: [p], onActionRan: ran });
    click(rowEl(grid, 1).querySelector('.mx-data-grid__action')!);
    expect(p.onclick).toHaveBeenCalledTimes(1);
    await settle();
    expect(ran).toHaveBeenCalledWith(expect.objectContaining({ location: 'row', done: 1 }));
    await grid.dispose();
  });

  it('puts the row actions into the row\'s context menu: its own, or the selection\'s common ones', async () => {
    const preparing = vi.fn();
    const a = approve();
    const grid = await make({
      actions: [a, print(), { id: 'hidden', text: 'Hidden', contextMenu: false, onclick: vi.fn() }],
      settings: { selection: 'multiple', actionsLocation: 'toolbar' },
      onContextMenuPreparing: preparing,
    });
    cell(grid, 3, 'name').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await settle();
    expect(menuTexts()).toEqual(['Approve', 'Print']);
    expect(grid.focusedRowIndex).toBe(3);
    expect(grid.selectedKeys).toEqual([]);
    expect(preparing.mock.calls[0][0].items.map((i: any) => i.text)).toEqual(['Approve', 'Print']);
    key(document.activeElement!, 'Escape');
    await settle();
    grid.selectedKeys = [1, 2, 3];
    await settle();
    cell(grid, 1, 'name').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await settle();
    expect(menuTexts()).toEqual(['Approve (3)', 'Print (3)']);
    const item = [...openMenu()!.querySelectorAll<HTMLElement>('[role^="menuitem"]')][0];
    click(item);
    await settle();
    expect((grid.dataSource.rows as Row[]).slice(0, 3).every((r) => r.done)).toBe(true);
    // Shift+F10 on the active cell; nothing left to show: no menu.
    grid.settings.actionsContextMenu = false;
    const c = cell(grid, 1, 'name');
    c.focus();
    expect(key(c, 'F10', { shiftKey: true })).toBe(true);
    await settle();
    expect(shown(openMenu()?.closest('.mx-data-grid__menu') ?? null)).toBe(false);
    grid.settings.actionsContextMenu = true;
    const opened = !key(c, 'F10', { shiftKey: true });
    await settle();
    expect(opened).toBe(true);
    expect(menuTexts()).toEqual(['Print (3)']);
    key(document.activeElement!, 'Escape');
    await settle();
    expect(document.activeElement).toBe(c);
    await grid.dispose();
  });

  it('shows only the "more" button in the menu display, an action\'s menu winning', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('mx-data-grid__action') ? 30 : 0;
    });
    const p = print();
    const grid = await make({ actions: [approve(), p, 'remove'], settings: { actionsDisplay: 'menu', actionsWidth: 140 } });
    expect(rowIds(grid, 0)).toEqual(['more']);
    const cols = (grid as any).model.columns;
    expect(cols.width('mx:actions')).toBe(30);
    const more = rowEl(grid, 0).querySelector<HTMLElement>('.mx-data-grid__more')!;
    expect(more.getAttribute('aria-haspopup')).toBe('menu');
    expect(more.getAttribute('aria-label')).toBe('More actions for row 1');
    click(more);
    await settle();
    expect(menuTexts()).toEqual(['Approve', 'Print', 'Delete']);
    click(openMenu()!.querySelectorAll<HTMLElement>('[role^="menuitem"]')[1]);
    await settle();
    expect(p.onclick).toHaveBeenCalledWith((grid.dataSource.rows as Row[])[0], expect.anything());
    // A button always: the column keeps its width.
    p.menu = 'never';
    grid.settings.actionsWidth = 141;
    await settle();
    expect(cols.width('mx:actions')).toBe(141);
    expect(rowIds(grid, 0)).toEqual(['print', 'more']);
    grid.settings.actionsDisplay = 'auto';
    p.menu = 'always';
    grid.settings.actionsWidth = 400;
    await settle();
    expect(rowIds(grid, 0)).toEqual(['approve', 'remove', 'more']);
    await grid.dispose();
  });

  it('holds the bar actions in one "Actions" menu button in the menu display', async () => {
    const grid = await make({ actions: [approve(), print()], settings: { selection: 'multiple', actionsLocation: 'bottom', actionsDisplay: 'menu' } });
    grid.selectedKeys = [1, 2];
    await settle();
    expect(barButtons(grid, 'bar-actions')).toEqual([]);
    const menuButton = grid.element.querySelector('.mx-data-grid__bar-actions .mx-data-grid__bar-menu') as HTMLElement;
    expect(shown(menuButton)).toBe(true);
    const face = faceOf(menuButton);
    expect(face.getAttribute('aria-label')).toBe('Actions for 2 selected rows');
    expect(face.getAttribute('aria-haspopup')).toBe('menu');
    click(face);
    await settle();
    const items = [...document.querySelectorAll('.mx-button__popup [role^="menuitem"], [role="menu"] [role^="menuitem"]')].map((i) => i.textContent?.trim());
    expect(items).toContain('Approve (2)');
    expect(items).toContain('Print (2)');
    await grid.dispose();
  });
});
