import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';

/** Props of `DropDown`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface DropDownProps<T, V> extends FieldProps<V | null> {
  /** Plain values, `DropDownItem` objects, or custom objects read through the `…Field` props. A function is tracked. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer, searched using its `searchFields`. This takes precedence over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  /**
   * The display text for the value while its item is requested from `dataSource`, shown immediately instead of
   * waiting. Use it when a record already has the name: `valueText={() => order.customerName}`.
   */
  valueText?: Bind<string>;
  /**
   * The delay, in milliseconds, between the last keystroke in the search box and a data source search. The default is
   * `250`.
   */
  searchDelay?: Bind<number>;
  /** The default is `'text'` for an object item, and the item itself otherwise. */
  textField?: Bind<ItemField<T>>;
  /** The default is `'value'` when the object has one, and the item itself otherwise. */
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Options in the same group appear together under its name. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  placeholder?: Bind<string>;
  /** Adds a search box at the top of the list. */
  searchEnabled?: Bind<boolean>;
  /** The default is `'contains'`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  clearButton?: Bind<boolean>;
  /** Customizes how an option is drawn. It can return a cleanup function. */
  itemTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** Customizes how the selected item is drawn in the field. It can return a cleanup function. */
  fieldTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** The list is at least as wide as the field. The default is `true`. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
