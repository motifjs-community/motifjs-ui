import type { ComponentBase } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderOperation } from './filter-builder-operation';

/** A value editor was made and placed. */
export interface FilterBuilderEditorPreparedEventArgs {
  field: FilterBuilderField;
  operation: FilterBuilderOperation;
  condition: FilterBuilderCondition;
  part: 'value' | 'from' | 'to';
  editor: ComponentBase;
  source: FilterBuilder;
}
