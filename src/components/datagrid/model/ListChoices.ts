import { Emitter, untracked, type Event as MotifEvent } from '@motifx/core';
import type { GridColumn } from '../grid-column';
import type { ListOption } from '../list-option';
import { nothingEntered } from './nothing-entered';
import { optionOf } from './option-of';

interface Entry {
  state: 'loading' | 'ready' | 'failed';
  options: { value: unknown; label: string }[];
  promise: Promise<void>;
}

/**
 * The choices of `list` columns outside a row: the cell text, the filter row, the search, the filter builder and
 * pasted text read them. An array is read as it is; a function is called once per column with no row (`null`), and
 * its answer, a promise too, is kept until `clear()`. `onChanged` tells the column whose choices arrived.
 */
export class ListChoices<T> {
  private readonly entries = new Map<string, Entry>();
  private readonly changedEmitter = new Emitter<string>();

  readonly onChanged: MotifEvent<string> = this.changedEmitter.event;

  /** The choices now; `null` while a function's answer is on its way (asking for it the first time). */
  of(col: GridColumn<T>): { value: unknown; label: string }[] | null {
    const source = col.options;
    if (typeof source !== 'function') return (source ?? []).map(optionOf);
    const entry = this.entries.get(col.field) ?? this.ask(col);
    return entry.state === 'loading' ? null : entry.options;
  }

  /** The choices once they are there; a failed answer is asked for again. */
  async load(col: GridColumn<T>): Promise<{ value: unknown; label: string }[]> {
    const source = col.options;
    if (typeof source !== 'function') return (source ?? []).map(optionOf);
    let entry = this.entries.get(col.field);
    if (!entry || entry.state === 'failed') entry = this.ask(col);
    await entry.promise;
    if (entry.state === 'failed') throw new Error(`The choices of ${col.field} could not be read.`);
    return entry.options;
  }

  /** Whether the last answer for the column failed. */
  failed(col: GridColumn<T>): boolean {
    return this.entries.get(col.field)?.state === 'failed';
  }

  /** Forgets every answer: the functions are asked again when their choices are next needed. */
  clear() {
    this.entries.clear();
  }

  dispose() {
    this.changedEmitter.dispose();
  }

  private ask(col: GridColumn<T>): Entry {
    const source = col.options as (row: T | null, context: ReturnType<typeof nothingEntered<T>>) => readonly ListOption[] | Promise<readonly ListOption[]>;
    const entry: Entry = { state: 'loading', options: [], promise: Promise.resolve() };
    this.entries.set(col.field, entry);
    entry.promise = Promise.resolve()
      .then(() => untracked(() => source(null, nothingEntered<T>(null))))
      .then(
        (options) => {
          entry.options = [...(options ?? [])].map(optionOf);
          entry.state = 'ready';
        },
        () => {
          entry.state = 'failed';
        },
      )
      .then(() => {
        if (this.entries.get(col.field) === entry) this.changedEmitter.fire(col.field);
      });
    return entry;
  }
}
