# Scheduler: Editing

> Scheduler · @motifx-community/ui 0.1.0-beta.10

Users can add, move, resize, copy and delete appointments with the pointer and the keyboard, and you can do the same programmatically. Every change raises its event first, can wait for a server, and is reverted if saving fails.

## Drag, resize and edit

While dragging, the appointment itself moves to the new position, on the `snapMinutes` step, and the view scrolls near the edges. On touch screens, a long press starts a drag.

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

## Saving to a server

With a data source, changes go through its adapter. While saving, the appointment stays where it was placed and cannot be changed. If saving fails, `onDataError` reports it and the appointment reverts.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## The appointment form

`onFormOpening` receives the form's `items` (a `FormLayout`) and its `data`. You can add or remove fields, or cancel and show your own form.

```tsx
import { Scheduler, type FormOpeningEventArgs } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

type Booking = Meeting & { room?: string };

const rooms = [
  { value: 'blue', text: 'Blue room' },
  { value: 'green', text: 'Green room' },
  { value: 'online', text: 'Online' },
];

/** The form gets a field of its own (a room) and loses the description; the room is written to the appointment's `room` field. */
export default function CustomForm() {
  const opening = (e: FormOpeningEventArgs<Booking>) => {
    e.data.room = e.appointment?.room ?? 'online';
    e.items.splice(
      e.items.findIndex((item) => item.field === 'description'),
      1,
    );
    e.items.push({ field: 'room', label: 'Room', editor: 'dropdown', editorProps: { items: rooms }, colSpan: 'all' });
    e.form.title = e.appointment ? `Edit ${e.appointment.text}` : 'Book a room';
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} onFormOpening={opening} />
    </div>
  );
}
```

## Validation rules

`onMoving` and `onResizing` control where an appointment can go. When canceled, the drag shows that it cannot drop there. An appointment's own `allowDrag` and `allowResize` can lock it.

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, type DragEventArgs } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

type Locked = Meeting & { allowDrag?: boolean; allowResize?: boolean };

/** Nothing may go over lunch (12:00–13:00) or onto a weekend: the drag shows it cannot drop there. "Lunch with Ana" is locked in place. */
export default function Rules() {
  const list = sampleAppointments() as Locked[];
  const lunch = list.find((m) => m.text === 'Lunch with Ana');
  if (lunch) {
    lunch.allowDrag = false;
    lunch.allowResize = false;
  }
  const s = reactive({ said: '' });
  const allowed = (e: DragEventArgs<Locked>) => {
    const weekend = [0, 6].includes(e.start.getDay());
    const noon = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate(), 12);
    const overLunch = !e.allDay && e.start < new Date(noon.getTime() + 3_600_000) && e.end > noon;
    e.cancel = weekend || overLunch;
    s.said = weekend ? 'Not on a weekend.' : overLunch ? 'Not over lunch.' : '';
  };
  return (
    <div class="sched-demo">
      <Scheduler<Locked> appointments={list} startDayHour={8} endDayHour={19} onMoving={allowed} onResizing={allowed} />
      <p class="sched-log" role="status">
        {() => s.said}
      </p>
    </div>
  );
}
```

## Programmatic use

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** The same changes programmatically: add, move, delete, open the form for a new one. */
export default function EditProgrammatically() {
  const state = reactive({ appointments: sampleAppointments(), said: '' });
  let scheduler: Scheduler<Meeting> | null = null;
  const tomorrow = (hour: number) => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, hour);
  };
  const planning = () => state.appointments.find((m) => m.text === 'Planning');
  const add = async () => {
    const added = await scheduler?.addAppointment({ id: Date.now(), text: 'Planning', startDate: tomorrow(11), endDate: tomorrow(12), color: '#6a1b9a' });
    state.said = added ? `Added ${added.text}` : 'Not added';
  };
  const later = async () => {
    const item = planning();
    if (!item) {
      state.said = 'Add it first';
      return;
    }
    const hour = 3_600_000;
    const ok = await scheduler?.updateAppointment(item, {
      startDate: new Date(item.startDate.getTime() + hour),
      endDate: new Date(item.endDate.getTime() + hour),
    });
    state.said = ok ? 'Moved an hour later' : 'Not moved';
  };
  const remove = async () => {
    const item = planning();
    state.said = item && (await scheduler?.deleteAppointment(item)) ? 'Deleted' : 'Nothing to delete';
  };
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Button text="Add tomorrow 11:00" variant="outline" onclick={add} />
        <Button text="An hour later" variant="outline" onclick={later} />
        <Button text="Delete it" variant="outline" onclick={remove} />
        <Button
          text="New in the form"
          variant="outline"
          onclick={() => void scheduler?.showAppointmentForm(null, { start: tomorrow(15), end: tomorrow(16), allDay: false })}
        />
      </div>
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
      <Scheduler<Meeting> appointments={state.appointments} startDayHour={8} endDayHour={19} ref={(c: Scheduler<Meeting>) => (scheduler = c)} />
    </div>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Enter on cells` | Opens the form for a new appointment over the selection. |
| `Enter on an appointment` | Opens its form. Space shows its tooltip. |
| `Arrows on an appointment` | Moves it: Up and Down by a step (a week in the month view), Left and Right by a day. Shift + arrow changes its end. Enter saves, and Escape reverts. |
| `Delete` | Deletes the focused appointment, after confirmation. |
| `Ctrl while dragging` | Drops a copy. |
| `Escape while dragging` | Reverts the change. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `editing` | `Bind<boolean \| Partial<SchedulerEditing>>` | `true` | `false` makes the scheduler read-only. You can also set `allowAdding`, `allowUpdating`, `allowDeleting`, `allowDragging`, `allowResizing`, `allowCopying` and `confirmDelete` individually. |
| `fields.allowDrag / allowResize / allowEdit / allowDelete` | `string` | The same names | An appointment's own settings, which override `editing`. |
| `snapMinutes` | `Bind<number>` | The cell duration | The step used by dragging and the keyboard. |
| `minDuration` | `Bind<number>` | `snapMinutes` | The minimum duration when resizing, in minutes. |
| `tooltip` | `Bind<boolean>` | `true` | Clicking an appointment shows its tooltip with Edit and Delete. |

### Methods

| Method | Description |
| --- | --- |
| `addAppointment(values)` | Adds an appointment to the source (the array or, through the data source, the server) and resolves to it. |
| `updateAppointment(appointment, changes)` | Changes its fields. Resolves to `false` if an event canceled it or saving failed. |
| `deleteAppointment(appointment)` | Deletes it. There is no confirmation when called programmatically. |
| `showAppointmentForm(appointment?, cell?)` | Opens the form for an appointment, or for a new one at `cell` (the selection by default). |
| `showTooltip(appointment, anchor?) / hideTooltip()` | Controls its tooltip. |

### Events

| Event | Arguments |
| --- | --- |
| `onAppointmentAdding / Added` | `{ appointment, byUser, cancel, promise? }`. The values can still be changed, and `promise` waits, for example for a server. |
| `onAppointmentUpdating / Updated` | `{ appointment, changes, byUser, cancel, promise? }`. |
| `onAppointmentDeleting / Deleted` | `{ appointment, byUser, cancel, promise? }`, raised after the confirmation if there is one. |
| `onFormOpening` | `{ appointment, data, items, form, cancel }`. Change the fields, or cancel to open your own form. |
| `onMoveStart / onMoving / onMoveEnd` | `{ appointment, start, end, allDay, copy, byKeys, cancel }`. Canceling `moving` marks a position as invalid. |
| `onResizeStart / onResizing / onResizeEnd` | The same, for resizing. |
| `onDataError` | `{ operation, appointment, error }`: saving failed, and the appointment reverted. |

## Feedback

Loading issues…

## Example files

`Editing.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Drag an appointment, pull its edges, Ctrl-drag a copy, double-click to edit, click for its tooltip. Every switch is live. */
export default function Editing() {
  const s = reactive({ drag: true, resize: true, copy: true, ask: true, quarter: false, log: [] as string[] });
  const say = (text: string) => {
    s.log.unshift(text);
    if (s.log.length > 6) s.log.pop();
  };
  const time = (d: Date) => d.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="Drag" x-model={() => s.drag} />
        <Switch label="Resize" x-model={() => s.resize} />
        <Switch label="Ctrl copies" x-model={() => s.copy} />
        <Switch label="Ask before deleting" x-model={() => s.ask} />
        <Switch label="15-minute steps" x-model={() => s.quarter} />
      </div>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        startDayHour={8}
        endDayHour={19}
        editing={() => ({ allowDragging: s.drag, allowResizing: s.resize, allowCopying: s.copy, confirmDelete: s.ask })}
        snapMinutes={() => (s.quarter ? 15 : 30)}
        onMoveEnd={(e) => say(`${e.copy ? 'Copied' : 'Moved'} ${e.appointment.text} to ${time(e.start)}${e.byKeys ? ' (keys)' : ''}`)}
        onResizeEnd={(e) => say(`${e.appointment.text} now ${time(e.start)} – ${time(e.end)}`)}
        onAppointmentAdded={(e) => say(`Added ${e.appointment.text}`)}
        onAppointmentUpdated={(e) => say(`Saved ${e.appointment.text}`)}
        onAppointmentDeleted={(e) => say(`Deleted ${e.appointment.text}`)}
      />
      <ol class="sched-events" aria-label="What happened">
        {s.log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ol>
    </div>
  );
}
```

`sample-appointments.ts`

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

`Saving.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A service that saves late and refuses every third change. */
class PickyService extends SlowAdapter<Meeting, number> {
  private changes = 0;

  protected override async updateRow(key: number, changes: Partial<Meeting>): Promise<Partial<Meeting>> {
    await new Promise((done) => setTimeout(done, 700));
    if (++this.changes % 3 === 0) throw new Error('The server said no.');
    return super.updateRow(key, changes);
  }
}

/** Move an appointment: it waits in place while the server saves, and reverts if saving fails. */
export default function Saving() {
  const s = reactive({ said: 'Move an appointment: it waits for the server; every third change fails.' });
  const source = new data.DataSource<Meeting, number>({ adapter: new PickyService({ data: sampleAppointments(), key: 'id' }, 300), loadMode: 'all' });
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <Scheduler<Meeting>
        dataSource={source}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={19}
        onAppointmentUpdated={(e) => (s.said = `Saved: ${e.appointment.text}`)}
        onDataError={(e) => (s.said = `Not saved (${(e.error as Error).message}); it is back where it was.`)}
      />
      <p class="sched-log" role="status">
        {() => s.said}
      </p>
    </div>
  );
}
```

`slow-adapter.ts`

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```
