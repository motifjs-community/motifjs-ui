import type { data } from '@motifx-community/data';

/** What `filterPanelText` gets: the text the panel would show and the filter value it reads. */
export interface GridFilterPanelTextInfo {
  text: string;
  filterValue: data.FilterExpression | null;
}
