import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { BadgePosition } from './badge-position';
import type { BadgeTone } from './badge-tone';
import type { BadgeVariant } from './badge-variant';

/** Props of `Badge`. Each prop is also a settable property, and a function is tracked. */
export interface BadgeProps extends ControlProps {
  /** A count formatted in the kit language. Above `max`, it shows `max+`. With `null`, the text is shown instead. */
  count?: Bind<number | null>;
  /** The highest count shown in full. The default is `99`. */
  max?: Bind<number>;
  /** Shows a count of 0. Without it, the badge hides at 0. The default is `false`. */
  showZero?: Bind<boolean>;
  /** Shows a dot only, indicating that something is present. The default is `false`. */
  dot?: Bind<boolean>;
  /** The default comes from the design language (`accent`, or `danger` where the language marks counts that way). */
  tone?: Bind<BadgeTone>;
  /** The default comes from the design language (`solid`). */
  variant?: Bind<BadgeVariant>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** A corner of the container, which becomes its anchor. The default, `null`, keeps the badge in the text flow. */
  position?: Bind<BadgePosition | null>;
  /** The text announced by screen readers ("3 unread messages"). Without it, they read the badge text. */
  label?: Bind<string>;
}
