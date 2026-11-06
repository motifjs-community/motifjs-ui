import type { data } from '@motifx-community/data';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';
import type { RangeFilterOptions } from './range-filter-options';

/**
 * Returns the data layer filter for the appointments a range can show: those that start before it
 * ends and either end at or after it starts or have a rule, because a series that began before the
 * range can occur in it. With `resources`, only appointments of those resources are included.
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
