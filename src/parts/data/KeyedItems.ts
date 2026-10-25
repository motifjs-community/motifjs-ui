import { Emitter, type Event as MotifEvent } from '@motifx/core';
import { data } from '@motifx-community/data';
import { pageLocale } from '../../core/page-locale';
import type { KeyedItem } from './keyed-item';
import type { TextSearch } from './text-search';

type Source = data.DataSource<any, any> | readonly unknown[];

const registry = new WeakMap<object, Map<string, KeyedItems<any>>>();
const watched = new WeakSet<object>();

/** The same text for equal keys: `1` and `'1'` are one key, equal dates are one key. */
function keyString(key: unknown): string {
  if (key instanceof Date) return `d${key.getTime()}`;
  if (key !== null && typeof key === 'object') return JSON.stringify(key);
  return String(key);
}

const sameText = (a: string, b: string, locale: string) => a.trim().toLocaleLowerCase(locale) === b.trim().toLocaleLowerCase(locale);

/**
 * Items by key, from a data source of the data layer (any adapter) or an array: what a grid cell, a
 * drop-down's field or a filter list needs to turn a key into its item. Keys are asked for when they
 * are needed and only once: the keys asked for in the same moment go out together, in one request
 * per `batchSize` keys (`valueField in [...]`), or one request per key for a service that only gives
 * one item by key (`resolve: 'byKey'`). There is one cache per source and value field, shared by
 * every grid, column and list that uses it (`KeyedItems.of`). Requests go through the source's
 * adapter, so the source's own query (filter, page, search) never changes.
 *
 * @example
 * const customers = KeyedItems.of(customerSource, 'id');
 * customers.onResolved(() => redraw());
 * customers.request([7, 9]);
 * customers.get(7); // { state: 'loading' }, later { state: 'found', item }
 */
export class KeyedItems<T = unknown> {
  /** `'batch'`: the keys of a moment in one request each `batchSize`; `'byKey'`: one request per key. Default: `'batch'` when the service filters, else `'byKey'`. */
  resolve: 'batch' | 'byKey';
  batchSize = 100;
  /** `'byKey'`: requests at the same time. */
  parallelRequests = 6;
  /** Items asked for when an exact text is looked for (a pasted text). */
  pasteSearchLimit = 50;
  private readonly entries = new Map<string, KeyedItem<T>>();
  private readonly waiting = new Map<string, Promise<void>>();
  private queue = new Map<string, unknown>();
  private queued: Promise<void> | null = null;
  private index: Map<string, T> | null = null;
  private indexedLength = -1;
  private generation = 0;
  private readonly resolvedEmitter = new Emitter<readonly string[] | null>();

  /** Keys were resolved (their key texts) or, with `null`, everything was cleared. */
  readonly onResolved: MotifEvent<readonly string[] | null> = this.resolvedEmitter.event;

  /** The same text for equal keys, as the cache keeps them (`1` and `'1'` are one key). */
  static keyString(key: unknown): string {
    return keyString(key);
  }

  /** The shared cache of a source and value field. Every data source over the same adapter shares it. */
  static of<T = unknown>(source: data.DataSource<any, any> | readonly T[], valueField?: string): KeyedItems<T> {
    const owner = Array.isArray(source) ? source : (source as data.DataSource<any, any>).adapter;
    // The key's own field is the key.
    if (!Array.isArray(source) && valueField !== undefined) {
      const fields = (owner as data.DataAdapter<any, any>).keys.fields;
      if (fields?.length === 1 && fields[0] === valueField) valueField = undefined;
    }
    let byField = registry.get(owner);
    if (!byField) registry.set(owner, (byField = new Map()));
    let items = byField.get(valueField ?? '');
    if (!items) byField.set(valueField ?? '', (items = new KeyedItems<any>(source as Source, valueField)));
    if (!Array.isArray(source)) items.watch(source as data.DataSource<any, any>);
    return items as KeyedItems<T>;
  }

  constructor(
    private readonly source: Source,
    readonly valueField?: string,
  ) {
    const adapter = this.adapter;
    this.resolve = adapter && !adapter.capabilities.filter ? 'byKey' : 'batch';
    adapter?.onChanged((e) => this.changed(e.changes));
  }

  /** Whether the items are an array in memory (every key is known at once). */
  get inMemory(): boolean {
    return Array.isArray(this.source);
  }

  /** The value of an item: its `valueField`, else the adapter's key (an array: `item.value`, or the item itself). */
  valueOf(item: T): unknown {
    if (this.valueField) return data.getField(item, this.valueField);
    if (this.inMemory) return item !== null && typeof item === 'object' && 'value' in item ? (item as { value: unknown }).value : item;
    return this.adapter!.keyOf(item);
  }

  sameKey(a: unknown, b: unknown): boolean {
    return keyString(a) === keyString(b);
  }

  /** What is known of a key now; `undefined` when it was never asked for (an array knows every key). */
  get(key: unknown): KeyedItem<T> | undefined {
    const ks = keyString(key);
    const known = this.entries.get(ks);
    if (known || !this.inMemory) return known;
    const item = this.fromArray(ks);
    return item === undefined ? { state: 'missing' } : { state: 'found', item };
  }

  /** Asks for the keys not known yet; resolves once every one of them is found or missing. */
  request(keys: Iterable<unknown>): Promise<void> {
    if (this.inMemory) return Promise.resolve();
    const waits = new Set<Promise<void>>();
    for (const key of keys) {
      if (key === null || key === undefined || key === '') continue;
      const ks = keyString(key);
      const known = this.entries.get(ks);
      if (known && known.state !== 'loading') continue;
      const wait = this.waiting.get(ks);
      if (wait) {
        waits.add(wait);
        continue;
      }
      this.entries.set(ks, { state: 'loading' });
      this.queue.set(ks, key);
      this.queued ??= Promise.resolve().then(() => this.flush());
      this.waiting.set(ks, this.queued);
      waits.add(this.queued);
    }
    return Promise.all(waits).then(() => undefined);
  }

  /** Keeps what an editor chose for a key: its item, or its text. It shows at once, without a request. */
  remember(key: unknown, itemOrText: T | string) {
    if (key === null || key === undefined) return;
    const ks = keyString(key);
    this.entries.set(ks, typeof itemOrText === 'string' ? { state: 'found', text: itemOrText } : { state: 'found', item: itemOrText });
    this.resolvedEmitter.fire([ks]);
  }

  /** Items among those known whose text is exactly `text` (case aside, in the locale). */
  findLoadedByText(text: string, search: TextSearch<T>): T[] {
    const locale = search.locale ?? pageLocale();
    const pool = this.inMemory ? (this.source as readonly T[]) : [...this.entries.values()].filter((e) => e.item !== undefined).map((e) => e.item as T);
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of pool) {
      if (!sameText(search.textOf(item), text, locale)) continue;
      const ks = keyString(this.valueOf(item));
      if (seen.has(ks)) continue;
      seen.add(ks);
      out.push(item);
    }
    return out;
  }

  /** Items whose text is exactly `text`: among those known, else asked from the source. */
  async findByText(text: string, search: TextSearch<T>): Promise<T[]> {
    const known = this.findLoadedByText(text, search);
    if (known.length || this.inMemory || !text.trim()) return known;
    const { items } = await this.search(text.trim(), search, 0, Math.max(1, this.pasteSearchLimit));
    const locale = search.locale ?? pageLocale();
    return items.filter((item) => sameText(search.textOf(item), text, locale));
  }

  /**
   * A part of the items whose text holds `text` (all of them for an empty text), in the source's
   * order, and how many there are. The items found are kept, so their keys show at once.
   */
  async search(text: string, search: TextSearch<T>, skip = 0, take = 100): Promise<{ items: T[]; total: number }> {
    const now = this.searchInMemory(text, search, skip, take);
    if (now) return now;
    const locale = search.locale ?? pageLocale();
    const lower = text.trim().toLocaleLowerCase(locale);
    const holds = (item: T) => !lower || search.textOf(item).toLocaleLowerCase(locale).includes(lower);
    const adapter = this.adapter!;
    const fields = search.searchFields ?? [];
    if (lower && !fields.length) {
      // No field to search on the service: the text is looked for here.
      const { rows } = await adapter.load({ filter: search.filter ?? null });
      const found = rows.filter(holds);
      this.keep(found);
      return { items: found.slice(skip, skip + take), total: found.length };
    }
    const byText = lower ? data.or(...fields.map((f) => data.where(f, 'contains', text.trim()))) : null;
    const result = await adapter.load({ filter: data.and(search.filter, byText), skip, take, count: true });
    this.keep(result.rows);
    return { items: result.rows, total: result.total ?? skip + result.rows.length };
  }

  /** `search` at once, for items in an array; `null` for items that come from a source. */
  searchInMemory(text: string, search: TextSearch<T>, skip = 0, take = 100): { items: T[]; total: number } | null {
    if (!this.inMemory) return null;
    const locale = search.locale ?? pageLocale();
    const lower = text.trim().toLocaleLowerCase(locale);
    const test = search.filter ? data.createRowFilter<T>(search.filter, { locale }) : null;
    const all = (this.source as readonly T[]).filter(
      (item) => (!lower || search.textOf(item).toLocaleLowerCase(locale).includes(lower)) && (!test || (item !== null && typeof item === 'object' && test(item))),
    );
    return { items: all.slice(skip, skip + take), total: all.length };
  }

  /** Forgets everything; keys are asked for again when they are needed. */
  clear() {
    this.generation++;
    this.entries.clear();
    this.waiting.clear();
    this.queue = new Map();
    this.queued = null;
    this.index = null;
    this.resolvedEmitter.fire(null);
  }

  private get adapter(): data.DataAdapter<any, any> | null {
    return this.inMemory ? null : (this.source as data.DataSource<any, any>).adapter;
  }

  /** A source the app reloads drops what is known. */
  private watch(source: data.DataSource<any, any>) {
    if (watched.has(source)) return;
    watched.add(source);
    source.onChanged((e) => e.reason === 'reload' && this.clear());
  }

  private fromArray(ks: string): T | undefined {
    const rows = this.source as readonly T[];
    if (!this.index || (!this.index.has(ks) && rows.length !== this.indexedLength)) {
      this.index = new Map();
      for (const item of rows) this.index.set(keyString(this.valueOf(item)), item);
      this.indexedLength = rows.length;
    }
    return this.index.get(ks);
  }

  /** The field a batch filters on: `valueField`, else the adapter's key when it is one field. */
  private batchField(): string | null {
    if (this.valueField) return this.valueField;
    const fields = this.adapter!.keys.fields;
    return fields?.length === 1 ? fields[0] : null;
  }

  private async flush() {
    const keys = [...this.queue.entries()];
    this.queue = new Map();
    this.queued = null;
    const generation = this.generation;
    const field = this.batchField();
    // One item by key works only when the value is the adapter's key.
    const byKey = !this.valueField && (this.resolve === 'byKey' || !field);
    const jobs: (() => Promise<void>)[] = [];
    if (byKey) {
      for (const [ks, key] of keys) jobs.push(() => this.loadOne(ks, key, generation));
    } else {
      const size = Math.max(1, Math.floor(this.batchSize));
      for (let i = 0; i < keys.length; i += size) {
        const part = keys.slice(i, i + size);
        jobs.push(() => this.loadMany(field!, part, generation));
      }
    }
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) await jobs[next++]();
    };
    await Promise.all(Array.from({ length: Math.min(byKey ? Math.max(1, this.parallelRequests) : 1, jobs.length) }, worker));
  }

  private async loadMany(field: string, part: [string, unknown][], generation: number) {
    let rows: T[] | null = null;
    try {
      rows = (await this.adapter!.load({ filter: data.where(field, 'in', part.map(([, key]) => key)) })).rows as T[];
    } catch {
      rows = null;
    }
    if (generation !== this.generation) return;
    const found = new Map<string, T>();
    for (const row of rows ?? []) found.set(keyString(this.valueOf(row)), row);
    for (const [ks] of part) {
      this.waiting.delete(ks);
      const item = found.get(ks);
      this.entries.set(ks, item !== undefined ? { state: 'found', item } : rows ? { state: 'missing' } : { state: 'missing', failed: true });
    }
    this.resolvedEmitter.fire(part.map(([ks]) => ks));
  }

  private async loadOne(ks: string, key: unknown, generation: number) {
    let entry: KeyedItem<T>;
    try {
      const item = (await this.adapter!.byKey(key)) as T | undefined;
      entry = item === undefined ? { state: 'missing' } : { state: 'found', item };
    } catch {
      entry = { state: 'missing', failed: true };
    }
    if (generation !== this.generation) return;
    this.waiting.delete(ks);
    this.entries.set(ks, entry);
    this.resolvedEmitter.fire([ks]);
  }

  /** Items a search brought: their keys are known from now on. */
  private keep(items: readonly T[]) {
    const fresh: string[] = [];
    for (const item of items) {
      const value = this.valueOf(item);
      if (value === null || value === undefined) continue;
      const ks = keyString(value);
      if (this.entries.get(ks)?.state === 'found') continue;
      this.entries.set(ks, { state: 'found', item });
      fresh.push(ks);
    }
    if (fresh.length) this.resolvedEmitter.fire(fresh);
  }

  /** The adapter saved or was told of changes: those keys are asked for again (all of them when the value is not the key). */
  private changed(changes: readonly data.PushedChange<any, any>[]) {
    if (this.valueField && this.valueField !== this.batchFieldOfKey()) {
      if (this.entries.size) this.clear();
      return;
    }
    const keys: string[] = [];
    for (const change of changes) {
      const ks = keyString(change.key);
      if (this.entries.delete(ks)) keys.push(ks);
    }
    if (keys.length) this.resolvedEmitter.fire(keys);
  }

  private batchFieldOfKey(): string | null {
    const fields = this.adapter!.keys.fields;
    return fields?.length === 1 ? fields[0] : null;
  }
}
