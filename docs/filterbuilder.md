# FilterBuilder

> Data · @motifx-community/ui 0.1.0-beta.2

A filter builder lets people put a filter together by hand: groups joined by And, Or, Not And or Not Or, and conditions of a field, an operation and a value. Its value is the data layer's filter expression, so it goes to rows in memory and to every adapter as it is. The DataGrid opens it from its filter panel; on its own it serves a report screen or a saved search.

## Import

```tsx
import { FilterBuilder, filterText } from '@motifx-community/ui';
```

## The value

`value` is a `data.FilterExpression` (`data.where`, `data.and`, `data.or`, `data.not`) and `x-model` binds it both ways. A condition the user has not given a value yet stays in the tree but out of the value. Each value is edited in place with the kit's editor for the field's type; `filterText` writes any filter as one line with the fields' captions, formats and lookup texts.

```tsx
import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
```

## From code, and the events

Every change the user makes is also a method (`addCondition`, `addGroup`, `removeItem`, `setField`, `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`), and every change asks first: `onItemAdding`, `onItemRemoving` and `onItemChanging` can change it or cancel it, the `…ed` events and `onValueChanged` follow. Here the last condition of the root cannot be taken out.

```tsx
import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
```

## Fields and operations

A field's `dataType` decides the operations it offers (the first is a new condition's) and its editor; `filterOperations` gives a field its own list. The operation names are the data layer's: “Is any of” is `in`, “Is none of” `notin` (`anyof` and `noneof` are read as them).

| Field | Operations | Editor |
| --- | --- | --- |
| `string (default)` | `contains`, `notcontains`, `startswith`, `endswith`, `=`, `<>`, `isblank`, `isnotblank` | TextBox |
| `number` | `=`, `<>`, `<`, `>`, `<=`, `>=`, `between`, `isblank`, `isnotblank` | NumberBox (two for `between`) |
| `date, datetime` | as number | DateBox (two for `between`) |
| `boolean` | `=`, `<>`, `isblank`, `isnotblank` | DropDown of `trueText` / `falseText` |
| `object` | `isblank`, `isnotblank` | — |
| `a `lookup` field` | `=`, `<>`, `isblank`, `isnotblank`, whatever the type | DropDown of the lookup items (searched) |
| ``in`, `notin` (`anyof`, `noneof`)` | named in `filterOperations` | TagBox: the lookup items, or typed values |

## Custom operations

A custom operation has a name, a caption, the data types that offer it, an editor and text of its own, and `calculateFilterExpression`: what the condition is in the value. The value stays an expression every adapter runs; the builder knows its own conditions again while it holds that value, and from any expression when `readFilterExpression` is given.

```tsx
import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
```

## Groups, limits and nested fields

`maxGroupLevel` limits how deep groups go (at the limit the add button adds a condition at once), `groupOperations` which joins there are, and `allowHierarchicalFields` turns dotted fields (`customer.address.city`) into submenus.

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, RadioGroup, Stack, Switch, type FilterBuilderField } from '@motifx-community/ui';

const fields: FilterBuilderField[] = [
  { dataField: 'customer.name', caption: 'Customer.Name' },
  { dataField: 'customer.address.city' },
  { dataField: 'customer.address.country' },
  { dataField: 'total', dataType: 'number' },
];

/** How deep groups go, which group operations there are, and dotted fields as submenus. */
export default function Limits() {
  const s = reactive({ max: '1', notOps: true, nested: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="maxGroupLevel"
          orientation="horizontal"
          items={[
            { value: '0', text: '0' },
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: 'none', text: 'No limit' },
          ]}
          x-model={() => s.max}
        />
        <Switch label="Not And, Not Or" x-model={() => s.notOps} />
        <Switch label="allowHierarchicalFields" x-model={() => s.nested} />
      </Stack>
      <FilterBuilder
        class="fb-limits"
        label="Customers filter"
        fields={fields}
        value={data.and(data.where('customer.address.city', '=', 'Ankara'), data.where('total', '>=', 1000))}
        maxGroupLevel={() => (s.max === 'none' ? null : Number(s.max))}
        groupOperations={() => (s.notOps ? ['and', 'or', 'notAnd', 'notOr'] : ['and', 'or'])}
        allowHierarchicalFields={() => s.nested}
      />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | Into the tree, to the button focused last; out again. One Tab stop. |
| `Right / Left` | The next / previous button of the row (the other way round in right-to-left pages). |
| `Down / Up` | The row below / above, the same button where it has one. |
| `Home / End; Ctrl + Home / End` | The first / last button of the row; of the tree. |
| `Enter, Space` | Presses the button: opens its menu, opens the value editor, adds, removes. |
| `Alt + Down` | Opens the menu of a field, operation, group or add button. |
| `F2` | Opens the value editor. |
| `Insert` | Adds a condition to the row's group (`addKeys`). |
| `Delete` | Takes the row's condition or group out (`removeKeys`). |
| `In the editor: Enter, Escape, Tab` | Keeps the value; gives it up; keeps it and goes on (from “from” to “to” in a range first). |

## Accessibility

| Topic | How |
| --- | --- |
| `Tree` | `role="treegrid"`, named by `label`; each group and condition a `row` with `aria-level`, `aria-posinset` and `aria-setsize`; each button in a `gridcell`. |
| `Buttons` | Named with what they are: “Field: City”, “Operation: Equals”, “Value: Ankara”, “Group operation: And”, “Add”, “Remove condition”. Menu buttons have `aria-haspopup="menu"` and `aria-expanded`; the choices are `menuitemradio`s. |
| `Editors` | The kit's fields, named “City value”, “Amount, from” and “Amount, to”. |
| `Focus` | Roving `tabindex`: one button is in the Tab order. The focus ring shows for the keyboard only. |

## Localization

Every text comes from `uiLocale.strings` (`filterBuilder…` and `filterOp…`: the group and operation names, “Add Condition”, “<enter a value>”, the buttons' names); `texts` changes some for one builder, `locale` formats its numbers and dates.

```tsx
import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-filter-builder` | The root. |
| `.mx-filter-builder__tree` | The `treegrid`; `data-size`. |
| `.mx-filter-builder__row` | A group or a condition: `data-kind` (`'group'`, `'condition'`), `--_level`. |
| `.mx-filter-builder__cell` | A `gridcell`; `data-part` (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`). |
| `.mx-filter-builder__remove, __group, __add, __field, __operation, __value` | The kit buttons; the value button has `data-empty` while it has no value. |
| `.mx-filter-builder__editor` | The open value editor(s). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `filterbuilder.container, filterbuilder.tree, filterbuilder.row, filterbuilder.cell, filterbuilder.editor` | Units: the text, the rows (`group`, `hover`) and the space between them, a button's place, a value's editor. |
| `filterbuilder.indent` | How far each level moves in. |
| `filterbuilder.line-width, line-color, line-offset, elbow-length, elbow-color` | The line along each group, and an elbow to each row. |
| `filterbuilder.value-width` | The least width of a value editor's field. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<data.FilterExpression \| null>` | `null` | The filter, as the data layer has it. `x-model` binds it two-way. Conditions without their value are left out of it. |
| `fields` | `Bind<FilterBuilderField[]>` | `[]` | The fields conditions are built on (see below). |
| `customOperations` | `Bind<FilterBuilderCustomOperation[]>` | `[]` | Operations of your own (see below). |
| `groupOperations` | `Bind<('and' \| 'or' \| 'notAnd' \| 'notOr')[]>` | all four | What a group can join with; the first is a new group's. |
| `maxGroupLevel` | `Bind<number \| null>` | `null` | `0` allows no groups, `1` groups in the root only, and so on. `null`: no limit. |
| `allowHierarchicalFields` | `Bind<boolean>` | `false` | Fields with a dotted `dataField` show as submenus of their parts. |
| `label` | `Bind<string>` | the `filterBuilderLabel` text | The tree's accessible name; `aria-label` / `aria-labelledby` on the tag work too. |
| `texts` | `Bind<Partial<UiStrings>>` | `{}` | Texts for this builder only, over `uiLocale.strings`. |
| `locale` | `Bind<string>` | the page's | Locale of numbers and dates. |
| `size` | `Bind<ControlSize>` | `'sm'` | The size of the buttons and editors. |
| `addKeys, removeKeys` | `Bind<string[]>` | `['Insert']`, `['Delete']` | Keys that add a condition to the focused row's group and take the focused row out. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### FilterBuilderField

| Field | Type | Description |
| --- | --- | --- |
| `dataField` | `string` | The field the condition filters; a dotted path for a nested one. |
| `caption` | `Bind<string>` | Default: the data field in words (`orderDate` → “Order Date”). |
| `dataType` | `Bind<'string' \| 'number' \| 'date' \| 'datetime' \| 'boolean' \| 'object'>` | Default `'string'`: decides the operations, the editor and how a value reads. |
| `format` | `Intl` options or `(value) => string` | How a value reads; number and date editors take the options too. |
| `lookup` | `{ dataSource, valueField?, textField?, allowClearing? }` | The values come from a list: an array or a data source of any adapter. |
| `filterOperations` | `Bind<string[]>` | The operations offered, in order; custom operations by name. Default: by `dataType`. |
| `defaultOperation` | `Bind<string>` | A new condition's operation. Default: the first of `filterOperations`. |
| `editor` | `(ctx) => component` | An editor of your own: `ctx` has `value`, `setValue`, `close`, `field`, `operation`, `condition`, `builder`. |
| `editorOptions` | `Bind<Record<string, unknown>>` | Props given to the kit editor the builder makes. |
| `customizeText` | `({ value, valueText, field }) => string` | The text of a value, in the builder and in `filterText`. |
| `trueText, falseText` | `Bind<string>` | A yes/no field's texts. Default: the `filterBuilderTrue` / `filterBuilderFalse` texts. |

### FilterBuilderCustomOperation

| Field | Type | Description |
| --- | --- | --- |
| `name, caption` | `string`, `Bind<string>` | The name used in `filterOperations`; the text in the menu and in `filterText`. |
| `dataTypes` | `FilterBuilderDataType[]` | The types whose fields offer it without naming it (only fields without their own `filterOperations`). |
| `hasValue` | `boolean` | Default `true`; `false` shows no value. |
| `editor, customizeText` | as on a field | The value's editor and text for this operation. |
| `calculateFilterExpression` | `(value, field) => data.FilterExpression \| null` | What the condition is in the value: any expression of the data layer, so every adapter runs it. |
| `readFilterExpression` | `(expression) => { field, value } \| null` | Knows an expression as this operation again, also one read back from storage. Without it the builder knows only the expressions it wrote itself. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `root` | read-only | The tree: `{ kind: 'group', operation, items, parent }` with `{ kind: 'condition', field, operation, value, parent }` items. Change it through the methods. |
| `filterText` | read-only, reactive | The filter as one line: `[City] Equals 'Ankara' And [Amount] Is greater than '100'`. |
| `model` | read-only | The `FilterBuilderModel`: a field's operations, texts, the tree of an expression and back. |
| `treeElement, editingCondition` | read-only | The `role="treegrid"` element; the condition whose editor is open. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `addCondition(group?, dataField?)` | `FilterBuilderCondition \| null` | At the end of a group (the root by default), on a field (the first by default). The events run. |
| `addGroup(group?)` | `FilterBuilderGroup \| null` | A group with one condition; `null` past `maxGroupLevel`. |
| `removeItem(item)` | `boolean` | A condition, or a group with what it holds. |
| `setField(condition, dataField), setOperation(condition, op), setConditionValue(condition, value)` | `boolean` | An operation or value that no longer fits the new field is reset. |
| `setGroupOperation(group, op)` | `boolean` |  |
| `clear()` | `void` | Empties the tree. |
| `openEditor(condition), closeEditor(keep?)` | `boolean`, `void` | The value editor, from code. |
| `focusItem(item, part?), focus()` | `boolean` | A row's button (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`); the tree's Tab stop. |
| `getFilterExpression()` | `data.FilterExpression \| null` | The value. |
| `refresh()` | `void` | Your fields and value may be plain or reactive; the builder reads them as they are. After changing them in place, call `refresh()`. The rows are drawn again; a value changed in place is read into the tree. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source }` |
| `onItemAdding(e), onItemAdded(e)` | A condition or group is about to be / was added: `{ item, group, byUser, source }`; change `e.item` before it is added, or `e.cancel = true`. |
| `onItemRemoving(e), onItemRemoved(e)` | `{ item, group, byUser, source }`; `e.cancel = true` keeps it. |
| `onItemChanging(e), onItemChanged(e)` | `{ item, change: 'field' \| 'operation' \| 'value' \| 'groupOperation', value, previousValue, byUser, source }`; change `e.value`, or `e.cancel = true`. |
| `onEditorPreparing(e)` | Before a value editor is made: `{ field, operation, value, condition, part: 'value' \| 'from' \| 'to', options, editor, setValue }`. Change `e.options` (the kit editor's props), set `e.editor` to a component of your own (it calls `e.setValue`), or `e.cancel = true` for none. |
| `onEditorPrepared(e)` | `{ field, operation, condition, part, editor }` |

## Example files

`Basic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, filterText } from '@motifx-community/ui';
import { saleFields, sales } from './sales';

/** The value is the data layer's filter, bound both ways; here it filters sales in memory. */
export default function Basic() {
  const s = reactive({
    filter: data.and(data.where('city', 'in', ['Ankara', 'İzmir']), data.or(data.where('amount', '>', 500), data.where('paid', '=', false))) as data.FilterExpression | null,
  });
  const matches = () => sales.filter(data.createRowFilter(s.filter, { fields: { date: 'date' } })).length;
  return (
    <>
      <FilterBuilder class="fb-basic" label="Sales filter" fields={saleFields} locale="en" x-model={() => s.filter} />
      <output class="fb-basic-text">{() => filterText(s.filter, { fields: saleFields, locale: 'en' }) || 'No filter'}</output>
      <output class="fb-basic-count">{() => `${matches()} of ${sales.length} sales`}</output>
      <pre class="fb-basic-value">{() => JSON.stringify(s.filter, null, 2)}</pre>
    </>
  );
}
```

`sales.ts`

```tsx
import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
```

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, FilterBuilder, Stack } from '@motifx-community/ui';
import { saleFields } from './sales';

/** Made with `new` and driven from code; every change asks first, and a handler may cancel it. */
export default function FromCode() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };
  const builder = new FilterBuilder({ fields: saleFields, locale: 'en', label: 'Built from code' });
  builder.element.classList.add('fb-code');
  builder.onItemAdding((e) => write(`adding a ${e.item.kind}${e.byUser ? ' (user)' : ''}`));
  builder.onItemRemoving((e) => {
    // The last condition stays.
    if (e.group === builder.root && builder.root.items.length === 1) {
      e.cancel = true;
      write('removing the last condition: cancelled');
    }
  });
  builder.onItemChanged((e) => write(`${e.change} → ${JSON.stringify(e.value)}`));
  builder.onValueChanged((e) => write(`value: ${JSON.stringify(e.value)}`));

  const addPaid = () => {
    const c = builder.addCondition(builder.root, 'paid');
    if (c) builder.setConditionValue(c, true);
  };
  const addRange = () => {
    const g = builder.addGroup();
    const c = g?.items[0];
    if (!g || !c || c.kind !== 'condition') return;
    builder.setField(c, 'amount');
    builder.setOperation(c, 'between');
    builder.setConditionValue(c, [100, 400]);
    builder.setGroupOperation(g, 'or');
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add “Paid”" variant="outline" onclick={addPaid} />
        <Button text="Add a range group" variant="outline" onclick={addRange} />
        <Button text="Set a value" variant="outline" onclick={() => (builder.value = data.where('product', 'startswith', 'Ch'))} />
        <Button text="Clear" variant="ghost" onclick={() => builder.clear()} />
      </Stack>
      {builder}
      <ul class="fb-code-log">
        {log.lines.map((line) => (
          <li key={line.id}>{line.text}</li>
        ))}
      </ul>
    </>
  );
}
```

`CustomOperations.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, NumberBox, filterText, type FilterBuilderCustomOperation } from '@motifx-community/ui';
import { saleFields } from './sales';

const DAY = 24 * 60 * 60 * 1000;
/** The demo's "today", so the example reads the same every day. */
const today = new Date(2026, 5, 30);

/** "Is in the last … days" on dates, with a NumberBox of its own; "Is a round amount" without a value. */
const lastDays: FilterBuilderCustomOperation = {
  name: 'lastDays',
  caption: 'Is in the last days',
  dataTypes: ['date'],
  customizeText: (info) => `${info.value} days`,
  editor: (ctx) => {
    const box = new NumberBox({ label: 'Days', labelMode: 'hidden', size: 'sm', min: 1, value: typeof ctx.value === 'number' ? ctx.value : null });
    box.onValueChanged((e) => ctx.setValue(e.value));
    return box;
  },
  calculateFilterExpression: (days, field) => data.where(field.dataField, 'between', [new Date(today.getTime() - (days as number) * DAY), today]),
};

const round: FilterBuilderCustomOperation = {
  name: 'round',
  caption: 'Is a round amount',
  dataTypes: ['number'],
  hasValue: false,
  calculateFilterExpression: (_value, field) => data.where(field.dataField, 'in', [100, 200, 300, 400, 500, 600, 700, 800, 900]),
  // Known again from any expression of that shape, also one read back from storage.
  readFilterExpression: (e) => (data.isCondition(e) && e.op === 'in' && Array.isArray(e.value) && e.value.length === 9 && e.value[0] === 100 ? { field: e.field, value: undefined } : null),
};

export default function CustomOperations() {
  const s = reactive({ filter: null as data.FilterExpression | null });
  return (
    <>
      <FilterBuilder class="fb-custom" label="Filter with custom operations" fields={saleFields} customOperations={[lastDays, round]} locale="en" x-model={() => s.filter} />
      <output class="fb-custom-text">{() => filterText(s.filter, { fields: saleFields, customOperations: [lastDays, round], locale: 'en' }) || 'No filter'}</output>
      <pre class="fb-custom-value">{() => JSON.stringify(s.filter)}</pre>
    </>
  );
}
```

`Localization.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, FilterBuilder, uiLocale } from '@motifx-community/ui';
import { saleFields } from './sales';

/** The builder's texts come from `uiLocale`; `texts` changes some for one builder only. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <FilterBuilder
        class="fb-i18n"
        fields={saleFields}
        locale={() => s.lang}
        value={data.or(data.where('city', 'contains', 'an'), data.not(data.where('paid', '=', true)))}
        texts={{ filterBuilderEnterValue: '…' }}
        label={() => (s.lang === 'en' ? 'Localized filter' : 'Yerelleştirilmiş filtre')}
      />
    </>
  );
}
```
