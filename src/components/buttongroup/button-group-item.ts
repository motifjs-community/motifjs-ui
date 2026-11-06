import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One button of a `ButtonGroup`. Its fields can be functions of reactive state, which the group tracks. */
export interface ButtonGroupItem<T = unknown> {
  value: T;
  /** The default is the value as text. */
  text?: Bind<string>;
  icon?: Bind<IconSource | null>;
  /** A tooltip. With an icon and no text, it also provides the name of the button. */
  hint?: Bind<string>;
  /** `false` shows the button dimmed and skips it. The default is `true`. */
  enabled?: Bind<boolean>;
  /** `false` removes the button. The default is `true`. */
  visible?: Bind<boolean>;
}
