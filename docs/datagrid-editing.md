# DataGrid: Editing

> DataGrid · @motifx-community/ui 0.1.0-beta.0

## Editing and save modes

Typing on a cell, Enter, F2 or a double-click opens its editor; only the active cell has one. What is typed goes into the row's draft in the grid's `ChangeTracker`, kept by key, and the row is saved when it is left: `wait` sends it and waits, `background` sends it through one queue and goes on, `batch` keeps everything until “Save changes”. A row with a message cannot be left; Escape gives up. This service turns down a note with “error” in it.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## Saving all at once

With `saveMode: 'batch'` every edit, new row and deletion waits for `saveChanges()`; then the deletions, the updates and the new rows go out, each kind in one call, and rows the server turns down keep their marks. Here over a server that loads by page: the changes stay while the pages turn, and the page's own buttons follow `hasChanges`.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## New rows

`addRow()` or the toolbar's “New row” opens a row at the bottom (the grid goes to the very end; in a virtual list only the last block is loaded) or at the top, with its first cell a new row can fill in edit mode. Tab on the last cell of a new row saves it and opens the next one; Escape drops it; one left untouched goes by itself.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

## Row actions

`actions` gives each row its buttons, as a list or as a function of the row and its state (`isNew`, `isEditing`, `isDirty`, `isSaving`, `hasError`, `isRemoved`, `isSelected`); when what the function reads changes, the row's buttons change. The grid's ready actions are named by strings. The buttons that do not fit the column go into the “more” menu, the first ones in the list stay. The column sits at the start or the end, pinned to its edge or scrolling with the rows.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

The actions can show in the toolbar (`actionsLocation: 'toolbar'`, the `rowActions` item) or in the bottom bar (`'bottom'`) instead, for the rows they act on: the selected rows, or the active row without selection (`actionsTarget`). With no row nothing shows; with one row its own actions, as the row would show them; with several only the ones every row has, each with the count of rows it runs on (“Approve (3)”), dimmed while it is disabled for one of them (`actionsMultipleEnabled: 'any'` lets it run on the rows where it is enabled). An action’s `location` wins, so “Approve” can sit in the toolbar while “Edit” stays in the row; the column shows only while an action sits there. `onclickMany` runs once with every row; without it `onclick` runs row by row, a promise waited for, with progress and a Stop button over the rows, and the outcome is announced (“2 of 3 done, 1 failed”). The ready `remove` marks all the rows in batch mode and in the other modes sends them in one save (`ChangeTracker.removeRows`: one request when the adapter saves in batches, OData `$batch`, a REST batch endpoint or a SOAP `save`). An action’s `tone` colours its button and its menu items (`'danger'` for the ready `remove`, `'accent'` for `save`).

Every row's actions are also in its context menu (right click, Shift+F10), wherever they show: inside a selection of several rows the common ones for all of them. With `actionsDisplay: 'menu'` a row shows only its “more” button, with every action in its menu, and the bars one “Actions” menu button; an action's `menu` keeps it in the menu always, or a button always.

After “select all” over a server the rows are not loaded: only actions with `onclickSelection` show then, and they get the selection as `grid.selection` has it (`all`, `keys`, `except`, `filter`) to send to the server, so nothing has to load every row.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

| Setting | Default | What it does |
| --- | --- | --- |
| `actionsLocation` | `'row'` | Where the actions show: `'row'`, `'toolbar'` (the `rowActions` toolbar item, at the start; place it through `toolbar.items` like the other items) or `'bottom'` (the start of the bottom bar). |
| `actionsTarget` | `'auto'` | The rows the bars act on: `'selection'`, `'focused'` (the active row) or `'auto'` (the selected rows while selection is on, else the active row). |
| `actionsDisplay` | `'auto'` | `'auto'`: the buttons that fit, the rest in “more”. `'menu'`: only the “more” button per row (the column is as wide as that button; with an action that is a button always, `actionsWidth`), one “Actions” menu button in the bars. The context menu always lists them all. |
| `actionsMultipleEnabled` | `'all'` | On several rows an action can be used while it is enabled for all of them, or for any (`'any'`: it runs on those). |
| `actionsShowCount` | `true` | The count of rows after the text of an action that acts on several (“Approve (3)”). |
| `actionsStopOnError` | `false` | Row by row, a failed row stops the rest. |
| `actionsProgress, actionsStopButton` | `true`, `true` | The panel over the rows while an action works on several rows (once one of them returned a promise), and its Stop button. |
| `actionsContextMenu` | `true` | A row’s actions in its context menu. |

| Action field | What it does |
| --- | --- |
| `id, text, icon, showText, hint` | As in the row. Rows share an action by its `id`. |
| `tone` | `'standard' \| 'accent' \| 'danger'`, default `'standard'`: the colour of its button and of its item in the “more” menu, the context menu and the bars’ “Actions” menu. |
| `visible, disabled` | `boolean` or `(row, state) => boolean`, asked for each row; several rows: visible for every row, disabled as `actionsMultipleEnabled` says. |
| `location` | `Bind<'row' \| 'toolbar' \| 'bottom'>`; wins over `actionsLocation`. |
| `menu` | `Bind<'auto' \| 'always' \| 'never'>`, default `'auto'`: in the “more” menu when it does not fit, always, or never (a button even in the `'menu'` display). |
| `multiple` | `Bind<boolean>`, default `true` (the ready `edit`: `false`): it can run on several rows. |
| `multipleEnabled, stopOnError, showCount, contextMenu` | The action’s own `actionsMultipleEnabled`, `actionsStopOnError`, `actionsShowCount`, `actionsContextMenu`; each wins. |
| `beginGroup` | A line before it in a menu. |
| `onclick(row, state)` | Runs for one row; on several rows (without `onclickMany`) for each in turn. A promise is waited for; a throw, a rejection or a promise of `false` counts the row as failed. |
| `onclickMany(rows, e)` | Runs once for several rows (one row too without `onclick`). `e`: `{ location, signal, progress(done, total?) }`; `signal` is aborted by Stop. |
| `onclickSelection(selection, e)` | Runs for a selection whose rows are not loaded (“select all” over a server), with the selection state; only such actions show then. |

| Member | Gets / returns | What it does |
| --- | --- | --- |
| `onActionRunning` | `{ action, rows, selection, location, cancel }` | An action is about to run (in a row, a bar, a row’s menu or from code); `cancel` keeps it from running. `rows` is empty for a selection that is not loaded. |
| `onActionRan` | `{ action, rows, location, done, failed, canceled, errors }` | An action ran. Without a listener, what failed rows threw goes to the console. |
| `runAction(id, rows?)` | `Promise<GridActionRanEventArgs \| null>` | Runs an action on `rows`, or on the rows the bars act on now, where it is visible and enabled; `null` when it is not there or was cancelled. |
| `actionTargets` | `T[]`, reactive | The rows the bars act on now; empty for a selection that is not loaded. |
| `barActions` | `GridBarAction[]`, reactive | The actions the toolbar and the bottom bar show now: `{ action, location, text, count, disabled, rows }`. |
| `stopAction()` | `void` | Stops the action working on several rows, as its Stop button does. |

## Example files

`SaveModes.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

const MODES: data.SaveMode[] = ['wait', 'background', 'batch'];

/** Edits saved as the save mode says, to a server that turns down a note with "error" in it. */
export default function SaveModes() {
  const s = reactive({ saveMode: 'wait' as data.SaveMode });
  const service = new OrderService({ data: makeOrders(30), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Save mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.saveMode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.saveMode === mode} onclick={() => (s.saveMode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-editing"
        style="block-size: 32rem"
        dataSource={orders}
        columns={columns}
        label="Orders to edit"
        locale="en"
        saveMode={() => s.saveMode}
        settings={{ editable: true, addRows: true, striped: true }}
        newRow={{ create: newOrder }}
        validateRow={(row: Order) => (row.status === 'Cancelled' && row.paid ? { paid: 'A cancelled order is not paid.' } : null)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Delete the active row" variant="outline" onclick={() => void grid?.deleteRow()} />
        <Button text="Undo the deletion" variant="ghost" visible={() => s.saveMode === 'batch'} onclick={() => grid?.activeRow && grid.restoreRow(grid.activeRow)} />
        <output class="dg-changes">{() => `${grid?.changes.count ?? 0} unsaved, ${grid?.errorCount ?? 0} with errors`}</output>
      </Stack>
    </>
  );
}
```

`order-service.ts`

```tsx
import { data } from '@motifx-community/data';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';

/** Orders in memory that answer like a server, and turn down a note with "error" in it. */
export class OrderService extends SlowAdapter<Order, number> {
  protected override updateRow(key: number, changes: Partial<Order>): Promise<Partial<Order>> {
    return this.later(changes, () => super.updateRow(key, changes));
  }

  protected override insertRow(values: Partial<Order>): Promise<Partial<Order>> {
    return this.later(values, () => super.insertRow(values));
  }

  private later(values: Partial<Order>, save: () => Promise<Partial<Order>>): Promise<Partial<Order>> {
    const message = 'The server does not take this note.';
    return new Promise((done, fail) =>
      setTimeout(() => {
        if (String(values.note ?? '').includes('error')) fail(data.DataError.create('MJD202', { operation: 'save', fields: { note: message } }, message));
        else save().then(done, fail);
      }, 300),
    );
  }
}
```

`orders.ts`

```tsx
import type { GridColumn } from '@motifx-community/ui';
import type { Order } from './order';

const CUSTOMERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Cahit Arf', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'İlhan Koman', 'Margaret Hamilton'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
const STATUSES = ['Draft', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];
const NOTES = ['', 'Leave at the door', 'Call before delivery', 'Gift wrap, please, with a card that says happy birthday', '', 'Fragile'];

/** `n` made-up orders, the same ones every time. */
export function makeOrders(n: number): Order[] {
  const day = Date.UTC(2026, 0, 1);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
    city: CITIES[(i * 3) % CITIES.length],
    date: new Date(day + ((i * 37) % 300) * 86_400_000).toISOString().slice(0, 10),
    status: STATUSES[i % STATUSES.length],
    paid: i % 3 === 0,
    amount: ((i * 7919) % 100_000) / 100,
    note: NOTES[i % NOTES.length],
  }));
}

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The order columns: the number pinned to the start, the amount to the end. */
export const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80, sticky: 'start', editable: false },
  { field: 'customer', title: 'Customer', width: 180, flex: 1, required: true },
  { field: 'city', title: 'City', type: 'list', width: 120, options: CITIES },
  { field: 'date', title: 'Date', type: 'date', width: 130, editable: false, creatable: true },
  { field: 'status', title: 'Status', type: 'list', width: 120, options: STATUSES, required: true },
  { field: 'paid', title: 'Paid', type: 'boolean', width: 80 },
  { field: 'note', title: 'Note', width: 200 },
  {
    field: 'amount',
    title: 'Amount',
    type: 'number',
    width: 120,
    sticky: 'end',
    required: true,
    validate: (v) => (typeof v === 'number' && v < 0 ? 'The amount cannot be negative.' : null),
    format: (v) => (typeof v === 'number' ? money.format(v) : ''),
  },
];

/** The same columns with a filter cell and a header filter on most of them. */
export const filterColumns: GridColumn<Order>[] = columns.map((c) => ({ ...c, filterRow: c.field !== 'note', headerFilter: c.field !== 'note' && c.field !== 'id' }));

const today = () => new Date().toISOString().slice(0, 10);

/** What a new order starts with. */
export const newOrder = () => ({ date: today(), status: 'Draft', paid: false });
```

`order.ts`

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

`slow-adapter.ts`

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

`BatchSave.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

/** Every change kept until "Save changes", over a server that loads by page; the page's own buttons. */
export default function BatchSave() {
  const s = reactive({ note: '' });
  const service = new OrderService({ data: makeOrders(200), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 250);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'page', pageSize: 15 });
  let grid: DataGrid<Order> | null = null;

  const save = async () => {
    const result = await grid?.saveChanges();
    if (result) s.note = `${result.saved} saved, ${result.failed} failed`;
  };

  return (
    <>
      <DataGrid
        class="dg-batch"
        style="block-size: 34rem"
        dataSource={orders}
        columns={columns}
        label="Orders saved together"
        locale="en"
        saveMode="batch"
        settings={{ editable: true, addRows: true, saveButtons: false, actionsWidth: 100 }}
        newRow={{ create: newOrder }}
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : ['remove'])}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save changes" tone="accent" enabled={() => !!grid?.hasChanges} onclick={save} />
        <Button text="Discard" variant="outline" enabled={() => !!grid?.hasChanges} onclick={() => grid?.discardChanges()} />
        <output class="dg-batch-note">{() => `${grid?.changes.count ?? 0} unsaved${s.note ? ` · ${s.note}` : ''}`}</output>
      </Stack>
    </>
  );
}
```

`NewRows.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { columns, makeOrders, newOrder } from './orders';

const POSITIONS = ['bottom', 'top'] as const;

/** New rows open at the bottom or at the top; Tab on the last cell opens the next one. */
export default function NewRows() {
  const s = reactive({ position: 'bottom' as 'top' | 'bottom' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="New rows">
        {POSITIONS.map((position) => (
          <Button key={position} text={position} size="sm" variant={() => (s.position === position ? 'solid' : 'ghost')} aria-pressed={() => s.position === position} onclick={() => (s.position = position)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-new"
        style="block-size: 28rem"
        rows={makeOrders(12)}
        rowKey="id"
        columns={columns}
        label="New rows"
        locale="en"
        settings={{ editable: true, addRows: true }}
        newRow={{ position: () => s.position, create: newOrder }}
      />
    </>
  );
}
```

`RowActions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack, type GridAction } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const PLACES = ['start', 'end'] as const;
const WIDTHS = [100, 140, 260];

/** Buttons per row from a function of the row and its state; the rest go into "more". */
export default function RowActions() {
  const s = reactive({ orders: makeOrders(30), at: 'end' as 'start' | 'end', sticky: true, width: 260, note: '' });
  let grid: DataGrid<Order> | null = null;

  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    onclick: (row) => {
      row.status = 'Approved';
      // The grid reads the row as it is: draw it again, its buttons with it.
      grid?.repaintRows([row.id]);
      s.note = `Order ${row.id} approved`;
    },
  };
  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = `Order ${row.id} sent to the printer`) };
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = `Mail to ${row.customer}`) };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Actions column">
        {PLACES.map((at) => (
          <Button key={at} text={at} size="sm" variant={() => (s.at === at ? 'solid' : 'ghost')} aria-pressed={() => s.at === at} onclick={() => (s.at = at)} />
        ))}
        <CheckBox label="Pinned" x-model={() => s.sticky} />
        {WIDTHS.map((w) => (
          <Button key={`w${w}`} text={`${w}px`} size="sm" variant={() => (s.width === w ? 'solid' : 'ghost')} aria-pressed={() => s.width === w} onclick={() => (s.width = w)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-actions"
        style="block-size: 30rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders with actions"
        locale="en"
        saveMode="batch"
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, 'edit', 'remove', print, mail])}
        settings={{ editable: true, actionsPosition: () => s.at, actionsSticky: () => s.sticky, actionsWidth: () => s.width }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-action-note">{() => s.note}</output>
    </>
  );
}
```

`BarActions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack, type GridAction, type GridActionLocation } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const LOCATIONS: GridActionLocation[] = ['row', 'toolbar', 'bottom'];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The actions of the selected rows in the toolbar or the bottom bar; several rows share the ones they all have. */
export default function BarActions() {
  const s = reactive({ orders: makeOrders(40), location: 'toolbar' as GridActionLocation, menu: false, note: '' });
  let grid: DataGrid<Order> | null = null;
  // The grid reads the rows as they are: after a change in place it draws them again and asks their actions again.
  const changed = (rows: readonly Order[]) => {
    grid?.repaintRows(rows.map((row) => row.id));
    grid?.refreshActions();
  };

  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    // Once for every selected row: one request to the server.
    onclickMany: async (rows) => {
      await wait(300);
      for (const row of rows) row.status = 'Approved';
      changed(rows);
      s.note = `${rows.length} orders approved`;
    },
    onclick: (row) => {
      row.status = 'Approved';
      changed([row]);
      s.note = `Order ${row.id} approved`;
    },
  };
  // Row by row: the grid shows the progress and a Stop button.
  const print: GridAction<Order> = {
    id: 'print',
    text: 'Print',
    onclick: async (row) => {
      await wait(400);
      s.note = `Order ${row.id} printed`;
    },
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Where the actions show">
        {LOCATIONS.map((at) => (
          <Button key={at} text={at} size="sm" variant={() => (s.location === at ? 'solid' : 'ghost')} aria-pressed={() => s.location === at} onclick={() => (s.location = at)} />
        ))}
        <CheckBox label="Menu only" x-model={() => s.menu} />
      </Stack>
      <DataGrid
        class="dg-bar-actions"
        style="block-size: 28rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders to approve"
        locale="en"
        saveMode="batch"
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, print, 'remove'])}
        settings={{ selection: 'multiple', actionsLocation: () => s.location, actionsDisplay: () => (s.menu ? 'menu' : 'auto') }}
        onActionRan={(e) => {
          if (e.canceled) s.note = `${e.action.id}: stopped after ${e.done} rows`;
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-bar-note">{() => s.note}</output>
    </>
  );
}
```
