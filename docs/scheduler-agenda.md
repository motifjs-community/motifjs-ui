# Scheduler: Agenda

> Scheduler · @motifx-community/ui 0.1.0-beta.7

Displays upcoming days as a list, with each day's appointments in time order. Days without appointments are omitted.

## Agenda

`agenda` lists `agendaDuration` days, starting from the displayed date (7 by default). A multi-day appointment appears on each of its days, and an all-day appointment is labeled as such. The list is a list box, so the arrow keys move between rows, and Space and Enter act like a click and a double-click.

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

## Grouping by resource

With `groups`, each group's days appear under its name. As in other views, a data source is asked only for the displayed days.

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

`agendaRowTemplate` customizes a row's content, and `appointmentTooltipTemplate` customizes the tooltip here and in every view.

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

| Key | Description |
| --- | --- |
| `Up / Down` | Moves to the row above or below and selects it. |
| `Home / End, PageUp / PageDown` | Moves to the first or last row, or up or down one screen of rows. |
| `Space` | Shows the tooltip, like a click. |
| `Enter` | Opens the form, like a double-click. |
| `Delete` | Deletes the appointment, after confirmation. |
| `T, N / P, A` | Today, and the next and previous days. `keys.agendaView` (A) shows the agenda. |

## Accessibility

| Topic | Details |
| --- | --- |
| `List` | A list box. Each day, within its group, is a group of options named by the day. |
| `Rows` | One option per appointment, with its text, its time, whether it continues and how it repeats. The focused row is the selected row. |
| `Empty` | When there are no appointments, the list is omitted and a message appears instead. |

## Styling

| Hook | Description |
| --- | --- |
| `scheduler.agenda, agenda-group (`first`), agenda-resource` | Units: the list, a day and the line above it, and a group name. |
| `scheduler.agenda-day (`today`), agenda-weekday (`today`), agenda-month, day-number `agenda`` | Units: a day header and its parts. |
| `scheduler.agenda-row (`hover`, `selected`, `open`, `focus`, `past`, `disabled`), agenda-content` | Units: a row and its side-by-side parts. |
| `scheduler.agenda-time, agenda-dot, agenda-text, agenda-empty` | Units: the time column, the appointment color (hidden unless a design language draws it), the text and the empty message. |
| `agenda-time-width` | Plain token: the width of the time column. |

## API reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `agendaDuration` | `Bind<number>` | 7 | The number of days the agenda shows, starting from the displayed date. A view's own value takes precedence. Previous and next move by this number. |
| `groups` | `Bind<string[]>` | `[]` | With groups, each group's days appear under its name, with that group's appointments. |
| `agendaRowTemplate` | `Bind<((context: AgendaRowContext) => Component) \\| null>` | `null` | A row's content: `{ appointment, start, end, text, time, allDay, date, group }`. The row keeps its color, keys and accessible name. |
| `appointmentTooltipTemplate` | `Bind<((context: TooltipTemplateContext) => Component) \\| null>` | `null` | The tooltip's content, in every view. |
| `texts.schedulerNoAppointments` | `string` | "No appointments" | The message shown when the displayed days have no appointments (`uiLocale`). |

## Feedback

Loading issues…

## Example files

`Agenda.tsx`

```tsx
import { reactive } from '@motifx/core';
import { NumberBox, Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * The coming days as a list: each day with its appointments in time order, a day with none left
 * out. Up and Down move over the rows, Space shows the tooltip, Enter opens the form, Delete
 * deletes. Previous and next move by the days shown.
 */
export default function Agenda() {
  const s = reactive({ days: 7 });
  return (
    <div class="sched-demo">
      <NumberBox label="Days" labelMode="side" min={1} max={31} x-model={() => s.days} />
      <Scheduler<Meeting> appointments={sampleAppointments()} views={['agenda', 'week', 'month']} currentView="agenda" agendaDuration={() => s.days} />
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

`GroupedAgenda.tsx`

```tsx
import { Scheduler } from '@motifx-community/ui';
import { jobs, members, teams, type Job } from './timeline-data';

/** With `groups`, each team's days under its name, the jobs coloured by their person. */
export default function GroupedAgenda() {
  const resources = [
    { field: 'teamId', label: 'Team', items: teams },
    { field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        views={[{ type: 'agenda', agendaDuration: 3, groups: ['teamId'] }, 'timelineDay']}
        currentView="agenda"
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

`AgendaTemplates.tsx`

```tsx
import { Button, Scheduler, type AgendaRowContext, type TooltipTemplateContext } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/**
 * An agenda row drawn by `agendaRowTemplate` (the person's name after the job), and a tooltip of
 * its own (`appointmentTooltipTemplate`) with the time and a button to open the form. The row
 * keeps its color, keys and accessible name.
 */
export default function AgendaTemplates() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const person = (job: Job) => members.find((m) => m.id === job.ownerId)?.text ?? '';
  const row = (c: AgendaRowContext<Job>) => (
    <span class="sched-agenda-row">
      <strong>{c.time}</strong>
      <span>{c.text}</span>
      <small>{person(c.appointment)}</small>
    </span>
  );
  const tip = (c: TooltipTemplateContext<Job>) => (
    <div class="sched-tip">
      <strong>{() => c.text}</strong>
      <span>{() => c.time}</span>
      <span>{() => (c.appointment ? person(c.appointment) : '')}</span>
      <Button text="Open" visible={() => c.canEdit} onclick={() => c.edit()} />
    </div>
  );
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        views={[{ type: 'agenda', agendaDuration: 2 }, 'week']}
        currentView="agenda"
        agendaRowTemplate={row}
        appointmentTooltipTemplate={tip}
      />
    </div>
  );
}
```
