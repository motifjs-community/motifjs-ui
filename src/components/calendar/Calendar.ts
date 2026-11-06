import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { functionValue } from '../../core/function-value';
import { chevronDown } from '../../core/glyphs';
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

interface Parts {
  previous: HTMLButtonElement;
  title: HTMLButtonElement;
  next: HTMLButtonElement;
  grid: HTMLTableElement;
  foot: HTMLDivElement;
  today: HTMLButtonElement | null;
  /** The cell with the Tab stop, in every view. */
  focused: Date;
  view: CalendarView;
  /** Drawing waits until every prop is in. */
  ready: boolean;
  valueChanged: Emitter<ValueChangedEventArgs<Date | null>>;
  pointed: Emitter<Date | null>;
  /** The day last told to `onDayPointed`, so the same one is not told again. */
  lastPointed: number | null;
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
      parts.previous.setAttribute('aria-label', back);
      parts.next.setAttribute('aria-label', forward);
      if (parts.today) parts.today.textContent = strings.today;
    };
    const stopTexts = onLanguage(this, drawTexts);
    this.observeProperty('shownView', drawTexts);
    parts.grid.addEventListener('keydown', (e) => this.keyDown(e));
    parts.grid.addEventListener('click', (e) => this.clicked(e));
    parts.grid.addEventListener('pointerover', (e) => this.pointedOver(e));
    parts.grid.addEventListener('pointerleave', () => this.point(null));
    parts.previous.addEventListener('click', () => this.page(-1));
    parts.next.addEventListener('click', () => this.page(1));
    parts.title.addEventListener('click', () => this.zoomOut());
    this.motif.setDisposable(() => {
      stopTexts();
      parts.valueChanged.dispose();
      parts.pointed.dispose();
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

  /** Shows the month of `date` and places the Tab stop on it. */
  goTo(date: Date): void {
    this.parts.focused = dayStart(date);
    this.render();
  }

  /** Sets focus on the cell with the Tab stop. */
  override focus(): boolean {
    const cell = this.parts.grid.querySelector<HTMLElement>('[tabindex="0"]');
    if (!cell || !this.isEnabled) return false;
    cell.focus();
    return document.activeElement === cell;
  }

  /** Indicates whether `date` can be selected: within min and max, and not one of the disabled dates. */
  canChoose(date: Date): boolean {
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    if (min && dayStart(date) < dayStart(min)) return false;
    if (max && dayStart(date) > dayStart(max)) return false;
    return !this.peekProperty<((d: Date) => boolean) | null>('disabledDates')?.(date);
  }

  protected override get focusElement(): HTMLElement {
    return this.parts.grid;
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const root = this.element;
    root.classList.add('mx-calendar');
    const header = root.appendChild(document.createElement('div'));
    header.className = 'mx-calendar__header';
    const button = (className: string) => {
      const b = header.appendChild(document.createElement('button'));
      b.type = 'button';
      b.className = className;
      return b;
    };
    const previous = button('mx-calendar__nav mx-calendar__previous');
    previous.append(chevronDown());
    const title = button('mx-calendar__title');
    title.setAttribute('aria-live', 'polite');
    const next = button('mx-calendar__nav mx-calendar__next');
    next.append(chevronDown());
    const grid = root.appendChild(document.createElement('table'));
    grid.className = 'mx-calendar__grid';
    grid.setAttribute('role', 'grid');
    const foot = root.appendChild(document.createElement('div'));
    foot.className = 'mx-calendar__foot';
    return {
      previous,
      title,
      next,
      grid,
      foot,
      today: null,
      focused: dayStart(new Date()),
      view: 'month',
      ready: false,
      valueChanged: new Emitter(),
      pointed: new Emitter(),
      lastPointed: null,
    };
  }

  private get firstDay(): number {
    return this.peekProperty<number | null>('firstDayOfWeek') ?? firstDayOfWeek(this.currentLocale);
  }

  private get currentLocale(): string {
    return this.peekProperty<string>('locale') || uiLocale.locale;
  }

  private get rtl(): boolean {
    return getComputedStyle(this.element).direction === 'rtl';
  }

  private render(): void {
    const parts = this.parts;
    if (!parts.ready) return;
    const view = parts.view;
    const minView = this.peekProperty<CalendarView>('minView') ?? 'month';
    if (VIEWS.indexOf(view) < VIEWS.indexOf(minView)) parts.view = minView;
    this.setProperty('shownView', parts.view);
    this.element.dataset.view = parts.view;
    const focusInside = parts.grid.contains(document.activeElement);
    const locale = this.currentLocale;
    const focused = parts.focused;
    parts.grid.replaceChildren();
    if (parts.view === 'month') this.renderMonth(locale);
    else this.renderBlock(locale);
    if (parts.view === 'month') parts.title.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focused);
    else if (parts.view === 'year') parts.title.textContent = String(focused.getFullYear());
    else {
      const start = Math.floor(focused.getFullYear() / 10) * 10;
      parts.title.textContent = `${start} – ${start + 9}`;
    }
    parts.title.disabled = parts.view === 'decade';
    parts.grid.setAttribute('aria-label', parts.title.textContent ?? '');
    const [low, high] = this.shownRange();
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    parts.previous.disabled = !!min && low <= dayStart(min);
    parts.next.disabled = !!max && high >= dayStart(max);
    if (focusInside) this.focus();
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

    const head = parts.grid.createTHead().insertRow();
    head.setAttribute('role', 'row');
    if (weeks) {
      const th = head.appendChild(document.createElement('th'));
      th.className = 'mx-calendar__week';
      th.setAttribute('role', 'columnheader');
      const name = th.appendChild(document.createElement('span'));
      name.className = 'mx-sr-only';
      name.textContent = uiLocale.strings.week;
    }
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const th = head.appendChild(document.createElement('th'));
      th.setAttribute('role', 'columnheader');
      th.abbr = long.format(day);
      th.textContent = short.format(day);
    }
    const body = parts.grid.createTBody();
    for (let row = 0; row < 6; row++) {
      const tr = body.insertRow();
      tr.setAttribute('role', 'row');
      if (weeks) {
        const th = tr.appendChild(document.createElement('th'));
        th.className = 'mx-calendar__week';
        th.setAttribute('role', 'rowheader');
        th.textContent = String(isoWeek(addDays(start, row * 7)));
      }
      for (let col = 0; col < 7; col++) {
        const day = addDays(start, row * 7 + col);
        const outside = day.getMonth() !== focused.getMonth();
        const td = tr.insertCell();
        td.setAttribute('role', 'gridcell');
        if (outside && !others) continue;
        td.textContent = String(day.getDate());
        td.dataset.date = String(+day);
        td.setAttribute('aria-label', full.format(day));
        this.markCell(td, outside, sameDay(day, value), sameDay(day, today), this.canChoose(day), sameDay(day, focused));
        const mark = this.rangeMark(day, range);
        if (mark) td.dataset.range = mark;
      }
    }
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
    const cell = (e.target as Element).closest<HTMLElement>('.mx-calendar__cell');
    this.point(cell?.dataset.date ? new Date(Number(cell.dataset.date)) : null);
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
    const body = parts.grid.createTBody();
    for (let row = 0; row < 3; row++) {
      const tr = body.insertRow();
      tr.setAttribute('role', 'row');
      for (let col = 0; col < 4; col++) {
        const i = row * 4 + col;
        const date = months ? new Date(year, i, 1) : new Date(decade - 1 + i, 0, 1);
        const td = tr.insertCell();
        td.setAttribute('role', 'gridcell');
        td.textContent = short.format(date);
        td.dataset.date = String(+date);
        td.setAttribute('aria-label', months ? `${short.format(date)}, ${long.format(date)} ${year}` : long.format(date));
        const same = (a: Date | null | undefined) => !!a && a.getFullYear() === date.getFullYear() && (!months || a.getMonth() === date.getMonth());
        const outside = !months && (i === 0 || i === 11);
        this.markCell(td, outside, same(value), same(today), this.canChooseIn(date), same(focused));
      }
    }
  }

  /** A month or a year can be chosen when one of its days can. */
  private canChooseIn(start: Date): boolean {
    const months = this.parts.view === 'year';
    const end = months ? new Date(start.getFullYear(), start.getMonth() + 1, 0) : new Date(start.getFullYear(), 11, 31);
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    return !(min && end < dayStart(min)) && !(max && start > dayStart(max));
  }

  private markCell(td: HTMLTableCellElement, outside: boolean, selected: boolean, today: boolean, enabled: boolean, focused: boolean): void {
    td.className = 'mx-calendar__cell';
    td.tabIndex = focused ? 0 : -1;
    td.setAttribute('aria-selected', String(selected));
    td.toggleAttribute('data-outside', outside);
    td.toggleAttribute('data-today', today);
    if (today) td.setAttribute('aria-current', 'date');
    if (!enabled) td.setAttribute('aria-disabled', 'true');
  }

  private renderToday(on: boolean): void {
    const parts = this.parts;
    if (on && !parts.today) {
      const button = parts.foot.appendChild(document.createElement('button'));
      button.type = 'button';
      button.className = 'mx-calendar__today';
      button.textContent = uiLocale.strings.today;
      button.addEventListener('click', (e) => {
        const today = dayStart(new Date());
        this.goTo(today);
        if (this.canChoose(today)) this.choose(today, e);
      });
      parts.today = button;
    } else if (!on && parts.today) {
      parts.today.remove();
      parts.today = null;
    }
    this.element.toggleAttribute('data-foot', on);
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
    const cell = (e.target as Element).closest<HTMLElement>('.mx-calendar__cell');
    if (!cell?.dataset.date || cell.getAttribute('aria-disabled') === 'true') return;
    this.activate(new Date(Number(cell.dataset.date)), e);
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
    const back = this.rtl ? 1 : -1;
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
        const cell = (e.target as Element).closest<HTMLElement>('.mx-calendar__cell');
        if (cell?.dataset.date && cell.getAttribute('aria-disabled') !== 'true') this.activate(new Date(Number(cell.dataset.date)), e);
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
