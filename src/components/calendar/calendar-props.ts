import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import type { CalendarView } from './calendar-view';

/** Props of `Calendar`. Each prop is also a settable, reactive property. */
export interface CalendarProps extends ControlProps {
  /** The selected date. `x-model` provides two-way binding. */
  value?: Bind<Date | null>;
  min?: Bind<Date | null>;
  max?: Bind<Date | null>;
  /** Days that cannot be selected, such as weekends. */
  disabledDates?: Bind<((date: Date) => boolean) | null>;
  /** 0 (Sunday) through 6 (Saturday). The default comes from the locale. */
  firstDayOfWeek?: Bind<number | null>;
  /** The default is the language of the page. */
  locale?: Bind<string>;
  showWeekNumbers?: Bind<boolean>;
  /** Shows days from the previous and next months. The default is `true`. */
  showOtherMonths?: Bind<boolean>;
  showTodayButton?: Bind<boolean>;
  /** The current view. The default is `'month'`, and the user can also move between views. */
  currentView?: Bind<CalendarView>;
  /** The view a selection is made in: `'year'` selects a month, and `'decade'` selects a year. The default is `'month'`. */
  minView?: Bind<CalendarView>;
  /** A range drawn over the days (its ends and the days between), for a date range box. The value is still one day. */
  rangeStart?: Bind<Date | null>;
  rangeEnd?: Bind<Date | null>;
  onValueChanged?: (e: ValueChangedEventArgs<Date | null>) => void;
  /** Occurs when the pointer moves over a day, or leaves the days (`null`). */
  onDayPointed?: (day: Date | null) => void;
  /** Occurs when the Tab stop moves to another date; its month or year is the one on screen. */
  onFocusedDateChanged?: (date: Date) => void;
}
