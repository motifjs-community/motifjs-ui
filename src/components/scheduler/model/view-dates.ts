import { addDays } from '../../../parts/dates/add-days';
import { addMonths } from '../../../parts/dates/add-months';
import { dayStart } from '../../../parts/dates/day-start';
import type { ResolvedView } from './resolved-view';

const DAY = 86_400_000;

/** The start of the week `date` is in. */
export function weekStart(date: Date, firstDayOfWeek: number): Date {
  const day = dayStart(date);
  return addDays(day, -((day.getDay() - firstDayOfWeek + 7) % 7));
}

/** What one step of a view is: days, weeks or months, and how many of them. */
function unitOf(view: ResolvedView): { unit: 'day' | 'week' | 'month'; count: number } {
  const count = Math.max(1, Math.round(view.intervalCount));
  switch (view.type) {
    case 'day':
    case 'timelineDay':
      return { unit: 'day', count };
    case 'agenda':
      return { unit: 'day', count: Math.max(1, Math.round(view.agendaDuration ?? 7)) };
    case 'month':
    case 'timelineMonth':
      return { unit: 'month', count };
    default:
      return { unit: 'week', count };
  }
}

/** Whole days from `a` to `b` (both a day's start), over summer time. */
function daysBetween(a: Date, b: Date): number {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY);
}

/**
 * The first day of the interval that has `date`: its day, week or month; with `startDate` and an
 * interval of more than one, the interval counted from `startDate` in steps of the interval.
 */
function intervalStart(view: ResolvedView, date: Date, firstDayOfWeek: number): Date {
  const { unit, count } = unitOf(view);
  const from = view.startDate instanceof Date && !Number.isNaN(view.startDate.getTime()) && (count > 1 || view.type === 'agenda') ? view.startDate : null;
  if (unit === 'month') {
    const month = new Date(date.getFullYear(), date.getMonth(), 1);
    if (!from) return month;
    const base = new Date(from.getFullYear(), from.getMonth(), 1);
    const months = (month.getFullYear() - base.getFullYear()) * 12 + month.getMonth() - base.getMonth();
    return addMonths(base, Math.floor(months / count) * count);
  }
  if (unit === 'week') {
    const week = weekStart(date, firstDayOfWeek);
    if (!from) return week;
    const base = weekStart(from, firstDayOfWeek);
    return addDays(base, Math.floor(daysBetween(base, week) / 7 / count) * count * 7);
  }
  const day = dayStart(date);
  if (!from) return day;
  const base = dayStart(from);
  return addDays(base, Math.floor(daysBetween(base, day) / count) * count);
}

/** The days a view shows around `date`. */
export function viewDates(view: ResolvedView, date: Date, firstDayOfWeek: number, workDays: readonly number[]): Date[] {
  const { unit, count } = unitOf(view);
  const first = intervalStart(view, date, firstDayOfWeek);
  const out: Date[] = [];
  if (unit === 'day') {
    for (let i = 0; i < count; i++) out.push(addDays(first, i));
  } else if (unit === 'week') {
    const work = view.type === 'workWeek' || view.type === 'timelineWorkWeek';
    for (let i = 0; i < 7 * count; i++) {
      const day = addDays(first, i);
      if (!work || workDays.includes(day.getDay())) out.push(day);
    }
    // A work week with no work days still shows its week.
    if (!out.length) for (let i = 0; i < 7 * count; i++) out.push(addDays(first, i));
  } else if (view.type === 'timelineMonth') {
    // The days of the months, none of the weeks around them.
    const after = addMonths(first, count);
    for (let day = first; day < after; day = addDays(day, 1)) out.push(day);
  } else {
    const after = addMonths(first, count);
    let day = weekStart(first, firstDayOfWeek);
    while (day < after || out.length % 7) {
      out.push(day);
      day = addDays(day, 1);
    }
  }
  return out;
}

/** The date one step (`by` = 1) or more after or before `date` in a view: a day, a week or a month times its interval (the agenda: its days). */
export function stepDate(view: ResolvedView, date: Date, by: number): Date {
  const { unit, count } = unitOf(view);
  const first = intervalStart(view, date, 0);
  if (unit === 'month') return addMonths(new Date(first.getFullYear(), first.getMonth(), 1), count * by);
  if (unit === 'week') return addDays(dayStart(date), 7 * count * by);
  return addDays(view.startDate && (count > 1 || view.type === 'agenda') ? first : dayStart(date), count * by);
}
