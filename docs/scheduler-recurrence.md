# Scheduler: Recurrence and time zones

> Scheduler · @motifx-community/ui 0.1.0-beta.10

Recurring appointments based on RFC 5545 rules, with exceptions and individually edited occurrences, a prompt that asks what a change should apply to, a recurrence editor, and time zone support that handles daylight saving time.

## Recurring appointments

An appointment with a `recurrenceRule` is a series, and the scheduler shows its occurrences only in the visible days. `recurrenceException` excludes specific times, and an appointment whose `recurrenceId` references a series replaces one of its occurrences. Supported parts are `FREQ` (daily to yearly), `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (`2MO`, `-1FR`), `BYMONTHDAY`, `BYMONTH`, `BYYEARDAY`, `BYWEEKNO`, `BYSETPOS`, `WKST`, `BYHOUR` and `BYMINUTE`.

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

/** Series around this week: a daily standup with one excluded day and one moved, a review every other week, a report on the last Friday, and an all-day Friday. */
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
      // This Tuesday is excluded, and this Wednesday's occurrence is moved (appointment 2).
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

## Editing a series

Moving, resizing, the form and Delete all ask the same question. **This one**: a new appointment takes its place, referencing its series, and its time is excluded from the series. **This and following**: the series ends before it (with `UNTIL` or a smaller `COUNT`), and a new series continues from it. **The whole series**: every occurrence moves the same way, and moving a weekly series to another day moves its weekdays.

With a data source, each write goes through its adapter in sequence: new rows first, then updates, then deletes. If a later write fails, the earlier ones are rolled back through the adapter. `onDataError` reports what was saved (`saved`, `unsaved`) and whether everything was rolled back (`undone`). An individually edited occurrence is an ordinary row linked to its series through `recurrenceId`, and deleting the series requests those rows from the adapter, whether they are loaded or not. This example uses a data source.

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

## Recurrence editor

The appointment form includes it (`editing.allowRecurrence`). On its own, it is `RecurrenceEditor`, with the repeat list, the interval, the weekdays, a day of the month or a weekday by position, the month and the end. A rule it cannot fully display stays unchanged until a selection is changed.

```tsx
import { reactive } from '@motifx/core';
import { RecurrenceEditor } from '@motifx-community/ui';

/** The standalone editor: it reads and writes the rule text, and describes it in words below. */
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

`timeZone` displays days and hours in a given zone. A series recurs in the zone of its start (`startDateTimeZone`), so 09:00 in New York stays 09:00 there across daylight saving changes. On the night the clocks go forward, the skipped hour is passed, and a time inside it moves forward by the hour. On the night they go back, an appointment's box is as long as the appointment lasts.

With `editing.allowTimeZones`, the form has a time zone picker and a **Separate end time zone** check box. When checked, a second picker sets the end zone, and an appointment with a different end zone opens with it checked. When unchecked, the end follows the start zone again.

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

| Key | Description |
| --- | --- |
| `Arrows (in the question)` | Chooses this occurrence, this and following, or the whole series. |
| `Enter / Escape` | Confirms, or cancels so that the change is discarded and the appointment reverts. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Occurrences` | An occurrence is named with how its series repeats, and an individually edited one says so. The indicators are decorative (`aria-hidden`). |
| `The question` | A modal form with radio buttons under the question. The first option is selected. |
| `The editor` | A group named "Repeat". The weekdays are toggle buttons (`aria-pressed`) in a group named by its label, and the description is polite live text. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-scheduler__appointment` | `data-series`, `data-exception`. |
| `scheduler.series-mark, exception-mark` | Units: the indicators (`bar`, `chip`, `open`, `past`, `disabled`). A design language without them omits them. |
| `scheduler.tooltip-repeat` | Unit: the tooltip line that describes the recurrence (`exception`). |
| `.mx-recurrence-editor, __days, __day, __summary` | The editor, its weekday buttons and its description. |
| `recurrence-editor.editor, days-label, days, summary` | Units of the editor. `day-button` is the place for the weekday buttons, plus `row-gap` and `column-gap`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `timeZone` | `Bind<string \| null>` | `null` uses the browser time zone | The time zone for days and hours, as an IANA name (`Europe/Istanbul`). Conversion uses `Intl` only. |
| `seriesEdit` | `Bind<'ask' \\| 'occurrence' \\| 'following' \\| 'series'>` | `'ask'` | What changing or deleting an occurrence applies to. `ask` prompts the user. Programmatically, it applies to the occurrence unless the call specifies otherwise. |
| `recurrenceMarks` | `Bind<boolean>` | `true` | The indicators of an occurrence and of an individually edited one, where the design language draws them. |
| `editing.allowRecurrence` | `boolean` | `true` | Includes the recurrence editor in the form. |
| `editing.allowTimeZones` | `boolean` | `false` | Includes a time zone picker and a "Separate end time zone" check box in the form (`separateEndZone` in the form `data` and `items`), which shows a picker for the end. When unchecked, the end follows the start zone. It is not available for all-day appointments. |
| `fields.recurrenceRule` | `string` | `'recurrenceRule'` | The recurrence, as an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`). Leave it empty for a single appointment. |
| `fields.recurrenceException` | `string` | `'recurrenceException'` | The excluded times (`EXDATE`), as comma-separated text (`20261104T090000Z,…`) or a list of dates. |
| `fields.recurrenceId` | `string` | `'recurrenceId'` | On an individually edited occurrence, the key of its series. |
| `fields.startTimeZone / endTimeZone` | `string` | `'startDateTimeZone'` / `'endDateTimeZone'` | The time zones of the start (and the series) and the end. Leave them empty to use the scheduler zone for the start and the start zone for the end. |

### Methods

| Method | Description |
| --- | --- |
| `updateAppointment(appointment, changes, scope?)` | For an occurrence, `scope` sets what the change applies to: `occurrence`, `following` or `series`. |
| `deleteAppointment(appointment, scope?)` | The same for a delete. |
| `askSeries(appointment, action?)` | Asks the user what a change (`update`) or a delete (`delete`) applies to. Resolves to the answer, or `null`. |
| `seriesOf(appointment)` | The series of an occurrence or an individually edited one, the series itself, or otherwise `null`. |
| `isOccurrence(appointment), isException(appointment)` | Indicate an occurrence generated from a rule, and an occurrence edited individually from its series. |
| `occurrencesOf(series, start, end)` | The occurrences of a series in a time range. |
| `recurrenceText(appointment)` | Describes the recurrence in plain words in the current locale. |

### Events

| Event | Arguments |
| --- | --- |
| `onSeriesAsking` | `{ appointment, series, action, scopes, scope, cancel }`. Set `scope` to answer without prompting, narrow `scopes`, or cancel the change. |
| `onSeriesAnswered` | `{ appointment, series, action, scope, byUser }`. `scope` is `null` when the prompt was canceled. |
| `onAppointmentUpdating / Updated` | These also include `scope` and `series` (`null` for a non-recurring appointment). `Updated` includes `added`, which is the individually edited occurrence or the continuing series. |
| `onAppointmentDeleting / Deleted` | These also include `scope` and `series`. |
| `onDataError` | This also includes `saved` and `unsaved` (each `{ kind, appointment, changes? }`) and `undone`, which report what a series change wrote before failing and whether it was rolled back. |

### RecurrenceEditor

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The rule as RFC 5545 text, empty when it does not repeat. `x-model` provides two-way binding. |
| `start` | `Bind<Date \| null>` | Now | The start of the series. A rule takes its weekday and day of the month from it, unless the rule specifies them. |
| `allDay` | `Bind<boolean>` | `false` | Writes the last date as a date, instead of the end of that day in UTC. |
| `timeZone` | `Bind<string \| null>` | The browser time zone | The time zone the series recurs in. |
| `frequencies` | `Bind<("never" \\| frequency)[]>` | all five | The options in the repeat list. |
| `firstDayOfWeek, locale, texts, readOnly, summary` | — | — | The first weekday button, names and strings, read-only state, and the description line. |
| `rule, summaryText` | — | — | The rule parsed from `value`, and its description in words. Reactive. |
| `onValueChanged` | `{ value, previousValue, byUser }` | — | Occurs when a selection changes the rule. |

### Utilities

| Part | Description |
| --- | --- |
| `TimeZone.of(name) / TimeZone.local` | A time zone: `wall(moment)`, `moment(wall, later?)`, `offset`, `dayStart`, `addDays`, `sameDay`, `toLocal` and `fromLocal` (for editors), and `TimeZone.names()`. |
| `parseRecurrenceRule(text) / formatRecurrenceRule(rule)` | Converts a rule to an object (`RecurrenceRule`) and back. |
| `recurrenceDates(rule, start, from, to, options?)` | The times a rule occurs in a range, as wall clock times. |
| `describeRecurrence(rule, start, options)` | Describes a rule in plain words. |
| `readRuleDates, addRuleDate, filterRuleDates, parseRuleDate, formatRuleDate` | Exception dates as stored in the field. |
| `rangeFilter(range, fields)` | The data layer filter for a range: it starts before the range ends and either ends at or after the range starts or has a rule. The scheduler's `remoteFiltering` uses it. |

## Feedback

Loading issues…

## Example files

`Recurring.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { recurringAppointments, type Booking } from './recurring-appointments';

/** Series with a rule each, one day excluded from the standup and one edited individually. Click one, and its tooltip describes how it repeats. */
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

/** Series around this week: a daily standup with one excluded day and one moved, a review every other week, a report on the last Friday, and an all-day Friday. */
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
      // This Tuesday is excluded, and this Wednesday's occurrence is moved (appointment 2).
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
