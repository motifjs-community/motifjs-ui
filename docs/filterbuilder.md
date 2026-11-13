# FilterBuilder

> Data · @motifx-community/ui 0.1.0-beta.8

Lets users build a filter visually, using groups joined by And, Or, Not And or Not Or, and conditions made of a field, an operation and a value. Its value is a data layer filter expression, so it works directly with in-memory rows and every adapter. DataGrid opens it from the filter panel, and you can also use it on its own for reports or saved searches.

## Import

```tsx
import { FilterBuilder, filterText } from '@motifx-community/ui';
```

## The value

`value` is a `data.FilterExpression` (`data.where`, `data.and`, `data.or`, `data.not`), and `x-model` provides two-way binding. A condition without a value stays in the tree but is left out of the expression. Each value is edited in place with the kit editor for the field's type, and `filterText` renders any filter as a single line using the field captions, formats and lookup text.

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

## Programmatic use, and the events

Every user action is also a method (`addCondition`, `addGroup`, `removeItem`, `setField`, `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`), and every change raises an event first. `onItemAdding`, `onItemRemoving` and `onItemChanging` can modify or cancel it, followed by the `…ed` events and `onValueChanged`. In this example, the last condition at the root cannot be removed.

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

A field's `dataType` determines the available operations, where the first is the default for a new condition, and its editor. `filterOperations` sets a custom list for a field. Operation names come from the data layer: “Is any of” is `in` and “Is none of” is `notin` (`anyof` and `noneof` are read as these).

| Field | Operations | Editor |
| --- | --- | --- |
| `string (default)` | `contains`, `notcontains`, `startswith`, `endswith`, `=`, `<>`, `isblank`, `isnotblank` | TextBox |
| `number` | `=`, `<>`, `<`, `>`, `<=`, `>=`, `between`, `isblank`, `isnotblank` | NumberBox (two for `between`) |
| `date, datetime` | As number | DateBox (two for `between`) |
| `boolean` | `=`, `<>`, `isblank`, `isnotblank` | DropDown of `trueText` and `falseText` |
| `object` | `isblank`, `isnotblank` | — |
| `a `lookup` field` | `=`, `<>`, `isblank` and `isnotblank`, regardless of type | DropDown of the lookup items, with search |
| ``in`, `notin` (`anyof`, `noneof`)` | Set in `filterOperations` | TagBox with the lookup items or typed values |

## Custom operations

A custom operation has a name, a caption, the data types that offer it, its own editor and text, and `calculateFilterExpression`, which defines the condition in the value. The value remains an expression that every adapter can run. The builder recognizes its own conditions while it holds that value, and recognizes any expression when `readFilterExpression` is set.

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

`maxGroupLevel` limits nesting depth, and at the limit the add button adds a condition immediately. `groupOperations` sets the available joins, and `allowHierarchicalFields` turns dotted fields (`customer.address.city`) into submenus.

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

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the tree, to the button focused last, and out again. The tree is one Tab stop. |
| `Right / Left` | Moves to the next or previous button in the row, reversed on right-to-left pages. |
| `Down / Up` | Moves to the row below or above, on the same button where possible. |
| `Home / End; Ctrl + Home / End` | Moves to the first or last button of the row, or of the tree. |
| `Enter, Space` | Presses the button, which opens its menu or the value editor, adds or removes. |
| `Alt + Down` | Opens the menu of a field, operation, group or add button. |
| `F2` | Opens the value editor. |
| `Insert` | Adds a condition to the row's group (`addKeys`). |
| `Delete` | Removes the row's condition or group (`removeKeys`). |
| `In the editor: Enter, Escape, Tab` | Accepts the value, discards it, or accepts it and moves on (from “from” to “to” in a range). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Tree` | `role="treegrid"`, named by `label`. Each group and condition is a `row` with `aria-level`, `aria-posinset` and `aria-setsize`, and each button is in a `gridcell`. |
| `Buttons` | Named by their function: “Field: City”, “Operation: Equals”, “Value: Ankara”, “Group operation: And”, “Add” and “Remove condition”. Menu buttons have `aria-haspopup="menu"` and `aria-expanded`, and the choices are `menuitemradio` elements. |
| `Editors` | Kit fields named “City value”, “Amount, from” and “Amount, to”. |
| `Focus` | Roving `tabindex`, so one button is in the Tab order. The focus ring appears only during keyboard use. |

## Localization

All strings come from `uiLocale.strings` (`filterBuilder…` and `filterOp…`: group and operation names, “Add Condition”, “<enter a value>” and button names). `texts` overrides some for one builder, and `locale` formats its numbers and dates.

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

| Hook | Description |
| --- | --- |
| `.mx-filter-builder` | The root. |
| `.mx-filter-builder__tree` | The `treegrid`, with `data-size`. |
| `.mx-filter-builder__row` | A group or a condition: `data-kind` (`'group'`, `'condition'`) and `--_level`. |
| `.mx-filter-builder__cell` | A `gridcell`; `data-part` (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`). |
| `.mx-filter-builder__remove, __group, __add, __field, __operation, __value` | The kit buttons. The value button has `data-empty` while it has no value. |
| `.mx-filter-builder__editor` | The open value editor or editors. |

### Component tokens

| Token | Description |
| --- | --- |
| `filterbuilder.container, filterbuilder.tree, filterbuilder.row, filterbuilder.cell, filterbuilder.editor` | Units: the text, the rows (`group`, `hover`) and the space between them, a button's place, and a value editor. |
| `filterbuilder.indent` | The indent of each level. |
| `filterbuilder.line-width, line-color, line-offset, elbow-length, elbow-color` | The line along each group, and the connector to each row. |
| `filterbuilder.value-width` | The minimum width of a value editor field. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<data.FilterExpression \| null>` | `null` | The filter, in data layer format. `x-model` provides two-way binding. Conditions without a value are left out. |
| `fields` | `Bind<FilterBuilderField[]>` | `[]` | The fields conditions are built on (see below). |
| `customOperations` | `Bind<FilterBuilderCustomOperation[]>` | `[]` | Custom operations (see below). |
| `groupOperations` | `Bind<('and' \| 'or' \| 'notAnd' \| 'notOr')[]>` | all four | The available group joins. The first is the default for a new group. |
| `maxGroupLevel` | `Bind<number \| null>` | `null` | `0` allows no groups, `1` allows groups in the root only, and so on. `null` means no limit. |
| `allowHierarchicalFields` | `Bind<boolean>` | `false` | Shows fields with a dotted `dataField` as submenus of their parts. |
| `label` | `Bind<string>` | The `filterBuilderLabel` string | The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work. |
| `texts` | `Bind<Partial<UiStrings>>` | `{}` | Strings for this builder only, which override `uiLocale.strings`. |
| `locale` | `Bind<string>` | From the page | The locale of numbers and dates. |
| `size` | `Bind<ControlSize>` | `'sm'` | The size of the buttons and editors. |
| `addKeys, removeKeys` | `Bind<string[]>` | `['Insert']`, `['Delete']` | Keys that add a condition to the focused row's group and remove the focused row. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### FilterBuilderField

| Field | Type | Description |
| --- | --- | --- |
| `dataField` | `string` | The field the condition filters. Use a dotted path for a nested field. |
| `caption` | `Bind<string>` | The default is the data field in words (`orderDate` → “Order Date”). |
| `dataType` | `Bind<'string' \| 'number' \| 'date' \| 'datetime' \| 'boolean' \| 'object'>` | The default is `'string'`. It determines the operations, the editor and how a value is displayed. |
| `format` | `Intl` options or `(value) => string` | How a value is displayed. Number and date editors also accept the options. |
| `lookup` | `{ dataSource, valueField?, textField?, allowClearing? }` | The values come from a list: an array, or a data source from any adapter. |
| `filterOperations` | `Bind<string[]>` | The available operations in order, with custom operations by name. The default depends on `dataType`. |
| `defaultOperation` | `Bind<string>` | The operation for a new condition. The default is the first of `filterOperations`. |
| `editor` | `(ctx) => component` | A custom editor. `ctx` provides `value`, `setValue`, `close`, `field`, `operation`, `condition` and `builder`. |
| `editorOptions` | `Bind<Record<string, unknown>>` | Props passed to the kit editor the builder creates. |
| `customizeText` | `({ value, valueText, field }) => string` | The display text of a value, in the builder and in `filterText`. |
| `trueText, falseText` | `Bind<string>` | The text for a yes/no field. The defaults are the `filterBuilderTrue` and `filterBuilderFalse` strings. |

### FilterBuilderCustomOperation

| Field | Type | Description |
| --- | --- | --- |
| `name, caption` | `string`, `Bind<string>` | The name used in `filterOperations`, and the text in the menu and in `filterText`. |
| `dataTypes` | `FilterBuilderDataType[]` | The data types whose fields offer it automatically, for fields without their own `filterOperations`. |
| `hasValue` | `boolean` | The default is `true`. `false` shows no value. |
| `editor, customizeText` | Same as on a field | The value editor and text for this operation. |
| `calculateFilterExpression` | `(value, field) => data.FilterExpression \| null` | Defines the condition in the value, as any data layer expression, so every adapter can run it. |
| `readFilterExpression` | `(expression) => { field, value } \| null` | Recognizes an expression as this operation, including one read back from storage. Without it, the builder only recognizes expressions it wrote itself. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `root` | read-only | The tree: `{ kind: 'group', operation, items, parent }` containing `{ kind: 'condition', field, operation, value, parent }` items. Change it through the methods. |
| `filterText` | read-only, reactive | The filter as a single line: `[City] Equals 'Ankara' And [Amount] Is greater than '100'`. |
| `model` | read-only | The `FilterBuilderModel`, which provides field operations, text, and conversion between expressions and the tree. |
| `treePart, editingCondition` | read-only | The `role="treegrid"` part, and the condition whose editor is open. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `addCondition(group?, dataField?)` | `FilterBuilderCondition \| null` | Adds at the end of a group (the root by default), on a field (the first by default). The events run. |
| `addGroup(group?)` | `FilterBuilderGroup \| null` | Adds a group with one condition. Returns `null` past `maxGroupLevel`. |
| `removeItem(item)` | `boolean` | Removes a condition, or a group with its contents. |
| `setField(condition, dataField), setOperation(condition, op), setConditionValue(condition, value)` | `boolean` | An operation or value that no longer fits the new field is reset. |
| `setGroupOperation(group, op)` | `boolean` |  |
| `clear()` | `void` | Clears the tree. |
| `openEditor(condition), closeEditor(keep?)` | `boolean`, `void` | Controls the value editor programmatically. |
| `focusItem(item, part?), focus()` | `boolean` | Sets focus on a row's button (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`), or on the tree's Tab stop. |
| `getFilterExpression()` | `data.FilterExpression \| null` | The value. |
| `refresh()` | `void` | Your fields and value can be plain or reactive, and the builder reads them as they are. After changing them in place, call `refresh()`. The rows redraw, and a value changed in place is read into the tree. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source }` |
| `onItemAdding(e), onItemAdded(e)` | Occur before and after a condition or group is added: `{ item, group, byUser, source }`. Change `e.item` before it is added, or set `e.cancel = true`. |
| `onItemRemoving(e), onItemRemoved(e)` | `{ item, group, byUser, source }`. Set `e.cancel = true` to keep it. |
| `onItemChanging(e), onItemChanged(e)` | `{ item, change: 'field' \| 'operation' \| 'value' \| 'groupOperation', value, previousValue, byUser, source }`. Change `e.value`, or set `e.cancel = true`. |
| `onEditorPreparing(e)` | Occurs before a value editor is created: `{ field, operation, value, condition, part: 'value' \| 'from' \| 'to', options, editor, setValue }`. Change `e.options` (the kit editor props), set `e.editor` to a custom component that calls `e.setValue`, or set `e.cancel = true` for no editor. |
| `onEditorPrepared(e)` | `{ field, operation, condition, part, editor }` |

## Feedback

Loading issues…

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

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, FilterBuilder, Stack } from '@motifx-community/ui';
import { saleFields } from './sales';

/** Created with `new` and controlled programmatically. Every change raises an event first, and a handler can cancel it. */
export default function Programmatic() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };
  const builder = new FilterBuilder({ fields: saleFields, locale: 'en', label: 'Built programmatically' });
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

/** The builder's strings come from `uiLocale`, and `texts` overrides some for one builder. */
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
