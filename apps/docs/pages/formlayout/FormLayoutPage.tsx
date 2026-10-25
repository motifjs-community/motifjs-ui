import { reactive } from '@motifx/core';
import { FormLayout, type FormItem } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const COUNTRIES = [
  { value: 'TR', text: 'Türkiye' },
  { value: 'DE', text: 'Germany' },
  { value: 'FR', text: 'France' },
];

export default function FormLayoutPage() {
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
  const s = reactive({ result: '', columns: 2, readOnly: false });

  const items: FormItem[] = [
    { field: 'name', label: '&Name', required: true },
    { field: 'email', label: 'Email', editor: 'email', required: true },
    { field: 'phone', label: 'Phone', editorProps: { mask: '(000) 000 00 00', type: 'tel' } },
    { field: 'birthday', label: 'Birthday', editor: 'date', editorProps: { max: new Date() } },
    {
      group: 'Address',
      columns: 2,
      items: [
        { field: 'country', label: 'Country', editor: 'dropdown', editorProps: { items: COUNTRIES } },
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
      <p class="lead">
        Lays out the fields of a data object on a grid. Each field gets an editor — by name, or by the type of its value
        — bound to the object both ways; groups, spans and buttons arrange them; sending the form checks every field
        first.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { FormLayout, type FormItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="form" title="A form over an object">
        <Example
          code={`
<FormLayout
  data={this.customer}
  columns={2}
  onValidSubmit={() => this.save()}
  items={[
    { field: 'name', label: '&Name', required: true },
    { field: 'email', label: 'Email', editor: 'email', required: true },
    { field: 'phone', label: 'Phone', editorProps: { mask: '(000) 000 00 00' } },
    { field: 'birthday', label: 'Birthday', editor: 'date' },
    { group: 'Address', columns: 2, items: [
      { field: 'country', label: 'Country', editor: 'dropdown', editorProps: { items: countries } },
      { field: 'city', label: 'City' },
    ] },
    { field: 'vip', label: 'VIP customer', editor: 'switch' },
    { field: 'credit', label: 'Credit limit', visible: () => this.customer.vip },
    { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all' },
    { button: { text: 'Save', tone: 'accent', submit: true } },
  ]}
/>
`}
          stack
        >
          <FormLayout
            data={customer}
            columns={() => s.columns}
            readOnly={() => s.readOnly}
            items={items}
            onValidSubmit={() => (s.result = `Saved ${customer.name}.`)}
            onInvalidSubmit={(e) => (s.result = `${e.invalid.length} field(s) to fix.`)}
          />
          <output class="fl-result">{() => s.result}</output>
          <output class="fl-data">{() => `${customer.name} · ${customer.email || '—'} · ${customer.city} · vip: ${customer.vip}`}</output>
        </Example>
      </Section>

      <Section anchor="editors" title="Editors">
        <p>
          <Rich text="By name: `text`, `password`, `email`, `textarea`, `number`, `date`, `datetime`, `time`, `checkbox`, `switch`, `dropdown`, `combobox`, `lookup`, `radio`, `slider`. Left out, the value picks it: a number gets a NumberBox, a boolean a CheckBox, a Date a DateBox, anything else a TextBox. `editorProps` go to the editor. Your own editors are registered once:" />
        </p>
        <Code
          code={`
FormLayout.editors.set('color', (props) => new ColorPicker(props));
{ field: 'tint', label: 'Tint', editor: 'color' }
`}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable
          head={['Prop', 'Type', 'Default', 'Description']}
          rows={[
            ['data', '`Bind<T | null>`', '—', 'The object the editors show and change.'],
            ['items', '`Bind<readonly FormItem[]>`', '`[]`', 'The places of the form; a function is followed.'],
            ['columns', '`Bind<number>`', '`1`', 'Columns of the grid.'],
            ['minColumnWidth', '`Bind<string>`', '—', 'As many columns as fit, each at least this wide.'],
            ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", 'Passed to every editor.'],
            ['readOnly', '`Bind<boolean>`', '`false`', 'Every editor read-only.'],
            ['onValidSubmit(e) / onInvalidSubmit(e)', '', '', 'Sent and passed (`{ data, event }`) / sent and failed (`{ valid, invalid }`).'],
          ]}
        />
        <h3>FormItem</h3>
        <ApiTable
          head={['Field', 'Description']}
          rows={[
            ['field, label, editor, editorProps', 'The property, its caption, its editor and the editor’s props.'],
            ['required, rules, helpText, enabled, readOnly, visible', 'Passed to the editor (each a value or a function); `visible` hides the place.'],
            ['colSpan', 'Columns it spans; `\'all\'` for the whole row.'],
            ['group, items, columns', 'A captioned group with its own columns.'],
            ['button', 'Button props; `submit: true` sends the form.'],
            ['template', 'Any component made for the place.'],
          ]}
        />
        <h3>Members</h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['validate(), resetValidation(), submit()', 'Check every field, hide the outcome, send the form.'],
            ['editorOf(field)', 'The editor of a field.'],
            ['validationGroup, isValid', 'The group the fields are checked in.'],
            ['FormLayout.editors', 'The editors known by name.'],
          ]}
        />
      </Section>
    </>
  );
}
