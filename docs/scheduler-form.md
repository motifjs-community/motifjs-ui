# Scheduler: The appointment form

> Scheduler · @motifx-community/ui 0.1.0-beta.2

The appointment form set up without events: which fields, in which order, in groups and tabs; editors of your own; checks per field; fields shown or locked for one appointment only. Or a form of your own.

## Items, groups and tabs

`editing.form.items` lists what the form holds. A built-in item and a resource are named by their fields; an item with the same `field` changes that one (here the title's label and a rule). The time zone row (`timeZone`) and the recurrence editor (`recurrenceRule`) are items like the others: move them, or leave them out. `tabs` and groups hold items named the same way.

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

## Editors of your own

`editor` may be a function: it gets the props a named editor gets (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …), so any component that takes them is checked with the form. `template` places any MotifJS component; it gets the form (its reactive `data`) and its place (`field`, `validationGroup`). `rules` are the kit's validation rules, added to a built-in's own.

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

## Fields for one appointment

`visible`, `readOnly`, `enabled`, `required`, `label` and `helpText` may be functions of the form: `(form) => form.data.roomId === 3`. They read the form's data as it is now, so a field shows when another changes.

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

## A form of your own

`onFormOpening` gets the items `editing.form` made and may still change them; `cancel` keeps the scheduler's form closed. Open your own, then save with `addAppointment` or `updateAppointment`: the events and the checks run as for the scheduler's form.

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
| `items` | `(string \\| SchedulerFormItem)[]` | the built-ins, the resources after All day | What the form holds, in order: a built-in item by its field, a resource by its field, or an item of your own. Unknown names are left out. |
| `columns` | `number` | `2` | Columns of the form (a group and a tab may have their own). |
| `minColumnWidth` | `string` | — | With it, as many columns as fit, each at least this wide; `columns` is the most. |
| `labelMode` | `Bind<FieldLabelMode>` | the language’s | Where the labels go. |
| `title` | `FormBind<string>` | New / Edit appointment | The form’s title; a function of the form may say it per appointment. |
| `width` | `string` | the language’s | The form’s width, a CSS length. |

### Built-in items

| Name | What it is |
| --- | --- |
| `text, description` | The title (required) and the description. |
| `start, end` | Each two items: a date and time, and (all day) a date. The end checks it is after the start and that the time is free. |
| `allDay` | The all-day switch. |
| `timeZone` | The time zone row: `startTimeZone`, `separateEndZone`, `endTimeZone` (with `editing.allowTimeZones`), each may be named alone too. |
| `recurrenceRule` | The recurrence editor (with `editing.allowRecurrence`). |
| `a resource’s field` | Its picker: a drop-down, or a tag box for a kind of several; each item with its colour. |

### SchedulerFormItem

| Member | What it does |
| --- | --- |
| `field, label, editor, editorProps, colSpan` | As a kit form item. `editor` may be a name or a function that makes the editor from the props a named one gets. |
| `visible, enabled, readOnly, required, label, helpText, group` | A value, a function that is followed, or a function of the form `(form) => …` (its `appointment`, `data`, `isNew`): shown or locked for one appointment only. |
| `rules` | Kit validation rules (or a function of the form giving them); added to a built-in’s own. |
| `items, group, columns` | A group under a caption, its items named or given the same way. |
| `tabs` | `[{ title, items, columns?, visible? }]`: tabs, every tab checked when the form is saved; the tab of the first field that failed shows. |
| `template` | `(form, place) => ComponentBase`: any MotifJS component for this place; `place` has the `field` and the `validationGroup` to check it with the others. |
| `button` | A button of the form. |

### How they combine

| Case | What happens |
| --- | --- |
| `A built-in or a resource named by `field`` | Its settings win; `rules` add; `visible` and `enabled` hold when both say so; `readOnly` when either does; `editorProps` merge. |
| ``onFormOpening`` | Still fires, with the items as `editing.form` made them; it may change them, or cancel to open a form of your own. |

### FormLayout

| Member | What it does |
| --- | --- |
| `FormItem.tabs` | Tabs of items in any `FormLayout`; a check shows the tab of the first field that failed. |
| `FormItem.editor (a function)` | Makes the editor from the props a named one gets. |
| `FormItem.template(context)` | Gets `{ data, field, validationGroup }`. |
| `editor: 'tagbox'` | A tag box by name. |

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

/** A component of your own as an editor: a row of colours, bound to the form's data. */
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
