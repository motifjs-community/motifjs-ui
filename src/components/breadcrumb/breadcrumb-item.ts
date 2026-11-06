import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One step of a `Breadcrumb`. Its fields can be functions of reactive state, which the breadcrumb tracks. */
export interface BreadcrumbItem {
  text: Bind<string>;
  /** Makes the step a link to this address. Without it, the step is a button (`onItemClick`). */
  href?: Bind<string | null>;
  icon?: Bind<IconSource | null>;
  /** `false` shows the step dimmed. The default is `true`. */
  enabled?: Bind<boolean>;
  /** A custom application value for the step. */
  data?: unknown;
}
