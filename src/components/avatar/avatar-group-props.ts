import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { AvatarGroupLayout } from './avatar-group-layout';
import type { AvatarSize } from './avatar-size';

/** Props of `AvatarGroup`. Each one is also a settable property; a function is followed. */
export interface AvatarGroupProps extends ControlProps {
  /** The size of every avatar in it. Default `'md'`. */
  size?: Bind<AvatarSize>;
  /** Default: the design language's (`stack`). */
  layout?: Bind<AvatarGroupLayout>;
  /** The most avatars shown; the others are counted in a `+N` after them. Default: all. */
  max?: Bind<number | null>;
  /** How many there are in all, when only some are given; the rest are counted in the `+N`. */
  total?: Bind<number | null>;
  /** What screen readers call the group ("Members"). */
  label?: Bind<string>;
}
