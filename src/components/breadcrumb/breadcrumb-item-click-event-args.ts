import type { Breadcrumb } from './Breadcrumb';

/** A step was pressed, on the breadcrumb or in its menu. */
export interface BreadcrumbItemClickEventArgs {
  /** The item as given. */
  item: unknown;
  index: number;
  /** `cancel = true` keeps a link from being followed. */
  cancel: boolean;
  source: Breadcrumb;
}
