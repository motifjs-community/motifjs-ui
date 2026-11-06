import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { BreadcrumbItem } from './breadcrumb-item';
import type { BreadcrumbItemClickEventArgs } from './breadcrumb-item-click-event-args';

/** Props of `Breadcrumb`. Each prop is also a settable property, and a function is tracked. */
export interface BreadcrumbProps extends ControlProps {
  /** The steps, the current page last: `BreadcrumbItem`s or plain texts. */
  items?: Bind<readonly (BreadcrumbItem | string)[]>;
  /** The links' `rel`; `'router'` lets the MotifJS router take them. */
  rel?: Bind<string>;
  /** The most steps shown; the first and the last ones stay, those between go into a menu. Default: as many as fit. */
  maxItems?: Bind<number | null>;
  /** The last step is the current page (not pressable, `aria-current`). Default `true`. */
  lastIsCurrent?: Bind<boolean>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** What screen readers call it. Default: the kit's "Breadcrumb". */
  label?: Bind<string>;
  onItemClick?: (e: BreadcrumbItemClickEventArgs) => void;
}
