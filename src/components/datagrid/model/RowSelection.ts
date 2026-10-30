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
  /** `run`: the grid rows a drag is selecting now (first and last), while it runs. */
  /** Called when the state changed (the grid tells its views). */
  notify: ((name: string) => void) | null = null;
  private tell() {
    this.notify?.('selection');
  }
  readonly state = reactive({ version: 0, all: false, run: null as { top: number; bottom: number } | null });
  /** The change being made comes from rows selected by dragging over them. */
  byDrag = false;
  private keys = new Map<string, unknown>();
  private except = new Map<string, unknown>();
  private filter: data.FilterExpression | null = null;
  private anchorIndex = -1;
  private base: Snapshot | null = null;
  private readonly changedEmitter = new Emitter<GridSelection>();
  /** Asked before a change shows (while `wanted()`): `false` puts the selection before back. */
  guard: { wanted: () => boolean; allow: (next: GridSelection, previous: GridSelection) => boolean } | null = null;
  /** The selection before the change being made, while the guard asks. */
  private before: (Snapshot & { filter: data.FilterExpression | null; anchor: number; base: Snapshot | null }) | null = null;

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
    this.remember();
    if (!this.put(id, key, on)) return false;
    return this.changed();
  }

  toggle(id: string, key: unknown) {
    this.set(id, key, !this.isSelected(id));
  }

  /** Only this row; the anchor moves to it. */
  only(id: string, key: unknown, index: number) {
    const same = !this.state.all && this.keys.size === 1 && this.keys.has(id);
    this.remember();
    this.setAnchor(index);
    if (same) return;
    this.keys = new Map([[id, key]]);
    this.except = new Map();
    this.state.all = false;
    this.tell();
    this.changed();
  }

  /** Starts a Shift range at grid row `index`, remembering what is selected now. */
  setAnchor(index: number) {
    this.anchorIndex = index;
    this.base = null;
  }

  /** The selection from before the anchor, plus `rows` (the range from the anchor); `on` false takes them out of it. */
  extend(rows: readonly [string, unknown][], on = true) {
    const base = (this.base ??= { all: this.state.all, keys: new Map(this.keys), except: new Map(this.except) });
    const keys = new Map(base.keys);
    const except = new Map(base.except);
    for (const [id, key] of rows) putIn(base.all ? except : keys, base.all, id, key, on);
    // The same rows as before: nothing to tell.
    if (base.all === this.state.all && sameIds(keys, this.keys) && sameIds(except, this.except)) return;
    this.remember();
    this.keys = keys;
    this.except = except;
    if (this.state.all !== base.all) untracked(() => (this.state.all = base.all));
    this.tell();
    this.changed();
  }

  /** Starts a run of rows from the anchor: added to the selection there is now (`keep`), or in place of it. */
  startRun(keep: boolean) {
    this.base = keep ? { all: this.state.all, keys: new Map(this.keys), except: new Map(this.except) } : { all: false, keys: new Map(), except: new Map() };
  }

  /** The selection as it is now, to put back with `restore`. */
  save(): { all: boolean; keys: Map<string, unknown>; except: Map<string, unknown>; filter: data.FilterExpression | null; anchor: number } {
    return { all: this.state.all, keys: new Map(this.keys), except: new Map(this.except), filter: this.filter, anchor: this.anchorIndex };
  }

  /** Puts back a selection `save` kept (a drag given up). */
  restore(saved: ReturnType<RowSelection['save']>) {
    this.remember();
    this.keys = new Map(saved.keys);
    this.except = new Map(saved.except);
    this.filter = saved.filter;
    untracked(() => (this.state.all = saved.all));
    this.tell();
    this.setAnchor(saved.anchor);
    this.changed();
  }

  /** Every row of `filter`. */
  selectAll(filter: data.FilterExpression | null) {
    this.remember();
    this.keys = new Map();
    this.except = new Map();
    this.filter = filter;
    this.state.all = true;
    this.tell();
    this.setAnchor(-1);
    this.changed();
  }

  clear() {
    if (!this.state.all && !this.keys.size) return;
    this.remember();
    this.keys = new Map();
    this.except = new Map();
    this.state.all = false;
    this.tell();
    this.setAnchor(-1);
    this.changed();
  }

  /** Exactly these rows, one by one. */
  replace(rows: readonly [string, unknown][]) {
    const next = new Map(rows);
    if (!this.state.all && next.size === this.keys.size && [...next.keys()].every((id) => this.keys.has(id))) return;
    this.remember();
    this.keys = next;
    this.except = new Map();
    this.state.all = false;
    this.tell();
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
    return putIn(this.state.all ? this.except : this.keys, this.state.all, id, key, on);
  }

  /** Keeps the selection as it is now, so a change the guard refuses can be taken back. */
  private remember() {
    if (!this.guard?.wanted()) return;
    this.before = { all: this.state.all, keys: new Map(this.keys), except: new Map(this.except), filter: this.filter, anchor: this.anchorIndex, base: this.base };
  }

  /** The change is made: the guard is asked first, then it shows and is told. Returns whether it stays. */
  private changed(): boolean {
    const before = this.before;
    this.before = null;
    if (this.guard && before) {
      const previous: GridSelection = {
        all: before.all,
        keys: before.all ? [] : [...before.keys.values()],
        except: before.all ? [...before.except.values()] : [],
        filter: before.all ? before.filter : null,
      };
      if (!this.guard.allow(untracked(() => this.snapshot()), previous)) {
        this.keys = before.keys;
        this.except = before.except;
        this.filter = before.filter;
        this.anchorIndex = before.anchor;
        this.base = before.base;
        untracked(() => (this.state.all = before.all));
        this.tell();
        return false;
      }
    }
    untracked(() => this.state.version++);
    this.tell();
    this.changedEmitter.fire(this.snapshot());
    return true;
  }
}

/** Selects a row or takes it out in `list`: the rows picked, or (`all`) the rows left out. Returns whether it changed. */
function putIn(list: Map<string, unknown>, all: boolean, id: string, key: unknown, on: boolean): boolean {
  const listed = on !== all;
  if (listed === list.has(id)) return false;
  if (listed) list.set(id, key);
  else list.delete(id);
  return true;
}

function sameIds(a: Map<string, unknown>, b: Map<string, unknown>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a.keys()) if (!b.has(id)) return false;
  return true;
}
