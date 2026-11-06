import type { ComponentBase, EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderOperation } from './filter-builder-operation';

/**
 * Provides data for the event that occurs before a value editor is created. Change the kit editor props (`options`),
 * provide a custom component (`editor`, which calls `setValue`), or set `cancel` for no editor.
 */
export interface FilterBuilderEditorPreparingEventArgs extends EventArgs {
  field: FilterBuilderField;
  operation: FilterBuilderOperation;
  value: unknown;
  condition: FilterBuilderCondition;
  /** `'from'` and `'to'` for the two editors of `between`, and otherwise `'value'`. */
  part: 'value' | 'from' | 'to';
  options: Record<string, unknown>;
  editor: ComponentBase | null;
  setValue: (value: unknown) => void;
  source: FilterBuilder;
}
