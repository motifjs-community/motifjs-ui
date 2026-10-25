import { reactive, read } from '@motifx/core';
import type { ColumnFeatures } from '../column-features';
import type { ColumnLayout } from '../column-layout';
import type { ColumnResizeMode } from '../column-resize-mode';
import type { GridColumn } from '../grid-column';
import type { GridLayout } from '../grid-layout';
import type { GridSettings } from '../grid-settings';
import type { StickySide } from '../sticky-side';
import { COLUMN_FEATURES } from './column-feature-names';
import type { ColumnZone } from './column-zone';
import { DEFAULT_SETTINGS } from './default-settings';
import type { StickyOffset } from './sticky-offset';
import { Switches } from './Switches';

/**
 * Field of the row status column: added by the grid, always first, not part of the layout, and shown
 * only while rows can be edited or added (`showsStatus`).
 */
export const STATUS_FIELD = 'mx:status';
/** Field of the check box column of multiple selection: after the status column, pinned to the start. */
export const SELECT_FIELD = 'mx:select';
/** Field of the actions column: at the start or the end, pinned or scrolling, by the settings. */
export const ACTIONS_FIELD = 'mx:actions';
const LOCKED: Partial<ColumnFeatures> = {
  editable: false,
  creatable: false,
  sortable: false,
  resizable: false,
  movable: false,
  hideable: false,
  pinnable: false,
  menu: false,
};

/**
 * Column layout state: order, widths, visibility and sticky sides, and what the user may change per
 * column. Reactive, so views that read `visible()`, `width()` or `can()` inside getters follow every
 * change. Display order is always start-sticky columns, then the free ones, then end-sticky ones,
 * each group in `order`.
 */
export class ColumnModel<T> {
  readonly defs = new Map<string, GridColumn<T>>();
  /** Each column's own feature switches; a value left unset follows the grid's settings. */
  readonly features = new Map<string, Switches<ColumnFeatures>>();
  readonly state = reactive({
    order: [] as string[],
    width: {} as Record<string, number>,
    flex: {} as Record<string, number>,
    hidden: {} as Record<string, boolean>,
    sticky: {} as Record<string, StickySide | null>,
  });

  /** Whether something besides editing needs the status column (unsaved changes made in code). */
  statusWanted: () => boolean = () => false;
  /** Whether the grid has row actions to show. */
  actionsWanted: () => boolean = () => false;
  /** Whether some action sits in the row (not in a bar). */
  actionsInRow: () => boolean = () => true;
  /** The width of the actions column in the `'menu'` display (the "more" button alone), or `null`. */
  actionsMenuWidth: () => number | null = () => null;
  /** Whether a column is out of the columns because the rows are grouped by it. */
  hiddenByGroup: (field: string) => boolean = () => false;

  constructor(
    columns: GridColumn<T>[],
    layout?: GridLayout,
    private readonly settings: Switches<GridSettings> = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS),
  ) {
    this.defs.set(STATUS_FIELD, { field: STATUS_FIELD, title: '', sticky: 'start', align: 'center' });
    this.defs.set(SELECT_FIELD, { field: SELECT_FIELD, title: '', align: 'center' });
    this.defs.set(ACTIONS_FIELD, { field: ACTIONS_FIELD, title: '' });
    for (const field of [STATUS_FIELD, SELECT_FIELD, ACTIONS_FIELD]) this.features.set(field, new Switches<ColumnFeatures>(COLUMN_FEATURES, {}, LOCKED));
    for (const c of columns) {
      if (this.defs.has(c.field)) throw new Error(`[motifx-ui] DataGrid: duplicate or reserved column field "${c.field}"`);
      this.defs.set(c.field, c);
      this.features.set(c.field, new Switches<ColumnFeatures>(COLUMN_FEATURES, {}, c));
    }
    this.reset();
    if (layout) this.applyLayout(layout);
  }

  /** Columns the grid adds itself: row status, selection, actions. */
  isInternal(field: string): boolean {
    return field === STATUS_FIELD || field === SELECT_FIELD || field === ACTIONS_FIELD;
  }

  /** The definition of a column. */
  get(field: string): GridColumn<T> {
    const def = this.defs.get(field);
    if (!def) throw new Error(`[motifx-ui] DataGrid: unknown column "${field}"`);
    return def;
  }

  title(field: string): string {
    return read(this.get(field).title) ?? '';
  }

  /** Alignment of the column's cells: its own, else by type. */
  align(field: string): 'start' | 'center' | 'end' {
    const def = this.get(field);
    return def.align ?? (def.type === 'number' ? 'end' : def.type === 'boolean' ? 'center' : 'start');
  }

  /** Whether the user may use `feature` on this column: the column's own value, else the grid's. */
  can(field: string, feature: keyof ColumnFeatures): boolean {
    const own = this.features.get(field)?.own(feature);
    return typeof own === 'boolean' ? own : this.settings.get(feature);
  }

  /**
   * Whether the search panel looks in a column: its own `searchable`, else off when the column turns
   * its own filters off, else the grid's `searchable`.
   */
  canSearch(field: string): boolean {
    if (this.isInternal(field)) return false;
    const own = this.features.get(field)!;
    const set = own.own('searchable');
    if (typeof set === 'boolean') return set;
    const row = own.own('filterRow');
    const header = own.own('headerFilter');
    if ((row === false && header !== true) || (header === false && row !== true)) return false;
    return this.settings.get('searchable');
  }

  /** Whether `feature` is on for at least one visible column. */
  canAny(feature: keyof ColumnFeatures): boolean {
    let any = false;
    for (const f of this.visible()) any = this.can(f, feature) || any;
    return any;
  }

  /** Whether a cell can be edited in `row`: the column's own value or row function, else the grid's setting (columns with a `value` reader only when they say so). */
  canEdit(field: string, row: T): boolean {
    const own = this.ownRule(field, 'editable');
    if (typeof own === 'function') return !!own(row);
    if (own !== undefined) return own;
    return this.settings.get('editable') && !this.get(field).value;
  }

  /** Whether a cell can be filled in a new row: the column's `creatable`, else its own `editable`, else the grid's `creatable`. */
  canCreate(field: string, row: T): boolean {
    if (this.isInternal(field)) return false;
    const creatable = this.ownRule(field, 'creatable');
    if (typeof creatable === 'function') return !!creatable(row);
    if (creatable !== undefined) return creatable;
    const editable = this.ownRule(field, 'editable');
    if (typeof editable === 'function') return !!editable(row);
    if (editable !== undefined) return editable;
    return this.settings.get('creatable') && !this.get(field).value;
  }

  /** `canCreate` for a new row (never saved yet), `canEdit` for any other. */
  canFill(field: string, row: T, isNew: boolean): boolean {
    return isNew ? this.canCreate(field, row) : this.canEdit(field, row);
  }

  /** Whether the column is editable in some rows. */
  isEditable(field: string): boolean {
    const own = this.ownRule(field, 'editable');
    if (typeof own === 'function') return true;
    if (own !== undefined) return own;
    return this.settings.get('editable') && !this.get(field).value;
  }

  /** The status column shows while rows can be edited or added, or while there are unsaved changes. */
  showsStatus(): boolean {
    if (!this.settings.get('rowStatus')) return false;
    if (this.settings.get('addRows') || this.statusWanted()) return true;
    let editable = false;
    for (const field of this.state.order) if (!this.isInternal(field)) editable = this.isEditable(field) || editable;
    return editable;
  }

  /** The check box column shows in multiple selection, while its setting is on. */
  showsSelect(): boolean {
    return this.settings.get('selection') === 'multiple' && this.settings.get('selectionColumn');
  }

  showsActions(): boolean {
    return this.settings.get('actionsColumn') && this.actionsWanted() && this.actionsInRow();
  }

  /** The edge a column sticks to, or `null`. The grid's own columns take theirs from the settings. */
  sideOf(field: string): StickySide | null {
    if (field === STATUS_FIELD || field === SELECT_FIELD) return 'start';
    if (field === ACTIONS_FIELD) return this.settings.get('actionsSticky') ? this.settings.get('actionsPosition') : null;
    return this.state.sticky[field] ?? null;
  }

  /** Visible data columns (no internal ones), in display order. */
  visibleData(): string[] {
    return this.visible().filter((f) => !this.isInternal(f));
  }

  /** Back to the columns' own settings. */
  reset() {
    const s = this.state;
    s.order = [...this.defs.keys()];
    s.order.sort((a, b) => Number(this.isInternal(b)) - Number(this.isInternal(a)));
    const width: Record<string, number> = {};
    const flex: Record<string, number> = {};
    const hidden: Record<string, boolean> = {};
    const sticky: Record<string, StickySide | null> = {};
    // A column without a width of its own follows the `columnWidth` setting.
    for (const [field, def] of this.defs) {
      if (def.width !== undefined) width[field] = this.clampWidth(field, def.width);
      flex[field] = def.flex ?? 0;
      hidden[field] = !!def.hidden;
      sticky[field] = def.sticky ?? null;
    }
    s.width = width;
    s.flex = flex;
    s.hidden = hidden;
    s.sticky = sticky;
  }

  zoneOf(field: string): ColumnZone {
    return this.sideOf(field) ?? 'free';
  }

  /** Visible fields in display order: status, check boxes, then the zones; the actions column first or last in its zone. */
  visible(): string[] {
    const start: string[] = [];
    const free: string[] = [];
    const end: string[] = [];
    const { order, hidden } = this.state;
    const add = (f: string) => {
      const side = this.sideOf(f);
      (side === 'start' ? start : side === 'end' ? end : free).push(f);
    };
    if (this.showsStatus()) add(STATUS_FIELD);
    if (this.showsSelect()) add(SELECT_FIELD);
    const actions = this.showsActions();
    const first = this.settings.get('actionsPosition') === 'start';
    if (actions && first) add(ACTIONS_FIELD);
    for (const f of order) if (!this.isInternal(f) && !hidden[f] && !this.hiddenByGroup(f)) add(f);
    if (actions && !first) add(ACTIONS_FIELD);
    return [...start, ...free, ...end];
  }

  /** Visible fields of one zone, in display order. */
  zone(zone: ColumnZone): string[] {
    return this.visible().filter((f) => this.zoneOf(f) === zone);
  }

  width(field: string): number {
    if (field === ACTIONS_FIELD) {
      const width = Math.max(0, Math.round(this.settings.get('actionsWidth')));
      const menu = this.actionsMenuWidth();
      return menu === null ? width : Math.min(width, Math.round(menu));
    }
    if (field === STATUS_FIELD) return Math.max(0, Math.round(this.settings.get('rowStatusWidth')));
    if (field === SELECT_FIELD) return Math.max(0, Math.round(this.settings.get('selectionColumnWidth')));
    return this.state.width[field] ?? this.clampWidth(field, this.settings.get('columnWidth'));
  }

  /** The smallest width of a column: its own `minWidth`, else the `columnMinWidth` setting. */
  minWidth(field: string): number {
    return this.get(field).minWidth ?? this.settings.get('columnMinWidth');
  }

  clampWidth(field: string, px: number): number {
    const def = this.get(field);
    const min = this.minWidth(field);
    const max = def.maxWidth ?? Number.POSITIVE_INFINITY;
    return Math.round(Math.min(max, Math.max(min, px)));
  }

  /** `grid-template-columns` for the given visible fields. Sticky columns never flex. */
  template(visible: string[]): string {
    return visible
      .map((f) => {
        const w = this.width(f);
        const flex = this.state.flex[f] ?? 0;
        return flex > 0 && !this.sideOf(f) ? `minmax(${w}px, ${flex}fr)` : `${w}px`;
      })
      .join(' ');
  }

  /** Offsets of the sticky columns from their edge. */
  stickyOffsets(visible: string[]): Map<string, StickyOffset> {
    const out = new Map<string, StickyOffset>();
    let start = 0;
    const starts = visible.filter((f) => this.sideOf(f) === 'start');
    starts.forEach((f, i) => {
      out.set(f, { side: 'start', offset: start, edge: i === starts.length - 1 });
      start += this.width(f);
    });
    let end = 0;
    const ends = visible.filter((f) => this.sideOf(f) === 'end');
    for (let i = ends.length - 1; i >= 0; i--) {
      out.set(ends[i], { side: 'end', offset: end, edge: i === 0 });
      end += this.width(ends[i]);
    }
    return out;
  }

  /** Width taken by the sticky columns at each edge. */
  stickyWidths(visible: string[]): { start: number; end: number } {
    let start = 0;
    let end = 0;
    for (const f of visible) {
      const side = this.sideOf(f);
      if (side === 'start') start += this.width(f);
      else if (side === 'end') end += this.width(f);
    }
    return { start, end };
  }

  /** Sets a width (clamped). Resizing turns flex off for that column. Returns the width set. */
  resize(field: string, px: number): number {
    const w = this.clampWidth(field, px);
    this.state.width[field] = w;
    this.state.flex[field] = 0;
    return w;
  }

  /** How the column's edge is dragged: its own mode, else the grid's. */
  resizeModeOf(field: string): ColumnResizeMode {
    return read(this.get(field).resizeMode) ?? this.settings.get('resizeMode');
  }

  /**
   * The column that gives or takes the width when `field` is resized in `'nextColumn'` mode: the
   * next visible one in its zone, if it can be resized. Without one the column changes alone.
   */
  partnerOf(field: string): string | undefined {
    if (this.resizeModeOf(field) !== 'nextColumn') return undefined;
    const zone = this.zone(this.zoneOf(field));
    const next = zone[zone.indexOf(field) + 1];
    return next !== undefined && this.can(next, 'resizable') ? next : undefined;
  }

  /**
   * Moves the edge between a column and the next one: `field` gets `px`, `next` gets the rest of
   * `total`, both within their limits. Turns flex off for both. Returns the width of `field`.
   */
  resizeWithNext(field: string, next: string, total: number, px: number): number {
    const a = this.get(field);
    const b = this.get(next);
    const lo = Math.max(this.minWidth(field), total - (b.maxWidth ?? Number.POSITIVE_INFINITY));
    const hi = Math.min(a.maxWidth ?? Number.POSITIVE_INFINITY, total - this.minWidth(next));
    if (lo > hi) return this.width(field);
    const w = Math.round(Math.min(hi, Math.max(lo, px)));
    this.state.width[field] = w;
    this.state.width[next] = Math.round(total) - w;
    this.state.flex[field] = 0;
    this.state.flex[next] = 0;
    return w;
  }

  /**
   * Places a column can reach in its zone: up to, not across, the nearest columns that cannot move
   * (they keep their place). `[from, from]` when the column itself cannot move.
   */
  moveRange(field: string): [number, number] {
    const zone = this.zone(this.zoneOf(field));
    const from = zone.indexOf(field);
    if (from < 0 || !this.can(field, 'movable')) return [from, from];
    let lo = from;
    while (lo > 0 && this.can(zone[lo - 1], 'movable')) lo--;
    let hi = from;
    while (hi < zone.length - 1 && this.can(zone[hi + 1], 'movable')) hi++;
    return [lo, hi];
  }

  /** Moves a column to `index` among the visible columns of its zone, within `moveRange`. Hidden columns keep their place. */
  move(field: string, index: number): boolean {
    const zone = this.zone(this.zoneOf(field));
    const from = zone.indexOf(field);
    if (from < 0) return false;
    const [lo, hi] = this.moveRange(field);
    const to = Math.max(lo, Math.min(hi, index));
    if (to === from) return false;
    const next = zone.filter((f) => f !== field);
    next.splice(to, 0, field);
    const order = this.state.order.filter((f) => f !== field);
    // The grid's own columns are placed by the settings, not by the order.
    const after = next.slice(to + 1).find((f) => !this.isInternal(f));
    const before = next.slice(0, to).reverse().find((f) => !this.isInternal(f));
    if (after !== undefined) order.splice(order.indexOf(after), 0, field);
    else if (before !== undefined) order.splice(order.indexOf(before) + 1, 0, field);
    else order.push(field);
    this.state.order = order;
    return true;
  }

  /** Moves by `delta` places within the zone. */
  moveBy(field: string, delta: number): boolean {
    const zone = this.zone(this.zoneOf(field));
    return this.move(field, zone.indexOf(field) + delta);
  }

  /** Hides or shows a column. The last visible data column cannot be hidden. */
  setHidden(field: string, hidden: boolean): boolean {
    if (this.isInternal(field)) return false;
    if (hidden && this.visibleData().length <= 1) return false;
    if (!!this.state.hidden[field] === hidden) return false;
    this.state.hidden[field] = hidden;
    return true;
  }

  setSticky(field: string, side: StickySide | null): boolean {
    if (this.isInternal(field) || (this.state.sticky[field] ?? null) === side) return false;
    this.state.sticky[field] = side;
    return true;
  }

  toLayout(): ColumnLayout[] {
    const s = this.state;
    return s.order
      .filter((f) => !this.isInternal(f))
      .map((field) => ({
        field,
        width: this.width(field),
        flex: s.flex[field] ?? 0,
        hidden: !!s.hidden[field],
        sticky: s.sticky[field] ?? null,
      }));
  }

  /** Applies a saved layout. Unknown fields are ignored; columns missing from it keep their settings and go last. */
  applyLayout(layout: GridLayout) {
    const s = this.state;
    const known = layout.columns.filter((c) => this.defs.has(c.field) && !this.isInternal(c.field));
    const listed = new Set(known.map((c) => c.field));
    const internal = s.order.filter((f) => this.isInternal(f));
    s.order = [...internal, ...known.map((c) => c.field), ...s.order.filter((f) => !listed.has(f) && !this.isInternal(f))];
    for (const c of known) {
      s.width[c.field] = this.clampWidth(c.field, c.width);
      s.flex[c.field] = c.flex ?? 0;
      s.hidden[c.field] = !!c.hidden;
      s.sticky[c.field] = c.sticky ?? null;
    }
    if (this.visibleData().length === 0) {
      const first = s.order.find((f) => !this.isInternal(f));
      if (first) s.hidden[first] = false;
    }
  }

  /** The column's own `editable` or `creatable`: a value, a function of the row, or unset. */
  private ownRule(field: string, feature: 'editable' | 'creatable'): boolean | ((row: T) => boolean) | undefined {
    return this.features.get(field)?.own(feature) as boolean | ((row: T) => boolean) | undefined;
  }
}
