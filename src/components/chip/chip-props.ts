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
  /** What it stands for in a group's value. Default: its text. */
  value?: Bind<unknown>;
  /** An icon before the text: an image address, an element or a component. */
  icon?: Bind<IconSource | null>;
  /** An avatar before the text (its props; the chip sets its size). */
  avatar?: Bind<AvatarProps | null>;
  /** Pressed, it turns on and off (a filter). In a group that selects, the group decides. Default `false`. */
  selectable?: Bind<boolean>;
  /** Whether it is on. Default `false`. */
  selected?: Bind<boolean>;
  /** It can be pressed like a button (`onclick`). Default `false`. */
  clickable?: Bind<boolean>;
  /** A remove button after the text; it and Delete / Backspace raise `onRemove`. Default `false`. */
  removable?: Bind<boolean>;
  /** Default: the design language's (`filled`, or `outline` where the language draws chips that way). */
  variant?: Bind<ChipVariant>;
  /** Default `'standard'`. */
  tone?: Bind<ChipTone>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  onRemove?: (e: ChipRemoveEventArgs) => void;
  onSelectedChanged?: (e: ChipSelectedChangedEventArgs) => void;
}
