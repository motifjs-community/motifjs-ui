import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';

/** Props of `ComboBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface ComboBoxProps<T, V> extends FieldProps<V | null> {
  /** In-memory items, searched on the client. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer, searched using its `searchFields`. This takes precedence over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  textField?: Bind<ItemField<T>>;
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Applies to in-memory items only. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  placeholder?: Bind<string>;
  /** The default is `'contains'` for in-memory items. A data source uses its own `searchOperator`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** The number of characters to type before the list opens. The default is `0`. */
  minSearchLength?: Bind<number>;
  /**
   * The delay, in milliseconds, between the last keystroke and the search. The default is `0` in memory and `250` with a
   * data source.
   */
  searchDelay?: Bind<number>;
  /** Text that matches no item becomes the value. The default is `false`, which reverts to the selected item. */
  acceptCustomValue?: Bind<boolean>;
  /** Highlights the first match during typing, so Enter accepts it. The default is `true`. */
  autoHighlight?: Bind<boolean>;
  /** The arrow that opens the whole list. The default is `true`. */
  showDropDownButton?: Bind<boolean>;
  clearButton?: Bind<boolean>;
  itemTemplate?: Bind<((item: T, host: HTMLElement) => (() => void) | void) | null>;
  /** The default is `true`. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
