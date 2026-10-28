import { TimeZone } from '../../../parts/dates/time-zone';
import type { SchedulerViewType } from '../scheduler-view-type';

/**
 * Dates and times as the scheduler writes them, in its locale and on its clock (`Intl` with its
 * time zone); the formatters are made once per locale and zone.
 */
export class SchedulerFormat {
  private made = '';
  private formats: Record<string, Intl.DateTimeFormat> = {};

  constructor(
    private readonly locale: () => string,
    private readonly zone: () => TimeZone = () => TimeZone.local,
  ) {}

  /** A formatter on the scheduler's clock (`own`: on another zone's; `'UTC'` for a time of no day). */
  private get(name: string, options: Intl.DateTimeFormatOptions, own?: string): Intl.DateTimeFormat {
    const locale = this.locale();
    const zone = own ?? this.zone().name;
    const id = `${locale}|${this.zone().name}`;
    if (id !== this.made) {
      this.made = id;
      this.formats = {};
    }
    return (this.formats[`${name}|${zone}`] ??= new Intl.DateTimeFormat(locale, { ...options, timeZone: zone || undefined }));
  }

  /** "Mon" */
  weekday(date: Date): string {
    return this.get('weekday', { weekday: 'short' }).format(date);
  }

  /** "Monday" */
  weekdayLong(date: Date): string {
    return this.get('weekdayLong', { weekday: 'long' }).format(date);
  }

  /** "27" */
  dayNumber(date: Date): string {
    return this.get('dayNumber', { day: 'numeric' }).format(date);
  }

  /** "Monday, 27 October 2026" */
  fullDate(date: Date): string {
    return this.get('fullDate', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  /** "October 2026" */
  monthYear(date: Date): string {
    return this.get('monthYear', { month: 'long', year: 'numeric' }).format(date);
  }

  /** "27 Oct" */
  monthDay(date: Date): string {
    return this.get('monthDay', { day: 'numeric', month: 'short' }).format(date);
  }

  /** "09:00" or "9:00 AM", by the locale; on another zone's clock with `zone`. */
  time(date: Date, zone?: string): string {
    return this.get('time', { hour: 'numeric', minute: '2-digit' }, zone).format(date);
  }

  /** "09:00 – 10:30" */
  timeRange(start: Date, end: Date, zone?: string): string {
    const format = this.get('time', { hour: 'numeric', minute: '2-digit' }, zone);
    return start.getTime() === end.getTime() ? format.format(start) : format.formatRange(start, end);
  }

  /** "9 AM" or "09", the label of the hour row `minutes` after midnight. */
  hour(minutes: number): string {
    return this.get('hour', { hour: 'numeric' }, 'UTC').format(Date.UTC(2000, 0, 1, 0, minutes));
  }

  /** "GMT+3", the offset of a zone at a moment. */
  offset(zone: string, at: Date): string {
    const part = this.get('offset', { timeZoneName: 'shortOffset' }, zone)
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? zone;
  }

  /** A time zone as a picker lists it: "(GMT+3) Europe/Istanbul". */
  zoneName(zone: string, at: Date): string {
    return `(${this.offset(zone, at)}) ${zone.replace(/_/g, ' ')}`;
  }

  /** The text over the view: a day, a range of days or a month. `end` is not included. */
  range(type: SchedulerViewType, start: Date, end: Date): string {
    const zone = this.zone();
    const first = zone.toLocal(start);
    const last = zone.toLocal(new Date(end.getTime() - 1));
    // Dates of the browser's clock with the scheduler's fields: written as they are.
    const local = TimeZone.localName();
    if (type === 'month') {
      // The days of the months before and after do not count.
      const from = new Date(first.getFullYear(), first.getMonth() + (first.getDate() > 1 ? 1 : 0), 1);
      const to = new Date(last.getFullYear(), last.getMonth() - (last.getDate() < 28 ? 1 : 0), 1);
      return this.get('month', { month: 'long', year: 'numeric' }, local).formatRange(from, to);
    }
    if (first.toDateString() === last.toDateString()) return this.fullDate(start);
    return this.get('days', { day: 'numeric', month: 'short', year: 'numeric' }, local).formatRange(first, last);
  }
}
