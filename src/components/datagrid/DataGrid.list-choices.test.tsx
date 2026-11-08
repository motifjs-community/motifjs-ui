import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { ListOption } from './list-option';
import { builderFields } from './model/builder-fields';

type Row = { id: number; city: number };

const CITIES: ListOption[] = [
  { value: 6, label: 'Ankara' },
  { value: 16, label: 'Bursa' },
  { value: 35, label: 'İzmir' },
];

async function settle() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0));
}

/** A list column whose choices come from a pretend server, counting how often it is asked and with which row. */
function citiesFromServer() {
  const asked: (Row | null)[] = [];
  let answer!: () => void;
  const options = (row: Row | null) => {
    asked.push(row);
    return new Promise<readonly ListOption[]>((done) => (answer = () => done(CITIES)));
  };
  return { asked, options, answer: () => answer() };
}

async function make(options: GridColumn<Row>['options'], props: Partial<DataGridProps<Row>> = {}) {
  const columns: GridColumn<Row>[] = [
    { field: 'id', title: 'Id', type: 'number' },
    { field: 'city', title: 'City', type: 'list', options },
  ];
  const rows: Row[] = [
    { id: 1, city: 6 },
    { id: 2, city: 35 },
    { id: 3, city: 16 },
    { id: 4, city: 6 },
  ];
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, settings: { filterRow: true, filterDelay: 0, searchPanel: true, searchDelay: 0 }, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settle();
  return grid;
}

const cityTexts = (grid: DataGrid<Row>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body [data-field="city"]')).map((c) => c.textContent);
const shownIds = (grid: DataGrid<Row>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body .mx-data-grid__row:not([hidden]) [data-field="id"]')).map((c) => Number(c.textContent));

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid list columns with choices from a function', () => {
  it('writes the labels in the cells once the choices arrive, asking once with no row', async () => {
    const server = citiesFromServer();
    const grid = await make(server.options);
    expect(cityTexts(grid)).toEqual(['6', '35', '16', '6']);
    server.answer();
    await settle();
    expect(cityTexts(grid)).toEqual(['Ankara', 'İzmir', 'Bursa', 'Ankara']);
    expect(server.asked).toEqual([null]);
    grid.refresh();
    await settle();
    expect(server.asked).toEqual([null, null]);
    await grid.dispose();
  });

  it('lists the choices in the filter row, saying it loads until they are there, and filters by the one chosen', async () => {
    const server = citiesFromServer();
    const grid = await make(server.options);
    const list = (grid as any).filterRow.filterCells.get('city').editors[0];
    list.open();
    await settle();
    const empty = () => document.querySelector('.mx-popup:not([hidden]) .mx-list__empty, .mx-list__empty')?.textContent;
    expect(empty()).toBe('Loading…');
    server.answer();
    await settle();
    const options = Array.from(document.querySelectorAll<HTMLElement>('.mx-list [role="option"]')).map((o) => o.textContent);
    expect(options).toEqual(['(All)', 'Ankara', 'Bursa', 'İzmir']);
    grid.filters = { city: { value: 6 } };
    await settle();
    expect(shownIds(grid)).toEqual([1, 4]);
    await grid.dispose();
  });

  it('searches the labels, reads pasted labels and offers the choices in the filter builder', async () => {
    const grid = await make(() => Promise.resolve(CITIES));
    await settle();
    grid.searchByText('bur');
    await settle();
    expect(shownIds(grid)).toEqual([3]);
    const model = (grid as any).model;
    const col = model.columns.get('city');
    expect(model.formatter.parse(col, 'Bursa', null)).toEqual({ ok: true, value: 16 });
    const field = builderFields(model).find((f) => f.dataField === 'city')!;
    const source = field.lookup!.dataSource as data.DataSource<{ value: unknown; text: string }, unknown>;
    await source.load();
    expect(source.rows.map((r) => r.text)).toEqual(['Ankara', 'Bursa', 'İzmir']);
    await grid.dispose();
  });

  it('says the filter row list could not be read when the function fails, and asks again on the next opening', async () => {
    let calls = 0;
    const grid = await make(() => {
      calls++;
      return calls === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(CITIES);
    });
    await settle();
    const list = (grid as any).filterRow.filterCells.get('city').editors[0];
    list.open();
    await settle();
    expect(document.querySelector('.mx-list__empty')?.textContent).not.toBe('Loading…');
    list.close();
    list.open();
    await settle();
    expect(Array.from(document.querySelectorAll<HTMLElement>('.mx-list [role="option"]')).map((o) => o.textContent)).toEqual(['(All)', 'Ankara', 'Bursa', 'İzmir']);
    await grid.dispose();
  });
});
