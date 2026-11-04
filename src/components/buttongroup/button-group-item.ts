import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One button of a `ButtonGroup`. Its fields may be functions of reactive state: the group follows them. */
export interface ButtonGroupItem<T = unknown> {
  value: T;
  /** Default: the value as text. */
  text?: Bind<string>;
  icon?: Bind<IconSource | null>;
  /** A tooltip; with an icon and no text it also names the button. */
  hint?: Bind<string>;
  /** `false` greys it out and skips it. Default `true`. */
  enabled?: Bind<boolean>;
  /** `false` leaves it out. Default `true`. */
  visible?: Bind<boolean>;
}
