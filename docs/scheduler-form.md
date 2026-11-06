# Scheduler: The appointment form

> Scheduler · @motifx-community/ui 0.1.0-beta.4

Configure the appointment form without handling events. You can choose its fields and their order, arrange them in groups and tabs, use custom editors, add validation per field, and show or lock fields for specific appointments. You can also replace the form with your own.

## Items, groups and tabs

`editing.form.items` lists the contents of the form. Built-in items and resources are referenced by their fields, and an item with the same `field` modifies that item (here, the title's label and a rule). The time zone row (`timeZone`) and the recurrence editor (`recurrenceRule`) are regular items that you can move or omit. `tabs` and groups contain items specified the same way.

```tsx
import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
```

## Custom editors

`editor` can be a function. It receives the same props as a named editor (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …), so any component that accepts them is validated with the form. `template` places any MotifJS component, and receives the form (with its reactive `data`) and its place (`field`, `validationGroup`). `rules` are kit validation rules, and are added to any rules of a built-in item.

```tsx
import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
```

```tsx
// By name, for every form of the page:
FormLayout.editors.set('priority', (props) => new Slider({ ...props, min: 1, max: 5 }));
// { field: 'priority', editor: 'priority' }
```

## Fields for specific appointments

`visible`, `readOnly`, `enabled`, `required`, `label` and `helpText` can be functions of the form: `(form) => form.data.roomId === 3`. They read the form's current data, so a field can appear when another field changes.

```tsx
import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
```

## Replacing the form

`onFormOpening` receives the items built from `editing.form` and can still change them. Set `cancel` to keep the scheduler's form closed, open your own form, and then save with `addAppointment` or `updateAppointment`. The events and validation run the same way as for the scheduler's form.

```tsx
import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
```

## API reference

### editing.form

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `(string \\| SchedulerFormItem)[]` | The built-in items, with resources after All day | The contents of the form, in order: a built-in item by its field, a resource by its field, or a custom item. Unknown names are ignored. |
| `columns` | `number` | `2` | The number of columns in the form. A group or tab can set its own. |
| `minColumnWidth` | `string` | — | Fits as many columns as possible, each at least this wide. `columns` sets the maximum. |
| `labelMode` | `Bind<FieldLabelMode>` | Set by the design language | Label placement. |
| `title` | `FormBind<string>` | New / Edit appointment | The form's title. A function of the form can set it per appointment. |
| `width` | `string` | Set by the design language | The form's width, as a CSS length. |

### Built-in items

| Name | Description |
| --- | --- |
| `text, description` | The title (required) and the description. |
| `start, end` | Each provides two items: a date and time, and a date for all-day appointments. The end validates that it is after the start and that the time is free. |
| `allDay` | The all-day switch. |
| `timeZone` | The time zone row, made up of `startTimeZone`, `separateEndZone` and `endTimeZone` (requires `editing.allowTimeZones`). Each can also be listed individually. |
| `recurrenceRule` | The recurrence editor (requires `editing.allowRecurrence`). |
| `a resource’s field` | The resource's picker: a drop-down, or a tag box for a type that allows several. Each item shows its color. |

### SchedulerFormItem

| Member | Description |
| --- | --- |
| `field, label, editor, editorProps, colSpan` | The same as a kit form item. `editor` can be a name, or a function that creates the editor from the props a named editor receives. |
| `visible, enabled, readOnly, required, label, helpText, group` | A value, a tracked function, or a function of the form, `(form) => …`, with `appointment`, `data` and `isNew`. Use it to show or lock a field for specific appointments. |
| `rules` | Kit validation rules, or a function of the form that returns them. They are added to any rules of a built-in item. |
| `items, group, columns` | A group with a caption. Its items are specified the same way. |
| `tabs` | `[{ title, items, columns?, visible? }]`. Every tab is validated when the form is saved, and the tab containing the first invalid field is shown. |
| `template` | `(form, place) => ComponentBase`: any MotifJS component for this place. `place` provides the `field` and the `validationGroup` used to validate it with the other fields. |
| `button` | A form button. |

### How the settings combine

| Case | Result |
| --- | --- |
| `A built-in or a resource named by `field`` | The item's settings take precedence, `rules` are added, `visible` and `enabled` apply when both allow it, `readOnly` applies when either sets it, and `editorProps` are merged. |
| ``onFormOpening`` | Still occurs, with the items as `editing.form` defines them. It can change them, or cancel to open a custom form. |

### FormLayout

| Member | Description |
| --- | --- |
| `FormItem.tabs` | Tabs of items in any `FormLayout`. Validation shows the tab containing the first invalid field. |
| `FormItem.editor (a function)` | Creates the editor from the props a named editor receives. |
| `FormItem.template(context)` | Receives `{ data, field, validationGroup }`. |
| `editor: 'tagbox'` | A tag box specified by name. |

## Feedback

Loading issues…

## Example files

`DeclaredForm.tsx`

```tsx
import { Scheduler, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * The form set up by `editing.form` alone: the title on top with a rule of its own, then three tabs.
 * Built-in items and resources are named by their fields; the time zone row (`timeZone`) and the
 * recurrence editor are items like the others. Double-click a booking.
 */
export default function DeclaredForm() {
  const form: SchedulerForm<Booking> = {
    columns: 2,
    items: [
      { field: 'text', label: 'Subject', rules: [{ type: 'length', min: 3, message: 'At least three letters.' }] },
      {
        tabs: [
          { title: 'When', items: ['start', 'end', 'timeZone', 'allDay', 'recurrenceRule'] },
          { title: 'Where and who', columns: 1, items: ['roomId', 'ownerIds'] },
          { title: 'Notes', columns: 1, items: [{ field: 'description', label: 'Agenda' }] },
        ],
      },
    ],
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
        ]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        editing={{ allowTimeZones: true, form }}
      />
    </div>
  );
}
```

`resource-data.ts`

```tsx
import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
```

`CustomEditors.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Slider, type AppointmentFormContext, type FormTemplateContext, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

type Rated = Booking & { priority?: number };

const COLORS = ['#1565c0', '#2e7d32', '#ad1457', '#ef6c00', '#455a64'];

/** A custom component as an editor: a row of colors bound to the form's data. */
function ColorChoice(form: AppointmentFormContext<Rated>, place: FormTemplateContext) {
  const data = form.data as Record<string, unknown>;
  return (
    <div class="sched-colors" role="group" aria-label="Colour">
      <span class="sched-colors__label">Colour</span>
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          class="sched-colors__swatch"
          style={{ background: color }}
          aria-label={color}
          aria-pressed={() => data[place.field] === color}
          onclick={() => (data[place.field] = data[place.field] === color ? '' : color)}
        />
      ))}
    </div>
  );
}

/**
 * Editors of your own: a slider made by a function (it takes the props a named editor gets, so it
 * is checked with the form), and a row of colours from a template. A rule of the form's own: an
 * interview needs two people.
 */
export default function CustomEditors() {
  const form: SchedulerForm<Rated> = {
    items: [
      'text',
      'start',
      'end',
      { field: 'priority', label: 'Priority', editor: (props) => new Slider({ ...props, min: 1, max: 5, step: 1 }), colSpan: 'all' },
      { field: 'color', colSpan: 'all', template: ColorChoice },
      'roomId',
      {
        field: 'ownerIds',
        rules: (f) => [
          {
            type: 'custom',
            ignoreEmpty: false,
            check: (value: unknown) => !/interview/i.test(String(f.data.text)) || (Array.isArray(value) && value.length >= 2) || 'An interview needs two people.',
          },
        ],
      },
      'description',
    ],
  };
  const appointments = reactive(bookings().map((b) => ({ ...b, priority: 3 }))) as Rated[];
  return (
    <div class="sched-demo">
      <Scheduler<Rated>
        appointments={appointments}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms },
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
        ]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        editing={{ allowRecurrence: false, form }}
      />
    </div>
  );
}
```

`ConditionalFields.tsx`

```tsx
import { Scheduler, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

type Catered = Booking & { catering?: boolean; guests?: number };

/**
 * Fields for one appointment only, each a function of the form: catering shows only for
 * Cappadocia (the big room), the number of guests only with catering; a booking that has begun
 * keeps its room; the people are needed for an interview.
 */
export default function ConditionalFields() {
  const now = new Date();
  const form: SchedulerForm<Catered> = {
    items: [
      'text',
      'start',
      'end',
      { field: 'roomId', readOnly: (f) => !f.isNew && !!f.appointment && f.appointment.startDate < now, helpText: (f) => (!f.isNew && !!f.appointment && f.appointment.startDate < now ? 'It has begun: the room stays.' : '') },
      { field: 'catering', label: 'Catering', editor: 'switch', visible: (f) => f.data.roomId === 3 },
      { field: 'guests', label: 'Guests', editor: 'number', editorProps: { min: 1, max: 40 }, visible: (f) => f.data.roomId === 3 && !!f.data.catering, required: true },
      { field: 'ownerIds', required: (f) => /interview/i.test(String(f.data.text)) },
      'description',
    ],
  };
  return (
    <div class="sched-demo">
      <Scheduler<Catered>
        appointments={bookings()}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
        ]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        editing={{ allowRecurrence: false, form }}
      />
    </div>
  );
}
```

`OwnForm.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, FormLayout, MxForm, Scheduler, Stack, type FormOpeningEventArgs } from '@motifx-community/ui';
import { bookings, rooms, type Booking } from './resource-data';

/**
 * A form of your own: `onFormOpening` cancels the scheduler's and opens a short one (a title and a
 * room), then saves through the scheduler, so its events and its checks still run.
 */
export default function OwnForm() {
  const opening = async (e: FormOpeningEventArgs<Booking>) => {
    e.cancel = true;
    const data = reactive({ text: String(e.data.text), roomId: (e.data.roomId as number | null) ?? 1 });
    const form = new MxForm({ title: e.appointment ? 'Quick edit' : 'Quick booking', modal: true });
    let layout: FormLayout<typeof data> | null = null;
    form.content = (
      <FormLayout<typeof data>
        data={data}
        ref={(c: FormLayout<typeof data>) => (layout = c)}
        items={[
          { field: 'text', label: 'Title', required: true },
          { field: 'roomId', label: 'Room', editor: 'radio', editorProps: { items: rooms, itemText: 'text', itemValue: 'id', orientation: 'horizontal' } },
        ]}
      />
    );
    form.footer = (
      <Stack orientation="horizontal" justify="end">
        <Button text="Save" tone="accent" onclick={async () => layout && (await layout.validate()).valid && form.close('ok')} />
        <Button text="Cancel" onclick={() => form.close('cancel')} />
      </Stack>
    );
    if ((await form.showDialog(e.source)) !== 'ok') return;
    if (e.appointment) await e.source.updateAppointment(e.appointment, { text: data.text, roomId: data.roomId });
    else await e.source.addAppointment({ text: data.text, roomId: data.roomId, startDate: e.data.start ?? new Date(), endDate: e.data.end ?? new Date() });
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[{ field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true }]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        onFormOpening={(e) => void opening(e)}
      />
    </div>
  );
}
```
