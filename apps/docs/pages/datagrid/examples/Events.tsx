import { reactive } from '@motifx/core';
import { DataGrid } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The grid's events: amounts over 900 in bold, a row menu of the page's own, no "Cancelled" saved, and a log of what happened. */
export default function Events() {
  const s = reactive({ log: [] as { id: number; text: string }[] });
  let next = 0;
  const log = (text: string) => {
    s.log.unshift({ id: ++next, text });
    if (s.log.length > 5) s.log.pop();
  };

  return (
    <>
      <DataGrid
        class="dg-events"
        style="block-size: 18rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={columns}
        label="Orders with events"
        locale="en"
        settings={{ editable: true }}
        onCellPrepared={(e) => {
          // The cell is reused for other rows: set and clear.
          if (e.field === 'amount') e.element.style.fontWeight = (e.value as number) > 900 ? 'bold' : '';
        }}
        onContextMenuPreparing={(e) => {
          if (e.target === 'row' && e.row) e.items.push({ text: `Log order ${e.row.id}`, click: () => log(`Order ${e.row!.id} from the row menu`) });
        }}
        onRowUpdating={(e) => {
          if (e.changes.status === 'Cancelled') {
            e.cancel = true;
            log(`Order ${e.key}: cancelling is not saved here`);
          }
        }}
        onRowUpdated={(e) => log(`Order ${e.key} saved: ${Object.keys(e.changes).join(', ')}`)}
        onFocusedRowChanged={(e) => e.key !== undefined && log(`Row ${e.key}`)}
        onSortChanged={(e) => log(`Sorted: ${e.sort.map((x) => `${x.field} ${x.dir}`).join(', ') || 'none'}`)}
      />
      <ol class="dg-events-log" aria-label="What happened" aria-live="polite">
        {s.log.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ol>
    </>
  );
}
