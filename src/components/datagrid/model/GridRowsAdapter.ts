import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import type { RowsSorting } from './rows-sorting';

/**
 * The adapter the grid puts its `rows` in: an `ArrayAdapter` that sorts and filters by the columns'
 * own `value` readers, sorts with their `compare` functions, and gives a new row the next number when
 * the key is a number field. Field types come from the columns on each query. `sorting` can read a column another way for sorting (a lookup's text)
 * and wait for what that needs before the rows are sorted.
 */
export class GridRowsAdapter<T extends object> extends data.ArrayAdapter<T, unknown> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    column: (field: string) => GridColumn<T>,
    private readonly sorting?: RowsSorting<T>,
    /** The type of each field, read on every query (columns come and go). */
    private readonly fieldTypes?: () => Readonly<Record<string, data.FieldType>>,
  ) {
    super({
      createKey: (_values, rows) => {
        const field = typeof options.key === 'string' ? options.key : '';
        let max = 0;
        for (const row of rows) {
          const key = data.getField(row, field);
          if (typeof key !== 'number') throw data.DataError.create('MJD304', { operation: 'insert' });
          if (key > max) max = key;
        }
        return max + 1;
      },
      sortValue: (field) => (sorting ? sorting.sortValue(field) : column(field).value),
      filterValue: (field) => column(field).value,
      compare: (field) => column(field).compare ?? sorting?.compare?.(field),
      ...options,
    });
  }

  override get evaluateContext(): data.EvaluateContext {
    const context = super.evaluateContext;
    return this.fieldTypes ? { ...context, fields: { ...context.fields, ...this.fieldTypes() } } : context;
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<T>> {
    if (this.sorting && options.sort?.length) await this.sorting.beforeSort(options.sort, this.rows);
    return super.loadRows(options);
  }
}
