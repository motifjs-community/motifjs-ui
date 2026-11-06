# FormLayout

> Navigation · @motifx-community/ui 0.1.0-beta.3

Arranges the fields of a data object on a grid. Each field gets an editor, chosen by name or by the type of its value, with two-way binding to the object. Groups, column spans and buttons organize the layout, and submitting the form validates every field first.

## Import

```tsx
import { FormLayout, type FormItem } from '@motifx-community/ui';
```

## Form bound to an object

```tsx
import { reactive } from '@motifx/core';
import { FormLayout, type FormItem } from '@motifx-community/ui';

const countries = [
  { value: 'TR', text: 'Türkiye' },
  { value: 'DE', text: 'Germany' },
  { value: 'FR', text: 'France' },
];

/** The fields of a customer on two columns: editors by name or by value, a group, a field shown on a condition, a Save button that checks first. */
export default function CustomerForm() {
  const customer = reactive({
    name: 'Ada Lovelace',
    email: '',
    phone: '',
    birthday: null as Date | null,
    country: 'TR' as string | null,
    city: 'İstanbul',
    vip: false,
    credit: 1000,
    note: '',
  });
  const s = reactive({ result: '' });

  const items: FormItem[] = [
    { field: 'name', label: '&Name', required: true },
    { field: 'email', label: 'Email', editor: 'email', required: true },
    { field: 'phone', label: 'Phone', editorProps: { mask: '(000) 000 00 00', type: 'tel' } },
    { field: 'birthday', label: 'Birthday', editor: 'date', editorProps: { max: new Date() } },
    {
      group: 'Address',
      columns: 2,
      items: [
        { field: 'country', label: 'Country', editor: 'dropdown', editorProps: { items: countries } },
        { field: 'city', label: 'City' },
      ],
    },
    { field: 'vip', label: 'VIP customer', editor: 'switch' },
    { field: 'credit', label: 'Credit limit', editorProps: { format: { style: 'currency', currency: 'TRY' }, min: 0 }, visible: () => customer.vip },
    { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all' },
    { button: { text: 'Save', tone: 'accent', submit: true } },
  ];

  return (
    <>
      <FormLayout
        data={customer}
        columns={2}
        items={items}
        onValidSubmit={() => (s.result = `Saved ${customer.name}.`)}
        onInvalidSubmit={(e) => (s.result = `${e.invalid.length} field(s) to fix.`)}
      />
      <output class="fl-result">{() => s.result}</output>
      <output class="fl-data">{() => `${customer.name} · ${customer.email || '—'} · ${customer.city} · vip: ${customer.vip}`}</output>
    </>
  );
}
```

## Editors

Editors by name: `text`, `password`, `email`, `textarea`, `number`, `date`, `datetime`, `time`, `checkbox`, `switch`, `dropdown`, `combobox`, `lookup`, `radio` and `slider`. If you omit the name, the value determines the editor: a number uses NumberBox, a boolean uses CheckBox, a Date uses DateBox, and anything else uses TextBox. `editorProps` are passed to the editor. Register custom editors once:

```tsx
FormLayout.editors.set('color', (props) => new ColorPicker(props));
{ field: 'tint', label: 'Tint', editor: 'color' }
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Bind<T \| null>` | — | The object the editors display and change. |
| `items` | `Bind<readonly FormItem[]>` | `[]` | The form items. A function is tracked. |
| `columns` | `Bind<number>` | `1` | The number of grid columns. |
| `minColumnWidth` | `Bind<string>` | — | As many columns as fit, each at least this wide. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | Passed to every editor. |
| `readOnly` | `Bind<boolean>` | `false` | Makes every editor read-only. |
| `onValidSubmit(e) / onInvalidSubmit(e)` |  |  | Occurs when the form is submitted and valid (`{ data, event }`) or submitted and invalid (`{ valid, invalid }`). |

### FormItem

| Field | Description |
| --- | --- |
| `field, label, editor, editorProps` | The property, its label, its editor and the editor's props. |
| `required, rules, helpText, enabled, readOnly, visible` | Passed to the editor, each as a value or a function. `visible` hides the item. |
| `colSpan` | The number of columns it spans. Use `'all'` for the whole row. |
| `group, items, columns` | A labeled group with its own columns. |
| `button` | Button props. `submit: true` submits the form. |
| `template` | Any component created for this item. |

### Members

| Member | Description |
| --- | --- |
| `validate(), resetValidation(), submit()` | Validates every field, clears the results, and submits the form. |
| `editorOf(field)` | The editor of a field. |
| `refresh()` | Your data object and items can be plain or reactive, and the form reads them as they are. After changing them in place, call `refresh()`. Every editor re-reads its value, items re-read their text and states, and added or removed items redraw the form. |
| `refreshField(field)` | Re-reads one field of the data object after it has been changed in place. |
| `validationGroup, isValid` | The validation group of the fields. |
| `FormLayout.editors` | The editors registered by name. |
