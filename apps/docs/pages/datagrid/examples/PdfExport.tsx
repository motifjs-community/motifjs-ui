import { reactive } from '@motifx/core';
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';
import { exportDataGrid } from '@motifx-community/ui/pdf';
import type { jsPDF } from 'jspdf';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

// jsPDF's own fonts write Latin-1 only: "İzmir" and "İlhan Koman" need a font that has their letters.
const FONT = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans@0.2.3/';
let font: Promise<{ regular: string; bold: string }> | null = null;

async function base64(url: string): Promise<string> {
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

/** Noto Sans in the document, fetched once; without the network the document keeps jsPDF's own font. */
async function useNotoSans(doc: jsPDF) {
  font ??= Promise.all([base64(`${FONT}NotoSans_400Regular.ttf`), base64(`${FONT}NotoSans_700Bold.ttf`)]).then(([regular, bold]) => ({ regular, bold }));
  try {
    const { regular, bold } = await font;
    doc.addFileToVFS('NotoSans-Regular.ttf', regular);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', bold);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    doc.setFont('NotoSans', 'normal');
  } catch {
    font = null;
  }
}

/** The toolbar's export menu with PDF: `onExporting` draws the grid on a jsPDF document and saves it. */
export default function PdfExport() {
  const s = reactive({ saved: '' });
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c));
  const summary: GridSummary<Order> = {
    totalItems: [{ column: 'amount', summaryType: 'sum' }],
    groupItems: [
      { column: 'id', summaryType: 'count' },
      { column: 'amount', summaryType: 'sum', showInGroupFooter: true },
    ],
  };

  // the grid raises onExporting for 'pdf' and the file is made here. jsPDF loads
  // the first time someone exports.
  const onExporting = async (e: GridExportingEventArgs) => {
    if (e.format !== 'pdf') return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape' });
    await useNotoSans(doc);
    doc.setFontSize(14);
    doc.text('Orders by city', 14, 14);
    const end = await exportDataGrid({
      jsPDFDocument: doc,
      component: e.component,
      selectedRowsOnly: e.selectedRowsOnly,
      topLeft: { y: 6 },
      margin: 14,
      indent: 4,
      customizeCell: ({ gridCell, pdfCell }) => {
        if (gridCell.rowType === 'group') pdfCell.backgroundColor = '#EEF2F8';
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') pdfCell.textColor = '#B42318';
      },
    });
    doc.save('Orders.pdf');
    s.saved = `Orders.pdf: ${doc.getNumberOfPages()} pages, the table ends on page ${end.page}`;
  };

  return (
    <>
      <DataGrid
        class="dg-pdf"
        style="block-size: 28rem"
        rows={makeOrders(120)}
        rowKey="id"
        columns={byCity}
        label="Orders for PDF"
        locale="en"
        summary={summary}
        settings={{ exportButton: true, selection: 'multiple' }}
        export={{ formats: ['pdf', 'csv'], allowExportSelectedData: true }}
        onExporting={onExporting}
      />
      <output class="dg-pdf-saved">{() => s.saved}</output>
    </>
  );
}
