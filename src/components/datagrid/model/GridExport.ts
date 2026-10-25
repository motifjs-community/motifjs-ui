import { data } from '@motifx-community/data';
import type { GridExportOptions } from '../grid-export-options';
import { writeDelimited } from './delimited-text';
import type { ExportTable } from './export-table';
import type { GridModel } from './GridModel';
import { listSeparator } from './list-separator';

const DEFAULT_PAGE_SIZE = 1000;
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * The rows of an export: every row of the filter in the sort order, with the visible exportable
 * columns in display order. Rows in memory are taken as they are; a server's come in parts through
 * the data source (`loadRange`), so its own filter, search and sort apply. Cells read like the grid
 * shows them, unsaved edits included; new rows not saved yet are not data and stay out. Grouped,
 * the rows come in group order, every group open, and the CSV has a "Column: value" line per group.
 */
export class GridExport<T> {
  constructor(private readonly model: GridModel<T>) {}

  fields(): string[] {
    const cols = this.model.columns;
    return cols.visibleData().filter((f) => cols.can(f, 'exportable'));
  }

  async table(options: GridExportOptions, signal: AbortSignal): Promise<ExportTable> {
    const { model } = this;
    const fields = this.fields();
    const cols = fields.map((f) => model.columns.get(f));
    const shown = options.values !== 'raw';
    const rows = await this.rows(options, signal);
    const view = !options.selected && options.groups !== false ? model.data.groupView() : null;
    // Lookup cells and groups export their texts: every key of the rows is resolved first.
    const grouped = view ? model.groups.fields().map((f) => model.columns.get(f)) : [];
    const lookups = [...cols, ...grouped].filter((c, i, all) => c.lookup && !c.textFrom && all.indexOf(c) === i);
    if ((shown || view) && lookups.length) await model.lookups.load(lookups, rows.map((row) => ({ ...(row as object), ...(model.edit(model.rowIdOf(row))?.draft ?? {}) }) as T));
    return {
      groups: view?.allGroups().map((node) => ({ at: node.start, text: model.groupCaption(node), level: node.level })),
      fields,
      rows: rows.map((row) => {
        const rowId = model.rowIdOf(row);
        return cols.map((col) => {
          const value = model.value(rowId, row, col);
          return shown ? model.shownText(rowId, row, col, value) : value;
        });
      }),
    };
  }

  /** The table as CSV text, for a spreadsheet: a byte order mark, the locale's separator, titles first. */
  csv(table: ExportTable, options: GridExportOptions): string {
    const { model } = this;
    const formatter = model.formatter;
    const cols = table.fields.map((f) => model.columns.get(f));
    const raw = options.values === 'raw';
    const guard = options.escapeFormulas !== false;
    const safe = (text: string) => (guard && FORMULA_START.test(text) ? `'${text}` : text);
    const groups = table.groups ?? [];
    const lines: string[][] = [];
    let g = 0;
    table.rows.forEach((cells, i) => {
      // A group's line before its first row, its text in the first column.
      for (; g < groups.length && groups[g].at <= i; g++) lines.push([safe(groups[g].text), ...table.fields.slice(1).map(() => '')]);
      lines.push(
        cells.map((value, j) => {
          const text = raw ? formatter.raw(cols[j], value) : String(value ?? '');
          return cols[j].type !== 'number' && typeof value !== 'number' ? safe(text) : text;
        }),
      );
    });
    const head = options.headers !== false ? [table.fields.map((f) => model.columns.title(f))] : [];
    const separator = options.separator ?? listSeparator(formatter.locale);
    return `${options.bom !== false ? '﻿' : ''}${writeDelimited([...head, ...lines], separator)}\r\n`;
  }

  /** Saves text as a file through a link the browser downloads. */
  download(text: string, fileName: string) {
    if (typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async rows(options: GridExportOptions, signal: AbortSignal): Promise<T[]> {
    const { model } = this;
    const source = model.data.source;
    const sel = model.selection;
    const selected = !!options.selected;
    if (selected && (model.settings.get('selection') === 'none' || sel.empty)) return [];
    const grouped = model.data.groupedRows();
    if (grouped) {
      const rows = selected ? grouped.filter((row) => sel.isSelected(model.selectId(row))) : [...grouped];
      options.onProgress?.(rows.length, rows.length);
      return rows;
    }
    if (source.loadMode === 'all') {
      const rows = selected ? source.rows.filter((row) => sel.isSelected(model.selectId(row))) : [...source.rows];
      options.onProgress?.(rows.length, rows.length);
      return rows;
    }
    let filter: data.FilterExpression | null = null;
    if (selected) {
      const keys = source.adapter.keys.fields;
      const state = sel.snapshot();
      if (keys?.length !== 1) return this.loadedSelected();
      filter = state.all ? (state.except.length ? data.not(data.where(keys[0], 'in', state.except)) : null) : data.where(keys[0], 'in', state.keys);
    }
    const size = Math.max(1, Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE));
    const out: T[] = [];
    let total = Number.POSITIVE_INFINITY;
    for (let skip = 0; skip < total; skip += size) {
      const part = await source.loadRange({ skip, take: size, filter, count: skip === 0, signal });
      if (skip === 0 && part.total !== undefined) total = part.total;
      for (const row of part.rows) out.push(row);
      options.onProgress?.(out.length, Number.isFinite(total) ? total : out.length);
      if (part.rows.length < size) break;
    }
    return out;
  }

  /** Selected rows that are loaded, when the key is not one field and the server cannot be asked for them. */
  private loadedSelected(): T[] {
    const { model } = this;
    const rows: T[] = [];
    model.data.forEachLoaded((row) => {
      if (model.selection.isSelected(model.selectId(row))) rows.push(row);
    });
    return rows;
  }
}
