import type { Breadcrumb } from './Breadcrumb';

/** Provides data for the event that occurs when a step is clicked, on the breadcrumb or in its menu. */
export interface BreadcrumbItemClickEventArgs {
  /** The item as provided. */
  item: unknown;
  index: number;
  /** Set `cancel = true` to prevent following a link. */
  cancel: boolean;
  source: Breadcrumb;
}
