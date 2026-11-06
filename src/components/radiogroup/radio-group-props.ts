import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { RadioGroupOrientation } from './radio-group-orientation';
import type { RadioItem } from './radio-item';

/** Props of `RadioGroup`. Each prop is also a settable, reactive property. */
export interface RadioGroupProps<T = unknown> extends FieldProps<T | null> {
  /**
   * The options: `RadioItem` objects, plain values that serve as their own text, or custom objects with `itemText` /
   * `itemValue`.
   */
  items?: Bind<readonly (RadioItem<T> | T)[]>;
  /**
   * The location of the text in an item: a property name or a function. The default is `'text'`. A function here is a
   * reader, not a binding.
   */
  itemText?: ItemField<RadioItem<T> | T>;
  /**
   * The location of the value in an item: a property name or a function. The default is `'value'`. A function here is a
   * reader, not a binding.
   */
  itemValue?: ItemField<RadioItem<T> | T>;
  /** The default is `'vertical'`. */
  orientation?: Bind<RadioGroupOrientation>;
  /** Arranges the options in a grid with this many columns. The default, `0`, uses no grid. */
  columns?: Bind<number>;
  /** The name the radios submit with the form. By default, a name is generated. */
  name?: Bind<string>;
}
