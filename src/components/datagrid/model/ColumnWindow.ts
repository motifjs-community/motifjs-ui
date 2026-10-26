import type { GridSettings } from '../grid-settings';
import type { ColumnModel } from './ColumnModel';
import type { Switches } from './Switches';

/**
 * The columns that get cells while some columns are virtual (`columnRenderingMode: 'virtual'`): the
 * pinned ones, the scrolling ones in view with `extraColumns` more on each side, the ones kept (the
 * active column, the one in edit) and every column that is not virtual. Worked out from the widths
 * the columns are given, not from the DOM, so a column without cells still has its place.
 */
export class ColumnWindow<T> {
  /** Every column gets cells for now (fitting them all to their content). */
  everything = false;
  /** The fields that get cells; `null` while every column does. */
  private drawn: Set<string> | null = null;

  constructor(
    private readonly columns: ColumnModel<T>,
    private readonly settings: Switches<GridSettings>,
  ) {}

  /** No column is left without cells now. */
  get all(): boolean {
    return this.drawn === null;
  }

  /** Whether a column gets cells now. */
  has(field: string): boolean {
    return this.drawn === null || this.drawn.has(field);
  }

  /** How many columns get cells now, out of `visible`. */
  count(visible: readonly string[]): number {
    return this.drawn === null ? visible.length : visible.filter((f) => this.drawn!.has(f)).length;
  }

  /**
   * Works the columns out again for rows scrolled `start` pixels sideways (from the inline start) in
   * a viewport `width` pixels wide; `true` when other columns get cells now.
   */
  update(visible: readonly string[], start: number, width: number, keep: readonly string[]): boolean {
    const next = this.everything ? null : this.find(visible, start, width, keep);
    const now = this.drawn;
    const same = next === null || now === null ? next === now : next.size === now.size && [...next].every((f) => now.has(f));
    if (same) return false;
    this.drawn = next;
    return true;
  }

  /** Where a column starts from the inline start of the row, by the widths given. */
  offsetOf(field: string, visible: readonly string[]): number {
    let x = 0;
    for (const f of visible) {
      if (f === field) return x;
      x += this.columns.width(f);
    }
    return x;
  }

  private find(visible: readonly string[], start: number, width: number, keep: readonly string[]): Set<string> | null {
    const cols = this.columns;
    if (!cols.anyVirtual(visible)) return null;
    const out = new Set<string>();
    for (const f of keep) if (visible.includes(f)) out.add(f);
    const pinned = cols.stickyWidths([...visible]);
    // The part of the row the scrolling columns show in.
    const from = start + pinned.start;
    const to = start + Math.max(0, width) - pinned.end;
    const free: string[] = [];
    let first = -1;
    let last = -1;
    let x = 0;
    for (const f of visible) {
      const w = cols.width(f);
      const side = cols.sideOf(f);
      if (side || !cols.isVirtual(f)) out.add(f);
      if (!side) {
        if (x + w > from && x < to) {
          if (first < 0) first = free.length;
          last = free.length;
        }
        free.push(f);
      }
      x += w;
    }
    // Not measured yet: the first columns.
    if (first < 0) first = 0;
    const extra = Math.max(0, Math.floor(this.settings.get('extraColumns')));
    for (let i = Math.max(0, first - extra); i <= Math.min(free.length - 1, last + extra); i++) out.add(free[i]);
    return out;
  }
}
