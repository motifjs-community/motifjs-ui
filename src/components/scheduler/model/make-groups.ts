import { givenField, givenList } from '../../../core/given-field';
import type { GroupResource } from './group-resource';
import type { ResourceKind } from './ResourceKind';
import { sameValue } from './same-value';
import type { SchedulerGroup } from './scheduler-group';

/** The work time a group falls back on. */
export interface BaseWork {
  start: number;
  end: number;
  days: readonly number[];
}

/**
 * The groups of the columns: every item of the first kind, each with every item of the next
 * (only its own, when the next kind says whose it is by `parentExpr`), and so on. A group's work
 * time is the innermost item's own, else the base.
 */
export function makeGroups(kinds: readonly ResourceKind<unknown>[], base: BaseWork): Omit<SchedulerGroup, 'index'>[] {
  if (!kinds.length) return [];
  const out: Omit<SchedulerGroup, 'index'>[] = [];
  // The items along the path: their work time is read here, the groups keep only their values.
  const walk = (level: number, path: GroupResource[], items: unknown[]) => {
    if (level === kinds.length) {
      out.push(groupOf(kinds, path, items, base));
      return;
    }
    const kind = kinds[level];
    const parent = path[level - 1];
    const nested = !!parent && !!givenField(kind.def, 'parentExpr');
    for (const item of kind.items) {
      if (nested && !sameValue(kind.parentOf(item), parent.value)) continue;
      const value = kind.valueOf(item);
      walk(level + 1, [...path, { field: kind.field, value, text: kind.textOf(item), color: kind.colorOf(item) }], [...items, item]);
    }
  };
  walk(0, [], []);
  return out;
}

function groupOf(kinds: readonly ResourceKind<unknown>[], path: GroupResource[], items: unknown[], base: BaseWork): Omit<SchedulerGroup, 'index'> {
  const values: Record<string, unknown> = {};
  for (const step of path) values[step.field] = step.value;
  let start: number | undefined;
  let end: number | undefined;
  let days: readonly number[] | undefined;
  for (let level = path.length - 1; level >= 0; level--) {
    const own = kinds[level].workOf(items[level]);
    start ??= own.start;
    end ??= own.end;
    days ??= own.days;
  }
  return {
    key: path.map((step) => `${step.field}=${String(step.value)}`).join('|'),
    values,
    path,
    workStart: start ?? base.start,
    workEnd: end ?? base.end,
    workDays: days ?? givenList(base.days),
  };
}
