import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { AppointmentAddedEventArgs } from './appointment-added-event-args';
import type { AppointmentAddingEventArgs } from './appointment-adding-event-args';
import type { AppointmentDeletedEventArgs } from './appointment-deleted-event-args';
import type { AppointmentDeletingEventArgs } from './appointment-deleting-event-args';
import type { AppointmentUpdatedEventArgs } from './appointment-updated-event-args';
import type { AppointmentUpdatingEventArgs } from './appointment-updating-event-args';
import type { DataErrorEventArgs } from './data-error-event-args';
import type { DragEventArgs } from './drag-event-args';
import type { FormOpeningEventArgs } from './form-opening-event-args';
import type { SchedulerEditing } from './scheduler-editing';
import type { UiStrings } from '../../core/ui-strings';
import type { AppointmentClickEventArgs } from './appointment-click-event-args';
import type { CellClickEventArgs } from './cell-click-event-args';
import type { ContentReadyEventArgs } from './content-ready-event-args';
import type { DateChangedEventArgs } from './date-changed-event-args';
import type { DateChangingEventArgs } from './date-changing-event-args';
import type { OverlapMode } from './model/overlap-mode';
import type { MoreOpeningEventArgs } from './more-opening-event-args';
import type { SchedulerFields } from './scheduler-fields';
import type { SchedulerKeys } from './scheduler-keys';
import type { SchedulerView } from './scheduler-view';
import type { SchedulerViewType } from './scheduler-view-type';
import type { SchedulerBlockedTime } from './scheduler-blocked-time';
import type { SchedulerResource } from './scheduler-resource';
import type { SchedulerTemplates } from './scheduler-templates';
import type { ScrollingMode } from './model/scrolling-mode';
import type { SchedulerTimeCheck } from './scheduler-time-check';
import type { SelectionChangedEventArgs } from './selection-changed-event-args';
import type { SeriesAnsweredEventArgs } from './series-answered-event-args';
import type { SeriesAskingEventArgs } from './series-asking-event-args';
import type { SeriesEditMode } from './series-edit-mode';
import type { ViewChangedEventArgs } from './view-changed-event-args';
import type { ViewChangingEventArgs } from './view-changing-event-args';

/** Props of `Scheduler`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface SchedulerProps<T> extends ControlProps, SchedulerTemplates<T> {
  /** Names the scheduler for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The appointments, in memory. A reactive array of reactive objects is followed: a change moves the appointment. */
  appointments?: Bind<readonly T[]>;
  /**
   * The appointments from a data source of `@motifx-community/data`, in place of `appointments`. Make it
   * with `loadMode: 'all'`: a view needs every appointment of its days (`remoteFiltering` asks for those only).
   */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  /** Asks the data source only for the days shown (a filter on the start and end fields). Default `true`. */
  remoteFiltering?: Bind<boolean>;
  /** Which fields of an appointment hold what; see `SchedulerFields` for the defaults. */
  fields?: Bind<Partial<SchedulerFields>>;
  /** The views it offers, by type or with settings and templates of their own. Default: day, week, work week and month. */
  views?: Bind<readonly (SchedulerViewType | SchedulerView<T>)[]>;
  /** The view on screen, by name. Default: the second view (the week). The user changes it too. */
  currentView?: Bind<string>;
  /** The date the view shows. Default today. The user changes it too. */
  currentDate?: Bind<Date>;
  /** 0 Sunday … 6 Saturday; by default the locale's. */
  firstDayOfWeek?: Bind<number | null>;
  /** Default Monday to Friday. */
  workDays?: Bind<readonly number[]>;
  /** The work hours, shaded apart from the rest. Default 9 to 17. */
  workStartHour?: Bind<number>;
  workEndHour?: Bind<number>;
  /** The hours the day columns show. Default 0 to 24. */
  startDayHour?: Bind<number>;
  endDayHour?: Bind<number>;
  /** Minutes in a cell. Default 30. */
  cellDuration?: Bind<number>;
  /** The all-day panel above the day columns. Default `true`. */
  allDayPanel?: Bind<boolean>;
  /** Lines the all-day panel grows to before "+N more". Default 3. */
  allDayLines?: Bind<number>;
  /** Appointments in a month cell (a timeline row) before "+N more"; `'auto'`: as many as fit (a timeline row grows). Default `'auto'`. */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
  /** The days the agenda shows, from the date shown. Default 7. */
  agendaDuration?: Bind<number>;
  /**
   * Whether a view builds every cell and row (`'standard'`) or only what is in view and a little on
   * each side (`'virtual'`). Default `'auto'`: virtual once its cells are more than a few thousand
   * (many resources in a timeline, many groups in a day or a week).
   */
  scrolling?: Bind<ScrollingMode>;
  /** Default `'columns'`. */
  overlapMode?: Bind<OverlapMode>;
  /** Days marked as holidays. */
  isHoliday?: Bind<((date: Date) => boolean) | null>;
  /** The line at the current time, moving on. Default `true`. */
  showCurrentTime?: Bind<boolean>;
  /** Appointments that have ended look quieter. Default `false`. */
  dimPast?: Bind<boolean>;
  /** The hour the day columns scroll to when they show. Default: the work start, or now when it is later on today. */
  scrollHour?: Bind<number | null>;
  /** The bar with today, previous, next, the date and the views. Default `true`. */
  toolbar?: Bind<boolean>;
  /** Default: the page's language. */
  locale?: Bind<string>;
  /**
   * The clock the days and hours are on: an IANA time zone (`'Europe/Istanbul'`). Default `null`, the
   * browser's. An appointment's own zone (`fields.startTimeZone`) is the one its series repeats in.
   */
  timeZone?: Bind<string | null>;
  /** What changing or deleting an occurrence of a series reaches: `'ask'` (default) asks the user; from code it is the occurrence. */
  seriesEdit?: Bind<SeriesEditMode>;
  /** Occurrences of a series, and ones changed apart from it, carry a mark where the design language draws one. Default `true`. */
  recurrenceMarks?: Bind<boolean>;
  /**
   * The kinds of resources the appointments use (rooms, people): they colour the appointments,
   * group the columns (`groups`) and each gets a picker in the form.
   */
  resources?: Bind<readonly SchedulerResource<any>[]>;
  /** The resource fields the columns are grouped by, outer first (`['roomId', 'ownerIds']`). A view's own win. */
  groups?: Bind<readonly string[]>;
  /** The groups stand under each date, not the dates under each group. Default `false`. */
  groupByDate?: Bind<boolean>;
  /** Times nothing may be put in, shaded on the days shown (for every resource, or the ones named). */
  blockedTimes?: Bind<readonly SchedulerBlockedTime[]>;
  /**
   * Whether an appointment the user moves, resizes or saves may overlap another one of its group
   * (of the scheduler, without groups). Default `true`. A function decides the whole check (blocked
   * times and work hours too): `true` when the time is free for it.
   */
  allowOverlap?: Bind<boolean | ((check: SchedulerTimeCheck<T>) => boolean)>;
  /** Whether the user may put an appointment outside the work hours (of its resources, else the scheduler's). Default `true`. */
  allowOffHours?: Bind<boolean>;
  /** Changes the texts it writes; the rest come from `uiLocale`. */
  texts?: Bind<Partial<UiStrings>>;
  keys?: Bind<Partial<SchedulerKeys>>;
  /** Says the date and the view to screen readers when they change. Default `true`. */
  announce?: Bind<boolean>;
  /** What the user may change: `false` nothing, `true` (default) everything, or each switch of `SchedulerEditing`. An appointment's own `allowDrag`, `allowResize`, `allowEdit`, `allowDelete` win. */
  editing?: Bind<boolean | Partial<SchedulerEditing<T>>>;
  /** The minutes a drag and the keys move by. Default: the view's cell. */
  snapMinutes?: Bind<number>;
  /** The shortest an appointment gets by resizing, in minutes. Default: `snapMinutes`. */
  minDuration?: Bind<number>;
  /** A click on an appointment shows its tooltip (text, time, Edit, Delete). Default `true`. */
  tooltip?: Bind<boolean>;
  onViewChanging?: (e: ViewChangingEventArgs<T>) => void;
  onViewChanged?: (e: ViewChangedEventArgs<T>) => void;
  onDateChanging?: (e: DateChangingEventArgs<T>) => void;
  onDateChanged?: (e: DateChangedEventArgs<T>) => void;
  onCellClick?: (e: CellClickEventArgs<T>) => void;
  onCellDblClick?: (e: CellClickEventArgs<T>) => void;
  onAppointmentClick?: (e: AppointmentClickEventArgs<T>) => void;
  onAppointmentDblClick?: (e: AppointmentClickEventArgs<T>) => void;
  onSelectionChanged?: (e: SelectionChangedEventArgs<T>) => void;
  onContentReady?: (e: ContentReadyEventArgs<T>) => void;
  onMoreOpening?: (e: MoreOpeningEventArgs<T>) => void;
  onAppointmentAdding?: (e: AppointmentAddingEventArgs<T>) => void;
  onAppointmentAdded?: (e: AppointmentAddedEventArgs<T>) => void;
  onAppointmentUpdating?: (e: AppointmentUpdatingEventArgs<T>) => void;
  onAppointmentUpdated?: (e: AppointmentUpdatedEventArgs<T>) => void;
  onAppointmentDeleting?: (e: AppointmentDeletingEventArgs<T>) => void;
  onAppointmentDeleted?: (e: AppointmentDeletedEventArgs<T>) => void;
  onFormOpening?: (e: FormOpeningEventArgs<T>) => void;
  onDataError?: (e: DataErrorEventArgs<T>) => void;
  onMoveStart?: (e: DragEventArgs<T>) => void;
  onMoving?: (e: DragEventArgs<T>) => void;
  onMoveEnd?: (e: DragEventArgs<T>) => void;
  onResizeStart?: (e: DragEventArgs<T>) => void;
  onResizing?: (e: DragEventArgs<T>) => void;
  onResizeEnd?: (e: DragEventArgs<T>) => void;
  onSeriesAsking?: (e: SeriesAskingEventArgs<T>) => void;
  onSeriesAnswered?: (e: SeriesAnsweredEventArgs<T>) => void;
}
