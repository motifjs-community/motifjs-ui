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
  ['topLeftCell', '`{ row: 1, column: 1 }`', 'The position of the first cell: `{ row, column }` or a reference such as `\'B2\'`.'],
  ['customizeCell', '—', '`({ gridCell, excelCell }) => void` for every cell, after its value and style are set.'],
  ['autoFilterEnabled', '`false`', 'Adds Excel filter buttons to the header row.'],
  ['keepColumnWidths', '`true`', 'Makes columns as wide as in the grid.'],
  ['selectedRowsOnly', 'The toolbar command, otherwise `false`', 'Exports only the selected rows, without group rows or summaries, as with CSV.'],
  ['loadPanel', 'On', 'The panel over the rows while they load: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`.'],
  ['encodeExecutableContent', '`false`', 'Prefixes text that a spreadsheet would run as a formula with `\'`.'],
  ['headers, frozenHeader', '`true`', 'The row of column titles, which stays in view while the sheet scrolls.'],
  ['groups, outline, summaries', '`true`', 'Group rows, outline levels by group (up to 7), group summary items, footers and totals.'],
  ['numberFormats, booleanText', '`true`, `false`', 'Excel number formats from the columns\' `Intl` formats, and the grid\'s yes/no text instead of `TRUE` and `FALSE`.'],
  ['pageSize, onProgress, signal', 'The `exportPageSize` setting', 'The rows per request to a server, a callback after each part, and a signal that stops the export (the promise rejects with an `AbortError`).'],
];

const PDF_OPTIONS = [
  ['jsPDFDocument, component', '—', 'The jsPDF document to draw on (`new jsPDF()`, with the table starting on its current page), and the grid.'],
  ['topLeft', '`{ x: 0, y: 0 }`', 'The position where the table starts on its first page, measured from the top left margin.'],
  ['margin', '40 points on each side', 'The space kept free at the page edges: a number, or `{ top, right, bottom, left }`.'],
  ['columnWidths', 'The grid\'s widths, scaled to fit', 'The width of each column, in order. An omitted column uses the grid\'s width.'],
  ['fitColumns', "`'shrink'`", "Without `columnWidths`: narrows the grid's widths when wider than the page (`'shrink'`), always makes them as wide as the page (`'fill'`), or leaves them as they are (`'none'`)."],
  ['repeatHeaders', '`true`', 'Repeats the header rows, including bands, at the top of every page.'],
  ['indent', '`0`', 'The indent of a group\'s rows from its group row, per level.'],
  ['customizeCell', '—', '`({ gridCell, pdfCell }) => void` for every cell, before the rows are measured: `text`, `font` (`size`, `name`, `style`), `textColor`, `backgroundColor`, `borderColor`, `borderWidth`, the four `draw…Border` options, `horizontalAlign`, `verticalAlign`, `padding` and `wordWrapEnabled`.'],
  ['customDrawCell', '—', '`({ doc, rect, gridCell, pdfCell, cancel }) => void` before a cell is drawn. Draw it yourself, such as an image or a bar, and set `cancel` (the borders are still drawn).'],
  ['onRowExporting', '—', '`({ rowCells, rowHeight }) => void` before a row is placed. Set a taller `rowHeight` (never less than its text requires).'],
  ['wordWrapEnabled, fontSize', '`false`, `10`', 'Wraps long text onto more lines (otherwise, a line that does not fit ends in “…”), and sets the cell font size in points.'],
  ['selectedRowsOnly', 'The toolbar command, otherwise `false`', 'Exports only the selected rows, without group rows or summaries, as with CSV and Excel.'],
  ['loadPanel', 'On', 'The panel over the rows while they load, with the progress and a Stop button: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`.'],
  ['headers, groups, summaries', '`true`', 'The header rows, one row per group, group summary items, footers and totals.'],
  ['pageSize, onProgress, signal', 'The `exportPageSize` setting', 'The rows per request to a server, a callback after each part, and a signal that stops the export (the promise rejects with an `AbortError`, and nothing is drawn).'],
];

export default function DataGridSelectionPage() {
  return (
    <>
      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selection` is `single`, where the selection follows the active row, or `multiple`, with a check box column. Clicking selects a row, Ctrl adds or removes one, and Shift selects a range. Shift+Space, Shift+arrow keys and Ctrl+A do the same from the keyboard. The header check box selects every row of the filter, including on a server, where the grid keeps a state of “all except these keys” instead of the rows. `selection` provides that state, and `selectionFilter` provides the same thing as a filter for the server. Selected rows use the selection appearance of the design language, as its lists and trees do, with its fill and text color and any frame, raised effect or start bar it defines. The hover and active row tints sit above it, with the keyboard focus ring on top, and a selected row stays one row high." />
        </p>
        <Example files={[...withOrders('Selection.tsx'), slowAdapterFile]} stack>
          <Selection />
        </Example>
      </Section>

      <Section anchor="clipboard" title="Copy and paste">
        <p>
          <Rich text="Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table, so a spreadsheet or document receives it as a table. Ctrl+V on a cell writes tab-separated text, from a spreadsheet or copied from the grid, into the editable cells to the right of and below that cell. Each value is interpreted by column type (numbers and dates by locale, yes or no, and a list option by its text) and goes into the row's draft with validation, as if typed. Cells that cannot be edited keep their values. Rows below the active row are saved according to the save mode." />
        </p>
        <Example files={withOrders('Clipboard.tsx')} stack>
          <Clipboard />
        </Example>
      </Section>

      <Section anchor="export" title="Export">
        <p>
          <Rich text="`exportCsv()` saves the rows of the filter, in sort order, with the visible columns in their order, as a CSV file that a spreadsheet can open directly. The file is UTF-8 with a byte order mark and uses the locale's separator (`;` where decimals use a comma), with column titles first, and text that a spreadsheet would run as a formula is neutralized. `exportRows()` returns the same rows as objects. In-memory rows are used as they are, and server rows are requested in parts through the data source, so its filter, search and sort apply and nothing on screen changes. `exportButton` adds an “Export” button to the toolbar, and `exportable` excludes a column." />
        </p>
        <Example files={[...withOrders('Export.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Export />
        </Example>
      </Section>

      <Section anchor="excel" title="Export to Excel">
        <p>
          <Rich text="The grid does not include an xlsx writer. The application provides ExcelJS (`npm i exceljs`, an optional peer dependency) and calls `exportDataGrid({ component, worksheet })` from `@motifx-community/ui/excel`, a separate entry point that applications without Excel export never load. With `export: { formats: ['xlsx', 'csv'] }`, the toolbar's export button becomes a menu (“Export all data to Excel”, and “Export selected rows to Excel” with `allowExportSelectedData`). The Excel commands raise `onExporting` with `format: 'xlsx'` and `selectedRowsOnly`, and the handler writes and saves the workbook. In this example, it is a Blob download, with ExcelJS loaded on the first export." />
        </p>
        <Example files={withOrders('ExcelExport.tsx')} stack>
          <ExcelExport />
        </Example>
        <p>
          <Rich text="The sheet contains the frozen header row and the rows in grid order with the filter, search and grouping applied. Every matching row is included, and server rows load in parts while a panel over the rows shows the progress and a Stop button. It also includes group rows (“Column: value” with their summary items, with aligned items under their columns) with Excel outline levels, group footers and totals. Numbers stay numbers, with a number format derived from the column's `Intl` format, and dates stay dates. Yes/no cells are Excel's `TRUE` and `FALSE` (`booleanText` writes the grid's text), lookup and list cells contain their text, a column with a `format` function contains its text, and widths follow the grid. `customizeCell({ gridCell, excelCell })` changes any cell, and `gridCell` provides `rowType`, `column`, `data`, `value`, `groupIndex`, `groupSummaryItems` and `totalSummaryItemName`. The promise resolves with the cells written, `{ from, to }`." />
        </p>
        <ApiTable head={['exportDataGrid option', 'Default', 'Description']} rows={EXCEL_OPTIONS} />
      </Section>

      <Section anchor="pdf" title="Export to PDF">
        <p>
          <Rich text="PDF export works the same way. The application provides jsPDF (`npm i jspdf`, an optional peer dependency) and calls `exportDataGrid({ jsPDFDocument, component })` from `@motifx-community/ui/pdf`, a separate entry point. Add `'pdf'` to `export.formats`, and the toolbar menu offers “Export all data to PDF” (and the selected rows). The command raises `onExporting` with `format: 'pdf'`, and the handler creates the document, draws the grid on it and saves it. The table is drawn with jsPDF's own calls and no table plugin. It includes the header rows with bands merged over their columns, the rows in grid order with the filter, search, grouping, text and alignment of the grid, the group rows across the row, the group footers and the totals. Columns use the grid's widths, narrowed to fit the page, and rows that do not fit continue on the next page below repeated header rows. In right-to-left layouts, the columns run from the right edge." />
        </p>
        <Example files={withOrders('PdfExport.tsx')} stack>
          <PdfExport />
        </Example>
        <p>
          <Rich text="The built-in jsPDF fonts (Helvetica, Times, Courier) support Latin-1 only. Turkish letters such as İ, ş and ğ, and Cyrillic, Greek or Arabic text, require a TrueType font that contains them, added to the document before export (`doc.addFileToVFS`, `doc.addFont`, `doc.setFont`). A bold style is also needed, because group rows and totals use it. This example fetches Noto Sans on the first export, and keeps the jsPDF font if the fetch fails. The promise resolves with the end of the table (`{ page, y }`), so that you can continue writing below it." />
        </p>
        <ApiTable head={['exportDataGrid option', 'Default', 'Description']} rows={PDF_OPTIONS} />
      </Section>
    </>
  );
}
