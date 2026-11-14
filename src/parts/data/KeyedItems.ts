import { Emitter, type Event as MotifEvent } from '@motifx/core';
import { data } from '@motifx-community/data';
import { isEmptyKey } from './empty-key';
import type { KeyedItem } from './keyed-item';
import type { TextSearch } from './text-search';
import { uiLocale } from '../../core/ui-locale';
import { foldText } from '../../core/fold-text';

type Source = data.DataSource<any, any> | readonly unknown[];

/** The caches of a source, by value field and by the `normalizeKey` given (`null`: none). */
const registry = new WeakMap<object, Map<string, Map<((key: unknown) => unknown) | null, KeyedItems<any>>>>();
const watched = new WeakSet<object>();

/** The same text for equal keys: `1` and `'1'` are one key, equal dates are one key. */
function keyString(key: unknown): string {
  if (key instanceof Date) return `d${key.getTime()}`;
  if (key !== null && typeof key === 'object') return JSON.stringify(key);
  return String(key);
}

const sameText = (a: string, b: string, locale: string) => foldText(a.trim(), locale) === foldText(b.trim(), locale);

/**
 * A key as databases commonly compare keys when they disregard what this cache does not: trailing spaces (a `char(n)`
 * column), case, accents, the width of a character, or how a number is written (`'007'` and `7`). `null` for a key
 * that is not a text or a number. It never decides a match: it only tells the cache to ask the source again.
 */
function looseKey(key: unknown): string | null {
  if (typeof key === 'number' || typeof key === 'bigint') return String(key);
  if (typeof key !== 'string') return null;
  const text = key.normalize('NFKD').replace(/\p{M}+/gu, '').trim().toLowerCase().replace(/ı/g, 'i');
  return /^[+-]?\d+(\.\d+)?$/.test(text) ? String(Number(text)) : text;
}

/**
 * Items by key, from a data source of the data layer (any adapter) or an array: what a grid cell, a
 * drop-down's field or a filter list needs to turn a key into its item. Keys are requested when they
 * are needed and only once. Keys requested at the same moment go out together, in one request
 * per `batchSize` keys (`valueField in [...]`), or in one request per key for a service that only returns
 * one item by key (`resolve: 'byKey'`). There is one cache per source, value field and `normalizeKey`,
 * shared by every grid, column and list that uses it (`KeyedItems.of`). Requests go through the source's
 * adapter, so the source's own query (filter, page, search) never changes.
 *
 * Which item a key stands for is the source's decision: a source may compare keys its own way (a
 * database that disregards trailing spaces, case or accents, or reads `'007'` as `7`). The items of a
 * batch are matched to the keys asked for; when keys are left over while the source returned items no
 * key matched here, or items that differ from a key only in such a way, those keys are asked for one
 * by one, and what the source returns for a key is that key's item. `normalizeKey` tells the cache the
 * rule itself: keys equal once normalized are one key, also in an array, where no source decides.
 *
 * @example
 * const customers = KeyedItems.of(customerSource, 'id');
 * customers.onResolved(() => redraw());
 * customers.request([7, 9]);
 * customers.get(7); // { state: 'loading' }, later { state: 'found', item }
 */
export class KeyedItems<T = unknown> {
  /**
   * `'batch'` sends the keys of a moment in one request per `batchSize`, and `'byKey'` sends one request per key.
   * The default is `'batch'` when the service filters, otherwise `'byKey'`.
   */
  resolve: 'batch' | 'byKey';
  /** The keys per request in `'batch'` mode: few enough that a request that carries them in its address stays within common URL limits. */
  batchSize = 20;
  /** The number of simultaneous requests: of keys with `'byKey'`, of batches with `'batch'`. */
  parallelRequests = 6;
  /** The number of items requested when searching for an exact text, such as pasted text. */
  pasteSearchLimit = 50;
  private readonly entries = new Map<string, KeyedItem<T>>();
  private readonly waiting = new Map<string, Promise<void>>();
  private queue = new Map<string, unknown>();
  private queued: Promise<void> | null = null;
  private index: Map<string, T> | null = null;
  private indexedLength = -1;
  private generation = 0;
  private readonly resolvedEmitter = new Emitter<readonly string[] | null>();

  /** Occurs when keys are resolved (with their key strings), or with `null` when everything is cleared. */
  readonly onResolved: MotifEvent<readonly string[] | null> = this.resolvedEmitter.event;

  /** The same string for equal keys, as the cache stores them (`1` and `'1'` are one key). */
  static keyString(key: unknown): string {
    return keyString(key);
  }

  /**
   * The shared cache of a source, value field and `normalizeKey`. Every data source over the same adapter shares it; give
   * the same `normalizeKey` function wherever the source is used, so they share one cache.
   */
  static of<T = unknown>(source: data.DataSource<any, any> | readonly T[], valueField?: string, normalizeKey?: ((key: unknown) => unknown) | null): KeyedItems<T> {
    const owner = Array.isArray(source) ? source : (source as data.DataSource<any, any>).adapter;
    // The key's own field is the key.
    if (!Array.isArray(source) && valueField !== undefined) {
      const fields = (owner as data.DataAdapter<any, any>).keys.fields;
      if (fields?.length === 1 && fields[0] === valueField) valueField = undefined;
    }
    let byField = registry.get(owner);
    if (!byField) registry.set(owner, (byField = new Map()));
    let byRule = byField.get(valueField ?? '');
    if (!byRule) byField.set(valueField ?? '', (byRule = new Map()));
    let items = byRule.get(normalizeKey ?? null);
    if (!items) byRule.set(normalizeKey ?? null, (items = new KeyedItems<any>(source as Source, valueField, normalizeKey ?? undefined)));
    if (!Array.isArray(source)) items.watch(source as data.DataSource<any, any>);
    return items as KeyedItems<T>;
  }

  constructor(
    private readonly source: Source,
    readonly valueField?: string,
    /** Keys equal once normalized are one key (`(k) => typeof k === 'string' ? k.trimEnd() : k`). */
    readonly normalizeKey?: (key: unknown) => unknown,
  ) {
    const adapter = this.adapter;
    this.resolve = adapter && !adapter.capabilities.filter ? 'byKey' : 'batch';
    adapter?.onChanged((e) => this.changed(e.changes));
  }

  /** Indicates whether the items are an array in memory, where every key is known immediately. */
  get inMemory(): boolean {
    return Array.isArray(this.source);
  }

  /** The value of an item: its `valueField`, otherwise the adapter's key (for an array, `item.value` or the item itself). */
  valueOf(item: T): unknown {
    if (this.valueField) return data.getField(item, this.valueField);
    if (this.inMemory) return item !== null && typeof item === 'object' && 'value' in item ? (item as { value: unknown }).value : item;
    return this.adapter!.keyOf(item);
  }

  /** The string the cache keeps a key under: equal for keys it counts as one (`normalizeKey`). */
  keyStringOf(key: unknown): string {
    return keyString(this.normalizeKey ? this.normalizeKey(key) : key);
  }

  sameKey(a: unknown, b: unknown): boolean {
    return this.keyStringOf(a) === this.keyStringOf(b);
  }

  /**
   * The item a key stands for, as a string: equal for keys the source matched to the same item (`'A'` and `'A  '`
   * where it disregards trailing spaces). A key not found yet stands for itself.
   */
  itemKeyOf(key: unknown): string {
    const item = this.get(key)?.item;
    return item === undefined ? this.keyStringOf(key) : this.keyStringOf(this.valueOf(item));
  }

  /** What is known of a key now, or `undefined` if it was never requested (an array knows every key). */
  get(key: unknown): KeyedItem<T> | undefined {
    const ks = this.keyStringOf(key);
    const known = this.entries.get(ks);
    if (known || !this.inMemory) return known;
    const item = this.fromArray(ks);
    return item === undefined ? { state: 'missing' } : { state: 'found', item };
  }

  /** Requests the keys that are not known yet, and resolves once each one is found or missing. */
  request(keys: Iterable<unknown>): Promise<void> {
    if (this.inMemory) return Promise.resolve();
    const waits = new Set<Promise<void>>();
    for (const key of keys) {
      if (isEmptyKey(key)) continue;
      const ks = this.keyStringOf(key);
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

  /** Requests the keys whose last request failed, and those never requested. */
  retry(keys: Iterable<unknown>): Promise<void> {
    const list = [...keys];
    for (const key of list) {
      const ks = this.keyStringOf(key);
      if (this.entries.get(ks)?.failed) this.entries.delete(ks);
    }
    return this.request(list);
  }

  /** Stores what an editor selected for a key, its item or its text, which appears immediately without a request. */
  remember(key: unknown, itemOrText: T | string) {
    if (key === null || key === undefined) return;
    const ks = this.keyStringOf(key);
    this.entries.set(ks, typeof itemOrText === 'string' ? { state: 'found', text: itemOrText } : { state: 'found', item: itemOrText });
    this.resolvedEmitter.fire([ks]);
  }

  /** The known items whose text is exactly `text`, ignoring case, in the locale. */
  findLoadedByText(text: string, search: TextSearch<T>): T[] {
    const locale = search.locale ?? uiLocale.locale;
    const pool = this.inMemory ? (this.source as readonly T[]) : [...this.entries.values()].filter((e) => e.item !== undefined).map((e) => e.item as T);
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of pool) {
      if (!sameText(search.textOf(item), text, locale)) continue;
      const ks = this.keyStringOf(this.valueOf(item));
      if (seen.has(ks)) continue;
      seen.add(ks);
      out.push(item);
    }
    return out;
  }

  /** The items whose text is exactly `text`: from those known, otherwise requested from the source. */
  async findByText(text: string, search: TextSearch<T>): Promise<T[]> {
    const known = this.findLoadedByText(text, search);
    if (known.length || this.inMemory || !text.trim()) return known;
    const { items } = await this.search(text.trim(), search, 0, Math.max(1, this.pasteSearchLimit));
    const locale = search.locale ?? uiLocale.locale;
    return items.filter((item) => sameText(search.textOf(item), text, locale));
  }

  /**
   * Returns a part of the items whose text contains `text` (all of them for an empty text), in the
   * source's order, and their total. The items found are stored, so their keys appear immediately.
   */
  async search(text: string, search: TextSearch<T>, skip = 0, take = 100): Promise<{ items: T[]; total: number }> {
    const now = this.searchInMemory(text, search, skip, take);
    if (now) return now;
    const locale = search.locale ?? uiLocale.locale;
    const lower = foldText(text.trim(), locale);
    const holds = (item: T) => !lower || foldText(search.textOf(item), locale).includes(lower);
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

  /** Runs `search` immediately for items in an array. Returns `null` for items that come from a source. */
  searchInMemory(text: string, search: TextSearch<T>, skip = 0, take = 100): { items: T[]; total: number } | null {
    if (!this.inMemory) return null;
    const locale = search.locale ?? uiLocale.locale;
    const lower = foldText(text.trim(), locale);
    const test = search.filter ? data.createRowFilter<T>(search.filter, { locale }) : null;
    const all = (this.source as readonly T[]).filter(
      (item) => (!lower || foldText(search.textOf(item), locale).includes(lower)) && (!test || (item !== null && typeof item === 'object' && test(item))),
    );
    return { items: all.slice(skip, skip + take), total: all.length };
  }

  /** Clears everything. Keys are requested again when they are needed. */
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
      for (const item of rows) this.index.set(this.keyStringOf(this.valueOf(item)), item);
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
    // Batches go side by side too: one after another, a few hundred keys would keep a list waiting for seconds.
    await this.inTurns(jobs);
  }

  /** Runs the jobs `parallelRequests` at a time. */
  private async inTurns(jobs: readonly (() => Promise<void>)[]) {
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) await jobs[next++]();
    };
    await Promise.all(Array.from({ length: Math.min(Math.max(1, this.parallelRequests), jobs.length) }, worker));
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
    for (const row of rows ?? []) found.set(this.keyStringOf(this.valueOf(row)), row);
    const matched = new Set<T>();
    const left: [string, unknown][] = [];
    const settled: string[] = [];
    for (const [ks, key] of part) {
      const item = found.get(ks);
      if (item !== undefined) matched.add(item);
      if (item === undefined && rows) {
        left.push([ks, key]);
        continue;
      }
      this.waiting.delete(ks);
      this.entries.set(ks, item !== undefined ? { state: 'found', item } : { state: 'missing', failed: true });
      settled.push(ks);
    }
    // Keys left over: the source compares keys its own way when it returned items no key matched here, or items that
    // differ from a key only as databases often disregard. Then it is asked for each of them, and decides.
    const own = rows !== null && left.length > 0 && (rows.some((row) => !matched.has(row)) || this.looselyIn(left, rows));
    for (const [ks] of own ? [] : left) {
      this.waiting.delete(ks);
      this.entries.set(ks, { state: 'missing' });
      settled.push(ks);
    }
    if (settled.length) this.resolvedEmitter.fire(settled);
    if (own) await this.inTurns(left.map(([ks, key]) => () => this.loadOne(ks, key, generation, field)));
  }

  /** Whether an item differs from one of `keys` only in what databases often disregard (`looseKey`). */
  private looselyIn(keys: readonly [string, unknown][], rows: readonly T[]): boolean {
    const loose = new Set<string>();
    for (const row of rows) {
      const key = looseKey(this.valueOf(row));
      if (key !== null) loose.add(key);
    }
    return keys.some(([, key]) => {
      const k = looseKey(key);
      return k !== null && loose.has(k);
    });
  }

  /** One key asked for alone: by the adapter's key, or by `field` when the value is not the key. What comes is that key's. */
  private async loadOne(ks: string, key: unknown, generation: number, field?: string) {
    let entry: KeyedItem<T>;
    try {
      const item = (field && this.valueField
        ? (await this.adapter!.load({ filter: data.where(field, '=', key), take: 1 })).rows[0]
        : await this.adapter!.byKey(key)) as T | undefined;
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
      const ks = this.keyStringOf(value);
      if (this.entries.get(ks)?.state === 'found') continue;
      this.entries.set(ks, { state: 'found', item });
      fresh.push(ks);
    }
    if (fresh.length) this.resolvedEmitter.fire(fresh);
  }

  /** The adapter saved or was told of changes: those keys are requested again (all of them when the value is not the key). */
  private changed(changes: readonly data.PushedChange<any, any>[]) {
    if (this.valueField && this.valueField !== this.batchFieldOfKey()) {
      if (this.entries.size) this.clear();
      return;
    }
    const changed = new Set(changes.map((change) => this.keyStringOf(change.key)));
    const keys: string[] = [];
    // A key the source matched to a changed item (its own way) goes with the item's own key.
    for (const [ks, entry] of this.entries) {
      if (changed.has(ks) || (entry.item !== undefined && changed.has(this.keyStringOf(this.valueOf(entry.item))))) keys.push(ks);
    }
    for (const ks of keys) this.entries.delete(ks);
    if (keys.length) this.resolvedEmitter.fire(keys);
  }

  private batchFieldOfKey(): string | null {
    const fields = this.adapter!.keys.fields;
    return fields?.length === 1 ? fields[0] : null;
  }
}
