import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, type GridToolbarItem, type GridToolbarItemName } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** The toolbar: the grid's own items with items of the page's own, at the start and at the end. */
export default function Toolbar() {
  const s = reactive({ striped: true, exportText: false, refreshed: 0 });
  let grid: DataGrid<Order> | null = null;

  const items: (GridToolbarItem | GridToolbarItemName)[] = [
    { name: 'refresh', text: 'Refresh', hint: () => `Refreshed ${s.refreshed} times`, location: 'before', click: () => (grid?.refresh(), s.refreshed++) },
    { name: 'striped', location: 'before', content: () => <CheckBox label="Striped" x-model={() => s.striped} /> },
    { name: 'exportText', location: 'before', content: () => <CheckBox label="“Export” with its text" x-model={() => s.exportText} /> },
    'addRowButton',
    { name: 'exportButton', showText: () => (s.exportText ? 'always' : 'inMenu') },
    'columnChooserButton',
    'searchPanel',
  ];

  return (
    <DataGrid
      class="dg-toolbar"
      style="block-size: 20rem"
      rows={makeOrders(120)}
      rowKey="id"
      columns={columns}
      label="Orders with a toolbar"
      locale="en"
      newRow={{ create: newOrder }}
      settings={{ editable: true, addRows: true, exportButton: true, columnChooserButton: true, searchPanel: true, striped: () => s.striped }}
      toolbar={{ items }}
      ref={(g: DataGrid<Order>) => (grid = g)}
    />
  );
}
