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
    '`false` makes the scheduler read-only. You can also set `allowAdding`, `allowUpdating`, `allowDeleting`, `allowDragging`, `allowResizing`, `allowCopying` and `confirmDelete` individually.',
  ],
  ['fields.allowDrag / allowResize / allowEdit / allowDelete', '`string`', 'The same names', 'An appointment\'s own settings, which override `editing`.'],
  ['snapMinutes', '`Bind<number>`', 'The cell duration', 'The step used by dragging and the keyboard.'],
  ['minDuration', '`Bind<number>`', '`snapMinutes`', 'The minimum duration when resizing, in minutes.'],
  ['tooltip', '`Bind<boolean>`', '`true`', 'Clicking an appointment shows its tooltip with Edit and Delete.'],
];

const EVENTS = [
  ['onAppointmentAdding / Added', '`{ appointment, byUser, cancel, promise? }`. The values can still be changed, and `promise` waits, for example for a server.'],
  ['onAppointmentUpdating / Updated', '`{ appointment, changes, byUser, cancel, promise? }`.'],
  ['onAppointmentDeleting / Deleted', '`{ appointment, byUser, cancel, promise? }`, raised after the confirmation if there is one.'],
  ['onFormOpening', '`{ appointment, data, items, form, cancel }`. Change the fields, or cancel to open your own form.'],
  ['onMoveStart / onMoving / onMoveEnd', '`{ appointment, start, end, allDay, copy, byKeys, cancel }`. Canceling `moving` marks a position as invalid.'],
  ['onResizeStart / onResizing / onResizeEnd', 'The same, for resizing.'],
  ['onDataError', '`{ operation, appointment, error }`: saving failed, and the appointment reverted.'],
];

const METHODS = [
  ['addAppointment(values)', 'Adds an appointment to the source (the array or, through the data source, the server) and resolves to it.'],
  ['updateAppointment(appointment, changes)', 'Changes its fields. Resolves to `false` if an event canceled it or saving failed.'],
  ['deleteAppointment(appointment)', 'Deletes it. There is no confirmation when called programmatically.'],
  ['showAppointmentForm(appointment?, cell?)', 'Opens the form for an appointment, or for a new one at `cell` (the selection by default).'],
  ['showTooltip(appointment, anchor?) / hideTooltip()', 'Controls its tooltip.'],
];

const KEYS = [
  ['Enter on cells', 'Opens the form for a new appointment over the selection.'],
  ['Enter on an appointment', 'Opens its form. Space shows its tooltip.'],
  [
    'Arrows on an appointment',
    'Moves it: Up and Down by a step (a week in the month view), Left and Right by a day. Shift + arrow changes its end. Enter saves, and Escape reverts.',
  ],
  ['Delete', 'Deletes the focused appointment, after confirmation.'],
  ['Ctrl while dragging', 'Drops a copy.'],
  ['Escape while dragging', 'Reverts the change.'],
];

export default function SchedulerEditingPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Users can add, move, resize, copy and delete appointments with the pointer and the keyboard, and you can do the same programmatically. Every change raises its event first, can wait for a server, and is reverted if saving fails." />
      </p>

      <Section anchor="editing" title="Drag, resize and edit">
        <p>
          <Rich text="While dragging, the appointment itself moves to the new position, on the `snapMinutes` step, and the view scrolls near the edges. On touch screens, a long press starts a drag." />
        </p>
        <Example files={code('Editing.tsx', 'sample-appointments.ts')}>
          <Editing />
        </Example>
      </Section>

      <Section anchor="saving" title="Saving to a server">
        <p>
          <Rich text="With a data source, changes go through its adapter. While saving, the appointment stays where it was placed and cannot be changed. If saving fails, `onDataError` reports it and the appointment reverts." />
        </p>
        <Example files={[...code('Saving.tsx'), slowAdapterFile]}>
          <Saving />
        </Example>
      </Section>

      <Section anchor="form" title="The appointment form">
        <p>
          <Rich text="`onFormOpening` receives the form's `items` (a `FormLayout`) and its `data`. You can add or remove fields, or cancel and show your own form." />
        </p>
        <Example files={code('CustomForm.tsx')}>
          <CustomForm />
        </Example>
      </Section>

      <Section anchor="rules" title="Validation rules">
        <p>
          <Rich text="`onMoving` and `onResizing` control where an appointment can go. When canceled, the drag shows that it cannot drop there. An appointment's own `allowDrag` and `allowResize` can lock it." />
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
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Arguments']} rows={EVENTS} />
      </Section>
    </>
  );
}
