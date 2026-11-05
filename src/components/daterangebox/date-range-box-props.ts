import type { Bind } from '@motifx/core';
import type { DateKind } from '../../parts/dates/date-kind';
import type { FieldProps } from '../../parts/field/field-props';
import type { DateRange } from './date-range';
import type { DateRangePreset } from './date-range-preset';

/** Props of `DateRangeBox`: the field props (the value a `[start, end]` pair) plus its own. Each one is also a settable property. */
export interface DateRangeBoxProps extends FieldProps<DateRange> {
    /** `'date'` (the default) or `'datetime'`: the time is typed after the date, the calendars keep it. */
    type?: Bind<Exclude<DateKind, 'time'>>;
    min?: Bind<Date | null>;
    max?: Bind<Date | null>;
    disabledDates?: Bind<((date: Date) => boolean) | null>;
    /** The least and the most days a range may span (the end counted from the start). */
    minDays?: Bind<number | null>;
    maxDays?: Bind<number | null>;
    /** Default: the kit's language. It decides the order of the parts and the names of months and days. */
    locale?: Bind<string>;
    /** How the dates are shown while the field is not being edited, e.g. `{ dateStyle: 'medium' }`. */
    displayFormat?: Bind<Intl.DateTimeFormatOptions | null>;
    /** Shown in an empty box: the start's, and the end's. */
    startPlaceholder?: Bind<string>;
    endPlaceholder?: Bind<string>;
    clearButton?: Bind<boolean>;
    showSeconds?: Bind<boolean>;
    firstDayOfWeek?: Bind<number | null>;
    showWeekNumbers?: Bind<boolean>;
    /** The button that opens the calendars. Default `true`. */
    showPickerButton?: Bind<boolean>;
    /** How many months the popup shows side by side. Default `2`. */
    calendars?: Bind<1 | 2>;
    /** Ready-made ranges beside the calendars: `true` for the kit's (today, yesterday, the last 7 and 30 days, this and last month), your own, or none. Default `false`. */
    presets?: Bind<readonly DateRangePreset[] | boolean>;
    /** Closes the popup once both ends are chosen. Default `true`. */
    closeOnComplete?: Bind<boolean>;
}
