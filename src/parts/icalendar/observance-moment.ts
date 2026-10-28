import { parseRecurrenceRule } from '../recurrence/parse-recurrence-rule';
import { recurrenceDates } from '../recurrence/recurrence-dates';
import type { ICalendarObservance } from './icalendar-observance';

const MINUTE = 60_000;

/** The latest onset of an observance at or before a wall clock time; `null` when there is none. */
function latestOnset(observance: ICalendarObservance, wall: number): number | null {
  const onsets = [observance.start, ...observance.dates].filter((onset) => onset <= wall);
  const rule = observance.rule ? parseRecurrenceRule(observance.rule) : null;
  if (rule && observance.start <= wall) {
    // An `UNTIL` in UTC is a moment; onsets are clock times in the offset before them.
    const found = recurrenceDates(rule, observance.start, observance.start, wall + 1, { wallOf: (moment) => moment + observance.offsetFrom * MINUTE });
    if (found.length) onsets.push(found[found.length - 1]);
  }
  return onsets.length ? Math.max(...onsets) : null;
}

/**
 * The moment a wall clock time names in a zone written as observances: the one with the latest
 * onset at or before it holds. A time the clock skips moves on by the gap; before every onset the
 * offset before the first one holds. `null` when there are no observances.
 */
export function observanceMoment(observances: readonly ICalendarObservance[], wall: number): number | null {
  if (!observances.length) return null;
  let holds: ICalendarObservance | null = null;
  let onset = -Infinity;
  for (const observance of observances) {
    const latest = latestOnset(observance, wall);
    if (latest !== null && latest >= onset) {
      holds = observance;
      onset = latest;
    }
  }
  if (!holds) {
    const first = observances.reduce((a, b) => (b.start < a.start ? b : a));
    return wall - first.offsetFrom * MINUTE;
  }
  const gap = (holds.offsetTo - holds.offsetFrom) * MINUTE;
  const skipped = gap > 0 && wall < onset + gap;
  return wall - (skipped ? holds.offsetFrom : holds.offsetTo) * MINUTE;
}
