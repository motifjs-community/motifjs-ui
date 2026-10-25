import type { StoredLayout } from './stored-layout';

const PREFIX = 'motifx-ui:data-grid:';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * A grid's layout, filters and search text in `localStorage` under its `layoutKey`. Storage can be missing, full
 * or blocked (a private window, a sandbox): then nothing is kept and nothing fails.
 */
export class LayoutStore {
  constructor(private readonly key: string) {}

  /** The kept layout, or `null` when there is none or it cannot be read. */
  read(): StoredLayout | null {
    try {
      const text = globalThis.localStorage?.getItem(PREFIX + this.key);
      if (!text) return null;
      const value: unknown = JSON.parse(text);
      if (!isObject(value) || !Array.isArray(value.columns) || !Array.isArray(value.sort)) return null;
      const columns = value.columns.filter((c): c is StoredLayout['columns'][number] => isObject(c) && typeof c.field === 'string' && typeof c.width === 'number');
      const sort = value.sort.filter((s): s is StoredLayout['sort'][number] => isObject(s) && typeof s.field === 'string' && (s.dir === 'asc' || s.dir === 'desc'));
      return { columns, sort, filters: isObject(value.filters) ? (value.filters as StoredLayout['filters']) : {}, searchText: typeof value.searchText === 'string' ? value.searchText : '' };
    } catch {
      return null;
    }
  }

  write(layout: StoredLayout) {
    try {
      globalThis.localStorage?.setItem(PREFIX + this.key, JSON.stringify(layout));
    } catch {
      // Full or blocked storage: the layout is not kept.
    }
  }

  clear() {
    try {
      globalThis.localStorage?.removeItem(PREFIX + this.key);
    } catch {
      // Blocked storage.
    }
  }
}
