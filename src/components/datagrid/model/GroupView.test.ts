import { data } from '@motifx-community/data';
import { describe, expect, it } from 'vitest';
import { groupId, groupNodes } from './group-nodes';
import type { GroupLevel } from './group-level';
import { GroupView } from './GroupView';

type Row = { id: number; city: string; status: string };

const rows: Row[] = Array.from({ length: 10 }, (_, i) => ({ id: i, city: i < 6 ? 'Ankara' : 'Bursa', status: i % 2 ? 'Paid' : 'Draft' }));
const levels: GroupLevel[] = [
  { field: 'city', dir: 'asc', serverField: 'city', read: undefined, compare: undefined },
  { field: 'status', dir: 'asc', serverField: 'status', read: undefined, compare: undefined },
];
const tree = () => groupNodes(data.queryArray(rows, { group: levels.map((l) => ({ field: l.field, dir: l.dir })) }).groups as data.RowGroup<unknown>[], levels, 'en');

describe('GroupView', () => {
  it('lists the groups and the rows of the open ones, with ids, paths and where the rows start', () => {
    const nodes = tree();
    expect(nodes.map((n) => [n.id, n.count, n.start, n.children!.map((c) => [c.path, c.count, c.start])])).toEqual([
      [groupId(['Ankara']), 6, 0, [[['Ankara', 'Draft'], 3, 0], [['Ankara', 'Paid'], 3, 3]]],
      [groupId(['Bursa']), 4, 6, [[['Bursa', 'Draft'], 2, 6], [['Bursa', 'Paid'], 2, 8]]],
    ]);
    expect(groupId(['ANKARA'])).toBe(groupId(['ankara']));
    const view = new GroupView(nodes, () => true);
    expect(view.size).toBe(2 + 4 + 10);
    expect(view.rowCount).toBe(10);
    expect([view.itemAt(0)!.node!.key, view.itemAt(1)!.node!.key, view.itemAt(2)!.data, view.itemAt(5)!.node!.key, view.itemAt(16)]).toEqual(['Ankara', 'Draft', 0, 'Paid', null]);
  });

  it('leaves out what closed groups hold, and finds places both ways', () => {
    const nodes = tree();
    const closed = new Set([nodes[0].children![1].id, nodes[1].id]);
    const view = new GroupView(nodes, (n) => !closed.has(n.id));
    // Ankara, Draft, 3 rows, Paid (closed), Bursa (closed).
    expect(view.size).toBe(7);
    expect(view.placeOfRow(1)).toBe(3);
    expect(view.placeOfRow(4)).toBe(-1);
    expect(view.shownPlaceOfRow(4)).toBe(5);
    expect(view.shownPlaceOfRow(9)).toBe(6);
    expect(view.placeOfGroup(nodes[1].children![0].id)).toBe(-1);
    expect(view.rowsBetween(0, 7)).toEqual([[0, 3]]);
    expect(view.rowsBetween(3, 4)).toEqual([[1, 2]]);
    expect(view.groupsOfRow(7).map((n) => n.path)).toEqual([['Bursa'], ['Bursa', 'Draft']]);
    expect(view.allGroups()).toHaveLength(6);
  });

  it('ends each open group with its footer, inner groups first, and skips the footers of closed ones', () => {
    const nodes = tree();
    const view = new GroupView(nodes, (n) => n.id !== nodes[1].id, true);
    // Ankara, Draft, 3 rows, its footer, Paid, 3 rows, its footer, Ankara's footer, Bursa (closed).
    expect(view.size).toBe(13);
    const kinds = Array.from({ length: view.size }, (_, i) => {
      const e = view.itemAt(i)!;
      return e.node ? `${e.footer ? '=' : '>'}${e.node.key}` : String(e.data);
    });
    expect(kinds).toEqual(['>Ankara', '>Draft', '0', '1', '2', '=Draft', '>Paid', '3', '4', '5', '=Paid', '=Ankara', '>Bursa']);
    expect([view.placeOfRow(3), view.placeOfGroup(nodes[1].id), view.rowsBetween(4, 9)]).toEqual([7, 12, [[2, 3], [3, 5]]]);
  });

  it('runs a list of a hundred thousand rows in groups without a place per row', () => {
    const big = Array.from({ length: 100_000 }, (_, i) => ({ id: i, g: `g${String(Math.floor(i / 100)).padStart(4, '0')}` }));
    const level: GroupLevel[] = [{ field: 'g', dir: 'asc', serverField: 'g', read: undefined, compare: undefined }];
    const nodes = groupNodes(data.queryArray(big, { group: [{ field: 'g' }] }).groups as data.RowGroup<unknown>[], level);
    const t = performance.now();
    const view = new GroupView(nodes, (n) => n.key !== 'g0001');
    expect(view.size).toBe(1000 + 99_900);
    expect([view.itemAt(102)!.node!.key, view.itemAt(103)!.data]).toEqual(['g0002', 200]);
    expect(view.rowsBetween(95, 110)).toEqual([[94, 100], [200, 207]]);
    expect(performance.now() - t).toBeLessThan(200);
  });
});
