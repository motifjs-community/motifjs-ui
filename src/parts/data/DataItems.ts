import { Emitter, type Event as MotifEvent, type IDisposable } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ItemSource } from '../list/item-source';

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
  searchMode: 'contains' | 'startswith' = 'contains';

  readonly onChanged: MotifEvent<void> = this.changedEmitter.event;

  /** Items in memory; the search runs over them here. */
  setArray(items: readonly T[]): void {
    this.detach();
    this.array = items;
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

  /** The item whose value is `value`: among the items, else asked from the data source by key. */
  async find(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): Promise<T | undefined> {
    const near = this.findLoaded(value, valueOf, same);
    if (near !== undefined || !this.source) return near;
    return this.source.byKey(value);
  }

  findLoaded(value: unknown, valueOf: (item: T) => unknown, same: (a: unknown, b: unknown) => boolean = Object.is): T | undefined {
    const pool = this.source ? this.loaded : this.array;
    return pool.find((item) => same(valueOf(item), value));
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
    const text = this.text.trim().toLocaleLowerCase();
    if (!text) {
      this.shown = this.array;
      return;
    }
    const starts = this.searchMode === 'startswith';
    this.shown = this.array.filter((item) => {
      const value = this.textOf(item).toLocaleLowerCase();
      return starts ? value.startsWith(text) : value.includes(text);
    });
  }
}
