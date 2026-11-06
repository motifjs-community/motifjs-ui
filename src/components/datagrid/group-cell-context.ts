import type { GridColumn } from './grid-column';
import type { GridSummaryValue } from './grid-summary-value';

/**
 * The context a custom group cell (`groupCell`) receives. The grid reuses the group row for other
 * groups while scrolling, so read the fields inside getters (`{() => ctx.text}`).
 */
export interface GroupCellContext<T> {
  /** The value the group's rows share, or `null` for empty values. */
  readonly value: unknown;
  /** The value as the column displays it (a lookup's text). */
  readonly text: string;
  /** The number of rows in the group, including lower levels. */
  readonly count: number;
  /** The group's level, 0 for the top level. */
  readonly level: number;
  /** The group values from the top level down to this one: the group's key for `expandGroup`. */
  readonly key: readonly unknown[];
  readonly isExpanded: boolean;
  /** The group summary items of the group row (not of its footer) with their values and texts. */
  readonly summaryItems: readonly GridSummaryValue[];
  readonly column: GridColumn<T>;
}
