import { createSignal, reactive, read, untracked, type Bind, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import { fillTemplate } from '../../../core/fill-template';
import type { UiStrings } from '../../../core/ui-strings';
import type { GridCustomSummaryInfo } from '../grid-custom-summary-info';
import type { GridGroupSummaryItem } from '../grid-group-summary-item';
import type { GridSummary } from '../grid-summary';
import type { GridSummaryTexts } from '../grid-summary-texts';
import type { GridSummaryType } from '../grid-summary-type';
import type { GridSummaryValue } from '../grid-summary-value';
import { cellValue } from './cell-value';
import type { GridData } from './GridData';
import type { GridModel } from './GridModel';
import type { GroupNode } from './group-node';
import type { PlacedItem } from './placed-item';
import type { SummaryPart } from './summary-part';
import { givenList, givenValue } from '../../../core/given-field';
import { readField } from './read-field';

const TEXT_KEYS: Record<keyof GridSummaryTexts, keyof UiStrings> = {
  sum: 'gridSummarySum',
  sumOtherColumn: 'gridSummarySumOtherColumn',
  min: 'gridSummaryMin',
  minOtherColumn: 'gridSummaryMinOtherColumn',
  max: 'gridSummaryMax',
  maxOtherColumn: 'gridSummaryMaxOtherColumn',
  avg: 'gridSummaryAvg',
  avgOtherColumn: 'gridSummaryAvgOtherColumn',
  count: 'gridSummaryCount',
};

type Steps<T> = { -readonly [K in keyof GridCustomSummaryInfo<T>]: GridCustomSummaryInfo<T>[K] };

/** Unsaved changes the values follow (`recalculateWhileEditing`), by row id. */
interface Edits<T> {
  drafts: Map<string, Readonly<Record<string, unknown>>>;
  removed: Set<string>;
  /** New rows and their values. */
  added: { row: T; draft: Readonly<Record<string, unknown>> }[];
}

/**
 * The grid's summaries: the items of the `summary` prop as they read now, their values and their
 * texts. Totals of rows in memory are calculated at once; a source that loads pages or blocks asks
 * its adapter (`remoteSummary`) or loads every matching row once per row set and works them out
 * here. Group values come with a server's groups, or are calculated per group the first time a row
 * shows it. Unsaved changes count while `recalculateWhileEditing` is on; saved ones always do.
 */
export class GridSummaries<T> {
  /** Called when the state changed (the grid tells its views). */
  notify: ((name: string) => void) | null = null;
  private tell() {
    this.notify?.('summaries');
  }
  readonly state = reactive({ status: 'ready' as 'loading' | 'ready' | 'error', version: 0 });
  /** The grid, which `calculateCustomSummary` receives as `component`. */
  component: unknown = null;
  private readonly given = createSignal<Bind<GridSummary<T>> | undefined>(undefined);
  private readonly totals = createSignal<readonly unknown[]>([]);
  /** Grows on `reread()`: the items are read again. */
  private readonly look = createSignal(0);
  private data: GridData<T> | null = null;
  private subscriptions: IDisposable[] = [];
  private generation = 0;
  private groupCache = new WeakMap<GroupNode, unknown[]>();

  constructor(
    private readonly model: GridModel<T>,
    summary: Bind<GridSummary<T>> | undefined,
  ) {
    this.given.value = summary;
    this.tell();
  }

  /** The `summary` prop as given (a value or a function). */
  get value(): Bind<GridSummary<T>> | undefined {
    return this.given.value;
  }

  set value(summary: Bind<GridSummary<T>> | undefined) {
    this.given.value = summary;
    this.tell();
  }

  /** The summary as it reads now. Reactive. */
  config(): GridSummary<T> {
    void this.look.value;
    return read(this.given.value) ?? {};
  }

  /** How many times `reread()` was called: what works the values out reads them again when it grows. */
  get rereads(): number {
    return this.look.peek();
  }

  /** The items and the rows are read again, and the values calculated again: something was changed in place. */
  reread() {
    this.look.value = this.look.peek() + 1;
    this.tell();
  }

  /** The values of `totalItems`, in order. Reactive. */
  get total(): readonly unknown[] {
    return this.totals.value;
  }

  totalItems(): PlacedItem[] {
    return this.place(readField(this.config(), 'totalItems') ?? [], 'totalSummary');
  }

  groupItems(): PlacedItem[] {
    return this.place(readField(this.config(), 'groupItems') ?? [], 'groupSummary');
  }

  /** Whether the row of totals shows: an item is visible. Reactive. */
  showsTotal(): boolean {
    return this.totalItems().some((i) => i.visible);
  }

  /** Whether each open group ends with a footer row. Reactive. */
  /** Everything read of the summary as it is given, as text: what the grid follows of the functions in it. */
  givenKey(): string {
    const c = this.config();
    const item = (i: PlacedItem) => {
      const own = i.item;
      return [i.type, i.field, i.place, i.name, i.footer, i.align, i.visible, readField(own, 'displayFormat'), readField(own, 'alignment'), readField(own, 'cssClass'), readField(own, 'skipEmptyValues'), givenValue(own, 'valueFormat')];
    };
    return JSON.stringify([this.totalItems().map(item), this.groupItems().map(item), readField(c, 'recalculateWhileEditing'), readField(c, 'skipEmptyValues'), readField(c, 'texts')]);
  }

  hasFooters(): boolean {
    return this.groupItems().some((i) => i.visible && i.footer);
  }

  /** What the values depend on (not how they show), as text: a change means working them out again. */
  signature(): string {
    const c = this.config();
    const part = (items: PlacedItem[]) => items.map((i) => [i.type, i.field, i.name, readField(i.item, 'skipEmptyValues')]);
    const s = this.model.settings;
    return JSON.stringify([part(this.totalItems()), part(this.groupItems()), readField(c, 'recalculateWhileEditing'), readField(c, 'skipEmptyValues'), s.get('remoteSummary'), s.get('groupLoadPageSize')]);
  }

  /** The items as a server is requested them, or `null` when the browser has to work them out. */
  serverItems(items: readonly PlacedItem[], adapter: data.DataAdapter<T, unknown>): data.SummaryItem[] | null {
    const remote = this.model.settings.get('remoteSummary');
    if (remote === false || (remote === 'auto' && !adapter.capabilities.summary)) return null;
    const out: data.SummaryItem[] = [];
    for (const i of items) {
      if (i.type === 'count') out.push({ type: 'count' });
      else if (i.type === 'custom' || i.field === undefined || this.model.columns.defs.get(i.field)?.value) return null;
      else out.push({ type: i.type, field: i.field });
    }
    return out;
  }

  /** Follows the rows and the unsaved changes of new data. */
  connect(gridData: GridData<T>) {
    for (const s of this.subscriptions.splice(0)) s.dispose();
    this.data = gridData;
    const source = gridData.source;
    this.subscriptions.push(
      source.onChanged((e) => {
        const all = source.loadMode === 'all';
        const changed = all ? e.reason === 'loaded' || e.reason === 'rows' || e.reason === 'cleared' : e.reason === 'query' || e.reason === 'reload' || e.reason === 'rows';
        if (changed) this.refresh();
      }),
      gridData.tracker.onChanged((e) => {
        // A save reaches the rows, which the source tells.
        if (e.reason === 'saved' || e.reason === 'released') return;
        if (this.followsEdits()) this.refresh(true);
      }),
    );
    this.refresh();
  }

  /** Works the values out again; `editing` when only unsaved changes moved. */
  refresh(editing = false) {
    const gridData = this.data;
    if (!gridData) return;
    this.groupCache = new WeakMap();
    untracked(() => this.state.version++);
    this.tell();
    const items = untracked(() => this.totalItems());
    const source = gridData.source;
    const server = items.length && source.loadMode !== 'all' ? untracked(() => this.serverItems(items, source.adapter)) : null;
    // A server's totals do not move with unsaved changes.
    if (server && editing) return;
    const generation = ++this.generation;
    if (!items.length) {
      this.setTotal([], editing);
      return;
    }
    if (source.loadMode === 'all') {
      // The rows of a query still loading come with `loaded`.
      if (source.status === 'ready') this.setTotal(this.compute(items, source.rows, undefined, true), editing);
      return;
    }
    untracked(() => (this.state.status = 'loading'));
    this.tell();
    const work = server ? source.loadSummary(server) : gridData.everyRow(this.model.settings.get('groupLoadPageSize')).then((rows) => this.compute(items, rows, undefined, true));
    work.then(
      (values) => {
        if (generation === this.generation) this.setTotal(values, editing);
      },
      (error: unknown) => {
        if (generation !== this.generation || data.isAbortError(error)) return;
        untracked(() => (this.state.status = 'error'));
        this.tell();
        const ev = this.model.events;
        ev.tell(ev.dataErrorOccurred, () => ({ error: data.DataError.from(error, 'load'), operation: 'load' as const }));
      },
    );
  }

  /** The values of `groupItems` for a group: a server's, or calculated from its rows once. Reactive. */
  groupValues(node: GroupNode): readonly unknown[] {
    void this.state.version;
    const items = this.groupItems();
    if (!items.length) return [];
    if (node.summary) return node.summary;
    let values = this.groupCache.get(node);
    if (!values) {
      const rows = this.data?.rowsOfGroup(node);
      values = rows ? untracked(() => this.compute(items, rows, node.level, false)) : [];
      this.groupCache.set(node, values);
    }
    return values;
  }

  /** A total value by the item's name, place, type, column or `type_column`, as `getTotalSummaryValue`. Reactive. */
  totalValue(name: string | number): unknown {
    const at = this.find(this.totalItems(), name);
    return at < 0 ? undefined : this.total[at];
  }

  /** A group's value by the item's name (as `totalValue`). Reactive. */
  groupValue(node: GroupNode, name: string | number): unknown {
    const at = this.find(this.groupItems(), name);
    return at < 0 ? undefined : this.groupValues(node)[at];
  }

  /** The visible items of a group with their values and texts, in order; with `footer`, only those of the footer (or of the group row). Reactive. */
  groupEntries(node: GroupNode, footer?: boolean): GridSummaryValue[] {
    const values = this.groupValues(node);
    return this.groupItems()
      .filter((i) => i.visible && (footer === undefined || i.footer === footer))
      .map((i) => ({ name: i.name, column: i.field, summaryType: i.type, value: values[i.index], text: this.text(i, values[i.index], i.field !== node.field) }));
  }

  /** The text of an item with its value; `''` when there is no value to show. */
  text(i: PlacedItem, value: unknown, otherColumn: boolean): string {
    if (value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value))) return '';
    const valueText = this.format(i, value);
    if (i.item.customizeText) return i.item.customizeText({ value, valueText });
    const pattern = readField(i.item, 'displayFormat') ?? this.pattern(i.type, otherColumn && i.field !== undefined);
    return fillTemplate(pattern, { 0: valueText, 1: i.field === undefined ? '' : this.title(i.field) });
  }

  /** An item ready to draw, or `null` when it has no value to show. */
  part(i: PlacedItem, value: unknown, otherColumn: boolean): SummaryPart | null {
    const text = this.text(i, value, otherColumn);
    if (!text) return null;
    return { text, label: otherColumn ? text : this.text(i, value, true), align: readField(i.item, 'alignment') ?? undefined, cssClass: readField(i.item, 'cssClass') ?? undefined };
  }

  /** The parts of the visible items, by the column each shows under. Reactive. */
  partsByColumn(items: readonly PlacedItem[], values: readonly unknown[]): Map<string, SummaryPart[]> {
    const out = new Map<string, SummaryPart[]>();
    for (const i of items) {
      if (!i.visible || i.place === undefined) continue;
      const part = this.part(i, values[i.index], i.place !== i.field);
      if (!part) continue;
      const list = out.get(i.place);
      if (list) list.push(part);
      else out.set(i.place, [part]);
    }
    return out;
  }

  dispose() {
    this.generation++;
    for (const s of this.subscriptions.splice(0)) s.dispose();
    this.data = null;
  }

  private place(items: readonly GridGroupSummaryItem[], setting: 'totalSummary' | 'groupSummary'): PlacedItem[] {
    return givenList(items).map((item, index) => {
      const field = readField(item, 'column') ?? undefined;
      return {
        index,
        item,
        type: readField(item, 'summaryType') ?? 'count',
        field,
        place: readField(item, 'showInColumn') ?? field,
        name: readField(item, 'name') ?? undefined,
        footer: !!readField(item, 'showInGroupFooter'),
        align: !!readField(item, 'alignByColumn'),
        visible: readField(item, 'visible') ?? this.model.settings.get(setting),
      };
    });
  }

  private find(items: readonly PlacedItem[], name: string | number): number {
    return items.findIndex((i, n) => i.name === name || n === name || i.type === name || i.field === name || `${i.type}_${i.field}` === name);
  }

  private followsEdits(): boolean {
    return !!untracked(() => readField(this.config(), 'recalculateWhileEditing'));
  }

  private setTotal(values: readonly unknown[], editing: boolean) {
    untracked(() => {
      this.totals.value = values;
      this.state.status = 'ready';
      this.tell();
    });
    const ev = this.model.events;
    ev.tell(ev.summaryChanged, () => ({ total: values, editing }));
  }

  /** The values of `items` over `rows`; with `withNew`, unsaved new rows count too. */
  private compute(items: readonly PlacedItem[], rows: readonly T[], groupIndex: number | undefined, withNew: boolean): unknown[] {
    const edits = this.followsEdits() ? this.edits() : null;
    let list: readonly T[] = rows;
    // The rows stay as they are; their unsaved values are read beside them.
    const drafts = new Map<T, Readonly<Record<string, unknown>>>();
    if (edits) {
      const tracker = this.data!.tracker;
      const out: T[] = [];
      for (const row of rows) {
        const id = tracker.rowIdOf(row);
        if (edits.removed.has(id)) continue;
        const draft = edits.drafts.get(id);
        if (draft) drafts.set(row, draft);
        out.push(row);
      }
      if (withNew) {
        for (const added of edits.added) {
          drafts.set(added.row, added.draft);
          out.push(added.row);
        }
      }
      list = out;
    }
    const columns = this.model.columns;
    const readerOf = (field: string) => {
      const col = columns.defs.get(field);
      const own = col && !columns.isInternal(field) ? (row: unknown) => cellValue(col, row as T) : (row: unknown) => untracked(() => data.getField(row, field));
      if (!drafts.size) return own;
      return (row: unknown) => {
        const draft = drafts.get(row as T);
        return draft && Object.hasOwn(draft, field) ? draft[field] : own(row);
      };
    };
    const skipAll = untracked(() => readField(this.config(), 'skipEmptyValues')) ?? true;
    const skips = untracked(() => items.map((i) => readField(i.item, 'skipEmptyValues') ?? skipAll));
    const adapter = this.data!.source.adapter;
    const ctx: data.EvaluateContext = { fields: adapter.fields, locale: this.model.formatter.locale, summaryValue: readerOf };
    const builtIn = items.filter((i) => i.type !== 'custom' && (i.type === 'count' || i.field !== undefined));
    const values = data.summarize(
      list,
      builtIn.map((i): data.SummaryItem => ({ type: i.type as data.SummaryType, field: i.field, skipEmpty: skips[i.index] })),
      ctx,
    );
    const out: unknown[] = items.map(() => null);
    builtIn.forEach((i, n) => (out[i.index] = values[n]));
    for (const i of items) if (i.type === 'custom') out[i.index] = this.custom(i, list, groupIndex, skips[i.index], readerOf);
    return out;
  }

  /** A `custom` item: `calculateCustomSummary` through start, a calculate per row, finalize. */
  private custom(i: PlacedItem, rows: readonly T[], groupIndex: number | undefined, skip: boolean, readerOf: (field: string) => (row: unknown) => unknown): unknown {
    const calculate = untracked(() => this.config().calculateCustomSummary);
    if (!calculate) return undefined;
    const value = i.field === undefined ? (row: unknown) => row : readerOf(i.field);
    const info: Steps<T> = { name: i.name, summaryProcess: 'start', value: undefined, totalValue: undefined, groupIndex, component: this.component as Steps<T>['component'] };
    calculate(info);
    info.summaryProcess = 'calculate';
    for (const row of rows) {
      const v = value(row);
      if (skip && i.field !== undefined && data.isEmpty(v)) continue;
      info.value = v;
      calculate(info);
    }
    info.summaryProcess = 'finalize';
    info.value = undefined;
    calculate(info);
    return info.totalValue;
  }

  private edits(): Edits<T> | null {
    const tracker = this.data?.tracker;
    if (!tracker) return null;
    const edits: Edits<T> = { drafts: new Map(), removed: new Set(), added: [] };
    for (const row of tracker.pendingRows()) {
      const rec = tracker.editOf(row);
      if (!rec) continue;
      if (rec.isNew) {
        if (!rec.removed) edits.added.push({ row: rec.row, draft: rec.draft });
      } else if (rec.removed) edits.removed.add(rec.rowId);
      else edits.drafts.set(rec.rowId, rec.draft);
    }
    return edits.drafts.size || edits.removed.size || edits.added.length ? edits : null;
  }

  private pattern(type: GridSummaryType, otherColumn: boolean): string {
    if (type === 'custom') return '{0}';
    const key: keyof GridSummaryTexts = otherColumn && type !== 'count' ? `${type}OtherColumn` : type;
    return readField(this.config(), 'texts')?.[key] ?? this.model.text(TEXT_KEYS[key]);
  }

  private title(field: string): string {
    const cols = this.model.columns;
    return cols.defs.has(field) && !cols.isInternal(field) ? cols.title(field) : field;
  }

  private format(i: PlacedItem, value: unknown): string {
    const formatter = this.model.formatter;
    const given = givenValue<typeof i.item.valueFormat>(i.item, 'valueFormat');
    if (typeof given === 'function' && given.length > 0) return (given as (v: unknown) => string)(value);
    const options = read(given as Bind<Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | undefined>);
    const col = i.field !== undefined && !this.model.columns.isInternal(i.field) ? this.model.columns.defs.get(i.field) : undefined;
    const date = value instanceof Date ? value : col?.type === 'date' ? data.toDate(value) : null;
    if (options && date) return new Intl.DateTimeFormat(formatter.locale, options as Intl.DateTimeFormatOptions).format(date);
    if (options && typeof value === 'number') return new Intl.NumberFormat(formatter.locale, options as Intl.NumberFormatOptions).format(value);
    if (i.type === 'count' && typeof value === 'number') return formatter.count(value);
    if (col && i.type !== 'custom') return formatter.text(col, {} as T, value);
    if (date) return date.toLocaleDateString(formatter.locale);
    return typeof value === 'number' ? formatter.count(value) : String(value);
  }
}
