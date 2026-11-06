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

/** Props of `TreeView`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface TreeViewProps<T> extends ControlProps {
  /** Nested items (a `children` array) or flat ones (a `parentId`). A function is tracked; a reactive array is followed in place. */
  items?: Bind<readonly T[]>;
  /** Default `'text'` of an object item, the item itself otherwise. */
  textField?: Bind<ItemField<T>>;
  /** What names an item in `value`, `expandedKeys` and `checkedKeys`. Default `'id'`, the item itself without one. */
  keyField?: Bind<ItemField<T>>;
  /** Default `'children'`. */
  childrenField?: Bind<ItemField<T>>;
  /** Flat items: the key of the parent. Default `'parentId'`; giving it, or items with a `parentId`, makes the list flat. */
  parentField?: Bind<ItemField<T>>;
  /** Default `'icon'`: an image address, an element or a component. */
  iconField?: Bind<ItemField<T>>;
  /** Default `'enabled'`; `false` there: the row cannot be selected or checked. */
  enabledField?: Bind<ItemField<T>>;
  /** Default `'expanded'`; a change there opens or closes the row. */
  expandedField?: Bind<ItemField<T>>;
  /** With `loadChildren`: default `'hasChildren'`; `false` there means a leaf. */
  hasChildrenField?: Bind<ItemField<T>>;
  /** Loads the children of an item when it is first opened. */
  loadChildren?: Bind<TreeViewLoadChildren<T> | null>;
  /** Default `'single'`. */
  selectionMode?: Bind<TreeViewSelectionMode>;
  /** The selected key (`single`) or keys (`multiple`). `x-model` binds it two-way. */
  value?: Bind<unknown>;
  /** The open rows' keys. The change events report the new ones. */
  expandedKeys?: Bind<readonly unknown[]>;
  /** A check box on every row. */
  showCheckBoxes?: Bind<boolean>;
  /** Checking a parent checks its children; a parent is mixed when some are. Default `true`. */
  checkRecursive?: Bind<boolean>;
  /** The checked keys. `onCheckChanged` reports the new ones. */
  checkedKeys?: Bind<readonly unknown[]>;
  /** A search box at the top. */
  searchEnabled?: Bind<boolean>;
  /** Default `'contains'`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** The text the rows are filtered by: matches show with their parents, opened. */
  searchValue?: Bind<string>;
  /** Default `'expander'`: only the arrow and the keys open a branch. */
  expandOn?: Bind<TreeViewExpandOn>;
  /** Lines from each parent down to its children. */
  showLines?: Bind<boolean>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** The tree's accessible name. */
  label?: Bind<string>;
  /** More rows on screen than this: only the ones in view are drawn. Default 500. */
  virtualFrom?: Bind<number>;
  /** Draws a row's content; may return a cleanup. */
  itemTemplate?: Bind<TreeViewItemTemplate<T> | null>;
  /** About to open a branch; cancelable. */
  onExpanding?: (e: TreeViewExpandingEventArgs<T>) => void;
  /** About to close a branch; cancelable. */
  onCollapsing?: (e: TreeViewExpandingEventArgs<T>) => void;
  onExpanded?: (e: TreeViewExpandedEventArgs<T>) => void;
  onCollapsed?: (e: TreeViewExpandedEventArgs<T>) => void;
  onSelectionChanged?: (e: TreeViewSelectionChangedEventArgs<T>) => void;
  onCheckChanged?: (e: TreeViewCheckChangedEventArgs<T>) => void;
  onItemClick?: (e: TreeViewItemClickEventArgs<T>) => void;
}
