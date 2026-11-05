import type { DateRange } from './date-range';

/** A ready-made range offered on the popup, made when it is chosen (so "today" is today's). */
export interface DateRangePreset {
    text: string;
    range: () => DateRange;
}
