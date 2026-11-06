/**
 * The strings of summary items by type, where `{0}` is the formatted value. The `…OtherColumn` strings
 * are for an item displayed away from its column (`showInColumn`, a group row), with `{1}` as that
 * column's title.
 */
export interface GridSummaryTexts {
  sum: string;
  sumOtherColumn: string;
  min: string;
  minOtherColumn: string;
  max: string;
  maxOtherColumn: string;
  avg: string;
  avgOtherColumn: string;
  count: string;
}
