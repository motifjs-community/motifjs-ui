/** What `customizeText` of a summary item receives. */
export interface GridSummaryTextInfo {
  /** The value as it was calculated. */
  readonly value: unknown;
  /** The formatted value (`valueFormat`, otherwise the column's format). */
  readonly valueText: string;
}
