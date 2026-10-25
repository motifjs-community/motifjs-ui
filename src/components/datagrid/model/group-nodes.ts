import type { data } from '@motifx-community/data';
import { KeyedItems } from '../../../parts/data/KeyedItems';
import type { GroupLevel } from './group-level';
import type { GroupNode } from './group-node';

/** The id of a group by its keys from the top level down; text keys without case, as they group. */
export function groupId(path: readonly unknown[], locale?: string): string {
  return path.map((key) => (typeof key === 'string' ? `s${key.toLocaleLowerCase(locale)}` : `v${KeyedItems.keyString(key)}`)).join('\u001f');
}

/** The groups of the data layer as the grid keeps them: ids, paths and where each one's rows start. */
export function groupNodes(groups: readonly data.RowGroup<unknown>[], levels: readonly GroupLevel[], locale?: string): GroupNode[] {
  let start = 0;
  const make = (list: readonly data.RowGroup<unknown>[], level: number, parent: readonly unknown[]): GroupNode[] =>
    list.map((g) => {
      const path = [...parent, g.key];
      const node: GroupNode = { id: groupId(path, locale), level, field: levels[level]?.field ?? g.field, key: g.key, path, count: g.count, start, children: null };
      if (g.summary) node.summary = g.summary;
      if (g.groups && level + 1 < levels.length) node.children = make(g.groups, level + 1, path);
      else start += g.count;
      return node;
    });
  return make(groups, 0, []);
}
