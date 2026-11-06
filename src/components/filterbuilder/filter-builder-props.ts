import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { UiStrings } from '../../core/ui-strings';
import type { FilterBuilderCustomOperation } from './filter-builder-custom-operation';
import type { FilterBuilderEditorPreparedEventArgs } from './filter-builder-editor-prepared-event-args';
import type { FilterBuilderEditorPreparingEventArgs } from './filter-builder-editor-preparing-event-args';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderGroupOperation } from './filter-builder-group-operation';
import type { FilterBuilderItemAddedEventArgs } from './filter-builder-item-added-event-args';
import type { FilterBuilderItemAddingEventArgs } from './filter-builder-item-adding-event-args';
import type { FilterBuilderItemChangedEventArgs } from './filter-builder-item-changed-event-args';
import type { FilterBuilderItemChangingEventArgs } from './filter-builder-item-changing-event-args';
import type { FilterBuilderItemRemovedEventArgs } from './filter-builder-item-removed-event-args';
import type { FilterBuilderItemRemovingEventArgs } from './filter-builder-item-removing-event-args';
import type { FilterBuilderValueChangedEventArgs } from './filter-builder-value-changed-event-args';

/** Props of `FilterBuilder`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface FilterBuilderProps extends ControlProps {
  /** The filter, in data layer format. `x-model` provides two-way binding. */
  value?: Bind<data.FilterExpression | null>;
  /** The fields conditions are built on. */
  fields?: Bind<readonly FilterBuilderField[]>;
  /** Custom operations, offered by name or by data type. */
  customOperations?: Bind<readonly FilterBuilderCustomOperation[]>;
  /**
   * The operations a group can use, in order. The first is the default for a new group.
   * The default is `['and', 'or', 'notAnd', 'notOr']`.
   */
  groupOperations?: Bind<readonly FilterBuilderGroupOperation[]>;
  /**
   * The depth of groups: `0` allows no groups, `1` allows groups in the root only, and so on. The default, `null`,
   * means no limit.
   */
  maxGroupLevel?: Bind<number | null>;
  /** Shows fields with a dotted `dataField` (`customer.city`) as submenus of their parts. The default is `false`. */
  allowHierarchicalFields?: Bind<boolean>;
  /** The accessible name of the tree. The default is the `filterBuilderLabel` string. */
  label?: Bind<string>;
  /** Strings for this builder only, which override `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** The locale of numbers and dates. The default is the language of the page. */
  locale?: Bind<string>;
  /** The default is `'sm'`. */
  size?: Bind<ControlSize>;
  /** Keys that add a condition to the focused row's group. The default is `['Insert']`. */
  addKeys?: Bind<readonly string[]>;
  /** Keys that remove the focused row's condition or group. The default is `['Delete']`. */
  removeKeys?: Bind<readonly string[]>;
  onValueChanged?: (e: FilterBuilderValueChangedEventArgs) => void;
  /** Occurs before a condition or group is added. This event is cancelable. */
  onItemAdding?: (e: FilterBuilderItemAddingEventArgs) => void;
  onItemAdded?: (e: FilterBuilderItemAddedEventArgs) => void;
  /** Occurs before a condition or group is removed. This event is cancelable. */
  onItemRemoving?: (e: FilterBuilderItemRemovingEventArgs) => void;
  onItemRemoved?: (e: FilterBuilderItemRemovedEventArgs) => void;
  /** Occurs before a field, operation, value or group operation changes. This event is cancelable. */
  onItemChanging?: (e: FilterBuilderItemChangingEventArgs) => void;
  onItemChanged?: (e: FilterBuilderItemChangedEventArgs) => void;
  /** Occurs before a value editor is created. It can be changed, replaced or canceled. */
  onEditorPreparing?: (e: FilterBuilderEditorPreparingEventArgs) => void;
  onEditorPrepared?: (e: FilterBuilderEditorPreparedEventArgs) => void;
}
