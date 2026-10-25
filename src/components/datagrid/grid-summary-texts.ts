/**
 * The texts of summary items by type, `{0}` the formatted value. The `…OtherColumn` ones are for an
 * item shown away from its column (`showInColumn`, a group row), `{1}` that column's title.
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
