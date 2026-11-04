# DataGrid: Edit forms and popups

> DataGrid · @motifx-community/ui 0.1.0-beta.0

## Edit forms and popups

`settings.editMode` decides how a row is edited and when it is handed to saving; `saveMode` decides how a row handed over is sent — waiting for the answer, in the background, or kept for `saveChanges()`. In `form` mode the row opens as a form in its place, the kit's `FormLayout` with a field per column: each the editor its cell would get, framed and labelled, the messages of the checks under it. The rows after it move down by its height, also in the virtual list. Save (or Enter in a field) saves the row as the save mode says, Cancel or Escape gives it up; focus moves into the form and back to the row. Here the form has two groups; the buttons switch the edit mode.

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

| editMode | Edited | Handed to saving | Notes |
| --- | --- | --- | --- |
| `row` | In the cells, one editor at a time | Leaving the row | The grid's default. With `saveMode: 'batch'` it is the same as `batch`. |
| `cell` | In the cells | Leaving each cell (Enter, Tab, an arrow, a click elsewhere); a new row on leaving the row | A message keeps the cell until it is fixed or Escape. |
| `batch` | In the cells | `saveChanges()` (“Save changes”) | Sets the save mode to `'batch'`, whatever `saveMode` says. |
| `form` | In a form that takes the row’s place, as wide as the grid | Save (or Enter); Cancel and Escape give up | Typing on a cell does not open it: Enter, F2, the start-edit click, the `edit` action, `editRow()` and `addRow()` do. |
| `popup` | In the same form in a modal window | Save (or Enter); Cancel, Escape and the close button give up | Focus stays in the window and comes back to the row. |

In `popup` mode the same form opens in the kit's `MxForm` as a modal window: for an existing row and for a new one (`addRow()`, “New row”). Focus stays in the window; Enter presses Save and Escape Cancel; when it closes, focus is back on the row. `popup` sets its title and size, `form` and the columns' `formItem` the fields.

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
| `editMode` | `'row'` | How rows are edited and when a row is handed to saving (the table above). Changing it to or from `batch` starts again with the data, like `saveMode`. |
| `confirmDelete` | `true` | Deleting a row (`deleteRow()`, `deleteRows()`, the `remove` action) asks first, once for all the rows an action deletes; not in batch mode, where a deletion is only marked and can be taken back. Texts: `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`. |
| `selectTextOnEditStart` | `true` | The text of a cell or a form field is selected when its editor opens; off, the caret goes to its end. |

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `form.items` | `Bind<(string \| FormItem)[]>` | every column | What the form holds, in order: a column by field name, or a kit `FormItem`. An item whose `field` is a column’s gets that column’s editor (by type, a lookup’s, the column’s own `editor`), with the item’s `label`, `colSpan`, `helpText`, `visible` and `editorProps`; groups (`group`, `items`, `columns`), buttons and `template`s are the form’s own. By default every column, the visible ones first, hidden ones too; a column the user cannot fill shows read-only. |
| `form.colCount` | `Bind<number>` | `2` | Columns of the form. |
| `form.minColWidth` | `Bind<string>` | — | As many columns as fit, each at least this wide; `colCount` is the most. |
| `form.labelMode` | `Bind<'top' \| 'side' \| 'floating' \| 'hidden'>` | `'top'` | Where the labels go. |
| `popup.title, popup.showTitle` | `Bind<string>`, `Bind<boolean>` | “Edit row” / “New row”, `true` | The window’s title; hidden, it still names the window for screen readers. |
| `popup.width, popup.height` | `Bind<number \| string>` | as the form needs | A CSS length, or pixels. |
| `popup.resizable, popup.movable` | `Bind<boolean>` | `true` | Resized from its edges, moved by its title bar. |
| `popup.showCloseButton, popup.showMaximize, popup.fullScreen` | `Bind<boolean>` | `true`, `false`, `false` | The close button (it cancels), the maximize button, opening maximized. |

| Column field | Type | What it does |
| --- | --- | --- |
| `formItem.visible` | `Bind<boolean>` | The column in the form or not. |
| `formItem.colSpan` | `number \| 'all'` | Form columns it spans. |
| `formItem.label, formItem.helpText` | `Bind<string>` | The label (default: the title) and a line under the editor. |
| `formItem.editorOptions` | `Record<string, unknown>` | Props of its editor in the form only, over the column’s. |
| `formItem.order` | `number` | Its place in the form; lower first. |
| `validationRules` | `GridValidationRule[]` | The rules below, checked after `required` and `validate`. |

## Validation rules

A column's `validationRules` are the standard rule set, checked with the kit's own validation rules as a value is written and again before its row is saved; `required` and `validate` keep working before them. The rules run in order and the `async` ones last, together: the row waits for their answer, its cell busy meanwhile. A value is not checked twice: only `reevaluate` (on for `async`) and `compare` run on every check of the row. `onRowValidating` comes after the cells, for the row as a whole. The messages show in the cells, in the form and in the window. Here the server turns down a customer with “test” in the name.

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

| Rule type | Options | Passes when |
| --- | --- | --- |
| `required` | `trim` (default `true`) | An empty value (spaces only, with `trim`) fails. |
| `numeric` | `ignoreEmptyValue` (`true`) | A number, or a text that is one. |
| `range` | `min`, `max` (`Bind<number \| Date>`), `ignoreEmptyValue` (`true`), `reevaluate` | Between the bounds; numbers or dates. |
| `stringLength` | `min`, `max`, `trim` (`true`), `ignoreEmptyValue` (`false`) | The length of the text. |
| `pattern` | `pattern` (`Bind<RegExp \| string>`), `ignoreEmptyValue` (`true`) | Matches; a string is found anywhere in the value, as `new RegExp(pattern)` does. |
| `email` | `ignoreEmptyValue` (`true`) | An e-mail address. |
| `compare` | `comparisonTarget(row, context)` (`context.getValue('password')`: the entered value, else the row's), `comparisonType` (`'=='`, `'!='`, `'==='`, `'!=='`, `'<'`, `'<='`, `'>'`, `'>='`), `ignoreEmptyValue` (`false`) | The value against what the function returns (another field of the row); checked on every check of the row. |
| `custom` | `validationCallback({ value, row, context, column, rule })` (`row` is the row itself, `context` the values entered: `values`, `getValue(field)`), `ignoreEmptyValue` (`false`), `reevaluate` (`false`) | `true` passes, `false` fails with `message`, a string fails with that text. |
| `async` | `validationCallback(…)` returning a promise, `ignoreEmptyValue` (`false`), `reevaluate` (`true`) | The answer: `true`, `false`, a message or `{ isValid, message }`; a rejection fails with its message. The row waits for it before it is sent; its cell shows that it is busy. |

Every rule takes a `message` (`Bind<string>`); without it the text comes from `uiLocale` (or the grid's `texts`): `required`, `gridInvalidNumber`, `tooShort` / `tooLong`, `outOfRange` / `tooSmall` / `tooLarge`, `invalidFormat`, `invalidEmail`, `noMatch`, `invalid`.

## Events and methods

| Event | Gets | When |
| --- | --- | --- |
| `onEditingStart` | `{ field, row, values, getValue, rowIndex, isNew, cancel }` | A cell editor, or the form of a row (`field` `''`), is about to open; `cancel` keeps the row as it is. `row` is the row itself (a class instance stays one); `values` holds what was entered and not saved yet, `getValue(field)` the entered value else the row’s. |
| `onEditorPreparing` | `{ field, row, values, getValue, isNew, options, cancel }` | Before an editor of a cell or of a form field is made: change its props; `cancel` leaves a field out of the form. |
| `onEditorPrepared` | `{ field, row, values, getValue, isNew, editor, element, place: 'cell' \| 'form' }` | An editor was made. |
| `onRowValidating` | `{ key, row, values, getValue, isNew, changed, errors, isValid, errorText, cancel }` | A row is checked before it is saved, after its cells (and their async rules): add or take out messages in `errors` (by field, `''` the row), or `isValid = false` with `errorText`. Once per check of the row. |
| `onInitNewRow, onSaving, onRowInserting, onRowUpdating, onEditCanceling …` | see [Events](datagrid-layout.md#events) | The same in every edit mode: Save in a form is a save, Cancel a cancel. |

| Member | Returns | What it does |
| --- | --- | --- |
| `editRow(i) / editRowByKey(key)` | `boolean` | Opens the first editor of a row, or its form (`form`, `popup`); by key while the row is loaded. |
| `addRow(values?)` | `Promise<boolean>` | Opens a new row: in its cells, in place as a form, or in the window. |
| `saveEditData()` | `Promise<boolean>` | Saves what is being edited, as Save does: the form, else the row being edited; in batch mode every unsaved change. |
| `cancelEditData()` | `void` | Gives up what is being edited, as Cancel does; in batch mode every unsaved change. |
| `closeEditCell()` | `boolean` | Keeps the open editor’s value and closes it; in a form, keeps every field’s value. |
| `form, popup` | read/write, live | `grid.form.colCount = 3`, `grid.popup.width = '40rem'`; a function is followed; `onOptionChanged` tells `form.colCount`, `popup.width` …. |

## Example files

`FormMode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

const MODES: GridSettings['editMode'][] = ['row', 'cell', 'batch', 'form', 'popup'];

/** The note gets the whole width of the form and a line of help. */
const formColumns: GridColumn<Order>[] = columns.map((c) => (c.field === 'note' ? { ...c, formItem: { colSpan: 'all', helpText: 'Shown to the courier.' } } : c));

/** One grid in every edit mode; in 'form' the row opens as a form with two groups. */
export default function FormMode() {
  const s = reactive({ mode: 'form' as GridSettings['editMode'] });
  const service = new OrderService({ data: makeOrders(40), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-form"
        style="block-size: 30rem"
        dataSource={orders}
        columns={formColumns}
        label="Orders in an edit form"
        locale="en"
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}
        newRow={{ create: newOrder }}
        actions={['edit', 'remove']}
        form={{
          colCount: 2,
          items: [
            { group: 'Order', items: [{ field: 'customer' }, { field: 'date' }, { field: 'status' }, { field: 'amount' }] },
            { group: 'Delivery', items: [{ field: 'city' }, { field: 'paid' }, { field: 'note' }] },
          ],
        }}
      />
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

`PopupMode.tsx`

```tsx
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** In the window the note takes a line of its own and the number stays out. */
const popupColumns: GridColumn<Order>[] = columns.map((c) =>
  c.field === 'note' ? { ...c, formItem: { colSpan: 'all', label: 'Note for the courier' } } : c.field === 'id' ? { ...c, formItem: { visible: false } } : c,
);

/** Rows edited and added in a modal window: Enter saves, Escape cancels, focus comes back to the row. */
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
```

`ValidationRules.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

const MODES: GridSettings['editMode'][] = ['row', 'form', 'popup'];

/** A pretend server: half a second to answer whether a customer may order. */
function customerAllowed(name: string): Promise<{ isValid: boolean; message?: string }> {
  return new Promise((done) => setTimeout(() => done(/test/i.test(name) ? { isValid: false, message: 'The server does not take test customers.' } : { isValid: true }), 500));
}

/** the standard rule set on the columns, checked as values are written and before a row is saved. */
const ruleColumns: GridColumn<Order>[] = columns.map((c) => {
  if (c.field === 'customer') {
    return {
      ...c,
      required: false,
      validationRules: [
        { type: 'required' },
        { type: 'stringLength', min: 3, max: 40 },
        { type: 'async', validationCallback: ({ value }) => customerAllowed(String(value)) },
      ],
    };
  }
  if (c.field === 'amount') return { ...c, validate: undefined, validationRules: [{ type: 'range', min: 1, max: 5000, message: 'An order is between 1 and 5,000.' }] };
  if (c.field === 'note') return { ...c, validationRules: [{ type: 'stringLength', max: 60 }, { type: 'pattern', pattern: /^[^<>]*$/, message: 'No angle brackets.' }] };
  return c;
});

/** Rules on the cells, a check of the whole row, and the messages in the cells, the form or the window. */
export default function ValidationRules() {
  const s = reactive({ mode: 'row' as GridSettings['editMode'] });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-rules"
        style="block-size: 28rem"
        rows={makeOrders(20)}
        rowKey="id"
        columns={ruleColumns}
        label="Orders with rules"
        locale="en"
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}
        newRow={{ create: newOrder }}
        onRowValidating={(e) => {
          if (e.row.status === 'Cancelled' && e.row.paid) e.errors.paid = 'A cancelled order is not paid.';
        }}
      />
    </>
  );
}
```
