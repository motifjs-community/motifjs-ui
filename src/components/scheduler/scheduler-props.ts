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
import type { SchedulerPresentation } from './scheduler-presentation';
import type { SchedulerTabletWhen } from './scheduler-tablet-when';
import type { SchedulerPresentationChangingEventArgs } from './presentation-changing-event-args';
import type { SchedulerPresentationChangedEventArgs } from './presentation-changed-event-args';
import type { TimeZoomChangingEventArgs } from './time-zoom-changing-event-args';
import type { TimeZoomChangedEventArgs } from './time-zoom-changed-event-args';
import type { ICalendarExportingEventArgs } from './icalendar-exporting-event-args';
import type { ICalendarExportedEventArgs } from './icalendar-exported-event-args';
import type { ICalendarImportingEventArgs } from './icalendar-importing-event-args';
import type { ICalendarImportedEventArgs } from './icalendar-imported-event-args';
import type { PrintingEventArgs } from './printing-event-args';
import type { PrintedEventArgs } from './printed-event-args';

/**
 * Props of `Scheduler`: the shared `ControlProps` and its own. Each one is also a settable property,
 * and setting it updates the scheduler.
 */
export interface SchedulerProps<T> extends ControlProps, SchedulerTemplates<T> {
  /** The accessible name of the scheduler. This is the same property as `text`. */
  label?: Bind<string>;
  /**
   * The in-memory appointments, plain or reactive and read as they are. After changing them in place,
   * call `refresh()`.
   */
  appointments?: Bind<readonly T[]>;
  /**
   * Appointments from a data source of `@motifx-community/data`, used instead of `appointments`. Create
   * it with `loadMode: 'all'`, because a view needs every appointment of its days (`remoteFiltering`
   * requests only those).
   */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  /**
   * Requests only the visible days from the data source, with a filter on the start and end fields.
   * The default is `true`.
   */
  remoteFiltering?: Bind<boolean>;
  /** The appointment fields it reads. See `SchedulerFields` for the defaults. */
  fields?: Bind<Partial<SchedulerFields>>;
  /**
   * The available views, by type or with custom settings and templates. The default is day, week,
   * work week and month.
   */
  views?: Bind<readonly (SchedulerViewType | SchedulerView<T>)[]>;
  /** The current view, by name. The default is the second view (the week). The user can also change it. */
  currentView?: Bind<string>;
  /** The date the view shows. The default is today. The user can also change it. */
  currentDate?: Bind<Date>;
  /** 0 (Sunday) through 6 (Saturday). The default comes from the locale. */
  firstDayOfWeek?: Bind<number | null>;
  /** The work week, and the days shaded separately. The default is Monday to Friday. */
  workDays?: Bind<readonly number[]>;
  /** The work hours, shaded separately from the rest. The default is 9 to 17. */
  workStartHour?: Bind<number>;
  workEndHour?: Bind<number>;
  /** The hours shown in the day columns. The default is 0 to 24. */
  startDayHour?: Bind<number>;
  endDayHour?: Bind<number>;
  /** The duration of a cell, in minutes. The default is 30. */
  cellDuration?: Bind<number>;
  /** Shows the all-day panel above the day columns. The default is `true`. */
  allDayPanel?: Bind<boolean>;
  /** The number of lines the all-day panel shows before "+N more". The default is 3. */
  allDayLines?: Bind<number>;
  /**
   * The number of appointments in a month cell or a timeline row before "+N more". `'auto'` shows as
   * many as fit, and a timeline row grows. The default is `'auto'`.
   */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
  /** The number of days the agenda shows, starting from the displayed date. The default is 7. */
  agendaDuration?: Bind<number>;
  /**
   * Whether a view renders every cell and row (`'standard'`), or only the visible ones and a few on
   * each side (`'virtual'`). The default is `'auto'`, which switches to virtual above about 2,000 cells
   * (many resources in a timeline, or many groups in a day or a week).
   */
  scrolling?: Bind<ScrollingMode>;
  /** The default is `'columns'`. */
  overlapMode?: Bind<OverlapMode>;
  /** Days marked as holidays. */
  isHoliday?: Bind<((date: Date) => boolean) | null>;
  /** Shows a line at the current time. The default is `true`. */
  showCurrentTime?: Bind<boolean>;
  /** Dims appointments that have ended. The default is `false`. */
  dimPast?: Bind<boolean>;
  /**
   * The hour the day columns scroll to when shown. The default is the work start, or the current time
   * later in the day.
   */
  scrollHour?: Bind<number | null>;
  /** Shows the toolbar with today, previous, next, the date and the views. The default is `true`. */
  toolbar?: Bind<boolean>;
  /** The default is the page's language. */
  locale?: Bind<string>;
  /**
   * The time zone for days and hours, as an IANA name (`'Europe/Istanbul'`). The default is `null`, the
   * browser time zone. A series recurs in its appointment's own zone (`fields.startTimeZone`).
   */
  timeZone?: Bind<string | null>;
  /**
   * What changing or deleting an occurrence applies to. `'ask'` (the default) prompts the user, and a
   * programmatic change then applies to the occurrence.
   */
  seriesEdit?: Bind<SeriesEditMode>;
  /**
   * Shows the indicators of an occurrence and of an individually edited one, where the design language
   * draws them. The default is `true`.
   */
  recurrenceMarks?: Bind<boolean>;
  /**
   * The resource types the appointments use (rooms, people). Each one can color the appointments,
   * group the columns (`groups`) and add a picker to the form.
   */
  resources?: Bind<readonly SchedulerResource<any>[]>;
  /**
   * The resource fields the columns are grouped by, outer first (`['roomId', 'ownerIds']`). A view's
   * own `groups` takes precedence.
   */
  groups?: Bind<readonly string[]>;
  /** Places the groups under each date, instead of the dates under each group. The default is `false`. */
  groupByDate?: Bind<boolean>;
  /** Times when nothing can be scheduled, shaded on the visible days, for every resource or for specific ones. */
  blockedTimes?: Bind<readonly SchedulerBlockedTime[]>;
  /**
   * Whether an appointment the user moves, resizes or saves can overlap another one in its group, or
   * any appointment without groups. The default is `true`. A function makes the whole decision,
   * including blocked times and work hours, and returns `true` when the time is free.
   */
  allowOverlap?: Bind<boolean | ((check: SchedulerTimeCheck<T>) => boolean)>;
  /**
   * Whether the user can place an appointment outside the work hours of its resources, or of the
   * scheduler. The default is `true`.
   */
  allowOffHours?: Bind<boolean>;
  /** Strings that override `uiLocale`. */
  texts?: Bind<Partial<UiStrings>>;
  keys?: Bind<Partial<SchedulerKeys>>;
  /** Announces a new date or view to screen readers. The default is `true`. */
  announce?: Bind<boolean>;
  /**
   * What the user can change: `false` for nothing, `true` (the default) for everything, or each switch
   * of `SchedulerEditing`. An appointment's own `allowDrag`, `allowResize`, `allowEdit` and
   * `allowDelete` take precedence.
   */
  editing?: Bind<boolean | Partial<SchedulerEditing<T>>>;
  /** The step used by dragging and the keyboard, in minutes. The default is the view's cell duration. */
  snapMinutes?: Bind<number>;
  /** The minimum duration when resizing, in minutes. The default is `snapMinutes`. */
  minDuration?: Bind<number>;
  /** Clicking an appointment shows its tooltip (text, time, Edit, Delete). The default is `true`. */
  tooltip?: Bind<boolean>;
  /**
   * The presentation: `'auto'` is based on its own width (phone below `phoneWidth`, tablet below
   * `tabletWidth`, otherwise desktop), or always the same one. The appointments, views and date do
   * not change.
   */
  presentation?: Bind<SchedulerPresentation>;
  /**
   * Below this width, in pixels of the scheduler, `'auto'` uses the tablet presentation on touch
   * screens (see `tabletWhen`). The default is 1024.
   */
  tabletWidth?: Bind<number>;
  /**
   * Below this width, in pixels of the scheduler, `'auto'` uses the phone presentation regardless of
   * the pointer type. The default is 560.
   */
  phoneWidth?: Bind<number>;
  /**
   * When `'auto'` uses the tablet presentation. With `'touch'`, it applies below `tabletWidth` on a
   * screen whose pointer is a finger. With `'width'`, it applies below `tabletWidth` regardless of the
   * pointer type. The default is `'touch'`.
   */
  tabletWhen?: Bind<SchedulerTabletWhen>;
  /**
   * The view (by name or type) shown in the phone presentation, or a day view if the views do not
   * include it. `null` keeps the current view. The default is `'agenda'`.
   */
  phoneView?: Bind<string | null>;
  /**
   * The view (by name or type) shown in the tablet presentation, if available. `null` (the default)
   * keeps the current view.
   */
  tabletView?: Bind<string | null>;
  /** Swiping sideways over the view moves to the next or previous days. The default is `true`. */
  swipeNavigation?: Bind<boolean>;
  /** Pinching zooms the time scale: the hours of the day views and the cells of a timeline. The default is `true`. */
  pinchZoom?: Bind<boolean>;
  /**
   * The zoom level of the time scale, from 0.5 to 4. At 1, it uses the sizes set by the design
   * language. Pinching changes it. The default is 1.
   */
  timeZoom?: Bind<number>;
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
  onPresentationChanging?: (e: SchedulerPresentationChangingEventArgs<T>) => void;
  onPresentationChanged?: (e: SchedulerPresentationChangedEventArgs<T>) => void;
  onTimeZoomChanging?: (e: TimeZoomChangingEventArgs<T>) => void;
  onTimeZoomChanged?: (e: TimeZoomChangedEventArgs<T>) => void;
  onICalendarExporting?: (e: ICalendarExportingEventArgs<T>) => void;
  onICalendarExported?: (e: ICalendarExportedEventArgs<T>) => void;
  onICalendarImporting?: (e: ICalendarImportingEventArgs<T>) => void;
  onICalendarImported?: (e: ICalendarImportedEventArgs<T>) => void;
  onPrinting?: (e: PrintingEventArgs<T>) => void;
  onPrinted?: (e: PrintedEventArgs<T>) => void;
}
