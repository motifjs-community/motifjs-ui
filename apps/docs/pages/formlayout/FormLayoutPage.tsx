import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CustomerForm from './examples/CustomerForm';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function FormLayoutPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Arranges the fields of a data object on a grid. Each field gets an editor, chosen by name or by the type of its value, with two-way binding to the object. Groups, column spans and buttons organize the layout, and submitting the form validates every field first." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { FormLayout, type FormItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="form" title="Form bound to an object">
        <Example files={code('CustomerForm.tsx')} stack>
          <CustomerForm />
        </Example>
      </Section>

      <Section anchor="editors" title="Editors">
        <p>
          <Rich text="Editors by name: `text`, `password`, `email`, `textarea`, `number`, `date`, `datetime`, `time`, `checkbox`, `switch`, `dropdown`, `combobox`, `lookup`, `radio` and `slider`. If you omit the name, the value determines the editor: a number uses NumberBox, a boolean uses CheckBox, a Date uses DateBox, and anything else uses TextBox. `editorProps` are passed to the editor. Register custom editors once:" />
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
            ['data', '`Bind<T | null>`', '—', 'The object the editors display and change.'],
            ['items', '`Bind<readonly FormItem[]>`', '`[]`', 'The form items. A function is tracked.'],
            ['columns', '`Bind<number>`', '`1`', 'The number of grid columns.'],
            ['minColumnWidth', '`Bind<string>`', '—', 'As many columns as fit, each at least this wide.'],
            ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", 'Passed to every editor.'],
            ['readOnly', '`Bind<boolean>`', '`false`', 'Makes every editor read-only.'],
            ['onValidSubmit(e) / onInvalidSubmit(e)', '', '', 'Occurs when the form is submitted and valid (`{ data, event }`) or submitted and invalid (`{ valid, invalid }`).'],
          ]}
        />
        <h3>
          <Rich text="FormItem" />
        </h3>
        <ApiTable
          head={['Field', 'Description']}
          rows={[
            ['field, label, editor, editorProps', 'The property, its label, its editor and the editor\'s props.'],
            ['required, rules, helpText, enabled, readOnly, visible', 'Passed to the editor, each as a value or a function. `visible` hides the item.'],
            ['colSpan', 'The number of columns it spans. Use `\'all\'` for the whole row.'],
            ['group, items, columns', 'A labeled group with its own columns.'],
            ['button', 'Button props. `submit: true` submits the form.'],
            ['template', 'Any component created for this item.'],
          ]}
        />
        <h3>
          <Rich text="Members" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['validate(), resetValidation(), submit()', 'Validates every field, clears the results, and submits the form.'],
            ['editorOf(field)', 'The editor of a field.'],
            ['refresh()', 'Your data object and items can be plain or reactive, and the form reads them as they are. After changing them in place, call `refresh()`. Every editor re-reads its value, items re-read their text and states, and added or removed items redraw the form.'],
            ['refreshField(field)', 'Re-reads one field of the data object after it has been changed in place.'],
            ['validationGroup, isValid', 'The validation group of the fields.'],
            ['FormLayout.editors', 'The editors registered by name.'],
          ]}
        />
      </Section>
    </>
  );
}
