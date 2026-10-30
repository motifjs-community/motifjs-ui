import { untracked } from '@motifx/core';
import { dayStart } from '../../../parts/dates/day-start';
import { TimeZone } from '../../../parts/dates/time-zone';
import { parseRecurrenceRule } from '../../../parts/recurrence/parse-recurrence-rule';
import { recurrenceDates } from '../../../parts/recurrence/recurrence-dates';
import type { SchedulerBlockedTime } from '../scheduler-blocked-time';

const DAY = 86_400_000;

/** A blocked time as it happens once: wall clock times of the scheduler's clock. */
export interface BlockedSpan {
  start: number;
  end: number;
  block: SchedulerBlockedTime;
}

/**
 * The times the blocked times take between two wall clock times (a repeating one, each time it happens there). The
 * blocked times are the developer's and are read as they are (untracked): a new list given shows, a change in place
 * after the scheduler's refresh.
 */
export function blockedSpans(blocks: readonly SchedulerBlockedTime[], from: number, to: number, zone: TimeZone): BlockedSpan[] {
  return untracked(() => spansOf(blocks, from, to, zone));
}

function spansOf(blocks: readonly SchedulerBlockedTime[], from: number, to: number, zone: TimeZone): BlockedSpan[] {
  const out: BlockedSpan[] = [];
  for (const block of blocks) {
    if (!(block.start instanceof Date) || !(block.end instanceof Date)) continue;
    let start: number;
    let end: number;
    if (block.allDay) {
      // Its days, from the fields of its dates: the end's day too unless it ends at its start.
      start = TimeZone.wallOfLocal(dayStart(block.start));
      const last = TimeZone.wallOfLocal(dayStart(block.end));
      end = last === TimeZone.wallOfLocal(block.end) && last > start ? last : last + DAY;
    } else {
      start = zone.wall(block.start);
      end = zone.wall(block.end);
    }
    const length = Math.max(0, end - start);
    const rule = block.recurrenceRule ? parseRecurrenceRule(block.recurrenceRule) : null;
    const starts = rule ? recurrenceDates(rule, start, from - length - DAY, to + DAY, { wallOf: (moment) => zone.wall(moment) }) : [start];
    for (const at of starts) if (at < to && at + length > from) out.push({ start: at, end: at + length, block });
  }
  return out;
}
