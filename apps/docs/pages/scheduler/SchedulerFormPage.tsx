import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ConditionalFields from './examples/ConditionalFields';
import CustomEditors from './examples/CustomEditors';
import DeclaredForm from './examples/DeclaredForm';
import OwnForm from './examples/OwnForm';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FORM = [
  [
    'items',
    '`(string \\| SchedulerFormItem)[]`',
    'The built-in items, with resources after All day',
    'The contents of the form, in order: a built-in item by its field, a resource by its field, or a custom item. Unknown names are ignored.',
  ],
  ['columns', '`number`', '`2`', 'The number of columns in the form. A group or tab can set its own.'],
  ['minColumnWidth', '`string`', '—', 'Fits as many columns as possible, each at least this wide. `columns` sets the maximum.'],
  ['labelMode', '`Bind<FieldLabelMode>`', 'Set by the design language', 'Label placement.'],
  ['title', '`FormBind<string>`', 'New / Edit appointment', 'The form\'s title. A function of the form can set it per appointment.'],
  ['width', '`string`', 'Set by the design language', 'The form\'s width, as a CSS length.'],
];

const NAMES = [
  ['text, description', 'The title (required) and the description.'],
  ['start, end', 'Each provides two items: a date and time, and a date for all-day appointments. The end validates that it is after the start and that the time is free.'],
  ['allDay', 'The all-day switch.'],
  ['timeZone', 'The time zone row, made up of `startTimeZone`, `separateEndZone` and `endTimeZone` (requires `editing.allowTimeZones`). Each can also be listed individually.'],
  ['recurrenceRule', 'The recurrence editor (requires `editing.allowRecurrence`).'],
  ['a resource’s field', 'The resource\'s picker: a drop-down, or a tag box for a type that allows several. Each item shows its color.'],
];

const ITEM = [
  ['field, label, editor, editorProps, colSpan', 'The same as a kit form item. `editor` can be a name, or a function that creates the editor from the props a named editor receives.'],
  ['visible, enabled, readOnly, required, label, helpText, group', 'A value, a tracked function, or a function of the form, `(form) => …`, with `appointment`, `data` and `isNew`. Use it to show or lock a field for specific appointments.'],
  ['rules', 'Kit validation rules, or a function of the form that returns them. They are added to any rules of a built-in item.'],
  ['items, group, columns', 'A group with a caption. Its items are specified the same way.'],
  ['tabs', '`[{ title, items, columns?, visible? }]`. Every tab is validated when the form is saved, and the tab containing the first invalid field is shown.'],
  ['template', '`(form, place) => ComponentBase`: any MotifJS component for this place. `place` provides the `field` and the `validationGroup` used to validate it with the other fields.'],
  ['button', 'A form button.'],
];

const CHANGES = [
  ['A built-in or a resource named by `field`', 'The item\'s settings take precedence, `rules` are added, `visible` and `enabled` apply when both allow it, `readOnly` applies when either sets it, and `editorProps` are merged.'],
  ['`onFormOpening`', 'Still occurs, with the items as `editing.form` defines them. It can change them, or cancel to open a custom form.'],
];

export default function SchedulerFormPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Configure the appointment form without handling events. You can choose its fields and their order, arrange them in groups and tabs, use custom editors, add validation per field, and show or lock fields for specific appointments. You can also replace the form with your own." />
      </p>

      <Section anchor="declared" title="Items, groups and tabs">
        <p>
          <Rich text="`editing.form.items` lists the contents of the form. Built-in items and resources are referenced by their fields, and an item with the same `field` modifies that item (here, the title's label and a rule). The time zone row (`timeZone`) and the recurrence editor (`recurrenceRule`) are regular items that you can move or omit. `tabs` and groups contain items specified the same way." />
        </p>
        <Example files={code('DeclaredForm.tsx', 'resource-data.ts')}>
          <DeclaredForm />
        </Example>
      </Section>

      <Section anchor="editors" title="Custom editors">
        <p>
          <Rich text="`editor` can be a function. It receives the same props as a named editor (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …), so any component that accepts them is validated with the form. `template` places any MotifJS component, and receives the form (with its reactive `data`) and its place (`field`, `validationGroup`). `rules` are kit validation rules, and are added to any rules of a built-in item." />
        </p>
        <Example files={code('CustomEditors.tsx', 'resource-data.ts')}>
          <CustomEditors />
        </Example>
        <Code
          code={`
// By name, for every form of the page:
FormLayout.editors.set('priority', (props) => new Slider({ ...props, min: 1, max: 5 }));
// { field: 'priority', editor: 'priority' }
`}
        />
      </Section>

      <Section anchor="conditional" title="Fields for specific appointments">
        <p>
          <Rich text="`visible`, `readOnly`, `enabled`, `required`, `label` and `helpText` can be functions of the form: `(form) => form.data.roomId === 3`. They read the form's current data, so a field can appear when another field changes." />
        </p>
        <Example files={code('ConditionalFields.tsx', 'resource-data.ts')}>
          <ConditionalFields />
        </Example>
      </Section>

      <Section anchor="own" title="Replacing the form">
        <p>
          <Rich text="`onFormOpening` receives the items built from `editing.form` and can still change them. Set `cancel` to keep the scheduler's form closed, open your own form, and then save with `addAppointment` or `updateAppointment`. The events and validation run the same way as for the scheduler's form." />
        </p>
        <Example files={code('OwnForm.tsx', 'resource-data.ts')}>
          <OwnForm />
        </Example>
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="editing.form" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Default', 'Description']} rows={FORM} />
        <h3>
          <Rich text="Built-in items" />
        </h3>
        <ApiTable head={['Name', 'Description']} rows={NAMES} />
        <h3>
          <Rich text="SchedulerFormItem" />
        </h3>
        <ApiTable head={['Member', 'Description']} rows={ITEM} />
        <h3>
          <Rich text="How the settings combine" />
        </h3>
        <ApiTable head={['Case', 'Result']} rows={CHANGES} />
        <h3>
          <Rich text="FormLayout" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['FormItem.tabs', 'Tabs of items in any `FormLayout`. Validation shows the tab containing the first invalid field.'],
            ['FormItem.editor (a function)', 'Creates the editor from the props a named editor receives.'],
            ['FormItem.template(context)', 'Receives `{ data, field, validationGroup }`.'],
            ["editor: 'tagbox'", 'A tag box specified by name.'],
          ]}
        />
      </Section>
    </>
  );
}
