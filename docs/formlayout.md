# FormLayout

> Navigation · @motifx-community/ui 0.1.0-beta.0

Lays out the fields of a data object on a grid. Each field gets an editor — by name, or by the type of its value — bound to the object both ways; groups, spans and buttons arrange them; sending the form checks every field first.

## Import

```tsx
import { FormLayout, type FormItem } from '@motifx-community/ui';
```

## A form over an object

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

By name: `text`, `password`, `email`, `textarea`, `number`, `date`, `datetime`, `time`, `checkbox`, `switch`, `dropdown`, `combobox`, `lookup`, `radio`, `slider`. Left out, the value picks it: a number gets a NumberBox, a boolean a CheckBox, a Date a DateBox, anything else a TextBox. `editorProps` go to the editor. Your own editors are registered once:

```tsx
FormLayout.editors.set('color', (props) => new ColorPicker(props));
{ field: 'tint', label: 'Tint', editor: 'color' }
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Bind<T \| null>` | — | The object the editors show and change. |
| `items` | `Bind<readonly FormItem[]>` | `[]` | The places of the form; a function is followed. |
| `columns` | `Bind<number>` | `1` | Columns of the grid. |
| `minColumnWidth` | `Bind<string>` | — | As many columns as fit, each at least this wide. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | Passed to every editor. |
| `readOnly` | `Bind<boolean>` | `false` | Every editor read-only. |
| `onValidSubmit(e) / onInvalidSubmit(e)` |  |  | Sent and passed (`{ data, event }`) / sent and failed (`{ valid, invalid }`). |

### FormItem

| Field | Description |
| --- | --- |
| `field, label, editor, editorProps` | The property, its caption, its editor and the editor’s props. |
| `required, rules, helpText, enabled, readOnly, visible` | Passed to the editor (each a value or a function); `visible` hides the place. |
| `colSpan` | Columns it spans; `'all'` for the whole row. |
| `group, items, columns` | A captioned group with its own columns. |
| `button` | Button props; `submit: true` sends the form. |
| `template` | Any component made for the place. |

### Members

| Member | Description |
| --- | --- |
| `validate(), resetValidation(), submit()` | Check every field, hide the outcome, send the form. |
| `editorOf(field)` | The editor of a field. |
| `refresh()` | Your data object and items may be plain or reactive; the form reads them as they are. After changing them in place, call `refresh()`. Every editor reads its value again, the items their texts and states; items added or removed draw the form again. |
| `refreshField(field)` | Reads one field of the data object again, after it was changed in place. |
| `validationGroup, isValid` | The group the fields are checked in. |
| `FormLayout.editors` | The editors known by name. |
