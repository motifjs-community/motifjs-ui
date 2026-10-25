import { Emitter, read, type Event as MotifEvent, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import { KeyedItems } from '../../../parts/data/KeyedItems';
import type { TextSearch } from '../../../parts/data/text-search';
import type { GridColumn } from '../grid-column';
import type { EditorValue } from '../view/editor-value';
import { cellValue } from './cell-value';
import type { LookupCell } from './lookup-cell';

/**
 * The texts of the grid's lookup columns: a cell's key turned into the text of its item, through the
 * shared cache of the column's source (`KeyedItems`). Cells ask for their keys when they are drawn;
 * the keys of a moment go out together, and `onChanged` tells which ones came, so only those cells
 * are drawn again. A text the user chose is remembered for its key (it shows at once, also over
 * `textFrom` after the row is saved).
 */
export class LookupTexts<T> {
  private readonly watched = new Map<KeyedItems<any>, IDisposable>();
  /** Texts the user chose, by column and key. */
  private readonly chosen = new Map<string, Map<string, string>>();
  private readonly changedEmitter = new Emitter<{ items: KeyedItems<any>; keys: readonly string[] | null }>();

  /** Keys of a cache were resolved (`keys`), or everything was cleared (`null`). */
  readonly onChanged: MotifEvent<{ items: KeyedItems<any>; keys: readonly string[] | null }> = this.changedEmitter.event;

  constructor(
    private readonly locale: () => string,
    private readonly texts: { missing: () => string },
  ) {}

  /** The cache of a lookup column's source now (the source may be a function that is followed). */
  items(col: GridColumn<T>): KeyedItems<any> | null {
    const lookup = col.lookup;
    if (!lookup) return null;
    const source = read(lookup.dataSource);
    if (!source) return null;
    const items = KeyedItems.of<any>(source, lookup.valueField);
    if (lookup.resolve) items.resolve = lookup.resolve;
    if (lookup.batchSize) items.batchSize = lookup.batchSize;
    if (!this.watched.has(items)) this.watched.set(items, items.onResolved((keys) => this.changedEmitter.fire({ items, keys })));
    return items;
  }

  /** The text of an item: `textField`, else its `text`, else its value. */
  textOf(col: GridColumn<T>, item: unknown): string {
    const field = col.lookup?.textField;
    if (typeof field === 'function') return String(field(item) ?? '');
    if (field) return String(data.getField(item, field) ?? '');
    if (item !== null && typeof item === 'object' && 'text' in item) return String(read((item as { text: unknown }).text as () => unknown) ?? '');
    const items = this.items(col);
    const value = items ? items.valueOf(item) : item;
    return value === null || value === undefined ? '' : String(value);
  }

  /** How the column's items are searched by text. */
  search(col: GridColumn<T>, row: T | null = null): TextSearch<any> {
    const lookup = col.lookup!;
    const fields = lookup.searchFields ?? (typeof lookup.textField === 'string' ? [lookup.textField] : []);
    return { textOf: (item) => this.textOf(col, item), searchFields: fields, filter: lookup.filter?.(row) ?? null, locale: this.locale() };
  }

  /**
   * What a lookup cell shows for `value`: a text the user chose, the row's own text (`textFrom`) while
   * the value is the row's, the item's text, nothing while it loads (the key is asked for), or the key
   * itself when the source does not have it.
   */
  cell(col: GridColumn<T>, row: T | undefined, value: unknown, edited: boolean, ask = true): LookupCell {
    if (row === undefined || row === null || data.isEmpty(value)) return { text: '', state: 'none' };
    const chosen = this.chosen.get(col.field)?.get(KeyedItems.keyString(value));
    if (chosen !== undefined) return { text: chosen, state: 'found' };
    if (col.textFrom && !edited) {
      const text = typeof col.textFrom === 'function' ? col.textFrom(row) : data.getField(row, col.textFrom);
      return { text: text === null || text === undefined ? '' : String(text), state: 'found' };
    }
    return this.keyText(col, value, ask);
  }

  /** What a key shows without a row (a group's key): a text the user chose, the item's text, nothing while it loads, or the key itself when the source does not have it. */
  keyText(col: GridColumn<T>, value: unknown, ask = true): LookupCell {
    if (data.isEmpty(value)) return { text: '', state: 'none' };
    const chosen = this.chosen.get(col.field)?.get(KeyedItems.keyString(value));
    if (chosen !== undefined) return { text: chosen, state: 'found' };
    const items = this.items(col);
    if (!items) return { text: String(value), state: 'none' };
    const known = items.get(value);
    if (!known) {
      if (ask) void items.request([value]);
      return { text: '', state: 'loading' };
    }
    if (known.state === 'found') return { text: known.text ?? this.textOf(col, known.item), state: 'found' };
    if (known.state === 'missing') return { text: String(value), state: 'missing', hint: this.texts.missing() };
    return { text: '', state: 'loading' };
  }

  /** The text of a key as known now: the one the user chose, the item's, else the key itself. */
  textOfKey(col: GridColumn<T>, value: unknown): string {
    if (data.isEmpty(value)) return '';
    const chosen = this.chosen.get(col.field)?.get(KeyedItems.keyString(value));
    if (chosen !== undefined) return chosen;
    const known = this.items(col)?.get(value);
    return known?.state === 'found' ? (known.text ?? this.textOf(col, known.item)) : String(value);
  }

  /** Remembers what the user chose for a key: its item (or its text), for this column and every list of the source. */
  remember(col: GridColumn<T>, value: unknown, itemOrText: unknown) {
    if (data.isEmpty(value) || itemOrText === undefined || itemOrText === null) return;
    const text = typeof itemOrText === 'string' ? itemOrText : this.textOf(col, itemOrText);
    let byKey = this.chosen.get(col.field);
    if (!byKey) this.chosen.set(col.field, (byKey = new Map()));
    byKey.set(KeyedItems.keyString(value), text);
    this.items(col)?.remember(value, itemOrText as object | string);
  }

  /** Whether the source said it does not have the key (a failed request does not count). */
  isMissing(col: GridColumn<T>, value: unknown): boolean {
    if (data.isEmpty(value) || this.chosen.get(col.field)?.has(KeyedItems.keyString(value))) return false;
    const known = this.items(col)?.get(value);
    return known?.state === 'missing' && !known.failed;
  }

  /** Asks for the keys of the given rows (the unsaved edits left aside) in the lookup columns; resolves when all of them are known. */
  async load(cols: readonly GridColumn<T>[], rows: readonly T[]): Promise<void> {
    const waits: Promise<void>[] = [];
    for (const col of cols) {
      const items = this.items(col);
      if (!items) continue;
      const keys = new Set<unknown>();
      for (const row of rows) {
        const value = cellValue(col, row);
        if (!data.isEmpty(value)) keys.add(value);
      }
      waits.push(items.request(keys));
    }
    await Promise.all(waits);
  }

  /**
   * A pasted or typed text read as a key: the one item whose text it is (case aside), among the items
   * known, else asked from the source. None, or several, is a message.
   */
  parse(col: GridColumn<T>, text: string, row: T | null, messages: { none: string; several: string }): EditorValue | Promise<EditorValue> {
    const plain = text.trim();
    if (!plain) return { ok: true, value: null };
    const items = this.items(col);
    if (!items) return { ok: false, message: messages.none };
    const search = this.search(col, row);
    const pick = (found: unknown[]): EditorValue => {
      if (found.length !== 1) return { ok: false, message: found.length ? messages.several : messages.none };
      const value = items.valueOf(found[0]);
      this.remember(col, value, found[0]);
      return { ok: true, value };
    };
    const known = items.findLoadedByText(plain, search);
    if (known.length || items.inMemory) return pick(known);
    return items.findByText(plain, search).then(pick, () => ({ ok: false, message: messages.none }));
  }

  /**
   * How rows in memory read this column for sorting: `sortField`, `textFrom`, the text shown
   * (`lookup.sortBy: 'text'`), else `undefined` (the value).
   */
  sortValue(col: GridColumn<T>): ((row: T) => unknown) | undefined {
    if (col.sortField) {
      const field = col.sortField;
      return (row) => data.getField(row, field);
    }
    const from = col.textFrom;
    if (typeof from === 'function') return from;
    if (from) return (row) => data.getField(row, from);
    if (!this.sortsByText(col)) return col.value;
    return (row) => {
      const value = cellValue(col, row);
      if (data.isEmpty(value)) return null;
      const chosen = this.chosen.get(col.field)?.get(KeyedItems.keyString(value));
      if (chosen !== undefined) return chosen;
      const known = this.items(col)?.get(value);
      return known?.state === 'found' ? (known.text ?? this.textOf(col, known.item)) : null;
    };
  }

  /** Rows in memory sort this lookup column by the text shown: every key of the rows must be known first. */
  sortsByText(col: GridColumn<T>): boolean {
    return !!col.lookup && !col.sortField && !col.textFrom && read(col.lookup.sortBy) === 'text';
  }

  /** The field a server sorts by for this column: `sortField`, the field of `textFrom`, else the column's own. */
  sortFieldOf(col: GridColumn<T>): string {
    return col.sortField ?? (typeof col.textFrom === 'string' ? col.textFrom : col.field);
  }

  /** Forgets the texts of these columns; they are asked for again. */
  refresh(cols: readonly GridColumn<T>[]) {
    const seen = new Set<KeyedItems<any>>();
    for (const col of cols) {
      this.chosen.delete(col.field);
      const items = this.items(col);
      if (items && !seen.has(items)) {
        seen.add(items);
        items.clear();
      }
    }
  }

  dispose() {
    for (const sub of this.watched.values()) sub.dispose();
    this.watched.clear();
    this.changedEmitter.dispose();
  }
}
