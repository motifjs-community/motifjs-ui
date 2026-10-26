import { defaultOperations } from '../../filterbuilder/default-operations';
import type { FilterBuilderCustomOperation } from '../../filterbuilder/filter-builder-custom-operation';
import type { FilterBuilderDataType } from '../../filterbuilder/filter-builder-data-type';
import type { FilterBuilderField } from '../../filterbuilder/filter-builder-field';
import type { FilterBuilderLookup } from '../../filterbuilder/filter-builder-lookup';
import type { GridColumn } from '../grid-column';
import type { GridModel } from './GridModel';
import { optionOf } from './option-of';

/**
 * The filter builder's fields of a grid: every column with `filterBuilder` on, hidden ones too, by
 * its type, a list or lookup column as a lookup, its values written as its cells write them. The
 * operations are the column's `filterOperators`, else those of its type with "is any of" and "is
 * none of" (the header filter's) and the custom operations for its type.
 */
export function builderFields<T>(model: GridModel<T>, customOperations: readonly FilterBuilderCustomOperation[] = []): FilterBuilderField[] {
  const out: FilterBuilderField[] = [];
  for (const col of model.columns.definitions()) {
    const field = col.field;
    if (!model.columns.can(field, 'filterBuilder')) continue;
    const dataType: FilterBuilderDataType = col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : col.type === 'boolean' ? 'boolean' : 'string';
    const options = col.type === 'list' && Array.isArray(col.options) ? col.options.map(optionOf) : null;
    const lookup: FilterBuilderLookup | undefined = col.lookup
      ? { dataSource: col.lookup.dataSource, valueField: col.lookup.valueField, textField: col.lookup.textField }
      : options
        ? { dataSource: options, valueField: 'value', textField: 'label' }
        : undefined;
    const own = col.filterOperators?.length ? [...col.filterOperators] : null;
    const byType = customOperations.filter((op) => op.dataTypes?.includes(dataType)).map((op) => op.name);
    out.push({
      dataField: field,
      caption: () => model.columns.title(field),
      dataType,
      lookup,
      filterOperations: own ?? [...defaultOperations(dataType, !!lookup), 'in', 'notin', ...byType],
      customizeText: (info) => valueText(model, col, info.value, info.valueText),
    });
  }
  return out;
}

/** A value as the column's cells write it; a lookup key as its item's text once it is known. */
function valueText<T>(model: GridModel<T>, col: GridColumn<T>, value: unknown, fallback: string): string {
  if (col.lookup) {
    const known = model.lookups.keyText(col, value);
    return known.state === 'loading' ? fallback : known.text;
  }
  return model.formatter.text(col, {} as T, value) || fallback;
}
