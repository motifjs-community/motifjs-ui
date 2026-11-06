import type { Bind } from '@motifx/core';
import type { DateKind } from '../../parts/dates/date-kind';
import type { FieldProps } from '../../parts/field/field-props';

/** Props of `DateBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface DateBoxProps extends FieldProps<Date | null> {
  /** The default is `'date'`. */
  type?: Bind<DateKind>;
  min?: Bind<Date | null>;
  max?: Bind<Date | null>;
  disabledDates?: Bind<((date: Date) => boolean) | null>;
  /** The default is the language of the page. It sets the order of the parts and the month and day names. */
  locale?: Bind<string>;
  /** How the value is displayed while the field is not being edited, such as `{ dateStyle: 'long' }`. */
  displayFormat?: Bind<Intl.DateTimeFormatOptions | null>;
  /** Displayed when the field is empty and has no focus. */
  placeholder?: Bind<string>;
  clearButton?: Bind<boolean>;
  /** The interval between the times offered, in minutes. The default is `30`. */
  timeStep?: Bind<number>;
  showSeconds?: Bind<boolean>;
  firstDayOfWeek?: Bind<number | null>;
  showWeekNumbers?: Bind<boolean>;
  showTodayButton?: Bind<boolean>;
  /** The button that opens the calendar or the list of times. The default is `true`. */
  showPickerButton?: Bind<boolean>;
}
