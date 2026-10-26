import type { UiStrings } from '../../core/ui-strings';
import type { FilterBuilderCustomOperation } from './filter-builder-custom-operation';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderGroupOperation } from './filter-builder-group-operation';

/** What a `FilterBuilderModel` reads, each time it needs it. */
export interface FilterBuilderModelOptions {
  fields?: readonly FilterBuilderField[];
  customOperations?: readonly FilterBuilderCustomOperation[];
  groupOperations?: readonly FilterBuilderGroupOperation[];
  maxGroupLevel?: number | null;
  allowHierarchicalFields?: boolean;
  texts?: Partial<UiStrings>;
  locale?: string;
}
