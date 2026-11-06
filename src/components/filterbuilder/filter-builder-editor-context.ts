import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderOperation } from './filter-builder-operation';

/**
 * The data passed to a custom editor: the condition, its value, and `setValue` to change it (kept when the editor
 * closes).
 */
export interface FilterBuilderEditorContext {
  field: FilterBuilderField;
  operation: FilterBuilderOperation;
  value: unknown;
  condition: FilterBuilderCondition;
  setValue: (value: unknown) => void;
  /** Keeps the value and closes the editor, as Enter does in it. `false` discards the value. */
  close: (keep?: boolean) => void;
  builder: FilterBuilder;
}
