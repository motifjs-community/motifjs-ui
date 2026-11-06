import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';

/** Props of `DropDown`: the field props plus its own. Each prop is also a settable, reactive property. */
export interface DropDownProps<T, V> extends FieldProps<V | null> {
  /** Plain values, `DropDownItem`s, or objects of your own read through the `…Field` props. A function is tracked. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer; the search box searches it (`searchFields`). Wins over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  /**
   * The value's text while its item is requested from `dataSource` (the record often carries it:
   * `valueText={() => order.customerName}`): the field shows it at once instead of waiting.
   */
  valueText?: Bind<string>;
  /** Milliseconds between the last key in the search box and a data source search. Default `250`. */
  searchDelay?: Bind<number>;
  /** Default `'text'` of an object item, the item itself otherwise. */
  textField?: Bind<ItemField<T>>;
  /** Default `'value'` when the object has one, the item itself otherwise. */
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Items with the same group follow each other under its name. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  placeholder?: Bind<string>;
  /** A search box at the top of the list. */
  searchEnabled?: Bind<boolean>;
  /** Default `'contains'`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  clearButton?: Bind<boolean>;
  /** Draws an option's content; may return a cleanup. */
  itemTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** Draws the chosen item in the field; may return a cleanup. */
  fieldTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** Default `true`: the list is at least as wide as the field. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
