import { effect, Emitter, reactive, read, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { Control } from '../../core/control';
import { deepActiveElement } from '../../core/focus';
import { fillTemplate } from '../../core/fill-template';
import { chevronEnd, chevronStart } from '../../core/glyphs';
import { pageLocale } from '../../core/page-locale';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import { Popup } from '../../parts/popup/Popup';
import { dayStart } from '../../parts/dates/day-start';
import { firstDayOfWeek as localeFirstDay } from '../../parts/dates/first-day-of-week';
import { sameDay } from '../../parts/dates/same-day';
import { Button } from '../button/Button';
import { Calendar } from '../calendar/Calendar';
import { Spinner } from '../progress/Spinner';
import { Toolbar } from '../toolbar/Toolbar';
import type { AppointmentClickEventArgs } from './appointment-click-event-args';
import type { AppointmentTemplateContext } from './appointment-template-context';
import type { CellClickEventArgs } from './cell-click-event-args';
import type { ContentReadyEventArgs } from './content-ready-event-args';
import type { DateChangedEventArgs } from './date-changed-event-args';
import type { DateChangingEventArgs } from './date-changing-event-args';
import type { CellPlace } from './model/cell-place';
import type { OverlapMode } from './model/overlap-mode';
import type { ResolvedView } from './model/resolved-view';
import { SchedulerModel } from './model/SchedulerModel';
import type { StripPiece } from './model/strip-piece';
import type { TimedPiece } from './model/timed-piece';
import { stepDate, viewDates } from './model/view-dates';
import type { MoreOpeningEventArgs } from './more-opening-event-args';
import type { SchedulerCell } from './scheduler-cell';
import type { SchedulerFields } from './scheduler-fields';
import type { SchedulerKeys } from './scheduler-keys';
import type { SchedulerProps } from './scheduler-props';
import type { SchedulerRange } from './scheduler-range';
import type { SchedulerView } from './scheduler-view';
import type { SchedulerViewType } from './scheduler-view-type';
import type { SelectionChangedEventArgs } from './selection-changed-event-args';
import type { ViewChangedEventArgs } from './view-changed-event-args';
import type { ViewChangingEventArgs } from './view-changing-event-args';
import { MonthView } from './view/MonthView';
import { MoreList, type MoreListState } from './view/MoreList';
import type { SchedulerHost } from './view/scheduler-host';
import { SchedulerFormat } from './view/SchedulerFormat';
import { TimeView } from './view/TimeView';

const OWN = [
  'appointments',
  'dataSource',
  'remoteFiltering',
  'fields',
  'views',
  'currentView',
  'currentDate',
  'firstDayOfWeek',
  'workDays',
  'workStartHour',
  'workEndHour',
  'startDayHour',
  'endDayHour',
  'cellDuration',
  'allDayPanel',
  'allDayLines',
  'maxAppointmentsPerCell',
  'overlapMode',
  'isHoliday',
  'showCurrentTime',
  'dimPast',
  'scrollHour',
  'toolbar',
  'locale',
  'appointmentTemplate',
  'texts',
  'keys',
  'announce',
] as const;

/** Props whose value is a function (a template, a test of a day). */
const FUNCTION_VALUES = new Set(['isHoliday', 'appointmentTemplate']);

const DEFAULT_FIELDS: SchedulerFields = {
  key: 'id',
  start: 'startDate',
  end: 'endDate',
  text: 'text',
  allDay: 'allDay',
  description: 'description',
  color: 'color',
  disabled: 'disabled',
  visible: 'visible',
};

const DEFAULT_KEYS: SchedulerKeys = {
  today: ['T'],
  next: ['N', 'J'],
  previous: ['P', 'K'],
  dayView: ['D'],
  weekView: ['W'],
  workWeekView: ['X'],
  monthView: ['M'],
};

const VIEW_TEXTS: Record<SchedulerViewType, keyof UiStrings> = {
  day: 'schedulerDay',
  week: 'schedulerWeek',
  workWeek: 'schedulerWorkWeek',
  month: 'schedulerMonth',
};

const DEFAULT_VIEWS: readonly SchedulerViewType[] = ['day', 'week', 'workWeek', 'month'];

const PARTS = Symbol('mx.scheduler');

interface Parts<T> {
  model: SchedulerModel<T>;
  format: SchedulerFormat;
  host: SchedulerHost<T>;
  /** Changes of the data source's rows, to read them again. */
  version: { rows: number; status: string; monthRoom: number; said: string };
  more: MoreListState<T>;
  morePopup: Popup | null;
  picker: Calendar | null;
  title: Button | null;
  scroller: HTMLElement | null;
  /** The view whose hours were scrolled to last, so a new date does not scroll again. */
  scrolledFor: string;
  /** A press is selecting cells. */
  selecting: boolean;
  /** Focus goes to the cell once the next view is on the page. */
  focusWhenShown: boolean;
  baseFilter: data.DataSource<T, unknown>['filter'];
  source: data.DataSource<T, unknown> | null;
  stopSource: (() => void) | null;
  stopKeys: (() => void)[];
  lastSelection: string;
  viewChanging: Emitter<ViewChangingEventArgs<T>>;
  viewChanged: Emitter<ViewChangedEventArgs<T>>;
  dateChanging: Emitter<DateChangingEventArgs<T>>;
  dateChanged: Emitter<DateChangedEventArgs<T>>;
  cellClick: Emitter<CellClickEventArgs<T>>;
  cellDblClick: Emitter<CellClickEventArgs<T>>;
  appointmentClick: Emitter<AppointmentClickEventArgs<T>>;
  appointmentDblClick: Emitter<AppointmentClickEventArgs<T>>;
  selectionChanged: Emitter<SelectionChangedEventArgs<T>>;
  contentReady: Emitter<ContentReadyEventArgs<T>>;
  moreOpening: Emitter<MoreOpeningEventArgs<T>>;
}

/**
 * A scheduler: appointments over days and hours, in day, week, work week and month views. The
 * appointments come from an array (a reactive one is followed) or a `DataSource`; the fields it
 * reads are options. It moves by day, week or month (today, previous, next, a date chosen from a
 * calendar), selects cells with the pointer and the keyboard, places appointments at the same
 * time side by side, shows all-day and multi-day ones as bars, and what does not fit a month day
 * as "+N more". Every setting is a value or a function that is followed; a view's own settings
 * win over the scheduler's.
 *
 * @example
 * <Scheduler appointments={state.meetings} currentView="week" startDayHour={7} onAppointmentDblClick={(e) => open(e.appointment)} />
 */
export class Scheduler<T = Record<string, unknown>> extends Control<HTMLDivElement, SchedulerProps<T>> {
  constructor(props?: IBaseProp<SchedulerProps<T>>) {
    super(props);
    const own = (this.props ?? {}) as SchedulerProps<T>;
    for (const name of OWN) if (own[name] !== undefined) this.bindOwn(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    const parts = this.parts;
    const on: [((e: never) => void) | undefined, Emitter<never>][] = [
      [own.onViewChanging, parts.viewChanging as Emitter<never>],
      [own.onViewChanged, parts.viewChanged as Emitter<never>],
      [own.onDateChanging, parts.dateChanging as Emitter<never>],
      [own.onDateChanged, parts.dateChanged as Emitter<never>],
      [own.onCellClick, parts.cellClick as Emitter<never>],
      [own.onCellDblClick, parts.cellDblClick as Emitter<never>],
      [own.onAppointmentClick, parts.appointmentClick as Emitter<never>],
      [own.onAppointmentDblClick, parts.appointmentDblClick as Emitter<never>],
      [own.onSelectionChanged, parts.selectionChanged as Emitter<never>],
      [own.onContentReady, parts.contentReady as Emitter<never>],
      [own.onMoreOpening, parts.moreOpening as Emitter<never>],
    ];
    for (const [handler, emitter] of on) if (handler) emitter.event(handler);
    this.motif.setDisposable(() => {
      parts.model.dispose();
      parts.stopSource?.();
      for (const stop of parts.stopKeys) stop();
      for (const [, emitter] of on) emitter.dispose();
    });
  }

  // Properties (see SchedulerProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get appointments(): readonly T[] {
    return this.getProperty<readonly T[] | undefined>('appointments') ?? [];
  }
  set appointments(value: Bind<readonly T[]>) {
    this.assignProperty('appointments', value);
  }
  get dataSource(): data.DataSource<T, unknown> | null {
    return this.getProperty<data.DataSource<T, unknown> | null | undefined>('dataSource') ?? null;
  }
  set dataSource(value: Bind<data.DataSource<T, unknown> | null>) {
    this.assignProperty('dataSource', value);
  }
  get remoteFiltering(): boolean {
    return this.getProperty<boolean | undefined>('remoteFiltering') ?? true;
  }
  set remoteFiltering(value: Bind<boolean>) {
    this.assignProperty('remoteFiltering', value, Boolean);
  }
  get fields(): SchedulerFields {
    return {
      ...DEFAULT_FIELDS,
      ...(this.getProperty<Partial<SchedulerFields> | undefined>('fields') ?? {}),
    };
  }
  set fields(value: Bind<Partial<SchedulerFields>>) {
    this.assignProperty('fields', value);
  }
  get views(): readonly (SchedulerViewType | SchedulerView)[] {
    return this.getProperty<readonly (SchedulerViewType | SchedulerView)[] | undefined>('views') ?? DEFAULT_VIEWS;
  }
  set views(value: Bind<readonly (SchedulerViewType | SchedulerView)[]>) {
    this.assignProperty('views', value);
  }
  /** The view on screen, by name. */
  get currentView(): string {
    const list = this.viewList();
    const name = this.getProperty<string | undefined>('currentView');
    if (name && list.some((v) => v.name === name)) return name;
    return (list.find((v) => v.type === 'week') ?? list[0])?.name ?? 'week';
  }
  set currentView(value: Bind<string>) {
    this.assignProperty('currentView', value);
  }
  get currentDate(): Date {
    const value = this.getProperty<Date | undefined>('currentDate');
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : this.today();
  }
  set currentDate(value: Bind<Date>) {
    this.assignProperty('currentDate', value);
  }
  get firstDayOfWeek(): number {
    const value = this.getProperty<number | null | undefined>('firstDayOfWeek');
    return typeof value === 'number' ? ((Math.round(value) % 7) + 7) % 7 : localeFirstDay(this.locale);
  }
  set firstDayOfWeek(value: Bind<number | null>) {
    this.assignProperty('firstDayOfWeek', value);
  }
  get workDays(): readonly number[] {
    return this.getProperty<readonly number[] | undefined>('workDays') ?? [1, 2, 3, 4, 5];
  }
  set workDays(value: Bind<readonly number[]>) {
    this.assignProperty('workDays', value);
  }
  get workStartHour(): number {
    return this.getProperty<number | undefined>('workStartHour') ?? 9;
  }
  set workStartHour(value: Bind<number>) {
    this.assignProperty('workStartHour', value, Number);
  }
  get workEndHour(): number {
    return this.getProperty<number | undefined>('workEndHour') ?? 17;
  }
  set workEndHour(value: Bind<number>) {
    this.assignProperty('workEndHour', value, Number);
  }
  get startDayHour(): number {
    return this.getProperty<number | undefined>('startDayHour') ?? 0;
  }
  set startDayHour(value: Bind<number>) {
    this.assignProperty('startDayHour', value, Number);
  }
  get endDayHour(): number {
    return this.getProperty<number | undefined>('endDayHour') ?? 24;
  }
  set endDayHour(value: Bind<number>) {
    this.assignProperty('endDayHour', value, Number);
  }
  get cellDuration(): number {
    return this.getProperty<number | undefined>('cellDuration') ?? 30;
  }
  set cellDuration(value: Bind<number>) {
    this.assignProperty('cellDuration', value, Number);
  }
  get allDayPanel(): boolean {
    return this.getProperty<boolean | undefined>('allDayPanel') ?? true;
  }
  set allDayPanel(value: Bind<boolean>) {
    this.assignProperty('allDayPanel', value, Boolean);
  }
  get allDayLines(): number {
    return Math.max(1, this.getProperty<number | undefined>('allDayLines') ?? 3);
  }
  set allDayLines(value: Bind<number>) {
    this.assignProperty('allDayLines', value, Number);
  }
  get maxAppointmentsPerCell(): number | 'auto' {
    return this.getProperty<number | 'auto' | undefined>('maxAppointmentsPerCell') ?? 'auto';
  }
  set maxAppointmentsPerCell(value: Bind<number | 'auto'>) {
    this.assignProperty('maxAppointmentsPerCell', value);
  }
  get overlapMode(): OverlapMode {
    return this.getProperty<OverlapMode | undefined>('overlapMode') ?? 'columns';
  }
  set overlapMode(value: Bind<OverlapMode>) {
    this.assignProperty('overlapMode', value);
  }
  get isHoliday(): ((date: Date) => boolean) | null {
    return this.getProperty<((date: Date) => boolean) | null | undefined>('isHoliday') ?? null;
  }
  set isHoliday(value: Bind<((date: Date) => boolean) | null>) {
    this.bindOwn('isHoliday', value);
  }
  get showCurrentTime(): boolean {
    return this.getProperty<boolean | undefined>('showCurrentTime') ?? true;
  }
  set showCurrentTime(value: Bind<boolean>) {
    this.assignProperty('showCurrentTime', value, Boolean);
  }
  get dimPast(): boolean {
    return this.getProperty<boolean | undefined>('dimPast') ?? false;
  }
  set dimPast(value: Bind<boolean>) {
    this.assignProperty('dimPast', value, Boolean);
  }
  get scrollHour(): number | null {
    return this.getProperty<number | null | undefined>('scrollHour') ?? null;
  }
  set scrollHour(value: Bind<number | null>) {
    this.assignProperty('scrollHour', value);
  }
  get toolbar(): boolean {
    return this.getProperty<boolean | undefined>('toolbar') ?? true;
  }
  set toolbar(value: Bind<boolean>) {
    this.assignProperty('toolbar', value, Boolean);
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') || pageLocale();
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get appointmentTemplate(): ((context: AppointmentTemplateContext<T>) => ComponentBase) | null {
    return this.getProperty<((context: AppointmentTemplateContext<T>) => ComponentBase) | null | undefined>('appointmentTemplate') ?? null;
  }
  set appointmentTemplate(value: Bind<((context: AppointmentTemplateContext<T>) => ComponentBase) | null>) {
    this.bindOwn('appointmentTemplate', value);
  }
  get texts(): Partial<UiStrings> {
    return this.getProperty<Partial<UiStrings> | undefined>('texts') ?? {};
  }
  set texts(value: Bind<Partial<UiStrings>>) {
    this.assignProperty('texts', value);
  }
  get keys(): SchedulerKeys {
    return {
      ...DEFAULT_KEYS,
      ...(this.getProperty<Partial<SchedulerKeys> | undefined>('keys') ?? {}),
    };
  }
  set keys(value: Bind<Partial<SchedulerKeys>>) {
    this.assignProperty('keys', value);
  }
  get announce(): boolean {
    return this.getProperty<boolean | undefined>('announce') ?? true;
  }
  set announce(value: Bind<boolean>) {
    this.assignProperty('announce', value, Boolean);
  }

  // State.

  /** The days on screen, `end` not included. Reactive. */
  get visibleRange(): SchedulerRange {
    return this.parts.model.range();
  }
  /** The view on screen with every setting decided. Reactive. */
  get resolvedView(): ResolvedView {
    return this.resolveView();
  }
  /** The selected cells as one time, or `null`. Reactive. */
  get selectedCells(): SchedulerCell | null {
    return this.parts.model.selection();
  }
  /** The appointments in the days shown, in time order. Reactive. */
  get shownAppointments(): readonly T[] {
    return this.parts.model.state.shown;
  }
  /** Whether the data source is loading. Reactive. */
  get loading(): boolean {
    void this.parts.version.status;
    return this.dataSource?.status === 'loading';
  }

  // Events.

  get onViewChanging(): MotifEvent<ViewChangingEventArgs<T>> {
    return this.parts.viewChanging.event;
  }
  get onViewChanged(): MotifEvent<ViewChangedEventArgs<T>> {
    return this.parts.viewChanged.event;
  }
  get onDateChanging(): MotifEvent<DateChangingEventArgs<T>> {
    return this.parts.dateChanging.event;
  }
  get onDateChanged(): MotifEvent<DateChangedEventArgs<T>> {
    return this.parts.dateChanged.event;
  }
  get onCellClick(): MotifEvent<CellClickEventArgs<T>> {
    return this.parts.cellClick.event;
  }
  get onCellDblClick(): MotifEvent<CellClickEventArgs<T>> {
    return this.parts.cellDblClick.event;
  }
  get onAppointmentClick(): MotifEvent<AppointmentClickEventArgs<T>> {
    return this.parts.appointmentClick.event;
  }
  get onAppointmentDblClick(): MotifEvent<AppointmentClickEventArgs<T>> {
    return this.parts.appointmentDblClick.event;
  }
  get onSelectionChanged(): MotifEvent<SelectionChangedEventArgs<T>> {
    return this.parts.selectionChanged.event;
  }
  get onContentReady(): MotifEvent<ContentReadyEventArgs<T>> {
    return this.parts.contentReady.event;
  }
  get onMoreOpening(): MotifEvent<MoreOpeningEventArgs<T>> {
    return this.parts.moreOpening.event;
  }

  // Methods.

  /** Shows today. */
  goToday(): boolean {
    return this.changeDate(this.today(), false);
  }
  /** Moves a step on: a day, a week or a month, times the view's interval. */
  next(): boolean {
    return this.changeDate(stepDate(this.resolveView(), this.currentDate, 1), false);
  }
  previous(): boolean {
    return this.changeDate(stepDate(this.resolveView(), this.currentDate, -1), false);
  }
  /** Shows the view that has `date`. */
  showDate(date: Date): boolean {
    return this.changeDate(date, false);
  }
  /** Shows another view, by name. */
  showView(name: string): boolean {
    return this.changeView(name, false);
  }
  /** Scrolls the day columns to a time of day. */
  scrollToTime(hour: number, minute = 0): void {
    const scroller = this.parts.scroller;
    const view = this.resolveView();
    if (!scroller || view.type === 'month') return;
    const body = scroller.firstElementChild as HTMLElement | null;
    const span = (view.endDayHour - view.startDayHour) * 60;
    if (!body || !(span > 0)) return;
    const at = (hour * 60 + minute - view.startDayHour * 60) / span;
    scroller.scrollTop = Math.max(0, at * body.offsetHeight);
  }
  /** The appointments with any part between `start` and `end`. */
  appointmentsIn(start: Date, end: Date): T[] {
    return this.parts.model.appointmentsIn(start, end);
  }
  /** The appointment with this key (the `key` field), among the ones loaded. */
  findAppointment(key: unknown): T | undefined {
    const field = this.fields.key;
    return this.items().find((item) => (item as Record<string, unknown>)?.[field] === key);
  }
  /** Selects cells from `start` to `end` (in the days shown), or none with `null`. */
  selectCells(cell: SchedulerCell | null): boolean {
    const model = this.parts.model;
    if (!cell) {
      model.clearSelection();
      return true;
    }
    const first = this.placeOf(cell.start, cell.allDay);
    const last = this.placeOf(new Date(cell.end.getTime() - 1), cell.allDay);
    if (!first || !last) return false;
    model.focusCell(first);
    model.focusCell(last, true);
    return true;
  }

  /** The text for `key`: the scheduler's own `texts`, else `uiLocale`'s, filled in. */
  textOf(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const text = this.texts[key] ?? uiLocale.strings[key];
    return values ? fillTemplate(text, values) : text;
  }

  // The rest.

  override onConfigured() {
    this.class.add('mx-scheduler');
    // A group, not a landmark: a page may hold many schedulers.
    this.attr.add({ role: 'group' });
    this.bindings.watch(() => this.element.setAttribute('aria-label', this.text || this.textOf('schedulerLabel')));
    this.bindings.watch(() => this.element.setAttribute('data-view', this.resolveView().type));
  }

  override onConfig() {
    const parts = this.parts;
    parts.model.start();
    const clock = setInterval(() => (parts.model.state.now = Date.now()), 30_000);
    this.motif.setDisposable(() => clearInterval(clock));
    this.bindings.watch(() => this.followSource(this.dataSource));
    this.bindings.watch(() => this.filterSource());
    this.bindings.watch(() => this.bindKeys(this.keys));
    this.bindings.watch(() => this.watchSelection());
    this.bindings.watch(() => this.followFocus());
    this.bindings.watch(() => this.watchContent());
    this.bindings.watch(() => this.scrollOnShow());
  }

  override view() {
    const parts = this.parts;
    const host = parts.host;
    const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.textOf(key, values);
    const type = () => (this.resolveView().type === 'month' ? 'month' : 'time');
    return (
      <>
        <Toolbar class="mx-scheduler__bar" label={() => this.text || t('schedulerLabel')} size="sm" x-display={() => this.toolbar}>
          <Button class="mx-scheduler__today" text={() => t('today')} variant="outline" size="sm" onclick={() => this.changeDate(this.today(), true)} />
          <Button
            class="mx-scheduler__step"
            icon={chevronStart()}
            hint={() => t('schedulerPrevious')}
            variant="ghost"
            size="sm"
            onclick={() => this.step(-1, true)}
          />
          <Button class="mx-scheduler__step" icon={chevronEnd()} hint={() => t('schedulerNext')} variant="ghost" size="sm" onclick={() => this.step(1, true)} />
          <Button class="mx-scheduler__title" text={() => this.rangeText()} variant="ghost" dropDown={parts.picker} ref={(b: Button) => (parts.title = b)} />
          {this.viewList().map((view) => (
            <Button
              key={view.name}
              class="mx-scheduler__view-button"
              toggle
              pressed={() => this.currentView === view.name}
              text={() => this.viewText(view)}
              variant="ghost"
              size="sm"
              onclick={() => this.changeView(view.name, true)}
            />
          ))}
        </Toolbar>
        <div class="mx-scheduler__content" aria-busy={() => (this.loading ? 'true' : null)}>
          {type() === 'month' ? <MonthView host={host} /> : <TimeView host={host} />}
          <div class="mx-scheduler__state" x-display={() => this.loading}>
            <Spinner size="sm" label={() => t('loading')} />
          </div>
          <div class="mx-scheduler__state" data-tone="danger" role="alert" x-display={() => parts.version.status === 'error'}>
            <span>{() => t('loadFailed')}</span>
            <Button text={() => t('retry')} size="sm" variant="outline" onclick={() => void this.dataSource?.retry()} />
          </div>
        </div>
        <div class="mx-scheduler__live" aria-live="polite" role="status">
          {() => parts.version.said}
        </div>
      </>
    );
  }

  // Inside.

  /** Binds a prop; for the ones whose value is a function, a function with a parameter is the value itself, one without is a getter. */
  private bindOwn(name: string, value: unknown): void {
    if (FUNCTION_VALUES.has(name) && typeof value === 'function' && value.length > 0) this.setProperty(name, value);
    else this.bindProperty(name, value as Bind<unknown>);
  }

  private get parts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    if (!self[PARTS]) {
      const parts = (self[PARTS] = this.createParts());
      // Made after: it reads the scheduler's date, which reads the parts.
      parts.picker = this.createPicker(parts);
    }
    return self[PARTS];
  }

  private createParts(): Parts<T> {
    const version = reactive({
      rows: 0,
      status: 'ready',
      monthRoom: Infinity,
      said: '',
    });
    const more = reactive({ date: null, items: [] }) as MoreListState<T>;
    const format = new SchedulerFormat(() => this.locale);
    const model = new SchedulerModel<T>({
      date: () => this.currentDate,
      items: () => this.items(),
      fields: () => this.fields,
      view: () => this.resolveView(),
      firstDayOfWeek: () => this.firstDayOfWeek,
      workDays: () => this.workDays,
      isHoliday: () => this.isHoliday,
      overlapMode: () => this.overlapMode,
      room: () => ({ month: version.monthRoom, allDay: this.allDayLines + 1 }),
    });
    const parts = {
      model,
      format,
      version,
      more,
      morePopup: null,
      picker: null,
      title: null,
      scroller: null,
      scrolledFor: '',
      selecting: false,
      focusWhenShown: false,
      baseFilter: null,
      source: null,
      stopSource: null,
      stopKeys: [],
      lastSelection: '',
      viewChanging: new Emitter(),
      viewChanged: new Emitter(),
      dateChanging: new Emitter(),
      dateChanged: new Emitter(),
      cellClick: new Emitter(),
      cellDblClick: new Emitter(),
      appointmentClick: new Emitter(),
      appointmentDblClick: new Emitter(),
      selectionChanged: new Emitter(),
      contentReady: new Emitter(),
      moreOpening: new Emitter(),
    } as unknown as Parts<T>;
    parts.host = this.createHost(parts);
    return parts;
  }

  /** The calendar the date in the bar opens. */
  private createPicker(parts: Parts<T>): Calendar {
    return new Calendar({
      value: () => this.currentDate,
      firstDayOfWeek: () => this.firstDayOfWeek,
      locale: () => this.locale,
      showTodayButton: true,
      onValueChanged: (e) => {
        if (!e.value) return;
        parts.title?.close();
        this.changeDate(e.value, true);
      },
    });
  }

  private createHost(parts: Parts<T>): SchedulerHost<T> {
    return {
      model: parts.model,
      format: parts.format,
      text: (key, values) => this.textOf(key, values),
      fields: () => this.fields,
      showCurrentTime: () => this.showCurrentTime,
      dimPast: () => this.dimPast,
      workHours: () => ({ start: this.workStartHour, end: this.workEndHour }),
      allDayLines: () => this.allDayLines,
      rtl: () => this.isRtl(),
      template: () => this.appointmentTemplate,
      setMonthRoom: (lines) => {
        if (parts.version.monthRoom !== lines) parts.version.monthRoom = lines;
      },
      cellPointerDown: (place, e) => this.cellPointerDown(place, e),
      cellClick: (place, e) => this.fireCell(parts.cellClick, place, e),
      cellDblClick: (place, e) => this.fireCell(parts.cellDblClick, place, e),
      appointmentClick: (piece, e) => this.fireAppointment(parts.appointmentClick, piece, e),
      appointmentDblClick: (piece, e) => this.fireAppointment(parts.appointmentDblClick, piece, e),
      openMore: (day, anchor) => this.openMore(day, anchor),
      gridKey: (e) => this.gridKey(e),
      viewShown: () => {
        if (!parts.focusWhenShown) return;
        parts.focusWhenShown = false;
        this.focusCellElement();
      },
      setScroller: (el) => {
        parts.scroller = el;
        if (!el) parts.scrolledFor = '';
      },
    };
  }

  /** The appointments loaded: the data source's rows, else the array. Reactive. */
  private items(): readonly T[] {
    const parts = this.parts;
    const source = this.dataSource;
    if (!source) return this.appointments;
    void parts.version.rows;
    return source.rows;
  }

  private followSource(source: data.DataSource<T, unknown> | null): void {
    const parts = this.parts;
    untracked(() => {
      if (source === parts.source) return;
      parts.stopSource?.();
      parts.stopSource = null;
      parts.source = source;
      parts.baseFilter = source?.filter ?? null;
      if (!source) return;
      const listening = source.onChanged(() => {
        parts.version.rows++;
        parts.version.status = source.status;
      });
      parts.stopSource = () => listening.dispose();
      parts.version.status = source.status;
    });
  }

  /** With remote filtering, the data source is asked for the days shown only. */
  private filterSource(): void {
    const source = this.dataSource;
    if (!source) return;
    const range = this.rangeOf(this.resolveView(), this.currentDate);
    const remote = this.remoteFiltering;
    const fields = this.fields;
    untracked(() => {
      const parts = this.parts;
      if (!remote) {
        if (source.status === 'idle') void source.load();
        return;
      }
      const span = {
        and: [
          { field: fields.start, op: '<' as const, value: range.end },
          { field: fields.end, op: '>=' as const, value: range.start },
        ],
      };
      void source.setFilter(parts.baseFilter ? { and: [parts.baseFilter, span] } : span);
    });
  }

  private bindKeys(keys: SchedulerKeys): void {
    const parts = this.parts;
    untracked(() => {
      for (const stop of parts.stopKeys.splice(0)) stop();
      const add = (chords: readonly string[], run: () => void) => {
        for (const chord of chords) parts.stopKeys.push(this.addShortcut(chord, () => run()));
      };
      add(keys.today, () => this.changeDate(this.today(), true));
      add(keys.next, () => this.step(1, true));
      add(keys.previous, () => this.step(-1, true));
      const byType = (type: SchedulerViewType) => () => {
        const view = this.viewList().find((v) => v.type === type);
        if (view) this.changeView(view.name, true);
      };
      add(keys.dayView, byType('day'));
      add(keys.weekView, byType('week'));
      add(keys.workWeekView, byType('workWeek'));
      add(keys.monthView, byType('month'));
    });
  }

  private watchSelection(): void {
    const selection = this.parts.model.selection();
    const id = selection ? `${selection.start.getTime()}-${selection.end.getTime()}-${selection.allDay}` : '';
    untracked(() => {
      const parts = this.parts;
      if (id === parts.lastSelection) return;
      parts.lastSelection = id;
      parts.selectionChanged.fire({ selection, source: this });
    });
  }

  /** Focus on a cell follows the model's focused cell (it keeps its date when the days change). */
  private followFocus(): void {
    const focus = this.parts.model.state.focus;
    untracked(() => {
      const active = deepActiveElement(this.element);
      const cell = active?.closest<HTMLElement>('[data-cell]');
      if (cell && this.element.contains(cell) && cell.dataset.cell !== `${focus.day}:${focus.slot}`) this.focusCellElement();
    });
  }

  private watchContent(): void {
    const parts = this.parts;
    const shown = parts.model.state.shown;
    const range = parts.model.range();
    if (this.loading) return;
    untracked(() => queueMicrotask(() => !this.isDisposed && parts.contentReady.fire({ range, appointments: shown, source: this })));
  }

  /** When a view with hours shows (not on every date), it scrolls to `scrollHour`: the work start, or now on today. */
  private scrollOnShow(): void {
    const view = this.resolveView();
    const hour = this.scrollHour;
    const start = this.workStartHour;
    untracked(() => {
      const parts = this.parts;
      const id = `${view.name}:${hour}`;
      if (view.type === 'month' || parts.scrolledFor === id) return;
      const go = () => {
        if (!parts.scroller || this.isDisposed) return;
        parts.scrolledFor = id;
        const now = new Date();
        const range = parts.model.range();
        const showsToday = now >= range.start && now < range.end;
        const at = hour ?? (showsToday && now.getHours() > start ? Math.max(view.startDayHour, now.getHours() - 1) : start);
        this.scrollToTime(at);
      };
      if (parts.scroller) go();
      else setTimeout(go, 0);
    });
  }

  private viewList(): (SchedulerView & { name: string })[] {
    return this.views.map((v) => (typeof v === 'string' ? { type: v, name: v } : { ...v, name: v.name ?? v.type }));
  }

  private resolveView(): ResolvedView {
    const list = this.viewList();
    const name = this.currentView;
    const view = list.find((v) => v.name === name) ?? list[0] ?? { type: 'week', name: 'week' };
    const own = <V,>(value: Bind<V> | undefined, fallback: V): V => (value === undefined ? fallback : (read(value) ?? fallback));
    const start = own(view.startDayHour, this.startDayHour);
    return {
      name: view.name ?? view.type,
      type: view.type,
      intervalCount: Math.max(1, own(view.intervalCount, 1)),
      startDayHour: start,
      endDayHour: Math.max(start + 1, own(view.endDayHour, this.endDayHour)),
      cellDuration: own(view.cellDuration, this.cellDuration),
      allDayPanel: own(view.allDayPanel, this.allDayPanel),
      maxAppointmentsPerCell: own(view.maxAppointmentsPerCell, this.maxAppointmentsPerCell),
    };
  }

  private viewText(view: SchedulerView): string {
    return (view.text !== undefined ? read(view.text) : '') || this.textOf(VIEW_TEXTS[view.type]);
  }

  private rangeOf(view: ResolvedView, date: Date): SchedulerRange {
    const dates = viewDates(view, date, this.firstDayOfWeek, this.workDays);
    const last = dates[dates.length - 1];
    return {
      start: dates[0],
      end: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
    };
  }

  private rangeText(): string {
    const view = this.resolveView();
    const range = this.rangeOf(view, this.currentDate);
    return this.parts.format.range(view.type, range.start, range.end);
  }

  private today(): Date {
    return dayStart(new Date(this.parts.model.state.now));
  }

  private isRtl(): boolean {
    const view = this.element.ownerDocument.defaultView;
    return !!view && view.getComputedStyle(this.element).direction === 'rtl';
  }

  private step(by: number, byUser: boolean): boolean {
    return this.changeDate(stepDate(this.resolveView(), this.currentDate, by), byUser);
  }

  private changeDate(to: Date, byUser: boolean): boolean {
    const parts = this.parts;
    const from = untracked(() => this.currentDate);
    if (sameDay(from, to)) return true;
    const e: DateChangingEventArgs<T> = {
      from,
      to,
      byUser,
      cancel: false,
      source: this,
    };
    parts.dateChanging.fire(e);
    if (e.cancel) return false;
    this.changeProperty('currentDate', to);
    const view = untracked(() => this.resolveView());
    const range = this.rangeOf(view, to);
    parts.dateChanged.fire({ from, to, range, byUser, source: this });
    this.say(
      this.textOf('schedulerShown', {
        range: parts.format.range(view.type, range.start, range.end),
      }),
    );
    return true;
  }

  private changeView(name: string, byUser: boolean): boolean {
    const parts = this.parts;
    const from = untracked(() => this.currentView);
    if (from === name || !this.viewList().some((v) => v.name === name)) return from === name;
    const e: ViewChangingEventArgs<T> = {
      from,
      to: name,
      byUser,
      cancel: false,
      source: this,
    };
    parts.viewChanging.fire(e);
    if (e.cancel) return false;
    // The view that has focus goes away: focus goes to the new view's cell when it is there.
    parts.focusWhenShown = this.focusInView();
    this.changeProperty('currentView', name);
    parts.viewChanged.fire({ from, to: name, byUser, source: this });
    const view = untracked(() => this.resolveView());
    const range = this.rangeOf(
      view,
      untracked(() => this.currentDate),
    );
    const viewName = this.viewText(this.viewList().find((v) => v.name === name)!);
    this.say(
      this.textOf('schedulerViewShown', {
        view: viewName,
        range: parts.format.range(view.type, range.start, range.end),
      }),
    );
    return true;
  }

  private say(text: string): void {
    if (!untracked(() => this.announce)) return;
    const version = this.parts.version;
    version.said = '';
    queueMicrotask(() => (version.said = text));
  }

  private cellPointerDown(place: CellPlace, e: PointerEvent): void {
    if (e.button !== 0) return;
    const parts = this.parts;
    parts.model.focusCell(place, e.shiftKey);
    parts.selecting = true;
    const doc = this.element.ownerDocument;
    const move = (ev: PointerEvent) => {
      const target = doc.elementFromPoint(ev.clientX, ev.clientY);
      const cell = target instanceof Element ? target.closest<HTMLElement>('[data-cell]') : null;
      if (!cell || !this.element.contains(cell)) return;
      const [day, slot] = cell.dataset.cell!.split(':').map(Number);
      if (day !== parts.model.state.focus.day || slot !== parts.model.state.focus.slot) parts.model.focusCell({ day, slot }, true);
    };
    const up = () => {
      parts.selecting = false;
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', up);
      doc.removeEventListener('pointercancel', up);
    };
    doc.addEventListener('pointermove', move);
    doc.addEventListener('pointerup', up);
    doc.addEventListener('pointercancel', up);
  }

  private fireCell(emitter: Emitter<CellClickEventArgs<T>>, place: CellPlace, event: MouseEvent | KeyboardEvent): boolean {
    const cell = this.parts.model.cellOf(place);
    if (!cell) return false;
    const e: CellClickEventArgs<T> = {
      cell,
      event,
      cancel: false,
      source: this,
    };
    emitter.fire(e);
    return !e.cancel;
  }

  private fireAppointment(emitter: Emitter<AppointmentClickEventArgs<T>>, piece: TimedPiece<T> | StripPiece<T>, event: MouseEvent | KeyboardEvent): boolean {
    const e: AppointmentClickEventArgs<T> = {
      appointment: piece.item,
      start: piece.start,
      end: piece.end,
      event,
      cancel: false,
      source: this,
    };
    emitter.fire(e);
    return !e.cancel;
  }

  private openMore(day: Date, anchor: HTMLElement): void {
    const parts = this.parts;
    const items = parts.model.appointmentsIn(day, new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1));
    const e: MoreOpeningEventArgs<T> = {
      date: day,
      appointments: items,
      cancel: false,
      source: this,
    };
    parts.moreOpening.fire(e);
    if (e.cancel) return;
    parts.more.date = day;
    parts.more.items = items;
    const popup = this.morePopup();
    popup.open(anchor);
    queueMicrotask(() => (popup.element.querySelector('button') as HTMLElement | null)?.focus());
  }

  private morePopup(): Popup {
    const parts = this.parts;
    if (parts.morePopup) return parts.morePopup;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.class.add('mx-scheduler__more-popup');
    const choose = (item: T, event: MouseEvent) => {
      popup.close();
      const time = parts.model.timeOf(item);
      if (!time) return;
      parts.appointmentClick.fire({
        appointment: item,
        start: time.start,
        end: time.end,
        event,
        cancel: false,
        source: this,
      });
    };
    popup.controls.add(<MoreList host={parts.host} state={parts.more} choose={choose} />);
    this.controls.add(popup);
    parts.morePopup = popup;
    return popup;
  }

  /** Arrows, Home, End, PageUp and PageDown move over the cells (Shift selects); Enter and Space are a double click and a click. */
  private gridKey(e: KeyboardEvent): void {
    const parts = this.parts;
    const model = parts.model;
    const view = this.resolveView();
    const month = view.type === 'month';
    const focus = model.state.focus;
    const days = model.state.days.length;
    const rows = model.state.slots.length;
    const across = this.isRtl() ? -1 : 1;
    const minSlot = month ? -1 : view.allDayPanel ? -1 : 0;
    let day = focus.day;
    let slot = focus.slot;
    let stepOut = 0;
    switch (e.key) {
      case 'ArrowLeft':
        day -= across;
        break;
      case 'ArrowRight':
        day += across;
        break;
      case 'ArrowUp':
        if (month) day -= 7;
        else slot = Math.max(minSlot, slot - 1);
        break;
      case 'ArrowDown':
        if (month) day += 7;
        else slot = Math.min(rows - 1, slot + 1);
        break;
      case 'Home':
        if (e.ctrlKey) [day, slot] = [0, month ? -1 : 0];
        else day = month ? day - (day % 7) : 0;
        break;
      case 'End':
        if (e.ctrlKey) [day, slot] = [days - 1, month ? -1 : rows - 1];
        else day = month ? day - (day % 7) + 6 : days - 1;
        break;
      case 'PageUp':
      case 'PageDown': {
        const by = e.key === 'PageUp' ? -1 : 1;
        if (month) stepOut = by;
        else slot = Math.max(minSlot, Math.min(rows - 1, slot + by * this.pageRows()));
        break;
      }
      case 'Enter':
        e.preventDefault();
        this.fireCell(parts.cellDblClick, focus, e);
        return;
      case ' ':
        e.preventDefault();
        model.focusCell(focus);
        this.fireCell(parts.cellClick, focus, e);
        return;
      case 'Escape':
        if (!model.state.anchor) return;
        e.preventDefault();
        model.clearSelection();
        return;
      default:
        return;
    }
    e.preventDefault();
    if (!stepOut && (day < 0 || day >= days)) stepOut = day < 0 ? -1 : 1;
    if (stepOut) {
      // Past the first or the last day: the view moves on and the focus keeps its place in it.
      const keep = month ? ((focus.day % 7) + 7) % 7 : day < 0 ? days - 1 : day >= days ? 0 : focus.day;
      if (!this.step(stepOut, true)) return;
      queueMicrotask(() => {
        const count = model.state.days.length;
        const target = month ? Math.min(count - 1, (stepOut < 0 ? Math.floor((count - 1) / 7) * 7 : 0) + keep) : Math.min(count - 1, keep);
        model.focusCell({ day: target, slot }, e.shiftKey);
        this.focusCellElement();
      });
      return;
    }
    model.focusCell({ day, slot }, e.shiftKey);
    this.focusCellElement();
  }

  /** The time rows on one screen. */
  private pageRows(): number {
    const scroller = this.parts.scroller;
    const row = scroller?.querySelector<HTMLElement>('.mx-scheduler__cells .mx-scheduler__row');
    return scroller && row && row.offsetHeight > 0 ? Math.max(1, Math.floor(scroller.clientHeight / row.offsetHeight) - 1) : 8;
  }

  /** Whether focus is in the view (not in the bar). */
  private focusInView(): boolean {
    const focus = deepActiveElement(this.element);
    return !!focus && !!this.element.querySelector('.mx-scheduler__content')?.contains(focus);
  }

  /** Moves DOM focus to the focused cell (after the view drew it). */
  private focusCellElement(): void {
    queueMicrotask(() => {
      const focus = this.parts.model.state.focus;
      const cell = this.element.querySelector<HTMLElement>(`[data-cell="${focus.day}:${focus.slot}"]`);
      cell?.focus({ preventScroll: false });
    });
  }

  /** The cell a time is in, among the days shown. */
  private placeOf(time: Date, allDay: boolean): CellPlace | null {
    const model = this.parts.model;
    const day = model.state.days.findIndex((d) => sameDay(d.date, time));
    if (day < 0) return null;
    if (allDay || this.resolveView().type === 'month') return { day, slot: -1 };
    const minutes = time.getHours() * 60 + time.getMinutes();
    const slots = model.state.slots;
    let slot = 0;
    for (let i = 0; i < slots.length; i++) if (slots[i].minutes <= minutes) slot = i;
    return { day, slot };
  }
}
