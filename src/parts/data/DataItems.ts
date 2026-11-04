import { Emitter, type Event as MotifEvent, type IDisposable } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { givenList } from '../../core/given-field';
import type { ItemSource } from '../list/item-source';
import type { KeyedItem } from './keyed-item';
import { KeyedItems } from './KeyedItems';
import { foldText } from '../../core/fold-text';

type Source<T> = data.DataSource<T, unknown>;

/**
 * The items of a list control, from an array in memory or from a `DataSource` of the data layer
 * (any adapter: REST, OData, a service…). It searches, tells when the items change, and finds the
 * item of a value even when it is on no loaded page.
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
  /** The field of an item that holds its value, when it is not the source's key: a value on no loaded page is asked for by it. */
  valueField: string | undefined;
  searchMode: 'contains' | 'startswith' = 'contains';

  readonly onChanged: MotifEvent<void> = this.changedEmitter.event;

  /** Items in memory, read as they are now; the search runs over them here. Call it again after they changed. */
  setArray(items: readonly T[]): void {
    this.detach();
    this.array = givenList(items);
    this.filter();
    this.changedEmitter.fire();
  }

  /** Items from a data source; the search goes to it (`searchFields`), and it loads when first needed. */
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

  /** Whether rows are loading. */
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
   * The item whose value is `value`: among the items, else asked from the data source by key, through
   * the cache every list and grid over the same adapter shares (`KeyedItems`), so the keys several
   * lists need at once go out in one request.
   */
  async find(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): Promise<T | undefined> {
    const near = this.findLoaded(value, valueOf, same);
    if (near !== undefined || !this.source) return near;
    if (value === null || value === undefined) return undefined;
    const known = KeyedItems.of<T>(this.source, this.valueField);
    await known.request([value]);
    return known.get(value)?.item;
  }

  findLoaded(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): T | undefined {
    const pool = this.source ? this.loaded : this.array;
    return pool.find((item) => same(valueOf(item), value));
  }

  /** What is known of the item `find` asked the data source for: still asked for, found, or not in the source. */
  known(value: unknown): KeyedItem<T> | undefined {
    if (!this.source || value === null || value === undefined) return undefined;
    return KeyedItems.of<T>(this.source, this.valueField).get(value);
  }

  /** Asks the data source again for the item of `value` after its request failed. */
  async retry(value: unknown): Promise<T | undefined> {
    if (!this.source || value === null || value === undefined) return undefined;
    const known = KeyedItems.of<T>(this.source, this.valueField);
    await known.retry([value]);
    return known.get(value)?.item;
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
