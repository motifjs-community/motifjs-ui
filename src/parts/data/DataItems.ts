import { Emitter, type Event as MotifEvent, type IDisposable } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { givenList } from '../../core/given-field';
import type { ItemSource } from '../list/item-source';
import { isEmptyKey } from './empty-key';
import type { KeyedItem } from './keyed-item';
import { KeyedItems } from './KeyedItems';
import { foldText } from '../../core/fold-text';

type Source<T> = data.DataSource<T, unknown>;

/**
 * The items of a list control, from an array in memory or from a `DataSource` of the data layer
 * (any adapter: REST, OData, a service…). It searches, reports when the items change, and finds the
 * item of a value even when it is not on a loaded page.
 */
export class DataItems<T> implements ItemSource<T>, IDisposable {
  private array: readonly T[] = [];
  private shown: readonly T[] = [];
  private source: Source<T> | null = null;
  private listening: IDisposable | null = null;
  private text = '';
  private readonly changedEmitter = new Emitter<void>();

  /** How an item is searched in memory. */
  textOf: (item: T) => string = (item) => String(item);
  /** The field of an item that holds its value, when it is not the source's key. It is used to request unloaded values. */
  valueField: string | undefined;
  /**
   * Values equal once normalized are one value (`KeyedItems.normalizeKey`): the rule of keys a source compares its own
   * way, for items in memory and to spare the source the requests that find it out.
   */
  normalizeKey: ((key: unknown) => unknown) | undefined;
  searchMode: 'contains' | 'startswith' = 'contains';

  readonly onChanged: MotifEvent<void> = this.changedEmitter.event;

  /** Sets items in memory, read as they are now. The search runs over them here. Call it again after they change. */
  setArray(items: readonly T[]): void {
    this.detach();
    this.array = givenList(items);
    this.filter();
    this.changedEmitter.fire();
  }

  /** Sets items from a data source. The search runs on the source (`searchFields`), and it loads when first needed. */
  setDataSource(source: Source<T>): void {
    if (source === this.source) return;
    this.detach();
    this.source = source;
    this.listening = source.onChanged(() => this.changedEmitter.fire());
    if (source.status === 'idle') void source.load();
    this.changedEmitter.fire();
  }

  get dataSource(): Source<T> | null {
    return this.source;
  }

  /** Indicates whether rows are loading. */
  get loading(): boolean {
    return this.source?.status === 'loading';
  }

  get failed(): boolean {
    return this.source?.status === 'error';
  }

  get count(): number {
    const source = this.source;
    if (!source) return this.shown.length;
    return source.loadMode === 'blocks' ? (source.total ?? 0) : source.rows.length;
  }

  at(index: number): T | undefined {
    const source = this.source;
    if (!source) return this.shown[index];
    return source.loadMode === 'blocks' ? source.rowAt(index) : source.rows[index];
  }

  ensure(first: number, end: number): void {
    if (this.source?.loadMode === 'blocks') this.source.ensure(first, end);
  }

  failedAt(index?: number): boolean {
    const source = this.source;
    if (!source) return false;
    if (index === undefined) return source.status === 'error';
    return source.loadMode === 'blocks' && source.isFailed(index);
  }

  retryFailed(): void {
    void this.source?.retry();
  }

  /** Every item in memory, or the loaded rows. */
  get loaded(): readonly T[] {
    const source = this.source;
    if (!source) return this.shown;
    if (source.loadMode !== 'blocks') return source.rows;
    const rows: T[] = [];
    source.forEachLoaded((row) => rows.push(row));
    return rows;
  }

  get searchText(): string {
    return this.text;
  }

  async search(text: string): Promise<void> {
    if (text === this.text) return;
    this.text = text;
    if (this.source) {
      await this.source.search(text);
    } else {
      this.filter();
      this.changedEmitter.fire();
    }
  }

  /**
   * Returns the item whose value is `value`: from the items, otherwise requested from the data source by key,
   * through the cache that every list and grid over the same adapter shares (`KeyedItems`), so the keys
   * several lists need at once go out in one request.
   */
  async find(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): Promise<T | undefined> {
    const near = this.findLoaded(value, valueOf, same);
    if (near !== undefined || !this.source) return near;
    if (isEmptyKey(value)) return undefined;
    const known = this.keyed(this.source);
    await known.request([value]);
    return known.get(value)?.item;
  }

  findLoaded(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): T | undefined {
    const pool = this.source ? this.loaded : this.array;
    return pool.find(this.matcher(value, valueOf, same));
  }

  /**
   * Whether `item` is the item of `value`: its value is the same, the same once normalized (`normalizeKey`), or the
   * data source matched `value` to it (a key it compares its own way, such as `'A  '` for `'A'`).
   */
  holds(item: T, value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): boolean {
    return this.matcher(value, valueOf, same)(item);
  }

  /** The test of `holds` for one value, with what is known of it read once: for many items. */
  matcher(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): (item: T) => boolean {
    if (isEmptyKey(value)) return (item) => same(valueOf(item), value);
    const normalized = this.normalizeKey ? this.keyStringOf(value) : null;
    const matched = this.known(value)?.item;
    const matchedKey = matched === undefined ? null : this.keyStringOf(valueOf(matched));
    return (item) => {
      const own = valueOf(item);
      if (same(own, value)) return true;
      if (normalized === null && matchedKey === null) return false;
      const key = this.keyStringOf(own);
      return key === normalized || key === matchedKey;
    };
  }

  /**
   * Whether two values stand for the same item: they are the same, the same once normalized (`normalizeKey`), or the
   * data source matched them to one item (`'A  '` and `'A'` where it disregards trailing spaces).
   */
  sameItem(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (isEmptyKey(a) || isEmptyKey(b)) return false;
    if (this.normalizeKey && this.keyStringOf(a) === this.keyStringOf(b)) return true;
    if (!this.source) return false;
    const cache = this.keyed(this.source);
    // Neither was matched to an item: they stand for themselves, and they differ.
    if (cache.get(a)?.item === undefined && cache.get(b)?.item === undefined) return false;
    return cache.itemKeyOf(a) === cache.itemKeyOf(b);
  }

  /** Of `values` (the chosen ones), the one that stands for the same item as `value` (`sameItem`); `null` when none does. */
  heldIn(values: ReadonlySet<unknown>, value: unknown): { value: unknown } | null {
    if (values.has(value)) return { value };
    if (!values.size || (!this.normalizeKey && !this.source)) return null;
    for (const held of values) if (this.sameItem(held, value)) return { value: held };
    return null;
  }

  /** What is known of the item `find` requested from the data source: loading, found, or not in the source. */
  known(value: unknown): KeyedItem<T> | undefined {
    if (!this.source || isEmptyKey(value)) return undefined;
    return this.keyed(this.source).get(value);
  }

  /** Requests the item of `value` from the data source again after its request failed. */
  async retry(value: unknown): Promise<T | undefined> {
    if (!this.source || isEmptyKey(value)) return undefined;
    const known = this.keyed(this.source);
    await known.retry([value]);
    return known.get(value)?.item;
  }

  /** The cache of the data source, shared by every list and grid that reads it with the same value field and rule. */
  private keyed(source: Source<T>): KeyedItems<T> {
    return KeyedItems.of<T>(source, this.valueField, this.normalizeKey);
  }

  private keyStringOf(value: unknown): string {
    return KeyedItems.keyString(this.normalizeKey ? this.normalizeKey(value) : value);
  }

  reload(): Promise<void> {
    return this.source ? this.source.reload() : Promise.resolve();
  }

  dispose(): void {
    this.detach();
    this.changedEmitter.dispose();
  }

  private detach(): void {
    this.listening?.dispose();
    this.listening = null;
    this.source = null;
  }

  private filter(): void {
    const text = foldText(this.text.trim());
    if (!text) {
      this.shown = this.array;
      return;
    }
    const starts = this.searchMode === 'startswith';
    this.shown = this.array.filter((item) => {
      const value = foldText(this.textOf(item));
      return starts ? value.startsWith(text) : value.includes(text);
    });
  }
}
