# Scheduler: Resources and groups

> Scheduler · @motifx-community/ui 0.1.0-beta.7

Resources such as rooms, people and equipment can color appointments, divide columns into groups (nested or under each date), and define when each resource is available and when time is blocked.

## Resources

`resources` lists the resource types. An appointment holds an item's value in the type's `field`, or a list with `allowMultiple` (one meeting with two people). The type marked `useColorAsDefault` colors the appointments, otherwise the first type with an item color does, and an appointment's own `color` takes precedence. The tooltip lists the items, and the form has a picker for each type.

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

## Groups

`groups` divides the columns by each item of the first type, then each item of the next under it (`parentExpr` keeps a person under their own room). The day, week, work week and month views show a header per level. `groupByDate` reverses this, showing each day with the groups under it. Dragging to another group, or pressing Alt + Shift + arrow, changes the resource. In a list, only the value for that group changes.

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

## Custom group headers

`resourceHeaderTemplate` customizes a group header. It can return any MotifJS component, and it is created for each header with the item, its name, color and level, and the date when grouping by date.

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

## Availability

An item's own work hours and days (`workStartHour`, `workEndHour`, `workDays`) shade its columns. `blockedTimes` blocks a time, once or with a rule, for every resource or for specific ones. `allowOffHours: false` keeps what the user moves or saves within work hours, and `allowOverlap: false` prevents overlap with another appointment in the group. A function there makes the whole decision. A box being moved shows where it cannot go, and the form explains why it cannot save.

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

## From a data source

A type's `items` can be a data source, which is loaded once and then tracked for changes such as a filter or an added room. Appointments from a data source group the same way. With `remoteFiltering`, when grouping by a single-value field, the visible resources are also requested from the source (`rangeFilter` with `resources`).

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

```tsx
// The same filter for a request of your own:
source.setFilter(rangeFilter(scheduler.visibleRange, scheduler.fields, { resources: { roomId: [1, 2] } }));
```

## Keyboard

| Key | Description |
| --- | --- |
| `Alt + Shift + Left / Right (on an appointment)` | Moves it to the previous or next group. Enter saves, and Escape reverts. These keys are mirrored on right-to-left pages. |
| `Arrows on the cells` | Above every column, showing the days of each group, or the groups of each day when grouping by date. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Cells` | A cell announces its group before its time ("Atlas, Ana Silva, Monday 26 October, 09:00") and any blocked time after it ("not available: Lunch"). |
| `Heads` | Group headers are decorative (`aria-hidden`), because every cell names its group. |
| `Moving` | Moving with the keyboard announces the destination, its group and whether it is free. |

## Styling

| Hook | Description |
| --- | --- |
| `scheduler.group-header (`inner`, `month`), group-swatch` | Units: a group header at each level, and the item color before the name. |
| `scheduler.group-divider (`inner`, `head`)` | Unit: the line between groups (or between days when grouping by date), across the headers and cells. |
| `scheduler.cell `blocked`, scheduler.unavailable` | A cell in a blocked time, and a hatched layer over it. |
| `scheduler.drop-mark` | Unit: the indicator on a box where it cannot go (with the `invalid` state of the `appointment` unit). |
| `scheduler.resource-swatch (`tooltip`), tooltip-resource-label, tooltip-resource-item` | Units: an item color in the form pickers and tooltip, and the tooltip resource lines. |
| `.mx-scheduler__group-head` | `data-level`, `data-edge`. Cells have `data-edge` and `data-blocked`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `resources` | `Bind<SchedulerResource[]>` | `[]` | The resource types the appointments use. Each one can color them, group the columns and add a picker to the form. |
| `groups` | `Bind<string[]>` | `[]` | The resource fields the columns are grouped by, outer first (`['roomId', 'ownerIds']`). A view's own `groups` takes precedence, and `[]` there means none. |
| `groupByDate` | `Bind<boolean>` | `false` | Places the groups under each date, instead of the dates under each group. A view's own value takes precedence. |
| `resourceHeaderTemplate` | `Bind<((context: ResourceHeaderContext) => ComponentBase) \\| null>` | `null` | Customizes a group header in place of its name. |
| `blockedTimes` | `Bind<SchedulerBlockedTime[]>` | `[]` | Times when nothing can be scheduled: `{ start, end, text?, allDay?, recurrenceRule?, resources? }`. They are shaded on the visible days, and with `resources` only for those resources. |
| `allowOverlap` | `Bind<boolean \\| ((check: SchedulerTimeCheck) => boolean)>` | `true` | Whether what the user moves, resizes or saves can overlap another appointment in its group, or any appointment without groups. A function makes the whole decision and returns `true` when the time is free. |
| `allowOffHours` | `Bind<boolean>` | `true` | Whether the user can place an appointment outside the work hours of its resources, or of the scheduler. |
| `keys.previousGroup / nextGroup` | `string[]` | `Alt+Shift+ArrowLeft` / `…Right` | On a focused appointment in a grouped view, moves it to the previous or next group. |

### SchedulerResource

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `string` | — | The appointment field that holds the item value (`roomId`) or a list of values (`ownerIds`). |
| `label` | `Bind<string>` | The field | The form label, and the name of the type in cells and tooltips. |
| `items` | `Bind<R[] \\| DataSource<R> \\| null>` | `[]` | The items, in memory or from a data source (loaded once and then tracked). Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refreshResources()` or `refresh()`. |
| `valueExpr, displayExpr, colorExpr` | `string` | `'id'`, `'text'`, `'color'` | The item fields for its value, name and color. |
| `allowMultiple` | `Bind<boolean>` | `false` | Allows several per appointment. The field holds a list, and the form uses a tag box. |
| `useColorAsDefault` | `Bind<boolean>` | `false` | Colors appointments by this type, otherwise by the first type with an item color. An appointment's own `color` takes precedence. |
| `parentExpr` | `string` | — | The item field that references its parent item in the type above it in `groups`. When nested, a group shows only its own children. |
| `workStartHourExpr, workEndHourExpr, workDaysExpr` | `string` | `'workStartHour'`, `'workEndHour'`, `'workDays'` | An item's own work hours and days, which override the scheduler's. In nested groups, the innermost item applies. |

### Methods

| Method | Description |
| --- | --- |
| `checkTime(appointment, start, end, options?)` | Whether it can be there (`free`) and what conflicts: `overlapping`, `blocked`, `offHours`. `options` accepts `allDay` and `resources`, the values it would have. |
| `resourcesOf(appointment)` | Its items by type: `{ field, label, items: { value, text, color, item }[] }[]`. |
| `refreshResources()` | Re-reads the items after they have been changed in place. |
| `rangeFilter(range, fields, { resources })` | The data layer filter for a range, now also for the visible resources (`{ roomId: [1, 2] }`, for single-value fields). |

### Events

| Event | Arguments |
| --- | --- |
| `onMoving / onResizing` | These also include `resources`, the values its resource fields would get in another group. `cancel` starts as `true` where the time is not free, and `false` allows the move. |
| `onMoveStart / onMoveEnd …` | This also includes `resources`. |
| `onAppointmentClick / DblClick` | `group` provides the resource values of the clicked group. |
| `onCellClick / DblClick` | `cell.resources` provides the group of the cell, and a new appointment there receives these values. |

## Feedback

Loading issues…

## Example files

`Resources.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * Two kinds of resources: a booking has one room and one or more people. Their colours paint the
 * bookings; the choice says which kind does (`useColorAsDefault`, a function, so it follows).
 * Click a booking: the tooltip names its room and its people.
 */
export default function Resources() {
  const s = reactive({ by: 'room' });
  const resources = [
    { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: () => s.by === 'room' },
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: () => s.by === 'people' },
  ];
  return (
    <div class="sched-demo">
      <RadioGroup
        label="Colour by"
        orientation="horizontal"
        items={[
          { value: 'room', text: 'Room' },
          { value: 'people', text: 'People' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.by}
      />
      <Scheduler<Booking> appointments={bookings()} resources={resources} currentView="week" startDayHour={8} endDayHour={18} />
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

`Grouped.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * Columns grouped by room, then by the people of each room (`parentExpr`: a person's room). Drag a
 * booking to another person: only that person changes, the others stay on it. "Group by date" puts
 * the people under each day.
 */
export default function Grouped() {
  const s = reactive({ byDate: false });
  const resources = [
    { field: 'roomId', label: 'Room', items: rooms },
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, parentExpr: 'roomId', useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo">
      <Switch label="Group by date" x-model={() => s.byDate} />
      <Scheduler<Booking>
        appointments={bookings()}
        resources={resources}
        groups={['roomId', 'ownerIds']}
        groupByDate={() => s.byDate}
        views={['day', { type: 'workWeek', name: 'workWeek' }, 'month']}
        currentView="day"
        startDayHour={8}
        endDayHour={18}
      />
    </div>
  );
}
```

`HeaderTemplate.tsx`

```tsx
import { Scheduler, type ResourceHeaderContext } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking, type Person } from './resource-data';

/** A person's header drawn by a template: their initials in their color, their name and their room. */
function PersonHead(context: ResourceHeaderContext) {
  const person = context.item as Person;
  const initials = context.text
    .split(' ')
    .map((part) => part[0])
    .join('');
  const room = rooms.find((r) => r.id === person.roomId)?.text ?? '';
  return (
    <div class="sched-person">
      <span class="sched-person__avatar" style={{ '--person-color': context.color }} aria-hidden="true">
        {initials}
      </span>
      <span class="sched-person__name">
        <strong>{context.text}</strong>
        <small>{room}</small>
      </span>
    </div>
  );
}

/** Grouped by person, with each header created by `resourceHeaderTemplate`. */
export default function HeaderTemplate() {
  const resources = [{ field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: true }];
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={resources}
        groups={['ownerIds']}
        currentView="day"
        startDayHour={8}
        endDayHour={18}
        resourceHeaderTemplate={(context: ResourceHeaderContext) => PersonHead(context)}
      />
    </div>
  );
}
```

`Availability.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler, type SchedulerBlockedTime, type SchedulerTimeCheck } from '@motifx-community/ui';
import { bookings, rooms, type Booking } from './resource-data';

/**
 * When a booking may go: Bosphorus is open 10 to 18 (its own work hours), lunch is blocked every
 * weekday, Cappadocia is closed tomorrow. Outside the hours nothing goes (`allowOffHours`); the
 * choice says whether bookings in a room may overlap, or a rule of its own lets two at once.
 */
export default function Availability() {
  const s = reactive({ overlap: 'no', said: '' });
  const today = new Date();
  const day = (offset: number, hour = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour);
  const blocked: SchedulerBlockedTime[] = [
    { start: day(0, 12), end: day(0, 13), text: 'Lunch', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { start: day(1), end: day(1), allDay: true, text: 'Closed for cleaning', resources: { roomId: 3 } },
  ];
  /** Two at once fit in a room, but never over a blocked time or out of its hours. */
  const twoAtOnce = (check: SchedulerTimeCheck<Booking>) => !check.blocked.length && !check.offHours && check.overlapping.length < 2;
  return (
    <div class="sched-demo">
      <RadioGroup
        label="Bookings in a room"
        orientation="horizontal"
        items={[
          { value: 'no', text: 'May not overlap' },
          { value: 'two', text: 'Two at once (a rule)' },
          { value: 'yes', text: 'May overlap' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.overlap}
      />
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[{ field: 'roomId', label: 'Room', items: rooms }]}
        groups={['roomId']}
        currentView="day"
        views={[{ type: 'day', intervalCount: 2 }]}
        startDayHour={8}
        endDayHour={19}
        blockedTimes={blocked}
        allowOffHours={false}
        allowOverlap={() => (s.overlap === 'two' ? twoAtOnce : s.overlap === 'yes')}
        onMoving={(e) => (s.said = e.cancel ? 'Not free there.' : '')}
        onMoveEnd={() => (s.said = '')}
      />
      <p class="sched-log">{() => s.said}</p>
    </div>
  );
}
```

`ResourcesFromSource.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { CheckBox, Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { bookings, rooms, type Booking, type Room } from './resource-data';

/**
 * The rooms and the bookings both come from data sources that answer late. The rooms load once and
 * are followed: filter them and the groups change. Grouped by room, the bookings are asked for the
 * days and the rooms shown only.
 */
export default function ResourcesFromSource() {
  const s = reactive({ two: false, asked: '' });
  const roomSource = new data.DataSource<Room, number>({ adapter: new SlowAdapter<Room, number>({ data: rooms, key: 'id' }, 400), loadMode: 'all' });
  const source = new data.DataSource<Booking, number>({ adapter: new SlowAdapter<Booking, number>({ data: bookings(), key: 'id' }, 600), loadMode: 'all' });
  source.onChanged((e) => {
    if (e.reason !== 'loading') return;
    const rooms = JSON.stringify((source.filter as { and?: unknown[] } | null)?.and?.slice(2) ?? []);
    s.asked = `Asked for the rooms: ${rooms}`;
  });
  const onlyTwo = (on: boolean) => void roomSource.setFilter(on ? { field: 'id', op: 'in', value: [1, 2] } : null);
  return (
    <div
      class="sched-demo"
      onDisposing={() => {
        source.dispose();
        roomSource.dispose();
      }}
    >
      <CheckBox
        label="Only Atlas and Bosphorus"
        x-model={() => s.two}
        onValueChanged={(e: { value: boolean | null }) => onlyTwo(!!e.value)}
      />
      <Scheduler<Booking>
        dataSource={source}
        resources={[{ field: 'roomId', label: 'Room', items: roomSource }]}
        groups={['roomId']}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
      />
      <p class="sched-log">{() => s.asked}</p>
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
