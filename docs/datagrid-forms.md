# DataGrid: Edit forms and popups

> DataGrid · @motifx-community/ui 0.1.0-beta.4

## Edit forms and popups

`settings.editMode` determines how a row is edited and when it is submitted for saving, and `saveMode` determines how a submitted row is sent: waiting for the response, in the background, or held for `saveChanges()`. In `form` mode, the row opens as a form in its place, using the kit's `FormLayout` with one field per column. Each field has the editor its cell would use, with a frame, a label and validation messages below it. The rows after it move down by its height, including in a virtual list. Save (or Enter in a field) saves the row according to the save mode, and Cancel or Escape discards the edit. Focus moves into the form and back to the row. In this example, the form has two groups, and the buttons switch the edit mode.

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

| editMode | Editing location | Submitted for saving | Notes |
| --- | --- | --- | --- |
| `row` | In the cells, with one editor at a time | When leaving the row | The grid's default. With `saveMode: 'batch'`, it is the same as `batch`. |
| `cell` | In the cells | When leaving each cell (Enter, Tab, an arrow key or a click elsewhere), or for a new row, when leaving the row | A validation message keeps the cell open until it is fixed or Escape is pressed. |
| `batch` | In the cells | `saveChanges()` (“Save changes”) | Sets the save mode to `'batch'`, regardless of `saveMode`. |
| `form` | In a form that replaces the row, as wide as the grid | On Save (or Enter). Cancel and Escape discard the edit. | Typing on a cell does not open it. Use Enter, F2, the start-edit click, the `edit` action, `editRow()` or `addRow()`. |
| `popup` | In the same form, in a modal window | On Save (or Enter). Cancel, Escape and the close button discard the edit. | Focus stays in the window and returns to the row. |

In `popup` mode, the same form opens in the kit's `MxForm` as a modal window, for both existing and new rows (`addRow()`, “New row”). Focus stays in the window, Enter activates Save and Escape activates Cancel, and focus returns to the row when the window closes. `popup` sets the title and size, and `form` and the columns' `formItem` set the fields.

```tsx
/** An order, as stored by the sample server. */
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

| Setting | Default | Description |
| --- | --- | --- |
| `editMode` | `'row'` | How rows are edited and when a row is submitted for saving (see the table above). Changing to or from `batch` reloads the data, as with `saveMode`. |
| `confirmDelete` | `true` | Prompts before deleting a row (`deleteRow()`, `deleteRows()`, the `remove` action), once for all the rows an action deletes. This does not apply in batch mode, where a deletion is only marked and can be undone. Strings: `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`. |
| `selectTextOnEditStart` | `true` | Selects the text of a cell or form field when its editor opens. When disabled, the caret moves to the end. |

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form.items` | `Bind<(string \| FormItem)[]>` | Every column | The contents of the form, in order: a column by field name, or a kit `FormItem`. An item whose `field` matches a column uses that column's editor (by type, a lookup's, or the column's own `editor`), with the item's `label`, `colSpan`, `helpText`, `visible` and `editorProps`. Groups (`group`, `items`, `columns`), buttons and `template` items belong to the form. By default, the form includes every column, visible ones first, and a column the user cannot fill appears read-only. |
| `form.colCount` | `Bind<number>` | `2` | The number of columns in the form. |
| `form.minColWidth` | `Bind<string>` | — | Fits as many columns as possible, each at least this wide. `colCount` sets the maximum. |
| `form.labelMode` | `Bind<'top' \| 'side' \| 'floating' \| 'hidden'>` | `'top'` | Label placement. |
| `popup.title, popup.showTitle` | `Bind<string>`, `Bind<boolean>` | “Edit row” / “New row”, `true` | The window's title. When hidden, it still names the window for screen readers. |
| `popup.width, popup.height` | `Bind<number \| string>` | As the form requires | A CSS length, or pixels. |
| `popup.resizable, popup.movable` | `Bind<boolean>` | `true` | Whether it can be resized from its edges and moved by its title bar. |
| `popup.showCloseButton, popup.showMaximize, popup.fullScreen` | `Bind<boolean>` | `true`, `false`, `false` | The close button (which cancels), the maximize button, and opening maximized. |

| Column field | Type | Description |
| --- | --- | --- |
| `formItem.visible` | `Bind<boolean>` | Whether the column appears in the form. |
| `formItem.colSpan` | `number \| 'all'` | The number of form columns it spans. |
| `formItem.label, formItem.helpText` | `Bind<string>` | The label (by default, the title) and a line of text below the editor. |
| `formItem.editorOptions` | `Record<string, unknown>` | Props of its editor in the form only, which override the column's. |
| `formItem.order` | `number` | Its position in the form, with lower values first. |
| `validationRules` | `GridValidationRule[]` | The rules described below, checked after `required` and `validate`. |

## Validation rules

A column's `validationRules` are validated with the kit's validation rules as a value is entered, and again before its row is saved. `required` and `validate` still run before them. Rules run in order, and `async` rules run last, together. The row waits for their results, with its cell shown as busy in the meantime. A value is not validated twice: only `reevaluate` (on for `async`) and `compare` rules run on every validation of the row. `onRowValidating` occurs after the cells, for the row as a whole. Messages appear in the cells, the form and the window. In this example, the server rejects a customer whose name contains “test”.

```tsx
/** An order, as stored by the sample server. */
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

| Rule type | Options | Valid when |
| --- | --- | --- |
| `required` | `trim` (default `true`) | An empty value (spaces only, with `trim`) is invalid. |
| `numeric` | `ignoreEmptyValue` (`true`) | A number, or text that represents a number. |
| `range` | `min`, `max` (`Bind<number \| Date>`), `ignoreEmptyValue` (`true`), `reevaluate` | Between the bounds, for numbers or dates. |
| `stringLength` | `min`, `max`, `trim` (`true`), `ignoreEmptyValue` (`false`) | The length of the text. |
| `pattern` | `pattern` (`Bind<RegExp \| string>`), `ignoreEmptyValue` (`true`) | It matches. A string is found anywhere in the value, as with `new RegExp(pattern)`. |
| `email` | `ignoreEmptyValue` (`true`) | An email address. |
| `compare` | `comparisonTarget(row, context)` (`context.getValue('password')` returns the entered value, otherwise the row's), `comparisonType` (`'=='`, `'!='`, `'==='`, `'!=='`, `'<'`, `'<='`, `'>'`, `'>='`), `ignoreEmptyValue` (`false`) | Compares the value with what the function returns, such as another field of the row. Runs on every validation of the row. |
| `custom` | `validationCallback({ value, row, context, column, rule })` (`row` is the row itself, and `context` holds the entered values: `values`, `getValue(field)`), `ignoreEmptyValue` (`false`), `reevaluate` (`false`) | `true` is valid, `false` is invalid with `message`, and a string is invalid with that text. |
| `async` | `validationCallback(…)` returning a promise, `ignoreEmptyValue` (`false`), `reevaluate` (`true`) | The result: `true`, `false`, a message or `{ isValid, message }`. A rejection is invalid with its message. The row waits for the result before it is sent, and its cell appears busy. |

Every rule accepts a `message` (`Bind<string>`). Without it, the text comes from `uiLocale` (or the grid's `texts`): `required`, `gridInvalidNumber`, `tooShort` / `tooLong`, `outOfRange` / `tooSmall` / `tooLarge`, `invalidFormat`, `invalidEmail`, `noMatch`, `invalid`.

## Events and methods

| Event | Parameters | When |
| --- | --- | --- |
| `onEditingStart` | `{ field, row, values, getValue, rowIndex, isNew, cancel }` | Occurs before a cell editor or a row's form (`field` `''`) opens. Set `cancel` to leave the row unchanged. `row` is the row itself (a class instance stays one), `values` holds the entered, unsaved values, and `getValue(field)` returns the entered value, otherwise the row's. |
| `onEditorPreparing` | `{ field, row, values, getValue, isNew, options, cancel }` | Occurs before the editor of a cell or form field is created. Change its props, or set `cancel` to omit a field from the form. |
| `onEditorPrepared` | `{ field, row, values, getValue, isNew, editor, element, place: 'cell' \| 'form' }` | Occurs after an editor is created. |
| `onRowValidating` | `{ key, row, values, getValue, isNew, changed, errors, isValid, errorText, cancel }` | Occurs when a row is validated before saving, after its cells and their async rules. Add or remove messages in `errors` (by field, with `''` for the row), or set `isValid = false` with `errorText`. Occurs once per validation of the row. |
| `onInitNewRow, onSaving, onRowInserting, onRowUpdating, onEditCanceling …` | See [Events](datagrid-layout.md#events) | The same in every edit mode: Save in a form is a save, and Cancel is a cancel. |

| Member | Returns | Description |
| --- | --- | --- |
| `editRow(i) / editRowByKey(key)` | `boolean` | Opens the first editor of a row, or its form (`form`, `popup`), by key while the row is loaded. |
| `addRow(values?)` | `Promise<boolean>` | Opens a new row: in its cells, in place as a form, or in the window. |
| `saveEditData()` | `Promise<boolean>` | Saves the current edit, as Save does: the form, otherwise the row being edited, and in batch mode every unsaved change. |
| `cancelEditData()` | `void` | Discards the current edit, as Cancel does, and in batch mode every unsaved change. |
| `closeEditCell()` | `boolean` | Keeps the open editor's value and closes it. In a form, it keeps every field's value. |
| `form, popup` | read/write, live | `grid.form.colCount = 3`, `grid.popup.width = '40rem'`. A function is tracked, and `onOptionChanged` reports `form.colCount`, `popup.width` and so on. |

## Feedback

Loading issues…

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

/** `n` sample orders, the same ones every time. */
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
/** An order, as stored by the sample server. */
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

/** Validation rules on the columns, checked as values are entered and before a row is saved. */
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
