import type { SchedulerViewType } from '../scheduler-view-type';

/** Dates and times as the scheduler writes them, in its locale (`Intl`); the formatters are made once per locale. */
export class SchedulerFormat {
  private made = '';
  private formats: Record<string, Intl.DateTimeFormat> = {};

  constructor(private readonly locale: () => string) {}

  private get(name: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const locale = this.locale();
    if (locale !== this.made) {
      this.made = locale;
      this.formats = {};
    }
    return (this.formats[name] ??= new Intl.DateTimeFormat(locale, options));
  }

  /** "Mon" */
  weekday(date: Date): string {
    return this.get('weekday', { weekday: 'short' }).format(date);
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

  /** "27 Oct" */
  monthDay(date: Date): string {
    return this.get('monthDay', { day: 'numeric', month: 'short' }).format(date);
  }

  /** "09:00" or "9:00 AM", by the locale. */
  time(date: Date): string {
    return this.get('time', { hour: 'numeric', minute: '2-digit' }).format(date);
  }

  /** "09:00 – 10:30" */
  timeRange(start: Date, end: Date): string {
    const format = this.get('time', { hour: 'numeric', minute: '2-digit' });
    return start.getTime() === end.getTime() ? format.format(start) : format.formatRange(start, end);
  }

  /** "9 AM" or "09", the label of an hour row. */
  hour(date: Date): string {
    return this.get('hour', { hour: 'numeric' }).format(date);
  }

  /** The text over the view: a day, a range of days or a month. `end` is not included. */
  range(type: SchedulerViewType, start: Date, end: Date): string {
    const last = new Date(end.getTime() - 1);
    if (type === 'month') {
      // The days of the months before and after do not count.
      const first = new Date(start.getFullYear(), start.getMonth() + (start.getDate() > 1 ? 1 : 0), 1);
      const lastMonth = new Date(last.getFullYear(), last.getMonth() - (last.getDate() < 28 ? 1 : 0), 1);
      return this.get('month', { month: 'long', year: 'numeric' }).formatRange(first, lastMonth);
    }
    const format = this.get('days', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return start.toDateString() === last.toDateString() ? this.fullDate(start) : format.formatRange(start, last);
  }
}
