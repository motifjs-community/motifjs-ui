/** What `customizeText` of a summary item receives. */
export interface GridSummaryTextInfo {
  /** The value as it was calculated. */
  readonly value: unknown;
  /** The value formatted (`valueFormat`, else the column's format). */
  readonly valueText: string;
}
