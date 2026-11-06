import type { Bind } from '@motifx/core';
import type { DateKind } from '../../parts/dates/date-kind';
import type { FieldProps } from '../../parts/field/field-props';

/** Props of `DateBox`: the field props plus its own. Each prop is also a settable, reactive property. */
export interface DateBoxProps extends FieldProps<Date | null> {
  /** Default `'date'`. */
  type?: Bind<DateKind>;
  min?: Bind<Date | null>;
  max?: Bind<Date | null>;
  disabledDates?: Bind<((date: Date) => boolean) | null>;
  /** Default: the page's language. It decides the order of the parts and the names of months and days. */
  locale?: Bind<string>;
  /** How the value is shown while the field is not being edited, e.g. `{ dateStyle: 'long' }`. */
  displayFormat?: Bind<Intl.DateTimeFormatOptions | null>;
  /** Shown while the field is empty and not focused. */
  placeholder?: Bind<string>;
  clearButton?: Bind<boolean>;
  /** The minutes between the times offered. Default `30`. */
  timeStep?: Bind<number>;
  showSeconds?: Bind<boolean>;
  firstDayOfWeek?: Bind<number | null>;
  showWeekNumbers?: Bind<boolean>;
  showTodayButton?: Bind<boolean>;
  /** The button that opens the calendar or the times. Default `true`. */
  showPickerButton?: Bind<boolean>;
}
