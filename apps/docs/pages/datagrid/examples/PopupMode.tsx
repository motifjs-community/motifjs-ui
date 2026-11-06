import { DataGrid, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** In the window the note takes a line of its own and the number stays out. */
const popupColumns: GridColumn<Order>[] = columns.map((c) =>
  c.field === 'note' ? { ...c, formItem: { colSpan: 'all', label: 'Note for the courier' } } : c.field === 'id' ? { ...c, formItem: { visible: false } } : c,
);

/** Rows edited and added in a modal window: Enter saves, Escape cancels, and focus returns to the row. */
export default function PopupMode() {
  return (
    <DataGrid
      class="dg-popup"
      style="block-size: 28rem"
      rows={makeOrders(25)}
      rowKey="id"
      columns={popupColumns}
      label="Orders in a window"
      locale="en"
      settings={{ editable: true, addRows: true, editMode: 'popup' }}
      newRow={{ create: newOrder }}
      popup={{ title: 'Order', width: '36rem' }}
      form={{ colCount: 2 }}
      actions={['edit', 'remove']}
      onEditorPreparing={(e) => {
        if (e.field === 'note') e.options.placeholder = 'Leave at the door…';
      }}
    />
  );
}
