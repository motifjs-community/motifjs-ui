import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import type { ListChoices } from './ListChoices';

/** A choice as the lists show it. */
export interface ChoiceRow {
  value: unknown;
  text: string;
}

/**
 * The choices of a list column as a data-layer adapter, so a drop-down or the filter builder says it is loading while
 * a function's answer is on its way. `first` leads the list (the filter row's "(All)"). Searching, sorting and paging
 * run over the choices in memory.
 */
export class ChoiceListAdapter<T> extends data.DataAdapter<ChoiceRow, unknown> {
  constructor(
    private readonly choices: ListChoices<T>,
    private readonly column: GridColumn<T>,
    private readonly first: ChoiceRow | null = null,
  ) {
    super({ key: 'value' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: true, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<ChoiceRow>> {
    const rows = await this.rows();
    return new data.ArrayAdapter<ChoiceRow, unknown>({ data: rows, key: 'value' }).load(options);
  }

  protected override async findRow(key: unknown): Promise<ChoiceRow | undefined> {
    return (await this.rows()).find((row) => Object.is(row.value, key) || String(row.value) === String(key));
  }

  private async rows(): Promise<ChoiceRow[]> {
    const options = (await this.choices.load(this.column)).map((o) => ({ value: o.value, text: o.label }));
    return this.first ? [this.first, ...options] : options;
  }
}
