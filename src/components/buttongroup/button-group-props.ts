import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ItemField } from '../../parts/list/item-field';
import type { ButtonSize } from '../button/button-size';
import type { ButtonVariant } from '../button/button-variant';
import type { ButtonGroupItem } from './button-group-item';
import type { ButtonGroupItemClickEventArgs } from './button-group-item-click-event-args';
import type { ButtonGroupSelection } from './button-group-selection';
import type { ButtonGroupValueChangedEventArgs } from './button-group-value-changed-event-args';

/** Props of `ButtonGroup`. Each one is also a settable property; a function is followed. */
export interface ButtonGroupProps<T = unknown> extends ControlProps {
  /** The buttons: `ButtonGroupItem`s, plain values (each its own text), or objects of your own shape with `itemText` / `itemValue`. */
  items?: Bind<readonly (ButtonGroupItem<T> | T)[]>;
  /** Where an item keeps its text: a property name or a function. Default `'text'`. Not a binding: a function here is the reader. */
  itemText?: ItemField<ButtonGroupItem<T> | T>;
  /** Where an item keeps its value: a property name or a function. Default `'value'`. Not a binding: a function here is the reader. */
  itemValue?: ItemField<ButtonGroupItem<T> | T>;
  /** Default `'single'`. */
  selection?: Bind<ButtonGroupSelection>;
  /** The chosen value (`single`) or an array of the values turned on (`multiple`). Two-way with `x-model`. */
  value?: Bind<T | readonly T[] | null>;
  /** `single`: pressing the chosen button again leaves none chosen. Default `false`. */
  allowEmpty?: Bind<boolean>;
  /** The buttons touch, sharing their edges. Default: the design language's (`true`). */
  attached?: Bind<boolean>;
  /** Default: the design language's (`outline`). */
  variant?: Bind<ButtonVariant>;
  /** Default `'md'`. */
  size?: Bind<ButtonSize>;
  /** Fills the width, the buttons sharing it. Default `false`. */
  stretch?: Bind<boolean>;
  /** What screen readers call the group ("Text alignment"). */
  label?: Bind<string>;
  onValueChanged?: (e: ButtonGroupValueChangedEventArgs<T>) => void;
  onItemClick?: (e: ButtonGroupItemClickEventArgs<T>) => void;
}
