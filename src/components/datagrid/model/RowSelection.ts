import { Emitter, reactive, untracked, type Event as MotifEvent } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { GridSelection } from '../grid-selection';

/** A selection as it was, to extend a range from. */
interface Snapshot {
  all: boolean;
  keys: Map<string, unknown>;
  except: Map<string, unknown>;
}

/**
 * The selected rows, by row id (the key as text) with their keys. One by one, or "all": every row
 * of the filter at that moment but the ones taken out, so selecting all never needs the rows. A
 * Shift range starts from an anchor and adds to what was selected before it. Reads are reactive
 * through `state.version`.
 */
export class RowSelection {
  readonly state = reactive({ version: 0, all: false });
  private keys = new Map<string, unknown>();
  private except = new Map<string, unknown>();
  private filter: data.FilterExpression | null = null;
  private anchorIndex = -1;
  private base: Snapshot | null = null;
  private readonly changedEmitter = new Emitter<GridSelection>();

  readonly onChanged: MotifEvent<GridSelection> = this.changedEmitter.event;

  get all(): boolean {
    return this.state.all;
  }

  /** Grid index the next Shift range starts from; -1 when there is none. */
  get anchor(): number {
    return this.anchorIndex;
  }

  isSelected(id: string | undefined): boolean {
    void this.state.version;
    if (id === undefined) return false;
    return this.state.all ? !this.except.has(id) : this.keys.has(id);
  }

  /** Rows selected out of `total` rows of the filter. */
  count(total: number): number {
    void this.state.version;
    return this.state.all ? Math.max(0, total - this.except.size) : this.keys.size;
  }

  /** Whether nothing is selected. */
  get empty(): boolean {
    void this.state.version;
    return this.state.all ? false : this.keys.size === 0;
  }

  /** The number of rows taken out of "all", or picked one by one. */
  get size(): number {
    void this.state.version;
    return this.state.all ? this.except.size : this.keys.size;
  }

  /** Selects a row or takes it out. Returns whether anything changed. */
  set(id: string, key: unknown, on: boolean): boolean {
    if (!this.put(id, key, on)) return false;
    this.changed();
    return true;
  }

  toggle(id: string, key: unknown) {
    this.set(id, key, !this.isSelected(id));
  }

  /** Only this row; the anchor moves to it. */
  only(id: string, key: unknown, index: number) {
    const same = !this.state.all && this.keys.size === 1 && this.keys.has(id);
    this.setAnchor(index);
    if (same) return;
    this.keys = new Map([[id, key]]);
    this.except = new Map();
    this.state.all = false;
    this.changed();
  }

  /** Starts a Shift range at grid row `index`, remembering what is selected now. */
  setAnchor(index: number) {
    this.anchorIndex = index;
    this.base = null;
  }

  /** The selection from before the anchor, plus `rows` (the range from the anchor). */
  extend(rows: readonly [string, unknown][]) {
    this.base ??= { all: this.state.all, keys: new Map(this.keys), except: new Map(this.except) };
    this.keys = new Map(this.base.keys);
    this.except = new Map(this.base.except);
    untracked(() => (this.state.all = this.base!.all));
    for (const [id, key] of rows) this.put(id, key, true);
    this.changed();
  }

  /** Every row of `filter`. */
  selectAll(filter: data.FilterExpression | null) {
    this.keys = new Map();
    this.except = new Map();
    this.filter = filter;
    this.state.all = true;
    this.setAnchor(-1);
    this.changed();
  }

  clear() {
    if (!this.state.all && !this.keys.size) return;
    this.keys = new Map();
    this.except = new Map();
    this.state.all = false;
    this.setAnchor(-1);
    this.changed();
  }

  /** Exactly these rows, one by one. */
  replace(rows: readonly [string, unknown][]) {
    const next = new Map(rows);
    if (!this.state.all && next.size === this.keys.size && [...next.keys()].every((id) => this.keys.has(id))) return;
    this.keys = next;
    this.except = new Map();
    this.state.all = false;
    this.setAnchor(-1);
    this.changed();
  }

  /** The filter changed: "all" was of the old rows, so it goes; rows picked one by one stay. */
  filterChanged() {
    if (this.state.all) this.clear();
    else this.setAnchor(-1);
  }

  /** Ids picked one by one (or taken out of "all"). */
  ids(): string[] {
    void this.state.version;
    return [...(this.state.all ? this.except : this.keys).keys()];
  }

  snapshot(): GridSelection {
    void this.state.version;
    return {
      all: this.state.all,
      keys: this.state.all ? [] : [...this.keys.values()],
      except: this.state.all ? [...this.except.values()] : [],
      filter: this.state.all ? this.filter : null,
    };
  }

  dispose() {
    this.changedEmitter.dispose();
  }

  private put(id: string, key: unknown, on: boolean): boolean {
    if (this.state.all) {
      if (on === !this.except.has(id)) return false;
      if (on) this.except.delete(id);
      else this.except.set(id, key);
      return true;
    }
    if (on === this.keys.has(id)) return false;
    if (on) this.keys.set(id, key);
    else this.keys.delete(id);
    return true;
  }

  private changed() {
    untracked(() => this.state.version++);
    this.changedEmitter.fire(this.snapshot());
  }
}
