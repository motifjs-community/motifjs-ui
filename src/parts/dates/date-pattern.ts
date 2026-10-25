import type { DatePart } from './date-part';

/** How a locale writes a date with digits: the parts in order, and a mask for typing it. */
export interface DatePattern {
  parts: DatePart[];
  /** `00.00.0000 00:00` */
  mask: string;
}
