import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderOperation } from './filter-builder-operation';

const STRING_OPS: readonly FilterBuilderOperation[] = ['contains', 'notcontains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'];
const RANGE_OPS: readonly FilterBuilderOperation[] = ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'];
const LIST_OPS: readonly FilterBuilderOperation[] = ['=', '<>', 'isblank', 'isnotblank'];
const OBJECT_OPS: readonly FilterBuilderOperation[] = ['isblank', 'isnotblank'];

/** The operations a field offers by its data type when it names none; a lookup field the same whatever its type. */
export function defaultOperations(dataType: FilterBuilderDataType, lookup = false): readonly FilterBuilderOperation[] {
  if (lookup) return LIST_OPS;
  switch (dataType) {
    case 'number':
    case 'date':
    case 'datetime':
      return RANGE_OPS;
    case 'boolean':
      return LIST_OPS;
    case 'object':
      return OBJECT_OPS;
    default:
      return STRING_OPS;
  }
}
