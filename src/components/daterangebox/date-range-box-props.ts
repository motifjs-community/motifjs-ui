import type { Bind } from '@motifx/core';
import type { DateKind } from '../../parts/dates/date-kind';
import type { FieldProps } from '../../parts/field/field-props';
import type { DateRange } from './date-range';
import type { DateRangePreset } from './date-range-preset';

/**
 * Props of `DateRangeBox`, in addition to the field props (the value is a `[start, end]` pair). Each prop is also a
 * settable property.
 */
export interface DateRangeBoxProps extends FieldProps<DateRange> {
    /** `'date'` (the default) or `'datetime'`, where the time is typed after the date and the calendars preserve it. */
    type?: Bind<Exclude<DateKind, 'time'>>;
    min?: Bind<Date | null>;
    max?: Bind<Date | null>;
    disabledDates?: Bind<((date: Date) => boolean) | null>;
    /** The minimum and maximum length of a range in days, counted from the start. */
    minDays?: Bind<number | null>;
    maxDays?: Bind<number | null>;
    /** The default is the kit language. It sets the order of the parts and the month and day names. */
    locale?: Bind<string>;
    /** How the dates are displayed while the field is not being edited, such as `{ dateStyle: 'medium' }`. */
    displayFormat?: Bind<Intl.DateTimeFormatOptions | null>;
    /** Displayed in an empty box, for the start and for the end. */
    startPlaceholder?: Bind<string>;
    endPlaceholder?: Bind<string>;
    clearButton?: Bind<boolean>;
    showSeconds?: Bind<boolean>;
    firstDayOfWeek?: Bind<number | null>;
    showWeekNumbers?: Bind<boolean>;
    /** The button that opens the calendars. The default is `true`. */
    showPickerButton?: Bind<boolean>;
    /** The number of months side by side in the popup. The default is `2`. */
    calendars?: Bind<1 | 2>;
    /**
     * Ready-made ranges next to the calendars: `true` for the built-in ones (today, yesterday, the last 7 and 30 days,
     * this month and last month), custom presets, or none. The default is `false`.
     */
    presets?: Bind<readonly DateRangePreset[] | boolean>;
    /** Closes the popup once both ends are selected. The default is `true`. */
    closeOnComplete?: Bind<boolean>;
}
