import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { RadioGroupOrientation } from './radio-group-orientation';
import type { RadioItem } from './radio-item';

/** Props of `RadioGroup`. Each one is also a settable, reactive property. */
export interface RadioGroupProps<T = unknown> extends FieldProps<T | null> {
  /** The options: `RadioItem`s, plain values (each its own text), or objects of your own shape with `itemText` / `itemValue`. */
  items?: Bind<readonly (RadioItem<T> | T)[]>;
  /** Where an item keeps its text: a property name or a function. Default `'text'`. Not a binding: a function here is the reader. */
  itemText?: ItemField<RadioItem<T> | T>;
  /** Where an item keeps its value: a property name or a function. Default `'value'`. Not a binding: a function here is the reader. */
  itemValue?: ItemField<RadioItem<T> | T>;
  /** Default `'vertical'`. */
  orientation?: Bind<RadioGroupOrientation>;
  /** Lays the options out in this many columns. Default `0`: no grid. */
  columns?: Bind<number>;
  /** The name the radios are sent with in a form. Default: a generated one. */
  name?: Bind<string>;
}
