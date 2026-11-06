import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';

/** Props of `ComboBox`: the field props plus its own. Each prop is also a settable, reactive property. */
export interface ComboBoxProps<T, V> extends FieldProps<V | null> {
  /** Items in memory; searched here. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer; the search goes to it (`searchFields`). Wins over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  textField?: Bind<ItemField<T>>;
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Items in memory only. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  placeholder?: Bind<string>;
  /** Default `'contains'` (items in memory; a data source uses its own `searchOperator`). */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** Characters to type before the list opens. Default `0`. */
  minSearchLength?: Bind<number>;
  /** Milliseconds between the last key and the search. Default `0` in memory, `250` with a data source. */
  searchDelay?: Bind<number>;
  /** Text that matches no item becomes the value. Default `false`: it goes back to the chosen item. */
  acceptCustomValue?: Bind<boolean>;
  /** The first match is highlighted while typing, so Enter takes it. Default `true`. */
  autoHighlight?: Bind<boolean>;
  /** The arrow that opens the whole list. Default `true`. */
  showDropDownButton?: Bind<boolean>;
  clearButton?: Bind<boolean>;
  itemTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** Default `true`. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
