import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import type { GridExportCell } from '../grid-export-cell';
import type { GridExportOptions } from '../grid-export-options';
import type { GridSheet } from '../grid-sheet';
import type { GridSheetCell } from '../grid-sheet-cell';
import type { GridSheetMerge } from '../grid-sheet-merge';
import type { GridSheetOptions } from '../grid-sheet-options';
import type { GridSheetRow } from '../grid-sheet-row';
import { writeDelimited } from './delimited-text';
import type { ExportTable } from './export-table';
import { guardFormula } from './formula-guard';
import type { GridModel } from './GridModel';
import type { GroupNode } from './group-node';
import type { GroupView } from './GroupView';
import type { PlacedItem } from './placed-item';
import { listSeparator } from './list-separator';

/** A summary item with its value, as one cell shows it. */
type Entry = { item: PlacedItem; value: unknown; text: string };

/** What `sheet()` needs from the grid besides the options. */
type SheetRun = GridSheetOptions & { selected: boolean; rtl: boolean; widthOf: (field: string) => number };

/**
 * The rows of an export: every row of the filter in the sort order, with the visible exportable
 * columns in display order. Rows in memory are taken as they are; a server's come in parts through
 * the data source (`loadRange`), so its own filter, search and sort apply. Cells read like the grid
 * shows them, unsaved edits included; new rows not saved yet are not data and stay out. Grouped,
 * the rows come in group order, every group open, and the CSV has a "Column: value" line per group.
 * The summaries come as the grid shows them: group footers after their rows, the totals last. With
 * bands, their titles come in rows above the columns' titles. Columns the width hides are exported.
 */
export class GridExport<T> {
  constructor(private readonly model: GridModel<T>) {}

  fields(): string[] {
    const cols = this.model.columns;
    return cols.listedData().filter((f) => cols.can(f, 'exportable'));
  }

  /** The bands over the exported columns, a list per level from the top: each band and the columns it spans. */
  bandRows(fields: readonly string[]): { id: string; title: string; first: number; count: number }[][] {
    const cols = this.model.columns;
    if (!cols.hasBands) return [];
    const shown = cols.shownBands(fields);
    let depth = 0;
    for (const b of shown) depth = Math.max(depth, b.depth);
    const rows: { id: string; title: string; first: number; count: number }[][] = Array.from({ length: depth }, () => []);
    for (const b of shown) rows[b.depth - 1].push({ id: b.id, title: cols.title(b.id), first: b.first, count: b.count });
    for (const row of rows) row.sort((a, b) => a.first - b.first);
    return rows;
  }

  async table(options: GridExportOptions, signal: AbortSignal): Promise<ExportTable> {
    const { model } = this;
    const fields = this.fields();
    const cols = fields.map((f) => model.columns.get(f));
    const shown = options.values !== 'raw';
    const rows = await this.rows(options, signal);
    const view = !options.selected && options.groups !== false ? model.data.groupView() : null;
    const summaries = !options.selected && options.summaries !== false;
    if (shown || view) await this.loadTexts(cols, view, rows);
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

  /**
   * The rows as a sheet of typed cells, for a file writer: numbers, dates and yes/no stay values;
   * lookups, lists and columns with a `format` function are their texts; summaries are their texts,
   * with their values beside them for `customizeCell`.
   */
  async sheet(options: SheetRun, signal: AbortSignal): Promise<GridSheet<T>> {
    const { model } = this;
    const fields = this.fields();
    const cols = fields.map((f) => model.columns.get(f));
    const { selected } = options;
    const rows = await this.rows({ selected, pageSize: options.pageSize, onProgress: options.onProgress }, signal);
    const view = !selected && options.groups !== false ? model.data.groupView() : null;
    const summaries = !selected && options.summaries !== false;
    await this.loadTexts(cols, view, rows);
    const s = model.summaries;
    const formatter = model.formatter;
    const groupItems = summaries ? s.groupItems().filter((i) => i.visible) : [];
    const totalItems = summaries ? s.totalItems() : [];
    const nodes = view?.allGroups() ?? [];
    const levels = view ? model.groups.fields().length : 0;
    const out: GridSheetRow<T>[] = [];
    const merges: GridSheetMerge[] = [];
    if (options.headers !== false) this.headerRows(fields, cols, out, merges);
    const summaryRows = (rowType: 'groupFooter' | 'totalFooter', level: number, lists: Entry[][]) => {
      // Several items under one column take a row each.
      const count = Math.max(1, ...lists.map((list) => list.length));
      for (let k = 0; k < count; k++) {
        const cells = lists.map((list, j): GridSheetCell<T> => {
          const entry = list[k];
          if (!entry) return { value: null, text: '', gridCell: { rowType, column: cols[j] } };
          return { value: entry.text, text: entry.text, gridCell: { rowType, column: cols[j], value: entry.value, totalSummaryItemName: nameOf(entry.item) } };
        });
        out.push({ rowType, level, cells });
      }
    };
    const footerItems = groupItems.filter((i) => i.footer);
    const rowItems = groupItems.filter((i) => !i.footer);
    const footers = footerItems.length ? nodes.map((node) => ({ at: node.start + node.count, node })).sort((a, b) => a.at - b.at || b.node.level - a.node.level) : [];
    let g = 0;
    let f = 0;
    const closeGroups = (i: number) => {
      for (; f < footers.length && footers[f].at <= i; f++) {
        const node = footers[f].node;
        summaryRows('groupFooter', node.level + 1, this.entries(fields, footerItems, s.groupValues(node), false));
      }
    };
    rows.forEach((row, i) => {
      closeGroups(i);
      for (; g < nodes.length && nodes[g].start <= i; g++) out.push(this.groupRow(nodes[g], fields, cols, rowItems));
      const rowId = model.rowIdOf(row);
      out.push({
        rowType: 'data',
        level: levels,
        cells: cols.map((column) => {
          const value = model.value(rowId, row, column);
          const text = model.shownText(rowId, row, column, value);
          return { value: typed(column, value, text), text, gridCell: { rowType: 'data', column, data: row, value } };
        }),
      });
    });
    closeGroups(Number.POSITIVE_INFINITY);
    if (totalItems.some((i) => i.visible)) summaryRows('totalFooter', 0, this.entries(fields, totalItems, s.total, false));
    return {
      columns: cols.map((column, j) => ({
        field: fields[j],
        column,
        title: model.columns.title(fields[j]),
        width: options.widthOf(fields[j]),
        align: model.columns.align(fields[j]),
        numberFormat: column.type === 'number' && !column.lookup ? formatter.numberOptions(column) : undefined,
        dateFormat: column.type === 'date' && !column.lookup ? formatter.dateOptions(column) : undefined,
      })),
      rows: out,
      headerRows: options.headers !== false ? this.bandRows(fields).length + 1 : 0,
      merges,
      groupLevels: levels,
      locale: formatter.locale,
      rtl: options.rtl,
    };
  }

  /** The table as CSV text, for a spreadsheet: a byte order mark, the locale's separator, titles first. */
  csv(table: ExportTable, options: GridExportOptions): string {
    const { model } = this;
    const formatter = model.formatter;
    const cols = table.fields.map((f) => model.columns.get(f));
    const raw = options.values === 'raw';
    const guard = options.escapeFormulas !== false;
    const safe = (text: string) => (guard ? guardFormula(text) : text);
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
    // A band's title over the first of its columns, a line per level; then the columns' titles.
    const bands = options.headers !== false ? this.bandRows(table.fields).map((row) => table.fields.map((_, j) => row.find((b) => b.first === j)?.title ?? '')) : [];
    const head = options.headers !== false ? [...bands, table.fields.map((f) => model.columns.title(f))] : [];
    const separator = options.separator ?? listSeparator(formatter.locale);
    return `${options.bom !== false ? '﻿' : ''}${writeDelimited([...head, ...lines], separator)}\r\n`;
  }

  /**
   * The header rows of a sheet: a row per level of bands,
   * each band's title in the first cell it spans and merged over the rest; a column's title in the
   * row under its deepest band, merged down to the last header row.
   */
  private headerRows(fields: readonly string[], cols: readonly GridColumn<T>[], out: GridSheetRow<T>[], merges: GridSheetMerge[]) {
    const model = this.model;
    const bands = this.bandRows(fields);
    const depth = bands.length;
    const bandOf = (row: number, j: number) => bands[row].find((b) => j >= b.first && j < b.first + b.count);
    const levelOf = (j: number) => bands.filter((_, r) => bandOf(r, j)).length;
    for (let r = 0; r <= depth; r++) {
      const cells = cols.map((column, j): GridSheetCell<T> => {
        const band = r < depth ? bandOf(r, j) : undefined;
        if (band) {
          const def = model.columns.bands.get(band.id)!.def;
          const first = band.first === j;
          return { value: first ? band.title : null, text: first ? band.title : '', gridCell: { rowType: 'header', band: def } };
        }
        const title = model.columns.title(fields[j]);
        const own = r === levelOf(j);
        return { value: own ? title : null, text: own ? title : '', gridCell: { rowType: 'header', column } };
      });
      out.push({ rowType: 'header', level: 0, cells });
    }
    for (const row of bands) for (const b of row) if (b.count > 1) merges.push({ row: model.columns.depthOf(b.id) - 1, column: b.first, rows: 1, columns: b.count });
    fields.forEach((_, j) => {
      const level = levelOf(j);
      if (level < depth) merges.push({ row: level, column: j, rows: depth - level + 1, columns: 1 });
    });
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
    return this.entries(fields, items, values, raw).map((list) => list.map((e) => e.text).join('\n'));
  }

  /** The summary items that have a value, under each column, by field. */
  private entries(fields: readonly string[], items: readonly PlacedItem[], values: readonly unknown[], raw: boolean): Entry[][] {
    const { model } = this;
    return fields.map((field) => {
      const list: Entry[] = [];
      for (const i of items) {
        if (!i.visible || i.place !== field) continue;
        const value = values[i.index];
        const col = i.field !== undefined && model.columns.defs.has(i.field) ? model.columns.get(i.field) : null;
        const text = raw ? (data.isEmpty(value) ? '' : col ? model.formatter.raw(col, value) : String(value)) : model.summaries.text(i, value, i.place !== i.field);
        if (text) list.push({ item: i, value, text });
      }
      return list;
    });
  }

  /** A group's line: "Column: value", its summary items after it, those aligned by column under their columns. */
  private groupLine(node: GroupNode, fields: readonly string[], items: readonly PlacedItem[], raw: boolean) {
    const line = this.groupParts(node, fields, items);
    return { at: node.start, text: line.text, level: node.level, cells: this.cells(fields, line.under, line.values, raw) };
  }

  /** A group's row of a sheet: its text in the first cell, the items aligned by column under their columns. */
  private groupRow(node: GroupNode, fields: readonly string[], cols: readonly GridColumn<T>[], items: readonly PlacedItem[]): GridSheetRow<T> {
    const line = this.groupParts(node, fields, items);
    const under = this.entries(fields, line.under, line.values, false);
    const cells = cols.map((column, j): GridSheetCell<T> => {
      if (j === 0) {
        const inText = line.inText.map((i) => ({ name: i.name, value: line.values[i.index] }));
        const cell: GridExportCell<T> = { rowType: 'group', column: this.model.columns.get(node.field), value: node.key, groupIndex: node.level, groupSummaryItems: inText };
        return { value: line.text, text: line.text, gridCell: cell };
      }
      const text = under[j].map((e) => e.text).join('\n');
      const shown = under[j].map((e) => ({ name: e.item.name, value: e.value }));
      return { value: text || null, text, gridCell: { rowType: 'group', column, groupIndex: node.level, groupSummaryItems: shown.length ? shown : undefined } };
    });
    return { rowType: 'group', level: node.level, cells };
  }

  /** The text of a group's line, the items in it, and the items under their columns. */
  private groupParts(node: GroupNode, fields: readonly string[], items: readonly PlacedItem[]) {
    const { model } = this;
    const s = model.summaries;
    const values = items.length ? s.groupValues(node) : [];
    const under = items.filter((i) => i.align && i.place !== undefined && fields.indexOf(i.place) > 0);
    const inText = items.filter((i) => !under.includes(i) && s.text(i, values[i.index], i.field !== node.field));
    const texts = inText.map((i) => s.text(i, values[i.index], i.field !== node.field));
    const separator = model.text('gridSummarySeparator');
    return { text: model.groupCaption(node) + (texts.length ? separator + texts.join(separator) : ''), inText, under, values };
  }

  /** Lookup cells and groups export their texts: every key of the rows is resolved first. */
  private async loadTexts(cols: readonly GridColumn<T>[], view: GroupView | null, rows: readonly T[]) {
    const { model } = this;
    const grouped = view ? model.groups.fields().map((f) => model.columns.get(f)).filter((c) => model.groupsByOwnValue(c)) : [];
    const lookups = [...cols.filter((c) => !c.textFrom), ...grouped].filter((c, i, all) => c.lookup && all.indexOf(c) === i);
    if (lookups.length) await model.lookups.load(lookups, rows, (row, col) => model.value(model.rowIdOf(row), row, col));
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

  private async rows(options: Pick<GridExportOptions, 'selected' | 'pageSize' | 'onProgress'>, signal: AbortSignal): Promise<T[]> {
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

/** A summary item's name for `totalSummaryItemName`: its own, else `type_column`. */
function nameOf(i: PlacedItem): string {
  return i.name ?? (i.field !== undefined ? `${i.type}_${i.field}` : i.type);
}

/** What a data cell writes: numbers, dates and yes/no as values; lookups, lists and `format` functions as their text. */
function typed<T>(col: GridColumn<T>, value: unknown, text: string): string | number | boolean | Date | null {
  if (col.lookup || typeof col.format === 'function') return text || null;
  if (data.isEmpty(value)) return null;
  switch (col.type) {
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? value : text || null;
    case 'date':
      return data.toDate(value) ?? (text || null);
    case 'boolean':
      return typeof value === 'boolean' ? value : text || null;
    default:
      return text || null;
  }
}
