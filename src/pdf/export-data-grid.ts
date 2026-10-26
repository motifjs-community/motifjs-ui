import type { PdfExportOptions } from './pdf-export-options';
import type { PdfExportResult } from './pdf-export-result';
import { PdfTable } from './pdf-table';

/**
 * Draws a DataGrid on a jsPDF document as a table's `pdfExporter.exportDataGrid`
 * does: the header rows (bands merged over their columns), the rows in the grid's order with its
 * filter, search and grouping (every matching row, loaded in parts from a server), the group rows,
 * the group footers and the totals, with the grid's texts and alignment. Columns take the grid's
 * widths, narrowed to fit the page; rows that do not fit go on to the next page under the header
 * rows again. Only jsPDF itself is used (no table plugin). Bring your own jsPDF: make the document,
 * then save it when the promise resolves.
 *
 * jsPDF's own fonts write Latin-1 text only: for other letters (ş, ğ, İ, Cyrillic, Greek…) add a
 * TrueType font that has them (`doc.addFileToVFS`, `doc.addFont`) and `doc.setFont` it first.
 *
 * @example
 * onExporting={(e) => {
 *   if (e.format !== 'pdf') return;
 *   const doc = new jsPDF();
 *   exportDataGrid({ jsPDFDocument: doc, component: e.component, selectedRowsOnly: e.selectedRowsOnly })
 *     .then(() => doc.save('Orders.pdf'));
 * }}
 */
export function exportDataGrid<T = any>(options: PdfExportOptions<T>): Promise<PdfExportResult> {
  if (!options || typeof options !== 'object') return Promise.reject(new TypeError('exportDataGrid needs an options object.'));
  const { component, jsPDFDocument: doc } = options;
  if (!component || typeof component.exportSheet !== 'function') return Promise.reject(new TypeError('exportDataGrid: `component` must be a DataGrid.'));
  if (!doc || typeof doc.text !== 'function' || !doc.internal) return Promise.reject(new TypeError('exportDataGrid: `jsPDFDocument` must be a jsPDF document.'));
  return component.exportSheet(
    {
      format: 'pdf',
      selectedRowsOnly: options.selectedRowsOnly,
      headers: options.headers,
      groups: options.groups,
      summaries: options.summaries,
      pageSize: options.pageSize,
      onProgress: options.onProgress,
      signal: options.signal,
      loadPanel: options.loadPanel ?? true,
    },
    (sheet) => new PdfTable<T>(sheet, options).draw(),
  );
}
