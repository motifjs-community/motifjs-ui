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
  /** The title; it names the card for screen readers. */
  title?: Bind<string>;
  /** The line under the title. */
  subtitle?: Bind<string>;
  /** An avatar before the titles (its props). */
  avatar?: Bind<AvatarProps | null>;
  /** Something at the end of the header: a menu button, a badge. */
  action?: Bind<ComponentBase | null>;
  /** A picture running to the card's edges: an image address, an element or a component. */
  media?: Bind<IconSource | null>;
  /** What the picture shows, for screen readers, when `media` is an image address. Default: none (it only adorns). */
  mediaAlt?: Bind<string>;
  /** What fills the content (besides JSX children). */
  content?: Bind<ComponentBase | null>;
  /** A row of actions under the content. */
  footer?: Bind<ComponentBase | null>;
  /** Default: the design language's (`elevated`). */
  variant?: Bind<CardVariant>;
  /** The space in and between its parts. Default `'md'`. */
  size?: Bind<ControlSize>;
  /** `horizontal` puts the picture at the start. Default `'vertical'`. */
  orientation?: Bind<CardOrientation>;
  /** The whole card can be pressed (`onclick`, Enter, Space). Default `false`. */
  clickable?: Bind<boolean>;
  /** The whole card is a link there: its title is the link, and a click anywhere on the card follows it. */
  href?: Bind<string | null>;
  /** The link's `rel`; `'router'` lets the MotifJS router take it. */
  rel?: Bind<string>;
  /** A check box on its top end corner, and a click on the card turns it on and off. Default `false`. */
  selectable?: Bind<boolean>;
  /** Whether it is selected. Default `false`. */
  selected?: Bind<boolean>;
  onSelectedChanged?: (e: CardSelectedChangedEventArgs) => void;
}
