import type { DataItems } from '../../parts/data/DataItems';

/** Whether the items the list shows are all chosen (`true`), none of them (`false`) or some (`'mixed'`). */
export function selectAllState<T>(
  items: DataItems<T>,
  chosen: ReadonlySet<unknown>,
  isChosen: (item: T) => boolean,
  enabledOf: (item: T) => boolean,
): boolean | 'mixed' {
  if (!chosen.size) return false;
  const rows = items.loaded.filter(enabledOf);
  let hits = 0;
  for (const row of rows) if (isChosen(row)) hits++;
  // Values of a data source may be on rows not loaded yet.
  if (!hits) return items.dataSource && !items.searchText ? 'mixed' : false;
  const all = hits === rows.length && (!items.dataSource || chosen.size >= items.count);
  return all ? true : 'mixed';
}
