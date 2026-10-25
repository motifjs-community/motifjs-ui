import type { GridGroupSummaryItem } from '../grid-group-summary-item';
import type { GridSummaryType } from '../grid-summary-type';

/** A summary item as the grid reads it now: its fields with the defaults in. */
export interface PlacedItem {
  /** Its place in `totalItems` or `groupItems`, and in the values. */
  index: number;
  item: GridGroupSummaryItem;
  type: GridSummaryType;
  /** The column aggregated; `undefined` without one. */
  field: string | undefined;
  /** The column it shows under. */
  place: string | undefined;
  name: string | undefined;
  /** A group item in the group footer. */
  footer: boolean;
  /** A group item under its column in the group row. */
  align: boolean;
  visible: boolean;
}
