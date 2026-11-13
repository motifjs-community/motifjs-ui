import { reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { treeProblems } from '../../../tests/tree-check';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridColumnItem } from './grid-column-item';

type Row = { id: number; name: string; group: string };

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, group: i % 2 ? 'odd' : 'even' }));

async function settle() {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 2000) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(columns: GridColumnItem<Row>[], props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(45), mode: 'paged', pageSize: 20, label: 'Rows', ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

/** Buttons shown by a template, and how many of them sit outside the part they belong to. */
function placed(grid: DataGrid<any>, part: string) {
  expect(treeProblems(grid)).toEqual([]);
  const buttons = [...grid.element.querySelectorAll<HTMLElement>('[data-mark]')];
  return { shown: buttons.length, outside: buttons.filter((b) => !b.closest(part)).length };
}

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid template contents', () => {
  it('keeps a cell content shown or hidden by its own root in its cell, across pages', async () => {
    const columns: GridColumn<Row>[] = [
      { field: 'name', title: 'Name' },
      { field: 'id', title: '', cell: (x) => <Button text="Close" data-mark="" x-display={() => !!x.row && x.row.id !== 1} /> },
    ];
    const grid = await make(columns);
    expect(placed(grid, '.mx-data-grid__cell')).toEqual({ shown: 19, outside: 0 });
    grid.page = 1;
    await settle();
    expect(placed(grid, '.mx-data-grid__cell')).toEqual({ shown: 20, outside: 0 });
    grid.page = 0;
    await settle();
    expect(placed(grid, '.mx-data-grid__cell')).toEqual({ shown: 19, outside: 0 });
  });

  it('keeps a header content shown later by its own root in its header cell', async () => {
    const state = reactive({ on: false });
    const grid = await make([{ field: 'name', title: 'Name', headerCell: () => <Button text="Name" data-mark="" x-display={() => state.on} /> }]);
    expect(placed(grid, '.mx-data-grid__header-cell')).toEqual({ shown: 0, outside: 0 });
    state.on = true;
    await settle();
    expect(placed(grid, '.mx-data-grid__header-cell')).toEqual({ shown: 1, outside: 0 });
  });

  it('keeps a band header content shown later by its own root in its band cell', async () => {
    const state = reactive({ on: false });
    const grid = await make([
      { name: 'who', title: 'Who', headerCell: () => <Button text="Who" data-mark="" x-display={() => state.on} />, columns: [{ field: 'name', title: 'Name' }] },
    ]);
    expect(placed(grid, '.mx-data-grid__band')).toEqual({ shown: 0, outside: 0 });
    state.on = true;
    await settle();
    expect(placed(grid, '.mx-data-grid__band')).toEqual({ shown: 1, outside: 0 });
  });

  it('keeps a group content shown or hidden by its own root in its group row', async () => {
    const columns: GridColumn<Row>[] = [
      { field: 'name', title: 'Name' },
      { field: 'group', title: 'Group', groupIndex: 0, groupCell: (x) => <Button text="Group" data-mark="" x-display={() => x.value === 'odd'} /> },
    ];
    const grid = await make(columns, { pageSize: 50 });
    expect(placed(grid, '.mx-data-grid__group-row')).toEqual({ shown: 1, outside: 0 });
  });

  it('keeps every part in its parent: filter row, cell editor and edit form', async () => {
    const columns: GridColumn<Row>[] = [
      { field: 'name', title: 'Name' },
      { field: 'group', title: 'Group' },
    ];
    const grid = await make(columns, { settings: { filterRow: true, editable: true, editMode: 'cell' } });
    expect(treeProblems(grid)).toEqual([]);
    expect(grid.editCell(0, 'name')).toBe(true);
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__cell .mx-data-grid__editor')).not.toBeNull();
    expect(treeProblems(grid)).toEqual([]);
    grid.cancelEditData();
    grid.settings.editMode = 'form';
    await settle();
    expect(grid.editRow(1)).toBe(true);
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__form-cell > *')).not.toBeNull();
    expect(treeProblems(grid)).toEqual([]);
  });

  it('keeps a detail content shown later by its own root in its detail row', async () => {
    const grid = await make([{ field: 'name', title: 'Name' }], {
      masterDetail: { enabled: true, template: (x) => <Button text="Detail" data-mark="" x-display={() => x.row?.id === 1} /> },
    });
    grid.expandRow(1);
    grid.expandRow(2);
    await settle();
    expect(placed(grid, '.mx-data-grid__detail-content')).toEqual({ shown: 1, outside: 0 });
  });
});
