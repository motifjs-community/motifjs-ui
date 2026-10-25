import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import type { CalendarView } from './calendar-view';

/** Props of `Calendar`. Each one is also a settable, reactive property. */
export interface CalendarProps extends ControlProps {
  /** Two-way with `x-model`. */
  value?: Bind<Date | null>;
  min?: Bind<Date | null>;
  max?: Bind<Date | null>;
  /** Days that cannot be chosen, e.g. weekends. */
  disabledDates?: Bind<((date: Date) => boolean) | null>;
  /** 0 Sunday … 6 Saturday; by default the locale's. */
  firstDayOfWeek?: Bind<number | null>;
  /** Default: the page's language. */
  locale?: Bind<string>;
  showWeekNumbers?: Bind<boolean>;
  /** Days of the months before and after. Default `true`. */
  showOtherMonths?: Bind<boolean>;
  showTodayButton?: Bind<boolean>;
  /** The view on screen. Default `'month'`; the user moves between views too. */
  currentView?: Bind<CalendarView>;
  /** The view a choice is made in: `'year'` picks a month, `'decade'` a year. Default `'month'`. */
  minView?: Bind<CalendarView>;
  onValueChanged?: (e: ValueChangedEventArgs<Date | null>) => void;
}
