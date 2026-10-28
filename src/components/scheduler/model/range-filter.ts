import type { data } from '@motifx-community/data';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';
import type { RangeFilterOptions } from './range-filter-options';

/**
 * The data layer's filter for the appointments a range may show: they start before it ends and
 * end at or after it starts, or they repeat (a series that began before the range may happen in
 * it; its occurrences are found by its rule). With `resources`, only the ones of those resources.
 *
 * @example
 * source.setFilter(rangeFilter(scheduler.visibleRange, scheduler.fields, { resources: { roomId: [1, 2] } }));
 */
export function rangeFilter(
  range: SchedulerRange,
  fields: Pick<SchedulerFields, 'start' | 'end' | 'recurrenceRule'>,
  options: RangeFilterOptions = {},
): data.FilterExpression {
  const time: data.FilterExpression[] = [
    { field: fields.start, op: '<', value: range.end },
    { or: [{ field: fields.end, op: '>=', value: range.start }, { field: fields.recurrenceRule, op: 'isnotblank' }] },
  ];
  const resources = Object.entries(options.resources ?? {}).map(([field, values]): data.FilterExpression => ({ field, op: 'in', value: [...values] }));
  return { and: [...time, ...resources] };
}
