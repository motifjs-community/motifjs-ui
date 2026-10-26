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

/** Props of `FilterBuilder`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface FilterBuilderProps extends ControlProps {
  /** The filter, as the data layer has it. `x-model` binds it two-way. */
  value?: Bind<data.FilterExpression | null>;
  /** The fields conditions are built on. */
  fields?: Bind<readonly FilterBuilderField[]>;
  /** Operations of your own, offered by name or by data type. */
  customOperations?: Bind<readonly FilterBuilderCustomOperation[]>;
  /** The operations a group can join with, in order; the first is a new group's. Default `['and', 'or', 'notAnd', 'notOr']`. */
  groupOperations?: Bind<readonly FilterBuilderGroupOperation[]>;
  /** How deep groups may go: `0` allows none, `1` groups in the root only… Default `null`, no limit. */
  maxGroupLevel?: Bind<number | null>;
  /** Fields with a dotted `dataField` (`customer.city`) show as submenus of their parts. Default `false`. */
  allowHierarchicalFields?: Bind<boolean>;
  /** The accessible name of the tree. Default: the `filterBuilderLabel` text. */
  label?: Bind<string>;
  /** Texts for this builder only, over `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** Locale of numbers and dates. Default: the page's language. */
  locale?: Bind<string>;
  /** Default `'sm'`. */
  size?: Bind<ControlSize>;
  /** Keys that add a condition to the focused row's group. Default `['Insert']`. */
  addKeys?: Bind<readonly string[]>;
  /** Keys that take out the focused row's condition or group. Default `['Delete']`. */
  removeKeys?: Bind<readonly string[]>;
  onValueChanged?: (e: FilterBuilderValueChangedEventArgs) => void;
  /** A condition or group is about to be added; cancelable. */
  onItemAdding?: (e: FilterBuilderItemAddingEventArgs) => void;
  onItemAdded?: (e: FilterBuilderItemAddedEventArgs) => void;
  /** A condition or group is about to be taken out; cancelable. */
  onItemRemoving?: (e: FilterBuilderItemRemovingEventArgs) => void;
  onItemRemoved?: (e: FilterBuilderItemRemovedEventArgs) => void;
  /** A field, operation, value or group operation is about to change; cancelable. */
  onItemChanging?: (e: FilterBuilderItemChangingEventArgs) => void;
  onItemChanged?: (e: FilterBuilderItemChangedEventArgs) => void;
  /** A value editor is about to be made; change it, replace it, or cancel it. */
  onEditorPreparing?: (e: FilterBuilderEditorPreparingEventArgs) => void;
  onEditorPrepared?: (e: FilterBuilderEditorPreparedEventArgs) => void;
}
