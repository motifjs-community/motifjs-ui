import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import Clipboard from './examples/Clipboard';
import ExcelExport from './examples/ExcelExport';
import Export from './examples/Export';
import PdfExport from './examples/PdfExport';
import Selection from './examples/Selection';

const EXCEL_OPTIONS = [
  ['component, worksheet', '—', 'The grid, and the ExcelJS worksheet to write to (`workbook.addWorksheet(\'Orders\')`).'],
  ['topLeftCell', '`{ row: 1, column: 1 }`', 'Where the first cell goes: `{ row, column }` or a reference such as `\'B2\'`.'],
  ['customizeCell', '—', '`({ gridCell, excelCell }) => void` for every cell, after its value and style are set.'],
  ['autoFilterEnabled', '`false`', 'Excel’s filter buttons on the header row.'],
  ['keepColumnWidths', '`true`', 'Columns as wide as in the grid.'],
  ['selectedRowsOnly', 'the toolbar’s command, else `false`', 'Only the selected rows (no group rows or summaries, as with CSV).'],
  ['loadPanel', 'on', 'The panel over the rows while they load: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`.'],
  ['encodeExecutableContent', '`false`', 'Text a spreadsheet would run as a formula gets a `\'` in front.'],
  ['headers, frozenHeader', '`true`', 'The row of column titles; it stays in view while the sheet scrolls.'],
  ['groups, outline, summaries', '`true`', 'Group rows; outline levels by group (at most 7); group summary items, footers and the totals.'],
  ['numberFormats, booleanText', '`true`, `false`', 'Excel number formats from the columns’ `Intl` formats; the grid’s yes/no text instead of `TRUE` / `FALSE`.'],
  ['pageSize, onProgress, signal', 'the `exportPageSize` setting', 'Rows per request to a server; told after each part; stops the export (the promise rejects with an `AbortError`).'],
];

const PDF_OPTIONS = [
  ['jsPDFDocument, component', '—', 'The jsPDF document to draw on (`new jsPDF()`; the table starts on its current page), and the grid.'],
  ['topLeft', '`{ x: 0, y: 0 }`', 'Where the table starts, from the top left margin, on its first page.'],
  ['margin', '40 points on every side', 'Space kept free at the page’s edges: a number, or `{ top, right, bottom, left }`.'],
  ['columnWidths', 'the grid’s, made to fit', 'Each column’s width, in order; one left out takes the grid’s.'],
  ['fitColumns', "`'shrink'`", "Without `columnWidths`: the grid's widths narrowed when wider than the page (`'shrink'`), always as wide as it (`'fill'`), or as they are (`'none'`)."],
  ['repeatHeaders', '`true`', 'The header rows (bands included) again at the top of every page.'],
  ['indent', '`0`', 'How far the rows of a group sit in from its group row, per level.'],
  ['customizeCell', '—', '`({ gridCell, pdfCell }) => void` for every cell before the rows are measured: `text`, `font` (`size`, `name`, `style`), `textColor`, `backgroundColor`, `borderColor`, `borderWidth`, the four `draw…Border`s, `horizontalAlign`, `verticalAlign`, `padding`, `wordWrapEnabled`.'],
  ['customDrawCell', '—', '`({ doc, rect, gridCell, pdfCell, cancel }) => void` before a cell is drawn: draw it yourself (an image, a bar) and set `cancel` (the borders are still drawn).'],
  ['onRowExporting', '—', '`({ rowCells, rowHeight }) => void` before a row is placed: a taller `rowHeight` (never less than its text needs).'],
  ['wordWrapEnabled, fontSize', '`false`, `10`', 'Long text on more lines (off: a line that does not fit ends in “…”); the cells’ font size in points.'],
  ['selectedRowsOnly', 'the toolbar’s command, else `false`', 'Only the selected rows (no group rows or summaries, as with CSV and Excel).'],
  ['loadPanel', 'on', 'The panel over the rows while they load, with the progress and a Stop button; `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`.'],
  ['headers, groups, summaries', '`true`', 'The header rows; a row per group; group summary items, footers and the totals.'],
  ['pageSize, onProgress, signal', 'the `exportPageSize` setting', 'Rows per request to a server; told after each part; stops the export (the promise rejects with an `AbortError`, nothing is drawn).'],
];

export default function DataGridSelectionPage() {
  return (
    <>
      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selection` is `single` (the selection follows the active row) or `multiple`, with a check box column. A click selects a row, Ctrl adds or takes out, Shift selects a range; Shift+Space, Shift+arrows and Ctrl+A do it from the keyboard. The header check box selects every row of the filter — on a server too: the grid keeps a state, “all but these keys”, never the rows. `selection` gives that state, `selectionFilter` the same as a filter for the server. Selected rows wear the design language's own selection look, as its lists and trees do: its fill and text colour, and its frame, raised effect or bar at the start where it has them; the hover and the active row's tint lie over it, the keyboard focus ring on top, and a selected row stays one row high." />
        </p>
        <Example files={[...withOrders('Selection.tsx'), slowAdapterFile]} stack>
          <Selection />
        </Example>
      </Section>

      <Section anchor="clipboard" title="Copy and paste">
        <p>
          <Rich text="Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table: a spreadsheet or a document takes it as a table. Ctrl+V on a cell writes tab-separated text — from a spreadsheet, or copied here — into the editable cells from that cell rightwards and downwards. Each value is read by the column type (numbers and dates in the locale, yes or no, a list option by its text) and goes into the row's draft with its checks, as if typed; cells that cannot be edited keep their values. The rows below the active one are saved as the save mode says." />
        </p>
        <Example files={withOrders('Clipboard.tsx')} stack>
          <Clipboard />
        </Example>
      </Section>

      <Section anchor="export" title="Export">
        <p>
          <Rich text="`exportCsv()` saves the rows of the filter, in the sort order, with the visible columns in their order, as a CSV file a spreadsheet opens as it is: UTF-8 with a byte order mark, the locale's separator (`;` where decimals take a comma), the column titles first, and text that would run as a formula made harmless. `exportRows()` gives the same rows as objects. Rows in memory are taken as they are; a server's are asked for in parts through the data source, so its filter, search and sort apply and nothing on the screen changes. `exportButton` puts an “Export” button in the toolbar; `exportable` takes a column out." />
        </p>
        <Example files={[...withOrders('Export.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Export />
        </Example>
      </Section>

      <Section anchor="excel" title="Export to Excel">
        <p>
          <Rich text="the grid does not carry an xlsx writer: the app brings ExcelJS (`npm i exceljs`, an optional peer dependency) and calls `exportDataGrid({ component, worksheet })` from `@motifx-community/ui/excel` — a separate entry, so apps that never export to Excel never load it. With `export: { formats: ['xlsx', 'csv'] }` the toolbar's export button becomes a menu (“Export all data to Excel”, “Export selected rows to Excel” with `allowExportSelectedData`); the Excel commands raise `onExporting` with `format: 'xlsx'` and `selectedRowsOnly`, and the handler writes the workbook and saves it, here as a Blob download with ExcelJS loaded on the first export." />
        </p>
        <Example files={withOrders('ExcelExport.tsx')} stack>
          <ExcelExport />
        </Example>
        <p>
          <Rich text="The sheet holds the header row (frozen), the rows in the grid's order with its filter, search and grouping — every matching row, a server's loaded in parts while a panel over the rows shows the progress and a button that stops it — the group rows (“Column: value” with their summary items, those aligned by column under their columns) with outline levels Excel folds, the group footers and the totals. Numbers stay numbers with a number format made from the column's `Intl` format, dates stay dates, yes/no cells are Excel's `TRUE` / `FALSE` (`booleanText` writes the grid's text), lookup and list cells hold their texts, a column with a `format` function its text, and widths follow the grid. `customizeCell({ gridCell, excelCell })` changes any cell; `gridCell` has `rowType`, `column`, `data`, `value`, `groupIndex`, `groupSummaryItems` and `totalSummaryItemName`. The promise resolves with the cells written, `{ from, to }`." />
        </p>
        <ApiTable head={['exportDataGrid option', 'Default', 'Description']} rows={EXCEL_OPTIONS} />
      </Section>

      <Section anchor="pdf" title="Export to PDF">
        <p>
          <Rich text="The same way for PDF: the app brings jsPDF (`npm i jspdf`, an optional peer dependency) and calls `exportDataGrid({ jsPDFDocument, component })` from `@motifx-community/ui/pdf`, its own entry. Add `'pdf'` to `export.formats` and the toolbar's menu offers “Export all data to PDF” (and the selected rows); the command raises `onExporting` with `format: 'pdf'`, and the handler makes the document, draws the grid on it and saves it. The table is drawn with jsPDF's own calls, no table plugin: the header rows with bands merged over their columns, the rows in the grid's order with its filter, search and grouping and the texts and alignment the grid shows, the group rows across the row, the group footers and the totals. Columns take the grid's widths, narrowed to fit the page; rows that do not fit go on to the next page under the header rows again; right to left, the columns run from the right edge." />
        </p>
        <Example files={withOrders('PdfExport.tsx')} stack>
          <PdfExport />
        </Example>
        <p>
          <Rich text="jsPDF's own fonts (Helvetica, Times, Courier) write Latin-1 only: Turkish letters such as İ, ş and ğ, and Cyrillic, Greek or Arabic text, need a TrueType font that has them, added to the document before the export (`doc.addFileToVFS`, `doc.addFont`, `doc.setFont`) — with a bold style too, which group rows and totals use. This example fetches Noto Sans the first time it exports and keeps jsPDF's font when it cannot. The promise resolves with where the table ends (`{ page, y }`), to go on writing under it." />
        </p>
        <ApiTable head={['exportDataGrid option', 'Default', 'Description']} rows={PDF_OPTIONS} />
      </Section>
    </>
  );
}
