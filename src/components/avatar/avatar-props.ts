import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { AvatarShape } from './avatar-shape';
import type { AvatarSize } from './avatar-size';
import type { AvatarStatus } from './avatar-status';
import type { AvatarTone } from './avatar-tone';

/** Props of `Avatar`. Each prop is also a settable property, and a function is tracked. */
export interface AvatarProps extends ControlProps {
  /** The picture. Until it loads, or if it fails, the initials appear, or the person icon if there are none. */
  src?: Bind<string | null>;
  /** The person's name. It is used to create the initials and is announced by screen readers. */
  name?: Bind<string>;
  /** Custom initials that replace the ones created from `name`. */
  initials?: Bind<string>;
  /** The text screen readers announce instead of the name. */
  label?: Bind<string>;
  /** The default is `'md'`. In a group, the group's size applies. */
  size?: Bind<AvatarSize>;
  /** The default comes from the design language (`circle`). */
  shape?: Bind<AvatarShape>;
  /**
   * The color when there is no picture. `auto` derives a tone from the name, so the same name always has the same tone.
   * The default comes from the design language.
   */
  tone?: Bind<AvatarTone>;
  /** A presence dot on the lower end corner. The default, `null`, shows none. */
  status?: Bind<AvatarStatus | null>;
}
