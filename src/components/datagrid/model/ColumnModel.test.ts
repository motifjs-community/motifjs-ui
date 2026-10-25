import { describe, expect, it } from 'vitest';
import type { GridColumn } from '../grid-column';
import type { GridSettings } from '../grid-settings';
import { ColumnModel } from './ColumnModel';
import { DEFAULT_SETTINGS } from './default-settings';
import { Switches } from './Switches';

const defs: GridColumn[] = [
  { field: 'id', title: 'Id', width: 80, sticky: 'start' },
  { field: 'name', title: 'Name', width: 200, flex: 1 },
  { field: 'city', title: 'City' },
  { field: 'note', title: 'Note', hidden: true },
  { field: 'amount', title: 'Amount', type: 'number', width: 120, sticky: 'end' },
];

const settingsOf = (given: object = {}) => new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS, given);

describe('ColumnModel', () => {
  it('orders zones: start, free, end; skips hidden columns', () => {
    const cols = new ColumnModel(defs);
    expect(cols.visible()).toEqual(['id', 'name', 'city', 'amount']);
    cols.setSticky('city', 'start');
    expect(cols.visible()).toEqual(['id', 'city', 'name', 'amount']);
  });

  it('builds the template; sticky columns never flex', () => {
    const cols = new ColumnModel(defs);
    expect(cols.template(cols.visible())).toBe('80px minmax(200px, 1fr) 140px 120px');
  });

  it('computes sticky offsets from both edges', () => {
    const cols = new ColumnModel(defs);
    cols.setSticky('city', 'start');
    const off = cols.stickyOffsets(cols.visible());
    expect(off.get('id')).toEqual({ side: 'start', offset: 0, edge: false });
    expect(off.get('city')).toEqual({ side: 'start', offset: 80, edge: true });
    expect(off.get('amount')).toEqual({ side: 'end', offset: 0, edge: true });
    expect(off.has('name')).toBe(false);
  });

  it('moves within a zone and keeps hidden columns next to their neighbours', () => {
    const cols = new ColumnModel(defs);
    expect(cols.move('city', 0)).toBe(true);
    expect(cols.zone('free')).toEqual(['city', 'name']);
    expect(cols.state.order.filter((f) => !cols.isInternal(f))).toEqual(['id', 'city', 'name', 'note', 'amount']);
    expect(cols.moveBy('city', 5)).toBe(true);
    expect(cols.zone('free')).toEqual(['name', 'city']);
    expect(cols.move('id', 3)).toBe(false); // alone in its zone
  });

  it('column values win over the grid settings, and both follow functions', () => {
    const state = { resizable: false };
    const settings = settingsOf({ resizable: () => state.resizable });
    const cols = new ColumnModel([{ field: 'a', title: 'A', resizable: true }, { field: 'b', title: 'B' }], undefined, settings);
    expect(cols.can('a', 'resizable')).toBe(true);
    expect(cols.can('b', 'resizable')).toBe(false);
    state.resizable = true;
    cols.features.get('a')!.view.resizable = false;
    expect(cols.can('a', 'resizable')).toBe(false);
    expect(cols.can('b', 'resizable')).toBe(true);
    (cols.features.get('a')!.view as Partial<GridSettings>).resizable = undefined;
    expect(cols.can('a', 'resizable')).toBe(true);
  });

  it("decides what a new row can fill: creatable, else the column's editable, else the grid", () => {
    const settings = settingsOf({ editable: true, creatable: true });
    const cols = new ColumnModel(
      [
        { field: 'code', title: 'Code', editable: false, creatable: true },
        { field: 'id', title: 'Id', editable: false },
        { field: 'name', title: 'Name' },
        { field: 'calc', title: 'Calc', value: () => 1 },
        { field: 'own', title: 'Own', editable: (row: { locked?: boolean }) => !row.locked },
      ],
      undefined,
      settings,
    );
    const row = {};
    expect(['code', 'id', 'name', 'calc'].map((f) => cols.canFill(f, row, true))).toEqual([true, false, true, false]);
    expect(['code', 'id', 'name', 'calc'].map((f) => cols.canFill(f, row, false))).toEqual([false, false, true, false]);
    expect(cols.canEdit('own', { locked: true })).toBe(false);
    expect(cols.canEdit('own', { locked: false })).toBe(true);
    settings.view.creatable = false;
    expect(cols.canCreate('name', row)).toBe(false);
    expect(cols.canCreate('code', row)).toBe(true);
    cols.features.get('name')!.view.creatable = true;
    expect(cols.canCreate('name', row)).toBe(true);
  });

  it('never moves a column across one that cannot move', () => {
    const cols = new ColumnModel([
      { field: 'a', title: 'A' },
      { field: 'b', title: 'B' },
      { field: 'fixed', title: 'Fixed', movable: false },
      { field: 'c', title: 'C' },
      { field: 'd', title: 'D' },
    ]);
    expect(cols.moveRange('a')).toEqual([0, 1]);
    expect(cols.moveRange('d')).toEqual([3, 4]);
    expect(cols.moveRange('fixed')).toEqual([2, 2]);
    expect(cols.move('a', 4)).toBe(true);
    expect(cols.visible()).toEqual(['b', 'a', 'fixed', 'c', 'd']);
    expect(cols.move('d', 0)).toBe(true);
    expect(cols.visible()).toEqual(['b', 'a', 'fixed', 'd', 'c']);
    expect(cols.move('fixed', 0)).toBe(false);
  });

  it('clamps widths and turns flex off when resized', () => {
    const cols = new ColumnModel([{ field: 'a', title: 'A', width: 100, minWidth: 60, maxWidth: 300, flex: 2 }]);
    expect(cols.resize('a', 10)).toBe(60);
    expect(cols.resize('a', 1000)).toBe(300);
    expect(cols.template(['a'])).toBe('300px');
  });

  it('never hides the last visible column', () => {
    const cols = new ColumnModel([
      { field: 'a', title: 'A' },
      { field: 'b', title: 'B' },
    ]);
    expect(cols.setHidden('a', true)).toBe(true);
    expect(cols.setHidden('b', true)).toBe(false);
    expect(cols.visible()).toEqual(['b']);
  });

  it('round-trips a layout and ignores unknown fields', () => {
    const cols = new ColumnModel(defs);
    cols.resize('city', 222);
    cols.move('city', 0);
    cols.setHidden('note', false);
    const saved = cols.toLayout();
    const other = new ColumnModel(defs, { columns: [...saved, { field: 'gone', width: 1, flex: 0, hidden: false, sticky: null }], sort: [] });
    expect(other.toLayout()).toEqual(saved);
    other.reset();
    expect(other.visible()).toEqual(['id', 'name', 'city', 'amount']);
  });
});
