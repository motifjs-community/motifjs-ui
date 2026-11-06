import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { AvatarGroupLayout } from './avatar-group-layout';
import type { AvatarSize } from './avatar-size';

/** Props of `AvatarGroup`. Each prop is also a settable property, and a function is tracked. */
export interface AvatarGroupProps extends ControlProps {
  /** The size of every avatar in the group. The default is `'md'`. */
  size?: Bind<AvatarSize>;
  /** The default comes from the design language (`stack`). */
  layout?: Bind<AvatarGroupLayout>;
  /** The maximum number of avatars shown. The others are counted in a `+N` after them. By default, all are shown. */
  max?: Bind<number | null>;
  /** The total number of people when only some are provided. The rest are counted in the `+N`. */
  total?: Bind<number | null>;
  /** The accessible name of the group ("Members"). */
  label?: Bind<string>;
}
