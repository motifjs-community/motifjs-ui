import { reactive } from '@motifx/core';
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';
import { exportDataGrid } from '@motifx-community/ui/excel';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Saves a file through a link the browser downloads. */
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The toolbar's export menu: Excel through ExcelJS and `exportDataGrid`, CSV by the grid itself. */
export default function ExcelExport() {
  const s = reactive({ saved: '' });
  // Grouped by city; the amount in `Intl` options, which become its Excel number format.
  const byCity = columns.map((c) =>
    c.field === 'city' ? { ...c, groupIndex: 0 } : c.field === 'amount' ? { ...c, width: 150, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } : c,
  );
  const summary: GridSummary<Order> = {
    totalItems: [
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },
      { column: 'amount', summaryType: 'sum' },
    ],
    groupItems: [
      { column: 'amount', summaryType: 'sum', alignByColumn: true },
      { column: 'amount', summaryType: 'max', showInGroupFooter: true },
    ],
  };

  // The grid raises onExporting for 'xlsx'; the file is written here. ExcelJS
  // loads the first time, so the page does not carry it until someone exports.
  const onExporting = async (e: GridExportingEventArgs) => {
    if (e.format !== 'xlsx') return;
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    const range = await exportDataGrid({
      component: e.component,
      worksheet,
      selectedRowsOnly: e.selectedRowsOnly,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') excelCell.font = { color: { argb: 'FFB42318' } };
      },
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveFile(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Orders.xlsx');
    s.saved = `Orders.xlsx: rows ${range.from.row}–${range.to.row}, columns ${range.from.column}–${range.to.column}`;
  };

  return (
    <>
      <DataGrid
        class="dg-excel"
        style="block-size: 32rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={byCity}
        label="Orders for Excel"
        locale="en"
        summary={summary}
        settings={{ exportButton: true, selection: 'multiple' }}
        export={{ formats: ['xlsx', 'csv'], allowExportSelectedData: true }}
        onExporting={onExporting}
      />
      <output class="dg-excel-saved">{() => s.saved}</output>
    </>
  );
}
