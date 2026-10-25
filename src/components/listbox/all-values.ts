import type { DataItems } from '../../parts/data/DataItems';

/**
 * The values of every item the list shows, the search applied: at once for items in memory; with a
 * data source in pages or blocks, loaded through its adapter (its filter, then the search text over
 * the item text).
 */
export function allValues<T>(items: DataItems<T>, valueOf: (item: T) => unknown, enabledOf: (item: T) => boolean): unknown[] | Promise<unknown[]> {
  const source = items.dataSource;
  const values = (rows: readonly T[]) => rows.filter(enabledOf).map(valueOf);
  if (!source || source.loadMode === 'all') return values(items.loaded);
  const text = items.searchText.trim().toLocaleLowerCase();
  return source.adapter.load({ filter: source.filter, sort: source.sort, params: source.params }).then((result) => {
    const rows = text ? result.rows.filter((row) => items.textOf(row).toLocaleLowerCase().includes(text)) : result.rows;
    return values(rows);
  });
}
