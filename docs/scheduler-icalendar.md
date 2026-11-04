# Scheduler: iCalendar and print

> Scheduler · @motifx-community/ui 0.1.0-beta.0

Appointments out to an iCalendar file and back in (RFC 5545), for use with other calendar applications; and the scheduler on paper.

## Import

```tsx
import { Scheduler, parseICalendar, writeICalendar } from '@motifx-community/ui';
```

## Export

`exportICalendar()` writes the appointments of the days shown, or all of them. A series goes whole with its rule, so another calendar repeats it the same way.

```tsx
import { reactive } from '@motifx/core';
import { formatRuleDate } from '@motifx-community/ui';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
  startDateTimeZone?: string;
  endDateTimeZone?: string;
}

/** Series around this week: a daily standup with one day left out and one moved, a review every other week, a report on the last Friday, an all-day Friday. */
export function recurringAppointments(): Booking[] {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const day = (offset: number, hour = 0, minute = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(-21, 9),
      endDate: day(-21, 9, 30),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      // This Tuesday is left out; this Wednesday's is moved (appointment 2).
      recurrenceException: [day(1, 9), day(2, 9)].map((d) => formatRuleDate({ time: d.getTime(), utc: true, dateOnly: false })).join(','),
    },
    { id: 2, text: 'Team standup', startDate: day(2, 11), endDate: day(2, 11, 30), recurrenceId: 1 },
    {
      id: 3,
      text: 'Design review',
      startDate: day(-11, 14),
      endDate: day(-11, 15, 30),
      color: '#7c4dff',
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH',
    },
    {
      id: 4,
      text: 'Monthly report',
      startDate: day(-60, 16),
      endDate: day(-60, 17),
      color: '#c62828',
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1FR',
    },
    {
      id: 5,
      text: 'Remote day',
      startDate: day(-3),
      endDate: day(-2),
      allDay: true,
      color: '#00838f',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;COUNT=12',
    },
    { id: 6, text: 'Lunch with Ana', startDate: day(3, 12, 30), endDate: day(3, 13, 30), color: '#2e7d32' },
  ]) as Booking[];
}
```

## Import a file

`importICalendar(text)` reads the events and adds them as any new appointment is added: to the array, or through a data source's adapter.

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';
import type { Booking } from './recurring-appointments';

const pad = (n: number) => String(n).padStart(2, '0');
const today = new Date();
const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
const date = (offset: number) => {
  const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

/** A zone by its Windows name with its VTIMEZONE, a weekly series with one day left out, an all-day event, text folded and escaped. */
const FILE = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Example//Calendar//EN',
  'BEGIN:VTIMEZONE',
  'TZID:W. Europe Standard Time',
  'BEGIN:STANDARD',
  'DTSTART:16010101T030000',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:16010101T020000',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
  'BEGIN:VEVENT',
  'UID:sync-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART;TZID=W. Europe Standard Time:${date(0)}T100000`,
  `DTEND;TZID=W. Europe Standard Time:${date(0)}T110000`,
  'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12',
  `EXDATE;TZID=W. Europe Standard Time:${date(2)}T100000`,
  'SUMMARY:Sync with Berlin',
  'DESCRIPTION:Agenda:\n1. Status\, risks\n2. Next steps',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:offsite-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART;VALUE=DATE:${date(3)}`,
  `DTEND;VALUE=DATE:${date(5)}`,
  'SUMMARY:Team offsite',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:call-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART:${date(1)}T130000Z`,
  'DURATION:PT45M',
  'SUMMARY:Call with the customer about the long running rollout of the new pl',
  ' anning tool',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

/**
 * A file read in: each event is added through the data layer as any new appointment is (here an
 * array; a data source gets the same adds through its adapter), with `onAppointmentAdding` first.
 * Read it in again: an event whose UID is there already changes that appointment.
 */
export default function ImportCalendar() {
  const s = reactive({ text: FILE, said: '' });
  const scheduler = (<Scheduler<Booking> appointments={reactive([] as Booking[])} startDayHour={8} endDayHour={18} />) as Scheduler<Booking>;
  const read = async () => {
    const result = await scheduler.importICalendar(s.text);
    s.said = result ? `${result.added.length} added, ${result.updated.length} changed, ${result.failed.length} refused` : 'Not read in';
  };
  return (
    <div class="sched-demo">
      <TextArea label="iCalendar file" rows={8} spellcheck={false} wrap="off" x-model={() => s.text} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Read in" tone="accent" onclick={() => void read()} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      {scheduler}
    </div>
  );
}
```

## What is written and read

| iCalendar | The appointment |
| --- | --- |
| `UID` | The appointment’s key; an occurrence changed apart takes its series’ key. Read in, the UID is the new appointment’s key (with a data source, the adapter gives the key). |
| `DTSTART, DTEND (DURATION read too)` | On the appointment’s own zone (`fields.startTimeZone`, `endTimeZone`), else the scheduler’s `timeZone`, else the browser’s, with `TZID`; an all-day one as dates (`VALUE=DATE`, the end the day after). |
| `SUMMARY, DESCRIPTION` | The text and the description; escaped and folded at 75 octets as RFC 5545 says. |
| `RRULE` | The series’ rule; an `UNTIL` on the wall clock is written in UTC, as the RFC asks of a rule with a zone. |
| `EXDATE` | The times left out of a series, in the form of its start. |
| `RECURRENCE-ID` | An occurrence changed apart: the time of its series it replaces (the left-out time nearest to it). Read in, the series leaves that time out and the event names it (`fields.recurrenceId`). |
| `VTIMEZONE` | Written for every zone used, from the browser’s own time zone data (a rule a year when the changes follow one). Read in, a zone that is not an IANA name (`W. Europe Standard Time`) is followed by its VTIMEZONE. |
| `STATUS:CANCELLED` | Read in: a cancelled occurrence is left out of its series; a cancelled event is not added. |

## Print

On paper every hour, row and column is built and shown (a big view is built whole while it prints), nothing is scrolled, the colours are kept and the bar is left out; a week of the month, a timeline row, a day of the agenda and an appointment are not split between pages.

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

## Styling

| Hook | What it is |
| --- | --- |
| `scheduler.scheduler `print`, appointment `print`` | Unit states: the look on paper, where a language draws it otherwise (no card frame). |
| `[data-printing]` | On the scheduler while it prints; `print()` also marks the page so only this scheduler prints. |

## API reference

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `exportICalendar(options?)` | `string \| null` | `{ range: 'visible' (default) \| 'all' \| { start, end }, appointments, name }`: the file's text; `null` when `onICalendarExporting` said no. |
| `importICalendar(text)` | `Promise<ICalendarImportResult \| null>` | `{ added, updated, failed }`: each event added through the data layer (with `onAppointmentAdding` first); an event whose UID is an appointment’s key changes it. |
| `print()` | `Promise<boolean>` | Prints the scheduler alone; `false` when `onPrinting` said no. |

### Events

| Event | Arguments | When |
| --- | --- | --- |
| `onICalendarExporting` | `{ appointments, range, cancel }` | Before writing; change `appointments` to write others. |
| `onICalendarExported` | `{ text, appointments }` | After writing. |
| `onICalendarImporting` | `{ text, appointments, cancel }` | Before adding: `appointments` are the values read, to change or filter. |
| `onICalendarImported` | `{ added, updated, failed }` | After adding. |
| `onPrinting` | `{ cancel }` | Before the print dialog. |
| `onPrinted` | `{}` | The print dialog closed (also after the browser’s own print). |

### The iCalendar part

The reader and the writer are DOM-free parts of the kit, usable without a scheduler.

| Function | Returns | Description |
| --- | --- | --- |
| `parseICalendar(text)` | `ICalendar` | The events, the time zones and the calendar’s name of a file; folded lines, escaped text, several calendars, components inside events; never throws. |
| `writeICalendar(options)` | `string` | `{ events, name, prodId, method, timeZones, stamp }`. |
| `timeZoneLines(zone, fromYear, toYear)` | `string[]` | The VTIMEZONE of an IANA zone, from `Intl`. |
| `icalendarMoment(date, zones, fallback)` | `number` | The moment a date of a file names: UTC, an IANA zone, the file’s VTIMEZONE, else `fallback`. |

## Example files

`ExportCalendar.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';
import { recurringAppointments, type Booking } from './recurring-appointments';

/**
 * The appointments as an iCalendar file (RFC 5545): the days shown or all of them. A series goes
 * whole with its rule, the times left out of it and the one moved apart (`RECURRENCE-ID`); every zone
 * used comes with its `VTIMEZONE`. Open the file in any calendar application.
 */
export default function ExportCalendar() {
  const s = reactive({ text: '', url: '' });
  const scheduler = (<Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} label="Team calendar" />) as Scheduler<Booking>;
  const write = (range: 'visible' | 'all') => {
    s.text = scheduler.exportICalendar({ range }) ?? '';
    if (s.url) URL.revokeObjectURL(s.url);
    s.url = URL.createObjectURL(new Blob([s.text], { type: 'text/calendar' }));
  };
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Export the days shown" variant="outline" onclick={() => write('visible')} />
        <Button text="Export all" variant="outline" onclick={() => write('all')} />
        <a href={() => s.url || null} download="team-calendar.ics" x-display={() => !!s.url}>
          Download team-calendar.ics
        </a>
      </Stack>
      {scheduler}
      <TextArea label="The file" rows={10} readOnly spellcheck={false} wrap="off" x-model={() => s.text} />
    </div>
  );
}
```

`recurring-appointments.ts`

```tsx
import { reactive } from '@motifx/core';
import { formatRuleDate } from '@motifx-community/ui';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
  startDateTimeZone?: string;
  endDateTimeZone?: string;
}

/** Series around this week: a daily standup with one day left out and one moved, a review every other week, a report on the last Friday, an all-day Friday. */
export function recurringAppointments(): Booking[] {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const day = (offset: number, hour = 0, minute = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(-21, 9),
      endDate: day(-21, 9, 30),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      // This Tuesday is left out; this Wednesday's is moved (appointment 2).
      recurrenceException: [day(1, 9), day(2, 9)].map((d) => formatRuleDate({ time: d.getTime(), utc: true, dateOnly: false })).join(','),
    },
    { id: 2, text: 'Team standup', startDate: day(2, 11), endDate: day(2, 11, 30), recurrenceId: 1 },
    {
      id: 3,
      text: 'Design review',
      startDate: day(-11, 14),
      endDate: day(-11, 15, 30),
      color: '#7c4dff',
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH',
    },
    {
      id: 4,
      text: 'Monthly report',
      startDate: day(-60, 16),
      endDate: day(-60, 17),
      color: '#c62828',
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1FR',
    },
    {
      id: 5,
      text: 'Remote day',
      startDate: day(-3),
      endDate: day(-2),
      allDay: true,
      color: '#00838f',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;COUNT=12',
    },
    { id: 6, text: 'Lunch with Ana', startDate: day(3, 12, 30), endDate: day(3, 13, 30), color: '#2e7d32' },
  ]) as Booking[];
}
```

`PrintCalendar.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * `print()` prints the scheduler alone: the days shown, every hour and every row, nothing scrolled,
 * the colours kept and the bar left out. The browser's own print prints it the same way, with the
 * rest of the page.
 */
export default function PrintCalendar() {
  const s = reactive({ said: '' });
  const scheduler = (
    <Scheduler<Meeting>
      appointments={sampleAppointments()}
      views={['day', 'week', 'month', 'timelineWeek', 'agenda']}
      startDayHour={8}
      endDayHour={18}
      onPrinting={() => (s.said = 'Printing…')}
      onPrinted={() => (s.said = 'The print dialog closed.')}
    />
  ) as Scheduler<Meeting>;
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Print" tone="accent" onclick={() => void scheduler.print()} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      {scheduler}
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
