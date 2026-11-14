import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { DateBox } from '../datebox/DateBox';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import { builderFields } from './model/builder-fields';
import { parseDateText } from './model/parse-date-text';
import { ValueIntervals } from './model/ValueIntervals';

type Row = { id: number; at: Date | string | null; day: Date };

const makeRows = (): Row[] => [
  { id: 1, at: new Date(2026, 0, 5, 14, 30, 40), day: new Date(2026, 0, 5) },
  { id: 2, at: new Date(2026, 0, 5, 9, 0), day: new Date(2026, 0, 5) },
  { id: 3, at: new Date(2026, 0, 6, 8, 15), day: new Date(2026, 0, 6) },
  { id: 4, at: null, day: new Date(2026, 0, 7) },
];

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'No', type: 'number' },
  { field: 'at', title: 'At', type: 'datetime' },
  { field: 'day', title: 'Day', type: 'date' },
];

async function make(props: Partial<DataGridProps<Row>> = {}, rows = makeRows()) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, rowHeight: 36, locale: 'tr', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settled(8);
  return grid;
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const shownRows = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')));
const column = (grid: DataGrid<any>, field: string) => shownRows(grid).map((r) => r.querySelector(`[data-field="${field}"]`)!.textContent);
const ids = (grid: DataGrid<any>) => column(grid, 'id').map(Number);
const cellOf = (grid: DataGrid<any>, i: number, field: string) => shownRows(grid)[i].querySelector(`[data-field="${field}"]`) as HTMLElement;

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid datetime columns', () => {
  it('show the date and the time in the locale; a date column the day only', async () => {
    const grid = await make();
    expect(column(grid, 'at')).toEqual(['5.01.2026 14:30', '5.01.2026 09:00', '6.01.2026 08:15', '']);
    expect(column(grid, 'day')[0]).toBe('5.01.2026');
    await grid.dispose();
  });

  it('edit with a date and time box, the value kept in the kind it was', async () => {
    const rows = makeRows();
    rows[1].at = '2026-01-05T09:00:00';
    rows[2].at = '2026-01-06T05:15:00Z';
    const grid = await make({ settings: { editable: true } }, rows);
    const edit = (i: number) => {
      const cell = cellOf(grid, i, 'at');
      cell.focus();
      key(cell, 'Enter');
      return (grid as any).editor;
    };
    let ed = edit(0);
    expect(ed.kind).toBe('date');
    expect((ed.field as DateBox).type).toBe('datetime');
    (ed.field as DateBox).value = new Date(2026, 0, 5, 16, 45);
    expect(ed.read()).toEqual({ ok: true, value: new Date(2026, 0, 5, 16, 45) });
    (grid as any).cancelEdit();
    ed = edit(1);
    (ed.field as DateBox).value = new Date(2026, 0, 5, 10, 5);
    expect(ed.read()).toEqual({ ok: true, value: '2026-01-05T10:05:00' });
    (grid as any).cancelEdit();
    // A text with a zone comes back as a moment in UTC.
    ed = edit(2);
    const moment = new Date(Date.UTC(2026, 0, 6, 7, 30));
    (ed.field as DateBox).value = moment;
    expect(ed.read()).toEqual({ ok: true, value: moment.toISOString() });
    await grid.dispose();
  });

  it('read pasted text with its time, a 12-hour time too', async () => {
    const grid = await make();
    const model = (grid as any).model;
    const col = model.columns.get('at');
    expect(model.formatter.parse(col, '5.01.2026 14:30', new Date())).toEqual({ ok: true, value: new Date(2026, 0, 5, 14, 30) });
    expect(model.formatter.parse(col, '2026-01-05 07:05', '2026-01-01T00:00:00')).toEqual({ ok: true, value: '2026-01-05T07:05:00' });
    expect(parseDateText('1/5/26, 2:30 PM', 'en-US')).toEqual(new Date(2026, 0, 5, 14, 30));
    expect(parseDateText('1/5/26, 12:15 AM', 'en-US')).toEqual(new Date(2026, 0, 5, 0, 15));
    await grid.dispose();
  });

  it('filter in the filter row to the minute, with a date and time box', async () => {
    const grid = await make({ settings: { filterRow: true, filterDelay: 0 } });
    const box = (grid as any).filterRow.filterCells.get('at').editors[0] as DateBox;
    expect(box.type).toBe('datetime');
    grid.filters = { at: { op: '=', value: new Date(2026, 0, 5, 14, 30) } };
    await settled(8);
    expect(ids(grid)).toEqual([1]);
    grid.filters = { at: { op: '>', value: new Date(2026, 0, 5, 9, 0) } };
    await settled(8);
    expect(ids(grid)).toEqual([1, 3]);
    grid.filters = { at: { op: 'between', value: new Date(2026, 0, 5, 9, 0), value2: new Date(2026, 0, 5, 14, 30) } };
    await settled(8);
    expect(ids(grid)).toEqual([1, 2]);
    // A date column still filters by the day.
    grid.filters = { day: { op: '=', value: new Date(2026, 0, 5, 18, 0) } };
    await settled(8);
    expect(ids(grid)).toEqual([1, 2]);
    await grid.dispose();
  });

  it('search a day, or a minute when a time is written', async () => {
    // Only the date and time column: a date column would find the whole day of the same text.
    const grid = await make({ columns: columns.slice(0, 2), settings: { searchPanel: true, searchDelay: 0 } });
    grid.searchByText('5.01.2026');
    await settled(8);
    expect(ids(grid)).toEqual([1, 2]);
    grid.searchByText('5.01.2026 14:30');
    await settled(8);
    expect(ids(grid)).toEqual([1]);
    await grid.dispose();
  });

  it('list the header filter down to the hour, the filter builder as date and time, the export with the time', async () => {
    expect(ValueIntervals.of('datetime', undefined, 'day')!.levels).toEqual(['year', 'month', 'day', 'hour']);
    expect(ValueIntervals.of('datetime', 'minute', 'day')!.levels).toEqual(['year', 'month', 'day', 'hour', 'minute']);
    expect(ValueIntervals.of('datetime', undefined, null)).toBeNull();
    expect(ValueIntervals.of('date', undefined, 'day')!.levels).toEqual(['year', 'month', 'day']);
    const grid = await make();
    const fields = builderFields((grid as any).model);
    expect(fields.find((f) => f.dataField === 'at')!.dataType).toBe('datetime');
    const shown = await grid.exportRows();
    expect(shown[0].at).toBe('5.01.2026 14:30');
    const raw = await grid.exportRows({ values: 'raw' });
    expect(raw[0].at).toEqual(new Date(2026, 0, 5, 14, 30, 40));
    const dateFormat = await grid.exportSheet({}, (sheet) => sheet.columns.find((c) => c.field === 'at')!.dateFormat);
    expect(dateFormat).toEqual({ dateStyle: 'short', timeStyle: 'short' });
    expect(data.isEmpty(raw[3].at)).toBe(true);
    await grid.dispose();
  });
});
