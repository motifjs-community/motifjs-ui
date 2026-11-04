# Scheduler: Timeline

> Scheduler · @motifx-community/ui 0.1.0-beta.0

A row per resource with the time running along it: a day, a week, a work week or a month. Appointments at the same time stack in their row, and the row grows to fit them.

## Timeline views

`timelineDay`, `timelineWeek`, `timelineWorkWeek` and `timelineMonth` show the groups as rows (one row without `groups`). The scale over the cells has two tiers: the days over their hours (the months over their days). It stays at the top while the rows scroll, the resource column at the start while the time scrolls. The line at the current time, blocked times and the hours outside work carry over; a drag moves an appointment along its row or to another one, and its ends change its time.

```tsx
import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
```

## Nested groups

With two kinds in `groups`, each row is an item of the inner kind under its item of the outer kind: the resource column has a level per kind, the outer name on the first of its rows. The time runs right to left in a right-to-left page.

```tsx
import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
```

## Settings per view

Each view may have its own `intervalCount`, `startDate`, `cellDuration`, hours, `groups`, `maxAppointmentsPerCell` and templates; what it leaves out is the scheduler's.

```tsx
import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
```

## Templates

Every template can be given to the scheduler and to a view; the view's own wins. A template is made once for the element it draws and gets a context whose fields follow it.

```tsx
import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Left / Right (cells)` | Along the time, mirrored right to left; past the first or the last cell the view moves on. |
| `Up / Down (cells)` | To the row above or below. |
| `Home / End, Ctrl + Home / End` | The row’s first and last cell; with Ctrl, of the first and the last row. |
| `PageUp / PageDown` | A screen of rows. |
| `Shift + arrows` | Selects cells along the row. |
| `Left / Right (appointment)` | Moves it a snap step along the time (a day in the timeline month); Shift: its end. |
| `Up / Down (appointment)` | Moves it to the row above or below (its group changes); Enter saves, Escape takes it back. |

## Accessibility

| Topic | How |
| --- | --- |
| `Rows` | The rows are a grid’s rows; each cell reads its group, its date and its time, and a blocked time after them. |
| `Resource column, scale` | Drawn only (`aria-hidden`): every cell names its group and its time. |
| `Appointments` | Each row’s appointments are in a cell of their own, named by the row; an appointment reads its text, its time and whether it goes on. |

## Styling

| Hook | What it is |
| --- | --- |
| `scheduler.scale, scale-upper (`today`), scale-lower (`day-start`, `day`, `weekend`, `today`)` | Units: the head over the cells and its two tiers. |
| `scheduler.timeline-corner, timeline-corner-label` | Units: the corner over the resource column, the names of the kinds. |
| `scheduler.resource-cell (`inner`, `first`, `continued`)` | Unit: a level of the resource column. |
| `scheduler.timeline-row (`first`), timeline-divider (`inner`)` | Units: a row along the time and the line over it; the line where an outer group starts. |
| `scheduler.cell `line`, `line-hour`, `line-day`` | The cells along the time: the line before each, stronger where an hour and a day start. |
| `scheduler.appointment `line`, `line-before`, `line-after`` | An appointment on a lane, and its cut ends. |
| `timeline-cell-width, timeline-resource-width, timeline-lane-size, timeline-row-min-height` | Plain tokens: a cell’s least width (cells stretch to fill the room when they are few), a level of the resource column, a lane, an empty row. |

## API reference

### Timeline views

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'timelineDay' \\| 'timelineWeek' \\| 'timelineWorkWeek' \\| 'timelineMonth'` | — | A row per group, the time along it: hours of a day, of a week, of a work week; the days of a month. |
| `intervalCount` | `Bind<number>` | 1 | How many days, weeks or months it shows. |
| `startDate` | `Bind<Date \\| null>` | `null` | With `intervalCount` over 1: the date its intervals are counted from, so they stay put when the date moves. |
| `cellDuration` | `Bind<number>` | the scheduler's | Minutes in a cell along the time (the timeline month: a day). |
| `startDayHour / endDayHour` | `Bind<number>` | the scheduler's | The hours of each day shown; the time before and after is left out. |
| `groups` | `Bind<string[]>` | the scheduler's | The resource fields the rows are grouped by, outer first; nested groups stand in levels of the resource column. |
| `maxAppointmentsPerCell` | `Bind<number \\| 'auto'>` | `'auto'` | Lanes a row has before "+N more" (per day); `'auto'`: the row grows to fit them all. |
| `scrolling` | `Bind<'auto' \\| 'standard' \\| 'virtual'>` | `'auto'` | Every row and cell built, or only what is in view (see Big data). |
| `name, text` | `string`, `Bind<string>` | the type | Its name for `currentView` and its caption in the bar. |
| `…Template` | see Templates | the scheduler's | A view’s own template wins; `null` turns one off there. |

### Templates

| Prop (and view setting) | Type | Description |
| --- | --- | --- |
| `appointmentTemplate` | `(context: AppointmentTemplateContext) => Component` | An appointment’s content: `{ appointment, start, end, text, time, allDay, view, group }`. |
| `appointmentTooltipTemplate` | `(context: TooltipTemplateContext) => Component` | The tooltip’s content: `{ appointment, text, time, canEdit, canDelete, edit(), remove(), close() }`. |
| `dataCellTemplate` | `(context: CellTemplateContext) => Component` | A cell’s content: `{ start, end, allDay, resources, view, today, work, blocked }`; the cell keeps its look, keys and name. |
| `dateCellTemplate` | `(context: DateTemplateContext) => Component` | A day’s head (the dates, the month’s weekdays, a timeline’s days): `{ date, weekday, number, today, view, resources }`. |
| `timeCellTemplate` | `(context: TimeTemplateContext) => Component` | An hour of the ruler and of a timeline’s scale: `{ date, minutes, text, view }`. |
| `resourceHeaderTemplate` | `(context: ResourceHeaderContext) => Component` | A group’s head: in a timeline, the resource column’s cell. |
| `agendaRowTemplate` | `(context: AgendaRowContext) => Component` | An agenda row’s content (see Agenda). |
| `moreListTemplate` | `(context: MoreListContext) => Component` | The list "+N more" opens: `{ date, appointments, choose(appointment, event) }`. |

### Methods

| Method | Description |
| --- | --- |
| `scrollToTime(hour, minute?)` | In a timeline: along to that time on the date shown (else the first day). |
| `scrollTo(date, resources?)` | Brings a time into view: its cell along the time and the row of `resources` (the group’s values); in the day views its hour and its column. |

## Example files

`Timeline.tsx`

```tsx
import { Scheduler } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/**
 * The four timeline views, a row per person. Jobs at the same time stack in their row, and the row
 * grows. Drag one along its row or to another person; drag its ends to change its time.
 */
export default function Timeline() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={['timelineDay', 'timelineWeek', 'timelineWorkWeek', 'timelineMonth']}
        currentView="timelineWeek"
        startDayHour={7}
        endDayHour={20}
        cellDuration={60}
      />
    </div>
  );
}
```

`timeline-data.ts`

```tsx
import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
```

`NestedTimeline.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { jobs, members, teams, type Job } from './timeline-data';

/**
 * Rows grouped by team, then by the people of each team (`parentExpr`). Up and Down on a job move it
 * to the row above or below; Left and Right move it along the time. "Right to left" mirrors the
 * time and the resource column.
 */
export default function NestedTimeline() {
  const s = reactive({ rtl: false });
  const resources = [
    { field: 'teamId', label: 'Team', items: teams },
    { field: 'ownerId', label: 'Person', items: members, parentExpr: 'teamId', useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo" dir={() => (s.rtl ? 'rtl' : 'ltr')}>
      <Switch label="Right to left" x-model={() => s.rtl} />
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['teamId', 'ownerId']}
        views={['timelineDay', 'timelineWorkWeek']}
        currentView="timelineDay"
        startDayHour={7}
        endDayHour={21}
      />
    </div>
  );
}
```

`TimelineSettings.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch, type MoreListContext } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/** A short list of its own for "+N more": the day and each job's name. */
function Jobs(context: MoreListContext<Job>) {
  return (
    <div class="sched-more">
      <strong>{() => context.date?.toLocaleDateString() ?? ''}</strong>
      {context.appointments.map((job) => (
        <button key={job.id} type="button" class="sched-more__item" onclick={(e: MouseEvent) => context.choose(job, e)}>
          {job.text}
        </button>
      ))}
    </div>
  );
}

/**
 * Views with settings of their own: a working day in half hours, a fortnight in four-hour cells
 * counted from a fixed Monday (`startDate`), and a month of days with at most two lanes a row
 * ("+N more" opens a list of its own). A setting not given is the scheduler's.
 */
export default function TimelineSettings() {
  const s = reactive({ dim: true });
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const monday = new Date(2026, 0, 5);
  return (
    <div class="sched-demo">
      <Switch label="Ended ones quieter" x-model={() => s.dim} />
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={[
          { type: 'timelineDay', name: 'workday', text: 'Workday', startDayHour: 8, endDayHour: 18, cellDuration: 30 },
          { type: 'timelineWeek', name: 'fortnight', text: 'Fortnight', intervalCount: 2, startDate: monday, cellDuration: 240 },
          { type: 'timelineMonth', name: 'month', text: 'Month', maxAppointmentsPerCell: 2, moreListTemplate: Jobs },
        ]}
        currentView="fortnight"
        dimPast={() => s.dim}
      />
    </div>
  );
}
```

`TimelineTemplates.tsx`

```tsx
import { Scheduler, type AppointmentTemplateContext, type CellTemplateContext, type DateTemplateContext, type ResourceHeaderContext, type TimeTemplateContext } from '@motifx-community/ui';
import { jobs, members, type Job, type Member } from './timeline-data';

/**
 * Templates, for the scheduler and for one view: the person's head with their hours, each day's
 * head, the hours, a mark on the cells outside the work hours (in the week only: a view's own
 * template wins) and the job's content.
 */
export default function TimelineTemplates() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const head = (c: ResourceHeaderContext) => {
    const person = c.item as Member;
    return (
      <div class="sched-person">
        <span class="sched-person__avatar" style={{ '--person-color': c.color }} aria-hidden="true">
          {c.text
            .split(' ')
            .map((p) => p[0])
            .join('')}
        </span>
        <span class="sched-person__name">
          <strong>{c.text}</strong>
          <small>{`${person.workStartHour ?? 9}:00–${person.workEndHour ?? 17}:00`}</small>
        </span>
      </div>
    );
  };
  const date = (c: DateTemplateContext) => <span class="sched-date">{`${c.weekday} ${c.number}`}</span>;
  const time = (c: TimeTemplateContext) => <span class="sched-time">{c.text}</span>;
  const cell = (c: CellTemplateContext) => <span class="sched-off" data-off={() => (!c.work ? '' : null)} aria-hidden="true" />;
  const job = (c: AppointmentTemplateContext<Job>) => (
    <span class="sched-job">
      <strong>{c.text}</strong> <span>{c.time}</span>
    </span>
  );
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={['timelineDay', { type: 'timelineWeek', dataCellTemplate: cell }]}
        currentView="timelineWeek"
        startDayHour={7}
        endDayHour={20}
        cellDuration={60}
        resourceHeaderTemplate={head}
        dateCellTemplate={date}
        timeCellTemplate={time}
        appointmentTemplate={job}
      />
    </div>
  );
}
```
