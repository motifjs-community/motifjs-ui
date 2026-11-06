import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ItemField } from '../../parts/list/item-field';
import type { ButtonSize } from '../button/button-size';
import type { ButtonVariant } from '../button/button-variant';
import type { ButtonGroupItem } from './button-group-item';
import type { ButtonGroupItemClickEventArgs } from './button-group-item-click-event-args';
import type { ButtonGroupSelection } from './button-group-selection';
import type { ButtonGroupValueChangedEventArgs } from './button-group-value-changed-event-args';

/** Props of `ButtonGroup`. Each prop is also a settable property, and a function is tracked. */
export interface ButtonGroupProps<T = unknown> extends ControlProps {
  /**
   * The buttons: `ButtonGroupItem` objects, plain values that serve as their own text, or custom objects with
   * `itemText` / `itemValue`.
   */
  items?: Bind<readonly (ButtonGroupItem<T> | T)[]>;
  /**
   * The location of the text in an item: a property name or a function. The default is `'text'`. A function here is a
   * reader, not a binding.
   */
  itemText?: ItemField<ButtonGroupItem<T> | T>;
  /**
   * The location of the value in an item: a property name or a function. The default is `'value'`. A function here is a
   * reader, not a binding.
   */
  itemValue?: ItemField<ButtonGroupItem<T> | T>;
  /** The default is `'single'`. */
  selection?: Bind<ButtonGroupSelection>;
  /**
   * The selected value (`single`) or an array of the values that are on (`multiple`). `x-model` provides two-way
   * binding.
   */
  value?: Bind<T | readonly T[] | null>;
  /** With `single`, clicking the selected button again clears the selection. The default is `false`. */
  allowEmpty?: Bind<boolean>;
  /** The buttons are attached and share their edges. The default comes from the design language (`true`). */
  attached?: Bind<boolean>;
  /** The default comes from the design language (`outline`). */
  variant?: Bind<ButtonVariant>;
  /** The default is `'md'`. */
  size?: Bind<ButtonSize>;
  /** Stretches to the full width, with the buttons sharing it. The default is `false`. */
  stretch?: Bind<boolean>;
  /** The accessible name of the group ("Text alignment"). */
  label?: Bind<string>;
  onValueChanged?: (e: ButtonGroupValueChangedEventArgs<T>) => void;
  onItemClick?: (e: ButtonGroupItemClickEventArgs<T>) => void;
}
