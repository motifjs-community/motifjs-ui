import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { BreadcrumbItem } from './breadcrumb-item';
import type { BreadcrumbItemClickEventArgs } from './breadcrumb-item-click-event-args';

/** Props of `Breadcrumb`. Each prop is also a settable property, and a function is tracked. */
export interface BreadcrumbProps extends ControlProps {
  /** The steps, with the current page last: `BreadcrumbItem` objects or plain text. */
  items?: Bind<readonly (BreadcrumbItem | string)[]>;
  /** The `rel` of the links. `'router'` lets the MotifJS router handle them. */
  rel?: Bind<string>;
  /**
   * The maximum number of steps shown. The first and last stay, and those in between move to a menu.
   * By default, as many as fit are shown.
   */
  maxItems?: Bind<number | null>;
  /** Makes the last step the current page, which cannot be clicked and has `aria-current`. The default is `true`. */
  lastIsCurrent?: Bind<boolean>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** The accessible name. The default is the kit's "Breadcrumb" string. */
  label?: Bind<string>;
  onItemClick?: (e: BreadcrumbItemClickEventArgs) => void;
}
