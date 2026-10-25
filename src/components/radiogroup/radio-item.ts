import type { Bind } from '@motifx/core';

/** One option of a `RadioGroup`. Its fields may be functions of reactive state: the group follows them. */
export interface RadioItem<T = unknown> {
  value: T;
  /** Shown next to the circle. Default: the value as text. */
  text?: Bind<string>;
  /** A tooltip. */
  hint?: Bind<string>;
  /** A smaller line under the text. */
  helpText?: Bind<string>;
  /** `false` greys it out and skips it. Default `true`. */
  enabled?: Bind<boolean>;
  /** `false` leaves it out. Default `true`. */
  visible?: Bind<boolean>;
}
