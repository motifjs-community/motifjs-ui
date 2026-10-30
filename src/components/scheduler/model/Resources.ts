import type { data } from '@motifx-community/data';
import { givenField, givenList } from '../../../core/given-field';
import type { SchedulerResource } from '../scheduler-resource';
import type { ResourceEntry } from './resource-entry';
import { ResourceKind } from './ResourceKind';
import type { SchedulerGroup } from './scheduler-group';

type Source = data.DataSource<unknown, unknown>;

/** A data source, told apart from an array of items by what it has. */
function isSource(value: unknown): value is Source {
  return !!value && !Array.isArray(value) && typeof (value as Source).load === 'function' && 'rows' in (value as object);
}

/**
 * The resource kinds of a scheduler: their items (an array, or a data source loaded once and then
 * followed), the values an appointment has of each, and the colour they give it. The items and
 * their fields are read as they are, plain or reactive: a change in place shows after `refresh()`.
 * Nothing here follows anything: a change is said (`refresh()`, `listChanged()`, a data source's
 * change) and told to `onChanged` listeners.
 */
export class Resources {
  private readonly made = new WeakMap<SchedulerResource<unknown>, ResourceKind<unknown>>();
  /** Moves on each time the items are to be read again. */
  private rows = 0;
  private readonly listeners = new Set<() => void>();
  /** Each kind's items as read last, and when. */
  private readonly lastRows = new WeakMap<SchedulerResource<unknown>, { from: unknown; version: number; rows: readonly unknown[] }>();
  private readonly followed = new Map<Source, () => void>();
  private stop: (() => void) | null = null;

  constructor(private readonly list: () => readonly SchedulerResource<unknown>[]) {}

  /** The kinds, in the order given. */
  kinds(): ResourceKind<unknown>[] {
    return givenList(this.list()).map((def) => {
      let kind = this.made.get(def);
      if (!kind) this.made.set(def, (kind = new ResourceKind(def, () => this.rowsOf(def))));
      return kind;
    });
  }

  kind(field: string): ResourceKind<unknown> | undefined {
    return this.kinds().find((k) => k.field === field);
  }

  /** Reads the items again: a change to them in place shows. */
  refresh(): void {
    this.rows++;
    this.changed();
  }

  /** The list of kinds was given anew: its data sources are loaded and followed, the rest let go. */
  listChanged(): void {
    if (this.stop) this.sync(this.sources());
    this.changed();
  }

  /** Calls `listener` after the kinds or their items change; returns the function that stops it. */
  onChanged(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** The values an appointment has of a field: a list for a kind with several, one or none otherwise. */
  valuesOf(item: unknown, field: string): unknown[] {
    const value = givenField(item, field);
    if (Array.isArray(value)) return givenList(value).filter((v) => !blank(v));
    return blank(value) ? [] : [value];
  }

  /** Every kind's values of an appointment, by field. */
  allValuesOf(item: unknown): Record<string, unknown[]> {
    const out: Record<string, unknown[]> = {};
    for (const kind of this.kinds()) out[kind.field] = this.valuesOf(item, kind.field);
    return out;
  }

  /**
   * The colour resources give an appointment: of the kind marked `useColorAsDefault`, else of the
   * first kind whose item has one. In a group, the group's item of that kind.
   */
  colorOf(values: Record<string, unknown[]>, group: SchedulerGroup | null = null, kinds: ResourceKind<unknown>[] = this.kinds()): string {
    const marked = kinds.find((k) => k.useColorAsDefault);
    for (const kind of marked ? [marked] : kinds) {
      const own = group?.path.find((p) => p.field === kind.field);
      if (own?.color) return own.color;
      for (const value of values[kind.field] ?? []) {
        const color = kind.colorOf(kind.find(value));
        if (color) return color;
      }
    }
    return '';
  }

  /** The items of an appointment, by kind, in the kinds' order (the ones it has). */
  itemsOf(item: unknown): { kind: ResourceKind<unknown>; items: ResourceEntry[] }[] {
    return this.kinds()
      .map((kind) => ({
        kind,
        items: this.valuesOf(item, kind.field).map((value) => {
          const found = kind.find(value);
          return { field: kind.field, value, item: found, text: found === undefined ? String(value) : kind.textOf(found), color: kind.colorOf(found) };
        }),
      }))
      .filter((entry) => entry.items.length);
  }

  /** Loads each data source once and listens for its changes; call the result to stop. */
  follow(): () => void {
    if (this.stop) return this.stop;
    this.stop = () => {
      this.sync([]);
      this.stop = null;
    };
    this.sync(this.sources());
    return this.stop;
  }

  private sources(): Source[] {
    return givenList(this.list())
      .map((def) => givenField(def, 'items'))
      .filter(isSource);
  }

  private changed(): void {
    for (const listener of [...this.listeners]) listener();
  }

  /** A kind's items, as a list of the kit's own: read again when the list is another one, or after `refresh()`. */
  private rowsOf(def: SchedulerResource<unknown>): readonly unknown[] {
    const items = givenField<readonly unknown[] | Source | null | undefined>(def, 'items');
    const version = this.rows;
    const from = isSource(items) ? items.rows : items;
    const last = this.lastRows.get(def);
    if (last && last.from === from && last.version === version) return last.rows;
    const rows = givenList(from);
    this.lastRows.set(def, { from, version, rows });
    return rows;
  }

  private sync(sources: Source[]): void {
    for (const [source, stop] of this.followed) {
      if (sources.includes(source)) continue;
      stop();
      this.followed.delete(source);
    }
    for (const source of sources) {
      if (this.followed.has(source)) continue;
      const listening = source.onChanged(() => {
        this.rows++;
        this.changed();
      });
      this.followed.set(source, () => listening.dispose());
      if (source.status === 'idle') void source.load();
    }
  }
}

function blank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
