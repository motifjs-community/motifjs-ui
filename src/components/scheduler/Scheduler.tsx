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
import { firstDayOfWeek as localeFirstDay } from '../../parts/dates/first-day-of-week';
import { sameDay } from '../../parts/dates/same-day';
import { TimeZone } from '../../parts/dates/time-zone';
import { describeRecurrence } from '../../parts/recurrence/describe-recurrence';
import { Button } from '../button/Button';
import { Calendar } from '../calendar/Calendar';
import { Spinner } from '../progress/Spinner';
import { Toolbar } from '../toolbar/Toolbar';
import type { AppointmentAddedEventArgs } from './appointment-added-event-args';
import type { AppointmentAddingEventArgs } from './appointment-adding-event-args';
import type { AppointmentClickEventArgs } from './appointment-click-event-args';
import type { AppointmentDeletedEventArgs } from './appointment-deleted-event-args';
import type { AppointmentDeletingEventArgs } from './appointment-deleting-event-args';
import { AppointmentEditor, type EditorEvents } from './AppointmentEditor';
import type { AppointmentUpdatedEventArgs } from './appointment-updated-event-args';
import type { AppointmentUpdatingEventArgs } from './appointment-updating-event-args';
import type { DataErrorEventArgs } from './data-error-event-args';
import type { DragEventArgs } from './drag-event-args';
import type { FormOpeningEventArgs } from './form-opening-event-args';
import { AppointmentStore } from './model/AppointmentStore';
import type { Draft } from './model/draft';
import type { SchedulerEditing } from './scheduler-editing';
import { AppointmentDrag } from './view/AppointmentDrag';
import type { AppointmentTemplateContext } from './appointment-template-context';
import type { CellClickEventArgs } from './cell-click-event-args';
import type { ContentReadyEventArgs } from './content-ready-event-args';
import type { DateChangedEventArgs } from './date-changed-event-args';
import type { DateChangingEventArgs } from './date-changing-event-args';
import type { CellPlace } from './model/cell-place';
import type { OverlapMode } from './model/overlap-mode';
import type { ResolvedView } from './model/resolved-view';
import { Resources } from './model/Resources';
import { sameValue } from './model/same-value';
import { SchedulerModel } from './model/SchedulerModel';
import { rangeFilter } from './model/range-filter';
import type { SeriesScope } from './model/series-scope';
import type { StripPiece } from './model/strip-piece';
import type { TimedPiece } from './model/timed-piece';
import { stepDate, viewDates } from './model/view-dates';
import type { MoreOpeningEventArgs } from './more-opening-event-args';
import type { SchedulerCell } from './scheduler-cell';
import type { SchedulerFields } from './scheduler-fields';
import type { SchedulerKeys } from './scheduler-keys';
import type { SchedulerProps } from './scheduler-props';
import type { ResourceHeaderContext } from './resource-header-context';
import type { SchedulerBlockedTime } from './scheduler-blocked-time';
import type { SchedulerResource } from './scheduler-resource';
import type { SchedulerTimeCheck } from './scheduler-time-check';
import type { SchedulerRange } from './scheduler-range';
import type { SchedulerView } from './scheduler-view';
import type { SchedulerViewType } from './scheduler-view-type';
import type { SelectionChangedEventArgs } from './selection-changed-event-args';
import type { SeriesAction } from './series-action';
import type { SeriesAnsweredEventArgs } from './series-answered-event-args';
import type { SeriesAskingEventArgs } from './series-asking-event-args';
import type { SeriesEditMode } from './series-edit-mode';
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
  'timeZone',
  'seriesEdit',
  'recurrenceMarks',
  'appointmentTemplate',
  'resources',
  'groups',
  'groupByDate',
  'resourceHeaderTemplate',
  'blockedTimes',
  'allowOverlap',
  'allowOffHours',
  'texts',
  'keys',
  'announce',
  'editing',
  'snapMinutes',
  'minDuration',
  'tooltip',
] as const;

const DEFAULT_EDITING: SchedulerEditing = {
  allowAdding: true,
  allowUpdating: true,
  allowDeleting: true,
  allowDragging: true,
  allowResizing: true,
  allowCopying: true,
  confirmDelete: true,
  allowRecurrence: true,
  allowTimeZones: false,
};

/** Props whose value is a function (a template, a test of a day, a rule). */
const FUNCTION_VALUES = new Set(['isHoliday', 'appointmentTemplate', 'resourceHeaderTemplate', 'allowOverlap']);

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
  allowDrag: 'allowDrag',
  allowResize: 'allowResize',
  allowEdit: 'allowEdit',
  allowDelete: 'allowDelete',
  recurrenceRule: 'recurrenceRule',
  recurrenceException: 'recurrenceException',
  recurrenceId: 'recurrenceId',
  startTimeZone: 'startDateTimeZone',
  endTimeZone: 'endDateTimeZone',
};

const DEFAULT_KEYS: SchedulerKeys = {
  today: ['T'],
  next: ['N', 'J'],
  previous: ['P', 'K'],
  dayView: ['D'],
  weekView: ['W'],
  workWeekView: ['X'],
  monthView: ['M'],
  previousGroup: ['Alt+Shift+ArrowLeft'],
  nextGroup: ['Alt+Shift+ArrowRight'],
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
  resources: Resources;
  format: SchedulerFormat;
  host: SchedulerHost<T>;
  /** Changes of the rows (the data source's, or the array's in place) to read them again; the draft; the appointments being saved. */
  version: { rows: number; status: string; monthRoom: number; said: string; draft: Draft<T> | null; saving: string[] };
  store: AppointmentStore<T>;
  editor: AppointmentEditor<T>;
  drag: AppointmentDrag<T>;
  events: EditorEvents<T>;
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
 * as "+N more". Resources colour the appointments and split the columns into groups (nested, or
 * under each date); blocked times, work hours per resource and an overlap rule say where an
 * appointment may go. Every setting is a value or a function that is followed; a view's own
 * settings win over the scheduler's.
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
      [own.onAppointmentAdding, parts.events.adding as Emitter<never>],
      [own.onAppointmentAdded, parts.events.added as Emitter<never>],
      [own.onAppointmentUpdating, parts.events.updating as Emitter<never>],
      [own.onAppointmentUpdated, parts.events.updated as Emitter<never>],
      [own.onAppointmentDeleting, parts.events.deleting as Emitter<never>],
      [own.onAppointmentDeleted, parts.events.deleted as Emitter<never>],
      [own.onFormOpening, parts.events.formOpening as Emitter<never>],
      [own.onDataError, parts.events.dataError as Emitter<never>],
      [own.onMoveStart, parts.events.moveStart as Emitter<never>],
      [own.onMoving, parts.events.moving as Emitter<never>],
      [own.onMoveEnd, parts.events.moveEnd as Emitter<never>],
      [own.onResizeStart, parts.events.resizeStart as Emitter<never>],
      [own.onResizing, parts.events.resizing as Emitter<never>],
      [own.onResizeEnd, parts.events.resizeEnd as Emitter<never>],
      [own.onSeriesAsking, parts.events.seriesAsking as Emitter<never>],
      [own.onSeriesAnswered, parts.events.seriesAnswered as Emitter<never>],
    ];
    for (const [handler, emitter] of on) if (handler) emitter.event(handler);
    this.motif.setDisposable(() => {
      parts.model.dispose();
      parts.drag.dispose();
      parts.editor.dispose();
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
  /** The clock the days and hours are on, an IANA time zone; `null` for the browser's. */
  get timeZone(): string | null {
    return this.getProperty<string | null | undefined>('timeZone') || null;
  }
  set timeZone(value: Bind<string | null>) {
    this.assignProperty('timeZone', value);
  }
  /** What changing or deleting an occurrence of a series reaches; `'ask'` asks the user. */
  get seriesEdit(): SeriesEditMode {
    return this.getProperty<SeriesEditMode | undefined>('seriesEdit') ?? 'ask';
  }
  set seriesEdit(value: Bind<SeriesEditMode>) {
    this.assignProperty('seriesEdit', value);
  }
  /** Marks on occurrences of a series and on ones changed apart. Default `true`. */
  get recurrenceMarks(): boolean {
    return this.getProperty<boolean | undefined>('recurrenceMarks') ?? true;
  }
  set recurrenceMarks(value: Bind<boolean>) {
    this.assignProperty('recurrenceMarks', value, Boolean);
  }
  get appointmentTemplate(): ((context: AppointmentTemplateContext<T>) => ComponentBase) | null {
    return this.getProperty<((context: AppointmentTemplateContext<T>) => ComponentBase) | null | undefined>('appointmentTemplate') ?? null;
  }
  set appointmentTemplate(value: Bind<((context: AppointmentTemplateContext<T>) => ComponentBase) | null>) {
    this.bindOwn('appointmentTemplate', value);
  }
  get resources(): readonly SchedulerResource<any>[] {
    return this.getProperty<readonly SchedulerResource<any>[] | undefined>('resources') ?? [];
  }
  set resources(value: Bind<readonly SchedulerResource<any>[]>) {
    this.assignProperty('resources', value);
  }
  /** The resource fields the columns are grouped by, outer first. */
  get groups(): readonly string[] {
    return this.getProperty<readonly string[] | undefined>('groups') ?? [];
  }
  set groups(value: Bind<readonly string[]>) {
    this.assignProperty('groups', value);
  }
  get groupByDate(): boolean {
    return this.getProperty<boolean | undefined>('groupByDate') ?? false;
  }
  set groupByDate(value: Bind<boolean>) {
    this.assignProperty('groupByDate', value, Boolean);
  }
  get resourceHeaderTemplate(): ((context: ResourceHeaderContext) => ComponentBase) | null {
    return this.getProperty<((context: ResourceHeaderContext) => ComponentBase) | null | undefined>('resourceHeaderTemplate') ?? null;
  }
  set resourceHeaderTemplate(value: Bind<((context: ResourceHeaderContext) => ComponentBase) | null>) {
    this.bindOwn('resourceHeaderTemplate', value);
  }
  /** Times nothing may be put in. */
  get blockedTimes(): readonly SchedulerBlockedTime[] {
    return this.getProperty<readonly SchedulerBlockedTime[] | undefined>('blockedTimes') ?? [];
  }
  set blockedTimes(value: Bind<readonly SchedulerBlockedTime[]>) {
    this.assignProperty('blockedTimes', value);
  }
  /** Whether the user may make an appointment overlap another of its group; or a rule that decides whether a time is free. Default `true`. */
  get allowOverlap(): boolean | ((check: SchedulerTimeCheck<T>) => boolean) {
    return this.getProperty<boolean | ((check: SchedulerTimeCheck<T>) => boolean) | undefined>('allowOverlap') ?? true;
  }
  set allowOverlap(value: Bind<boolean | ((check: SchedulerTimeCheck<T>) => boolean)>) {
    this.bindOwn('allowOverlap', value);
  }
  /** Whether the user may put an appointment outside the work hours. Default `true`. */
  get allowOffHours(): boolean {
    return this.getProperty<boolean | undefined>('allowOffHours') ?? true;
  }
  set allowOffHours(value: Bind<boolean>) {
    this.assignProperty('allowOffHours', value, Boolean);
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
  /** What the user may change; `false` changes nothing (read only), `true` everything. */
  get editing(): SchedulerEditing<T> {
    const value = this.getProperty<boolean | Partial<SchedulerEditing<T>> | undefined>('editing');
    if (value === false) return Object.fromEntries(Object.keys(DEFAULT_EDITING).map((k) => [k, k === 'confirmDelete'])) as unknown as SchedulerEditing<T>;
    return { ...DEFAULT_EDITING, ...(typeof value === 'object' && value ? value : {}) } as SchedulerEditing<T>;
  }
  set editing(value: Bind<boolean | Partial<SchedulerEditing<T>>>) {
    this.assignProperty('editing', value);
  }
  /** The minutes a drag and the keys move by. Default: the view's cell. */
  get snapMinutes(): number {
    return Math.max(1, this.getProperty<number | undefined>('snapMinutes') ?? this.resolveView().cellDuration);
  }
  set snapMinutes(value: Bind<number>) {
    this.assignProperty('snapMinutes', value, Number);
  }
  /** The shortest an appointment gets by resizing, in minutes. Default: `snapMinutes`. */
  get minDuration(): number {
    return Math.max(1, this.getProperty<number | undefined>('minDuration') ?? this.snapMinutes);
  }
  set minDuration(value: Bind<number>) {
    this.assignProperty('minDuration', value, Number);
  }
  /** A click on an appointment shows its tooltip. Default `true`. */
  get tooltip(): boolean {
    return this.getProperty<boolean | undefined>('tooltip') ?? true;
  }
  set tooltip(value: Bind<boolean>) {
    this.assignProperty('tooltip', value, Boolean);
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
  get onAppointmentAdding(): MotifEvent<AppointmentAddingEventArgs<T>> {
    return this.parts.events.adding.event;
  }
  get onAppointmentAdded(): MotifEvent<AppointmentAddedEventArgs<T>> {
    return this.parts.events.added.event;
  }
  get onAppointmentUpdating(): MotifEvent<AppointmentUpdatingEventArgs<T>> {
    return this.parts.events.updating.event;
  }
  get onAppointmentUpdated(): MotifEvent<AppointmentUpdatedEventArgs<T>> {
    return this.parts.events.updated.event;
  }
  get onAppointmentDeleting(): MotifEvent<AppointmentDeletingEventArgs<T>> {
    return this.parts.events.deleting.event;
  }
  get onAppointmentDeleted(): MotifEvent<AppointmentDeletedEventArgs<T>> {
    return this.parts.events.deleted.event;
  }
  get onFormOpening(): MotifEvent<FormOpeningEventArgs<T>> {
    return this.parts.events.formOpening.event;
  }
  get onDataError(): MotifEvent<DataErrorEventArgs<T>> {
    return this.parts.events.dataError.event;
  }
  get onMoveStart(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.moveStart.event;
  }
  get onMoving(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.moving.event;
  }
  get onMoveEnd(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.moveEnd.event;
  }
  get onResizeStart(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.resizeStart.event;
  }
  get onResizing(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.resizing.event;
  }
  get onResizeEnd(): MotifEvent<DragEventArgs<T>> {
    return this.parts.events.resizeEnd.event;
  }
  get onSeriesAsking(): MotifEvent<SeriesAskingEventArgs<T>> {
    return this.parts.events.seriesAsking.event;
  }
  get onSeriesAnswered(): MotifEvent<SeriesAnsweredEventArgs<T>> {
    return this.parts.events.seriesAnswered.event;
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
    const first = this.placeOf(cell.start, cell.allDay, cell.resources ?? null);
    const last = this.placeOf(new Date(cell.end.getTime() - 1), cell.allDay, cell.resources ?? null);
    if (!first || !last) return false;
    model.focusCell(first);
    model.focusCell(last, true);
    return true;
  }

  /** Adds an appointment where they come from (the array, or the data source), asking `onAppointmentAdding` first. */
  addAppointment(values: Partial<T>): Promise<T | null> {
    return this.parts.editor.add(values);
  }
  /**
   * Changes an appointment's fields, asking `onAppointmentUpdating` first. For an occurrence of a
   * series, `scope` says what the change reaches; default: `seriesEdit`'s, else the occurrence.
   */
  updateAppointment(appointment: T, changes: Partial<T>, scope: SeriesScope | null = null): Promise<boolean> {
    return this.parts.editor.update(appointment, changes, false, scope);
  }
  /** Deletes an appointment, asking `onAppointmentDeleting` first (not the user); `scope` as for `updateAppointment`. */
  deleteAppointment(appointment: T, scope: SeriesScope | null = null): Promise<boolean> {
    return this.parts.editor.remove(appointment, false, scope);
  }
  /** The series of an occurrence (or of one changed apart from it), a series itself, or `null`. */
  seriesOf(appointment: T): T | null {
    return this.parts.model.seriesOf(appointment);
  }
  /** Whether an appointment is an occurrence of a series (the scheduler made it from the series' rule). */
  isOccurrence(appointment: T): boolean {
    return !!this.parts.model.occurrenceOf(appointment);
  }
  /** Whether an appointment is an occurrence changed apart from its series (it names the series by `recurrenceId`). */
  isException(appointment: T): boolean {
    return this.parts.model.isException(appointment);
  }
  /** The occurrences of a series that have any part between `start` and `end`. */
  occurrencesOf(series: T, start: Date, end: Date): T[] {
    const model = this.parts.model;
    return model.occurrences.of(series, start.getTime(), end.getTime()).filter((o) => {
      const time = model.timeOf(o);
      return !!time && time.start < end && (time.end > start || time.end.getTime() === time.start.getTime());
    });
  }
  /** How a series (or the series of an occurrence) repeats, in plain words; empty for an appointment that happens once. */
  recurrenceText(appointment: T): string {
    const series = this.parts.model.seriesOf(appointment);
    const rule = series ? this.parts.model.occurrences.ruleOf(series) : null;
    if (!series || !rule) return '';
    const time = this.parts.model.timeOf(series);
    const zone = this.parts.model.occurrences.zoneOf(series);
    return describeRecurrence(rule, time ? zone.toLocal(time.start) : null, {
      locale: this.locale,
      strings: { ...uiLocale.strings, ...this.texts },
      timeZone: zone.name || undefined,
    });
  }
  /** Asks the user what a change (or a delete) of an occurrence reaches; `null` when the question is cancelled. */
  askSeries(appointment: T, action: SeriesAction = 'update'): Promise<SeriesScope | null> {
    return this.parts.editor.askSeries(appointment, action);
  }
  /** Opens the appointment form: for an appointment, or for a new one at `cell` (the selection by default). */
  showAppointmentForm(appointment: T | null = null, cell: SchedulerCell | null = null): Promise<void> {
    return this.parts.editor.openForm(appointment, cell ?? (appointment ? null : this.parts.model.selection()));
  }
  /** Shows an appointment's tooltip next to `anchor` (its box by default). */
  showTooltip(appointment: T, anchor?: HTMLElement): void {
    const box = anchor ?? this.boxOf(appointment);
    if (box) this.parts.editor.showTooltip(appointment, box);
  }
  hideTooltip(): void {
    this.parts.editor.hideTooltip();
  }
  /**
   * Whether an appointment may be at a time, and what is there: the appointments it would overlap
   * in its groups, the blocked times, whether it is outside the work hours. With `resources`, the
   * values its resource fields would have there.
   */
  checkTime(
    appointment: T,
    start: Date,
    end: Date,
    options: { allDay?: boolean; resources?: Record<string, unknown> | null } = {},
  ): SchedulerTimeCheck<T> & { free: boolean } {
    const result = this.parts.model.check(appointment, start, end, options.allDay ?? false, options.resources ?? null);
    return { ...result.check, free: result.free };
  }
  /** An appointment's resource items, by kind, in the order of `resources` (the kinds it has). */
  resourcesOf(appointment: T): { field: string; label: string; items: { value: unknown; text: string; color: string; item: unknown }[] }[] {
    return this.parts.resources.itemsOf(appointment).map(({ kind, items }) => ({
      field: kind.field,
      label: kind.label,
      items: items.map(({ value, text, color, item }) => ({ value, text, color, item })),
    }));
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

  override onMounted() {
    // A finger dragging an appointment must not scroll the page: the listener has to be there before the finger lands.
    const drag = this.parts.drag;
    const hold = (e: TouchEvent) => {
      if (drag.active) e.preventDefault();
    };
    this.element.addEventListener('touchmove', hold, { passive: false });
    this.motif.setDisposable(() => this.element.removeEventListener('touchmove', hold));
  }

  override view() {
    const parts = this.parts;
    const host = parts.host;
    const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.textOf(key, values);
    const type = () => (this.resolveView().type === 'month' ? 'month' : 'time');
    return (
      <>
        <Toolbar class="mx-scheduler__bar" label={() => this.text || t('schedulerLabel')} size="sm" x-display={() => this.toolbar}>
          <Button class="mx-scheduler__today" text={() => t('today')} onclick={() => this.changeDate(this.today(), true)} />
          <Button
            class="mx-scheduler__step"
            icon={chevronStart()}
            hint={() => t('schedulerPrevious')}
            onclick={() => this.step(-1, true)}
          />
          <Button class="mx-scheduler__step" icon={chevronEnd()} hint={() => t('schedulerNext')} onclick={() => this.step(1, true)} />
          <Button class="mx-scheduler__title" text={() => this.rangeText()} dropDown={parts.picker} ref={(b: Button) => (parts.title = b)} />
          {this.viewList().map((view) => (
            <Button
              key={view.name}
              class="mx-scheduler__view-button"
              toggle
              pressed={() => this.currentView === view.name}
              text={() => this.viewText(view)}
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
            <Button text={() => t('retry')} onclick={() => void this.dataSource?.retry()} />
          </div>
        </div>
        <div class="mx-scheduler__live mx-sr-only" aria-live="polite" role="status">
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
      draft: null,
      saving: [],
    }) as Parts<T>['version'];
    const more = reactive({ date: null, items: [] }) as MoreListState<T>;
    const zone = () => TimeZone.of(this.timeZone);
    const format = new SchedulerFormat(() => this.locale, zone);
    const resources = new Resources(() => this.resources);
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
      draft: () => version.draft,
      zone,
      resources,
      workHours: () => ({ start: this.workStartHour, end: this.workEndHour }),
      blockedTimes: () => this.blockedTimes,
      allowOverlap: () => this.allowOverlap,
      allowOffHours: () => this.allowOffHours,
    });
    const parts = {
      model,
      resources,
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
      events: {
        adding: new Emitter(),
        added: new Emitter(),
        updating: new Emitter(),
        updated: new Emitter(),
        deleting: new Emitter(),
        deleted: new Emitter(),
        formOpening: new Emitter(),
        dataError: new Emitter(),
        moveStart: new Emitter(),
        moving: new Emitter(),
        moveEnd: new Emitter(),
        resizeStart: new Emitter(),
        resizing: new Emitter(),
        resizeEnd: new Emitter(),
        seriesAsking: new Emitter(),
        seriesAnswered: new Emitter(),
      },
    } as unknown as Parts<T>;
    parts.host = this.createHost(parts);
    parts.store = new AppointmentStore<T>({
      appointments: () => this.appointments,
      source: () => this.dataSource,
      keyField: () => this.fields.key,
      changed: () => version.rows++,
    });
    parts.editor = new AppointmentEditor<T>({
      scheduler: this,
      model,
      store: parts.store,
      view: parts.host,
      events: parts.events,
      fields: () => this.fields,
      items: () => this.items(),
      editing: () => this.editing,
      resources: parts.resources,
      seriesEdit: () => this.seriesEdit,
      locale: () => this.locale,
      firstDayOfWeek: () => this.firstDayOfWeek,
      resolvedView: () => this.resolveView(),
      snapMinutes: () => this.snapMinutes,
      minDuration: () => this.minDuration,
      tooltip: () => this.tooltip,
      text: (key, values) => this.textOf(key, values),
      say: (text) => this.say(text),
      setDraft: (draft) => (version.draft = draft),
      root: () => this.element,
      scroller: () => parts.scroller,
      rtl: () => this.isRtl(),
      keys: () => this.keys,
      saving: version.saving,
    });
    parts.drag = new AppointmentDrag<T>(parts.editor);
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
      resources: parts.resources,
      headerTemplate: () => this.resourceHeaderTemplate,
      allDayLines: () => this.allDayLines,
      rtl: () => this.isRtl(),
      template: () => this.appointmentTemplate,
      recurrenceMarks: () => this.recurrenceMarks,
      recurrenceText: (item) => this.recurrenceText(item),
      zoneOf: (item) => {
        const name = (item as Record<string, unknown>)?.[this.fields.startTimeZone];
        return typeof name === 'string' && name !== (this.timeZone ?? '') ? name : '';
      },
      setMonthRoom: (lines) => {
        if (parts.version.monthRoom !== lines) parts.version.monthRoom = lines;
      },
      cellPointerDown: (place, e) => this.cellPointerDown(place, e),
      cellClick: (place, e) => this.fireCell(parts.cellClick, place, e),
      cellDblClick: (place, e) => this.openCell(place, e),
      appointmentClick: (piece, e) => this.clickAppointment(piece, e),
      appointmentDblClick: (piece, e) => this.openAppointment(piece, e),
      appointmentKey: (piece, e) => this.appointmentKey(piece, e),
      appointmentPointerDown: (piece, mode, e) => parts.drag.begin(piece.item, mode, e, piece.group),
      appointmentBlur: () => parts.editor.cancelKeys(),
      canDrag: (item) => parts.editor.canDrag(item),
      canResize: (item) => parts.editor.canResize(item),
      isSaving: (item) => parts.editor.isSaving(item),
      isOpen: (item) => parts.editor.isOpen(item),
      openMore: (day, group, anchor) => this.openMore(day, group, anchor),
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
    void parts.version.rows;
    return source ? source.rows : this.appointments;
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
      // A page of rows would leave appointments of the days shown out.
      if (source.loadMode !== 'all')
        console.warn(`Scheduler: its data source loads '${source.loadMode}'; make it with loadMode: 'all' so every appointment of the days shown comes.`);
      const listening = source.onChanged(() => {
        parts.version.rows++;
        parts.version.status = source.status;
      });
      parts.stopSource = () => listening.dispose();
      parts.version.status = source.status;
    });
  }

  /** With remote filtering, the data source is asked for the days shown only (and, grouped, for the resources shown). */
  private filterSource(): void {
    const source = this.dataSource;
    if (!source) return;
    const view = this.resolveView();
    const range = this.rangeOf(view, this.currentDate);
    const remote = this.remoteFiltering;
    const fields = this.fields;
    const resources = this.shownResources(view);
    untracked(() => {
      const parts = this.parts;
      if (!remote) {
        if (source.status === 'idle') void source.load();
        return;
      }
      // A series that began before the days shown may still happen in them.
      const span = rangeFilter(range, fields, { resources });
      void source.setFilter(parts.baseFilter ? { and: [parts.baseFilter, span] } : span);
    });
  }

  /** The values shown of each field grouped by that holds one value (a list cannot be asked for); none without groups. */
  private shownResources(view: ResolvedView): Record<string, unknown[]> {
    const groups = this.parts.model.state.groups;
    const out: Record<string, unknown[]> = {};
    if (!groups.length) return out;
    for (const field of view.groups) {
      const kind = this.parts.resources.kind(field);
      if (!kind || kind.multiple) continue;
      const values: unknown[] = [];
      for (const group of groups) if (!values.some((v) => sameValue(v, group.values[field]))) values.push(group.values[field]);
      out[field] = values;
    }
    return out;
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
      if (cell && this.element.contains(cell) && cell.dataset.cell !== `${focus.column}:${focus.slot}`) this.focusCellElement();
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
        const hours = Math.floor((parts.model.zone.wall(now) - parts.model.todayWall()) / 3_600_000);
        const at = hour ?? (showsToday && hours > start ? Math.max(view.startDayHour, hours - 1) : start);
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
    const kinds = this.resources.map((r) => r.field);
    const groups = own<readonly string[]>(view.groups, this.groups).filter((field, i, list) => kinds.includes(field) && list.indexOf(field) === i);
    return {
      name: view.name ?? view.type,
      type: view.type,
      intervalCount: Math.max(1, own(view.intervalCount, 1)),
      startDayHour: start,
      endDayHour: Math.max(start + 1, own(view.endDayHour, this.endDayHour)),
      cellDuration: own(view.cellDuration, this.cellDuration),
      allDayPanel: own(view.allDayPanel, this.allDayPanel),
      maxAppointmentsPerCell: own(view.maxAppointmentsPerCell, this.maxAppointmentsPerCell),
      groups,
      groupByDate: groups.length > 0 && own(view.groupByDate, this.groupByDate),
    };
  }

  private viewText(view: SchedulerView): string {
    return (view.text !== undefined ? read(view.text) : '') || this.textOf(VIEW_TEXTS[view.type]);
  }

  /** The days a view shows around `date`, as moments on the scheduler's clock. */
  private rangeOf(view: ResolvedView, date: Date): SchedulerRange {
    const dates = viewDates(view, date, this.firstDayOfWeek, this.workDays);
    const zone = TimeZone.of(this.timeZone);
    return {
      start: zone.date(TimeZone.wallOfLocal(dates[0])),
      end: zone.date(TimeZone.wallOfLocal(dates[dates.length - 1]) + 86_400_000),
    };
  }

  private rangeText(): string {
    const view = this.resolveView();
    const range = this.rangeOf(view, this.currentDate);
    return this.parts.format.range(view.type, range.start, range.end);
  }

  /** Today on the scheduler's clock, as a date of the browser's (what `currentDate` holds). */
  private today(): Date {
    return TimeZone.localOfWall(this.parts.model.todayWall());
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
      const [column, slot] = cell.dataset.cell!.split(':').map(Number);
      if (column !== parts.model.state.focus.column || slot !== parts.model.state.focus.slot) parts.model.focusCell({ column, slot }, true);
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
    const group = this.parts.model.state.groups[piece.group];
    const e: AppointmentClickEventArgs<T> = {
      appointment: piece.item,
      start: piece.start,
      end: piece.end,
      group: group ? { ...group.values } : null,
      event,
      cancel: false,
      source: this,
    };
    emitter.fire(e);
    return !e.cancel;
  }

  /** A click on an appointment (not the end of a drag): the event, then its tooltip. */
  private clickAppointment(piece: TimedPiece<T> | StripPiece<T>, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    if (parts.drag.justEnded) return;
    const box = e.currentTarget as HTMLElement | null;
    if (!this.fireAppointment(parts.appointmentClick, piece, e)) return;
    if (this.tooltip && box) parts.editor.showTooltip(piece.item, box);
  }

  /** A double click (or Enter) on an appointment: the event, then its form. */
  private openAppointment(piece: TimedPiece<T> | StripPiece<T>, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    if (parts.drag.justEnded) return;
    if (this.fireAppointment(parts.appointmentDblClick, piece, e)) void parts.editor.openForm(piece.item);
  }

  /** A double click (or Enter) on cells: the event, then the form for a new appointment there (the selection when the cell is in it). */
  private openCell(place: CellPlace, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    if (!this.fireCell(parts.cellDblClick, place, e) || !parts.editor.canAdd()) return;
    const model = parts.model;
    const selection = model.selection();
    const cell = model.cellOf(place);
    const inside = !!selection && !!cell && cell.allDay === selection.allDay && cell.start >= selection.start && cell.end <= selection.end;
    void parts.editor.openForm(null, inside ? selection : cell);
  }

  /** The keys of a focused appointment: moving and resizing by the keys, Delete, Enter and Space. */
  private appointmentKey(piece: TimedPiece<T> | StripPiece<T>, e: KeyboardEvent): void {
    if (this.parts.editor.key(piece, e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.openAppointment(piece, e);
    } else if (e.key === ' ') {
      e.preventDefault();
      this.clickAppointment(piece, e);
    }
  }

  /** The box an appointment shows in (its first one). */
  private boxOf(item: T): HTMLElement | null {
    const id = this.parts.model.idOf(item);
    const piece = [...this.parts.model.state.timed, ...this.parts.model.state.allDay.pieces, ...this.parts.model.state.weeks.flatMap((w) => w.pieces)].find(
      (p) => p.id.startsWith(`${id}@`) || p.id.startsWith(`${id}#`),
    );
    if (!piece) return null;
    return [...this.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].find((el) => el.dataset.piece === piece.id) ?? null;
  }

  private openMore(day: Date, group: number, anchor: HTMLElement): void {
    const parts = this.parts;
    const items = parts.model.appointmentsIn(day, parts.model.zone.addDays(day, 1), parts.model.state.groups[group] ?? null);
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
        group: null,
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
    const columns = model.state.columns.length;
    // A row of the month is a week (in every group); the day views are one row.
    const per = model.perRow;
    const rows = model.state.slots.length;
    const across = this.isRtl() ? -1 : 1;
    const minSlot = month ? -1 : view.allDayPanel ? -1 : 0;
    let column = focus.column;
    let slot = focus.slot;
    let stepOut = 0;
    const rowStart = month ? column - (column % per) : 0;
    switch (e.key) {
      case 'ArrowLeft':
        column -= across;
        break;
      case 'ArrowRight':
        column += across;
        break;
      case 'ArrowUp':
        if (month) column -= per;
        else slot = Math.max(minSlot, slot - 1);
        break;
      case 'ArrowDown':
        if (month) column += per;
        else slot = Math.min(rows - 1, slot + 1);
        break;
      case 'Home':
        if (e.ctrlKey) [column, slot] = [0, month ? -1 : 0];
        else column = rowStart;
        break;
      case 'End':
        if (e.ctrlKey) [column, slot] = [columns - 1, month ? -1 : rows - 1];
        else column = month ? rowStart + per - 1 : columns - 1;
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
        this.openCell(focus, e);
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
    if (!stepOut && (column < 0 || column >= columns)) stepOut = column < 0 ? -1 : 1;
    if (stepOut) {
      // Past the first or the last column: the view moves on and the focus keeps its place in it.
      const keep = month ? ((focus.column % per) + per) % per : column < 0 ? columns - 1 : column >= columns ? 0 : focus.column;
      if (!this.step(stepOut, true)) return;
      queueMicrotask(() => {
        const count = model.state.columns.length;
        const target = month ? Math.min(count - 1, (stepOut < 0 ? Math.floor((count - 1) / per) * per : 0) + keep) : Math.min(count - 1, keep);
        model.focusCell({ column: target, slot }, e.shiftKey);
        this.focusCellElement();
      });
      return;
    }
    model.focusCell({ column, slot }, e.shiftKey);
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
      const cell = this.element.querySelector<HTMLElement>(`[data-cell="${focus.column}:${focus.slot}"]`);
      cell?.focus({ preventScroll: false });
    });
  }

  /** The cell a time is in, among the days shown: in the group of `resources` (the first one by default). */
  private placeOf(time: Date, allDay: boolean, resources: Record<string, unknown> | null = null): CellPlace | null {
    const model = this.parts.model;
    const ofDay = model.state.columns.filter((c) => model.zone.sameDay(c.day.date, time));
    const own = resources ? ofDay.find((c) => !c.group || Object.entries(c.group.values).every(([field, value]) => sameValue(resources[field], value))) : null;
    const column = own ?? ofDay[0];
    if (!column) return null;
    if (allDay || this.resolveView().type === 'month') return { column: column.index, slot: -1 };
    const minutes = (model.zone.wall(time) - column.day.wall) / 60_000;
    const slots = model.state.slots;
    let slot = 0;
    for (let i = 0; i < slots.length; i++) if (slots[i].minutes <= minutes) slot = i;
    return { column: column.index, slot };
  }
}
