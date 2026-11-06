import type { data } from '@motifx-community/data';

/** What `filterPanelText` receives: the text the panel would display and the filter value it reads. */
export interface GridFilterPanelTextInfo {
  text: string;
  filterValue: data.FilterExpression | null;
}
