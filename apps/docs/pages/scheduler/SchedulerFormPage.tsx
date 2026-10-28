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
    'the built-ins, the resources after All day',
    'What the form holds, in order: a built-in item by its field, a resource by its field, or an item of your own. Unknown names are left out.',
  ],
  ['columns', '`number`', '`2`', 'Columns of the form (a group and a tab may have their own).'],
  ['minColumnWidth', '`string`', '—', 'With it, as many columns as fit, each at least this wide; `columns` is the most.'],
  ['labelMode', '`Bind<FieldLabelMode>`', 'the language’s', 'Where the labels go.'],
  ['title', '`FormBind<string>`', 'New / Edit appointment', 'The form’s title; a function of the form may say it per appointment.'],
  ['width', '`string`', 'the language’s', 'The form’s width, a CSS length.'],
];

const NAMES = [
  ['text, description', 'The title (required) and the description.'],
  ['start, end', 'Each two items: a date and time, and (all day) a date. The end checks it is after the start and that the time is free.'],
  ['allDay', 'The all-day switch.'],
  ['timeZone', 'The time zone row: `startTimeZone`, `separateEndZone`, `endTimeZone` (with `editing.allowTimeZones`), each may be named alone too.'],
  ['recurrenceRule', 'The recurrence editor (with `editing.allowRecurrence`).'],
  ['a resource’s field', 'Its picker: a drop-down, or a tag box for a kind of several; each item with its colour.'],
];

const ITEM = [
  ['field, label, editor, editorProps, colSpan', 'As a kit form item. `editor` may be a name or a function that makes the editor from the props a named one gets.'],
  ['visible, enabled, readOnly, required, label, helpText, group', 'A value, a function that is followed, or a function of the form `(form) => …` (its `appointment`, `data`, `isNew`): shown or locked for one appointment only.'],
  ['rules', 'Kit validation rules (or a function of the form giving them); added to a built-in’s own.'],
  ['items, group, columns', 'A group under a caption, its items named or given the same way.'],
  ['tabs', '`[{ title, items, columns?, visible? }]`: tabs, every tab checked when the form is saved; the tab of the first field that failed shows.'],
  ['template', '`(form, place) => ComponentBase`: any MotifJS component for this place; `place` has the `field` and the `validationGroup` to check it with the others.'],
  ['button', 'A button of the form.'],
];

const CHANGES = [
  ['A built-in or a resource named by `field`', 'Its settings win; `rules` add; `visible` and `enabled` hold when both say so; `readOnly` when either does; `editorProps` merge.'],
  ['`onFormOpening`', 'Still fires, with the items as `editing.form` made them; it may change them, or cancel to open a form of your own.'],
];

export default function SchedulerFormPage() {
  return (
    <>
      <p class="lead">
        The appointment form set up without events: which fields, in which order, in groups and tabs; editors of your own; checks per field; fields shown or
        locked for one appointment only. Or a form of your own.
      </p>

      <Section anchor="declared" title="Items, groups and tabs">
        <p>
          <Rich text="`editing.form.items` lists what the form holds. A built-in item and a resource are named by their fields; an item with the same `field` changes that one (here the title's label and a rule). The time zone row (`timeZone`) and the recurrence editor (`recurrenceRule`) are items like the others: move them, or leave them out. `tabs` and groups hold items named the same way." />
        </p>
        <Example files={code('DeclaredForm.tsx', 'resource-data.ts')}>
          <DeclaredForm />
        </Example>
      </Section>

      <Section anchor="editors" title="Editors of your own">
        <p>
          <Rich text="`editor` may be a function: it gets the props a named editor gets (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …), so any component that takes them is checked with the form. `template` places any MotifJS component; it gets the form (its reactive `data`) and its place (`field`, `validationGroup`). `rules` are the kit's validation rules, added to a built-in's own." />
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

      <Section anchor="conditional" title="Fields for one appointment">
        <p>
          <Rich text="`visible`, `readOnly`, `enabled`, `required`, `label` and `helpText` may be functions of the form: `(form) => form.data.roomId === 3`. They read the form's data as it is now, so a field shows when another changes." />
        </p>
        <Example files={code('ConditionalFields.tsx', 'resource-data.ts')}>
          <ConditionalFields />
        </Example>
      </Section>

      <Section anchor="own" title="A form of your own">
        <p>
          <Rich text="`onFormOpening` gets the items `editing.form` made and may still change them; `cancel` keeps the scheduler's form closed. Open your own, then save with `addAppointment` or `updateAppointment`: the events and the checks run as for the scheduler's form." />
        </p>
        <Example files={code('OwnForm.tsx', 'resource-data.ts')}>
          <OwnForm />
        </Example>
      </Section>

      <Section anchor="api" title="API reference">
        <h3>editing.form</h3>
        <ApiTable head={['Member', 'Type', 'Default', 'Description']} rows={FORM} />
        <h3>Built-in items</h3>
        <ApiTable head={['Name', 'What it is']} rows={NAMES} />
        <h3>SchedulerFormItem</h3>
        <ApiTable head={['Member', 'What it does']} rows={ITEM} />
        <h3>How they combine</h3>
        <ApiTable head={['Case', 'What happens']} rows={CHANGES} />
        <h3>FormLayout</h3>
        <ApiTable
          head={['Member', 'What it does']}
          rows={[
            ['FormItem.tabs', 'Tabs of items in any `FormLayout`; a check shows the tab of the first field that failed.'],
            ['FormItem.editor (a function)', 'Makes the editor from the props a named one gets.'],
            ['FormItem.template(context)', 'Gets `{ data, field, validationGroup }`.'],
            ["editor: 'tagbox'", 'A tag box by name.'],
          ]}
        />
      </Section>
    </>
  );
}
