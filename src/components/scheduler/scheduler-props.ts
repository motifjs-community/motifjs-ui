import type { Bind, ComponentBase } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { AppointmentClickEventArgs } from './appointment-click-event-args';
import type { AppointmentTemplateContext } from './appointment-template-context';
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
import type { SelectionChangedEventArgs } from './selection-changed-event-args';
import type { ViewChangedEventArgs } from './view-changed-event-args';
import type { ViewChangingEventArgs } from './view-changing-event-args';

/** Props of `Scheduler`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface SchedulerProps<T> extends ControlProps {
  /** Names the scheduler for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The appointments, in memory. A reactive array of reactive objects is followed: a change moves the appointment. */
  appointments?: Bind<readonly T[]>;
  /** The appointments from a data source of `@motifx-community/data`, in place of `appointments`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  /** Asks the data source only for the days shown (a filter on the start and end fields). Default `true`. */
  remoteFiltering?: Bind<boolean>;
  /** Which fields of an appointment hold what; see `SchedulerFields` for the defaults. */
  fields?: Bind<Partial<SchedulerFields>>;
  /** The views it offers, by type or with settings of their own. Default: day, week, work week and month. */
  views?: Bind<readonly (SchedulerViewType | SchedulerView)[]>;
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
  /** Appointments in a month cell before "+N more"; `'auto'`: as many as fit. Default `'auto'`. */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
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
  /** Draws an appointment's content in place of the text and the time. */
  appointmentTemplate?: Bind<((context: AppointmentTemplateContext<T>) => ComponentBase) | null>;
  /** Changes the texts it writes; the rest come from `uiLocale`. */
  texts?: Bind<Partial<UiStrings>>;
  keys?: Bind<Partial<SchedulerKeys>>;
  /** Says the date and the view to screen readers when they change. Default `true`. */
  announce?: Bind<boolean>;
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
}
