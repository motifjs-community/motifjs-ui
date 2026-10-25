import { data } from '@motifx-community/data';
import type { GridExportOptions } from '../grid-export-options';
import { writeDelimited } from './delimited-text';
import type { ExportTable } from './export-table';
import type { GridModel } from './GridModel';
import type { GroupNode } from './group-node';
import type { PlacedItem } from './placed-item';
import { listSeparator } from './list-separator';

const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * The rows of an export: every row of the filter in the sort order, with the visible exportable
 * columns in display order. Rows in memory are taken as they are; a server's come in parts through
 * the data source (`loadRange`), so its own filter, search and sort apply. Cells read like the grid
 * shows them, unsaved edits included; new rows not saved yet are not data and stay out. Grouped,
 * the rows come in group order, every group open, and the CSV has a "Column: value" line per group.
 * The summaries come as the grid shows them: group footers after their rows, the totals last.
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
    const summaries = !options.selected && options.summaries !== false;
    // Lookup cells and groups export their texts: every key of the rows is resolved first.
    const grouped = view ? model.groups.fields().map((f) => model.columns.get(f)) : [];
    const lookups = [...cols, ...grouped].filter((c, i, all) => c.lookup && !c.textFrom && all.indexOf(c) === i);
    if ((shown || view) && lookups.length) await model.lookups.load(lookups, rows.map((row) => ({ ...(row as object), ...(model.edit(model.rowIdOf(row))?.draft ?? {}) }) as T));
    const s = model.summaries;
    const raw = !shown;
    const groupItems = summaries ? s.groupItems().filter((i) => i.visible) : [];
    const totalItems = summaries ? s.totalItems() : [];
    const nodes = view?.allGroups() ?? [];
    const footers = groupItems.some((i) => i.footer) ? nodes.map((node) => ({ at: node.start + node.count, level: node.level, cells: this.cells(fields, groupItems.filter((i) => i.footer), s.groupValues(node), raw) })) : undefined;
    return {
      groups: nodes.map((node) => this.groupLine(node, fields, groupItems.filter((i) => !i.footer), raw)),
      footers: footers?.sort((a, b) => a.at - b.at || b.level - a.level),
      total: totalItems.some((i) => i.visible) ? this.cells(fields, totalItems, s.total, raw) : undefined,
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
    const footers = table.footers ?? [];
    const lines: string[][] = [];
    let g = 0;
    let f = 0;
    const closeGroups = (i: number) => {
      for (; f < footers.length && footers[f].at <= i; f++) lines.push(footers[f].cells.map(safe));
    };
    table.rows.forEach((cells, i) => {
      closeGroups(i);
      // A group's line before its first row, its text in the first column.
      for (; g < groups.length && groups[g].at <= i; g++) lines.push([safe(groups[g].text), ...groups[g].cells.slice(1).map(safe)]);
      lines.push(
        cells.map((value, j) => {
          const text = raw ? formatter.raw(cols[j], value) : String(value ?? '');
          return cols[j].type !== 'number' && typeof value !== 'number' ? safe(text) : text;
        }),
      );
    });
    closeGroups(Number.POSITIVE_INFINITY);
    if (table.total) lines.push(table.total.map(safe));
    const head = options.headers !== false ? [table.fields.map((f) => model.columns.title(f))] : [];
    const separator = options.separator ?? listSeparator(formatter.locale);
    return `${options.bom !== false ? '﻿' : ''}${writeDelimited([...head, ...lines], separator)}\r\n`;
  }

  /** The summary lines of a table as objects by field, in the order they come: footers after their rows, the totals last. */
  summaryObjects(table: ExportTable): { after: number; values: Record<string, string> }[] {
    const of = (cells: string[]) => Object.fromEntries(table.fields.map((f, j) => [f, cells[j]]));
    const out = (table.footers ?? []).map((footer) => ({ after: footer.at, values: of(footer.cells) }));
    if (table.total) out.push({ after: table.rows.length, values: of(table.total) });
    return out;
  }

  /** Summary items under their columns, as cells by field; several in a cell one per line. */
  private cells(fields: readonly string[], items: readonly PlacedItem[], values: readonly unknown[], raw: boolean): string[] {
    const { model } = this;
    return fields.map((field) => {
      const texts: string[] = [];
      for (const i of items) {
        if (!i.visible || i.place !== field) continue;
        const value = values[i.index];
        const col = i.field !== undefined && model.columns.defs.has(i.field) ? model.columns.get(i.field) : null;
        const text = raw ? (data.isEmpty(value) ? '' : col ? model.formatter.raw(col, value) : String(value)) : model.summaries.text(i, value, i.place !== i.field);
        if (text) texts.push(text);
      }
      return texts.join('\n');
    });
  }

  /** A group's line: "Column: value", its summary items after it, those aligned by column under their columns. */
  private groupLine(node: GroupNode, fields: readonly string[], items: readonly PlacedItem[], raw: boolean) {
    const { model } = this;
    const s = model.summaries;
    const values = items.length ? s.groupValues(node) : [];
    const under = items.filter((i) => i.align && i.place !== undefined && fields.indexOf(i.place) > 0);
    const inText = items.filter((i) => !under.includes(i)).map((i) => s.text(i, values[i.index], i.field !== node.field)).filter(Boolean);
    const separator = model.text('gridSummarySeparator');
    const text = model.groupCaption(node) + (inText.length ? separator + inText.join(separator) : '');
    return { at: node.start, text, level: node.level, cells: this.cells(fields, under, values, raw) };
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
    const size = Math.max(1, Math.floor(options.pageSize ?? this.model.settings.get('exportPageSize')));
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
