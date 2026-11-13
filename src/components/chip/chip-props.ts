import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import type { AvatarProps } from '../avatar/avatar-props';
import type { ChipRemoveEventArgs } from './chip-remove-event-args';
import type { ChipSelectedChangedEventArgs } from './chip-selected-changed-event-args';
import type { ChipTone } from './chip-tone';
import type { ChipVariant } from './chip-variant';

/** Props of `Chip`. Each prop is also a settable property, and a function is tracked. */
export interface ChipProps extends ControlProps {
  /** The value it represents in a group. The default is its text. */
  value?: Bind<unknown>;
  /** An icon before the text: an image address or a component. */
  icon?: Bind<IconSource | null>;
  /** An avatar before the text (its props, with the size set by the chip). */
  avatar?: Bind<AvatarProps | null>;
  /** Clicking the chip toggles it, as a filter. In a group with selection, the group controls it. The default is `false`. */
  selectable?: Bind<boolean>;
  /** Indicates whether the chip is on. The default is `false`. */
  selected?: Bind<boolean>;
  /** Lets the chip be clicked like a button (`onclick`). The default is `false`. */
  clickable?: Bind<boolean>;
  /** Adds a remove button after the text. The button, Delete and Backspace raise `onRemove`. The default is `false`. */
  removable?: Bind<boolean>;
  /** The default comes from the design language (`filled`, or `outline` where the language draws chips that way). */
  variant?: Bind<ChipVariant>;
  /** The default is `'standard'`. */
  tone?: Bind<ChipTone>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  onRemove?: (e: ChipRemoveEventArgs) => void;
  onSelectedChanged?: (e: ChipSelectedChangedEventArgs) => void;
}
