import type { jsPDF } from 'jspdf';
import type { GridExportCell } from '../components/datagrid/grid-export-cell';
import type { GridSheet } from '../components/datagrid/grid-sheet';
import type { PdfCell } from './pdf-cell';
import type { PdfExportOptions } from './pdf-export-options';
import type { PdfExportResult } from './pdf-export-result';

/** Points in a CSS pixel. */
const PX = 0.75;
const ELLIPSIS = '…';

type RowType = GridSheet['rows'][number]['rowType'];

/** A cell where it is drawn from, and how many columns and rows it covers; `null` for one another covers. */
type Placed<T> = { cell: PdfCell; gridCell: GridExportCell<T>; columns: number; rows: number } | null;

/**
 * Draws a grid's sheet on a jsPDF document as a table, with jsPDF's own drawing calls only: the
 * header rows (bands over their columns), the group rows across the row, the data rows with the
 * grid's text and alignment, the group footers and the totals. Rows that do not fit go on to the
 * next page, under the header rows again (`repeatHeaders`). Right to left, the columns run from the
 * right edge.
 */
export class PdfTable<T> {
  private readonly doc: jsPDF;
  /** Points per unit of the document. */
  private readonly unit: number;
  private readonly rtl: boolean;
  private readonly lines = new WeakMap<PdfCell, string[]>();

  constructor(
    private readonly sheet: GridSheet<T>,
    private readonly options: PdfExportOptions<T>,
  ) {
    this.doc = options.jsPDFDocument;
    this.unit = this.doc.internal.scaleFactor || 1;
    this.rtl = sheet.rtl;
  }

  draw(): PdfExportResult {
    const { doc, sheet, options } = this;
    const saved = { font: doc.getFont(), size: doc.getFontSize(), text: doc.getTextColor(), draw: doc.getDrawColor(), fill: doc.getFillColor(), line: doc.getLineWidth() };
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = this.margin();
      const start = (this.rtl ? margin.right : margin.left) + (options.topLeft?.x ?? 0);
      const widths = this.widths(Math.max(0, pageWidth - margin.left - margin.right - (options.topLeft?.x ?? 0)));
      const offsets: number[] = [];
      widths.reduce((x, w, j) => ((offsets[j] = x), x + w), start);
      const grid = this.place();
      const heights = sheet.rows.map((_, r) => this.rowHeight(grid, r, widths));
      const head = sheet.headerRows;
      const headHeight = heights.slice(0, head).reduce((a, h) => a + h, 0);

      const drawRow = (r: number, y: number) => {
        grid[r].forEach((placed, j) => {
          if (!placed) return;
          const w = this.spanWidth(r, j, placed, widths);
          const x = offsets[j] + this.indentOf(r, j, placed, widths);
          let h = 0;
          for (let k = r; k < r + placed.rows && k < heights.length; k++) h += heights[k];
          this.drawCell(placed, this.rtl ? pageWidth - x - w : x, y, w, h);
        });
      };

      let y = margin.top + (options.topLeft?.y ?? 0);
      for (let r = 0; r < head; r++) {
        drawRow(r, y);
        y += heights[r];
      }
      // Rows that do not fit go on to the next page; one taller than a page stays where it starts.
      let onPage = 0;
      for (let r = head; r < sheet.rows.length; r++) {
        if (y + heights[r] > pageHeight - margin.bottom && onPage > 0) {
          doc.addPage();
          y = margin.top;
          onPage = 0;
          if (options.repeatHeaders !== false && head > 0) {
            for (let k = 0; k < head; k++) {
              drawRow(k, y);
              y += heights[k];
            }
          }
        }
        drawRow(r, y);
        y += heights[r];
        onPage++;
      }
      if (!sheet.rows.length) y += headHeight;
      return { page: doc.getCurrentPageInfo().pageNumber, y };
    } finally {
      doc.setFont(saved.font.fontName, saved.font.fontStyle);
      doc.setFontSize(saved.size);
      doc.setTextColor(saved.text);
      doc.setDrawColor(saved.draw);
      doc.setFillColor(saved.fill);
      doc.setLineWidth(saved.line);
    }
  }

  /** Points in the document's units. */
  private pt(value: number): number {
    return value / this.unit;
  }

  private margin(): { top: number; right: number; bottom: number; left: number } {
    const given = this.options.margin;
    const all = this.pt(40);
    if (typeof given === 'number') return { top: given, right: given, bottom: given, left: given };
    return { top: given?.top ?? all, right: given?.right ?? all, bottom: given?.bottom ?? all, left: given?.left ?? all };
  }

  /** The columns' widths: the ones given, else the grid's, made to fit `room` as `fitColumns` says. */
  private widths(room: number): number[] {
    const { sheet, options } = this;
    const grid = sheet.columns.map((c) => this.pt(Math.max(0, c.width) * PX));
    if (options.columnWidths) return grid.map((w, j) => options.columnWidths![j] ?? w);
    const total = grid.reduce((a, w) => a + w, 0);
    const fit = options.fitColumns ?? 'shrink';
    if (fit === 'none' || total <= 0 || (fit === 'shrink' && total <= room)) return grid;
    return grid.map((w) => (w * room) / total);
  }

  /**
   * The cells as they are drawn: header cells merged as the sheet says (a band over its columns, a
   * column down the band rows), a group row's text across the empty cells after it; each one told
   * to `customizeCell`.
   */
  private place(): Placed<T>[][] {
    const { sheet, options } = this;
    const out: Placed<T>[][] = sheet.rows.map((row) =>
      row.cells.map((c, j) => ({ cell: this.baseCell(row.rowType, j, c.text), gridCell: c.gridCell, columns: 1, rows: 1 })),
    );
    for (const m of sheet.merges) {
      const origin = out[m.row]?.[m.column];
      if (!origin) continue;
      origin.columns = m.columns;
      origin.rows = m.rows;
      for (let r = m.row; r < m.row + m.rows; r++) for (let j = m.column; j < m.column + m.columns; j++) if (r !== m.row || j !== m.column) out[r][j] = null;
    }
    sheet.rows.forEach((row, r) => {
      if (row.rowType !== 'group' || !out[r][0]) return;
      let span = 1;
      while (span < row.cells.length && row.cells[span].value === null && !row.cells[span].text) out[r][span++] = null;
      out[r][0]!.columns = span;
    });
    if (options.customizeCell) for (const row of out) for (const placed of row) if (placed) options.customizeCell({ gridCell: placed.gridCell, pdfCell: placed.cell });
    return out;
  }

  /** A cell's look before `customizeCell`: the row type's font and colors, the column's alignment. */
  private baseCell(rowType: RowType, j: number, text: string): PdfCell {
    const doc = this.doc;
    const col = this.sheet.columns[j];
    const align = rowType === 'group' && j === 0 ? 'start' : (col?.align ?? 'start');
    const side = (end: boolean) => (end !== this.rtl ? 'right' : 'left');
    const pad = this.pt(5);
    return {
      text,
      font: { size: this.options.fontSize ?? 10, name: doc.getFont().fontName, style: rowType === 'data' || rowType === 'header' ? 'normal' : 'bold' },
      textColor: rowType === 'header' ? '#979797' : '#000000',
      borderColor: '#979797',
      borderWidth: this.pt(0.5),
      drawLeftBorder: true,
      drawRightBorder: true,
      drawTopBorder: true,
      drawBottomBorder: true,
      horizontalAlign: align === 'center' ? 'center' : side(align === 'end'),
      verticalAlign: 'middle',
      padding: { top: pad, right: pad, bottom: pad, left: pad },
      wordWrapEnabled: this.options.wordWrapEnabled ?? false,
    };
  }

  /** The height of row `r`: its tallest cell of one row, then what `onRowExporting` makes of it. */
  private rowHeight(grid: Placed<T>[][], r: number, widths: readonly number[]): number {
    const cells: PdfCell[] = [];
    let need = 0;
    grid[r].forEach((placed, j) => {
      if (!placed) return;
      cells.push(placed.cell);
      const lines = this.textLines(placed.cell, this.spanWidth(r, j, placed, widths));
      if (placed.rows === 1) need = Math.max(need, lines.length * this.lineHeight(placed.cell) + placed.cell.padding.top + placed.cell.padding.bottom);
    });
    if (!this.options.onRowExporting) return need;
    const e = { rowCells: cells, rowHeight: need };
    this.options.onRowExporting(e);
    return Math.max(need, Number(e.rowHeight) || 0);
  }

  /** How far the first cell of row `r` sits in: `indent` per group level, never past the cell. */
  private indentOf(r: number, j: number, placed: NonNullable<Placed<T>>, widths: readonly number[]): number {
    const row = this.sheet.rows[r];
    const indent = Math.max(0, this.options.indent ?? 0);
    if (j !== 0 || !indent || row.rowType === 'header' || !row.level) return 0;
    let w = 0;
    for (let k = 0; k < placed.columns && k < widths.length; k++) w += widths[k];
    return Math.min(w, indent * row.level);
  }

  /** The width a cell covers, less its indent. */
  private spanWidth(r: number, j: number, placed: NonNullable<Placed<T>>, widths: readonly number[]): number {
    let w = 0;
    for (let k = j; k < j + placed.columns && k < widths.length; k++) w += widths[k];
    return w - this.indentOf(r, j, placed, widths);
  }

  /** The lines of a cell's text at width `w`: wrapped, or each cut to fit with "…". */
  private textLines(cell: PdfCell, w: number): string[] {
    const doc = this.doc;
    this.useFont(cell);
    const room = Math.max(0, w - cell.padding.left - cell.padding.right);
    const out: string[] = [];
    for (const part of String(cell.text ?? '').split('\n')) {
      if (cell.wordWrapEnabled && part) out.push(...(doc.splitTextToSize(part, room) as string[]));
      else out.push(this.cut(part, room));
    }
    this.lines.set(cell, out);
    return out;
  }

  /** The text, or as much of it as fits in `room` with "…" after it. */
  private cut(text: string, room: number): string {
    const doc = this.doc;
    if (!text || doc.getTextWidth(text) <= room) return text;
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (doc.getTextWidth(text.slice(0, mid) + ELLIPSIS) <= room) lo = mid;
      else hi = mid - 1;
    }
    return lo ? text.slice(0, lo).trimEnd() + ELLIPSIS : '';
  }

  private lineHeight(cell: PdfCell): number {
    return this.pt(cell.font.size * this.doc.getLineHeightFactor());
  }

  /** The cell's font, or the plain style of it when the document has no such style (a font added with only one). */
  private useFont(cell: PdfCell) {
    const doc = this.doc;
    const name = cell.font.name ?? doc.getFont().fontName;
    const styles = doc.getFontList()[name];
    const style = cell.font.style ?? 'normal';
    doc.setFont(name, !styles || styles.includes(style) ? style : (styles[0] ?? 'normal'));
    doc.setFontSize(cell.font.size);
  }

  private drawCell(placed: NonNullable<Placed<T>>, x: number, y: number, w: number, h: number) {
    const { doc, options } = this;
    const { cell, gridCell } = placed;
    const rect = { x, y, w, h };
    const e = { doc, rect, gridCell, pdfCell: cell, cancel: false };
    options.customDrawCell?.(e);
    if (!e.cancel) {
      if (cell.backgroundColor) {
        doc.setFillColor(cell.backgroundColor);
        doc.rect(x, y, w, h, 'F');
      }
      this.drawText(cell, rect);
    }
    if (cell.borderWidth > 0) {
      doc.setDrawColor(cell.borderColor);
      doc.setLineWidth(cell.borderWidth);
      if (cell.drawTopBorder) doc.line(x, y, x + w, y);
      if (cell.drawBottomBorder) doc.line(x, y + h, x + w, y + h);
      if (cell.drawLeftBorder) doc.line(x, y, x, y + h);
      if (cell.drawRightBorder) doc.line(x + w, y, x + w, y + h);
    }
  }

  private drawText(cell: PdfCell, rect: { x: number; y: number; w: number; h: number }) {
    const doc = this.doc;
    const lines = this.lines.get(cell) ?? this.textLines(cell, rect.w);
    if (!lines.some((l) => l)) return;
    this.useFont(cell);
    doc.setTextColor(cell.textColor);
    const height = lines.length * this.lineHeight(cell);
    const { padding } = cell;
    const y = cell.verticalAlign === 'top' ? rect.y + padding.top : cell.verticalAlign === 'bottom' ? rect.y + rect.h - padding.bottom - height : rect.y + (rect.h - height) / 2;
    const x = cell.horizontalAlign === 'right' ? rect.x + rect.w - padding.right : cell.horizontalAlign === 'center' ? rect.x + rect.w / 2 : rect.x + padding.left;
    doc.text(lines, x, y, { align: cell.horizontalAlign, baseline: 'top', lineHeightFactor: doc.getLineHeightFactor() });
  }
}
