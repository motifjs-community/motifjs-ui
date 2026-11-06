import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ItemField } from '../../parts/list/item-field';
import type { TreeViewCheckChangedEventArgs } from './tree-view-check-changed-event-args';
import type { TreeViewExpandOn } from './tree-view-expand-on';
import type { TreeViewExpandedEventArgs } from './tree-view-expanded-event-args';
import type { TreeViewExpandingEventArgs } from './tree-view-expanding-event-args';
import type { TreeViewItemClickEventArgs } from './tree-view-item-click-event-args';
import type { TreeViewItemTemplate } from './tree-view-item-template';
import type { TreeViewLoadChildren } from './tree-view-load-children';
import type { TreeViewSelectionChangedEventArgs } from './tree-view-selection-changed-event-args';
import type { TreeViewSelectionMode } from './tree-view-selection-mode';

/** Props of `TreeView`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface TreeViewProps<T> extends ControlProps {
  /**
   * Nested items with a `children` array, or flat items with a `parentId`. A function is tracked, and a reactive array
   * is followed in place.
   */
  items?: Bind<readonly T[]>;
  /** The default is `'text'` for an object item, and the item itself otherwise. */
  textField?: Bind<ItemField<T>>;
  /**
   * Identifies an item in `value`, `expandedKeys` and `checkedKeys`. The default is `'id'`, or the item itself without
   * one.
   */
  keyField?: Bind<ItemField<T>>;
  /** The default is `'children'`. */
  childrenField?: Bind<ItemField<T>>;
  /**
   * For flat items, the key of the parent. The default is `'parentId'`. Setting it, or items with a `parentId`, makes
   * the list flat.
   */
  parentField?: Bind<ItemField<T>>;
  /** The default is `'icon'`: an image address, an element or a component. */
  iconField?: Bind<ItemField<T>>;
  /** The default is `'enabled'`. With `false` in this field, the row cannot be selected or checked. */
  enabledField?: Bind<ItemField<T>>;
  /** The default is `'expanded'`. A change in this field expands or collapses the row. */
  expandedField?: Bind<ItemField<T>>;
  /** With `loadChildren`, the default is `'hasChildren'`. `false` in this field marks a leaf. */
  hasChildrenField?: Bind<ItemField<T>>;
  /** Loads the children of a row when it is first expanded. */
  loadChildren?: Bind<TreeViewLoadChildren<T> | null>;
  /** The default is `'single'`. */
  selectionMode?: Bind<TreeViewSelectionMode>;
  /** The selected key (`single`) or keys (`multiple`). `x-model` provides two-way binding. */
  value?: Bind<unknown>;
  /** The keys of the expanded rows. The change events report the new ones. */
  expandedKeys?: Bind<readonly unknown[]>;
  /** Adds a check box to every row. */
  showCheckBoxes?: Bind<boolean>;
  /** Checking a parent checks its children, and a parent is mixed when only some are checked. The default is `true`. */
  checkRecursive?: Bind<boolean>;
  /** The checked keys. `onCheckChanged` reports changes. */
  checkedKeys?: Bind<readonly unknown[]>;
  /** Adds a search box at the top. */
  searchEnabled?: Bind<boolean>;
  /** The default is `'contains'`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** The text used to filter rows. Matches appear with their parents expanded. */
  searchValue?: Bind<string>;
  /** The default, `'expander'`, means that only the expander and the keyboard expand a branch. */
  expandOn?: Bind<TreeViewExpandOn>;
  /** Draws connector lines from each parent to its children. */
  showLines?: Bind<boolean>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** The accessible name of the tree. */
  label?: Bind<string>;
  /** When more rows than this are on screen, only the visible rows are rendered. The default is 500. */
  virtualFrom?: Bind<number>;
  /** Customizes the content of a row. It can return a cleanup function. */
  itemTemplate?: Bind<TreeViewItemTemplate<T> | null>;
  /** Occurs before a branch expands. This event is cancelable. */
  onExpanding?: (e: TreeViewExpandingEventArgs<T>) => void;
  /** Occurs before a branch collapses. This event is cancelable. */
  onCollapsing?: (e: TreeViewExpandingEventArgs<T>) => void;
  onExpanded?: (e: TreeViewExpandedEventArgs<T>) => void;
  onCollapsed?: (e: TreeViewExpandedEventArgs<T>) => void;
  onSelectionChanged?: (e: TreeViewSelectionChangedEventArgs<T>) => void;
  onCheckChanged?: (e: TreeViewCheckChangedEventArgs<T>) => void;
  onItemClick?: (e: TreeViewItemClickEventArgs<T>) => void;
}
