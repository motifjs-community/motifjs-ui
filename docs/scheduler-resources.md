# Scheduler: Resources and groups

> Scheduler · @motifx-community/ui 0.1.0-beta.1

Rooms, people and any other kind of resource: they colour the appointments, split the columns into groups (nested, or under each date), say when each one works and when nothing may be put in.

## Resources

`resources` lists the kinds. An appointment holds an item's value in the kind's `field`; with `allowMultiple`, a list (one meeting, two people). The kind marked `useColorAsDefault` colours the appointments (else the first kind whose item has a colour); an appointment's own `color` wins. The tooltip names its items, and the form has a picker for each kind.

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

`groups` splits the columns: each item of the first kind, then each of the next under it (`parentExpr` keeps a person under their own room). The day, week, work week and month views show a head per level. `groupByDate` turns it round: each day, with the groups under it. A drag (or Alt + Shift + arrows) to another group changes the resource: in a list, only the group's own value changes.

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

## A head of your own

`resourceHeaderTemplate` draws a group's head: any MotifJS component, made for each head with the item, its name, colour, level and (by date) the date.

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

An item's own work hours and days (`workStartHour`, `workEndHour`, `workDays`) shade its columns. `blockedTimes` blocks a time, once or by a rule, for every resource or the ones named. `allowOffHours: false` keeps what the user moves or saves inside the work hours, `allowOverlap: false` keeps it off another appointment of its group; a function there decides it all. A box being moved shows where it may not go, and the form says why it cannot save.

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

A kind's `items` may be a data source: it is loaded once and followed (a filter, an added room). Appointments from a data source group the same way; with `remoteFiltering`, grouped by a field of one value, the source is asked for the resources shown too (`rangeFilter` with `resources`).

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

| Key | What it does |
| --- | --- |
| `Alt + Shift + Left / Right (on an appointment)` | Moves it to the group before or after; Enter saves, Escape takes it back. Mirrored right to left. |
| `Arrows on the cells` | Over every column: the days of each group (by date, the groups of each day). |

## Accessibility

| Topic | How |
| --- | --- |
| `Cells` | A cell reads its group before its time ("Atlas, Ana Silva, Monday 26 October, 09:00") and a blocked time after it ("not available: Lunch"). |
| `Heads` | The heads of the groups are drawn only (`aria-hidden`): every cell names its group. |
| `Moving` | Moving by the keys says where it would go, its group, and whether it is free there. |

## Styling

| Hook | What it is |
| --- | --- |
| `scheduler.group-header (`inner`, `month`), group-swatch` | Units: a group’s head at each level, and its item’s colour before the name. |
| `scheduler.group-divider (`inner`, `head`)` | Unit: the line between groups (by date, between days), down the heads and the cells. |
| `scheduler.cell `blocked`, scheduler.unavailable` | A cell in a blocked time, and a layer over it (a hatch). |
| `scheduler.drop-mark` | Unit: the mark on a box where it may not go (with the `appointment` unit’s `invalid` state). |
| `scheduler.resource-swatch (`tooltip`), tooltip-resource-label, tooltip-resource-item` | Units: an item’s colour in the form’s pickers and the tooltip; the tooltip’s lines of resources. |
| `.mx-scheduler__group-head` | `data-level`, `data-edge`; cells `data-edge`, `data-blocked`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `resources` | `Bind<SchedulerResource[]>` | `[]` | The kinds of resources the appointments use. Each colours them, may group the columns and gets a picker in the form. |
| `groups` | `Bind<string[]>` | `[]` | The resource fields the columns are grouped by, outer first (`['roomId', 'ownerIds']`). A view’s own `groups` wins; `[]` there for none. |
| `groupByDate` | `Bind<boolean>` | `false` | The groups stand under each date, not the dates under each group. A view’s own wins. |
| `resourceHeaderTemplate` | `Bind<((context: ResourceHeaderContext) => ComponentBase) \\| null>` | `null` | Draws a group’s head in place of its name. |
| `blockedTimes` | `Bind<SchedulerBlockedTime[]>` | `[]` | Times nothing may be put in: `{ start, end, text?, allDay?, recurrenceRule?, resources? }`. Shaded on the days shown; with `resources`, only for those. |
| `allowOverlap` | `Bind<boolean \\| ((check: SchedulerTimeCheck) => boolean)>` | `true` | Whether what the user moves, resizes or saves may overlap another appointment of its group (any one, without groups). A function decides the whole check: `true` when the time is free. |
| `allowOffHours` | `Bind<boolean>` | `true` | Whether the user may put an appointment outside the work hours (of its resources, else the scheduler’s). |
| `keys.previousGroup / nextGroup` | `string[]` | `Alt+Shift+ArrowLeft` / `…Right` | On a focused appointment, grouped: moves it to the group before or after. |

### SchedulerResource

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `string` | — | The appointment field that holds the item’s value (`roomId`), or a list of them (`ownerIds`). |
| `label` | `Bind<string>` | the field | The form’s label; how the cells and the tooltip name the kind. |
| `items` | `Bind<R[] \\| DataSource<R> \\| null>` | `[]` | The items, in memory or from a data source (loaded once, then followed). Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refreshResources()` (or `refresh()`). |
| `valueExpr, displayExpr, colorExpr` | `string` | `'id'`, `'text'`, `'color'` | The item fields of its value, its name and its colour. |
| `allowMultiple` | `Bind<boolean>` | `false` | An appointment may have several: the field holds a list, the form has a tag box. |
| `useColorAsDefault` | `Bind<boolean>` | `false` | Appointments take this kind’s colour (else the first kind whose item has one). Their own `color` wins. |
| `parentExpr` | `string` | — | The item field naming its item of the kind above it in `groups`: nested, a group shows only its own. |
| `workStartHourExpr, workEndHourExpr, workDaysExpr` | `string` | `'workStartHour'`, `'workEndHour'`, `'workDays'` | An item’s own work hours and days; they win over the scheduler’s (the innermost item’s, in nested groups). |

### Methods

| Method | Description |
| --- | --- |
| `checkTime(appointment, start, end, options?)` | Whether it may be there (`free`) and what is there: `overlapping`, `blocked`, `offHours`. `options`: `allDay`, `resources` (the values it would have). |
| `resourcesOf(appointment)` | Its items by kind: `{ field, label, items: { value, text, color, item }[] }[]`. |
| `refreshResources()` | Reads the items again, after you changed them in place. |
| `rangeFilter(range, fields, { resources })` | The data layer’s filter for a range, now also for the resources shown (`{ roomId: [1, 2] }`, fields of one value). |

### Events

| Event | Arguments |
| --- | --- |
| `onMoving / onResizing` | Now also `resources`: the values its resource fields would get in another group. `cancel` starts `true` where the time is not free; `false` lets it go there. |
| `onMoveStart / onMoveEnd …` | `resources` too. |
| `onAppointmentClick / DblClick` | `group`: the resource values of the group it was clicked in. |
| `onCellClick / DblClick` | `cell.resources`: the cell’s group; a new appointment there gets them. |

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

/** A person's head drawn by a template: their initials in their colour, their name and their room. */
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

/** Grouped by person, each head made by `resourceHeaderTemplate`. */
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
