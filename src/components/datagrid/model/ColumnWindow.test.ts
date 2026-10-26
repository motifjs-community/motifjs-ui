import { describe, expect, it } from 'vitest';
import type { GridColumn } from '../grid-column';
import type { GridSettings } from '../grid-settings';
import { ColumnModel } from './ColumnModel';
import { ColumnWindow } from './ColumnWindow';
import { DEFAULT_SETTINGS } from './default-settings';
import { Switches } from './Switches';

type Row = Record<string, unknown>;

const make = (columns: GridColumn<Row>[], settings: Partial<GridSettings> = {}) => {
  const switches = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS, { columnRenderingMode: 'virtual', rowStatus: false, ...settings });
  const cols = new ColumnModel<Row>(columns, undefined, switches);
  return { cols, win: new ColumnWindow(cols, switches), switches };
};

const many = (n: number, extra: Partial<GridColumn<Row>> = {}): GridColumn<Row>[] => Array.from({ length: n }, (_, i) => ({ field: `c${i}`, title: `C${i}`, width: 100, ...extra }));
const drawn = (win: ColumnWindow<Row>, visible: string[]) => visible.filter((f) => win.has(f));

describe('ColumnWindow', () => {
  it('draws the columns in view and the extra ones, by the widths given', () => {
    const { cols, win } = make(many(30));
    const visible = cols.visible();
    expect(win.update(visible, 0, 450, [])).toBe(true);
    // c0…c4 in view (450 px), c5 and c6 extra.
    expect(drawn(win, visible)).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6']);
    expect(win.update(visible, 0, 450, [])).toBe(false);
    // 1050…1350 px: c10…c13, two more on each side.
    win.update(visible, 1050, 300, []);
    expect(drawn(win, visible)).toEqual(['c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15']);
    expect([win.offsetOf('c12', visible), win.count(visible)]).toEqual([1200, 8]);
  });

  it('always draws pinned columns, kept ones and columns that are not virtual', () => {
    const columns = many(30);
    columns[0].sticky = 'start';
    columns[29].sticky = 'end';
    columns[20].columnRenderingMode = 'standard';
    const { cols, win, switches } = make(columns, { extraColumns: 0 });
    const visible = cols.visible();
    win.update(visible, 0, 400, ['c25']);
    // Pinned c0 (100) and c29 (100) leave 200 px: c1 and c2.
    expect(drawn(win, visible)).toEqual(['c0', 'c1', 'c2', 'c20', 'c25', 'c29']);
    // Not measured yet: the first columns.
    win.update(visible, 0, 0, []);
    expect(drawn(win, visible)).toEqual(['c0', 'c20', 'c29']);
    switches.view.columnRenderingMode = 'standard';
    win.update(visible, 0, 400, []);
    expect(win.all).toBe(true);
    win.everything = true;
    switches.view.columnRenderingMode = 'virtual';
    win.update(visible, 0, 400, []);
    expect(win.all).toBe(true);
  });
});
