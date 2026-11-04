import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { BadgePosition } from './badge-position';
import type { BadgeTone } from './badge-tone';
import type { BadgeVariant } from './badge-variant';

/** Props of `Badge`. Each one is also a settable property; a function is followed. */
export interface BadgeProps extends ControlProps {
  /** A count, written in the kit's language; over `max` it shows `max+`. `null`: the text shows instead. */
  count?: Bind<number | null>;
  /** The highest count written as it is. Default `99`. */
  max?: Bind<number>;
  /** A count of 0 shows; without it the badge hides at 0. Default `false`. */
  showZero?: Bind<boolean>;
  /** A dot only: there is something, without saying what. Default `false`. */
  dot?: Bind<boolean>;
  /** Default: the design language's (`accent`, or `danger` where the language marks counts that way). */
  tone?: Bind<BadgeTone>;
  /** Default: the design language's (`solid`). */
  variant?: Bind<BadgeVariant>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** On a corner of what it is in (which becomes its anchor); `null`: in the flow of the text. Default `null`. */
  position?: Bind<BadgePosition | null>;
  /** What screen readers say ("3 unread messages"); without it, they read the text. */
  label?: Bind<string>;
}
