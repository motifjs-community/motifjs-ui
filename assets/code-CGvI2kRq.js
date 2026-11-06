import{t as e}from"./sources-BXVvOiIY.js";var t=e(Object.assign({"./examples/AdaptiveColumns.tsx":`import { createSignal, reactive } from '@motifx/core';\r
import { Button, DataGrid, Panel, SplitContainer, Stack, type GridColumn, type SplitPosition } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { makeOrders } from './orders';\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** The columns hide in this order as the grid gets narrower: the note first, the customer never. */\r
const columns: GridColumn<Order>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 60, editable: false },\r
  { field: 'customer', title: 'Customer', width: 140 },\r
  { field: 'city', title: 'City', width: 100, hidingPriority: 3 },\r
  { field: 'date', title: 'Date', type: 'date', width: 110, hidingPriority: 2, editable: false },\r
  { field: 'status', title: 'Status', width: 100, hidingPriority: 4 },\r
  { field: 'note', title: 'Note', width: 180, hidingPriority: 0 },\r
  { field: 'amount', title: 'Amount', type: 'number', width: 100, hidingPriority: 1, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
];\r
\r
/** Adaptive columns: drag the splitter (or use the buttons) to make the grid narrower; the "…" opens a row's hidden values. */\r
export default function AdaptiveColumns() {\r
  const s = reactive({ width: '70%' as SplitPosition });\r
  const grid = createSignal<DataGrid<Order> | null>(null);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Narrow" variant="outline" onclick={() => (s.width = 420)} />\r
        <Button text="Medium" variant="outline" onclick={() => (s.width = 640)} />\r
        <Button text="Wide" variant="outline" onclick={() => (s.width = '100%')} />\r
        <Button text="Open row 3" variant="ghost" onclick={() => grid.value?.expandAdaptiveDetailRow(3)} />\r
        <output class="dg-adaptive-hidden">{() => \`hidden: \${grid.value?.adaptiveHiddenColumns.join(', ') || 'none'}\`}</output>\r
      </Stack>\r
      <SplitContainer class="dg-adaptive-split" x-model={() => s.width} firstMinSize={240} secondMinSize={0} collapsible={false} style="block-size: 30rem; inline-size: 100%">\r
        <DataGrid\r
          class="dg-adaptive"\r
          style="block-size: 100%"\r
          rows={makeOrders(300)}\r
          rowKey="id"\r
          columns={columns}\r
          label="Orders that adapt to their width"\r
          locale="en"\r
          settings={{ editable: true }}\r
          saveMode="batch"\r
          ref={(g: DataGrid<Order>) => (grid.value = g)}\r
        />\r
        <Panel text="Room" padding="sm">\r
          <p>The space the grid gives up.</p>\r
        </Panel>\r
      </SplitContainer>\r
    </>\r
  );\r
}\r
`,"./examples/BandHeaders.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack, type GridColumnItem } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { makeOrders } from './orders';\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** Two levels of bands over the order columns. */\r
const columns: GridColumnItem<Order>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 70 },\r
  {\r
    name: 'order',\r
    title: 'Order',\r
    columns: [\r
      { field: 'customer', title: 'Customer', width: 170 },\r
      { field: 'date', title: 'Date', type: 'date', width: 120 },\r
      {\r
        name: 'delivery',\r
        title: 'Delivery',\r
        columns: [\r
          { field: 'city', title: 'City', width: 120 },\r
          { field: 'note', title: 'Note', width: 220 },\r
        ],\r
      },\r
    ],\r
  },\r
  {\r
    name: 'payment',\r
    title: 'Payment',\r
    align: 'end',\r
    columns: [\r
      { field: 'status', title: 'Status', width: 110 },\r
      { field: 'paid', title: 'Paid', type: 'boolean', width: 70 },\r
      { field: 'amount', title: 'Amount', type: 'number', width: 110, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
    ],\r
  },\r
];\r
\r
/** Band headers: drag a column inside its band or a band among its neighbors, and pin and hide bands from their menus. */\r
export default function BandHeaders() {\r
  const s = reactive({ csv: '', layout: '' });\r
  let grid: DataGrid<Order> | null = null;\r
  const showLayout = () => (s.layout = grid ? JSON.stringify(grid.layout.bands) : '');\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Pin “Order”" variant="outline" onclick={() => grid?.columnOption('order', 'sticky', grid.columnOption('order', 'sticky') ? null : 'start')} />\r
        <Button text="Hide or show “Delivery”" variant="outline" onclick={() => grid?.columnOption('delivery', 'visible', !grid.columnOption('delivery', 'visible'))} />\r
        <Button text="Columns…" variant="outline" onclick={() => grid?.showColumnChooser()} />\r
        <Button\r
          text="CSV header"\r
          variant="ghost"\r
          onclick={async () => {\r
            const csv = (await grid?.exportCsv({ download: false, bom: false, separator: ',' })) ?? '';\r
            s.csv = csv.split('\\r\\n').slice(0, 3).join('\\n');\r
          }}\r
        />\r
      </Stack>\r
      <DataGrid\r
        class="dg-bands"\r
        style="block-size: 28rem"\r
        rows={makeOrders(200)}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders under band headers"\r
        locale="en"\r
        settings={{ columnChooserButton: true }}\r
        onLayoutChange={() => showLayout()}\r
        onContentReady={() => showLayout()}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-bands-layout">{() => \`bands: \${s.layout}\`}</output>\r
      <pre class="dg-bands-csv" x-display={() => s.csv !== ''}>\r
        {() => s.csv}\r
      </pre>\r
    </>\r
  );\r
}\r
`,"./examples/BarActions.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack, type GridAction, type GridActionLocation } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
const LOCATIONS: GridActionLocation[] = ['row', 'toolbar', 'bottom'];\r
\r
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));\r
\r
/** The actions of the selected rows in the toolbar or the bottom bar; several rows share the ones they all have. */\r
export default function BarActions() {\r
  const s = reactive({ orders: makeOrders(40), location: 'toolbar' as GridActionLocation, menu: false, note: '' });\r
  let grid: DataGrid<Order> | null = null;\r
  // The grid reads the rows as they are, so after a change in place it redraws them and re-reads their actions.\r
  const changed = (rows: readonly Order[]) => {\r
    grid?.repaintRows(rows.map((row) => row.id));\r
    grid?.refreshActions();\r
  };\r
\r
  const approve: GridAction<Order> = {\r
    id: 'approve',\r
    text: 'Approve',\r
    tone: 'accent',\r
    visible: (row) => row.status === 'Draft',\r
    // Once for every selected row: one request to the server.\r
    onclickMany: async (rows) => {\r
      await wait(300);\r
      for (const row of rows) row.status = 'Approved';\r
      changed(rows);\r
      s.note = \`\${rows.length} orders approved\`;\r
    },\r
    onclick: (row) => {\r
      row.status = 'Approved';\r
      changed([row]);\r
      s.note = \`Order \${row.id} approved\`;\r
    },\r
  };\r
  // Row by row: the grid shows the progress and a Stop button.\r
  const print: GridAction<Order> = {\r
    id: 'print',\r
    text: 'Print',\r
    onclick: async (row) => {\r
      await wait(400);\r
      s.note = \`Order \${row.id} printed\`;\r
    },\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Where the actions show">\r
        {LOCATIONS.map((at) => (\r
          <Button key={at} text={at} size="sm" variant={() => (s.location === at ? 'solid' : 'ghost')} aria-pressed={() => s.location === at} onclick={() => (s.location = at)} />\r
        ))}\r
        <CheckBox label="Menu only" x-model={() => s.menu} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-bar-actions"\r
        style="block-size: 28rem"\r
        rows={() => s.orders}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders to approve"\r
        locale="en"\r
        saveMode="batch"\r
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, print, 'remove'])}\r
        settings={{ selection: 'multiple', actionsLocation: () => s.location, actionsDisplay: () => (s.menu ? 'menu' : 'auto') }}\r
        onActionRan={(e) => {\r
          if (e.canceled) s.note = \`\${e.action.id}: stopped after \${e.done} rows\`;\r
        }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-bar-note">{() => s.note}</output>\r
    </>\r
  );\r
}\r
`,"./examples/BatchSave.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { OrderService } from './order-service';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
/** Every change kept until "Save changes", over a server that loads by page; the page's own buttons. */\r
export default function BatchSave() {\r
  const s = reactive({ note: '' });\r
  const service = new OrderService({ data: makeOrders(200), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 250);\r
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'page', pageSize: 15 });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const save = async () => {\r
    const result = await grid?.saveChanges();\r
    if (result) s.note = \`\${result.saved} saved, \${result.failed} failed\`;\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-batch"\r
        style="block-size: 34rem"\r
        dataSource={orders}\r
        columns={columns}\r
        label="Orders saved together"\r
        locale="en"\r
        saveMode="batch"\r
        settings={{ editable: true, addRows: true, saveButtons: false, actionsWidth: 100 }}\r
        newRow={{ create: newOrder }}\r
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : ['remove'])}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save changes" tone="accent" enabled={() => !!grid?.hasChanges} onclick={save} />\r
        <Button text="Discard" variant="outline" enabled={() => !!grid?.hasChanges} onclick={() => grid?.discardChanges()} />\r
        <output class="dg-batch-note">{() => \`\${grid?.changes.count ?? 0} unsaved\${s.note ? \` · \${s.note}\` : ''}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/Cascade.tsx":`import { data } from '@motifx-community/data';\r
import { DataGrid, type GridColumn } from '@motifx-community/ui';\r
import { DISTRICTS, PROVINCES } from './places';\r
\r
type Branch = { id: number; name: string; province: string | null; district: number | null };\r
\r
const branches: Branch[] = [\r
  { id: 1, name: 'Head office', province: 'AN', district: 1 },\r
  { id: 2, name: 'Harbour', province: 'IZ', district: 9 },\r
  { id: 3, name: 'Bridge', province: 'IS', district: 6 },\r
  { id: 4, name: 'Not placed yet', province: null, district: null },\r
];\r
\r
const columns: GridColumn<Branch>[] = [\r
  { field: 'name', title: 'Branch', width: 160, flex: 1, required: true },\r
  {\r
    field: 'province',\r
    title: 'Province',\r
    width: 150,\r
    lookup: { dataSource: PROVINCES, valueField: 'code', textField: 'name' },\r
    // Another province empties the district.\r
    setCellValue: (values) => {\r
      values.district = null;\r
    },\r
  },\r
  {\r
    field: 'district',\r
    title: 'District',\r
    width: 150,\r
    lookup: {\r
      dataSource: DISTRICTS,\r
      valueField: 'id',\r
      textField: 'name',\r
      allowClearing: true,\r
      // The districts of the province entered (else the row's); every district for the filter lists.\r
      filter: (row, { getValue }) => (row ? data.where('province', '=', getValue('province')) : null),\r
    },\r
  },\r
];\r
\r
/** Province and district: a new province clears the district, whose list follows the province and waits for one. */\r
export default function Cascade() {\r
  return (\r
    <DataGrid\r
      class="dg-cascade"\r
      style="block-size: 24rem"\r
      rows={branches}\r
      rowKey="id"\r
      columns={columns}\r
      label="Branches"\r
      locale="en"\r
      settings={{ editable: true, addRows: true, filterRow: true, headerFilter: true }}\r
      newRow={{ create: () => ({ id: Math.max(0, ...branches.map((b) => b.id)) + 1, province: null, district: null }) }}\r
      onEditorPreparing={(e) => {\r
        if (e.field === 'district') e.options.enabled = e.getValue('province') !== null;\r
      }}\r
    />\r
  );\r
}\r
`,"./examples/CellRanges.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack, type GridCellSelectionChangedEventArgs } from '@motifx-community/ui';\r
import { columns, makeOrders } from './orders';\r
\r
const MODES = ['none', 'single', 'multiple'] as const;\r
\r
/** Ranges of cells as in a spreadsheet: drawn, extended, copied, filled and emptied; the bar sums them up. */\r
export default function CellRanges() {\r
  const s = reactive({ mode: 'multiple' as (typeof MODES)[number], drag: true, summary: true, touch: false, note: false, last: '' });\r
  const told = (e: GridCellSelectionChangedEventArgs) =>\r
    (s.last = e.ranges.map((r) => \`\${r.from.key ?? r.from.rowIndex}.\${r.from.field} → \${r.to.key ?? r.to.rowIndex}.\${r.to.field}\`).join(', ') + (e.byDrag ? ' (drawing)' : ''));\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Cell selection">\r
        {MODES.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />\r
        ))}\r
        <CheckBox label="Draw by dragging" x-model={() => s.drag} />\r
        <CheckBox label="Summary in the bar" x-model={() => s.summary} />\r
        <CheckBox label="Long press on touch" x-model={() => s.touch} />\r
        <CheckBox label="Note can be selected" x-model={() => s.note} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-cell-ranges"\r
        style="block-size: 28rem"\r
        rows={makeOrders(60)}\r
        rowKey="id"\r
        columns={columns.map((c) => (c.field === 'note' ? { ...c, cellSelectable: () => s.note } : c))}\r
        label="Orders as a sheet"\r
        locale="en"\r
        settings={{\r
          editable: true,\r
          cellSelection: () => s.mode,\r
          cellDragSelection: () => s.drag,\r
          cellSummary: () => s.summary,\r
          dragSelectionTouch: () => (s.touch ? 'longPress' : 'scroll'),\r
        }}\r
        onCellSelectionChanged={told}\r
      />\r
      <output class="dg-cell-ranges-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,"./examples/CellRangesVirtual.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack, type GridColumnItem } from '@motifx-community/ui';\r
\r
type Reading = { id: number };\r
\r
const SENSORS = 60;\r
\r
const columns: GridColumnItem<Reading>[] = [\r
  { field: 'id', title: 'Hour', type: 'number', width: 90, sticky: 'start' },\r
  ...Array.from({ length: SENSORS }, (_, n) => ({ field: \`s\${n}\`, title: \`S\${n + 1}\`, type: 'number' as const, width: 90, value: (r: Reading) => ((r.id * (n + 7)) % 1000) / 10 })),\r
];\r
\r
const rows: Reading[] = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1 }));\r
\r
/** 100,000 rows × 60 virtual columns: a range is drawn over pooled rows, only the drawn cells carry its marks. */\r
export default function CellRangesVirtual() {\r
  const s = reactive({ told: '' });\r
  let grid: DataGrid<Reading> | null = null;\r
  const show = () => {\r
    const sum = grid?.cellSelectionSummary;\r
    s.told = sum ? \`\${sum.cells.toLocaleString('en')} cells, sum \${sum.sum.toLocaleString('en')}\` : '';\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Hours 10–20, S1–S5" size="sm" variant="outline" onclick={() => grid?.selectCells({ key: 10, field: 's0' }, { key: 20, field: 's4' }) && show()} />\r
        <Button text="Add hour 50, S10–S12" size="sm" variant="outline" onclick={() => grid?.selectCells({ key: 50, field: 's9' }, { key: 50, field: 's11' }, true) && show()} />\r
        <Button text="Clear" size="sm" variant="ghost" onclick={() => grid?.clearCellSelection()} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-range-virtual"\r
        style="block-size: 30rem"\r
        rows={rows}\r
        rowKey="id"\r
        columns={columns}\r
        label="Sensor readings as a sheet"\r
        locale="en"\r
        settings={{ cellSelection: 'multiple', columnRenderingMode: 'virtual' }}\r
        onCellSelectionChanged={show}\r
        ref={(g: DataGrid<Reading>) => (grid = g)}\r
      />\r
      <output class="dg-range-virtual-state">{() => s.told}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Clipboard.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** Ctrl+C and Ctrl+V as tab-separated text, and the same programmatically. */\r
export default function Clipboard() {\r
  const s = reactive({ raw: false, headers: false, newRows: false, copied: '' });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Values, not the shown text" x-model={() => s.raw} />\r
        <CheckBox label="Column titles" x-model={() => s.headers} />\r
        <CheckBox label="New rows from extra lines" x-model={() => s.newRows} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-clipboard"\r
        style="block-size: 28rem"\r
        rows={makeOrders(20)}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders to copy"\r
        locale="en"\r
        saveMode="batch"\r
        settings={{\r
          editable: true,\r
          addRows: true,\r
          selection: 'multiple',\r
          copyValues: () => (s.raw ? 'raw' : 'shown'),\r
          copyHeaders: () => s.headers,\r
          pasteNewRows: () => s.newRows,\r
        }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Copy programmatically" variant="outline" onclick={() => (s.copied = grid?.copy() ?? '')} />\r
        <Button text="Paste two lines at the active cell" variant="outline" onclick={() => grid?.paste('Ada Lovelace\\tİzmir\\nGrace Hopper\\tAnkara')} />\r
        <output class="dg-copied">{() => (s.copied ? \`Copied: \${s.copied.replace(/\\t/g, ' → ').replace(/\\r?\\n/g, ' ¶ ')}\` : '')}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/DetailTabs.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, FormLayout, Stack, Tab, Tabs, type DetailContext, type FormItem, type GridColumn } from '@motifx-community/ui';\r
import { makeCustomerOrders } from './customer-orders';\r
import { makeCustomers, type Customer } from './customers';\r
\r
const customers = makeCustomers(60);\r
const orders = makeCustomerOrders(customers);\r
const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });\r
\r
/** The details of a customer: its fields and the total of its orders. */\r
interface Profile extends Customer {\r
  orders: number;\r
  total: string;\r
  since: string;\r
}\r
\r
const profiles: Profile[] = customers.map((c) => {\r
  const own = orders.filter((o) => o.customerId === c.id);\r
  return { ...c, orders: own.length, total: money.format(own.reduce((sum, o) => sum + o.amount, 0)), since: own[0]?.date ?? '' };\r
});\r
\r
const columns: GridColumn<Profile>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 80 },\r
  { field: 'name', title: 'Customer', width: 220, flex: 1 },\r
  { field: 'city', title: 'City', width: 140 },\r
  { field: 'orders', title: 'Orders', type: 'number', width: 100 },\r
];\r
\r
const items: FormItem[] = [\r
  { field: 'name', label: 'Name' },\r
  { field: 'city', label: 'City' },\r
  { field: 'since', label: 'First order' },\r
  { field: 'total', label: 'Orders total' },\r
];\r
\r
/** A customer's details: tabs, the first with a read-only form. The other tab is created when first shown, and the row grows with it. */\r
function CustomerTabs(props: { ctx: DetailContext<Profile> }) {\r
  const profile = reactive({ ...props.ctx.row });\r
  return (\r
    <Tabs label={\`About \${profile.name}\`} size="sm">\r
      <Tab title="Profile">\r
        <FormLayout data={profile} items={items} columns={2} readOnly />\r
      </Tab>\r
      <Tab title="Orders">\r
        <ul class="dg-detail-list">\r
          {orders\r
            .filter((o) => o.customerId === profile.id)\r
            .map((o) => (\r
              <li key={String(o.id)}>{\`\${o.date} · \${o.item} × \${o.quantity} · \${money.format(o.amount)}\`}</li>\r
            ))}\r
        </ul>\r
        <Button text="Close" size="sm" variant="outline" onclick={() => props.ctx.collapse()} />\r
      </Tab>\r
    </Tabs>\r
  );\r
}\r
\r
/** Customers with tabs in their details; those without orders have none. The buttons open and close every row. */\r
export default function DetailTabs() {\r
  const s = reactive({ log: '' });\r
  let grid: DataGrid<Profile> | null = null;\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Details">\r
        <Button text="Open all" size="sm" variant="outline" onclick={() => grid?.expandAllRows()} />\r
        <Button text="Close all" size="sm" variant="outline" onclick={() => grid?.collapseAllRows()} />\r
        <output class="dg-detail-log">{() => s.log}</output>\r
      </Stack>\r
      <DataGrid\r
        class="dg-detail-tabs"\r
        style="block-size: 30rem"\r
        ref={(g: DataGrid<Profile>) => (grid = g)}\r
        rows={profiles}\r
        rowKey="id"\r
        columns={columns}\r
        label="Customers with their details"\r
        locale="en"\r
        settings={{ selection: 'single' }}\r
        masterDetail={{ enabled: true, canExpand: (row: Profile) => row.orders > 0, template: (ctx) => <CustomerTabs ctx={ctx} /> }}\r
        onRowExpanded={(e) => e.kind === 'detail' && (s.log = \`Opened \${(e.row as Profile).name}\`)}\r
        onRowCollapsed={(e) => e.kind === 'detail' && (s.log = \`Closed \${(e.row as Profile).name}\`)}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/DragSelectRows.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, Stack, type GridSelectionChangedEventArgs } from '@motifx-community/ui';\r
import { columns, makeOrders } from './orders';\r
\r
/** Rows selected by dragging over them: live, with Ctrl to add, Shift from the anchor, over the check boxes too. */\r
export default function DragSelectRows() {\r
  const s = reactive({ drag: true, scroll: true, grouped: false, last: '' });\r
  const told = (e: GridSelectionChangedEventArgs) => (s.last = \`\${e.selection.keys.length} keys\${e.byDrag ? ', by dragging' : ''}\`);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Select rows by dragging" x-model={() => s.drag} />\r
        <CheckBox label="Scroll near the edges" x-model={() => s.scroll} />\r
        <CheckBox label="Group by city" x-model={() => s.grouped} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-drag-rows"\r
        style="block-size: 28rem"\r
        rows={makeOrders(300)}\r
        rowKey="id"\r
        columns={columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: () => (s.grouped ? 0 : undefined) } : c))}\r
        label="Orders to select by dragging"\r
        locale="en"\r
        settings={{ selection: 'multiple', rowDragSelection: () => s.drag, dragSelectionAutoScroll: () => s.scroll }}\r
        onSelectionChanged={told}\r
      />\r
      <output class="dg-drag-rows-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Events.tsx":`import { reactive } from '@motifx/core';\r
import { DataGrid } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** The grid's events: amounts over 900 in bold, a custom row menu, "Cancelled" not saved, and a log of what happened. */\r
export default function Events() {\r
  const s = reactive({ log: [] as { id: number; text: string }[] });\r
  let next = 0;\r
  const log = (text: string) => {\r
    s.log.unshift({ id: ++next, text });\r
    if (s.log.length > 5) s.log.pop();\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-events"\r
        style="block-size: 28rem"\r
        rows={makeOrders(60)}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders with events"\r
        locale="en"\r
        settings={{ editable: true }}\r
        onCellPrepared={(e) => {\r
          // The cell is reused for other rows: set and clear.\r
          if (e.field === 'amount') e.element.style.fontWeight = (e.value as number) > 900 ? 'bold' : '';\r
        }}\r
        onContextMenuPreparing={(e) => {\r
          if (e.target === 'row' && e.row) e.items.push({ text: \`Log order \${e.row.id}\`, click: () => log(\`Order \${e.row!.id} from the row menu\`) });\r
        }}\r
        onRowUpdating={(e) => {\r
          if (e.changes.status === 'Cancelled') {\r
            e.cancel = true;\r
            log(\`Order \${e.key}: cancelling is not saved here\`);\r
          }\r
        }}\r
        onRowUpdated={(e) => log(\`Order \${e.key} saved: \${Object.keys(e.changes).join(', ')}\`)}\r
        onFocusedRowChanged={(e) => e.key !== undefined && log(\`Row \${e.key}\`)}\r
        onSortChanged={(e) => log(\`Sorted: \${e.sort.map((x) => \`\${x.field} \${x.dir}\`).join(', ') || 'none'}\`)}\r
      />\r
      <ol class="dg-events-log" aria-label="What happened" aria-live="polite">\r
        {s.log.map((entry) => (\r
          <li key={entry.id}>{entry.text}</li>\r
        ))}\r
      </ol>\r
    </>\r
  );\r
}\r
`,"./examples/ExcelExport.tsx":`import { reactive } from '@motifx/core';\r
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';\r
import { exportDataGrid } from '@motifx-community/ui/excel';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** Saves a file through a link the browser downloads. */\r
function saveFile(blob: Blob, name: string) {\r
  const url = URL.createObjectURL(blob);\r
  const link = document.createElement('a');\r
  link.href = url;\r
  link.download = name;\r
  link.click();\r
  setTimeout(() => URL.revokeObjectURL(url), 1000);\r
}\r
\r
/** The toolbar's export menu: Excel through ExcelJS and \`exportDataGrid\`, CSV by the grid itself. */\r
export default function ExcelExport() {\r
  const s = reactive({ saved: '' });\r
  // Grouped by city; the amount in \`Intl\` options, which become its Excel number format.\r
  const byCity = columns.map((c) =>\r
    c.field === 'city' ? { ...c, groupIndex: 0 } : c.field === 'amount' ? { ...c, width: 150, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } : c,\r
  );\r
  const summary: GridSummary<Order> = {\r
    totalItems: [\r
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },\r
      { column: 'amount', summaryType: 'sum' },\r
    ],\r
    groupItems: [\r
      { column: 'amount', summaryType: 'sum', alignByColumn: true },\r
      { column: 'amount', summaryType: 'max', showInGroupFooter: true },\r
    ],\r
  };\r
\r
  // The grid raises onExporting for 'xlsx'; the file is written here. ExcelJS\r
  // loads the first time, so the page does not carry it until someone exports.\r
  const onExporting = async (e: GridExportingEventArgs) => {\r
    if (e.format !== 'xlsx') return;\r
    const { default: ExcelJS } = await import('exceljs');\r
    const workbook = new ExcelJS.Workbook();\r
    const worksheet = workbook.addWorksheet('Orders');\r
    const range = await exportDataGrid({\r
      component: e.component,\r
      worksheet,\r
      selectedRowsOnly: e.selectedRowsOnly,\r
      autoFilterEnabled: true,\r
      customizeCell: ({ gridCell, excelCell }) => {\r
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') excelCell.font = { color: { argb: 'FFB42318' } };\r
      },\r
    });\r
    const buffer = await workbook.xlsx.writeBuffer();\r
    saveFile(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Orders.xlsx');\r
    s.saved = \`Orders.xlsx: rows \${range.from.row}–\${range.to.row}, columns \${range.from.column}–\${range.to.column}\`;\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-excel"\r
        style="block-size: 32rem"\r
        rows={makeOrders(200)}\r
        rowKey="id"\r
        columns={byCity}\r
        label="Orders for Excel"\r
        locale="en"\r
        summary={summary}\r
        settings={{ exportButton: true, selection: 'multiple' }}\r
        export={{ formats: ['xlsx', 'csv'], allowExportSelectedData: true }}\r
        onExporting={onExporting}\r
      />\r
      <output class="dg-excel-saved">{() => s.saved}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Export.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, filterColumns, makeOrders } from './orders';\r
import { pagedOrders } from './paged-orders';\r
\r
/** The bar's "Export" button, rows as objects, and 100,000 rows of a server saved in parts. */\r
export default function Export() {\r
  const s = reactive({ exported: '', progress: '' });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const firstTwo = async () => {\r
    const rows = (await grid?.exportRows({ values: 'raw' })) ?? [];\r
    s.exported = JSON.stringify(rows.slice(0, 2));\r
  };\r
\r
  // A grid created with \`new\` can export without being shown. This one reads the orders of the paged grid.\r
  const exportServer = async () => {\r
    const server = new DataGrid<Order>({ dataSource: pagedOrders, columns, label: 'Orders by page', locale: 'en' });\r
    s.progress = 'starting…';\r
    try {\r
      await server.exportCsv({ pageSize: 10_000, fileName: 'orders', onProgress: (n, total) => (s.progress = \`\${n.toLocaleString('en')} of \${total.toLocaleString('en')}\`) });\r
      s.progress += ' — saved';\r
    } catch {\r
      s.progress = 'failed';\r
    } finally {\r
      server.dispose();\r
    }\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-export"\r
        style="block-size: 28rem"\r
        rows={makeOrders(60)}\r
        rowKey="id"\r
        columns={filterColumns}\r
        label="Orders to export"\r
        locale="en"\r
        settings={{ exportButton: true, filterRow: true }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="The first two rows as objects" variant="outline" onclick={firstTwo} />\r
        <Button text="Export the 100,000 orders by page" variant="outline" onclick={() => void exportServer()} />\r
      </Stack>\r
      <output class="dg-exported">{() => s.exported}</output>\r
      <output class="dg-export-progress">{() => (s.progress ? \`Server export: \${s.progress}\` : '')}</output>\r
    </>\r
  );\r
}\r
`,"./examples/FilterPanel.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, RadioGroup, Stack, Switch } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { filterColumns, makeOrders } from './orders';\r
\r
/** The filter panel and its builder, on 100,000 orders of a server or 200 in memory, the filter row and header filters kept in step. */\r
export default function FilterPanel() {\r
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });\r
  const rows = makeOrders(200);\r
  const s = reactive({ where: 'server', sync: true, filter: null as data.FilterExpression | null });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <RadioGroup\r
          label="Rows"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'server', text: '100,000 on a server' },\r
            { value: 'memory', text: '200 in memory' },\r
          ]}\r
          x-model={() => s.where}\r
        />\r
        <Switch label="filterSyncEnabled" x-model={() => s.sync} />\r
        <Button text="Open the builder" variant="outline" onclick={() => grid?.openFilterBuilder()} />\r
        <Button\r
          text="Paid, over 900"\r
          variant="ghost"\r
          onclick={() => (s.filter = data.and(data.where('paid', '=', true), data.where('amount', '>', 900)))}\r
        />\r
      </Stack>\r
      <DataGrid\r
        class="dg-server-filters"\r
        style="block-size: 30rem"\r
        dataSource={() => (s.where === 'server' ? orders : null)}\r
        rows={rows}\r
        rowKey="id"\r
        columns={filterColumns}\r
        label="Orders with a filter panel"\r
        locale="en"\r
        settings={{ filterPanel: true, filterSyncEnabled: () => s.sync }}\r
        filterValue={() => s.filter}\r
        filterBuilder={{ maxGroupLevel: 2 }}\r
        filterBuilderPopup={{ title: 'Filter the orders' }}\r
        onFilterChanged={(e) => (s.filter = e.filterValue)}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-server-filter">{() => \`\${(grid?.total ?? 0).toLocaleString('en')} orders · \${JSON.stringify(grid?.filter ?? null)}\`}</output>\r
      <output class="dg-filter-value">{() => \`filterValue: \${JSON.stringify(s.filter)}\`}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Filters.tsx":`import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { filterColumns, makeOrders } from './orders';\r
\r
/** The filter row and the header filter, on rows in memory. */\r
export default function Filters() {\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const setFilters = () => {\r
    if (grid) grid.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } };\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-filters"\r
        style="block-size: 30rem"\r
        rows={makeOrders(200)}\r
        rowKey="id"\r
        columns={filterColumns}\r
        label="Orders to filter"\r
        locale="en"\r
        settings={{ striped: true }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Ankara and İzmir, 100 to 500" variant="outline" onclick={setFilters} />\r
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />\r
        <output class="dg-filter-count">{() => \`\${grid?.total ?? 0} of 200 orders\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/FormMode.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { OrderService } from './order-service';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
const MODES: GridSettings['editMode'][] = ['row', 'cell', 'batch', 'form', 'popup'];\r
\r
/** The note gets the whole width of the form and a line of help. */\r
const formColumns: GridColumn<Order>[] = columns.map((c) => (c.field === 'note' ? { ...c, formItem: { colSpan: 'all', helpText: 'Shown to the courier.' } } : c));\r
\r
/** One grid in every edit mode; in 'form' the row opens as a form with two groups. */\r
export default function FormMode() {\r
  const s = reactive({ mode: 'form' as GridSettings['editMode'] });\r
  const service = new OrderService({ data: makeOrders(40), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);\r
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">\r
        {MODES.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-form"\r
        style="block-size: 30rem"\r
        dataSource={orders}\r
        columns={formColumns}\r
        label="Orders in an edit form"\r
        locale="en"\r
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}\r
        newRow={{ create: newOrder }}\r
        actions={['edit', 'remove']}\r
        form={{\r
          colCount: 2,\r
          items: [\r
            { group: 'Order', items: [{ field: 'customer' }, { field: 'date' }, { field: 'status' }, { field: 'amount' }] },\r
            { group: 'Delivery', items: [{ field: 'city' }, { field: 'paid' }, { field: 'note' }] },\r
          ],\r
        }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/Grouping.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** Orders in memory grouped by city, then by status; the group panel and the switches change it. */\r
export default function Grouping() {\r
  const s = reactive({ panel: true, dragging: true, open: true, collapsing: true, rowClick: false, showCity: false });\r
  let grid: DataGrid<Order> | null = null;\r
  const grouped = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, showWhenGrouped: () => s.showCity } : c.field === 'status' ? { ...c, groupIndex: 1 } : c));\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Group panel" x-model={() => s.panel} />\r
        <CheckBox label="Drag to group" x-model={() => s.dragging} />\r
        <CheckBox label="Groups start open" x-model={() => s.open} />\r
        <CheckBox label="The user can open and close" x-model={() => s.collapsing} />\r
        <CheckBox label="A click on the row opens" x-model={() => s.rowClick} />\r
        <CheckBox label="City stays a column" x-model={() => s.showCity} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-grouping"\r
        style="block-size: 34rem"\r
        rows={makeOrders(500)}\r
        rowKey="id"\r
        columns={grouped}\r
        label="Orders by city and status"\r
        locale="en"\r
        settings={{\r
          groupPanel: () => s.panel,\r
          groupPanelDragging: () => s.dragging,\r
          autoExpandAll: () => s.open,\r
          allowCollapsing: () => s.collapsing,\r
          groupExpandMode: () => (s.rowClick ? 'rowClick' : 'button'),\r
          selection: 'multiple',\r
        }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />\r
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />\r
        <Button text="Open only the cities" variant="outline" onclick={() => (grid?.expandAll(0), grid?.collapseAll(1))} />\r
        <Button text="Ungroup" variant="outline" onclick={() => grid?.clearGrouping()} />\r
        <output class="dg-grouping-state">{() => \`Grouped by \${grid?.group.map((g) => \`\${g.field} \${g.dir}\`).join(', ') || 'nothing'}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/GroupingServer.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** 100,000 orders grouped on the server: the groups arrive with their counts, and rows load only in the visible area. */\r
export default function GroupingServer() {\r
  const s = reactive({ loads: 0 });\r
  // An adapter that groups (here rows in memory acting as a server) answers \`group\` itself; one\r
  // that cannot (OData, REST) gets every matching row grouped in the browser instead.\r
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);\r
  server.onLoading(() => s.loads++);\r
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });\r
  const grouped = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c));\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-grouping-server"\r
        style="block-size: 32rem"\r
        dataSource={orders}\r
        columns={grouped}\r
        label="100,000 orders by status"\r
        locale="en"\r
        settings={{ groupPanel: true }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open “Shipped”" variant="outline" onclick={() => grid?.expandGroup(['Shipped'])} />\r
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />\r
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />\r
        <output class="dg-grouping-loads">{() => \`\${s.loads} loads for \${grid?.total ?? 0} rows\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/HeaderFilterIntervals.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
const COAST = ['Antalya', 'İstanbul', 'İzmir', 'Trabzon'];\r
\r
/** The order columns with header filters: amounts in ranges, dates in a tree, cities with custom entries, and excluded statuses. */\r
const intervalColumns: GridColumn<Order>[] = columns.map((c) => {\r
  switch (c.field) {\r
    case 'amount':\r
      // "0 – 250", "250 – 500" …\r
      return { ...c, headerFilter: true, headerFilterInterval: 250 };\r
    case 'date':\r
      // Year → month → day, by the grid's headerFilterDateInterval.\r
      return { ...c, headerFilter: true };\r
    case 'city':\r
      return {\r
        ...c,\r
        headerFilter: true,\r
        headerFilterItems: [\r
          { text: 'On the coast', value: data.where('city', 'in', COAST) },\r
          { text: 'Inland', value: data.not(data.where('city', 'in', COAST)) },\r
          { text: 'Ankara only', value: 'Ankara' },\r
        ],\r
      };\r
    case 'status':\r
      // Every status except Cancelled, so statuses added later also appear.\r
      return { ...c, headerFilter: true, filterValues: ['Cancelled'], filterType: 'exclude' };\r
    default:\r
      return c;\r
  }\r
});\r
\r
/** The header filter with ranges of amounts, a tree of dates, custom entries and excluded values. */\r
export default function HeaderFilterIntervals() {\r
  const s = reactive({ months: false });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => (s.months ? 'Dates down to the day' : 'Dates down to the month')} variant="outline" onclick={() => (s.months = !s.months)} />\r
        <Button text="Amounts in ranges of 1,000" variant="outline" onclick={() => grid?.columnOption('amount', 'headerFilterInterval', 1000)} />\r
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-intervals"\r
        style="block-size: 30rem"\r
        rows={makeOrders(300)}\r
        rowKey="id"\r
        columns={intervalColumns}\r
        label="Orders filtered by ranges and dates"\r
        locale="en"\r
        settings={{ headerFilterDateInterval: () => (s.months ? 'month' : 'day') }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-intervals-filter">{() => \`\${grid?.total ?? 0} orders · \${JSON.stringify(grid?.filters ?? {})}\`}</output>\r
    </>\r
  );\r
}\r
`,"./examples/InfiniteGroups.tsx":`import { DataGrid } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** 2,000 orders in memory, grouped by city: the group rows and the rows show 100 places at a time. */\r
export default function InfiniteGroups() {\r
  return (\r
    <DataGrid\r
      class="dg-infinite-groups"\r
      style="block-size: 28rem"\r
      mode="infinite"\r
      pageSize={100}\r
      rows={makeOrders(2_000)}\r
      rowKey="id"\r
      columns={columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c))}\r
      label="Orders by city, part by part"\r
      locale="en"\r
      settings={{ groupPanel: true, selection: 'multiple' }}\r
      summary={{ groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }] }}\r
      masterDetail={{ enabled: true, template: (ctx) => <p class="dg-infinite-detail">{() => \`\${(ctx.row as Order).customer} · \${(ctx.row as Order).note || 'no note'}\`}</p> }}\r
    />\r
  );\r
}\r
`,"./examples/InfiniteScroll.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** A server that cannot count, and fails on purpose while \`failing\` is on. */\r
class OrderServer extends SlowAdapter<Order, number> {\r
  failing = false;\r
\r
  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<Order>> {\r
    const result = await super.load(options);\r
    if (this.failing && (options.skip ?? 0) > 0) throw new Error('The server did not answer.');\r
    return result;\r
  }\r
}\r
\r
/** 1,030 orders from a slow server without a count, loaded 50 at a time as the list nears its end. */\r
export default function InfiniteScroll() {\r
  const s = reactive({ loads: 0, parts: 0, preload: false, failing: false });\r
  // Simulates a server. In an application, use new data.RestAdapter({ url: '/api/orders', key: 'id' }) here.\r
  const server = new OrderServer({ data: makeOrders(1_030), key: 'id', capabilities: { count: false } }, 600);\r
  server.onLoading(() => s.loads++);\r
  // \`count: false\`: no page requests a total, and a page shorter than 50 rows is the last one.\r
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 50, count: false });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Load a part ahead" x-model={() => s.preload} />\r
        <CheckBox label="The next page fails" x-model={() => s.failing} onValueChanged={(e) => (server.failing = !!e.value)} />\r
        <Button text="Load more" variant="outline" onclick={() => grid?.loadMore()} />\r
        <Button text="To the last row" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />\r
        <output class="dg-infinite-state">{() => \`\${s.loads} loads, \${s.parts} parts came\${grid?.endReached ? ', every row is here' : ''}\`}</output>\r
      </Stack>\r
      <DataGrid\r
        class="dg-infinite"\r
        style="block-size: 30rem"\r
        mode="infinite"\r
        dataSource={orders}\r
        columns={columns}\r
        label="Orders, part by part"\r
        locale="en"\r
        settings={{ preloadEnabled: () => s.preload, selection: 'multiple', filterRow: true }}\r
        onMoreRowsLoaded={() => s.parts++}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/KeepLayout.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { filterColumns, makeOrders } from './orders';\r
\r
/** Widths, order, sort and filters saved under \`layoutKey\`, and restored when a grid is created again. */\r
export default function KeepLayout() {\r
  const s = reactive({ keep: true, shown: true });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const makeAgain = () => {\r
    s.shown = false;\r
    setTimeout(() => (s.shown = true), 0);\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Keep the layout" x-model={() => s.keep} />\r
        <Button text="Make the grid again" variant="outline" onclick={makeAgain} />\r
        <Button text="Reset the layout" variant="ghost" onclick={() => grid?.resetLayout()} />\r
      </Stack>\r
      {s.shown && (\r
        <DataGrid\r
          class="dg-layout"\r
          style="block-size: 28rem"\r
          rows={makeOrders(40)}\r
          rowKey="id"\r
          columns={filterColumns}\r
          label="Orders that keep their layout"\r
          locale="en"\r
          layoutKey="docs-orders"\r
          settings={{ saveLayout: () => s.keep }}\r
          ref={(g: DataGrid<Order>) => (grid = g)}\r
        />\r
      )}\r
    </>\r
  );\r
}\r
`,"./examples/Localization.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
import type { Order } from './order';\r
import { columns } from './orders';\r
\r
/** Every grid on the page uses \`uiLocale.strings\`, and a grid's own \`texts\` and \`locale\` take precedence. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
        <span>\r
          New row reads <output class="dg-text">{() => kitTexts.strings.gridNewRow}</output>\r
        </span>\r
      </Stack>\r
      <DataGrid\r
        style="block-size: 20rem"\r
        rows={[] as Order[]}\r
        rowKey="id"\r
        columns={columns.slice(0, 4)}\r
        label="No orders yet"\r
        locale={() => s.lang}\r
        texts={() => ({ gridNoRows: s.lang === 'en' ? 'Nothing here yet' : 'Henüz bir şey yok' })}\r
        settings={{ addRows: true }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/Lookups.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { makeCustomers, type Customer } from './customers';\r
\r
type Sale = { id: number; customerId: number | null; amount: number };\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** In-memory sales whose customer comes from another service: only the customers on screen are requested, several in one request. */\r
export default function Lookups() {\r
  const s = reactive({ requests: 0, keys: 0 });\r
  // Simulates another service. In an application, use new data.RestAdapter({ url: '/api/customers', key: 'id' }) here.\r
  const service = new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 400);\r
  // Counts the requests that turn keys into names; the editor's own list loads are not among them.\r
  service.onLoading((e) => {\r
    const asked = e.options.filter as data.FilterCondition | undefined;\r
    if (asked?.op !== 'in' || !Array.isArray(asked.value)) return;\r
    s.requests++;\r
    s.keys = asked.value.length;\r
  });\r
  const customers = new data.DataSource<Customer, number>({ adapter: service });\r
  const sales: Sale[] = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, customerId: i === 4 ? 9999 : ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 }));\r
  const columns: GridColumn<Sale>[] = [\r
    { field: 'id', title: 'No', type: 'number', width: 80, editable: false },\r
    {\r
      field: 'customerId',\r
      title: 'Customer',\r
      width: 220,\r
      flex: 1,\r
      required: true,\r
      filterRow: true,\r
      headerFilter: true,\r
      lookup: {\r
        dataSource: customers,\r
        valueField: 'id',\r
        textField: 'name',\r
        editor: 'lookup',\r
        editorOptions: { columns: [{ field: 'name', caption: 'Name' }, { field: 'city', caption: 'City', width: '7rem' }] },\r
      },\r
    },\r
    { field: 'amount', title: 'Amount', type: 'number', width: 120, filterRow: true, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
  ];\r
  let grid: DataGrid<Sale> | null = null;\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-lookups"\r
        style="block-size: 30rem"\r
        rows={sales}\r
        rowKey="id"\r
        columns={columns}\r
        label="Sales with customers from another service"\r
        locale="en"\r
        saveMode="batch"\r
        settings={{ editable: true, filterDelay: 200 }}\r
        ref={(g: DataGrid<Sale>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Read the names again" variant="outline" onclick={() => grid?.refreshLookups()} />\r
        <output class="dg-lookup-requests">{() => \`\${s.requests} requests for names to the customers service, the last for \${s.keys} customers\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/MasterDetail.tsx":`import { data } from '@motifx-community/data';\r
import { DataGrid, type GridColumn } from '@motifx-community/ui';\r
import type { CustomerOrder } from './customer-order';\r
import { makeCustomerOrders, orderColumns } from './customer-orders';\r
import { makeCustomers, type Customer } from './customers';\r
\r
const customers = makeCustomers(2000);\r
const orders = new data.ArrayAdapter<CustomerOrder, number>({ data: makeCustomerOrders(customers), key: 'id' });\r
\r
const columns: GridColumn<Customer>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 80 },\r
  { field: 'name', title: 'Customer', width: 220, flex: 1 },\r
  { field: 'city', title: 'City', width: 140 },\r
];\r
\r
/** A customer's orders: a grid over a source of its own, filtered by the customer's key, disposed with the details. */\r
function Orders(props: { customerId: unknown; name: string }) {\r
  const source = new data.DataSource<CustomerOrder, number>({ adapter: orders, loadMode: 'all', filter: data.where('customerId', '=', props.customerId) });\r
  return (\r
    <DataGrid\r
      class="dg-orders"\r
      style="block-size: 14rem"\r
      dataSource={source}\r
      columns={orderColumns}\r
      label={\`Orders of \${props.name}\`}\r
      locale="en"\r
      settings={{ rowCount: true }}\r
      onDisposing={() => source.dispose()}\r
    />\r
  );\r
}\r
\r
/** Two thousand customers in a virtual list; each opens to a grid of its own orders. */\r
export default function MasterDetail() {\r
  return (\r
    <DataGrid\r
      class="dg-master"\r
      style="block-size: 30rem"\r
      rows={customers}\r
      rowKey="id"\r
      columns={columns}\r
      label="Customers and their orders"\r
      locale="en"\r
      masterDetail={{ enabled: true, template: (ctx) => <Orders customerId={ctx.key} name={ctx.row.name} /> }}\r
    />\r
  );\r
}\r
`,"./examples/NewRows.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
const POSITIONS = ['bottom', 'top'] as const;\r
\r
/** New rows open at the bottom or at the top; Tab on the last cell opens the next one. */\r
export default function NewRows() {\r
  const s = reactive({ position: 'bottom' as 'top' | 'bottom' });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="New rows">\r
        {POSITIONS.map((position) => (\r
          <Button key={position} text={position} size="sm" variant={() => (s.position === position ? 'solid' : 'ghost')} aria-pressed={() => s.position === position} onclick={() => (s.position = position)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-new"\r
        style="block-size: 28rem"\r
        rows={makeOrders(12)}\r
        rowKey="id"\r
        columns={columns}\r
        label="New rows"\r
        locale="en"\r
        settings={{ editable: true, addRows: true }}\r
        newRow={{ position: () => s.position, create: newOrder }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/Pager.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** The page sizes, the information text, and the full, compact and adaptive pager layouts. */\r
export default function Pager() {\r
  const s = reactive({ look: 'adaptive' as 'adaptive' | 'compact' | 'full', told: '' });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Full" variant={() => (s.look === 'full' ? 'solid' : 'outline')} onclick={() => (s.look = 'full')} />\r
        <Button text="Compact" variant={() => (s.look === 'compact' ? 'solid' : 'outline')} onclick={() => (s.look = 'compact')} />\r
        <Button text="Adaptive" variant={() => (s.look === 'adaptive' ? 'solid' : 'outline')} onclick={() => (s.look = 'adaptive')} />\r
        <Button text="50 rows a page" variant="ghost" onclick={() => grid?.pageSize(50)} />\r
        <output class="dg-pager-state">{() => s.told}</output>\r
      </Stack>\r
      <DataGrid\r
        class="dg-pager"\r
        style="block-size: 30rem"\r
        rows={makeOrders(1000)}\r
        rowKey="id"\r
        mode="paged"\r
        pageSize={20}\r
        columns={columns}\r
        label="Orders in pages of a size you choose"\r
        locale="en"\r
        settings={{\r
          pageSizeSelector: true,\r
          allowedPageSizes: [10, 20, 50, 'all'],\r
          pagerDisplayMode: () => s.look,\r
        }}\r
        onPageSizeChanged={(e) => (s.told = \`\${e.pageSize || 'All'} rows a page (was \${e.previous || 'all'})\`)}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/Pages.tsx":`import { DataGrid } from '@motifx-community/ui';\r
import { columns, makeOrders } from './orders';\r
import { pagedLoads, pagedOrders } from './paged-orders';\r
\r
/** A source that loads by page creates a paged grid, and in-memory rows use \`mode="paged"\`. */\r
export default function Pages() {\r
  return (\r
    <>\r
      <DataGrid class="dg-paged" style="block-size: 34rem" dataSource={pagedOrders} columns={columns} label="Orders by page" locale="en" />\r
      <output class="dg-paged-loads">{() => \`\${pagedLoads.count} loads\`}</output>\r
      <DataGrid style="block-size: 34rem" rows={makeOrders(100)} rowKey="id" mode="paged" pageSize={20} columns={columns} label="Orders in memory by page" locale="en" />\r
    </>\r
  );\r
}\r
`,"./examples/PdfExport.tsx":`import { reactive } from '@motifx/core';\r
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';\r
import { exportDataGrid } from '@motifx-community/ui/pdf';\r
import type { jsPDF } from 'jspdf';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
// jsPDF's own fonts write Latin-1 only: "İzmir" and "İlhan Koman" need a font that has their letters.\r
const FONT = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans@0.2.3/';\r
let font: Promise<{ regular: string; bold: string }> | null = null;\r
\r
async function base64(url: string): Promise<string> {\r
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());\r
  let text = '';\r
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));\r
  return btoa(text);\r
}\r
\r
/** Noto Sans in the document, fetched once; without the network the document keeps jsPDF's own font. */\r
async function useNotoSans(doc: jsPDF) {\r
  font ??= Promise.all([base64(\`\${FONT}NotoSans_400Regular.ttf\`), base64(\`\${FONT}NotoSans_700Bold.ttf\`)]).then(([regular, bold]) => ({ regular, bold }));\r
  try {\r
    const { regular, bold } = await font;\r
    doc.addFileToVFS('NotoSans-Regular.ttf', regular);\r
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');\r
    doc.addFileToVFS('NotoSans-Bold.ttf', bold);\r
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');\r
    doc.setFont('NotoSans', 'normal');\r
  } catch {\r
    font = null;\r
  }\r
}\r
\r
/** The toolbar's export menu with PDF: \`onExporting\` draws the grid on a jsPDF document and saves it. */\r
export default function PdfExport() {\r
  const s = reactive({ saved: '' });\r
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c));\r
  const summary: GridSummary<Order> = {\r
    totalItems: [{ column: 'amount', summaryType: 'sum' }],\r
    groupItems: [\r
      { column: 'id', summaryType: 'count' },\r
      { column: 'amount', summaryType: 'sum', showInGroupFooter: true },\r
    ],\r
  };\r
\r
  // The grid raises onExporting for 'pdf', and the file is written here. jsPDF loads\r
  // the first time someone exports.\r
  const onExporting = async (e: GridExportingEventArgs) => {\r
    if (e.format !== 'pdf') return;\r
    const { jsPDF } = await import('jspdf');\r
    const doc = new jsPDF({ orientation: 'landscape' });\r
    await useNotoSans(doc);\r
    doc.setFontSize(14);\r
    doc.text('Orders by city', 14, 14);\r
    const end = await exportDataGrid({\r
      jsPDFDocument: doc,\r
      component: e.component,\r
      selectedRowsOnly: e.selectedRowsOnly,\r
      topLeft: { y: 6 },\r
      margin: 14,\r
      indent: 4,\r
      customizeCell: ({ gridCell, pdfCell }) => {\r
        if (gridCell.rowType === 'group') pdfCell.backgroundColor = '#EEF2F8';\r
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') pdfCell.textColor = '#B42318';\r
      },\r
    });\r
    doc.save('Orders.pdf');\r
    s.saved = \`Orders.pdf: \${doc.getNumberOfPages()} pages, the table ends on page \${end.page}\`;\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-pdf"\r
        style="block-size: 28rem"\r
        rows={makeOrders(120)}\r
        rowKey="id"\r
        columns={byCity}\r
        label="Orders for PDF"\r
        locale="en"\r
        summary={summary}\r
        settings={{ exportButton: true, selection: 'multiple' }}\r
        export={{ formats: ['pdf', 'csv'], allowExportSelectedData: true }}\r
        onExporting={onExporting}\r
      />\r
      <output class="dg-pdf-saved">{() => s.saved}</output>\r
    </>\r
  );\r
}\r
`,"./examples/PopupMode.tsx":`import { DataGrid, type GridColumn } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
/** In the window the note takes a line of its own and the number stays out. */\r
const popupColumns: GridColumn<Order>[] = columns.map((c) =>\r
  c.field === 'note' ? { ...c, formItem: { colSpan: 'all', label: 'Note for the courier' } } : c.field === 'id' ? { ...c, formItem: { visible: false } } : c,\r
);\r
\r
/** Rows edited and added in a modal window: Enter saves, Escape cancels, and focus returns to the row. */\r
export default function PopupMode() {\r
  return (\r
    <DataGrid\r
      class="dg-popup"\r
      style="block-size: 28rem"\r
      rows={makeOrders(25)}\r
      rowKey="id"\r
      columns={popupColumns}\r
      label="Orders in a window"\r
      locale="en"\r
      settings={{ editable: true, addRows: true, editMode: 'popup' }}\r
      newRow={{ create: newOrder }}\r
      popup={{ title: 'Order', width: '36rem' }}\r
      form={{ colCount: 2 }}\r
      actions={['edit', 'remove']}\r
      onEditorPreparing={(e) => {\r
        if (e.field === 'note') e.options.placeholder = 'Leave at the door…';\r
      }}\r
    />\r
  );\r
}\r
`,"./examples/Programmatic.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
/** Rows in memory given with \`rows\`, rows added programmatically, and a grid created with \`new\`. */\r
export default function Programmatic() {\r
  const s = reactive({ orders: makeOrders(40) });\r
  let grid: DataGrid<Order> | null = null;\r
  let host: Stack | null = null;\r
\r
  // The grid reads the array as it is: after a push it loads it again.\r
  const pushOrder = () => {\r
    s.orders.push({ ...makeOrders(1)[0], id: s.orders.length + 1, customer: 'Pushed' });\r
    grid?.refresh();\r
  };\r
\r
  const addGrid = () => {\r
    if (!host) return;\r
    host.controls.clear();\r
    const made = new DataGrid<Order>({ rows: makeOrders(8), rowKey: 'id', columns: columns.slice(0, 4), settings: { striped: true }, label: 'Created with new' });\r
    made.element.style.blockSize = '24rem';\r
    host.controls.add(made);\r
    made.sort = [{ field: 'customer', dir: 'asc' }];\r
  };\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-local"\r
        style="block-size: 30rem"\r
        rows={() => s.orders}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders"\r
        locale="en"\r
        settings={{ editable: true, addRows: true, striped: true }}\r
        newRow={{ create: newOrder }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a row programmatically" variant="outline" onclick={() => void grid?.addRow({ customer: 'Ada Lovelace' })} />\r
        <Button text="Push an order into the array" variant="outline" onclick={pushOrder} />\r
        <Button text="Add a grid programmatically" variant="outline" onclick={addGrid} />\r
        <output class="dg-local-count">{() => \`\${s.orders.length} orders in the array\`}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,"./examples/RowActions.tsx":`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, DataGrid, Stack, type GridAction } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
const PLACES = ['start', 'end'] as const;\r
const WIDTHS = [100, 140, 260];\r
\r
/** Buttons per row from a function of the row and its state; the rest go into "more". */\r
export default function RowActions() {\r
  const s = reactive({ orders: makeOrders(30), at: 'end' as 'start' | 'end', sticky: true, width: 260, note: '' });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const approve: GridAction<Order> = {\r
    id: 'approve',\r
    text: 'Approve',\r
    tone: 'accent',\r
    visible: (row) => row.status === 'Draft',\r
    onclick: (row) => {\r
      row.status = 'Approved';\r
      // The grid reads the row as it is: draw it again, its buttons with it.\r
      grid?.repaintRows([row.id]);\r
      s.note = \`Order \${row.id} approved\`;\r
    },\r
  };\r
  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = \`Order \${row.id} sent to the printer\`) };\r
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = \`Mail to \${row.customer}\`) };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Actions column">\r
        {PLACES.map((at) => (\r
          <Button key={at} text={at} size="sm" variant={() => (s.at === at ? 'solid' : 'ghost')} aria-pressed={() => s.at === at} onclick={() => (s.at = at)} />\r
        ))}\r
        <CheckBox label="Pinned" x-model={() => s.sticky} />\r
        {WIDTHS.map((w) => (\r
          <Button key={\`w\${w}\`} text={\`\${w}px\`} size="sm" variant={() => (s.width === w ? 'solid' : 'ghost')} aria-pressed={() => s.width === w} onclick={() => (s.width = w)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-actions"\r
        style="block-size: 30rem"\r
        rows={() => s.orders}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders with actions"\r
        locale="en"\r
        saveMode="batch"\r
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, 'edit', 'remove', print, mail])}\r
        settings={{ editable: true, actionsPosition: () => s.at, actionsSticky: () => s.sticky, actionsWidth: () => s.width }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-action-note">{() => s.note}</output>\r
    </>\r
  );\r
}\r
`,"./examples/RowDragBetween.tsx":`import { reactive } from '@motifx/core';\r
import { DataGrid, Stack } from '@motifx-community/ui';\r
import type { GridRowDropEventArgs } from '@motifx-community/ui';\r
import type { Task } from './task';\r
import { makeTasks, taskColumns } from './tasks';\r
\r
/** Two grids in one \`group\`: a row dropped on the other grid raises \`onRemove\` here and \`onAdd\` there. */\r
export default function RowDragBetween() {\r
  const s = reactive({ todo: makeTasks(12), done: makeTasks(4, 101) });\r
  const columns = taskColumns.filter((c) => c.field !== 'priority');\r
  const grid = (list: 'todo' | 'done', label: string) => {\r
    const rows = () => s[list];\r
    const add = (e: GridRowDropEventArgs<Task>) => {\r
      const at = e.toItemData ? rows().indexOf(e.toItemData) : rows().length;\r
      rows().splice(at, 0, e.itemData);\r
      e.component.refresh();\r
    };\r
    // The grids read the arrays as they are: each loads its own again after the change.\r
    const remove = (e: GridRowDropEventArgs<Task>) => {\r
      rows().splice(rows().indexOf(e.itemData), 1);\r
      e.component.refresh();\r
    };\r
    const reorder = (e: GridRowDropEventArgs<Task>) => {\r
      const from = rows().indexOf(e.itemData);\r
      const to = rows().indexOf(e.toItemData as Task);\r
      rows().splice(from, 1);\r
      rows().splice(to, 0, e.itemData);\r
      e.component.refresh();\r
    };\r
    return (\r
      <DataGrid\r
        class={\`dg-board dg-board-\${list}\`}\r
        style="block-size: 28rem; flex: 1 1 18rem"\r
        rows={rows}\r
        rowKey="id"\r
        columns={columns}\r
        label={label}\r
        locale="en"\r
        settings={{ sortable: false }}\r
        rowDragging={{ group: 'board', allowReordering: true, dropFeedbackMode: 'push', onAdd: add, onRemove: remove, onReorder: reorder }}\r
      />\r
    );\r
  };\r
  return (\r
    <Stack orientation="horizontal" wrap align="start">\r
      {grid('todo', 'To do')}\r
      {grid('done', 'Done')}\r
    </Stack>\r
  );\r
}\r
`,"./examples/RowReorder.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Task } from './task';\r
import { makeTasks, taskColumns } from './tasks';\r
\r
/** Rows in memory reordered by dragging (or Ctrl+Shift+Up / Down): \`onReorder\` moves the row in the array. */\r
export default function RowReorder() {\r
  const s = reactive({ rows: makeTasks(500), push: true, icons: true });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="The rows make room (push)" x-model={() => s.push} />\r
        <CheckBox label="Drag icons (off: drag the whole row)" x-model={() => s.icons} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-reorder"\r
        style="block-size: 28rem"\r
        rows={() => s.rows}\r
        rowKey="id"\r
        columns={taskColumns}\r
        label="Tasks to reorder"\r
        locale="en"\r
        settings={{ sortable: false }}\r
        rowDragging={{\r
          allowReordering: true,\r
          dropFeedbackMode: () => (s.push ? 'push' : 'indicate'),\r
          showDragIcons: () => s.icons,\r
          onReorder: (e) => {\r
            // The grid does not move the data: take the row out and put it where the row at \`toIndex\` is.\r
            const from = s.rows.indexOf(e.itemData);\r
            const to = s.rows.indexOf(e.toItemData as Task);\r
            s.rows.splice(from, 1);\r
            s.rows.splice(to, 0, e.itemData);\r
            e.component.refresh();\r
          },\r
        }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/RowReorderServer.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { DataGrid } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Task } from './task';\r
import { makeTasks, taskColumns } from './tasks';\r
\r
const tasks = makeTasks(10_000);\r
const server = new SlowAdapter<Task, number>({ data: tasks, key: 'id' }, 200);\r
const source = new data.DataSource<Task, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });\r
\r
/** What the server does when a task moves to place \`order\`: the tasks in between move one place. */\r
async function moveTask(id: number, order: number) {\r
  await new Promise((done) => setTimeout(done, 200));\r
  const task = tasks.find((t) => t.id === id)!;\r
  const from = task.order;\r
  for (const t of tasks) {\r
    if (from < order && t.order > from && t.order <= order) t.order--;\r
    else if (from > order && t.order >= order && t.order < from) t.order++;\r
  }\r
  task.order = order;\r
}\r
\r
/** 10,000 tasks on a server, sorted by their \`order\` field. A drop notifies the server and reloads. */\r
export default function RowReorderServer() {\r
  const s = reactive({ saved: '' });\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-reorder-server"\r
        style="block-size: 28rem"\r
        dataSource={source}\r
        columns={[...taskColumns, { field: 'order', title: 'Order', type: 'number', width: 90 }]}\r
        sort={[{ field: 'order', dir: 'asc' }]}\r
        label="Tasks on a server"\r
        locale="en"\r
        settings={{ sortable: false }}\r
        rowDragging={{\r
          allowReordering: true,\r
          onReorder: (e) => {\r
            // The row at \`toIndex\` gives the position. The grid waits for the promise while the line stays visible.\r
            const order = (e.toItemData as Task).order;\r
            e.promise = moveTask(e.itemData.id, order).then(() => {\r
              s.saved = \`Task \${e.itemData.id} moved to order \${order}\`;\r
              return e.component.refresh();\r
            });\r
          },\r
        }}\r
      />\r
      <output class="dg-reorder-saved">{() => s.saved}</output>\r
    </>\r
  );\r
}\r
`,"./examples/RuntimeColumns.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { filterColumns, makeOrders } from './orders';\r
\r
const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });\r
\r
/** Columns added, removed and changed at runtime, while the layout, sort and filters stay in sync. */\r
export default function RuntimeColumns() {\r
  const s = reactive({ paid: false, city: true, fields: '' });\r
  let grid: DataGrid<Order> | null = null;\r
  const show = () => (s.fields = grid ? \`\${grid.columnCount()} columns, shown: \${grid.getVisibleColumns().map((c) => c.field).join(', ')}\` : '');\r
\r
  const togglePaid = () => {\r
    if (!grid) return;\r
    if (s.paid) grid.deleteColumn('paid');\r
    else grid.addColumn({ field: 'paid', title: 'Paid', type: 'boolean', width: 80, headerFilter: true }, 2);\r
    s.paid = !s.paid;\r
  };\r
  const toggleCity = () => {\r
    if (!grid) return;\r
    if (s.city) grid.deleteColumn('city');\r
    else grid.addColumn(filterColumns.find((c) => c.field === 'city')!, 2);\r
    s.city = !s.city;\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => (s.paid ? 'Take “Paid” out' : 'Add “Paid” after Customer')} variant="outline" onclick={togglePaid} />\r
        <Button text={() => (s.city ? 'Take “City” out' : 'Put “City” back')} variant="outline" onclick={toggleCity} />\r
        <Button text="Amount in euros" variant="outline" onclick={() => grid?.columnOption('amount', { title: 'Amount (€)', format: (v: unknown) => (typeof v === 'number' ? euros.format(v) : '') })} />\r
        <Button text="Hide or show “Note”" variant="ghost" onclick={() => grid?.columnOption('note', 'visible', !grid.columnOption('note', 'visible'))} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-runtime-columns"\r
        style="block-size: 28rem"\r
        rows={makeOrders(60)}\r
        rowKey="id"\r
        columns={filterColumns.filter((c) => c.field !== 'paid')}\r
        label="Orders with columns that change"\r
        locale="en"\r
        onOptionChanged={() => show()}\r
        onContentReady={() => show()}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-runtime-fields">{() => s.fields}</output>\r
    </>\r
  );\r
}\r
`,"./examples/SaveModes.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { OrderService } from './order-service';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
const MODES: data.SaveMode[] = ['wait', 'background', 'batch'];\r
\r
/** Edits saved according to the save mode, to a server that rejects a note containing "error". */\r
export default function SaveModes() {\r
  const s = reactive({ saveMode: 'wait' as data.SaveMode });\r
  const service = new OrderService({ data: makeOrders(30), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);\r
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Save mode">\r
        {MODES.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.saveMode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.saveMode === mode} onclick={() => (s.saveMode = mode)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-editing"\r
        style="block-size: 32rem"\r
        dataSource={orders}\r
        columns={columns}\r
        label="Orders to edit"\r
        locale="en"\r
        saveMode={() => s.saveMode}\r
        settings={{ editable: true, addRows: true, striped: true }}\r
        newRow={{ create: newOrder }}\r
        validateRow={(row: Order) => (row.status === 'Cancelled' && row.paid ? { paid: 'A cancelled order is not paid.' } : null)}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Delete the active row" variant="outline" onclick={() => void grid?.deleteRow()} />\r
        <Button text="Undo the deletion" variant="ghost" visible={() => s.saveMode === 'batch'} onclick={() => grid?.activeRow && grid.restoreRow(grid.activeRow)} />\r
        <output class="dg-changes">{() => \`\${grid?.changes.count ?? 0} unsaved, \${grid?.errorCount ?? 0} with errors\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/Search.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, CheckBox, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { makeCustomers, type Customer } from './customers';\r
import { columns, makeOrders } from './orders';\r
\r
type Sale = { id: number; customerId: number; amount: number };\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** The search panel over rows in memory, and over a server whose customer names live on another service. */\r
export default function Search() {\r
  const s = reactive({ text: 'ankara', caseSensitive: false });\r
\r
  // The sales and the customers are two services: the search asks the customers' service for the\r
  // names, then the sales' server only for keys.\r
  const customers = new data.DataSource<Customer, number>({ adapter: new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 300) });\r
  const salesServer = new SlowAdapter<Sale, number>({ data: Array.from({ length: 50_000 }, (_, i) => ({ id: i + 1, customerId: ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 })), key: 'id' }, 250);\r
  const sales = new data.DataSource<Sale, number>({ adapter: salesServer, loadMode: 'blocks', pageSize: 100 });\r
  const saleColumns: GridColumn<Sale>[] = [\r
    { field: 'id', title: 'No', type: 'number', width: 90 },\r
    { field: 'customerId', title: 'Customer', flex: 1, width: 220, lookup: { dataSource: customers, valueField: 'id', textField: 'name' } },\r
    { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
  ];\r
  let server: DataGrid<Sale> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Search for “approved”" variant="outline" onclick={() => (s.text = 'approved')} />\r
        <CheckBox label="Mark only the same case" x-model={() => s.caseSensitive} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-search"\r
        style="block-size: 30rem"\r
        rows={makeOrders(200)}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders to search"\r
        locale="en"\r
        searchText={() => s.text}\r
        onSearchTextChanged={(e) => (s.text = e.text)}\r
        settings={{ searchPanel: true, searchPanelWidth: 220, highlightCaseSensitive: () => s.caseSensitive }}\r
      />\r
      <output class="dg-search-text">{() => \`Searching for “\${s.text}”\`}</output>\r
      <DataGrid\r
        class="dg-server-search"\r
        style="block-size: 30rem"\r
        dataSource={sales}\r
        columns={saleColumns}\r
        label="50,000 sales to search"\r
        locale="en"\r
        settings={{ searchPanel: true, searchPlaceholder: 'A customer, an amount…' }}\r
        ref={(g: DataGrid<Sale>) => (server = g)}\r
      />\r
      <output class="dg-server-search-filter">{() => \`\${(server?.total ?? 0).toLocaleString('en')} sales · \${JSON.stringify(server?.filter ?? null)}\`}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Selection.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack, type GridAction, type GridSelection } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
const MODES = ['none', 'single', 'multiple'] as const;\r
\r
const describe = (sel: GridSelection | undefined) =>\r
  !sel ? '' : sel.all ? \`all but \${sel.except.length} (\${sel.except.slice(0, 5).join(', ')})\` : \`\${sel.keys.length} picked (\${sel.keys.slice(0, 5).join(', ')})\`;\r
\r
/** Single and multiple selection; over 100,000 rows on a server "all" is a state, never the rows. */\r
export default function Selection() {\r
  const s = reactive({ mode: 'multiple' as 'none' | 'single' | 'multiple', selection: undefined as GridSelection | undefined, note: '' });\r
  // The server groups, so "all except these keys" is sent to it as a filter.\r
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });\r
  let grid: DataGrid<Order> | null = null;\r
  let server: DataGrid<Order> | null = null;\r
\r
  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = \`Order \${row.id} sent to the printer\`) };\r
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = \`Mail to \${row.customer}\`) };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">\r
        {MODES.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-selection"\r
        style="block-size: 28rem"\r
        rows={makeOrders(40)}\r
        rowKey="id"\r
        columns={columns}\r
        label="Orders to select"\r
        locale="en"\r
        settings={{ selection: () => s.mode }}\r
        onSelectionChanged={(e) => (s.selection = e.selection)}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-selection-state">{() => \`\${(grid?.selectedCount ?? 0).toLocaleString('en')} selected: \${describe(s.selection)}\`}</output>\r
      <DataGrid\r
        class="dg-server-selection"\r
        style="block-size: 28rem"\r
        dataSource={orders}\r
        columns={columns}\r
        label="100,000 orders to select"\r
        locale="en"\r
        settings={{ selection: 'multiple' }}\r
        actions={[print, mail]}\r
        ref={(g: DataGrid<Order>) => (server = g)}\r
      />\r
      <output class="dg-server-selection-state">{() => \`\${(server?.selectedCount ?? 0).toLocaleString('en')} selected: \${describe(server?.selection)}\`}</output>\r
      <output>{() => s.note}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Summaries.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, Stack, type GridCustomSummaryInfo, type GridSummary } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** Totals under the rows, group summaries in the group rows and footers, and a custom one: paid orders. */\r
export default function Summaries() {\r
  const s = reactive({ grouped: true, footers: true, aligned: true, live: false });\r
  let grid: DataGrid<Order> | null = null;\r
  // The amount gets room for its totals.\r
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: () => (s.grouped ? 0 : undefined) } : c.field === 'amount' ? { ...c, width: 170 } : c));\r
\r
  // Counts the paid orders: start, then each row, then the result.\r
  const calculateCustomSummary = (e: GridCustomSummaryInfo<Order>) => {\r
    if (e.summaryProcess === 'start') e.totalValue = 0;\r
    else if (e.summaryProcess === 'calculate' && (e.value as Order).paid) e.totalValue = (e.totalValue as number) + 1;\r
  };\r
\r
  const summary: GridSummary<Order> = {\r
    recalculateWhileEditing: () => s.live,\r
    totalItems: [\r
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },\r
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', displayFormat: '{0} paid' },\r
      { column: 'date', summaryType: 'max', displayFormat: 'Last: {0}' },\r
      { name: 'total', column: 'amount', summaryType: 'sum' },\r
      { column: 'amount', summaryType: 'avg', valueFormat: { maximumFractionDigits: 0 } },\r
    ],\r
    groupItems: [\r
      { column: 'amount', summaryType: 'sum', alignByColumn: () => s.aligned },\r
      { column: 'amount', summaryType: 'max', showInGroupFooter: true, visible: () => s.footers },\r
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', showInGroupFooter: true, displayFormat: '{0} paid', visible: () => s.footers },\r
    ],\r
    calculateCustomSummary,\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Group by city" x-model={() => s.grouped} />\r
        <CheckBox label="Group footers" x-model={() => s.footers} />\r
        <CheckBox label="Sum under its column in the group row" x-model={() => s.aligned} />\r
        <CheckBox label="Follow unsaved edits" x-model={() => s.live} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-summaries"\r
        style="block-size: 34rem"\r
        rows={makeOrders(300)}\r
        rowKey="id"\r
        columns={byCity}\r
        label="Orders with totals"\r
        locale="en"\r
        saveMode="batch"\r
        summary={summary}\r
        settings={{ editable: true, filterRow: true }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <output class="dg-summaries-total">{() => \`The amounts add up to \${Number(grid?.getTotalSummaryValue('total') ?? 0).toLocaleString('en', { maximumFractionDigits: 2 })}\`}</output>\r
    </>\r
  );\r
}\r
`,"./examples/SummariesServer.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** 100,000 orders on a server that calculates the totals and returns the group summaries with the groups. */\r
export default function SummariesServer() {\r
  const s = reactive({ asked: 0 });\r
  // An adapter with the \`summary\` capability is asked for the values (\`remoteSummary: 'auto'\`). Without it,\r
  // every matching row is loaded once and the values are calculated in the browser.\r
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);\r
  server.onLoading((e) => {\r
    if (e.options.summary || e.options.groupSummary) s.asked++;\r
  });\r
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });\r
  const byStatus = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : { ...c, filterRow: c.field === 'city' || c.field === 'amount', width: c.field === 'amount' ? 170 : c.width }));\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <DataGrid\r
        class="dg-summaries-server"\r
        style="block-size: 32rem"\r
        dataSource={orders}\r
        columns={byStatus}\r
        label="100,000 orders with server totals"\r
        locale="en"\r
        settings={{ groupPanel: true }}\r
        summary={{\r
          totalItems: [\r
            { column: 'id', summaryType: 'count', showInColumn: 'customer' },\r
            { name: 'total', column: 'amount', summaryType: 'sum' },\r
            { column: 'amount', summaryType: 'max' },\r
          ],\r
          groupItems: [\r
            { column: 'amount', summaryType: 'sum' },\r
            { column: 'amount', summaryType: 'avg', showInGroupFooter: true, valueFormat: { maximumFractionDigits: 2 } },\r
            { column: 'id', summaryType: 'count', showInColumn: 'customer', showInGroupFooter: true },\r
          ],\r
        }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />\r
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />\r
        <output class="dg-summaries-server-state">{() => \`\${s.asked} summary requests · totals \${grid?.summaryStatus ?? 'loading'}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/Switches.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, Stack } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** Features switched by functions in \`settings\`, by \`grid.settings\` and by one column's own settings. */\r
export default function Switches() {\r
  const s = reactive({ striped: true, resizable: true, nextColumn: false, movable: true, pinnable: true, menu: true, tooltips: true, rowCount: true });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Striped" x-model={() => s.striped} />\r
        <CheckBox label="Resizing" x-model={() => s.resizable} />\r
        <CheckBox label="Resize against the next column" x-model={() => s.nextColumn} />\r
        <CheckBox label="Moving" x-model={() => s.movable} />\r
        <CheckBox label="Pinning" x-model={() => s.pinnable} />\r
        <CheckBox label="Column menu" x-model={() => s.menu} />\r
        <CheckBox label="Menu button always" onValueChanged={(e) => grid && (grid.settings.headerButtons = e.value ? 'always' : 'hover')} />\r
        <CheckBox label="Tooltips" x-model={() => s.tooltips} />\r
        <CheckBox label="Row count" x-model={() => s.rowCount} />\r
        <CheckBox label="Customer column can resize" value={true} onValueChanged={(e) => grid && (grid.columnSettings('customer').resizable = e.value ? undefined : false)} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-settings"\r
        style="block-size: 28rem"\r
        rows={makeOrders(25)}\r
        rowKey="id"\r
        label="Switches"\r
        locale="en"\r
        columns={[{ ...columns[0], movable: false, menu: false }, ...columns.slice(1)]}\r
        settings={{\r
          striped: () => s.striped,\r
          resizable: () => s.resizable,\r
          resizeMode: () => (s.nextColumn ? 'nextColumn' : 'widget'),\r
          movable: () => s.movable,\r
          pinnable: () => s.pinnable,\r
          menu: () => s.menu,\r
          tooltips: () => s.tooltips,\r
          rowCount: () => s.rowCount,\r
        }}\r
        ref={(g: DataGrid<Order>) => (grid = g)}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/TextFrom.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { DataGrid, type GridColumn } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { makeCustomers, type Customer } from './customers';\r
\r
/** An invoice as its service returns it, with the customer included (OData \`$expand=customer\`). */\r
type Invoice = { id: number; customerId: number; customer: { name: string }; total: number };\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** The name is read from the row itself, and the customer service is used only for editing. */\r
export default function TextFrom() {\r
  const s = reactive({ requests: 0 });\r
  const people = makeCustomers(600);\r
  const invoices: Invoice[] = Array.from({ length: 5_000 }, (_, i) => {\r
    const customer = people[(i * 53) % people.length];\r
    return { id: i + 1, customerId: customer.id, customer: { name: customer.name }, total: ((i * 4337) % 50_000) / 10 };\r
  });\r
  // Simulate two services: new data.ODataAdapter({ url: '/odata/Invoices', key: 'id' }) with expand: ['customer'], and the customer service.\r
  const invoiceSource = new data.DataSource<Invoice, number>({ adapter: new SlowAdapter<Invoice, number>({ data: invoices, key: 'id' }, 250), loadMode: 'blocks', pageSize: 100 });\r
  const customerService = new SlowAdapter<Customer, number>({ data: people, key: 'id' }, 400);\r
  customerService.onLoading(() => s.requests++);\r
  const columns: GridColumn<Invoice>[] = [\r
    { field: 'id', title: 'Invoice', type: 'number', width: 100, editable: false },\r
    {\r
      field: 'customerId',\r
      title: 'Customer',\r
      width: 220,\r
      flex: 1,\r
      textFrom: 'customer.name',\r
      sortField: 'customer.name',\r
      lookup: { dataSource: new data.DataSource<Customer, number>({ adapter: customerService }), valueField: 'id', textField: 'name' },\r
    },\r
    { field: 'total', title: 'Total', type: 'number', width: 120, editable: false, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
  ];\r
\r
  return (\r
    <>\r
      <DataGrid class="dg-text-from" style="block-size: 28rem" dataSource={invoiceSource} columns={columns} label="Invoices" locale="en" saveMode="batch" settings={{ editable: true }} />\r
      <output class="dg-text-from-requests">{() => \`\${s.requests} requests to the customers service\`}</output>\r
    </>\r
  );\r
}\r
`,"./examples/Toolbar.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, type GridToolbarItem, type GridToolbarItemName } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
/** The toolbar: the grid's own items with items of the page's own, at the start and at the end. */\r
export default function Toolbar() {\r
  const s = reactive({ striped: true, exportText: false, refreshed: 0 });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  const items: (GridToolbarItem | GridToolbarItemName)[] = [\r
    { name: 'refresh', text: 'Refresh', hint: () => \`Refreshed \${s.refreshed} times\`, location: 'before', click: () => (grid?.refresh(), s.refreshed++) },\r
    { name: 'striped', location: 'before', content: () => <CheckBox label="Striped" x-model={() => s.striped} /> },\r
    { name: 'exportText', location: 'before', content: () => <CheckBox label="“Export” with its text" x-model={() => s.exportText} /> },\r
    'addRowButton',\r
    { name: 'exportButton', showText: () => (s.exportText ? 'always' : 'inMenu') },\r
    'columnChooserButton',\r
    'searchPanel',\r
  ];\r
\r
  return (\r
    <DataGrid\r
      class="dg-toolbar"\r
      style="block-size: 30rem"\r
      rows={makeOrders(120)}\r
      rowKey="id"\r
      columns={columns}\r
      label="Orders with a toolbar"\r
      locale="en"\r
      newRow={{ create: newOrder }}\r
      settings={{ editable: true, addRows: true, exportButton: true, columnChooserButton: true, searchPanel: true, striped: () => s.striped }}\r
      toolbar={{ items }}\r
      ref={(g: DataGrid<Order>) => (grid = g)}\r
    />\r
  );\r
}\r
`,"./examples/ValidationRules.tsx":`import { reactive } from '@motifx/core';\r
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';\r
import type { Order } from './order';\r
import { columns, makeOrders, newOrder } from './orders';\r
\r
const MODES: GridSettings['editMode'][] = ['row', 'form', 'popup'];\r
\r
/** A pretend server: half a second to answer whether a customer may order. */\r
function customerAllowed(name: string): Promise<{ isValid: boolean; message?: string }> {\r
  return new Promise((done) => setTimeout(() => done(/test/i.test(name) ? { isValid: false, message: 'The server does not take test customers.' } : { isValid: true }), 500));\r
}\r
\r
/** Validation rules on the columns, checked as values are entered and before a row is saved. */\r
const ruleColumns: GridColumn<Order>[] = columns.map((c) => {\r
  if (c.field === 'customer') {\r
    return {\r
      ...c,\r
      required: false,\r
      validationRules: [\r
        { type: 'required' },\r
        { type: 'stringLength', min: 3, max: 40 },\r
        { type: 'async', validationCallback: ({ value }) => customerAllowed(String(value)) },\r
      ],\r
    };\r
  }\r
  if (c.field === 'amount') return { ...c, validate: undefined, validationRules: [{ type: 'range', min: 1, max: 5000, message: 'An order is between 1 and 5,000.' }] };\r
  if (c.field === 'note') return { ...c, validationRules: [{ type: 'stringLength', max: 60 }, { type: 'pattern', pattern: /^[^<>]*$/, message: 'No angle brackets.' }] };\r
  return c;\r
});\r
\r
/** Rules on the cells, a check of the whole row, and the messages in the cells, the form or the window. */\r
export default function ValidationRules() {\r
  const s = reactive({ mode: 'row' as GridSettings['editMode'] });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">\r
        {MODES.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />\r
        ))}\r
      </Stack>\r
      <DataGrid\r
        class="dg-rules"\r
        style="block-size: 28rem"\r
        rows={makeOrders(20)}\r
        rowKey="id"\r
        columns={ruleColumns}\r
        label="Orders with rules"\r
        locale="en"\r
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}\r
        newRow={{ create: newOrder }}\r
        onRowValidating={(e) => {\r
          if (e.row.status === 'Cancelled' && e.row.paid) e.errors.paid = 'A cancelled order is not paid.';\r
        }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/Virtual.tsx":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, DataGrid, Stack } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { columns, makeOrders } from './orders';\r
\r
/** 100,000 orders from a server, loaded by blocks only in the visible area. */\r
export default function Virtual() {\r
  const s = reactive({ loads: 0 });\r
  // Simulates a server. In an application, use new data.ODataAdapter({ url: '/odata/Orders', key: 'OrderID' }) here.\r
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);\r
  server.onLoading(() => s.loads++);\r
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });\r
  let grid: DataGrid<Order> | null = null;\r
\r
  return (\r
    <>\r
      <DataGrid class="dg-virtual" style="block-size: 32rem" dataSource={orders} columns={columns} label="100,000 orders" locale="en" ref={(g: DataGrid<Order>) => (grid = g)} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Go to the end" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />\r
        <Button text="Back to the top" variant="outline" onclick={() => grid?.scrollToIndex(0)} />\r
        <Button text="Fit the columns" variant="outline" onclick={() => grid?.autoSizeColumns()} />\r
        <output class="dg-loads">{() => \`\${s.loads} loads for \${grid?.total ?? 0} rows\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,"./examples/VirtualColumns.tsx":`import { reactive } from '@motifx/core';\r
import { CheckBox, DataGrid, NumberBox, Stack } from '@motifx-community/ui';\r
import type { GridColumnItem } from '@motifx-community/ui';\r
\r
type Reading = { id: number };\r
\r
const SENSORS = 200;\r
\r
/** 200 sensors in bands of 20, with each reading calculated from the row, so no row holds 200 values. */\r
const columns: GridColumnItem<Reading>[] = [\r
  { field: 'id', title: 'Hour', type: 'number', width: 90, sticky: 'start' },\r
  ...Array.from({ length: SENSORS / 20 }, (_, b) => ({\r
    title: \`Sensors \${b * 20 + 1}–\${b * 20 + 20}\`,\r
    columns: Array.from({ length: 20 }, (_, k) => {\r
      const n = b * 20 + k;\r
      return { field: \`s\${n}\`, title: \`S\${n + 1}\`, type: 'number' as const, width: 90, value: (r: Reading) => ((r.id * (n + 7)) % 1000) / 10 };\r
    }),\r
  })),\r
  { field: 'total', title: 'Sum', type: 'number', width: 100, sticky: 'end', value: (r: Reading) => (r.id * 31) % 100_000 },\r
];\r
\r
const rows: Reading[] = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1 }));\r
\r
/** 100,000 rows × 200 columns: only the columns in view (and two on each side) get cells. */\r
export default function VirtualColumns() {\r
  const s = reactive({ virtual: true, extra: 2 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="Virtual columns" x-model={() => s.virtual} />\r
        <NumberBox label="Extra columns" labelMode="side" min={0} max={20} x-model={() => s.extra} />\r
      </Stack>\r
      <DataGrid\r
        class="dg-columns"\r
        style="block-size: 30rem"\r
        rows={rows}\r
        rowKey="id"\r
        columns={columns}\r
        label="Sensor readings"\r
        locale="en"\r
        settings={{ columnRenderingMode: () => (s.virtual ? 'virtual' : 'standard'), extraColumns: () => s.extra ?? 0, filterRow: true }}\r
      />\r
    </>\r
  );\r
}\r
`,"./examples/customer-order.ts":`/** One order of a customer, for the master-detail examples. */\r
export interface CustomerOrder {\r
  id: number;\r
  customerId: number;\r
  date: string;\r
  item: string;\r
  quantity: number;\r
  amount: number;\r
}\r
`,"./examples/customer-orders.ts":`import type { GridColumn } from '@motifx-community/ui';\r
import type { Customer } from './customers';\r
import type { CustomerOrder } from './customer-order';\r
\r
const ITEMS = ['Notebook', 'Pencil set', 'Desk lamp', 'Chair', 'Monitor', 'Keyboard', 'Coffee beans', 'Tea', 'Backpack', 'Umbrella'];\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** A few orders of every customer (none for every seventh), the same ones every time. */\r
export function makeCustomerOrders(customers: Customer[]): CustomerOrder[] {\r
  const day = Date.UTC(2026, 0, 1);\r
  const out: CustomerOrder[] = [];\r
  for (const c of customers) {\r
    const count = c.id % 7 === 0 ? 0 : 2 + (c.id % 5);\r
    for (let k = 0; k < count; k++) {\r
      const n = out.length + 1;\r
      out.push({\r
        id: n,\r
        customerId: c.id,\r
        date: new Date(day + ((n * 37) % 300) * 86_400_000).toISOString().slice(0, 10),\r
        item: ITEMS[(n * 3) % ITEMS.length],\r
        quantity: 1 + (n % 4),\r
        amount: ((n * 7919) % 50_000) / 100,\r
      });\r
    }\r
  }\r
  return out;\r
}\r
\r
/** The columns of a customer's orders. */\r
export const orderColumns: GridColumn<CustomerOrder>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 80 },\r
  { field: 'date', title: 'Date', type: 'date', width: 130 },\r
  { field: 'item', title: 'Item', width: 180, flex: 1 },\r
  { field: 'quantity', title: 'Qty', type: 'number', width: 80 },\r
  { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },\r
];\r
`,"./examples/customers.ts":`/** A customer, as stored by a second sample service. */\r
export interface Customer {\r
  id: number;\r
  name: string;\r
  city: string;\r
}\r
\r
const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];\r
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];\r
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];\r
\r
/** \`n\` sample customers, the same ones every time. */\r
export function makeCustomers(n: number): Customer[] {\r
  return Array.from({ length: n }, (_, i) => ({\r
    id: i + 1,\r
    name: \`\${FIRST[i % FIRST.length]} \${LAST[Math.floor(i / FIRST.length) % LAST.length]} \${Math.floor(i / (FIRST.length * LAST.length)) + 1}\`,\r
    city: CITIES[(i * 5) % CITIES.length],\r
  }));\r
}\r
`,"./examples/order-service.ts":`import { data } from '@motifx-community/data';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
\r
/** Orders in memory that answer like a server, and turn down a note with "error" in it. */\r
export class OrderService extends SlowAdapter<Order, number> {\r
  protected override updateRow(key: number, changes: Partial<Order>): Promise<Partial<Order>> {\r
    return this.later(changes, () => super.updateRow(key, changes));\r
  }\r
\r
  protected override insertRow(values: Partial<Order>): Promise<Partial<Order>> {\r
    return this.later(values, () => super.insertRow(values));\r
  }\r
\r
  private later(values: Partial<Order>, save: () => Promise<Partial<Order>>): Promise<Partial<Order>> {\r
    const message = 'The server does not take this note.';\r
    return new Promise((done, fail) =>\r
      setTimeout(() => {\r
        if (String(values.note ?? '').includes('error')) fail(data.DataError.create('MJD202', { operation: 'save', fields: { note: message } }, message));\r
        else save().then(done, fail);\r
      }, 300),\r
    );\r
  }\r
}\r
`,"./examples/order.ts":`/** An order, as stored by the sample server. */\r
export interface Order {\r
  id: number;\r
  customer: string;\r
  city: string;\r
  date: string;\r
  status: string;\r
  paid: boolean;\r
  amount: number;\r
  note: string;\r
}\r
`,"./examples/orders.ts":`import type { GridColumn } from '@motifx-community/ui';\r
import type { Order } from './order';\r
\r
const CUSTOMERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Cahit Arf', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'İlhan Koman', 'Margaret Hamilton'];\r
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];\r
const STATUSES = ['Draft', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];\r
const NOTES = ['', 'Leave at the door', 'Call before delivery', 'Gift wrap, please, with a card that says happy birthday', '', 'Fragile'];\r
\r
/** \`n\` sample orders, the same ones every time. */\r
export function makeOrders(n: number): Order[] {\r
  const day = Date.UTC(2026, 0, 1);\r
  return Array.from({ length: n }, (_, i) => ({\r
    id: i + 1,\r
    customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],\r
    city: CITIES[(i * 3) % CITIES.length],\r
    date: new Date(day + ((i * 37) % 300) * 86_400_000).toISOString().slice(0, 10),\r
    status: STATUSES[i % STATUSES.length],\r
    paid: i % 3 === 0,\r
    amount: ((i * 7919) % 100_000) / 100,\r
    note: NOTES[i % NOTES.length],\r
  }));\r
}\r
\r
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\r
\r
/** The order columns: the number pinned to the start, the amount to the end. */\r
export const columns: GridColumn<Order>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 80, sticky: 'start', editable: false },\r
  { field: 'customer', title: 'Customer', width: 180, flex: 1, required: true },\r
  { field: 'city', title: 'City', type: 'list', width: 120, options: CITIES },\r
  { field: 'date', title: 'Date', type: 'date', width: 130, editable: false, creatable: true },\r
  { field: 'status', title: 'Status', type: 'list', width: 120, options: STATUSES, required: true },\r
  { field: 'paid', title: 'Paid', type: 'boolean', width: 80 },\r
  { field: 'note', title: 'Note', width: 200 },\r
  {\r
    field: 'amount',\r
    title: 'Amount',\r
    type: 'number',\r
    width: 120,\r
    sticky: 'end',\r
    required: true,\r
    validate: (v) => (typeof v === 'number' && v < 0 ? 'The amount cannot be negative.' : null),\r
    format: (v) => (typeof v === 'number' ? money.format(v) : ''),\r
  },\r
];\r
\r
/** The same columns with a filter cell and a header filter on most of them. */\r
export const filterColumns: GridColumn<Order>[] = columns.map((c) => ({ ...c, filterRow: c.field !== 'note', headerFilter: c.field !== 'note' && c.field !== 'id' }));\r
\r
const today = () => new Date().toISOString().slice(0, 10);\r
\r
/** What a new order starts with. */\r
export const newOrder = () => ({ date: today(), status: 'Draft', paid: false });\r
`,"./examples/paged-orders.ts":`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import type { Order } from './order';\r
import { makeOrders } from './orders';\r
\r
/** The number of times rows were requested from the server below. */\r
export const pagedLoads = reactive({ count: 0 });\r
\r
const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 250);\r
server.onLoading(() => pagedLoads.count++);\r
\r
/** 100,000 orders on a server, loaded a page at a time; the paged grid shows them, the export reads them. */\r
export const pagedOrders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'page', pageSize: 20 });\r
`,"./examples/places.ts":`/** Provinces and their districts, for the cascading lists. */\r
export interface Province {\r
  code: string;\r
  name: string;\r
}\r
\r
export interface District {\r
  id: number;\r
  name: string;\r
  province: string;\r
}\r
\r
export const PROVINCES: Province[] = [\r
  { code: 'AN', name: 'Ankara' },\r
  { code: 'IS', name: 'İstanbul' },\r
  { code: 'IZ', name: 'İzmir' },\r
];\r
\r
export const DISTRICTS: District[] = [\r
  { id: 1, name: 'Çankaya', province: 'AN' },\r
  { id: 2, name: 'Keçiören', province: 'AN' },\r
  { id: 3, name: 'Yenimahalle', province: 'AN' },\r
  { id: 4, name: 'Kadıköy', province: 'IS' },\r
  { id: 5, name: 'Beşiktaş', province: 'IS' },\r
  { id: 6, name: 'Üsküdar', province: 'IS' },\r
  { id: 7, name: 'Bornova', province: 'IZ' },\r
  { id: 8, name: 'Karşıyaka', province: 'IZ' },\r
  { id: 9, name: 'Konak', province: 'IZ' },\r
];\r
`,"./examples/task.ts":`/** A task of the drag and drop examples. */\r
export interface Task {\r
  id: number;\r
  title: string;\r
  owner: string;\r
  priority: string;\r
  /** Its place in the list, as a server keeps it. */\r
  order: number;\r
}\r
`,"./examples/tasks.ts":`import type { GridColumn } from '@motifx-community/ui';\r
import type { Task } from './task';\r
\r
const TITLES = ['Write the release notes', 'Fix the login page', 'Review the pull request', 'Plan the sprint', 'Update the docs', 'Call the customer', 'Test on mobile', 'Clean up the backlog'];\r
const OWNERS = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger'];\r
const PRIORITIES = ['Low', 'Normal', 'High'];\r
\r
/** \`n\` sample tasks from id \`from\`, in order. */\r
export function makeTasks(n: number, from = 1): Task[] {\r
  return Array.from({ length: n }, (_, i) => ({\r
    id: from + i,\r
    title: \`\${TITLES[(from + i) % TITLES.length]} #\${from + i}\`,\r
    owner: OWNERS[(from + i) % OWNERS.length],\r
    priority: PRIORITIES[(from + i) % PRIORITIES.length],\r
    order: i,\r
  }));\r
}\r
\r
export const taskColumns: GridColumn<Task>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 70 },\r
  { field: 'title', title: 'Task', width: 240, flex: 1 },\r
  { field: 'owner', title: 'Owner', width: 110 },\r
  { field: 'priority', title: 'Priority', width: 100 },\r
];\r
`})),n=(e,...n)=>t(e,...n,`orders.ts`,`order.ts`);export{n,t};