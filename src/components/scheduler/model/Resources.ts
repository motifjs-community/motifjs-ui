import { effect, reactive, read, untracked } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { SchedulerResource } from '../scheduler-resource';
import type { GroupResource } from './group-resource';
import { ResourceKind } from './ResourceKind';
import type { SchedulerGroup } from './scheduler-group';

type Source = data.DataSource<unknown, unknown>;

/** A data source, told apart from an array of items by what it has. */
function isSource(value: unknown): value is Source {
  return !!value && !Array.isArray(value) && typeof (value as Source).load === 'function' && 'rows' in (value as object);
}

/**
 * The resource kinds of a scheduler: their items (an array, or a data source loaded once and then
 * followed), the values an appointment has of each, and the colour they give it.
 */
export class Resources {
  private readonly made = new WeakMap<SchedulerResource<unknown>, ResourceKind<unknown>>();
  private readonly version = reactive({ rows: 0 });
  private readonly followed = new Map<Source, () => void>();
  private stop: (() => void) | null = null;

  constructor(private readonly list: () => readonly SchedulerResource<unknown>[]) {}

  /** The kinds, in the order given. Reactive. */
  kinds(): ResourceKind<unknown>[] {
    return this.list().map((def) => {
      let kind = this.made.get(def);
      if (!kind) this.made.set(def, (kind = new ResourceKind(def, () => this.rowsOf(def))));
      return kind;
    });
  }

  kind(field: string): ResourceKind<unknown> | undefined {
    return this.kinds().find((k) => k.field === field);
  }

  /** The values an appointment has of a field: a list for a kind with several, one or none otherwise. */
  valuesOf(item: unknown, field: string): unknown[] {
    const value = (item as Record<string, unknown> | null)?.[field];
    if (Array.isArray(value)) return value.filter((v) => !blank(v));
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
  itemsOf(item: unknown): { kind: ResourceKind<unknown>; items: GroupResource[] }[] {
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

  /** Loads each data source once and follows its changes; call the result to stop. */
  follow(): () => void {
    if (this.stop) return this.stop;
    const run = effect(() => {
      const sources = this.list()
        .map((def) => read(def.items))
        .filter(isSource);
      untracked(() => this.sync(sources));
    });
    this.stop = () => {
      run();
      this.sync([]);
      this.stop = null;
    };
    return this.stop;
  }

  private rowsOf(def: SchedulerResource<unknown>): readonly unknown[] {
    const items = read(def.items);
    if (!isSource(items)) return items ?? [];
    void this.version.rows;
    return items.rows;
  }

  private sync(sources: Source[]): void {
    for (const [source, stop] of this.followed) {
      if (sources.includes(source)) continue;
      stop();
      this.followed.delete(source);
    }
    for (const source of sources) {
      if (this.followed.has(source)) continue;
      const listening = source.onChanged(() => this.version.rows++);
      this.followed.set(source, () => listening.dispose());
      if (source.status === 'idle') void source.load();
    }
  }
}

function blank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
