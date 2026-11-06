import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import type { AvatarProps } from '../avatar/avatar-props';
import type { CardOrientation } from './card-orientation';
import type { CardSelectedChangedEventArgs } from './card-selected-changed-event-args';
import type { CardVariant } from './card-variant';

/** Props of `Card`. Each prop is also a settable property, and a function is tracked. */
export interface CardProps extends ControlProps {
  /** The title, which also provides the accessible name of the card. */
  title?: Bind<string>;
  /** Text below the title. */
  subtitle?: Bind<string>;
  /** An avatar before the titles (its props). */
  avatar?: Bind<AvatarProps | null>;
  /** Content at the end of the header, such as a menu button or a badge. */
  action?: Bind<ComponentBase | null>;
  /** An image that extends to the card edges: an image address, an element or a component. */
  media?: Bind<IconSource | null>;
  /** Alternative text for the image when `media` is an image address. Without it, the image is decorative. */
  mediaAlt?: Bind<string>;
  /** The content, in addition to JSX children. */
  content?: Bind<ComponentBase | null>;
  /** A row of actions below the content. */
  footer?: Bind<ComponentBase | null>;
  /** The default comes from the design language (`elevated`). */
  variant?: Bind<CardVariant>;
  /** The spacing inside and between the parts. The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** `horizontal` places the image at the start. The default is `'vertical'`. */
  orientation?: Bind<CardOrientation>;
  /** Makes the whole card pressable (`onclick`, Enter, Space). The default is `false`. */
  clickable?: Bind<boolean>;
  /** Makes the whole card a link to this address. The title is the link, and clicking anywhere on the card follows it. */
  href?: Bind<string | null>;
  /** The `rel` of the link. `'router'` lets the MotifJS router handle it. */
  rel?: Bind<string>;
  /** Adds a check box on the top end corner, and clicking the card toggles it. The default is `false`. */
  selectable?: Bind<boolean>;
  /** Indicates whether the card is selected. The default is `false`. */
  selected?: Bind<boolean>;
  onSelectedChanged?: (e: CardSelectedChangedEventArgs) => void;
}
