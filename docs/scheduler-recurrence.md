# Scheduler: Recurrence and time zones

> Scheduler · @motifx-community/ui 0.1.0-beta.1

Appointments that repeat by an RFC 5545 rule, with times left out and occurrences changed apart; a question on what a change reaches; an editor of the rule; and the days on the clock of any time zone, summer time included.

## Recurring appointments

An appointment with a `recurrenceRule` is a series: the scheduler shows its occurrences in the days on screen only. `recurrenceException` leaves times out; an appointment whose `recurrenceId` names a series stands in for one of its occurrences. Supported: `FREQ` daily to yearly, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (`2MO`, `-1FR`), `BYMONTHDAY`, `BYMONTH`, `BYYEARDAY`, `BYWEEKNO`, `BYSETPOS`, `WKST`, `BYHOUR`, `BYMINUTE`.

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

## Changing a series

Moving, resizing, the form and Delete ask the same question. **This one**: a new appointment takes its place (naming its series) and its time is left out of the series. **This and following**: the series ends before it (`UNTIL`, or a smaller `COUNT`) and a new series goes on from it. **The whole series**: every occurrence moves as this one did; a weekly series moved to another day moves its weekdays.

With a data source every write goes through its adapter, one after another: the new rows first, then the changes, then the deletes. When a later write fails, the earlier ones are taken back through the adapter; `onDataError` tells what was saved (`saved`, `unsaved`) and whether it was all taken back (`undone`). An occurrence changed apart is an ordinary row, linked to its series by `recurrenceId`; deleting the series asks the adapter for those rows, loaded or not. This example runs from a data source.

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

## The recurrence editor

The appointment form holds it (`editing.allowRecurrence`). On its own it is `RecurrenceEditor`: the repeat list, every how many, the weekdays, a day of the month or a weekday by its place, the month, the end; a rule it cannot show whole stays as it is until a choice is changed.

```tsx
import { reactive } from '@motifx/core';
import { RecurrenceEditor } from '@motifx-community/ui';

/** The editor on its own: it reads and writes the rule text, and says it in words under it. */
export default function RuleEditor() {
  const s = reactive({ rule: 'FREQ=MONTHLY;BYDAY=2TU;COUNT=6' });
  return (
    <div class="sched-demo sched-rule">
      <RecurrenceEditor x-model={() => s.rule} start={new Date()} />
      <p class="sched-log">
        <code>{() => s.rule || '(none)'}</code>
      </p>
    </div>
  );
}
```

```tsx
// In a form of your own:
FormLayout.editors.set('recurrence', (p) => new RecurrenceEditor(p));
// { field: 'rule', label: 'Repeat', editor: 'recurrence' }
```

## Time zones

`timeZone` puts the days and hours on a zone's clock. A series repeats on the clock of its start's zone (`startDateTimeZone`), so 09:00 in New York stays 09:00 there over summer time. On the night the clocks go forward the skipped hour is passed (a time in it moves on by the hour); on the night they go back a box is as long as the appointment lasts.

With `editing.allowTimeZones` the form has one time zone picker and a box, **Separate end time zone**: checked, a second picker sets the end's zone (an appointment whose end zone differs opens with it checked); unchecked, the end follows the start's zone again.

```tsx
import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import type { Booking } from './recurring-appointments';

/**
 * The same appointments on two clocks. The call repeats at 09:00 in New York, so in Istanbul it moves an hour when America
 * changes its clocks. The flight leaves on Istanbul's clock and lands on New York's: open it, its form has a separate end time zone.
 */
export default function TimeZones() {
  const today = new Date();
  const at = (hour: number) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hour));
  const appointments = reactive([
    // 09:00 in New York, every weekday, in New York's time zone.
    { id: 1, text: 'Call with New York', startDate: at(13), endDate: at(14), startDateTimeZone: 'America/New_York', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { id: 2, text: 'Istanbul lunch', startDate: at(9), endDate: at(10), startDateTimeZone: 'Europe/Istanbul' },
    // 08:00 in Istanbul to 16:00 in New York.
    { id: 3, text: 'Flight to New York', startDate: at(5), endDate: at(20), startDateTimeZone: 'Europe/Istanbul', endDateTimeZone: 'America/New_York' },
  ]) as Booking[];
  const views = [{ type: 'day' as const, intervalCount: 3 }];
  return (
    <div class="sched-zones">
      <div class="sched-card">
        <span class="sched-tag">Europe/Istanbul</span>
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="Europe/Istanbul" startDayHour={6} endDayHour={22} editing={{ allowTimeZones: true }} />
      </div>
      <div class="sched-card">
        <span class="sched-tag">America/New_York</span>
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="America/New_York" startDayHour={0} endDayHour={16} editing={{ allowTimeZones: true }} />
      </div>
    </div>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Arrows (in the question)` | Choose this one, this and the following, the whole series. |
| `Enter / Escape` | Answer / cancel: the change is dropped and the appointment goes back. |

## Accessibility

| Topic | How |
| --- | --- |
| `Occurrences` | An occurrence is named with how its series repeats; one changed apart says so. The marks are only drawn (`aria-hidden`). |
| `The question` | A modal form: its choices are radio buttons under the question, the first one chosen. |
| `The editor` | A group named "Repeat"; the weekdays are toggle buttons (`aria-pressed`) in a group named by its caption; the line in words is polite live text. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-scheduler__appointment` | `data-series`, `data-exception`. |
| `scheduler.series-mark, exception-mark` | Units: the marks (`bar`, `chip`, `open`, `past`, `disabled`); a language that has none leaves them out. |
| `scheduler.tooltip-repeat` | Unit: the tooltip’s line on how it repeats (`exception`). |
| `.mx-recurrence-editor, __days, __day, __summary` | The editor, its weekday buttons and its line in words. |
| `recurrence-editor.editor, days-label, days, summary` | Units of the editor; `day-button` is the weekday buttons’ place; `row-gap`, `column-gap`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `timeZone` | `Bind<string \| null>` | `null`: the browser's | The clock the days and hours are on, an IANA name (`Europe/Istanbul`). Converted with `Intl` only. |
| `seriesEdit` | `Bind<'ask' \\| 'occurrence' \\| 'following' \\| 'series'>` | `'ask'` | What changing or deleting an occurrence reaches. `ask` asks the user; from code it is the occurrence unless the call says. |
| `recurrenceMarks` | `Bind<boolean>` | `true` | The marks of an occurrence and of one changed apart, where the design language draws them. |
| `editing.allowRecurrence` | `boolean` | `true` | The form holds the recurrence editor. |
| `editing.allowTimeZones` | `boolean` | `false` | The form holds a time zone picker, and a box "Separate end time zone" (`separateEndZone` in the form’s data and `items`) that shows a picker for the end; unchecked, the end follows the start’s zone. Not on all-day appointments. |
| `fields.recurrenceRule` | `string` | `'recurrenceRule'` | How it repeats: an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`); empty for once. |
| `fields.recurrenceException` | `string` | `'recurrenceException'` | The times left out (`EXDATE`): a text apart by commas (`20261104T090000Z,…`) or a list of dates. |
| `fields.recurrenceId` | `string` | `'recurrenceId'` | On an occurrence changed apart: the key of its series. |
| `fields.startTimeZone / endTimeZone` | `string` | `'startDateTimeZone'` / `'endDateTimeZone'` | The zone the start (and the series) and the end are set in; empty for the scheduler’s (the start) and for the start’s (the end). |

### Methods

| Method | Description |
| --- | --- |
| `updateAppointment(appointment, changes, scope?)` | For an occurrence, `scope` says what the change reaches: `occurrence`, `following` or `series`. |
| `deleteAppointment(appointment, scope?)` | The same for a delete. |
| `askSeries(appointment, action?)` | Asks the user what a change (`update`) or a delete (`delete`) reaches; resolves to the answer or `null`. |
| `seriesOf(appointment)` | The series of an occurrence or of one changed apart; a series itself; else `null`. |
| `isOccurrence(appointment), isException(appointment)` | An occurrence the scheduler made from a rule; one changed apart from its series. |
| `occurrencesOf(series, start, end)` | The occurrences of a series in a time. |
| `recurrenceText(appointment)` | How it repeats, in plain words of the locale. |

### Events

| Event | Arguments |
| --- | --- |
| `onSeriesAsking` | `{ appointment, series, action, scopes, scope, cancel }`: set `scope` to answer without the question, narrow `scopes`, or cancel the change. |
| `onSeriesAnswered` | `{ appointment, series, action, scope, byUser }`: `scope` is `null` when the question was cancelled. |
| `onAppointmentUpdating / Updated` | Now also `scope` and `series` (`null` for an appointment that happens once); `Updated` gives `added`: the occurrence changed apart, or the series that goes on. |
| `onAppointmentDeleting / Deleted` | Now also `scope` and `series`. |
| `onDataError` | Now also `saved` and `unsaved` (each `{ kind, appointment, changes? }`) and `undone`: what a change of a series wrote before it failed, and whether it was all taken back. |

### RecurrenceEditor

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The rule as RFC 5545 text; empty when it does not repeat. Two-way with `x-model`. |
| `start` | `Bind<Date \| null>` | now | When it starts: a rule’s weekday and day of the month come from it unless the rule names them. |
| `allDay` | `Bind<boolean>` | `false` | Its last date is written as a date (else as the end of that day, in UTC). |
| `timeZone` | `Bind<string \| null>` | the browser's | The zone the series repeats in. |
| `frequencies` | `Bind<("never" \\| frequency)[]>` | all five | The choices of the repeat list. |
| `firstDayOfWeek, locale, texts, readOnly, summary` | — | — | The first weekday button; names and words; read only; the line in words. |
| `rule, summaryText` | — | — | The rule read from `value`, and how it repeats in words. Reactive. |
| `onValueChanged` | `{ value, previousValue, byUser }` | — | A choice changed the rule. |

### Parts

| Part | What it does |
| --- | --- |
| `TimeZone.of(name) / TimeZone.local` | A zone: `wall(moment)`, `moment(wall, later?)`, `offset`, `dayStart`, `addDays`, `sameDay`, `toLocal` / `fromLocal` (for editors), `TimeZone.names()`. |
| `parseRecurrenceRule(text) / formatRecurrenceRule(rule)` | A rule as an object (`RecurrenceRule`) and back. |
| `recurrenceDates(rule, start, from, to, options?)` | The times a rule happens in a range, as wall clock times. |
| `describeRecurrence(rule, start, options)` | A rule in plain words. |
| `readRuleDates, addRuleDate, filterRuleDates, parseRuleDate, formatRuleDate` | Exception dates as a field holds them. |
| `rangeFilter(range, fields)` | The data layer’s filter for a range: starts before it ends and (ends at or after it starts, or has a rule). The scheduler’s `remoteFiltering` uses it. |

## Example files

`Recurring.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { recurringAppointments, type Booking } from './recurring-appointments';

/** Series with a rule each; one day left out of the standup, one moved apart. Click one: its tooltip says how it repeats. */
export default function Recurring() {
  const s = reactive({ marks: true });
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="Marks" x-model={() => s.marks} />
      </div>
      <Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} recurrenceMarks={() => s.marks} editing={false} />
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

`SeriesQuestion.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { RadioGroup, Scheduler, type SeriesEditMode } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { recurringAppointments, type Booking } from './recurring-appointments';

/**
 * The series come from a data source, as from a server. Drag an occurrence, change it in its form or
 * delete it: the scheduler asks what the change reaches, unless the setting answers, and writes
 * it through the adapter (an occurrence changed apart is a row of its own).
 */
export default function SeriesQuestion() {
  const s = reactive({ mode: 'ask' as SeriesEditMode, log: [] as string[] });
  let next = 100;
  const adapter = new SlowAdapter<Booking, number>({ data: recurringAppointments(), key: 'id', createKey: () => next++ }, 200);
  const source = new data.DataSource<Booking, number>({ adapter, loadMode: 'all' });
  const say = (text: string) => {
    s.log.unshift(text);
    if (s.log.length > 6) s.log.pop();
  };
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <RadioGroup
        label="A change to an occurrence reaches"
        orientation="horizontal"
        items={[
          { value: 'ask', text: 'Ask' },
          { value: 'occurrence', text: 'This one' },
          { value: 'following', text: 'This and following' },
          { value: 'series', text: 'The whole series' },
        ]}
        x-model={() => s.mode}
      />
      <Scheduler<Booking>
        dataSource={source}
        startDayHour={8}
        endDayHour={18}
        seriesEdit={() => s.mode}
        onSeriesAnswered={(e) => say(`Asked about ${e.appointment.text} (${e.action}): ${e.scope ?? 'cancelled'}`)}
        onAppointmentUpdated={(e) => say(`Saved ${e.appointment.text}${e.scope ? `, ${e.scope}` : ''}`)}
        onAppointmentDeleted={(e) => say(`Deleted ${e.appointment.text}${e.scope ? `, ${e.scope}` : ''}`)}
        onDataError={(e) => say(`Not saved: ${String(e.error)}${e.undone ? '' : ' (part of it was)'}`)}
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
