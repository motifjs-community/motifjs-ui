import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One step of a `Breadcrumb`. Its fields may be functions of reactive state: the breadcrumb follows them. */
export interface BreadcrumbItem {
  text: Bind<string>;
  /** Makes it a link there; without it, a button (`onItemClick`). */
  href?: Bind<string | null>;
  icon?: Bind<IconSource | null>;
  /** `false` greys it out. Default `true`. */
  enabled?: Bind<boolean>;
  /** The app's own value for the step. */
  data?: unknown;
}
