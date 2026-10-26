import type { ComponentBase, EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderOperation } from './filter-builder-operation';

/**
 * A value editor is about to be made: change the props of the kit editor (`options`), give a
 * component of your own (`editor`, which calls `setValue`), or `cancel` to open none.
 */
export interface FilterBuilderEditorPreparingEventArgs extends EventArgs {
  field: FilterBuilderField;
  operation: FilterBuilderOperation;
  value: unknown;
  condition: FilterBuilderCondition;
  /** `'from'` and `'to'` for the two editors of `between`, else `'value'`. */
  part: 'value' | 'from' | 'to';
  options: Record<string, unknown>;
  editor: ComponentBase | null;
  setValue: (value: unknown) => void;
  source: FilterBuilder;
}
