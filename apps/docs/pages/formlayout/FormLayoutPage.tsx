import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CustomerForm from './examples/CustomerForm';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function FormLayoutPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Lays out the fields of a data object on a grid. Each field gets an editor — by name, or by the type of its value — bound to the object both ways; groups, spans and buttons arrange them; sending the form checks every field first." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { FormLayout, type FormItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="form" title="A form over an object">
        <Example files={code('CustomerForm.tsx')} stack>
          <CustomerForm />
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
        <h3>
          <Rich text="Props" />
        </h3>
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
        <h3>
          <Rich text="FormItem" />
        </h3>
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
        <h3>
          <Rich text="Members" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['validate(), resetValidation(), submit()', 'Check every field, hide the outcome, send the form.'],
            ['editorOf(field)', 'The editor of a field.'],
            ['refresh()', 'Your data object and items may be plain or reactive; the form reads them as they are. After changing them in place, call `refresh()`. Every editor reads its value again, the items their texts and states; items added or removed draw the form again.'],
            ['refreshField(field)', 'Reads one field of the data object again, after it was changed in place.'],
            ['validationGroup, isValid', 'The group the fields are checked in.'],
            ['FormLayout.editors', 'The editors known by name.'],
          ]}
        />
      </Section>
    </>
  );
}
