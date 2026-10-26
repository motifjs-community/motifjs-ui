import type { EditorValue } from '../view/editor-value';
import type { ClipboardContent } from './clipboard-content';
import { readDelimited, writeDelimited } from './delimited-text';
import type { GridModel } from './GridModel';
import { htmlTable } from './html-table';
import type { PasteResult } from './paste-result';

/**
 * Copy and paste of the grid's cells. Copying takes the active cell, or the selected rows of a
 * multiple selection in the grid's order, with the copyable visible columns; pasting reads
 * tab-separated lines into the cells the user can fill, from the active cell rightwards and
 * downwards, through the rows' drafts and their checks.
 */
export class GridClipboard<T> {
  constructor(private readonly model: GridModel<T>) {}

  /** Fields Ctrl+C copies, in display order (those the width hides too). */
  fields(): string[] {
    const cols = this.model.columns;
    return cols.listedData().filter((f) => cols.can(f, 'copyable'));
  }

  /** What Ctrl+C copies now; `'all'` when every row of a server's filter is selected (that is for an export), `null` when there is nothing. */
  copy(): ClipboardContent | 'all' | null {
    const { model } = this;
    const fields = this.fields();
    if (!fields.length) return null;
    const rows = this.selectedRows();
    if (rows === 'all') return 'all';
    if (rows) {
      const lines = rows.map((row) => fields.map((f) => this.cellText(row, f)));
      const head = model.settings.get('copyHeaders') ? fields.map((f) => model.columns.title(f)) : null;
      return { text: writeDelimited(head ? [head, ...lines] : lines, '\t'), html: htmlTable(head, lines), rows: rows.length };
    }
    const { activeRow, activeField } = model.state;
    const group = activeRow >= 0 ? model.groupAt(activeRow) : null;
    if (group) {
      const caption = model.groupCaption(group);
      return { text: caption, html: htmlTable(null, [[caption]]), rows: 0 };
    }
    const row = activeRow >= 0 ? model.rowAt(activeRow) : undefined;
    if (row === undefined || !fields.includes(activeField)) return null;
    const text = this.cellText(row, activeField);
    return { text, html: htmlTable(null, [[text]]), rows: 0 };
  }

  /**
   * Writes tab-separated text into grid row `i` and the rows below it, from `field` rightwards. A
   * cell the user cannot fill keeps its value; text that cannot be read leaves a message. Lines past
   * the last row open new rows when `pasteNewRows` (and `addRows`) allow; a row not loaded yet ends
   * the paste.
   */
  paste(text: string, i: number, field: string): PasteResult {
    const { model } = this;
    const cols = model.columns;
    const result: PasteResult = { rowIds: [], cells: 0, failed: 0 };
    const lines = readDelimited(text, '\t');
    const fields = cols.visibleData();
    const start = Math.max(0, fields.indexOf(field));
    let at = model.localOf(i);
    let last = -1;
    for (const line of lines) {
      let r = at < 0 ? -1 : model.viewAt(at);
      if (r < 0) {
        r = this.openRow(last);
        if (r < 0) break;
      }
      at = model.localOf(r) + 1;
      last = r;
      // Group rows and footers take no values: the line goes to the next data row.
      while (model.groupAt(r) || model.footerAt(r)) {
        r = model.viewAt(at);
        if (r < 0) break;
        at = model.localOf(r) + 1;
        last = r;
      }
      if (r < 0) break;
      const row = model.rowAt(r);
      const rowId = model.rowIdAt(r);
      if (row === undefined || rowId === undefined) break;
      const rec = model.edit(rowId);
      result.rowIds.push(rowId);
      if (rec?.saving || rec?.removed) continue;
      line.forEach((cell, j) => {
        const f = fields[start + j];
        if (f === undefined || !cols.canFill(f, row, !!rec?.isNew)) return;
        const col = cols.get(f);
        const read = col.lookup ? this.lookupKey(rowId, row, f, cell) : model.formatter.parse(col, cell, model.value(rowId, row, col));
        if (read instanceof Promise) {
          // The source is asked for the text; the cell is busy until it answers.
          model.writeLater(rowId, row, f, read, model.dataIndex(r));
          result.cells++;
        } else if (read.ok) {
          model.writeCell(rowId, row, f, read.value, model.dataIndex(r));
          result.cells++;
        } else {
          model.setError(row, f, read.message);
          result.failed++;
        }
      });
    }
    return result;
  }

  /** The text of one cell as Ctrl+C copies it: what it shows, or its value (`copyValues`). */
  cellText(row: T, field: string): string {
    const { model } = this;
    const col = model.columns.get(field);
    const rowId = model.rowIdOf(row);
    const value = model.value(rowId, row, col);
    return model.settings.get('copyValues') === 'raw' ? model.formatter.raw(col, value) : model.shownText(rowId, row, col, value);
  }

  /** Pasted text of a lookup cell read as a key: exactly one item of the source must have that text. */
  private lookupKey(rowId: string, row: T, field: string, text: string): EditorValue | Promise<EditorValue> {
    const { model } = this;
    const col = model.columns.get(field);
    const merged = { ...(row as object), ...(model.edit(rowId)?.draft ?? {}) } as T;
    const shown = text.trim();
    return model.lookups.parse(col, text, merged, { none: model.text('gridLookupNoMatch', { text: shown }), several: model.text('gridLookupSeveral', { text: shown }) });
  }

  /** The selected rows in the grid's order; `null` without a multiple selection, `'all'` for "all" over data that loads in parts. */
  private selectedRows(): T[] | 'all' | null {
    const { model } = this;
    const sel = model.selection;
    if (model.settings.get('selection') !== 'multiple' || sel.empty) return null;
    const source = model.data.source;
    const grouped = model.data.groupedRows();
    if (grouped) return grouped.filter((row) => sel.isSelected(model.selectId(row)));
    if (source.loadMode === 'all') return source.rows.filter((row) => sel.isSelected(model.selectId(row)));
    if (sel.all) return 'all';
    const found: { row: T; at: number }[] = [];
    for (const key of sel.snapshot().keys) {
      const row = source.rowByKey(key);
      if (row !== undefined) found.push({ row, at: source.indexOfKey(key) });
    }
    found.sort((a, b) => (a.at < 0 ? Infinity : a.at) - (b.at < 0 ? Infinity : b.at));
    return found.map((f) => f.row);
  }

  /** A new row for a pasted line past the last row, right after grid row `last`; -1 when the settings or the place do not allow one. */
  private openRow(last: number): number {
    const { model } = this;
    const settings = model.settings;
    if (last < 0 || !settings.get('pasteNewRows') || !settings.get('addRows')) return -1;
    const k = model.addedIndex(last);
    if (k >= 0) return model.insertAdded(k + 1);
    const atEnd = model.newRowPosition === 'bottom' && model.dataIndex(last) === model.data.total - 1;
    return atEnd ? model.insertAdded(model.addedRows.length) : -1;
  }
}
