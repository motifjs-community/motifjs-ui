import { reactive, read, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import type { GridSettings } from '../grid-settings';
import type { ColumnModel } from './ColumnModel';
import type { GroupLevel } from './group-level';
import type { GroupNode } from './group-node';
import type { Switches } from './Switches';
import { readField } from './read-field';

/**
 * What the rows are grouped by, in order, and which groups are open. A level opens its groups by
 * default as its column's `autoExpandGroup` says, else the grid's `autoExpandAll`; `expandAll` and
 * `collapseAll` change that default for a level, and the groups opened or closed one by one are kept
 * apart, by id, so they stay as they are while the rows load again. Reads are reactive.
 */
export class GridGroups<T> {
  readonly state = reactive({ items: [] as data.GroupItem[], version: 0 });
  /** Groups opened or closed against their level's default, by id, with their level. */
  private readonly toggled = new Map<string, number>();
  /** A level's default set by `expandAll` / `collapseAll`. */
  private readonly levelDefaults = new Map<number, boolean>();

  constructor(
    private readonly columns: ColumnModel<T>,
    private readonly settings: Switches<GridSettings>,
  ) {}

  get items(): data.GroupItem[] {
    return this.state.items;
  }

  get any(): boolean {
    return this.state.items.length > 0;
  }

  /** Grouped fields, in order. */
  fields(): string[] {
    return this.state.items.map((g) => g.field);
  }

  indexOf(field: string): number {
    return this.state.items.findIndex((g) => g.field === field);
  }

  isGrouped(field: string): boolean {
    return this.indexOf(field) >= 0;
  }

  dirOf(field: string): 'asc' | 'desc' {
    return this.state.items.find((g) => g.field === field)?.dir ?? 'asc';
  }

  /** Whether the user may group by a column, and drag it to the group panel. */
  canGroup(field: string): boolean {
    return !this.columns.isInternal(field) && this.columns.can(field, 'groupable');
  }

  /** Levels as they are kept: known data columns only, each once, with a direction. */
  normalize(items: readonly data.GroupItem[]): data.GroupItem[] {
    const seen = new Set<string>();
    const next: data.GroupItem[] = [];
    for (const g of items) {
      if (!g || !this.columns.defs.has(g.field) || this.columns.isInternal(g.field) || seen.has(g.field)) continue;
      seen.add(g.field);
      next.push({ field: g.field, dir: g.dir === 'desc' ? 'desc' : 'asc' });
    }
    return next;
  }

  /** Whether these levels are the ones now. */
  same(items: readonly data.GroupItem[]): boolean {
    const now = this.state.items;
    return items.length === now.length && items.every((g, i) => g.field === now[i].field && (g.dir ?? 'asc') === now[i].dir);
  }

  /** Replaces the levels: known data columns only, each once. Returns whether they changed. */
  set(items: readonly data.GroupItem[]): boolean {
    const next = this.normalize(items);
    const now = this.state.items;
    if (this.same(next)) return false;
    // Ids and levels mean other groups now.
    if (next.length !== now.length || next.some((g, i) => g.field !== now[i].field)) {
      this.toggled.clear();
      this.levelDefaults.clear();
    }
    this.state.items = next;
    return true;
  }

  /** The items with `field` at `index` (moved there if it is grouped already). */
  withField(field: string, index: number, dir?: 'asc' | 'desc'): data.GroupItem[] {
    const rest = this.state.items.filter((g) => g.field !== field);
    const at = Math.max(0, Math.min(rest.length, Math.floor(index)));
    rest.splice(at, 0, { field, dir: dir ?? this.state.items.find((g) => g.field === field)?.dir ?? 'asc' });
    return rest;
  }

  /** The items without `field`. */
  without(field: string): data.GroupItem[] {
    return this.state.items.filter((g) => g.field !== field);
  }

  /** The levels as the data needs them: the server's field and the reader of each. */
  levels(): GroupLevel[] {
    return this.state.items.map((g) => {
      const col = this.columns.get(g.field);
      return { field: g.field, dir: g.dir ?? 'asc', serverField: serverFieldOf(col), read: readerOf(col), compare: col.groupCompare };
    });
  }

  // Open and closed groups.

  isExpanded(node: GroupNode): boolean {
    return this.levelDefault(node.level) !== this.toggled.has(node.id);
  }

  /** Opens or closes one group. Returns whether it changed. */
  setExpanded(node: GroupNode, open: boolean): boolean {
    if (this.isExpanded(node) === open) return false;
    if (this.toggled.has(node.id)) this.toggled.delete(node.id);
    else this.toggled.set(node.id, node.level);
    this.changed();
    return true;
  }

  /** Opens (or closes) every group of a level, or of every level. */
  setAll(open: boolean, level?: number) {
    const levels = level === undefined ? this.state.items.map((_, i) => i) : [Math.floor(level)];
    for (const l of levels) {
      if (l < 0 || l >= this.state.items.length) continue;
      this.levelDefaults.set(l, open);
      for (const [id, at] of this.toggled) if (at === l) this.toggled.delete(id);
    }
    this.changed();
  }

  /** What the open state depends on, read so a watcher follows it. */
  track(): string {
    void this.state.version;
    return this.state.items.map((_, i) => String(this.levelDefault(i))).join();
  }

  private levelDefault(level: number): boolean {
    const set = this.levelDefaults.get(level);
    if (set !== undefined) return set;
    const field = this.state.items[level]?.field;
    const own = field ? readField(this.columns.get(field), 'autoExpandGroup') : undefined;
    return typeof own === 'boolean' ? own : this.settings.get('autoExpandAll');
  }

  private changed() {
    untracked(() => this.state.version++);
  }
}

/** The field a server groups a column by: a text `calculateGroupValue`, a text `textFrom`, else its own unless a reader computes it. */
function serverFieldOf(col: GridColumn): string | null {
  if (typeof col.calculateGroupValue === 'string') return col.calculateGroupValue;
  if (typeof col.calculateGroupValue === 'function') return null;
  if (typeof col.textFrom === 'string') return col.textFrom;
  if (col.textFrom || col.value) return null;
  return col.field;
}

/** How memory reads a column's group value; `undefined` reads its field. */
function readerOf(col: GridColumn): ((row: unknown) => unknown) | undefined {
  const calc = col.calculateGroupValue;
  if (typeof calc === 'function') return calc as (row: unknown) => unknown;
  if (typeof calc === 'string') return (row) => data.getField(row, calc);
  if (typeof col.textFrom === 'function') return col.textFrom as (row: unknown) => unknown;
  if (typeof col.textFrom === 'string') {
    const field = col.textFrom;
    return (row) => data.getField(row, field);
  }
  return col.value as ((row: unknown) => unknown) | undefined;
}
