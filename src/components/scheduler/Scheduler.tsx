import { Component, Emitter, read, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { every } from '../../core/every';
import { deepActiveElement } from '../../core/focus';
import { fillText } from '../../core/fill-text';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { later } from '../../core/later';
import { nextFrame } from '../../core/next-frame';
import { calendarMark, chevronEnd, chevronStart } from '../../core/glyphs';
import { ResizeWatch } from '../../core/resize-watch';
import { onLookChanged } from '../../core/look-watch';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import { Popup } from '../../parts/popup/Popup';
import type { MenuItem } from '../../parts/menu/menu-item';
import { firstDayOfWeek as localeFirstDay } from '../../parts/dates/first-day-of-week';
import { sameDay } from '../../parts/dates/same-day';
import { TimeZone } from '../../parts/dates/time-zone';
import { describeRecurrence } from '../../parts/recurrence/describe-recurrence';
import { Button } from '../button/Button';
import { Calendar } from '../calendar/Calendar';
import { Spinner } from '../progress/Spinner';
import { Toolbar } from '../toolbar/Toolbar';
import { flag, put, shown, text } from '../../core/draw-parts';
import { KeyedParts } from './view/KeyedParts';
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
import type { AgendaRowContext } from './agenda-row-context';
import type { CellTemplateContext } from './cell-template-context';
import type { DateTemplateContext } from './date-template-context';
import type { MoreListContext } from './more-list-context';
import type { SchedulerTemplates } from './scheduler-templates';
import type { TimeTemplateContext } from './time-template-context';
import type { TooltipTemplateContext } from './tooltip-template-context';
import type { ScrollingMode } from './model/scrolling-mode';
import type { AnyPiece } from './model/any-piece';
import { dayCells, viewKind } from './model/view-kind';
import type { CellClickEventArgs } from './cell-click-event-args';
import type { ContentReadyEventArgs } from './content-ready-event-args';
import type { DateChangedEventArgs } from './date-changed-event-args';
import type { DateChangingEventArgs } from './date-changing-event-args';
import type { CellPlace } from './model/cell-place';
import type { OverlapMode } from './model/overlap-mode';
import type { ResolvedView } from './model/resolved-view';
import { Resources } from './model/Resources';
import { sameValue } from './model/same-value';
import { SchedulerModel, type ModelChange, type ModelStep } from './model/SchedulerModel';
import { rangeFilter } from './model/range-filter';
import type { SeriesScope } from './model/series-scope';
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
import { AgendaView } from './view/AgendaView';
import { TimelineView } from './view/TimelineView';
import type { TimelineScroll } from './view/timeline-scroll';
import { SchedulerTouch } from './view/SchedulerTouch';
import type { SchedulerPresentation } from './scheduler-presentation';
import type { SchedulerPresentationKind } from './scheduler-presentation-kind';
import type { SchedulerTabletWhen } from './scheduler-tablet-when';
import type { SchedulerPresentationChangingEventArgs } from './presentation-changing-event-args';
import type { SchedulerPresentationChangedEventArgs } from './presentation-changed-event-args';
import type { TimeZoomChangingEventArgs } from './time-zoom-changing-event-args';
import type { TimeZoomChangedEventArgs } from './time-zoom-changed-event-args';
import type { ICalendarExportOptions } from './icalendar-export-options';
import type { ICalendarExportingEventArgs } from './icalendar-exporting-event-args';
import type { ICalendarExportedEventArgs } from './icalendar-exported-event-args';
import type { ICalendarImportingEventArgs } from './icalendar-importing-event-args';
import type { ICalendarImportedEventArgs } from './icalendar-imported-event-args';
import type { ICalendarImportResult } from './icalendar-import-result';
import type { PrintingEventArgs } from './printing-event-args';
import type { PrintedEventArgs } from './printed-event-args';
import { ICalendarBridge } from './model/ICalendarBridge';

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
  'appointmentTooltipTemplate',
  'dataCellTemplate',
  'dateCellTemplate',
  'timeCellTemplate',
  'agendaRowTemplate',
  'moreListTemplate',
  'agendaDuration',
  'scrolling',
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
  'presentation',
  'tabletWidth',
  'phoneWidth',
  'tabletWhen',
  'phoneView',
  'tabletView',
  'swipeNavigation',
  'pinchZoom',
  'timeZoom',
] as const;

/**
 * The props the model works from, and the step a change of each starts at (the steps after it run
 * too): the model follows nothing, a prop's change is said here.
 */
const MODEL_STEPS: Partial<Record<(typeof OWN)[number], ModelStep>> = {
  views: 'groups',
  currentView: 'groups',
  startDayHour: 'groups',
  endDayHour: 'groups',
  cellDuration: 'groups',
  allDayPanel: 'groups',
  maxAppointmentsPerCell: 'groups',
  agendaDuration: 'groups',
  scrolling: 'groups',
  groups: 'groups',
  groupByDate: 'groups',
  workDays: 'groups',
  workStartHour: 'groups',
  workEndHour: 'groups',
  firstDayOfWeek: 'groups',
  isHoliday: 'groups',
  timeZone: 'groups',
  phoneView: 'groups',
  tabletView: 'groups',
  currentDate: 'days',
  blockedTimes: 'blocks',
  appointments: 'collect',
  dataSource: 'collect',
  fields: 'collect',
  overlapMode: 'layout',
  allDayLines: 'layout',
};

/** How far two fingers zoom the time scale, out and in. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

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
const FUNCTION_VALUES = new Set([
  'isHoliday',
  'appointmentTemplate',
  'appointmentTooltipTemplate',
  'dataCellTemplate',
  'dateCellTemplate',
  'timeCellTemplate',
  'agendaRowTemplate',
  'moreListTemplate',
  'resourceHeaderTemplate',
  'allowOverlap',
]);

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
  agendaView: ['A'],
  previousGroup: ['Alt+Shift+ArrowLeft'],
  nextGroup: ['Alt+Shift+ArrowRight'],
};

const VIEW_TEXTS: Record<SchedulerViewType, keyof UiStrings> = {
  day: 'schedulerDay',
  week: 'schedulerWeek',
  workWeek: 'schedulerWorkWeek',
  month: 'schedulerMonth',
  timelineDay: 'schedulerTimelineDay',
  timelineWeek: 'schedulerTimelineWeek',
  timelineWorkWeek: 'schedulerTimelineWorkWeek',
  timelineMonth: 'schedulerTimelineMonth',
  agenda: 'schedulerAgenda',
};

const DEFAULT_VIEWS: readonly SchedulerViewType[] = ['day', 'week', 'workWeek', 'month'];

const PARTS = Symbol('mx.scheduler');

/** The root's parts drawn by hand: the bar's buttons and the content's states. */
interface RootParts {
  today: Button;
  todayIcon: Button;
  previous: Button;
  next: Button;
  title: Button;
  viewMenu: Button;
  views: KeyedParts<SchedulerView & { name: string }, Button>;
  loading: Component<HTMLDivElement>;
  spinner: Spinner;
  failed: Component<HTMLDivElement>;
  failedText: HTMLElement;
  retry: Button;
}

interface Parts<T> {
  model: SchedulerModel<T>;
  resources: Resources;
  format: SchedulerFormat;
  host: SchedulerHost<T>;
  /** How each part drawn by hand (an appointment box, a head cell) draws itself: called again when an option it shows changes. */
  drawn: Set<() => void>;
  /** The data source's status; the appointments being saved. */
  version: {
    status: string;
    monthRoom: number;
    said: string;
    saving: string[];
    /** A timeline row's sizes in pixels, measured by the timeline view. */
    lines: { lane: number; gap: number; min: number };
    presentation: SchedulerPresentationKind;
    /** The screen's pointer is a finger. */
    coarse: boolean;
    /** It is being printed: everything is built, nothing scrolls. */
    printing: boolean;
    /** A finger swiping sideways: how far, which way, and whether letting go now moves on. */
    swipe: { active: boolean; x: number; next: boolean; ready: boolean };
    /** The appointment a finger lifted last (by its id): it shows its handles. */
    touchSelected: string;
    /** The size of the bar's buttons as on a phone, as the design language says (`phone-bar-size`). */
    phoneBarSize: 'sm' | 'md' | 'lg';
  };
  /** The appointment being moved or resized, where it would go: in a signal, so the appointment in it stays the object it is. */
  draft: { value: Draft<T> | null };
  store: AppointmentStore<T>;
  editor: AppointmentEditor<T>;
  drag: AppointmentDrag<T>;
  events: EditorEvents<T>;
  more: { value: MoreListState<T> };
  morePopup: Popup | null;
  /** What the "+N more" popup shows now, what its template is given, and what a choice in it does. */
  moreContent: ComponentBase | null;
  moreContext: MoreListContext<T> | null;
  moreChoose: ((item: T, event: MouseEvent) => void) | null;
  picker: Calendar | null;
  title: Button | null;
  scroller: HTMLElement | null;
  timeline: TimelineScroll | null;
  /** The agenda's focused row, by its piece's id; `drawn` draws the agenda again after it moved. */
  agendaFocus: { id: string; drawn: () => void };
  /** The parts drawn by hand by name: the bar, the content (the view in it), the view shown, the swipe's edge, the spoken text. */
  bar: Toolbar | null;
  content: ComponentBase | null;
  viewNow: (ComponentBase & { draw(): void }) | null;
  /** The kind of view shown, and the root's parts drawn by hand. */
  viewKind: string;
  root: RootParts | null;
  swipeEdge: ComponentBase | null;
  live: ComponentBase | null;
  /** The filter last given to the data source, and what the content was last told for. */
  lastFilter: string;
  lastContent: string;
  /** The view whose hours were scrolled to last, so a new date does not scroll again. */
  scrolledFor: string;
  /** A click is selecting cells. */
  selecting: boolean;
  /** Focus goes to the cell once the next view is on the page. */
  focusWhenShown: boolean;
  baseFilter: data.DataSource<T, unknown>['filter'];
  source: data.DataSource<T, unknown> | null;
  stopSource: (() => void) | null;
  stopKeys: (() => void)[];
  lastSelection: string;
  /** The selection is told once the moves of this turn are done. */
  selectionQueued: boolean;
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
  presentationChanging: Emitter<SchedulerPresentationChangingEventArgs<T>>;
  presentationChanged: Emitter<SchedulerPresentationChangedEventArgs<T>>;
  timeZoomChanging: Emitter<TimeZoomChangingEventArgs<T>>;
  timeZoomChanged: Emitter<TimeZoomChangedEventArgs<T>>;
  icalendarExporting: Emitter<ICalendarExportingEventArgs<T>>;
  icalendarExported: Emitter<ICalendarExportedEventArgs<T>>;
  icalendarImporting: Emitter<ICalendarImportingEventArgs<T>>;
  icalendarImported: Emitter<ICalendarImportedEventArgs<T>>;
  printing: Emitter<PrintingEventArgs<T>>;
  printed: Emitter<PrintedEventArgs<T>>;
  touch: SchedulerTouch;
  icalendar: ICalendarBridge<T>;
  /** The scheduler's width, as measured last. */
  width: number;
  sizeWatch: ResizeWatch | null;
  /** The view it had before a presentation changed it, and the one it changed to. */
  viewBefore: string | null;
  viewSet: string | null;
  /** The cell a finger pressed was the one selected already: letting it go opens the form. */
  tapAgain: boolean;
}

/**
 * A full-featured calendar for appointments across days and hours, with day, week, work week and
 * month views. Appointments come from an array or a `DataSource`, and `fields` maps the names it
 * reads. The array and the appointments can be plain or reactive: they are read as they are, the
 * objects returned are the ones provided, and a change made in place appears after `refresh()`. Its
 * own edits and the data source's changes appear immediately. It moves by day, week or month (today,
 * previous, next, or a date selected from a calendar), selects cells with the pointer and the keyboard,
 * places appointments at the same time side by side, shows all-day and multi-day ones as bars, and
 * shows what does not fit a month day as "+N more". Resources color the appointments and split the
 * columns into groups (nested, or under each date). Blocked times, work hours per resource and an
 * overlap rule control where an appointment can go. Every setting is a value or a tracked function,
 * and a view's own settings take precedence over the scheduler's.
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
      [own.onPresentationChanging, parts.presentationChanging as Emitter<never>],
      [own.onPresentationChanged, parts.presentationChanged as Emitter<never>],
      [own.onTimeZoomChanging, parts.timeZoomChanging as Emitter<never>],
      [own.onTimeZoomChanged, parts.timeZoomChanged as Emitter<never>],
      [own.onICalendarExporting, parts.icalendarExporting as Emitter<never>],
      [own.onICalendarExported, parts.icalendarExported as Emitter<never>],
      [own.onICalendarImporting, parts.icalendarImporting as Emitter<never>],
      [own.onICalendarImported, parts.icalendarImported as Emitter<never>],
      [own.onPrinting, parts.printing as Emitter<never>],
      [own.onPrinted, parts.printed as Emitter<never>],
    ];
    for (const [handler, emitter] of on) if (handler) emitter.event(handler);
    this.motif.setDisposable(() => {
      parts.model.dispose();
      parts.drag.dispose();
      parts.editor.dispose();
      parts.stopSource?.();
      parts.sizeWatch?.disconnect();
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
  get views(): readonly (SchedulerViewType | SchedulerView<T>)[] {
    return this.getProperty<readonly (SchedulerViewType | SchedulerView<T>)[] | undefined>('views') ?? DEFAULT_VIEWS;
  }
  set views(value: Bind<readonly (SchedulerViewType | SchedulerView<T>)[]>) {
    this.assignProperty('views', value);
  }
  /** The current view, by name. */
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
  /** The number of days the agenda shows. */
  get agendaDuration(): number {
    return Math.max(1, Math.round(this.getProperty<number | undefined>('agendaDuration') ?? 7));
  }
  set agendaDuration(value: Bind<number>) {
    this.assignProperty('agendaDuration', value, Number);
  }
  /** Whether a view renders every cell and row, or only the visible ones. */
  get scrolling(): ScrollingMode {
    return this.getProperty<ScrollingMode | undefined>('scrolling') ?? 'auto';
  }
  set scrolling(value: Bind<ScrollingMode>) {
    this.assignProperty('scrolling', value);
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
    return this.getProperty<string | undefined>('locale') || uiLocale.locale;
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  /** The time zone for days and hours, as an IANA name. `null` uses the browser time zone. */
  get timeZone(): string | null {
    return this.getProperty<string | null | undefined>('timeZone') || null;
  }
  set timeZone(value: Bind<string | null>) {
    this.assignProperty('timeZone', value);
  }
  /** What changing or deleting an occurrence applies to. `'ask'` prompts the user. */
  get seriesEdit(): SeriesEditMode {
    return this.getProperty<SeriesEditMode | undefined>('seriesEdit') ?? 'ask';
  }
  set seriesEdit(value: Bind<SeriesEditMode>) {
    this.assignProperty('seriesEdit', value);
  }
  /** Shows the indicators of an occurrence and of an individually edited one. The default is `true`. */
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
  get appointmentTooltipTemplate(): ((context: TooltipTemplateContext<T>) => ComponentBase) | null {
    return this.getProperty<((context: TooltipTemplateContext<T>) => ComponentBase) | null | undefined>('appointmentTooltipTemplate') ?? null;
  }
  set appointmentTooltipTemplate(value: Bind<((context: TooltipTemplateContext<T>) => ComponentBase) | null>) {
    this.bindOwn('appointmentTooltipTemplate', value);
  }
  get dataCellTemplate(): ((context: CellTemplateContext) => ComponentBase) | null {
    return this.getProperty<((context: CellTemplateContext) => ComponentBase) | null | undefined>('dataCellTemplate') ?? null;
  }
  set dataCellTemplate(value: Bind<((context: CellTemplateContext) => ComponentBase) | null>) {
    this.bindOwn('dataCellTemplate', value);
  }
  get dateCellTemplate(): ((context: DateTemplateContext) => ComponentBase) | null {
    return this.getProperty<((context: DateTemplateContext) => ComponentBase) | null | undefined>('dateCellTemplate') ?? null;
  }
  set dateCellTemplate(value: Bind<((context: DateTemplateContext) => ComponentBase) | null>) {
    this.bindOwn('dateCellTemplate', value);
  }
  get timeCellTemplate(): ((context: TimeTemplateContext) => ComponentBase) | null {
    return this.getProperty<((context: TimeTemplateContext) => ComponentBase) | null | undefined>('timeCellTemplate') ?? null;
  }
  set timeCellTemplate(value: Bind<((context: TimeTemplateContext) => ComponentBase) | null>) {
    this.bindOwn('timeCellTemplate', value);
  }
  get agendaRowTemplate(): ((context: AgendaRowContext<T>) => ComponentBase) | null {
    return this.getProperty<((context: AgendaRowContext<T>) => ComponentBase) | null | undefined>('agendaRowTemplate') ?? null;
  }
  set agendaRowTemplate(value: Bind<((context: AgendaRowContext<T>) => ComponentBase) | null>) {
    this.bindOwn('agendaRowTemplate', value);
  }
  get moreListTemplate(): ((context: MoreListContext<T>) => ComponentBase) | null {
    return this.getProperty<((context: MoreListContext<T>) => ComponentBase) | null | undefined>('moreListTemplate') ?? null;
  }
  set moreListTemplate(value: Bind<((context: MoreListContext<T>) => ComponentBase) | null>) {
    this.bindOwn('moreListTemplate', value);
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
  /** Times when nothing can be scheduled. */
  get blockedTimes(): readonly SchedulerBlockedTime[] {
    return this.getProperty<readonly SchedulerBlockedTime[] | undefined>('blockedTimes') ?? [];
  }
  set blockedTimes(value: Bind<readonly SchedulerBlockedTime[]>) {
    this.assignProperty('blockedTimes', value);
  }
  /**
   * Whether the user can make an appointment overlap another one in its group, or a function that
   * decides whether a time is free. The default is `true`.
   */
  get allowOverlap(): boolean | ((check: SchedulerTimeCheck<T>) => boolean) {
    return this.getProperty<boolean | ((check: SchedulerTimeCheck<T>) => boolean) | undefined>('allowOverlap') ?? true;
  }
  set allowOverlap(value: Bind<boolean | ((check: SchedulerTimeCheck<T>) => boolean)>) {
    this.bindOwn('allowOverlap', value);
  }
  /** Whether the user can place an appointment outside the work hours. The default is `true`. */
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
  /** What the user can change. `false` makes the scheduler read-only, and `true` allows everything. */
  get editing(): SchedulerEditing<T> {
    const value = this.getProperty<boolean | Partial<SchedulerEditing<T>> | undefined>('editing');
    if (value === false) return Object.fromEntries(Object.keys(DEFAULT_EDITING).map((k) => [k, k === 'confirmDelete'])) as unknown as SchedulerEditing<T>;
    return { ...DEFAULT_EDITING, ...(typeof value === 'object' && value ? value : {}) } as SchedulerEditing<T>;
  }
  set editing(value: Bind<boolean | Partial<SchedulerEditing<T>>>) {
    this.assignProperty('editing', value);
  }
  /** The step used by dragging and the keyboard, in minutes. The default is the view's cell duration. */
  get snapMinutes(): number {
    return Math.max(1, this.getProperty<number | undefined>('snapMinutes') ?? this.resolveView().cellDuration);
  }
  set snapMinutes(value: Bind<number>) {
    this.assignProperty('snapMinutes', value, Number);
  }
  /** The minimum duration when resizing, in minutes. The default is `snapMinutes`. */
  get minDuration(): number {
    return Math.max(1, this.getProperty<number | undefined>('minDuration') ?? this.snapMinutes);
  }
  set minDuration(value: Bind<number>) {
    this.assignProperty('minDuration', value, Number);
  }
  /** Clicking an appointment shows its tooltip. The default is `true`. */
  get tooltip(): boolean {
    return this.getProperty<boolean | undefined>('tooltip') ?? true;
  }
  set tooltip(value: Bind<boolean>) {
    this.assignProperty('tooltip', value, Boolean);
  }

  /** The presentation: based on its own width (`'auto'`), or always desktop, tablet or phone. */
  get presentation(): SchedulerPresentation {
    return this.getProperty<SchedulerPresentation | undefined>('presentation') ?? 'auto';
  }
  set presentation(value: Bind<SchedulerPresentation>) {
    this.assignProperty('presentation', value);
  }
  get tabletWidth(): number {
    return this.getProperty<number | undefined>('tabletWidth') ?? 1024;
  }
  set tabletWidth(value: Bind<number>) {
    this.assignProperty('tabletWidth', value, Number);
  }
  get phoneWidth(): number {
    return this.getProperty<number | undefined>('phoneWidth') ?? 560;
  }
  set phoneWidth(value: Bind<number>) {
    this.assignProperty('phoneWidth', value, Number);
  }
  /**
   * When `'auto'` uses the tablet presentation: below `tabletWidth` on a touch screen, or regardless
   * of the pointer type.
   */
  get tabletWhen(): SchedulerTabletWhen {
    return this.getProperty<SchedulerTabletWhen | undefined>('tabletWhen') ?? 'touch';
  }
  set tabletWhen(value: Bind<SchedulerTabletWhen>) {
    this.assignProperty('tabletWhen', value);
  }
  /** The view shown in the phone presentation, by name or type, or else a day view. `null` keeps the current view. */
  get phoneView(): string | null {
    const value = this.getProperty<string | null | undefined>('phoneView');
    return value === undefined ? 'agenda' : value || null;
  }
  set phoneView(value: Bind<string | null>) {
    this.assignProperty('phoneView', value);
  }
  /** The view shown in the tablet presentation, by name or type. `null` keeps the current view. */
  get tabletView(): string | null {
    return this.getProperty<string | null | undefined>('tabletView') || null;
  }
  set tabletView(value: Bind<string | null>) {
    this.assignProperty('tabletView', value);
  }
  get swipeNavigation(): boolean {
    return this.getProperty<boolean | undefined>('swipeNavigation') ?? true;
  }
  set swipeNavigation(value: Bind<boolean>) {
    this.assignProperty('swipeNavigation', value, Boolean);
  }
  get pinchZoom(): boolean {
    return this.getProperty<boolean | undefined>('pinchZoom') ?? true;
  }
  set pinchZoom(value: Bind<boolean>) {
    this.assignProperty('pinchZoom', value, Boolean);
  }
  /** The zoom level of the time scale, from 0.5 to 4. */
  get timeZoom(): number {
    const value = Number(this.getProperty<number | undefined>('timeZoom') ?? 1);
    return Number.isFinite(value) ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value)) : 1;
  }
  set timeZoom(value: Bind<number>) {
    this.assignProperty('timeZoom', value, Number);
  }

  // State.

  /** The current presentation: `presentation`, or based on its width when that is `'auto'`. Reactive. */
  get currentPresentation(): SchedulerPresentationKind {
    return this.parts.version.presentation;
  }
  /** The displayed days, not including `end`. Reactive. */
  get visibleRange(): SchedulerRange {
    return this.parts.model.range();
  }
  /** The current view with every setting calculated. Reactive. */
  get resolvedView(): ResolvedView {
    return this.resolveView();
  }
  /** The selected cells as one time range, or `null`. Reactive. */
  get selectedCells(): SchedulerCell | null {
    return this.parts.model.selection();
  }
  /** The appointments in the displayed days, in time order. Reactive. */
  get shownAppointments(): readonly T[] {
    return this.parts.model.shown();
  }
  /** Whether the data source is loading. Reactive. */
  get loading(): boolean {
    return this.dataSource?.status === 'loading';
  }

  /** The data source's status: the content shows loading or a failure. */
  private setStatus(status: string): void {
    const version = this.parts.version;
    if (version.status === status) return;
    version.status = status as typeof version.status;
    this.drawStates();
  }

  /** The appointment a finger selected ('' for none): its box shows its handles. */
  private setTouchSelected(id: string): void {
    const version = this.parts.version;
    if (version.touchSelected === id) return;
    version.touchSelected = id;
    this.drawAgain();
  }

  /** A swipe between dates: the content follows the finger and the edge shows what comes. */
  private drawSwipe(x: number | null, next: boolean, ready: boolean): void {
    const parts = this.parts;
    Object.assign(parts.version.swipe, { active: x !== null, x: x ?? 0, next, ready });
    const content = parts.content?.element as HTMLElement | undefined;
    if (content) {
      content.toggleAttribute('data-swiping', x !== null);
      if (x === null) content.style.removeProperty('--_swipe');
      else content.style.setProperty('--_swipe', `${x}px`);
    }
    this.drawSwipeEdge();
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
  get onPresentationChanging(): MotifEvent<SchedulerPresentationChangingEventArgs<T>> {
    return this.parts.presentationChanging.event;
  }
  get onPresentationChanged(): MotifEvent<SchedulerPresentationChangedEventArgs<T>> {
    return this.parts.presentationChanged.event;
  }
  get onTimeZoomChanging(): MotifEvent<TimeZoomChangingEventArgs<T>> {
    return this.parts.timeZoomChanging.event;
  }
  get onTimeZoomChanged(): MotifEvent<TimeZoomChangedEventArgs<T>> {
    return this.parts.timeZoomChanged.event;
  }
  get onICalendarExporting(): MotifEvent<ICalendarExportingEventArgs<T>> {
    return this.parts.icalendarExporting.event;
  }
  get onICalendarExported(): MotifEvent<ICalendarExportedEventArgs<T>> {
    return this.parts.icalendarExported.event;
  }
  get onICalendarImporting(): MotifEvent<ICalendarImportingEventArgs<T>> {
    return this.parts.icalendarImporting.event;
  }
  get onICalendarImported(): MotifEvent<ICalendarImportedEventArgs<T>> {
    return this.parts.icalendarImported.event;
  }
  get onPrinting(): MotifEvent<PrintingEventArgs<T>> {
    return this.parts.printing.event;
  }
  get onPrinted(): MotifEvent<PrintedEventArgs<T>> {
    return this.parts.printed.event;
  }

  // Methods.

  /** Shows today. */
  goToday(): boolean {
    return this.changeDate(this.today(), false);
  }
  /** Moves forward one step: a day, a week or a month, multiplied by the view's interval. */
  next(): boolean {
    return this.changeDate(stepDate(this.resolveView(), this.currentDate, 1), false);
  }
  previous(): boolean {
    return this.changeDate(stepDate(this.resolveView(), this.currentDate, -1), false);
  }
  /** Shows the days that contain `date`. */
  showDate(date: Date): boolean {
    return this.changeDate(date, false);
  }
  /** Shows another view, by name. */
  showView(name: string): boolean {
    return this.changeView(name, false);
  }
  /**
   * Scrolls to a time of day: down the day columns, or along a timeline (on the displayed date,
   * otherwise the first day).
   */
  scrollToTime(hour: number, minute = 0): void {
    const scroller = this.parts.scroller;
    const view = this.resolveView();
    const kind = viewKind(view.type);
    if (!scroller || kind === 'month' || kind === 'agenda') return;
    if (kind === 'timeline') {
      const model = this.parts.model;
      const days = model.state.days;
      const shown = days.findIndex((d) => sameDay(d.local, this.currentDate));
      this.parts.timeline?.scrollTo(this.tickAt(Math.max(0, shown), hour * 60 + minute), null);
      return;
    }
    const body = scroller.firstElementChild as HTMLElement | null;
    const span = (view.endDayHour - view.startDayHour) * 60;
    if (!body || !(span > 0)) return;
    const at = (hour * 60 + minute - view.startDayHour * 60) / span;
    scroller.scrollTop = Math.max(0, at * body.offsetHeight);
  }
  /**
   * Scrolls a time into view: its hour and column in the day views, or its cell and the row of
   * `resources` (the group's values) in a timeline. A time that is not displayed has no effect.
   */
  scrollTo(date: Date, resources: Record<string, unknown> | null = null): void {
    const model = this.parts.model;
    const kind = model.kind;
    const place = this.placeOf(date, dayCells(model.view.type), resources);
    if (!place) return;
    if (kind === 'timeline') {
      const column = model.state.columns[place.column];
      const row = model.state.rows.find((r) => r.group === column?.group)?.index ?? 0;
      const minutes = (model.zone.wall(date) - (column?.day.wall ?? 0)) / 60_000;
      this.parts.timeline?.scrollTo(this.tickAt(column?.day.index ?? 0, minutes), row);
      return;
    }
    if (kind === 'time') {
      const time = model.zone.wall(date) - (model.state.columns[place.column]?.day.wall ?? 0);
      this.scrollToTime(Math.floor(time / 3_600_000), Math.floor((time % 3_600_000) / 60_000));
      this.revealColumn(place.column);
    }
  }
  /** The appointments with any part between `start` and `end`. */
  appointmentsIn(start: Date, end: Date): T[] {
    return this.parts.model.appointmentsIn(start, end);
  }
  /** Returns the appointment with this key (the `key` field), among those loaded. */
  findAppointment(key: unknown): T | undefined {
    const field = this.fields.key;
    return givenList(this.items()).find((item) => givenField(item, field) === key);
  }

  /**
   * Re-reads the appointments and the resources, so that changes made in place appear. The scheduler
   * reads the data as it is, plain or reactive, so a change made outside it (not through its methods,
   * its form or its data source) appears after this call.
   */
  refresh(): void {
    this.parts.resources.refresh();
    this.parts.model.refresh();
  }
  /** Re-reads one appointment after it has been changed in place. For an occurrence, this means its series. */
  refreshAppointment(appointment: T): void {
    this.parts.model.refresh(appointment);
  }
  /** Re-reads the resources after their items have been changed in place. */
  refreshResources(): void {
    this.parts.resources.refresh();
  }
  /** What the resource kinds' fields given as functions read now. */
  private resourceFieldValues(): unknown[] {
    const values: unknown[] = [];
    for (const def of givenList(this.resources)) {
      for (const key of ['label', 'items', 'allowMultiple', 'useColorAsDefault'] as const) {
        const value = givenValue<unknown>(def, key);
        if (typeof value === 'function') values.push((value as () => unknown)());
      }
    }
    return values;
  }

  /** Selects the cells from `start` to `end` in the displayed days, or clears the selection with `null`. */
  selectCells(cell: SchedulerCell | null): boolean {
    const model = this.parts.model;
    // A date or a view asked for just before is calculated first: the cells are found in the days shown then.
    model.flush();
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

  /** Adds an appointment to its source (the array or the data source), raising `onAppointmentAdding` first. */
  addAppointment(values: Partial<T>): Promise<T | null> {
    return this.parts.editor.add(values);
  }
  /**
   * Changes an appointment's fields, raising `onAppointmentUpdating` first. For an occurrence of a
   * series, `scope` sets what the change applies to. The default comes from `seriesEdit`, otherwise
   * it is the occurrence.
   */
  updateAppointment(appointment: T, changes: Partial<T>, scope: SeriesScope | null = null): Promise<boolean> {
    return this.parts.editor.update(appointment, changes, false, scope);
  }
  /**
   * Deletes an appointment without confirmation, raising `onAppointmentDeleting` first. `scope` is
   * the same as in `updateAppointment`.
   */
  deleteAppointment(appointment: T, scope: SeriesScope | null = null): Promise<boolean> {
    return this.parts.editor.remove(appointment, false, scope);
  }
  /** Returns the series of an occurrence or an individually edited one, the series itself, or otherwise `null`. */
  seriesOf(appointment: T): T | null {
    return this.parts.model.seriesOf(appointment);
  }
  /** Indicates whether an appointment is an occurrence generated from the rule of a series. */
  isOccurrence(appointment: T): boolean {
    return !!this.parts.model.occurrenceOf(appointment);
  }
  /** Indicates whether an appointment is an individually edited occurrence, linked to its series by `recurrenceId`. */
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
  /** Describes in plain words how a series, or the series of an occurrence, recurs. Empty for a single appointment. */
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
  /**
   * Asks the user what a change or a delete of an occurrence applies to. Resolves to `null` if the
   * prompt is canceled.
   */
  askSeries(appointment: T, action: SeriesAction = 'update'): Promise<SeriesScope | null> {
    return this.parts.editor.askSeries(appointment, action);
  }
  /** Opens the form for an appointment, or for a new one at `cell` (the selection by default). */
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
   * Indicates whether an appointment can be at a time, and what conflicts: the appointments it would
   * overlap in its groups, the blocked times, and whether it is outside the work hours. `resources`
   * holds the values its resource fields would have there.
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
  /** Returns an appointment's resource items by type, in the order of `resources` (only the types it has). */
  resourcesOf(appointment: T): { field: string; label: string; items: { value: unknown; text: string; color: string; item: unknown }[] }[] {
    return this.parts.resources.itemsOf(appointment).map(({ kind, items }) => ({
      field: kind.field,
      label: kind.label,
      items: items.map(({ value, text, color, item }) => ({ value, text, color, item })),
    }));
  }

  /**
   * Writes the appointments as an iCalendar file (RFC 5545): those of the displayed days, all loaded
   * ones, or those of a range. A series is exported whole with its rule, excluded times and individually
   * edited occurrences, and each zone used is written with its definition. Raises `onICalendarExporting`
   * first, and returns `null` if it is canceled.
   */
  exportICalendar(options: ICalendarExportOptions<T> = {}): string | null {
    const parts = this.parts;
    const asked = options.range;
    const range = asked === 'all' ? null : asked && asked !== 'visible' ? asked : this.visibleRange;
    const appointments = options.appointments ? [...options.appointments] : parts.icalendar.appointmentsIn(range);
    const e: ICalendarExportingEventArgs<T> = { appointments, range, cancel: false, source: this };
    parts.icalendarExporting.fire(e);
    if (e.cancel) return null;
    const text = parts.icalendar.write(e.appointments, options.name ?? (this.text || this.textOf('schedulerLabel')));
    parts.icalendarExported.fire({ text, appointments: e.appointments, source: this });
    return text;
  }

  /**
   * Imports an iCalendar file. Each event is added through the data layer (the array, or the data
   * source's adapter) like any other appointment, with `onAppointmentAdding` first. An event whose UID
   * matches an appointment's key updates that appointment. Raises `onICalendarImporting` first, and
   * returns `null` if it is canceled.
   */
  async importICalendar(text: string): Promise<ICalendarImportResult<T> | null> {
    const parts = this.parts;
    const appointments = parts.icalendar.read(text);
    const e: ICalendarImportingEventArgs<T> = { text, appointments, cancel: false, source: this };
    parts.icalendarImporting.fire(e);
    if (e.cancel) return null;
    const result = await parts.icalendar.save(e.appointments);
    parts.icalendarImported.fire({ ...result, source: this });
    this.say(this.textOf('schedulerImported', { count: result.added.length + result.updated.length }));
    return result;
  }

  /**
   * Prints the scheduler alone: the displayed days, with every row and column rendered, nothing
   * scrolled, colors preserved and the toolbar omitted. Raises `onPrinting` first, and returns `false`
   * if it is canceled. The browser's own print command prints it the same way, with the rest of the page.
   */
  async print(): Promise<boolean> {
    const parts = this.parts;
    const e: PrintingEventArgs<T> = { cancel: false, source: this };
    parts.printing.fire(e);
    if (e.cancel) return false;
    const doc = this.element.ownerDocument;
    const view = doc.defaultView;
    if (!view) return false;
    doc.documentElement.toggleAttribute('data-mx-print-one', true);
    this.element.toggleAttribute('data-print-one', true);
    this.setPrinting(true);
    // Built whole before the page is laid out for paper.
    await new Promise<void>((done) => nextFrame(done, view));
    try {
      view.print();
    } finally {
      this.printDone();
    }
    return true;
  }

  /** Returns the string for `key` from `texts`, otherwise from `uiLocale`, with its values filled in. */
  textOf(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const text = this.texts[key] ?? uiLocale.strings[key];
    return fillText(text, this.locale, values);
  }

  // The rest.

  override onConfigured() {
    this.class.add('mx-scheduler');
    // A group, not a landmark: a page may hold many schedulers.
    this.attr.add({ role: 'group' });
    for (const name of ['text', 'timeZoom'] as const) this.observeProperty(name, () => this.drawRoot());
    for (const name of ['text', 'toolbar', 'views'] as const) this.observeProperty(name, () => this.drawBar());
  }

  /** What the scheduler's own element says: its name, the view's type, how it shows, the zoom. */
  private drawRoot(): void {
    untracked(() => {
      const version = this.parts.version;
      put(this.element, 'aria-label', this.text || this.textOf('schedulerLabel'));
      put(this.element, 'data-view', this.resolveView().type);
      put(this.element, 'data-presentation', version.presentation);
      this.element.toggleAttribute('data-printing', version.printing);
      const zoom = this.timeZoom;
      if (zoom === 1) this.element.style.removeProperty('--_zoom');
      else this.element.style.setProperty('--_zoom', String(zoom));
    });
  }

  /** What the model tells: the bar and the root after a layout, and what follows the content, the selection and the focus. */
  private modelChanged(change: ModelChange): void {
    if (this.isDisposed) return;
    const parts = this.parts;
    if (change === 'layout') {
      this.drawRoot();
      this.drawBar();
      this.drawContent();
      this.filterSource();
      this.watchContent();
      this.scrollOnShow();
    }
    if (change === 'layout' || change === 'focus') {
      this.selectionSoon();
      this.followFocus();
    }
  }

  override onConfig() {
    const parts = this.parts;
    parts.model.start();
    this.makeRoot();
    this.motif.setDisposable(parts.model.onChanged((change) => this.modelChanged(change)));
    for (const [name, step] of Object.entries(MODEL_STEPS)) this.observeProperty(name, () => parts.model.update(step));
    this.observeProperty('resources', () => parts.resources.listChanged());
    // What the parts drawn by hand show of the options and the texts: each draws itself again, nothing follows it.
    for (const name of ['editing', 'recurrenceMarks', 'dimPast'] as const) this.observeProperty(name, () => this.drawAgain());
    // Another locale (its own, or the kit's language): the first day of the week, the formats and the texts.
    this.observeProperty('locale', () => this.languageChanged());
    // A template given or taken away: each part drawn by hand that uses it fills its content again.
    for (const name of ['appointmentTemplate', 'dataCellTemplate', 'dateCellTemplate', 'timeCellTemplate', 'resourceHeaderTemplate'] as const)
      this.observeProperty(name, () => this.drawAgain());
    const language = uiLocale.onChanged(() => this.languageChanged());
    this.motif.setDisposable(() => language.dispose());
    // A resource kind's field given as a function (`useColorAsDefault: () => …`) is the developer's live value: followed
    // here, the kinds are read again when one of them reads otherwise.
    let kindValues: unknown[] | null = null;
    follow(this, 'resourceFields', () => this.resourceFieldValues(), (now) => {
      const before = kindValues;
      kindValues = now;
      if (before && (before.length !== now.length || now.some((value, i) => !Object.is(value, before[i])))) parts.resources.refresh();
    });
    this.motif.setDisposable(every(() => parts.model.setNow(Date.now()), 30_000));
    this.observeProperty('dataSource', () => this.followSource(this.dataSource));
    for (const name of ['dataSource', 'remoteFiltering'] as const) this.observeProperty(name, () => this.filterSource());
    this.observeProperty('keys', () => this.bindKeys(this.keys));
    this.modelChanged('layout');
    for (const name of ['presentation', 'tabletWidth', 'phoneWidth', 'tabletWhen'] as const) this.observeProperty(name, () => this.resolvePresentation());
    this.watchPointer();
    this.watchPrint();
    // Set as one way, it is that way from the start; by its width, once it is measured.
    this.resolvePresentation();
  }

  override onMounted() {
    // The finger's listeners are there before a finger lands: only then can a drag, a swipe or a pinch keep the page still.
    this.motif.setDisposable(this.parts.touch.attach());
    this.watchSize();
    this.readLook();
    this.motif.setDisposable(onLookChanged(() => this.readLook()));
  }

  /**
   * The root's parts, made once (no binding in them): the bar and its buttons, the content with the view and its states,
   * the text read out. What they show is drawn by hand (`drawAll`).
   */
  private makeRoot(): void {
    const parts = this.parts;
    const bar = new Toolbar({});
    bar.element.classList.add('mx-scheduler__bar');
    const content = new Component<HTMLDivElement>('div');
    content.element.className = 'mx-scheduler__content';
    const live = new Component<HTMLDivElement>('div');
    live.element.className = 'mx-scheduler__live mx-sr-only';
    live.element.setAttribute('aria-live', 'polite');
    live.element.setAttribute('role', 'status');
    parts.bar = bar;
    parts.content = content;
    parts.live = live;
    this.controls.add(bar, content, live);
    const button = (className: string, props: ConstructorParameters<typeof Button>[0] = {}) => {
      const b = new Button(props);
      b.element.classList.add(...className.split(' '));
      bar.controls.add(b);
      return b;
    };
    const today = button('mx-scheduler__today');
    today.motif.on('click', () => this.changeDate(this.today(), true));
    const todayIcon = button('mx-scheduler__today-icon', { icon: calendarMark() });
    todayIcon.motif.on('click', () => this.changeDate(this.today(), true));
    // A phone moves by a swipe and the month's calendar, as phone calendars do: no steps there.
    const previous = button('mx-scheduler__step', { icon: chevronStart() });
    previous.motif.on('click', () => this.step(-1, true));
    const next = button('mx-scheduler__step', { icon: chevronEnd() });
    next.motif.on('click', () => this.step(1, true));
    const title = button('mx-scheduler__title', { dropDown: parts.picker });
    parts.title = title;
    const viewMenu = button('mx-scheduler__view-menu', { menu: [] });
    put(viewMenu.element, 'data-overflow', 'never');
    const views = new KeyedParts<SchedulerView & { name: string }, Button>(
      bar,
      (view) => view.name,
      (view) => {
        const b = new Button({ toggle: true });
        b.element.classList.add('mx-scheduler__view-button');
        b.motif.on('click', () => {
          const name = this.viewOfButton.get(b);
          if (name !== undefined) this.changeView(name, true);
        });
        return b;
      },
      () => {},
      () => 5,
    );
    const loading = new Component<HTMLDivElement>('div');
    loading.element.className = 'mx-scheduler__state';
    const spinner = new Spinner({ size: 'sm' });
    loading.controls.add(spinner);
    const failed = new Component<HTMLDivElement>('div');
    failed.element.className = 'mx-scheduler__state';
    put(failed.element, 'data-tone', 'danger');
    failed.element.setAttribute('role', 'alert');
    const failedText = new Component<HTMLSpanElement>('span');
    failed.controls.add(failedText);
    const retry = new Button();
    retry.motif.on('click', () => void this.dataSource?.retry());
    failed.controls.add(retry);
    const edge = new Component<HTMLDivElement>('div');
    edge.element.className = 'mx-scheduler__swipe-edge';
    edge.element.setAttribute('aria-hidden', 'true');
    const icon = new Component<HTMLSpanElement>('span');
    icon.element.className = 'mx-glyph mx-scheduler__swipe-icon';
    edge.controls.add(icon);
    content.controls.add(loading, failed, edge);
    parts.swipeEdge = edge;
    parts.root = { today, todayIcon, previous, next, title, viewMenu, views, loading, spinner, failed, failedText: failedText.element, retry };
    this.drawStates();
    this.drawSwipeEdge();
    this.drawLive();
  }

  /** The view each view button stands for, as last drawn. */
  private readonly viewOfButton = new WeakMap<Button, string>();

  /** All of the root, as the scheduler is now. */
  private drawAll(): void {
    this.drawBar();
    this.drawContent();
    this.drawStates();
    this.drawSwipeEdge();
    this.drawLive();
    this.parts.viewNow?.draw();
  }

  /** The bar: its name, its size, its buttons for the view and the presentation shown. */
  private drawBar(): void {
    const parts = this.parts;
    const root = parts.root;
    const bar = parts.bar;
    if (!root || !bar || this.isDisposed) return;
    untracked(() => {
      const t = (key: keyof UiStrings) => this.textOf(key);
      const version = parts.version;
      const phone = version.presentation === 'phone';
      bar.label = this.text || t('schedulerLabel');
      bar.size = phone ? version.phoneBarSize : version.coarse ? 'lg' : 'sm';
      bar.visible = this.toolbar && !version.printing;
      root.today.text = t('today');
      root.today.visible = !phone;
      root.todayIcon.hint = t('today');
      root.todayIcon.visible = phone;
      root.previous.hint = t('schedulerPrevious');
      root.previous.visible = !phone;
      root.next.hint = t('schedulerNext');
      root.next.visible = !phone;
      root.title.text = phone ? this.phoneTitle() : this.rangeText();
      root.title.hint = phone ? this.rangeText() : '';
      put(root.title.element, 'data-overflow', phone ? 'never' : null);
      const list = this.viewList();
      root.views.show(list);
      for (const view of list) {
        const b = root.views.get(view.name);
        if (!b) continue;
        this.viewOfButton.set(b, view.name);
        b.pressed = this.currentView === view.name;
        b.text = this.viewText(view);
        b.visible = !phone;
      }
      root.viewMenu.text = this.viewText(this.currentViewOf() ?? { type: 'week' });
      root.viewMenu.hint = t('schedulerViews');
      root.viewMenu.menu = this.viewMenu();
      root.viewMenu.visible = phone;
    });
  }

  /** The view shown in the content: recreated only when its kind changes. */
  private drawContent(): void {
    const parts = this.parts;
    const content = parts.content;
    if (!content || this.isDisposed) return;
    untracked(() => {
      const kind = viewKind(this.resolveView().type);
      if (kind === parts.viewKind && parts.viewNow) return;
      parts.viewKind = kind;
      const old = parts.viewNow;
      const host = parts.host;
      const view =
        kind === 'month'
          ? new MonthView<T>({ host })
          : kind === 'timeline'
            ? new TimelineView<T>({ host })
            : kind === 'agenda'
              ? new AgendaView<T>({ host, focus: parts.agendaFocus })
              : new TimeView<T>({ host });
      parts.viewNow = view;
      if (old) content.controls.remove(old);
      content.controls.add(0, view);
    });
  }

  /** Loading, a failure to load: shown over the content. */
  private drawStates(): void {
    const parts = this.parts;
    const root = parts.root;
    if (!root || this.isDisposed) return;
    untracked(() => {
      const t = (key: keyof UiStrings) => this.textOf(key);
      const loading = this.loading;
      if (parts.content) flag(parts.content.element, 'aria-busy', loading);
      shown(root.loading.element, loading);
      root.spinner.label = t('loading');
      shown(root.failed.element, parts.version.status === 'error');
      text(root.failedText, t('loadFailed'));
      root.retry.text = t('retry');
    });
  }

  /** The swipe's edge: shown while a finger swipes between dates, on the side what comes is on. */
  private drawSwipeEdge(): void {
    const edge = this.parts.swipeEdge?.element as HTMLElement | undefined;
    if (!edge) return;
    const swipe = this.parts.version.swipe;
    put(edge, 'data-side', swipe.next ? 'next' : 'previous');
    flag(edge, 'data-ready', swipe.ready);
    shown(edge, swipe.active);
  }

  /** The text read out last. */
  private drawLive(): void {
    const live = this.parts.live?.element as HTMLElement | undefined;
    if (live) text(live, this.parts.version.said);
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

  /** The language or the locale changed: the weeks are laid out again from their first day, and everything drawn again. */
  private languageChanged(): void {
    if (this.isDisposed) return;
    this.parts.model.update('groups');
    this.drawAgain();
  }

  private drawAgain(): void {
    this.drawBar();
    for (const draw of this.parts.drawn) draw();
  }

  private createParts(): Parts<T> {
    const version = {
      status: 'ready',
      monthRoom: Infinity,
      said: '',
      saving: [],
      lines: { lane: 0, gap: 0, min: 0 },
      presentation: 'desktop',
      coarse: coarsePointer(),
      printing: false,
      swipe: { active: false, x: 0, next: true, ready: false },
      touchSelected: '',
      phoneBarSize: 'lg',
    } as Parts<T>['version'];
    const more: Parts<T>['more'] = { value: { date: null, items: [] } };
    const draft: Parts<T>['draft'] = { value: null };
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
      draft: () => draft.value,
      zone,
      resources,
      workHours: () => ({ start: this.workStartHour, end: this.workEndHour }),
      blockedTimes: () => this.blockedTimes,
      allowOverlap: () => this.allowOverlap,
      allowOffHours: () => this.allowOffHours,
      lineMetrics: () => version.lines,
    });
    const parts = {
      model,
      resources,
      format,
      version,
      more,
      draft,
      morePopup: null,
      moreContent: null,
      moreContext: null,
      moreChoose: null,
      picker: null,
      title: null,
      scroller: null,
      timeline: null,
      agendaFocus: { id: '', drawn: () => {} },
      bar: null,
      content: null,
      viewNow: null,
      viewKind: '',
      root: null,
      swipeEdge: null,
      live: null,
      drawn: new Set(),
      lastFilter: '',
      lastContent: '',
      scrolledFor: '',
      selecting: false,
      focusWhenShown: false,
      baseFilter: null,
      source: null,
      stopSource: null,
      stopKeys: [],
      lastSelection: '',
      selectionQueued: false,
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
      presentationChanging: new Emitter(),
      presentationChanged: new Emitter(),
      timeZoomChanging: new Emitter(),
      timeZoomChanged: new Emitter(),
      icalendarExporting: new Emitter(),
      icalendarExported: new Emitter(),
      icalendarImporting: new Emitter(),
      icalendarImported: new Emitter(),
      printing: new Emitter(),
      printed: new Emitter(),
      width: 0,
      sizeWatch: null,
      viewBefore: null,
      viewSet: null,
      tapAgain: false,
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
      changed: (item) => model.refresh(item),
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
      setDraft: (next) => {
        draft.value = next;
        model.update('layout');
        // A finger lifted it: once let go it stays selected, with its handles.
        if (next?.touch) this.setTouchSelected(model.idOf(next.item));
      },
      root: () => this.element,
      scroller: () => parts.scroller,
      rtl: () => this.isRtl(),
      keys: () => this.keys,
      saving: version.saving,
      presentation: () => version.presentation,
      redraw: () => parts.viewNow?.draw(),
    });
    parts.drag = new AppointmentDrag<T>(parts.editor);
    parts.touch = new SchedulerTouch({
      root: () => this.element,
      scroller: () => parts.scroller,
      kind: () => parts.model.kind,
      dragging: () => parts.drag.active,
      swipeNavigation: () => this.swipeNavigation,
      pinchZoom: () => this.pinchZoom,
      rtl: () => this.isRtl(),
      zoom: () => this.timeZoom,
      zoomChanging: (from, to) => {
        const e: TimeZoomChangingEventArgs<T> = { from, to, cancel: false, source: this };
        parts.timeZoomChanging.fire(e);
        return !e.cancel;
      },
      setZoom: (zoom) => this.changeProperty('timeZoom', Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom))),
      zoomChanged: (from, to) => parts.timeZoomChanged.fire({ from, to, source: this }),
      swiping: (x, next, ready) => this.drawSwipe(x, next, ready),
      step: (by) => this.step(by, true),
    });
    parts.icalendar = new ICalendarBridge<T>({
      model,
      store: parts.store,
      editor: parts.editor,
      fields: () => this.fields,
      items: () => this.items(),
      timeZone: () => this.timeZone,
      hasSource: () => !!this.dataSource,
    });
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
      headerTemplate: () => this.templateOf('resourceHeaderTemplate'),
      cellTemplate: () => this.templateOf('dataCellTemplate'),
      dateTemplate: () => this.templateOf('dateCellTemplate'),
      timeTemplate: () => this.templateOf('timeCellTemplate'),
      agendaTemplate: () => this.templateOf('agendaRowTemplate'),
      tooltipTemplate: () => this.templateOf('appointmentTooltipTemplate'),
      moreTemplate: () => this.templateOf('moreListTemplate'),
      allDayLines: () => this.allDayLines,
      rtl: () => this.isRtl(),
      template: () => this.templateOf('appointmentTemplate'),
      recurrenceMarks: () => this.recurrenceMarks,
      recurrenceText: (item) => this.recurrenceText(item),
      zoneOf: (item) => {
        const name = givenField(item, this.fields.startTimeZone);
        return typeof name === 'string' && name !== (this.timeZone ?? '') ? name : '';
      },
      setMonthRoom: (lines) => {
        if (parts.version.monthRoom === lines) return;
        parts.version.monthRoom = lines;
        parts.model.update('layout');
      },
      setLineMetrics: (metrics) => {
        const now = parts.version.lines;
        if (now.lane === metrics.lane && now.gap === metrics.gap && now.min === metrics.min) return;
        parts.version.lines = metrics;
        parts.model.update('layout');
      },
      setTimeline: (timeline) => (parts.timeline = timeline),
      dragging: () => !!parts.draft.value,
      agendaKey: (e) => this.agendaKey(e),
      cellPointerDown: (place, e) => this.cellPointerDown(place, e),
      cellClick: (place, e) => this.clickCell(place, e),
      cellDblClick: (place, e) => this.openCell(place, e),
      appointmentClick: (piece, e) => this.clickAppointment(piece, e),
      appointmentDblClick: (piece, e) => this.openAppointment(piece, e),
      appointmentKey: (piece, e) => this.appointmentKey(piece, e),
      appointmentPointerDown: (piece, mode, e) => {
        // A finger resizes only the appointment it lifted (by its handles, at once); an edge of another one is a long press to move it.
        const touch = e.pointerType === 'touch';
        const item = parts.model.itemOf(piece);
        const selected = touch && parts.version.touchSelected === parts.model.idOf(item);
        if (touch && !selected) this.setTouchSelected('');
        parts.drag.begin(item, touch && !selected ? 'move' : mode, e, piece.group, selected && mode !== 'move');
      },
      touchSelected: (item) => parts.version.touchSelected !== '' && parts.version.touchSelected === parts.model.idOf(item),
      liftedByTouch: () => !!parts.draft.value?.touch,
      keepDrawn: (draw) => {
        parts.drawn.add(draw);
        return () => parts.drawn.delete(draw);
      },
      appointmentBlur: (item, e) => {
        const to = e.relatedTarget;
        const id = `${parts.model.idOf(item)}@`;
        if (to instanceof HTMLElement && (to.dataset.piece ?? '').startsWith(id)) return;
        parts.editor.cancelKeys();
      },
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

  /** The appointments loaded: the data source's rows, else the array. Reactive: follows the prop, not what is in the list. */
  private items(): readonly T[] {
    const source = this.dataSource;
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
        parts.model.refresh();
        this.setStatus(source.status);
      });
      parts.stopSource = () => listening.dispose();
      this.setStatus(source.status);
    });
  }

  /** With remote filtering, the data source is requested the days shown only (and, grouped, for the resources shown). */
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
      const filter = parts.baseFilter ? { and: [parts.baseFilter, span] } : span;
      // Given once for what it is: a load the filter brings lays out again, and would give it again.
      const key = JSON.stringify(filter);
      if (key === parts.lastFilter) return;
      parts.lastFilter = key;
      void source.setFilter(filter);
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
      add(keys.agendaView, byType('agenda'));
    });
  }

  /** One step (a key, `selectCells`) may move the focus more than once: the selection it ends on is told, once. */
  private selectionSoon(): void {
    const parts = this.parts;
    if (parts.selectionQueued) return;
    parts.selectionQueued = true;
    queueMicrotask(() => {
      parts.selectionQueued = false;
      if (!this.isDisposed) this.watchSelection();
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
    const shown = parts.model.shown();
    const range = parts.model.range();
    if (this.loading) return;
    const told = `${parts.model.state.shownVersion}|${range.start.getTime()}|${range.end.getTime()}`;
    if (told === parts.lastContent) return;
    parts.lastContent = told;
    queueMicrotask(() => !this.isDisposed && parts.contentReady.fire({ range, appointments: shown, source: this }));
  }

  /** When a view with hours shows (not on every date), it scrolls to `scrollHour`: the work start, or now on today. */
  private scrollOnShow(): void {
    const view = this.resolveView();
    const hour = this.scrollHour;
    const start = this.workStartHour;
    untracked(() => {
      const parts = this.parts;
      const id = `${view.name}:${hour}`;
      const kind = viewKind(view.type);
      if (kind === 'month' || kind === 'agenda' || parts.scrolledFor === id) return;
      const go = () => {
        if (!parts.scroller || this.isDisposed) return;
        parts.scrolledFor = id;
        const now = new Date();
        const range = parts.model.range();
        const showsToday = now >= range.start && now < range.end;
        const hours = Math.floor((parts.model.zone.wall(now) - parts.model.todayWall()) / 3_600_000);
        const at = hour ?? (showsToday && hours > start ? Math.max(view.startDayHour, hours - 1) : start);
        // The timeline of days goes to today (or the date shown); one of hours to the hour, on today when it is shown.
        if (kind === 'timeline' && dayCells(view.type)) {
          const days = parts.model.state.days;
          const today = days.findIndex((d) => d.today);
          const shown = days.findIndex((d) => sameDay(d.local, this.currentDate));
          parts.timeline?.scrollTo(Math.max(0, (today >= 0 ? today : shown) - 1), null);
        } else if (kind === 'timeline') {
          const days = parts.model.state.days;
          const day = showsToday ? days.findIndex((d) => d.today) : Math.max(0, days.findIndex((d) => sameDay(d.local, this.currentDate)));
          parts.timeline?.scrollTo(this.tickAt(Math.max(0, day), at * 60), null);
        } else this.scrollToTime(at);
      };
      if (parts.scroller) go();
      else later(go);
    });
  }

  /** Shows it as `presentation` says, or by its width; asks `onPresentationChanging` first. */
  private resolvePresentation(): void {
    const parts = this.parts;
    untracked(() => {
      const set = this.presentation;
      const width = parts.width || (this.element.isConnected ? this.element.getBoundingClientRect().width : 0);
      let to: SchedulerPresentationKind;
      if (set !== 'auto') to = set;
      else if (!(width > 0)) return;
      else if (width < this.phoneWidth) to = 'phone';
      // A tablet is a narrow scheduler on a touch screen; with a mouse it stays a desktop (unless `tabletWhen` says width alone).
      else to = width < this.tabletWidth && (this.tabletWhen === 'width' || parts.version.coarse) ? 'tablet' : 'desktop';
      const from = parts.version.presentation;
      if (to === from) return;
      const e: SchedulerPresentationChangingEventArgs<T> = { from, to, width: Math.round(width), cancel: false, source: this };
      parts.presentationChanging.fire(e);
      if (e.cancel) return;
      parts.drag.cancel();
      parts.editor.hideTooltip();
      parts.version.touchSelected = '';
      parts.version.presentation = to;
      parts.model.update('groups');
      this.drawRoot();
      this.drawAll();
      this.showViewOf(to);
      parts.presentationChanged.fire({ from, to, width: e.width, source: this });
    });
  }

  /** The view a presentation shows: back to the one it had before, unless the user chose another; then the presentation's own. */
  private showViewOf(kind: SchedulerPresentationKind): void {
    const parts = this.parts;
    if (parts.viewSet && parts.viewBefore && this.currentView === parts.viewSet) this.changeView(parts.viewBefore, false);
    parts.viewSet = parts.viewBefore = null;
    const name = this.presentationView(kind);
    const before = this.currentView;
    if (!name || name === before) return;
    if (this.changeView(name, false)) {
      parts.viewBefore = before;
      parts.viewSet = name;
    }
  }

  /** The view a presentation asks for, by name or type, among the views; a phone without it shows a day. */
  private presentationView(kind: SchedulerPresentationKind): string | null {
    const asked = kind === 'phone' ? this.phoneView : kind === 'tablet' ? this.tabletView : null;
    if (!asked) return null;
    const list = this.viewList();
    const found = list.find((v) => v.name === asked) ?? list.find((v) => v.type === asked);
    if (found) return found.name;
    return kind === 'phone' ? (list.find((v) => v.type === 'day')?.name ?? null) : null;
  }

  /** The views as the phone's bar lists them, the one shown checked. */
  private viewMenu(): MenuItem[] {
    return this.viewList().map((view) => ({
      text: () => this.viewText(view),
      group: 'view',
      checked: () => this.currentView === view.name,
      click: () => this.changeView(view.name, true),
    }));
  }

  /** A screen that gets or loses its touch (a tablet with a keyboard and a mouse) may show it another way. */
  private watchPointer(): void {
    const media = this.element.ownerDocument.defaultView?.matchMedia?.('(pointer: coarse)');
    if (!media?.addEventListener) return;
    const changed = () => {
      this.parts.version.coarse = media.matches;
      this.drawBar();
      this.resolvePresentation();
    };
    media.addEventListener('change', changed);
    this.motif.setDisposable(() => media.removeEventListener('change', changed));
  }

  private watchSize(): void {
    const parts = this.parts;
    parts.sizeWatch ??= new ResizeWatch(() => {
      const width = this.element.getBoundingClientRect().width;
      if (Math.round(width) === Math.round(parts.width)) return;
      parts.width = width;
      this.resolvePresentation();
    });
    parts.sizeWatch.observe(this.element);
    parts.width = this.element.getBoundingClientRect().width;
    this.resolvePresentation();
  }

  /** What the design language says in values the code reads: the size of the phone's bar. */
  private readLook(): void {
    const view = this.element.ownerDocument.defaultView;
    const size = view?.getComputedStyle(this.element).getPropertyValue('--_scheduler-phone-bar-size').trim();
    const version = this.parts.version;
    const next = size === 'sm' || size === 'md' ? size : 'lg';
    if (version.phoneBarSize === next) return;
    version.phoneBarSize = next;
    this.drawBar();
  }

  /** The browser's print (and `print()`) lays it out whole for paper. */
  private watchPrint(): void {
    const view = this.element.ownerDocument.defaultView;
    if (!view) return;
    const before = () => this.setPrinting(true);
    const after = () => this.printDone();
    view.addEventListener('beforeprint', before);
    view.addEventListener('afterprint', after);
    this.motif.setDisposable(() => {
      view.removeEventListener('beforeprint', before);
      view.removeEventListener('afterprint', after);
    });
  }

  /** On paper a big view is built whole: the view is calculated again for it, and back after. */
  private setPrinting(on: boolean): void {
    const parts = this.parts;
    if (parts.version.printing === on) return;
    parts.version.printing = on;
    parts.model.update('groups');
    this.drawRoot();
    this.drawAll();
  }

  private printDone(): void {
    const parts = this.parts;
    if (!parts.version.printing) return;
    this.setPrinting(false);
    const one = this.element.hasAttribute('data-print-one');
    this.element.removeAttribute('data-print-one');
    if (one) this.element.ownerDocument.documentElement.removeAttribute('data-mx-print-one');
    parts.printed.fire({ source: this });
  }

  private viewList(): (SchedulerView<T> & { name: string })[] {
    return this.views.map((v) => (typeof v === 'string' ? { type: v, name: v } : { ...v, name: v.name ?? v.type }));
  }

  /** The view on screen as it was given. */
  private currentViewOf(): (SchedulerView<T> & { name: string }) | null {
    const list = this.viewList();
    const name = this.currentView;
    return list.find((v) => v.name === name) ?? list[0] ?? null;
  }

  private resolveView(): ResolvedView {
    const view = this.currentViewOf() ?? { type: 'week' as const, name: 'week' };
    const own = <V,>(value: Bind<V> | undefined, fallback: V): V => (value === undefined ? fallback : (read(value) ?? fallback));
    const start = own(view.startDayHour, this.startDayHour);
    const kinds = givenList(this.resources).map((r) => givenField<string>(r, 'field'));
    const groups = own<readonly string[]>(view.groups, this.groups).filter((field, i, list) => kinds.includes(field) && list.indexOf(field) === i);
    const kind = viewKind(view.type);
    const startDate = own<Date | null>(view.startDate, null);
    return {
      name: view.name ?? view.type,
      type: view.type,
      intervalCount: Math.max(1, own(view.intervalCount, 1)),
      startDate: startDate instanceof Date && !Number.isNaN(startDate.getTime()) ? startDate : null,
      startDayHour: start,
      endDayHour: Math.max(start + 1, own(view.endDayHour, this.endDayHour)),
      cellDuration: own(view.cellDuration, this.cellDuration),
      allDayPanel: kind === 'time' && own(view.allDayPanel, this.allDayPanel),
      maxAppointmentsPerCell: own(view.maxAppointmentsPerCell, this.maxAppointmentsPerCell),
      groups,
      // A timeline has a row per group and the agenda a list: neither stands them under the dates.
      groupByDate: groups.length > 0 && (kind === 'time' || kind === 'month') && own(view.groupByDate, this.groupByDate),
      agendaDuration: Math.max(1, Math.round(own(view.agendaDuration, this.agendaDuration))),
      // On paper every row and cell is there.
      scrolling: this.parts.version.printing ? 'standard' : own(view.scrolling, this.scrolling),
    };
  }

  /** A template of the view shown: its own (`null` there turns it off), else the scheduler's. */
  private templateOf<K extends keyof SchedulerTemplates<T>>(name: K): Scheduler<T>[K] | null {
    const own = this.currentViewOf()?.[name] as unknown;
    if (own !== undefined) {
      const value = typeof own === 'function' && own.length > 0 ? own : read(own as Bind<unknown>);
      if (value !== undefined) return (value ?? null) as Scheduler<T>[K] | null;
    }
    return this[name] ?? null;
  }

  private viewText(view: SchedulerView<T>): string {
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

  /** The title as on a phone: the month of the first day shown, with its year when that is not this year (as phone calendars write it). */
  private phoneTitle(): string {
    const parts = this.parts;
    const start = parts.model.range().start;
    const zone = parts.model.zone;
    const sameYear = zone.toLocal(start).getFullYear() === zone.toLocal(new Date(parts.model.state.now)).getFullYear();
    return sameYear ? parts.format.month(start) : parts.format.monthYear(start);
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
    this.drawLive();
    queueMicrotask(() => {
      version.said = text;
      this.drawLive();
    });
  }

  private cellPointerDown(place: CellPlace, e: PointerEvent): void {
    if (e.button !== 0) return;
    const parts = this.parts;
    this.setTouchSelected('');
    if (e.pointerType === 'touch') {
      // A finger selects one cell (moving it scrolls or swipes); a tap on the cell selected already opens the form.
      const model = parts.model;
      const selection = model.selection();
      const cell = model.cellOf(place);
      parts.tapAgain = !!selection && !!cell && selection.start.getTime() === cell.start.getTime() && selection.end.getTime() === cell.end.getTime() && selection.allDay === cell.allDay;
      model.focusCell(place);
      return;
    }
    parts.tapAgain = false;
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

  private fireAppointment(emitter: Emitter<AppointmentClickEventArgs<T>>, piece: AnyPiece<T>, event: MouseEvent | KeyboardEvent): boolean {
    const group = this.parts.model.state.groups[piece.group];
    const e: AppointmentClickEventArgs<T> = {
      appointment: this.parts.model.itemOf(piece),
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

  /** A click on cells (not the end of a swipe): the event; a finger's second tap on the cell opens the form. */
  private clickCell(place: CellPlace, e: MouseEvent): void {
    const parts = this.parts;
    if (parts.touch.justSwiped) return;
    if (!this.fireCell(parts.cellClick, place, e)) return;
    if (!parts.tapAgain) return;
    parts.tapAgain = false;
    this.openCell(place, e);
  }

  /** A click on an appointment (not the end of a drag or a swipe): the event, then its tooltip. */
  private clickAppointment(piece: AnyPiece<T>, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    if (parts.drag.justEnded || parts.touch.justSwiped) return;
    const item = parts.model.itemOf(piece);
    if (parts.version.touchSelected && parts.version.touchSelected !== parts.model.idOf(item)) this.setTouchSelected('');
    const box = e.currentTarget as HTMLElement | null;
    if (!this.fireAppointment(parts.appointmentClick, piece, e)) return;
    if (this.tooltip && box) parts.editor.showTooltip(item, box);
  }

  /** A double click (or Enter) on an appointment: the event, then its form. */
  private openAppointment(piece: AnyPiece<T>, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    if (parts.drag.justEnded || parts.editor.formOpen) return;
    if (this.fireAppointment(parts.appointmentDblClick, piece, e)) void parts.editor.openForm(parts.model.itemOf(piece));
  }

  /** A double click (or Enter) on cells: the event, then the form for a new appointment there (the selection when the cell is in it). */
  private openCell(place: CellPlace, e: MouseEvent | KeyboardEvent): void {
    const parts = this.parts;
    // A finger's double tap is two taps and a double click: one form.
    if (parts.editor.formOpen) return;
    if (!this.fireCell(parts.cellDblClick, place, e) || !parts.editor.canAdd()) return;
    const model = parts.model;
    const selection = model.selection();
    const cell = model.cellOf(place);
    const inside = !!selection && !!cell && cell.allDay === selection.allDay && cell.start >= selection.start && cell.end <= selection.end;
    void parts.editor.openForm(null, inside ? selection : cell);
  }

  /** The keys of a focused appointment: moving and resizing by the keys, Delete, Enter and Space. */
  private appointmentKey(piece: AnyPiece<T>, e: KeyboardEvent): void {
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
    const st = this.parts.model.state;
    const pieces = [
      ...st.timed,
      ...st.allDay.pieces,
      ...st.weeks.flatMap((w) => w.pieces),
      ...st.rows.flatMap((r) => r.pieces),
      ...st.agenda.flatMap((d) => d.items),
    ];
    const ids = pieces.filter((p) => p.id.startsWith(`${id}@`) || p.id.startsWith(`${id}#`)).map((p) => p.id);
    return [...this.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment, .mx-scheduler__agenda-row')].find((el) => ids.includes(el.dataset.piece ?? '')) ?? null;
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
    parts.more.value = { date: day, items };
    const popup = this.morePopup();
    this.drawMorePopup();
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
    const more = parts.more;
    const context: MoreListContext<T> = {
      get date() {
        return more.value.date;
      },
      get appointments() {
        return more.value.items;
      },
      choose: (item, event) => choose(item, event as MouseEvent),
    };
    parts.moreContext = context;
    parts.moreChoose = choose;
    this.controls.add(popup);
    parts.morePopup = popup;
    return popup;
  }

  /**
   * What the "+N more" popup shows: the template's content, recreated each time it opens (it reads the day and the
   * appointments as they are then), else the list, drawn again.
   */
  private drawMorePopup(): void {
    const parts = this.parts;
    const popup = parts.morePopup;
    if (!popup || !parts.moreContext || !parts.moreChoose) return;
    const template = parts.host.moreTemplate();
    if (!template && parts.moreContent instanceof MoreList) {
      parts.moreContent.draw();
      return;
    }
    if (parts.moreContent) popup.controls.remove(parts.moreContent);
    if (template) {
      const own = new Component<HTMLDivElement>('div');
      own.element.className = 'mx-scheduler__more-own';
      own.controls.add(template(parts.moreContext));
      parts.moreContent = own;
    } else {
      parts.moreContent = new MoreList<T>({ host: parts.host, state: parts.more, choose: parts.moreChoose });
    }
    popup.controls.add(parts.moreContent);
  }

  /** Arrows, Home, End, PageUp and PageDown move over the cells (Shift selects); Enter and Space are a double click and a click. */
  private gridKey(e: KeyboardEvent): void {
    const parts = this.parts;
    const model = parts.model;
    if (model.kind === 'timeline') {
      this.lineKey(e);
      return;
    }
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

  /** The agenda's keys: Up and Down (Home, End, PageUp, PageDown) move over its rows; Enter, Space and Delete are a double click, a click and Delete. */
  private agendaKey(e: KeyboardEvent): void {
    const parts = this.parts;
    const rows = parts.model.state.agenda.flatMap((day) => day.items);
    if (!rows.length) return;
    const focus = parts.agendaFocus;
    const at = Math.max(0, rows.findIndex((p) => p.id === focus.id));
    const piece = rows[at];
    let next = at;
    switch (e.key) {
      case 'ArrowDown':
        next = Math.min(rows.length - 1, at + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, at - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = rows.length - 1;
        break;
      case 'PageDown':
        next = Math.min(rows.length - 1, at + this.pageRows());
        break;
      case 'PageUp':
        next = Math.max(0, at - this.pageRows());
        break;
      case 'Enter':
        e.preventDefault();
        this.openAppointment(piece, e);
        return;
      case ' ':
        e.preventDefault();
        this.clickAppointment(piece, e);
        return;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        const item = parts.model.itemOf(piece);
        if (parts.editor.canDelete(item)) void parts.editor.remove(item, true);
        return;
      default:
        return;
    }
    e.preventDefault();
    focus.id = rows[next].id;
    focus.drawn();
    queueMicrotask(() => [...this.element.querySelectorAll<HTMLElement>('.mx-scheduler__agenda-row')].find((el) => el.dataset.piece === focus.id)?.focus());
  }

  /**
   * A timeline's keys: Left and Right move along the time (mirrored right to left; past the first or
   * the last cell the view moves on), Up and Down to the row above or below, Home and End to the
   * row's first and last cell (with Ctrl, of the first and the last row), PageUp and PageDown by a
   * screen of rows; Shift selects. Enter and Space are a double click and a click.
   */
  private lineKey(e: KeyboardEvent): void {
    const parts = this.parts;
    const model = parts.model;
    const st = model.state;
    const focus = st.focus;
    const days = Math.max(1, st.days.length);
    const whole = dayCells(model.view.type);
    const per = whole ? 1 : Math.max(1, st.slots.length);
    const ticks = days * per;
    const rows = Math.max(1, st.rows.length);
    let row = Math.floor(focus.column / days);
    let tick = (focus.column % days) * per + (whole ? 0 : Math.max(0, focus.slot));
    const across = this.isRtl() ? -1 : 1;
    switch (e.key) {
      case 'ArrowLeft':
        tick -= across;
        break;
      case 'ArrowRight':
        tick += across;
        break;
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        row = Math.min(rows - 1, row + 1);
        break;
      case 'Home':
        if (e.ctrlKey) row = 0;
        tick = 0;
        break;
      case 'End':
        if (e.ctrlKey) row = rows - 1;
        tick = ticks - 1;
        break;
      case 'PageUp':
      case 'PageDown':
        row = Math.max(0, Math.min(rows - 1, row + (e.key === 'PageUp' ? -1 : 1) * this.pageRows()));
        break;
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
        if (!st.anchor) return;
        e.preventDefault();
        model.clearSelection();
        return;
      default:
        return;
    }
    e.preventDefault();
    const at = (r: number, t: number) => ({ column: r * days + Math.floor(t / per), slot: whole ? -1 : t % per });
    if (tick < 0 || tick >= ticks) {
      // Past the first or the last cell: the view moves on, the focus to the other end of the same row.
      const by = tick < 0 ? -1 : 1;
      if (!this.step(by, true)) return;
      queueMicrotask(() => {
        // The new view's days and cells.
        const daysNow = Math.max(1, st.days.length);
        const whole = dayCells(model.view.type);
        const perNow = whole ? 1 : Math.max(1, st.slots.length);
        const t = by < 0 ? daysNow * perNow - 1 : 0;
        model.focusCell({ column: row * daysNow + Math.floor(t / perNow), slot: whole ? -1 : t % perNow }, e.shiftKey);
        this.focusCellElement();
      });
      return;
    }
    model.focusCell(at(row, tick), e.shiftKey);
    this.focusCellElement();
  }

  /** The time rows on one screen. */
  private pageRows(): number {
    const scroller = this.parts.scroller;
    const row = scroller?.querySelector<HTMLElement>('.mx-scheduler__cells .mx-scheduler__row, .mx-scheduler__line, .mx-scheduler__agenda-row');
    return scroller && row && row.offsetHeight > 0 ? Math.max(1, Math.floor(scroller.clientHeight / row.offsetHeight) - 1) : 8;
  }

  /** Whether focus is in the view (not in the bar). */
  private focusInView(): boolean {
    const focus = deepActiveElement(this.element);
    return !!focus && !!this.element.querySelector('.mx-scheduler__content')?.contains(focus);
  }

  /** Moves DOM focus to the focused cell (after the view drew it; in a big view it is scrolled into view and built first). */
  private focusCellElement(): void {
    const model = this.parts.model;
    const focus = model.state.focus;
    if (model.virtual) {
      if (model.kind === 'timeline') {
        const column = model.state.columns[focus.column];
        const row = model.state.rows.find((r) => r.group === (column?.group ?? null))?.index ?? 0;
        const per = dayCells(model.view.type) ? 1 : model.state.slots.length;
        this.parts.timeline?.reveal((column?.day.index ?? 0) * per + Math.max(0, focus.slot), row);
      } else this.revealColumn(focus.column);
    }
    let tries = 0;
    const find = () => {
      const now = model.state.focus;
      const cell = this.element.querySelector<HTMLElement>(`[data-cell="${now.column}:${now.slot}"]`);
      if (cell) cell.focus({ preventScroll: !model.virtual ? false : true });
      else if (tries++ < 4) nextFrame(find, this.element.ownerDocument.defaultView);
    };
    queueMicrotask(find);
  }

  /** In a big day view: scrolls a column into view (it is then built). */
  private revealColumn(column: number): void {
    const scroller = this.parts.scroller;
    const model = this.parts.model;
    if (!scroller || model.kind !== 'time') return;
    const cells = scroller.querySelector<HTMLElement>('.mx-scheduler__cells');
    const count = model.state.columns.length;
    if (!cells || !count) return;
    const width = cells.offsetWidth / count;
    const ruler = cells.offsetLeft;
    const left = Math.abs(scroller.scrollLeft);
    const start = column * width;
    const room = scroller.clientWidth - ruler;
    if (start >= left && start + width <= left + room) return;
    const at = Math.max(0, start < left ? start : start + width - room);
    scroller.scrollLeft = this.isRtl() ? -at : at;
  }

  /** A timeline's cell along the time at a time of a day (by the day's index), as a share of cells. */
  private tickAt(day: number, minutes: number): number {
    const model = this.parts.model;
    const view = model.view;
    if (dayCells(view.type)) return day;
    const step = Math.max(5, Math.min(240, Math.round(view.cellDuration)));
    const per = model.state.slots.length;
    const into = Math.max(0, Math.min(per, (minutes - view.startDayHour * 60) / step));
    return day * per + into;
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

/** Whether the screen's pointer is a finger. */
function coarsePointer(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
}
