import { createLazyComputed, Emitter, reactive, untracked, type Event as MotifEvent } from '@motifx/core';
import type { GridCellPoint } from '../grid-cell-point';
import type { GridCellRange } from '../grid-cell-range';
import type { CellCorner } from './cell-corner';
import type { CellRangeEntry } from './cell-range-entry';
import type { GridModel } from './GridModel';
import type { RangeBox } from './range-box';
import type { RangeLook } from './range-look';

/**
 * The cell ranges drawn by the user (or set by code), as in a spreadsheet: each one from the cell it
 * was started on to its far corner, over the columns between them. Corners keep their row by id and
 * key, so a range follows its rows when rows are added above them or loaded again; the columns are
 * kept by field, so a range keeps its columns when they move. Reads are reactive through
 * `state.version`. The last range is the one a Shift extension and the keys change.
 */
export class CellRanges<T> {
  readonly state = reactive({ version: 0 });
  /** The change being made comes from a range drawn with the pointer. */
  byDrag = false;
  /** Asked before a change shows (while `wanted()`): `false` keeps the ranges as they were. */
  guard: { wanted: () => boolean; allow: (next: GridCellRange[], previous: GridCellRange[]) => boolean } | null = null;
  private list: CellRangeEntry[] = [];
  private found: { key: string; boxes: RangeBox[] } | null = null;
  private readonly changedEmitter = new Emitter<GridCellRange[]>();
  /** The rows' look, worked out once per change and read by every row. */
  private readonly lookOf = createLazyComputed(() => this.findLook());

  readonly onChanged: MotifEvent<GridCellRange[]> = this.changedEmitter.event;

  constructor(private readonly model: GridModel<T>) {}

  /** What the rows draw of the ranges and of a drag's run. Reactive. */
  get look(): RangeLook {
    return this.lookOf.value;
  }

  get entries(): readonly CellRangeEntry[] {
    void this.state.version;
    return this.list;
  }

  get empty(): boolean {
    void this.state.version;
    return this.list.length === 0;
  }

  get last(): CellRangeEntry | undefined {
    void this.state.version;
    return this.list[this.list.length - 1];
  }

  /** The columns cells can be selected in: the visible data columns that allow it, in display order. Reactive. */
  axis(): string[] {
    const cols = this.model.columns;
    return cols.visibleData().filter((f) => cols.can(f, 'cellSelectable'));
  }

  /** A corner at grid row `index`, column `field`. */
  corner(index: number, field: string): CellCorner {
    const m = this.model;
    const row = m.rowAt(index);
    const rowId = m.groupAt(index) || m.footerAt(index) ? undefined : m.rowIdAt(index);
    const keys = m.data.source.adapter;
    const key = row !== undefined && rowId !== undefined && !m.isNew(rowId) && keys.keys.hasKey(row) ? keys.keyOf(row) : undefined;
    return { rowId, key, index, field };
  }

  /** The grid index of a corner's row now: found by id or key, else where it was. */
  find(corner: CellCorner): number {
    const m = this.model;
    if (corner.rowId === undefined) {
      // A row that was loading when the corner was set is the row at its place once it comes.
      const id = m.groupAt(corner.index) || m.footerAt(corner.index) ? undefined : m.rowIdAt(corner.index);
      if (id !== undefined) Object.assign(corner, this.corner(corner.index, corner.field));
      return corner.index;
    }
    if (m.rowIdAt(corner.index) === corner.rowId) return corner.index;
    let at = -1;
    if (m.isNew(corner.rowId)) at = m.indexOfKey(corner.rowId);
    else if (corner.key !== undefined) {
      const row = m.data.rowByKey(corner.key);
      at = row === undefined ? -1 : m.indexOfRow(row);
    }
    if (at >= 0) corner.index = at;
    return corner.index;
  }

  /** The columns from `a` to `b` along the axis (both included); the two alone when one is not on it. */
  between(a: string, b: string, axis = this.axis()): string[] {
    const i = axis.indexOf(a);
    const j = axis.indexOf(b);
    if (i < 0 || j < 0) return a === b ? [a] : [a, b];
    return axis.slice(Math.min(i, j), Math.max(i, j) + 1);
  }

  /** The ranges in the rows shown now, cut to their first and last data rows; ranges with no data row left out. Reactive. */
  boxes(): RangeBox[] {
    const m = this.model;
    const st = m.state;
    const key = `${this.state.version}|${st.version}|${st.added}|${st.connection}|${st.page}|${st.pageSize}`;
    if (this.found?.key === key) return this.found.boxes;
    const boxes = untracked(() => {
      const out: RangeBox[] = [];
      const isData = (i: number) => m.hasRow(i) && !m.groupAt(i) && !m.footerAt(i);
      for (const entry of this.list) {
        const a = this.find(entry.anchor);
        const b = this.find(entry.extent);
        let top = Math.min(a, b);
        let bottom = Math.max(a, b);
        while (top <= bottom && !isData(top)) top++;
        while (bottom >= top && !isData(bottom)) bottom--;
        if (top > bottom) continue;
        out.push({ top, bottom, fields: new Set(entry.fields), anchorRow: a, anchorField: entry.anchor.field });
      }
      return out;
    });
    this.found = { key, boxes };
    return boxes;
  }

  /**
   * What grid row `index` shows of the ranges, by field: `''` for a cell inside one, else its edges
   * (`top`, `bottom`, `start`, `end`) and `anchor` for the cell the last range started on. `null`
   * while the row is in none.
   */
  marksOf(index: number, look: RangeLook): Map<string, string> | null {
    const { boxes, shown, selectable } = look;
    if (!boxes.length) return null;
    let out: Map<string, string> | null = null;
    boxes.forEach((box, k) => {
      if (index < box.top || index > box.bottom) return;
      // Edges against the columns as they show: a column left out of the range between two in it breaks the frame.
      const fields = shown;
      const has = (f: string | undefined) => f !== undefined && selectable.has(f) && box.fields.has(f);
      fields.forEach((field, c) => {
        if (!has(field)) return;
        out ??= new Map();
        const parts = new Set((out.get(field) ?? '').split(' ').filter(Boolean));
        if (index === box.top) parts.add('top');
        if (index === box.bottom) parts.add('bottom');
        if (!has(fields[c - 1])) parts.add('start');
        if (!has(fields[c + 1])) parts.add('end');
        if (k === boxes.length - 1 && index === box.anchorRow && field === box.anchorField) parts.add('anchor');
        out.set(field, [...parts].join(' '));
      });
    });
    return out;
  }

  /** Calls `fn` for each row with selected cells, in grid order, with its selected columns in display order. */
  forEachRow(fn: (index: number, fields: string[]) => void) {
    const m = this.model;
    const boxes = this.boxes();
    if (!boxes.length) return;
    const axis = this.axis();
    const top = Math.min(...boxes.map((b) => b.top));
    const bottom = Math.max(...boxes.map((b) => b.bottom));
    for (let i = top; i <= bottom; i++) {
      if (!m.hasRow(i) || m.groupAt(i) || m.footerAt(i)) continue;
      const over = boxes.filter((b) => i >= b.top && i <= b.bottom);
      if (!over.length) continue;
      const fields = axis.filter((f) => over.some((b) => b.fields.has(f)));
      if (fields.length) fn(i, fields);
    }
  }

  /** The selected cells, each once. */
  count(): number {
    let n = 0;
    this.forEachRow((_, fields) => (n += fields.length));
    return n;
  }

  /** The last range's size: its data rows and its columns on the axis. */
  size(): { rows: number; columns: number } {
    const box = this.boxes().at(-1);
    if (!box) return { rows: 0, columns: 0 };
    const m = this.model;
    let rows = 0;
    for (let i = box.top; i <= box.bottom; i++) if (m.hasRow(i) && !m.groupAt(i) && !m.footerAt(i)) rows++;
    return { rows, columns: this.axis().filter((f) => box.fields.has(f)).length };
  }

  /** Starts a range at `anchor`, alone or (`add`) after the others. Returns whether it shows. */
  begin(anchor: CellCorner, add: boolean): boolean {
    const entry: CellRangeEntry = { anchor, extent: { ...anchor }, fields: [anchor.field] };
    return this.apply(add ? [...this.list, entry] : [entry]);
  }

  /** The last range's far corner moves to `extent`, its columns with it. Returns whether that changed anything. */
  extendTo(extent: CellCorner): boolean {
    const last = this.list[this.list.length - 1];
    if (!last) return this.begin(extent, false);
    const fields = this.between(last.anchor.field, extent.field);
    const same = last.extent.field === extent.field && last.extent.rowId === extent.rowId && this.find(last.extent) === extent.index && fields.join('\n') === last.fields.join('\n');
    if (same) return false;
    return this.apply([...this.list.slice(0, -1), { anchor: last.anchor, extent, fields }]);
  }

  /** Exactly these ranges. Returns whether they show. */
  set(list: readonly CellRangeEntry[]): boolean {
    return this.apply([...list]);
  }

  /** Takes the last range out (one being drawn when the drag is given up). */
  dropLast(): boolean {
    return this.list.length > 0 && this.apply(this.list.slice(0, -1));
  }

  clear(): boolean {
    return this.list.length > 0 && this.apply([]);
  }

  /** The rows changed under the ranges (another sort, filter, grouping, page, data): they go, without asking. */
  reset() {
    if (!this.list.length) return;
    this.list = [];
    this.changed();
  }

  /** The ranges as the API gives them. */
  toPublic(list: readonly CellRangeEntry[] = this.list): GridCellRange[] {
    return untracked(() => list.map((e) => ({ from: this.point(e.anchor), to: this.point(e.extent), fields: [...e.fields] })));
  }

  /** A range of the API as the grid keeps it; `null` when a corner names no row or column of the grid. */
  fromPublic(range: GridCellRange): CellRangeEntry | null {
    const anchor = this.cornerOf(range.from);
    const extent = this.cornerOf(range.to);
    if (!anchor || !extent) return null;
    const fields = range.fields?.length ? range.fields.filter((f) => this.model.columns.defs.has(f) && !this.model.columns.isInternal(f)) : this.between(anchor.field, extent.field);
    return fields.length ? { anchor, extent, fields } : null;
  }

  dispose() {
    this.lookOf.dispose();
    this.changedEmitter.dispose();
  }

  private findLook(): RangeLook {
    const m = this.model;
    const on = m.settings.get('cellSelection') !== 'none';
    const run = m.selection.state.run;
    const visible = run ? m.columns.visible() : [];
    return {
      on,
      boxes: on ? this.boxes() : [],
      shown: on ? m.columns.visibleData() : [],
      selectable: on ? new Set(this.axis()) : new Set(),
      run,
      first: visible[0] ?? '',
      last: visible[visible.length - 1] ?? '',
    };
  }

  private point(c: CellCorner): GridCellPoint {
    return { field: c.field, key: c.key, rowIndex: this.find(c) };
  }

  private cornerOf(p: GridCellPoint): CellCorner | null {
    const m = this.model;
    if (!m.columns.defs.has(p.field) || m.columns.isInternal(p.field)) return null;
    let index = -1;
    if (p.key !== undefined) {
      const row = m.data.rowByKey(p.key);
      index = row === undefined ? -1 : m.indexOfRow(row);
    }
    if (index < 0 && p.rowIndex !== undefined) index = p.rowIndex;
    if (index < 0 || index >= m.count) return null;
    return this.corner(index, p.field);
  }

  private apply(next: CellRangeEntry[]): boolean {
    if (this.guard?.wanted() && !this.guard.allow(this.toPublic(next), this.toPublic())) return false;
    this.list = next;
    this.changed();
    return true;
  }

  private changed() {
    this.found = null;
    untracked(() => this.state.version++);
    this.changedEmitter.fire(this.toPublic());
  }
}
