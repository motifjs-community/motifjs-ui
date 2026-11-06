import type { DateRange } from './date-range';

/** A ready-made range offered in the popup, created when it is selected (so "today" is the current day). */
export interface DateRangePreset {
    text: string;
    range: () => DateRange;
}
