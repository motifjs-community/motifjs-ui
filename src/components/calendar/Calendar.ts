import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { clearParts, glyphPart, part, removePart } from '../../core/draw-parts';
import { focusOn, holdsFocus, isFocused } from '../../core/focus';
import { functionValue } from '../../core/function-value';
import { isRtl } from '../../core/measure';
import { mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { addDays } from '../../parts/dates/add-days';
import { addMonths } from '../../parts/dates/add-months';
import { dayStart } from '../../parts/dates/day-start';
import { firstDayOfWeek } from '../../parts/dates/first-day-of-week';
import { isoWeek } from '../../parts/dates/iso-week';
import { sameDay } from '../../parts/dates/same-day';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import type { CalendarProps } from './calendar-props';
import type { CalendarView } from './calendar-view';
import { onLanguage } from '../../core/on-language';

const OWN = ['value', 'min', 'max', 'firstDayOfWeek', 'locale', 'showWeekNumbers', 'showOtherMonths', 'showTodayButton', 'currentView', 'minView', 'rangeStart', 'rangeEnd'] as const;

const DRAWN = ['value', 'min', 'max', 'disabledDates', 'firstDayOfWeek', 'locale', 'showWeekNumbers', 'showOtherMonths', 'minView', 'rangeStart', 'rangeEnd'] as const;

const VIEWS: CalendarView[] = ['month', 'year', 'decade'];

const PARTS = Symbol('mx.calendar');

interface Grid {
  shape: string;
  week: Component<HTMLElement> | null;
  heads: Component<HTMLTableCellElement>[];
  rowHeads: Component<HTMLTableCellElement>[];
  cells: Component<HTMLTableCellElement>[];
}

interface Parts {
  previousPart: Component<HTMLButtonElement>;
  titlePart: Component<HTMLButtonElement>;
  nextPart: Component<HTMLButtonElement>;
  gridPart: Component<HTMLTableElement>;
  footPart: Component<HTMLDivElement>;
  today: Component<HTMLButtonElement> | null;
  /** The grid's parts, built once for its shape. */
  grid: Grid | null;
  /** The cells drawn with a date, to tell which one an event came from. */
  cells: { part: Component<HTMLTableCellElement>; time: number; enabled: boolean }[];
  /** The drawn cell with the Tab stop. */
  stopCell: Component<HTMLTableCellElement> | null;
  /** The cell with the Tab stop, in every view. */
  focused: Date;
  view: CalendarView;
  /** Drawing waits until every prop is in. */
  ready: boolean;
  valueChanged: Emitter<ValueChangedEventArgs<Date | null>>;
  pointed: Emitter<Date | null>;
  /** The day last told to `onDayPointed`, so the same one is not told again. */
  lastPointed: number | null;
  focusedChanged: Emitter<Date>;
  /** The date last told to `onFocusedDateChanged`. */
  lastFocused: number;
}

/**
 * A month of days for selecting a date (the APG date grid), with year and decade views for moving
 * quickly. The month and day names come from the locale.
 *
 * @example
 * <Calendar x-model={() => this.form.day} min={new Date()} disabledDates={(d) => d.getDay() === 0} />
 */
export class Calendar extends Control<HTMLDivElement, CalendarProps> {
  constructor(props?: IBaseProp<CalendarProps>) {
    super('div', props);
    const own = (this.props ?? {}) as CalendarProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.disabledDates !== undefined) this.bindProperty('disabledDates', functionValue(own.disabledDates));
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);
    if (own.onDayPointed) this.onDayPointed(own.onDayPointed);
    if (own.onFocusedDateChanged) this.onFocusedDateChanged(own.onFocusedDateChanged);
    const parts = this.parts;
    // A new value, from wherever it comes, shows its month.
    this.observeProperty<Date | null>('value', (value) => {
      if (value) parts.focused = dayStart(value);
    });
    for (const name of DRAWN) this.observeProperty(name, () => this.render());
    // The kit's language: the month's names, the first day of the week.
    onLanguage(this, () => this.render());
    this.observeProperty<CalendarView | undefined>('currentView', (view) => {
      if (!view) return;
      parts.view = view;
      this.render();
    });
    parts.ready = true;
    this.render();
    this.observeProperty<boolean>('showTodayButton', (on) => this.renderToday(!!on));
    // The kit's language, or another view: the buttons' names are written again.
    const drawTexts = () => {
      const strings = uiLocale.strings;
      const view = this.peekProperty<CalendarView | undefined>('shownView') ?? 'month';
      const [back, forward] = view === 'month' ? [strings.previousMonth, strings.nextMonth] : view === 'year' ? [strings.previousYear, strings.nextYear] : [strings.previousYears, strings.nextYears];
      put(parts.previousPart, 'aria-label', back);
      put(parts.nextPart, 'aria-label', forward);
      if (parts.today) text(parts.today, strings.today);
    };
    const stopTexts = onLanguage(this, drawTexts);
    this.observeProperty('shownView', drawTexts);
    parts.gridPart.motif.on('keydown', (_, e) => this.keyDown(e));
    parts.gridPart.motif.on('click', (_, e) => this.clicked(e));
    parts.gridPart.motif.on('pointerover', (_, e) => this.pointedOver(e));
    parts.gridPart.motif.on('pointerleave', () => this.point(null));
    parts.previousPart.motif.on('click', () => this.page(-1));
    parts.nextPart.motif.on('click', () => this.page(1));
    parts.titlePart.motif.on('click', () => this.zoomOut());
    this.motif.setDisposable(() => {
      stopTexts();
      parts.valueChanged.dispose();
      parts.pointed.dispose();
      parts.focusedChanged.dispose();
    });
  }

  get value(): Date | null {
    return this.getProperty<Date | null | undefined>('value') ?? null;
  }
  set value(value: Bind<Date | null>) {
    const before = this.peekProperty<Date | null>('value') ?? null;
    this.assignProperty('value', value, (v) => (v instanceof Date && !isNaN(+v) ? v : null));
    const date = this.peekProperty<Date | null>('value') ?? null;
    if (date) this.goTo(date);
    // A day set programmatically shows in `x-model` too, so the model and the calendar never differ.
    if (typeof value !== 'function' && date !== before) this.bindings.writeModel(date);
  }
  get min(): Date | null {
    return this.getProperty<Date | null | undefined>('min') ?? null;
  }
  set min(value: Bind<Date | null>) {
    this.assignProperty('min', value);
  }
  get max(): Date | null {
    return this.getProperty<Date | null | undefined>('max') ?? null;
  }
  set max(value: Bind<Date | null>) {
    this.assignProperty('max', value);
  }
  get disabledDates(): ((date: Date) => boolean) | null {
    return this.getProperty<((date: Date) => boolean) | null | undefined>('disabledDates') ?? null;
  }
  set disabledDates(value: Bind<((date: Date) => boolean) | null>) {
    this.assignProperty('disabledDates', functionValue(value));
  }
  get firstDayOfWeek(): number {
    return this.getProperty<number | null | undefined>('firstDayOfWeek') ?? firstDayOfWeek(this.locale);
  }
  set firstDayOfWeek(value: Bind<number | null>) {
    this.assignProperty('firstDayOfWeek', value);
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') || uiLocale.locale;
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get showWeekNumbers(): boolean {
    return !!this.getProperty<boolean>('showWeekNumbers');
  }
  set showWeekNumbers(value: Bind<boolean>) {
    this.assignProperty('showWeekNumbers', value, Boolean);
  }
  get showOtherMonths(): boolean {
    return this.getProperty<boolean | undefined>('showOtherMonths') !== false;
  }
  set showOtherMonths(value: Bind<boolean>) {
    this.assignProperty('showOtherMonths', value, Boolean);
  }
  get showTodayButton(): boolean {
    return !!this.getProperty<boolean>('showTodayButton');
  }
  set showTodayButton(value: Bind<boolean>) {
    this.assignProperty('showTodayButton', value, Boolean);
  }
  get minView(): CalendarView {
    return this.getProperty<CalendarView | undefined>('minView') ?? 'month';
  }
  set minView(value: Bind<CalendarView>) {
    this.assignProperty('minView', value);
  }

  /** The current view. Reactive. Set it to show that view. */
  get currentView(): CalendarView {
    return this.getProperty<CalendarView | undefined>('shownView') ?? this.parts.view;
  }
  set currentView(value: Bind<CalendarView>) {
    this.assignProperty('currentView', value);
  }

  /** The date with the Tab stop. Its month or year is the one on screen. */
  get focusedDate(): Date {
    return this.parts.focused;
  }

  get rangeStart(): Date | null {
    return this.getProperty<Date | null | undefined>('rangeStart') ?? null;
  }
  set rangeStart(value: Bind<Date | null>) {
    this.assignProperty('rangeStart', value);
  }
  get rangeEnd(): Date | null {
    return this.getProperty<Date | null | undefined>('rangeEnd') ?? null;
  }
  set rangeEnd(value: Bind<Date | null>) {
    this.assignProperty('rangeEnd', value);
  }

  /** Occurs when the pointer moves over a day in the month view, or leaves the days (`null`). */
  get onDayPointed(): MotifEvent<Date | null> {
    return this.parts.pointed.event;
  }

  get onValueChanged(): MotifEvent<ValueChangedEventArgs<Date | null>> {
    return this.parts.valueChanged.event;
  }

  /** Occurs when the Tab stop moves to another date, by the user or by `goTo`, so the month or year on screen may be another. */
  get onFocusedDateChanged(): MotifEvent<Date> {
    return this.parts.focusedChanged.event;
  }

  /** Shows the month of `date` and places the Tab stop on it. */
  goTo(date: Date): void {
    this.parts.focused = dayStart(date);
    this.render();
  }

  /** Sets focus on the cell with the Tab stop. */
  override focus(): boolean {
    const cell = this.parts.stopCell;
    if (!cell || !this.isEnabled) return false;
    focusOn(cell);
    return isFocused(cell);
  }

  /** Indicates whether `date` can be selected: within min and max, and not one of the disabled dates. */
  canChoose(date: Date): boolean {
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    if (min && dayStart(date) < dayStart(min)) return false;
    if (max && dayStart(date) > dayStart(max)) return false;
    return !this.peekProperty<((d: Date) => boolean) | null>('disabledDates')?.(date);
  }

  override get focusPart(): ComponentBase {
    return this.parts.gridPart;
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-calendar');
    const header = part<HTMLDivElement>(this, 'div', 'mx-calendar__header');
    const button = (className: string) => {
      const b = part<HTMLButtonElement>(header, 'button', className);
      b.attr.add({ type: 'button' });
      return b;
    };
    const previousPart = button('mx-calendar__nav mx-calendar__previous');
    glyphPart(previousPart, 'chevron-down');
    const titlePart = button('mx-calendar__title');
    titlePart.attr.add({ 'aria-live': 'polite' });
    const nextPart = button('mx-calendar__nav mx-calendar__next');
    glyphPart(nextPart, 'chevron-down');
    const gridPart = part<HTMLTableElement>(this, 'table', 'mx-calendar__grid');
    gridPart.attr.add({ role: 'grid' });
    const footPart = part<HTMLDivElement>(this, 'div', 'mx-calendar__foot');
    const focused = dayStart(new Date());
    return {
      previousPart,
      titlePart,
      nextPart,
      gridPart,
      footPart,
      today: null,
      grid: null,
      cells: [],
      stopCell: null,
      focused,
      view: 'month',
      ready: false,
      valueChanged: new Emitter(),
      pointed: new Emitter(),
      lastPointed: null,
      focusedChanged: new Emitter(),
      lastFocused: +focused,
    };
  }

  private get firstDay(): number {
    return this.peekProperty<number | null>('firstDayOfWeek') ?? firstDayOfWeek(this.currentLocale);
  }

  private get currentLocale(): string {
    return this.peekProperty<string>('locale') || uiLocale.locale;
  }

  private render(): void {
    const parts = this.parts;
    if (!parts.ready) return;
    const view = parts.view;
    const minView = this.peekProperty<CalendarView>('minView') ?? 'month';
    if (VIEWS.indexOf(view) < VIEWS.indexOf(minView)) parts.view = minView;
    this.setProperty('shownView', parts.view);
    put(this, 'data-view', parts.view);
    const focusInside = holdsFocus(parts.gridPart);
    const locale = this.currentLocale;
    const focused = parts.focused;
    // The grid is built once for its shape (the view, the week numbers); another month, value or focus writes only
    // the cells' texts and marks. Another shape builds the grid again.
    const shape = `${parts.view}|${parts.view === 'month' && !!this.peekProperty('showWeekNumbers')}`;
    if (parts.grid?.shape !== shape) {
      clearParts(parts.gridPart);
      parts.grid = this.buildGrid(shape);
    }
    parts.cells = [];
    parts.stopCell = null;
    if (parts.view === 'month') this.renderMonth(locale);
    else this.renderBlock(locale);
    let title: string;
    if (parts.view === 'month') title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focused);
    else if (parts.view === 'year') title = String(focused.getFullYear());
    else {
      const start = Math.floor(focused.getFullYear() / 10) * 10;
      title = `${start} – ${start + 9}`;
    }
    text(parts.titlePart, title);
    mark(parts.titlePart, 'disabled', parts.view === 'decade');
    put(parts.gridPart, 'aria-label', title);
    const [low, high] = this.shownRange();
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    mark(parts.previousPart, 'disabled', !!min && low <= dayStart(min));
    mark(parts.nextPart, 'disabled', !!max && high >= dayStart(max));
    if (focusInside) this.focus();
    // Every move of the Tab stop is drawn here, so it is told here once.
    if (+focused !== parts.lastFocused) {
      parts.lastFocused = +focused;
      parts.focusedChanged.fire(focused);
    }
  }

  /** The first and last day of what is on screen. */
  private shownRange(): [Date, Date] {
    const focused = this.parts.focused;
    const year = focused.getFullYear();
    if (this.parts.view === 'month') return [new Date(year, focused.getMonth(), 1), new Date(year, focused.getMonth() + 1, 0)];
    if (this.parts.view === 'year') return [new Date(year, 0, 1), new Date(year, 11, 31)];
    const start = Math.floor(year / 10) * 10;
    return [new Date(start, 0, 1), new Date(start + 9, 11, 31)];
  }

  private renderMonth(locale: string): void {
    const parts = this.parts;
    const focused = parts.focused;
    const value = this.peekProperty<Date | null>('value');
    const weeks = !!this.peekProperty('showWeekNumbers');
    const others = this.peekProperty('showOtherMonths') !== false;
    const firstDay = this.firstDay;
    const first = new Date(focused.getFullYear(), focused.getMonth(), 1);
    const start = addDays(first, -((first.getDay() - firstDay + 7) % 7));
    const today = new Date();
    const range = this.rangeOf();
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });

    const grid = parts.grid!;
    if (grid.week) text(grid.week, uiLocale.strings.week);
    grid.heads.forEach((th, i) => {
      const day = addDays(start, i);
      put(th, 'abbr', long.format(day));
      text(th, short.format(day));
    });
    if (weeks) grid.rowHeads.forEach((th, row) => text(th, String(isoWeek(addDays(start, row * 7)))));
    grid.cells.forEach((td, i) => {
      const day = addDays(start, i);
      const outside = day.getMonth() !== focused.getMonth();
      if (outside && !others) {
        this.emptyCell(td);
        return;
      }
      text(td, String(day.getDate()));
      put(td, 'data-date', String(+day));
      put(td, 'aria-label', full.format(day));
      this.markCell(td, day, outside, sameDay(day, value), sameDay(day, today), this.canChoose(day), sameDay(day, focused));
      put(td, 'data-range', this.rangeMark(day, range));
    });
  }

  /** The grid's parts for a shape (`view|weeks`): the month's heads and 42 cells, or the 12 cells of a year or decade. */
  private buildGrid(shape: string): Grid {
    const gridPart = this.parts.gridPart;
    const grid: Grid = { shape, week: null, heads: [], rowHeads: [], cells: [] };
    const row = (section: Component<HTMLTableSectionElement>) => {
      const tr = part<HTMLTableRowElement>(section, 'tr', '');
      tr.attr.add({ role: 'row' });
      return tr;
    };
    const cell = (tr: Component<HTMLTableRowElement>) => {
      const td = part<HTMLTableCellElement>(tr, 'td', '');
      td.attr.add({ role: 'gridcell' });
      grid.cells.push(td);
    };
    if (shape.startsWith('month')) {
      const weeks = shape.endsWith('true');
      const head = row(part<HTMLTableSectionElement>(gridPart, 'thead', ''));
      if (weeks) {
        const th = part<HTMLTableCellElement>(head, 'th', 'mx-calendar__week');
        th.attr.add({ role: 'columnheader' });
        grid.week = part(th, 'span', 'mx-sr-only');
      }
      for (let i = 0; i < 7; i++) {
        const th = part<HTMLTableCellElement>(head, 'th', '');
        th.attr.add({ role: 'columnheader' });
        grid.heads.push(th);
      }
      const body = part<HTMLTableSectionElement>(gridPart, 'tbody', '');
      for (let r = 0; r < 6; r++) {
        const tr = row(body);
        if (weeks) {
          const th = part<HTMLTableCellElement>(tr, 'th', 'mx-calendar__week');
          th.attr.add({ role: 'rowheader' });
          grid.rowHeads.push(th);
        }
        for (let col = 0; col < 7; col++) cell(tr);
      }
    } else {
      const body = part<HTMLTableSectionElement>(gridPart, 'tbody', '');
      for (let r = 0; r < 3; r++) {
        const tr = row(body);
        for (let col = 0; col < 4; col++) cell(tr);
      }
    }
    return grid;
  }

  /** A cell of another month, when those are not shown: kept, with nothing in it. */
  private emptyCell(td: Component<HTMLTableCellElement>): void {
    text(td, '');
    td.class.remove('mx-calendar__cell');
    for (const name of ['tabindex', 'aria-selected', 'data-outside', 'data-today', 'aria-current', 'aria-disabled', 'data-date', 'aria-label', 'data-range']) put(td, name, null);
  }

  /** The range's ends in order, as days. */
  private rangeOf(): [Date | null, Date | null] {
    const a = this.peekProperty<Date | null>('rangeStart') ?? null;
    const b = this.peekProperty<Date | null>('rangeEnd') ?? null;
    const start = a ? dayStart(a) : null;
    const end = b ? dayStart(b) : null;
    return start && end && end < start ? [end, start] : [start, end];
  }

  /** Where a day stands in the range drawn: its start, its end, one day of both, or between. */
  private rangeMark(day: Date, [start, end]: [Date | null, Date | null]): string | null {
    if (!start && !end) return null;
    const atStart = sameDay(day, start);
    const atEnd = sameDay(day, end);
    if (atStart && (atEnd || !end)) return 'single';
    if (atEnd && !start) return 'single';
    if (atStart) return 'start';
    if (atEnd) return 'end';
    return start && end && day > start && day < end ? 'in' : null;
  }

  private pointedOver(e: PointerEvent): void {
    if (this.parts.view !== 'month') return;
    const cell = this.cellFrom(e);
    this.point(cell ? new Date(cell.time) : null);
  }

  /** The drawn cell of a date an event came from. */
  private cellFrom(e: Event): Parts['cells'][number] | undefined {
    return this.parts.cells.find((cell) => cell.part.motif.isEventFrom(e));
  }

  private point(day: Date | null): void {
    const parts = this.parts;
    const key = day ? +day : null;
    if (key === parts.lastPointed) return;
    parts.lastPointed = key;
    parts.pointed.fire(day);
  }

  /** The year view (twelve months) and the decade view (twelve years, one on each side). */
  private renderBlock(locale: string): void {
    const parts = this.parts;
    const focused = parts.focused;
    const value = this.peekProperty<Date | null>('value');
    const today = new Date();
    const year = focused.getFullYear();
    const decade = Math.floor(year / 10) * 10;
    const months = parts.view === 'year';
    const short = new Intl.DateTimeFormat(locale, months ? { month: 'short' } : { year: 'numeric' });
    // The name starts with the text shown (Jan), so speech input finds the cell by it.
    const long = new Intl.DateTimeFormat(locale, months ? { month: 'long' } : { year: 'numeric' });
    parts.grid!.cells.forEach((td, i) => {
      const date = months ? new Date(year, i, 1) : new Date(decade - 1 + i, 0, 1);
      text(td, short.format(date));
      put(td, 'data-date', String(+date));
      put(td, 'aria-label', months ? `${short.format(date)}, ${long.format(date)} ${year}` : long.format(date));
      const same = (a: Date | null | undefined) => !!a && a.getFullYear() === date.getFullYear() && (!months || a.getMonth() === date.getMonth());
      const outside = !months && (i === 0 || i === 11);
      this.markCell(td, date, outside, same(value), same(today), this.canChooseIn(date), same(focused));
    });
  }

  /** A month or a year can be chosen when one of its days can. */
  private canChooseIn(start: Date): boolean {
    const months = this.parts.view === 'year';
    const end = months ? new Date(start.getFullYear(), start.getMonth() + 1, 0) : new Date(start.getFullYear(), 11, 31);
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    return !(min && end < dayStart(min)) && !(max && start > dayStart(max));
  }

  /** Marks the cell of a date and keeps it, with the Tab stop when it is the focused one. */
  private markCell(td: Component<HTMLTableCellElement>, date: Date, outside: boolean, selected: boolean, today: boolean, enabled: boolean, focused: boolean): void {
    td.class.add('mx-calendar__cell');
    put(td, 'tabindex', focused ? '0' : '-1');
    put(td, 'aria-selected', String(selected));
    mark(td, 'data-outside', outside);
    mark(td, 'data-today', today);
    put(td, 'aria-current', today ? 'date' : null);
    put(td, 'aria-disabled', enabled ? null : 'true');
    const parts = this.parts;
    parts.cells.push({ part: td, time: +date, enabled });
    if (focused) parts.stopCell = td;
  }

  private renderToday(on: boolean): void {
    const parts = this.parts;
    if (on && !parts.today) {
      const today = part<HTMLButtonElement>(parts.footPart, 'button', 'mx-calendar__today');
      today.attr.add({ type: 'button' });
      text(today, uiLocale.strings.today);
      today.motif.on('click', (_, e) => {
        const day = dayStart(new Date());
        this.goTo(day);
        if (this.canChoose(day)) this.choose(day, e);
      });
      parts.today = today;
    } else if (!on && parts.today) {
      removePart(parts.today);
      parts.today = null;
    }
    mark(this, 'data-foot', on);
  }

  private page(step: number): void {
    const parts = this.parts;
    const months = parts.view === 'month' ? step : parts.view === 'year' ? step * 12 : step * 120;
    parts.focused = addMonths(parts.focused, months);
    this.render();
  }

  private zoomOut(): void {
    const parts = this.parts;
    const at = VIEWS.indexOf(parts.view);
    if (at < VIEWS.length - 1) {
      parts.view = VIEWS[at + 1];
      this.render();
    }
  }

  private clicked(e: MouseEvent): void {
    const cell = this.cellFrom(e);
    if (!cell?.enabled || !this.isEnabled) return;
    this.activate(new Date(cell.time), e);
  }

  /** Enter or a click on a cell: a choice in the smallest view, else one view closer. */
  private activate(date: Date, event: Event): void {
    const parts = this.parts;
    const minView = this.peekProperty<CalendarView>('minView') ?? 'month';
    parts.focused = parts.view === 'month' ? date : new Date(date.getFullYear(), parts.view === 'year' ? date.getMonth() : parts.focused.getMonth(), 1);
    if (parts.view === minView) {
      if (parts.view === 'month' ? this.canChoose(date) : this.canChooseIn(date)) this.choose(parts.view === 'month' ? date : parts.focused, event);
      this.render();
      return;
    }
    parts.view = VIEWS[VIEWS.indexOf(parts.view) - 1];
    this.render();
    this.focus();
  }

  private choose(date: Date, event: Event): void {
    const previous = this.peekProperty<Date | null>('value') ?? null;
    if (sameDay(previous, date) && this.parts.view === 'month') return;
    this.changeProperty('value', date);
    this.bindings.writeModel(date);
    this.parts.valueChanged.fire({ value: date, previousValue: previous, byUser: true, source: this, event });
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.parts;
    const view = parts.view;
    const back = isRtl(this) ? 1 : -1;
    const across = view === 'month' ? 7 : 4;
    let next: Date | null = null;
    const move = (amount: number) => (view === 'month' ? addDays(parts.focused, amount) : view === 'year' ? addMonths(parts.focused, amount) : addMonths(parts.focused, amount * 12));
    switch (e.key) {
      case 'ArrowLeft':
        next = move(back);
        break;
      case 'ArrowRight':
        next = move(-back);
        break;
      case 'ArrowUp':
        next = move(-across);
        break;
      case 'ArrowDown':
        next = move(across);
        break;
      case 'Home':
        next = view === 'month' ? addDays(parts.focused, -((parts.focused.getDay() - this.firstDay + 7) % 7)) : move(-((view === 'year' ? parts.focused.getMonth() : parts.focused.getFullYear() % 10) % 4));
        break;
      case 'End':
        next = view === 'month' ? addDays(parts.focused, 6 - ((parts.focused.getDay() - this.firstDay + 7) % 7)) : move(3 - ((view === 'year' ? parts.focused.getMonth() : parts.focused.getFullYear() % 10) % 4));
        break;
      case 'PageUp':
      case 'PageDown': {
        const sign = e.key === 'PageUp' ? -1 : 1;
        const months = view === 'month' ? (e.shiftKey ? 12 : 1) : view === 'year' ? 12 : 120;
        next = addMonths(parts.focused, sign * months);
        break;
      }
      case 'Enter':
      case ' ': {
        // A disabled calendar keeps focus on a cell when there is nowhere else to go; Enter picks nothing there.
        const cell = this.cellFrom(e);
        if (cell?.enabled && this.isEnabled) this.activate(new Date(cell.time), e);
        e.preventDefault();
        return;
      }
      default:
        return;
    }
    e.preventDefault();
    parts.focused = dayStart(next);
    this.render();
    this.focus();
  }
}
