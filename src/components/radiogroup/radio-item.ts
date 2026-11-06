import type { Bind } from '@motifx/core';

/** One option of a `RadioGroup`. Its fields can be functions of reactive state, which the group tracks. */
export interface RadioItem<T = unknown> {
  value: T;
  /** Shown next to the circle. The default is the value as text. */
  text?: Bind<string>;
  /** The tooltip text. */
  hint?: Bind<string>;
  /** A smaller line below the text. */
  helpText?: Bind<string>;
  /** `false` dims the option, and the arrow keys skip it. The default is `true`. */
  enabled?: Bind<boolean>;
  /** `false` removes the option. The default is `true`. */
  visible?: Bind<boolean>;
}
