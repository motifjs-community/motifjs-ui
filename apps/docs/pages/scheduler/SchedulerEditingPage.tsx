import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import CustomForm from './examples/CustomForm';
import EditProgrammatically from './examples/EditProgrammatically';
import Editing from './examples/Editing';
import Rules from './examples/Rules';
import Saving from './examples/Saving';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  [
    'editing',
    '`Bind<boolean | Partial<SchedulerEditing>>`',
    '`true`',
    '`false`: read only. Or each switch: `allowAdding`, `allowUpdating`, `allowDeleting`, `allowDragging`, `allowResizing`, `allowCopying`, `confirmDelete`.',
  ],
  ['fields.allowDrag / allowResize / allowEdit / allowDelete', '`string`', 'the same names', 'An appointment’s own switches; they win over `editing`.'],
  ['snapMinutes', '`Bind<number>`', 'the cell', 'The step a drag and the keys move by.'],
  ['minDuration', '`Bind<number>`', '`snapMinutes`', 'The shortest an appointment gets by resizing, in minutes.'],
  ['tooltip', '`Bind<boolean>`', '`true`', 'A click on an appointment shows its tooltip with Edit and Delete.'],
];

const EVENTS = [
  ['onAppointmentAdding / Added', '`{ appointment, byUser, cancel, promise? }`: the values may still be changed; `promise` waits (a server).'],
  ['onAppointmentUpdating / Updated', '`{ appointment, changes, byUser, cancel, promise? }`.'],
  ['onAppointmentDeleting / Deleted', '`{ appointment, byUser, cancel, promise? }`, after the question when it asks.'],
  ['onFormOpening', '`{ appointment, data, items, form, cancel }`: change the fields, or cancel to open your own form.'],
  ['onMoveStart / onMoving / onMoveEnd', '`{ appointment, start, end, allDay, copy, byKeys, cancel }`: cancel on `moving` marks a place it may not go.'],
  ['onResizeStart / onResizing / onResizeEnd', 'The same, for the edges.'],
  ['onDataError', '`{ operation, appointment, error }`: saving failed; the appointment shows as it was.'],
];

const METHODS = [
  ['addAppointment(values)', 'Adds where the appointments come from (pushed into the array, or inserted through the data source); resolves to it.'],
  ['updateAppointment(appointment, changes)', 'Changes its fields; resolves `false` when an event said no or saving failed.'],
  ['deleteAppointment(appointment)', 'Deletes it (no question programmatically).'],
  ['showAppointmentForm(appointment?, cell?)', 'The form for an appointment, or for a new one at `cell` (the selection by default).'],
  ['showTooltip(appointment, anchor?) / hideTooltip()', 'Its tooltip.'],
];

const KEYS = [
  ['Enter on cells', 'The form for a new appointment over the selection.'],
  ['Enter on an appointment', 'Its form. Space: its tooltip.'],
  [
    'Arrows on an appointment',
    'Move it: Up / Down a step (a week in the month), Left / Right a day. Shift + arrows: its end. Enter saves, Escape takes it back.',
  ],
  ['Delete', 'Deletes the focused appointment (asking first).'],
  ['Ctrl while dragging', 'Drops a copy.'],
  ['Escape while dragging', 'Takes it back.'],
];

export default function SchedulerEditingPage() {
  return (
    <>
      <p class="lead">
        Appointments are added, moved, resized, copied and deleted with the pointer, the keys and code; every change asks its event first, can wait for a
        server, and goes back when saving fails.
      </p>

      <Section anchor="editing" title="Drag, resize, edit">
        <p>
          <Rich text="The box itself goes where the appointment would go while it is dragged, on the step of `snapMinutes`; near the edges the view scrolls. A finger starts a drag with a long press." />
        </p>
        <Example files={code('Editing.tsx', 'sample-appointments.ts')}>
          <Editing />
        </Example>
      </Section>

      <Section anchor="saving" title="Saving to a server">
        <p>
          <Rich text="With a data source the changes go through its adapter. While one saves the appointment stays where it was put and cannot be changed; when it fails `onDataError` tells, and it goes back." />
        </p>
        <Example files={[...code('Saving.tsx'), slowAdapterFile]}>
          <Saving />
        </Example>
      </Section>

      <Section anchor="form" title="The form">
        <p>
          <Rich text="`onFormOpening` gets the form's `items` (a `FormLayout`) and its `data`: add your own fields, take some away, or cancel and show a form of your own." />
        </p>
        <Example files={code('CustomForm.tsx')}>
          <CustomForm />
        </Example>
      </Section>

      <Section anchor="rules" title="Rules">
        <p>
          <Rich text="`onMoving` and `onResizing` say where an appointment may go: cancelled, the drag shows it cannot drop there. An appointment's own `allowDrag` and `allowResize` lock it." />
        </p>
        <Example files={code('Rules.tsx')}>
          <Rules />
        </Example>
      </Section>

      <Section anchor="code" title="Programmatic use">
        <Example files={code('EditProgrammatically.tsx')}>
          <EditProgrammatically />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'Arguments']} rows={EVENTS} />
      </Section>
    </>
  );
}
