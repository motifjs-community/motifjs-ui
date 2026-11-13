import { reactive, untracked, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import { dayCondition } from './day-condition';
import type { GridModel } from './GridModel';
import { parseDateText } from './parse-date-text';
import { textRanges } from './text-ranges';

type Filter = data.FilterExpression | null;
/** How a column's cells are marked: the text found inside them, or the whole cell when its value is the one searched for. */
type Mark = 'part' | ((value: unknown) => boolean);

/** Items of a lookup's source a search turns into keys, at most. */
const LOOKUP_LIMIT = 100;

/**
 * The search panel: one text looked for in every searchable column at once. Each column gives a
 * condition by its type (text: contains; numbers, dates, yes/no: equal when the text reads as one;
 * lists and lookups: the keys whose text holds it), the conditions are joined with OR and go to the
 * filters, AND-ed with the others. A text no column can read keeps no row.
 */
export class GridSearch<T> {
  /** `text` is the box's text; `applied` the text whose filter is on the rows. */
  /** Called when the state changed (the grid tells its views). */
  notify: ((name: string) => void) | null = null;
  private tell() {
    this.notify?.('search');
  }
  readonly state = reactive({ text: '', applied: '' });
  private timer: ReturnType<typeof setTimeout> | undefined;
  private run = 0;
  private marks = new Map<string, Mark>();
  private loaded: IDisposable | null = null;
  private disposed = false;
  /** Called when the text changes (typed or set programmatically). */
  onTextChanged: ((text: string) => void) | null = null;

  constructor(private readonly model: GridModel<T>) {}

  /** Changes the text; a typed one waits `searchDelay` before it searches. */
  setText(text: string, typed = false) {
    clearTimeout(this.timer);
    this.timer = undefined;
    const previous = this.state.text;
    if (previous !== text) {
      const { events } = this.model;
      if (!events.ask(events.searchTextChanging, () => ({ text, previous, cancel: false }))) {
        // The box shows the text it had.
        this.state.text = text;
        this.state.text = previous;
        this.tell();
        return;
      }
      this.state.text = text;
      this.tell();
      this.onTextChanged?.(text);
    }
    const delay = typed ? Math.max(0, this.model.settings.get('searchDelay')) : 0;
    if (delay > 0) this.timer = setTimeout(() => this.apply(), delay);
    else this.apply();
  }

  /**
   * The text the grid starts with, before its data is connected: the filter goes into the first
   * load, unless a lookup's source has to be asked (then it follows).
   */
  start(text: string) {
    this.state.text = text;
    this.tell();
    const marks = new Map<string, Mark>();
    const filter = this.filterFor(text, marks);
    if (filter instanceof Promise) {
      queueMicrotask(() => !this.disposed && this.apply());
      return;
    }
    this.marks = marks;
    this.state.applied = filter ? text.trim() : '';
    this.tell();
    this.model.filters.setSearch(filter);
  }

  /** Searches at once for a text still waiting for the typing pause. */
  flush() {
    if (this.timer === undefined) return;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.apply();
  }

  /** Searches again for the same text (the searched columns changed). */
  refresh() {
    if (this.state.applied) this.apply();
  }

  /** The fields searched now, in column order. Reactive. */
  fields(): string[] {
    const cols = this.model.columns;
    const onlyVisible = this.model.settings.get('searchVisibleColumnsOnly');
    const own = this.model.ownsRows;
    return cols.state.order.filter((f) => {
      if (!cols.canSearch(f) || (onlyVisible && cols.state.hidden[f])) return false;
      // A computed column exists only in the rows the grid holds itself.
      return own || !cols.get(f).value;
    });
  }

  /**
   * The filter of a text: each searched column's condition, joined with OR; `null` for an empty
   * text, `data.none()` when no column can read it. A promise when a lookup's source is asked.
   */
  filterFor(text: string, marks = new Map<string, Mark>()): Filter | Promise<Filter> {
    const plain = text.trim();
    if (!plain) return null;
    const parts = this.fields().map((f) => this.columnFilter(this.model.columns.get(f), plain, marks));
    const join = (list: Filter[]) => {
      const found = list.filter((p): p is data.FilterExpression => !!p);
      return found.length ? data.or(...found) : data.none();
    };
    if (!parts.some((p) => p instanceof Promise)) return join(parts as Filter[]);
    return Promise.all(parts).then(join);
  }

  /** Whether cells are marked now: a search is on and marking is. Reactive. */
  marking(): boolean {
    return !!this.state.applied && this.model.settings.get('highlightSearchText');
  }

  /**
   * Where a cell shows what the search found: ranges of `shown` to mark. Empty when the search, its
   * marking or the column is off, or the cell did not match. Reactive.
   */
  ranges(field: string, shown: string, value: unknown): [number, number][] {
    const applied = this.state.applied;
    if (!applied || !shown || !this.model.settings.get('highlightSearchText')) return [];
    const mark = this.marks.get(field);
    if (!mark) return [];
    if (mark !== 'part') return (Array.isArray(value) ? value.some(mark) : mark(value)) ? [[0, shown.length]] : [];
    return textRanges(shown, applied.trim(), this.model.formatter.locale, this.model.settings.get('highlightCaseSensitive'));
  }

  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
    this.loaded?.dispose();
  }

  private apply() {
    this.timer = undefined;
    const text = untracked(() => this.state.text);
    const run = ++this.run;
    const marks = new Map<string, Mark>();
    const result = untracked(() => this.filterFor(text, marks));
    const done = (filter: Filter) => {
      if (run !== this.run || this.disposed) return;
      this.marks = marks;
      this.state.applied = filter ? text.trim() : '';
      this.tell();
      this.model.filters.setSearch(filter);
      this.model.queueFilter();
      this.announceWhenLoaded(filter !== null);
    };
    if (result instanceof Promise) void result.then(done, () => done(data.none()));
    else done(result);
  }

  /** Tells assistive technology how many rows the search found once they are there. */
  private announceWhenLoaded(on: boolean) {
    this.loaded?.dispose();
    this.loaded = null;
    if (!on) return;
    const source = this.model.data.source;
    const sub = source.onChanged((e) => {
      if (e.reason !== 'loaded') return;
      sub.dispose();
      if (this.loaded === sub) this.loaded = null;
      const model = this.model;
      model.announce(model.text('gridSearchResults', { count: model.dataTotal }));
    });
    this.loaded = sub;
  }

  /** One column's condition for the text, or `null` when it cannot read it; notes how its cells are marked. */
  private columnFilter(col: GridColumn<T>, text: string, marks: Map<string, Mark>): Filter | Promise<Filter> {
    const field = col.field;
    if (col.lookup) return this.lookupFilter(col, text, marks);
    const locale = this.model.formatter.locale;
    switch (col.type) {
      case 'number': {
        const read = this.model.formatter.parse(col, text, undefined);
        if (!read.ok || typeof read.value !== 'number') return null;
        const n = read.value;
        marks.set(field, (v) => v === n || (typeof v === 'string' && Number(v) === n));
        return data.where(field, '=', n);
      }
      case 'date': {
        const day = parseDateText(text, locale);
        if (!day) return null;
        const at = data.dayNumber(day);
        marks.set(field, (v) => data.dayNumber(v) === at);
        return dayCondition(field, '=', day);
      }
      case 'boolean': {
        const lower = text.toLocaleLowerCase(locale);
        const [yes, no] = [this.model.text('yes'), this.model.text('no')].map((t) => t.toLocaleLowerCase(locale));
        if (lower !== yes && lower !== no) return null;
        const value = lower === yes;
        marks.set(field, (v) => !!v === value && v !== null && v !== undefined);
        return data.where(field, '=', value);
      }
      case 'list': {
        const choices = this.model.choices.of(col);
        if (!choices) return null;
        const lower = text.toLocaleLowerCase(locale);
        const values = choices.filter((o) => o.label.toLocaleLowerCase(locale).includes(lower)).map((o) => o.value);
        if (!values.length) return null;
        marks.set(field, 'part');
        return data.where(field, 'in', values);
      }
      default:
        marks.set(field, 'part');
        return data.where(field, 'contains', text);
    }
  }

  /**
   * A lookup column: the row's own text (`textFrom` as a field) holds the text, or the column's key
   * is one of the items whose text holds it, found in the lookup's source (which may be another
   * service), at most `searchLimit` of them.
   */
  private lookupFilter(col: GridColumn<T>, text: string, marks: Map<string, Mark>): Filter | Promise<Filter> {
    const field = col.field;
    if (typeof col.textFrom === 'string') {
      marks.set(field, 'part');
      return data.where(col.textFrom, 'contains', text);
    }
    const lookups = this.model.lookups;
    const items = lookups.items(col);
    if (!items) return null;
    const limit = Math.max(1, col.lookup!.searchLimit ?? LOOKUP_LIMIT);
    const search = lookups.search(col, null);
    const toFilter = (found: readonly unknown[]): Filter => {
      const keys: unknown[] = [];
      const seen = new Set<string>();
      for (const item of found) {
        const key = items.valueOf(item);
        const ks = `${typeof key}:${String(key)}`;
        if (data.isEmpty(key) || seen.has(ks)) continue;
        seen.add(ks);
        keys.push(key);
      }
      return keys.length ? data.where(field, 'in', keys) : null;
    };
    marks.set(field, 'part');
    const now = items.searchInMemory(text, search, 0, limit);
    if (now) return toFilter(now.items);
    return items.search(text, search, 0, limit).then((r) => toFilter(r.items), () => null);
  }
}
