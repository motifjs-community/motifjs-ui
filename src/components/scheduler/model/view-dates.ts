import { addDays } from '../../../parts/dates/add-days';
import { addMonths } from '../../../parts/dates/add-months';
import { dayStart } from '../../../parts/dates/day-start';
import type { ResolvedView } from './resolved-view';

/** The start of the week `date` is in. */
export function weekStart(date: Date, firstDayOfWeek: number): Date {
  const day = dayStart(date);
  return addDays(day, -((day.getDay() - firstDayOfWeek + 7) % 7));
}

/** The days a view shows around `date`. */
export function viewDates(view: ResolvedView, date: Date, firstDayOfWeek: number, workDays: readonly number[]): Date[] {
  const count = Math.max(1, Math.round(view.intervalCount));
  const out: Date[] = [];
  if (view.type === 'day') {
    const first = dayStart(date);
    for (let i = 0; i < count; i++) out.push(addDays(first, i));
  } else if (view.type === 'week' || view.type === 'workWeek') {
    const first = weekStart(date, firstDayOfWeek);
    for (let i = 0; i < 7 * count; i++) {
      const day = addDays(first, i);
      if (view.type === 'week' || workDays.includes(day.getDay())) out.push(day);
    }
    // A work week with no work days still shows its week.
    if (!out.length) for (let i = 0; i < 7 * count; i++) out.push(addDays(first, i));
  } else {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const after = addMonths(monthStart, count);
    let day = weekStart(monthStart, firstDayOfWeek);
    while (day < after || out.length % 7) {
      out.push(day);
      day = addDays(day, 1);
    }
  }
  return out;
}

/** The date one step (`by` = 1) or more after or before `date` in a view: a day, a week or a month times its interval. */
export function stepDate(view: ResolvedView, date: Date, by: number): Date {
  const count = Math.max(1, Math.round(view.intervalCount)) * by;
  if (view.type === 'day') return addDays(dayStart(date), count);
  if (view.type === 'month') return addMonths(new Date(date.getFullYear(), date.getMonth(), 1), count);
  return addDays(dayStart(date), 7 * count);
}
