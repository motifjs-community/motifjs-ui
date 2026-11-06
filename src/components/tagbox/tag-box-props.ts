import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ItemTemplate } from '../listbox/item-template';

/** Props of `TagBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface TagBoxProps<T, V> extends FieldProps<V[]> {
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
  /** Displayed when no item is selected. */
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
  /** Pressing Enter adds text that matches no item as a new tag. */
  acceptCustomValue?: Bind<boolean>;
  /**
   * Creates the value for typed text (`acceptCustomValue`). Returning `null` rejects it. The default is the text
   * itself.
   */
  customValue?: Bind<((text: string) => V | null) | null>;
  /**
   * Highlights the first match during typing, so Enter accepts it. The default is `true` (`false` with
   * `acceptCustomValue`).
   */
  autoHighlight?: Bind<boolean>;
  /** Closes the list when an item is selected. The default is `false`. */
  closeOnSelect?: Bind<boolean>;
  /** The number of tags shown. The rest are counted in one more tag ("+3"). The default, `0`, shows all. */
  maxTags?: Bind<number>;
  /** The maximum number of selectable items. The default, `0`, means no limit. */
  maxSelected?: Bind<number>;
  /** Adds a "Select all" row before the items. */
  selectAll?: Bind<boolean>;
  /** Removes selected items from the list (in-memory items only). */
  hideSelected?: Bind<boolean>;
  /** Clicking the field opens the list. The default is `true`. */
  openOnFieldClick?: Bind<boolean>;
  /** The arrow that opens the whole list. The default is `true`. */
  showDropDownButton?: Bind<boolean>;
  /** A button that removes all tags. Escape does the same while the list is closed. */
  clearButton?: Bind<boolean>;
  itemTemplate?: Bind<ItemTemplate<T> | null>;
  /** Customizes how a tag is drawn, instead of the item's text. */
  tagTemplate?: Bind<ItemTemplate<T> | null>;
  /** The default is `true`. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
