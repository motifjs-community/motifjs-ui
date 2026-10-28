import type { data } from '@motifx-community/data';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';

/**
 * The data layer's filter for the appointments a range may show: they start before it ends and
 * end at or after it starts, or they repeat (a series that began before the range may happen in
 * it; its occurrences are found by its rule).
 *
 * @example
 * source.setFilter(rangeFilter(scheduler.visibleRange, scheduler.fields));
 */
export function rangeFilter(range: SchedulerRange, fields: Pick<SchedulerFields, 'start' | 'end' | 'recurrenceRule'>): data.FilterExpression {
  return {
    and: [
      { field: fields.start, op: '<', value: range.end },
      { or: [{ field: fields.end, op: '>=', value: range.start }, { field: fields.recurrenceRule, op: 'isnotblank' }] },
    ],
  };
}
