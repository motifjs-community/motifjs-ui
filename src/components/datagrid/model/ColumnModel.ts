import { reactive, untracked } from '@motifx/core';
import type { BandLayout } from '../band-layout';
import type { ColumnFeatures } from '../column-features';
import type { ColumnLayout } from '../column-layout';
import type { ColumnResizeMode } from '../column-resize-mode';
import type { GridBand } from '../grid-band';
import type { GridColumn } from '../grid-column';
import type { GridColumnItem } from '../grid-column-item';
import type { GridLayout } from '../grid-layout';
import type { GridSettings } from '../grid-settings';
import type { StickySide } from '../sticky-side';
import type { BandNode } from './band-node';
import { COLUMN_FEATURES } from './column-feature-names';
import type { ColumnZone } from './column-zone';
import { DEFAULT_SETTINGS } from './default-settings';
import type { StickyOffset } from './sticky-offset';
import { Switches } from './Switches';
import { readField } from './read-field';

/**
 * Field of the row status column: added by the grid, always first, not part of the layout, and shown
 * only while rows can be edited or added (`showsStatus`).
 */
export const STATUS_FIELD = 'mx:status';
/** Field of the check box column of multiple selection: after the status column, pinned to the start. */
export const SELECT_FIELD = 'mx:select';
/** Field of the actions column: at the start or the end, pinned or scrolling, by the settings. */
export const ACTIONS_FIELD = 'mx:actions';
/** Field of the expand column of `masterDetail`: after the status and check box columns, pinned to the start. */
export const EXPAND_FIELD = 'mx:expand';
/** Field of the "…" column that opens a row's adaptive detail: last of the scrolling columns, while columns hide to fit the width. */
export const ADAPTIVE_FIELD = 'mx:adaptive';
/** Field of the drag icon column of `rowDragging`: after the status column, pinned to the start. */
export const DRAG_FIELD = 'mx:drag';
const INTERNAL = [STATUS_FIELD, DRAG_FIELD, SELECT_FIELD, EXPAND_FIELD, ACTIONS_FIELD, ADAPTIVE_FIELD];
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

const isBandItem = <T,>(item: GridColumnItem<T>): item is GridBand<T> => Array.isArray((item as GridBand<T>).columns) || (item as GridBand<T>).isBand === true;

/**
 * Column layout state: order, widths, visibility and sticky sides, and what the user may change per
 * column. Reactive, so views that read `visible()`, `width()` or `can()` inside getters follow every
 * change. Display order is always start-sticky columns, then the free ones, then end-sticky ones,
 * each group in `order`. Bands (`GridBand`) sit over their columns: a band's columns stay together
 * in `order`, pinned, hidden and moved with it; they move only among themselves. Columns the width
 * hides (`columnHidingEnabled`) are omitted of `visible()` and still count as shown everywhere else.
 */
export class ColumnModel<T> {
  readonly defs = new Map<string, GridColumn<T>>();
  /** The bands by id. */
  readonly bands = new Map<string, BandNode<T>>();
  /** Each column's and band's own feature switches; a value left unset follows the grid's settings. */
  readonly features = new Map<string, Switches<ColumnFeatures>>();
  /** Called when the state above changed (the grid tells its views). */
  notify: ((name: string) => void) | null = null;
  readonly state = reactive({
    order: [] as string[],
    width: {} as Record<string, number>,
    flex: {} as Record<string, number>,
    /** By field, and by band id for bands. */
    hidden: {} as Record<string, boolean>,
    /** By field; a band's by its id (its columns follow it). */
    sticky: {} as Record<string, StickySide | null>,
    /** The columns the width hides now, in display order. */
    adaptive: [] as string[],
    /** Grows when a column is added, removed or given another definition. */
    revision: 0,
  });
  /** The fields in the order the columns were given (and added), for `reset`. */
  private readonly given: string[] = [];
  /** The band each column and band sits in, or `null` at the top. */
  private readonly owners = new Map<string, string | null>();
  /** What the last layout applied said of columns the grid did not have; a column added later takes it. */
  private readonly waiting = new Map<string, ColumnLayout>();

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
  /** Whether the expand column of `masterDetail` shows. */
  expandWanted: () => boolean = () => false;
  /** The width of the expand column. */
  expandWidth: () => number = () => 36;
  /** The width of the "…" column. */
  adaptiveWidth: () => number = () => 36;
  /** Whether the drag icon column of `rowDragging` shows. */
  dragWanted: () => boolean = () => false;
  /** The width of the drag icon column. */
  dragWidth: () => number = () => 36;

  constructor(
    columns: readonly GridColumnItem<T>[],
    layout?: GridLayout,
    private readonly settings: Switches<GridSettings> = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS),
  ) {
    this.defs.set(STATUS_FIELD, { field: STATUS_FIELD, title: '', sticky: 'start', align: 'center' });
    this.defs.set(DRAG_FIELD, { field: DRAG_FIELD, title: '', align: 'center' });
    this.defs.set(SELECT_FIELD, { field: SELECT_FIELD, title: '', align: 'center' });
    this.defs.set(ACTIONS_FIELD, { field: ACTIONS_FIELD, title: '' });
    this.defs.set(EXPAND_FIELD, { field: EXPAND_FIELD, title: '', align: 'center' });
    this.defs.set(ADAPTIVE_FIELD, { field: ADAPTIVE_FIELD, title: '', align: 'center' });
    for (const field of INTERNAL) this.features.set(field, this.makeFeatures(LOCKED));
    for (const field of INTERNAL) this.given.push(field);
    this.take(columns, null);
    this.reset();
    if (layout) this.applyLayout(layout);
  }

  /** The data columns' definitions, in the order they were given and added. */
  definitions(): GridColumn<T>[] {
    void this.state.revision;
    return this.given.filter((f) => !this.isInternal(f)).map((f) => this.defs.get(f)!);
  }

  /**
   * Adds a column (or a band with its columns) at `index` among the data columns (default: last),
   * with its own width, visibility and sticky side, or what the last layout applied said of it. A
   * column with `ownerBand` goes into that band.
   */
  add(column: GridColumnItem<T>, index = Number.MAX_SAFE_INTEGER) {
    const before = new Set(this.given);
    const owner = typeof column.ownerBand === 'string' && this.bands.has(column.ownerBand) ? column.ownerBand : null;
    this.take([column], owner);
    const fields = this.given.filter((f) => !before.has(f));
    for (const f of fields) this.given.splice(this.given.indexOf(f), 1);
    const s = this.state;
    const data = s.order.filter((f) => !this.isInternal(f));
    const at = Math.max(0, Math.min(data.length, Math.floor(index)));
    const next = data[at];
    const order = [...s.order];
    order.splice(next === undefined ? order.length : order.indexOf(next), 0, ...fields);
    const given = this.given.filter((f) => !this.isInternal(f));
    const nextGiven = given[at];
    this.given.splice(nextGiven === undefined ? this.given.length : this.given.indexOf(nextGiven), 0, ...fields);
    for (const field of fields) {
      const def = this.defs.get(field)!;
      const kept = this.waiting.get(field);
      this.waiting.delete(field);
      if (def.width !== undefined || kept) s.width[field] = this.clampWidth(field, kept?.width ?? def.width!);
      s.flex[field] = kept ? (kept.flex ?? 0) : (def.flex ?? 0);
      s.hidden[field] = kept ? !!kept.hidden : !!def.hidden;
      s.sticky[field] = kept ? (kept.sticky ?? null) : (def.sticky ?? null);
    }
    for (const [id, band] of this.bands) {
      if (s.hidden[id] === undefined) s.hidden[id] = !!band.def.hidden;
      if (s.sticky[id] === undefined) s.sticky[id] = band.def.sticky ?? null;
    }
    s.order = this.together(order);
    s.revision++;
    this.tell();
  }

  /** Takes a data column out, with its layout; its band keeps its other columns. */
  remove(field: string) {
    if (this.isInternal(field) || !this.defs.has(field)) return;
    const s = this.state;
    this.defs.delete(field);
    this.features.delete(field);
    this.given.splice(this.given.indexOf(field), 1);
    const band = this.owners.get(field);
    if (band) {
      const children = this.bands.get(band)!.children;
      children.splice(children.indexOf(field), 1);
    }
    this.owners.delete(field);
    s.order = s.order.filter((f) => f !== field);
    delete s.width[field];
    delete s.flex[field];
    delete s.hidden[field];
    delete s.sticky[field];
    this.keepOneShown();
    s.revision++;
    this.tell();
  }

  /** Another definition for a column; its layout and feature switches stay. */
  replace(column: GridColumn<T>) {
    const field = column.field;
    if (this.isInternal(field) || !this.defs.has(field)) throw new Error(`[motifx-ui] DataGrid: unknown column "${field}"`);
    this.defs.set(field, column);
    this.state.revision++;
    this.tell();
  }

  /** Columns the grid adds itself: row status, selection, expand, actions, the "…" column. */
  isInternal(field: string): boolean {
    return INTERNAL.includes(field);
  }

  /** The definition of a column. */
  get(field: string): GridColumn<T> {
    const def = this.defs.get(field);
    if (!def) throw new Error(`[motifx-ui] DataGrid: unknown column "${field}"`);
    return def;
  }

  isBand(id: string): boolean {
    return this.bands.has(id);
  }

  /** Whether the columns have bands over them. */
  get hasBands(): boolean {
    return this.bands.size > 0;
  }

  /** The header text of a column or a band; nothing for a column that went (what showed it may still be going). */
  title(field: string): string {
    void this.state.revision;
    const def = this.defs.get(field) ?? this.bands.get(field)?.def;
    return def ? (readField(def, 'title') ?? '') : '';
  }

  /** Alignment of the column's cells: its own, else by type. */
  align(field: string): 'start' | 'center' | 'end' {
    void this.state.revision;
    const def = this.get(field);
    return def.align ?? (def.type === 'number' ? 'end' : def.type === 'boolean' ? 'center' : 'start');
  }

  /** Where a band's caption sits: its own, else the `bandAlign` setting. */
  bandAlign(id: string): 'start' | 'center' | 'end' {
    return readField(this.bands.get(id)?.def, 'align') ?? this.settings.get('bandAlign');
  }

  /** Whether the user may use `feature` on this column or band: its own value, else the grid's. */
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
    if (typeof own === 'function') return !!untracked(() => own(row));
    if (own !== undefined) return own;
    return this.settings.get('editable') && !this.get(field).value;
  }

  /** Whether a cell can be filled in a new row: the column's `creatable`, else its own `editable`, else the grid's `creatable`. */
  canCreate(field: string, row: T): boolean {
    if (this.isInternal(field)) return false;
    const creatable = this.ownRule(field, 'creatable');
    if (typeof creatable === 'function') return !!untracked(() => creatable(row));
    if (creatable !== undefined) return creatable;
    const editable = this.ownRule(field, 'editable');
    if (typeof editable === 'function') return !!untracked(() => editable(row));
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

  /** The edge a column or band sticks to, or `null`: a band's columns stick with the band at the top. The grid's own columns take theirs from the settings. */
  sideOf(field: string): StickySide | null {
    if (field === STATUS_FIELD || field === DRAG_FIELD || field === SELECT_FIELD || field === EXPAND_FIELD) return 'start';
    if (field === ACTIONS_FIELD) return this.settings.get('actionsSticky') ? this.settings.get('actionsPosition') : null;
    if (field === ADAPTIVE_FIELD) return null;
    return this.state.sticky[this.topOf(field)] ?? null;
  }

  /** Visible data columns on the screen (no internal ones, none the width hides), in display order. */
  visibleData(): string[] {
    return this.visible().filter((f) => !this.isInternal(f));
  }

  /** Data columns the user has shown, those the width hides too, in display order. */
  listedData(): string[] {
    return this.arranged(false).filter((f) => !this.isInternal(f));
  }

  /** Back to the columns' own settings. */
  reset() {
    const s = this.state;
    const order = [...this.given];
    order.sort((a, b) => Number(this.isInternal(b)) - Number(this.isInternal(a)));
    s.order = this.together(order);
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
    for (const [id, band] of this.bands) {
      hidden[id] = !!band.def.hidden;
      sticky[id] = band.def.sticky ?? null;
    }
    s.width = width;
    s.flex = flex;
    s.hidden = hidden;
    s.sticky = sticky;
    this.tell();
  }

  zoneOf(field: string): ColumnZone {
    return this.sideOf(field) ?? 'free';
  }

  /** Visible fields in display order: status, check boxes, expand, then the zones; the actions column first or last in its zone, the "…" column last of the scrolling ones. */
  visible(): string[] {
    return this.arranged(true);
  }

  /** Visible fields of one zone, in display order. */
  zone(zone: ColumnZone): string[] {
    return this.visible().filter((f) => this.zoneOf(f) === zone);
  }

  /** The band a column or band sits in, or `null` at the top. */
  bandOf(id: string): string | null {
    return this.owners.get(id) ?? null;
  }

  /** The band at the top over a column or band, or the column itself. */
  topOf(id: string): string {
    let at = id;
    for (let up = this.owners.get(at); up; up = this.owners.get(at)) at = up;
    return at;
  }

  /** How deep a band sits: 1 at the top. */
  depthOf(id: string): number {
    let n = 0;
    for (let at: string | null = id; at; at = this.owners.get(at) ?? null) if (this.bands.has(at)) n++;
    return n;
  }

  /** Whether `field` sits under band `id` (at any depth). */
  isUnder(field: string, id: string): boolean {
    for (let up = this.owners.get(field); up; up = this.owners.get(up)) if (up === id) return true;
    return false;
  }

  /** The visible columns under a band, from a list of visible fields. */
  leavesIn(id: string, visible: readonly string[]): string[] {
    return visible.filter((f) => this.isUnder(f, id));
  }

  /** The bands that show over `visible`, with the columns under each: a band shows while one of its columns does. */
  shownBands(visible: readonly string[]): { id: string; depth: number; first: number; count: number }[] {
    const out: { id: string; depth: number; first: number; count: number }[] = [];
    for (const id of this.bands.keys()) {
      let first = -1;
      let count = 0;
      visible.forEach((f, i) => {
        if (!this.isUnder(f, id)) return;
        if (first < 0) first = i;
        count++;
      });
      if (count > 0) out.push({ id, depth: this.depthOf(id), first, count });
    }
    return out;
  }

  /** Header rows above the columns' own: as many as the deepest band shown. Reactive. */
  bandDepth(): number {
    if (!this.bands.size) return 0;
    let depth = 0;
    for (const b of this.shownBands(this.visible())) depth = Math.max(depth, b.depth);
    return depth;
  }

  /** Whether a band or one above it was hidden itself (not by hiding its columns). */
  inHiddenBand(id: string): boolean {
    for (let at: string | null = id; at; at = this.owners.get(at) ?? null) if (this.bands.has(at) && this.state.hidden[at]) return true;
    return false;
  }

  /** Whether a band shows: not hidden, and one of its columns shows. */
  bandShown(id: string): boolean {
    return this.bands.has(id) && this.visible().some((f) => this.isUnder(f, id));
  }

  width(field: string): number {
    if (field === ACTIONS_FIELD) {
      const width = Math.max(0, Math.round(this.settings.get('actionsWidth')));
      const menu = this.actionsMenuWidth();
      return menu === null ? width : Math.min(width, Math.round(menu));
    }
    if (field === STATUS_FIELD) return Math.max(0, Math.round(this.settings.get('rowStatusWidth')));
    if (field === SELECT_FIELD) return Math.max(0, Math.round(this.settings.get('selectionColumnWidth')));
    if (field === EXPAND_FIELD) return Math.max(0, Math.round(this.expandWidth()));
    if (field === ADAPTIVE_FIELD) return Math.max(0, Math.round(this.adaptiveWidth()));
    if (field === DRAG_FIELD) return Math.max(0, Math.round(this.dragWidth()));
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
    this.tell();
    return w;
  }

  /** How the column's edge is dragged: its own mode, else the grid's. */
  resizeModeOf(field: string): ColumnResizeMode {
    return readField(this.get(field), 'resizeMode') ?? this.settings.get('resizeMode');
  }

  /** Whether a column gets cells only while it is in view: its own `columnRenderingMode`, else the grid's. The grid's own columns always have theirs. Reactive. */
  isVirtual(field: string): boolean {
    if (this.isInternal(field)) return false;
    return (readField(this.get(field), 'columnRenderingMode') ?? this.settings.get('columnRenderingMode')) === 'virtual';
  }

  /** Whether some visible column is virtual. Reactive. */
  anyVirtual(visible: readonly string[]): boolean {
    return visible.some((f) => this.isVirtual(f));
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
    this.tell();
    return w;
  }

  /**
   * What a column or band moves among: the columns and bands shown beside it in its band (or at
   * the top) and its zone, in display order. A band counts once, for all its columns.
   */
  siblings(id: string): string[] {
    const parent = this.bandOf(id);
    const zone = this.zoneOf(id);
    const out: string[] = [];
    for (const f of this.visible()) {
      if (this.zoneOf(f) !== zone) continue;
      const unit = this.childOf(f, parent);
      if (unit !== undefined && out[out.length - 1] !== unit) out.push(unit);
    }
    return out;
  }

  /** The data columns and bands shown beside a column or band in its band (or at the top), in every zone. */
  shownBeside(id: string): string[] {
    const parent = this.bandOf(id);
    const out: string[] = [];
    for (const f of this.visible()) {
      if (this.isInternal(f)) continue;
      const unit = this.childOf(f, parent);
      if (unit !== undefined && !out.includes(unit)) out.push(unit);
    }
    return out;
  }

  /** The data columns and bands in a band (or at the top), in their order, the hidden ones too. */
  childrenOf(parent: string | null): string[] {
    const out: string[] = [];
    for (const f of this.state.order) {
      if (this.isInternal(f)) continue;
      const unit = this.childOf(f, parent);
      if (unit !== undefined && !out.includes(unit)) out.push(unit);
    }
    return out;
  }

  /**
   * Places a column or band can reach among its `siblings`: up to, not across, the nearest that
   * cannot move (they keep their place). `[from, from]` when it cannot move itself.
   */
  moveRange(id: string): [number, number] {
    const units = this.siblings(id);
    const from = units.indexOf(id);
    if (from < 0 || !this.can(id, 'movable')) return [from, from];
    let lo = from;
    while (lo > 0 && this.can(units[lo - 1], 'movable')) lo--;
    let hi = from;
    while (hi < units.length - 1 && this.can(units[hi + 1], 'movable')) hi++;
    return [lo, hi];
  }

  /** Moves a column or band to `index` among its `siblings`, within `moveRange`; a band takes all its columns. Hidden columns keep their place. */
  move(id: string, index: number): boolean {
    const units = this.siblings(id);
    const from = units.indexOf(id);
    if (from < 0) return false;
    const [lo, hi] = this.moveRange(id);
    const to = Math.max(lo, Math.min(hi, index));
    if (to === from) return false;
    const next = units.filter((u) => u !== id);
    next.splice(to, 0, id);
    const inBlock = (f: string, unit: string) => f === unit || this.isUnder(f, unit);
    const block = this.state.order.filter((f) => inBlock(f, id));
    const order = this.state.order.filter((f) => !inBlock(f, id));
    // The grid's own columns are placed by the settings, not by the order.
    const after = next.slice(to + 1).find((u) => !this.isInternal(u));
    const before = next.slice(0, to).reverse().find((u) => !this.isInternal(u));
    if (after !== undefined) order.splice(order.findIndex((f) => inBlock(f, after)), 0, ...block);
    else if (before !== undefined) {
      let last = -1;
      order.forEach((f, i) => inBlock(f, before) && (last = i));
      order.splice(last + 1, 0, ...block);
    } else order.push(...block);
    this.state.order = order;
    this.tell();
    return true;
  }

  /** Moves by `delta` places among its `siblings`. */
  moveBy(id: string, delta: number): boolean {
    return this.move(id, this.siblings(id).indexOf(id) + delta);
  }

  /** Hides or shows a column or band. The last visible data column cannot be hidden. */
  setHidden(id: string, hidden: boolean): boolean {
    if (this.isInternal(id) || (!this.defs.has(id) && !this.bands.has(id))) return false;
    if (hidden && !this.listedData().some((f) => f !== id && !this.isUnder(f, id))) return false;
    if (!!this.state.hidden[id] === hidden) return false;
    this.state.hidden[id] = hidden;
    this.tell();
    return true;
  }

  /** Pins a column or band, or unpins it; a column in a band pins its band at the top. */
  setSticky(id: string, side: StickySide | null): boolean {
    if (this.isInternal(id)) return false;
    const top = this.topOf(id);
    if ((this.state.sticky[top] ?? null) === side) return false;
    this.state.sticky[top] = side;
    this.tell();
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
        sticky: this.bandOf(field) ? null : (s.sticky[field] ?? null),
      }));
  }

  /** The bands' own hidden and sticky state, for the layout. */
  bandLayout(): BandLayout[] {
    const s = this.state;
    return [...this.bands.keys()].map((name) => ({ name, hidden: !!s.hidden[name], sticky: this.bandOf(name) ? null : (s.sticky[name] ?? null) }));
  }

  /** Applies a saved layout. Unknown fields are ignored; columns missing from it keep their settings and go last. A band's columns stay together. */
  applyLayout(layout: GridLayout) {
    const s = this.state;
    const known = layout.columns.filter((c) => this.defs.has(c.field) && !this.isInternal(c.field));
    this.waiting.clear();
    for (const c of layout.columns) if (!this.defs.has(c.field)) this.waiting.set(c.field, c);
    const listed = new Set(known.map((c) => c.field));
    const internal = s.order.filter((f) => this.isInternal(f));
    s.order = this.together([...internal, ...known.map((c) => c.field), ...s.order.filter((f) => !listed.has(f) && !this.isInternal(f))]);
    for (const c of known) {
      s.width[c.field] = this.clampWidth(c.field, c.width);
      s.flex[c.field] = c.flex ?? 0;
      s.hidden[c.field] = !!c.hidden;
      if (!this.bandOf(c.field)) s.sticky[c.field] = c.sticky ?? null;
    }
    for (const b of layout.bands ?? []) {
      if (!this.bands.has(b.name)) continue;
      s.hidden[b.name] = !!b.hidden;
      if (!this.bandOf(b.name)) s.sticky[b.name] = b.sticky ?? null;
    }
    this.keepOneShown();
    this.tell();
  }

  /**
   * The columns the width hides: while the visible columns are wider than `width`, the lowest
   * `hidingPriority` first (given on any column, only columns with one hide), else, with
   * `columnHidingEnabled`, the last one first; the "…" column takes its place. Pinned and grouped
   * columns stay, and so does one data column. Reads the widths kept, never the screen, so hiding
   * cannot feed back into it.
   */
  fitWidth(width: number): string[] {
    const priority = new Map<string, number>();
    for (const f of this.state.order) {
      if (this.isInternal(f)) continue;
      const p = readField(this.defs.get(f), 'hidingPriority');
      if (typeof p === 'number' && Number.isFinite(p)) priority.set(f, p);
    }
    if ((!priority.size && !this.settings.get('columnHidingEnabled')) || width <= 0) return [];
    const shown = this.arranged(false);
    let total = 0;
    for (const f of shown) total += this.width(f);
    if (total <= width) return [];
    total += this.width(ADAPTIVE_FIELD);
    const data = shown.filter((f) => !this.isInternal(f) && !this.sideOf(f));
    const candidates = priority.size ? data.filter((f) => priority.has(f)).sort((a, b) => priority.get(a)! - priority.get(b)!) : [...data].reverse();
    let left = shown.filter((f) => !this.isInternal(f)).length;
    const hidden = new Set<string>();
    for (const f of candidates) {
      if (total <= width || left <= 1) break;
      hidden.add(f);
      total -= this.width(f);
      left--;
    }
    return shown.filter((f) => hidden.has(f));
  }

  /** Visible fields in display order; `adaptive` leaves out the columns the width hides and adds the "…" column. */
  private arranged(adaptive: boolean): string[] {
    const start: string[] = [];
    const free: string[] = [];
    const end: string[] = [];
    const { order, hidden } = this.state;
    void this.state.revision;
    const byWidth = adaptive ? new Set(this.state.adaptive) : null;
    const add = (f: string) => {
      const side = this.sideOf(f);
      (side === 'start' ? start : side === 'end' ? end : free).push(f);
    };
    if (this.showsStatus()) add(STATUS_FIELD);
    if (this.dragWanted()) add(DRAG_FIELD);
    if (this.showsSelect()) add(SELECT_FIELD);
    if (this.expandWanted()) add(EXPAND_FIELD);
    const actions = this.showsActions();
    const first = this.settings.get('actionsPosition') === 'start';
    if (actions && first) add(ACTIONS_FIELD);
    for (const f of order) {
      if (this.isInternal(f) || hidden[f] || this.hiddenByGroup(f) || byWidth?.has(f)) continue;
      if (this.bands.size && this.inHiddenBand(f)) continue;
      add(f);
    }
    if (actions && !first) add(ACTIONS_FIELD);
    if (byWidth?.size) free.push(ADAPTIVE_FIELD);
    return [...start, ...free, ...end];
  }

  /** The child of `parent` (a band, or `null` for the top) that holds `field`, or `undefined` when it is not under it. */
  childOf(field: string, parent: string | null): string | undefined {
    let at = field;
    for (;;) {
      const up = this.owners.get(at) ?? null;
      if (up === parent) return at;
      if (up === null) return undefined;
      at = up;
    }
  }

  /** Every band's columns together, where its first one is; inside a band, in the order they come. */
  private together(order: string[]): string[] {
    if (!this.bands.size) return order;
    const rank = new Map<string, number>();
    order.forEach((f, i) => {
      for (let at: string | null = f; at !== null; at = this.owners.get(at) ?? null) if (!rank.has(at)) rank.set(at, i);
    });
    const out: string[] = [];
    const place = (id: string) => {
      const band = this.bands.get(id);
      if (!band) {
        out.push(id);
        return;
      }
      band.children.filter((c) => rank.has(c)).sort((a, b) => rank.get(a)! - rank.get(b)!).forEach(place);
    };
    const tops = [...rank.keys()].filter((id) => (this.owners.get(id) ?? null) === null).sort((a, b) => rank.get(a)! - rank.get(b)!);
    tops.forEach(place);
    return out;
  }

  /** Takes columns and bands into the model, under `owner`; flat ones with `ownerBand` go under that band. */
  private take(items: readonly GridColumnItem<T>[], owner: string | null) {
    const placed: { id: string; item: GridColumnItem<T> }[] = [];
    // A band without a name is named by its place: `band-2`, `band-2-0` …
    const base = owner === null ? this.topCount() : this.bands.get(owner)!.children.length;
    const walk = (list: readonly GridColumnItem<T>[], parent: string | null, path: string | null) => {
      list.forEach((item, i) => {
        const at = path !== null ? `${path}-${i}` : owner === null ? String(base + i) : `${owner}-${base + i}`;
        if (isBandItem(item)) {
          const id = item.name ?? `band-${at}`;
          if (this.defs.has(id) || this.bands.has(id)) throw new Error(`[motifx-ui] DataGrid: duplicate band or column name "${id}"`);
          this.bands.set(id, { id, def: item, children: [] });
          this.features.set(id, this.makeFeatures(item));
          this.adopt(id, parent);
          placed.push({ id, item });
          walk(item.columns ?? [], id, at);
          return;
        }
        this.check(item);
        this.defs.set(item.field, item);
        this.features.set(item.field, this.makeFeatures(item));
        this.given.push(item.field);
        this.adopt(item.field, parent);
        placed.push({ id: item.field, item });
      });
    };
    walk(items, owner, null);
    // Given flat: `ownerBand` names a band, or its place in the list.
    const list = placed.filter((p) => this.owners.get(p.id) === owner).map((p) => p.id);
    for (const { id, item } of placed) {
      const named = item.ownerBand;
      if (named === undefined || this.owners.get(id) !== owner) continue;
      const band = typeof named === 'number' ? list[named] : named;
      if (band && band !== id && this.bands.has(band) && !this.isUnder(band, id)) this.adopt(id, band);
    }
  }

  /** How many columns and bands sit at the top already, so a band added later gets a name of its own. */
  private topCount(): number {
    let n = 0;
    for (const [id, up] of this.owners) if (up === null && (this.bands.has(id) || this.defs.has(id))) n++;
    return n;
  }

  /** Puts a column or band under `parent` (taking it from where it was). */
  private adopt(id: string, parent: string | null) {
    const was = this.owners.get(id);
    if (was) {
      const children = this.bands.get(was)!.children;
      children.splice(children.indexOf(id), 1);
    }
    this.owners.set(id, parent);
    if (parent) this.bands.get(parent)!.children.push(id);
  }

  private tell() {
    this.notify?.('columns');
  }

  /** A column's (or band's) own feature switches; a change to them is a change of the columns. */
  private makeFeatures(given: object): Switches<ColumnFeatures> {
    const features = new Switches<ColumnFeatures>(COLUMN_FEATURES, {}, given);
    features.notify = () => this.tell();
    return features;
  }

  /** At least one data column stays shown. */
  private keepOneShown() {
    if (this.listedData().length > 0) return;
    const s = this.state;
    const first = s.order.find((f) => !this.isInternal(f));
    if (!first) return;
    s.hidden[first] = false;
    for (let up = this.owners.get(first); up; up = this.owners.get(up)) s.hidden[up] = false;
    this.tell();
  }

  private check(column: GridColumn<T>) {
    if (typeof column?.field !== 'string') throw new Error('[motifx-ui] DataGrid: a column needs a field');
    if (this.defs.has(column.field) || this.bands.has(column.field)) throw new Error(`[motifx-ui] DataGrid: duplicate or reserved column field "${column.field}"`);
  }

  /** The column's own `editable` or `creatable`: a value, a function of the row, or unset. */
  private ownRule(field: string, feature: 'editable' | 'creatable'): boolean | ((row: T) => boolean) | undefined {
    return this.features.get(field)?.own(feature) as boolean | ((row: T) => boolean) | undefined;
  }
}
