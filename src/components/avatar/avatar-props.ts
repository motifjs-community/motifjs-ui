import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { AvatarShape } from './avatar-shape';
import type { AvatarSize } from './avatar-size';
import type { AvatarStatus } from './avatar-status';
import type { AvatarTone } from './avatar-tone';

/** Props of `Avatar`. Each one is also a settable property; a function is followed. */
export interface AvatarProps extends ControlProps {
  /** The picture. Until it loads, or when it cannot, the initials (else the person icon) show. */
  src?: Bind<string | null>;
  /** Whose avatar it is: the initials are made from it, and screen readers say it. */
  name?: Bind<string>;
  /** Initials of your own instead of the ones made from `name`. */
  initials?: Bind<string>;
  /** What screen readers say instead of the name. */
  label?: Bind<string>;
  /** Default `'md'`; in a group, the group's. */
  size?: Bind<AvatarSize>;
  /** Default: the design language's (`circle`). */
  shape?: Bind<AvatarShape>;
  /** The colour without a picture; `auto` takes one from the name, the same for the same name. Default: the design language's. */
  tone?: Bind<AvatarTone>;
  /** A presence dot on the lower end corner; `null`: none. Default `null`. */
  status?: Bind<AvatarStatus | null>;
}
