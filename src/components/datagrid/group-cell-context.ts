import type { GridColumn } from './grid-column';
import type { GridSummaryValue } from './grid-summary-value';

/**
 * What a column's own group cell (`groupCell`) receives. The grid reuses the group row for other
 * groups while it scrolls, so read the fields inside getters (`{() => ctx.text}`).
 */
export interface GroupCellContext<T> {
  /** The value the group's rows share; `null` for empty values. */
  readonly value: unknown;
  /** The value as the column shows it (a lookup's text). */
  readonly text: string;
  /** Rows in the group, levels below included. */
  readonly count: number;
  /** 0 for the top level. */
  readonly level: number;
  /** The values of the groups from the top level down to this one: the group's key for `expandGroup`. */
  readonly key: readonly unknown[];
  readonly isExpanded: boolean;
  /** The group summary items of the group row (not of its footer) with their values and texts. */
  readonly summaryItems: readonly GridSummaryValue[];
  readonly column: GridColumn<T>;
}
