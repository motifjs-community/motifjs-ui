# Scheduler

> Scheduler · @motifx-community/ui 0.1.0-beta.1

Appointments over days and hours: day, week, work week and month views, all-day and multi-day bars, appointments at the same time side by side, and "+N more" where a day is full. From an array or a data source, with every setting live.

## Import

```tsx
import { Scheduler } from '@motifx-community/ui';
```

## Basics

Give it the appointments; it reads `startDate`, `endDate`, `text` and `allDay` by default (`fields` names others). The bar moves by the view's step and the date opens a calendar.

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

## Views and settings

`views` lists the built-in types or views of their own: a name, a caption, an `intervalCount` and settings that win over the scheduler's. Every setting is a value or a function that is followed.

```tsx
import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Views of its own (three days, two weeks) next to the built-in ones, and settings bound to switches. */
export default function Views() {
  const s = reactive({
    allDay: true,
    dim: true,
    cascade: false,
    quarter: false,
    holidays: true,
  });
  // Every Friday is a holiday here, to show the look.
  const friday = (date: Date) => date.getDay() === 5;
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="All-day panel" x-model={() => s.allDay} />
        <Switch label="Ended ones quieter" x-model={() => s.dim} />
        <Switch label="Cascade" x-model={() => s.cascade} />
        <Switch label="15-minute cells" x-model={() => s.quarter} />
        <Switch label="Fridays off" x-model={() => s.holidays} />
      </div>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        views={[
          'day',
          { type: 'day', name: 'threeDays', text: '3 days', intervalCount: 3 },
          'workWeek',
          { type: 'week', name: 'twoWeeks', text: '2 weeks', intervalCount: 2 },
          'month',
        ]}
        currentView="threeDays"
        startDayHour={8}
        endDayHour={20}
        allDayPanel={() => s.allDay}
        dimPast={() => s.dim}
        overlapMode={() => (s.cascade ? 'cascade' : 'columns')}
        cellDuration={() => (s.quarter ? 15 : 30)}
        isHoliday={() => (s.holidays ? friday : null)}
      />
    </div>
  );
}
```

## From a data source

With a `DataSource` (REST, OData, a service…) it asks for the days on screen only, and asks again when the view moves. It shows that it is loading, and a retry when a load fails.

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

## Templates

`appointmentTemplate` draws the content of each appointment; the scheduler still places it, colours it with its `color` and names it for screen readers.

```tsx
import { Scheduler, type AppointmentTemplateContext } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** The content of each appointment drawn by a template; the scheduler still places, colours and names it. */
export default function Templates() {
  const template = (c: AppointmentTemplateContext<Meeting>) =>
    c.allDay ? (
      <strong>{c.text}</strong>
    ) : (
      <div class="sched-card">
        <strong>{c.text}</strong>
        <span>{c.allDay ? 'All day' : c.time}</span>
        {c.appointment.color ? <span class="sched-tag">{c.appointment.color === '#c62828' ? 'urgent' : 'team'}</span> : <span class="sched-tag">personal</span>}
      </div>
    );
  return (
    <div class="sched-demo">
      <Scheduler<Meeting> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} appointmentTemplate={template} />
    </div>
  );
}
```

## From code

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A scheduler made with `new`, added from code and driven by its methods. */
export default function FromCode() {
  const state = reactive({ said: '' });
  let host: Stack | null = null;
  let scheduler: Scheduler<Meeting> | null = null;

  const make = () => {
    if (scheduler) return;
    scheduler = new Scheduler<Meeting>({
      appointments: sampleAppointments(),
      currentView: 'workWeek',
      locale: 'tr-TR',
      firstDayOfWeek: 1,
    });
    scheduler.onDateChanged(
      (e) => (state.said = `Shows ${e.range.start.toLocaleDateString('tr-TR')} – ${new Date(e.range.end.getTime() - 1).toLocaleDateString('tr-TR')}`),
    );
    scheduler.onSelectionChanged(
      (e) =>
        (state.said = e.selection
          ? `Selected ${e.selection.start.toLocaleString('tr-TR')} – ${e.selection.end.toLocaleTimeString('tr-TR')}`
          : 'Nothing selected'),
    );
    host?.controls.add(scheduler);
  };
  // The work week shows Monday to Friday: the next of those days.
  const nextWorkday = () => {
    const t = new Date();
    let start = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, 9);
    while (start.getDay() === 0 || start.getDay() === 6) start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 9);
    scheduler?.showDate(start);
    scheduler?.selectCells({
      start,
      end: new Date(start.getTime() + 90 * 60_000),
      allDay: false,
    });
    scheduler?.scrollToTime(8);
  };
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Button text="Create" variant="outline" onclick={make} />
        <Button text="Previous" variant="outline" onclick={() => scheduler?.previous()} />
        <Button text="Next" variant="outline" onclick={() => scheduler?.next()} />
        <Button text="Select the next workday 9:00–10:30" variant="outline" onclick={nextWorkday} />
        <Button text="Month" variant="outline" onclick={() => scheduler?.showView('month')} />
      </div>
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
      <Stack ref={(c: Stack) => (host = c)} />
    </div>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Arrows` | Move over the cells (mirrored right to left); past the first or the last day the view moves on. Up from the first time goes to the all-day panel. In the month, Up and Down move by a week. |
| `Shift + arrows` | Select from the cell where it began. |
| `Home / End` | The first / last day of the row; with Ctrl the first / last cell. |
| `Page Up / Page Down` | A screen of times up / down; in the month, the month before / after. |
| `Enter, Space` | On a cell: double click, click. On an appointment: the same. |
| `Escape` | Clears the selection. |
| `Tab` | The bar, the cells (one Tab stop), the all-day panel, then each appointment. |
| `T, N / J, P / K` | Today, next, previous (option `keys`; not in a text field). |
| `D, W, X, M` | Day, week, work week and month view. |

## Accessibility

| Topic | How |
| --- | --- |
| `Cells` | The times are a `grid` (the all-day panel and the month too) with one Tab stop; each cell is named with its day and time and has `aria-selected`. |
| `Appointments` | Buttons in their own group after the cells, named by their time, text and day ("continues" when they go on over days). |
| `Changes` | A new date or view is said in a polite live region (`announce`). |
| `Loading` | `aria-busy` while the data source loads; a failed load is an alert with Retry. |

## Localization

Dates and times come from `Intl` in its `locale` (12 or 24 hours, the first day of the week); its texts from `uiLocale` (English, Turkish), each one changed with `texts`.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-scheduler` | `data-view="day\|week\|workWeek\|month"`. |
| `.mx-scheduler__bar, __title, __view-button` | The bar. |
| `.mx-scheduler__date, __all-day, __cells, __cell` | The day views: `data-today`, `data-work`, `data-hour-start`, `aria-selected`. |
| `.mx-scheduler__month-cell` | `data-today`, `data-outside`, `data-holiday`. |
| `.mx-scheduler__appointment` | `data-kind="timed\|bar\|chip"`, `data-before`, `data-after`, `data-short`, `data-past`, `data-disabled`; its colour is `--_color`. |
| `.mx-scheduler__more, __more-list, __now` | "+N more", its list, the current time. |
| `scheduler.scheduler, bar, head, date, day-number, hour, time-row, cell, now, week-row, appointment, tooltip, more, more-item, state, …` | Units: every piece in its states (a cell: `today`, `off`, `holiday`, `month`, `outside`, `weekend`, `past`, `hover`, `selected`, `focus` …). |
| `scheduler.height, slot-height, ruler-width, lane-size, appointment-tint, appointment-*-width, appointment-*-mix, chip-*, …` | Sizes, and the shares that mix an appointment's own colour into its fill, its text and its four edges. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appointments` | `Bind<readonly T[]>` | `[]` | The appointments in memory. Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refresh()`. Its own edits (the form, a drag, the methods) show at once. |
| `dataSource` | `Bind<DataSource \| null>` | `null` | The appointments from `@motifx-community/data`, in place of `appointments`. |
| `remoteFiltering` | `Bind<boolean>` | `true` | Asks the data source for the days shown only (a filter on the start and end fields, added to its own). |
| `fields` | `Bind<Partial<SchedulerFields>>` | see below | The fields it reads: `key`, `start`, `end`, `text`, `allDay`, `description`, `color`, `disabled`, `visible`. |
| `views` | `Bind<(type \| SchedulerView)[]>` | day, week, work week, month | The views offered. A `SchedulerView` has its own `name`, `text`, `intervalCount`, hours, `cellDuration`, `allDayPanel`, `maxAppointmentsPerCell`. |
| `currentView` | `Bind<string>` | the week | The view on screen, by name. |
| `currentDate` | `Bind<Date>` | today | The date the view shows. |
| `firstDayOfWeek` | `Bind<number \| null>` | the locale's | 0 Sunday … 6 Saturday. |
| `workDays` | `Bind<number[]>` | Monday–Friday | The work week, and the days shaded apart. |
| `workStartHour / workEndHour` | `Bind<number>` | 9 / 17 | The work hours; the rest is shaded. |
| `startDayHour / endDayHour` | `Bind<number>` | 0 / 24 | The hours the day columns show. |
| `cellDuration` | `Bind<number>` | 30 | Minutes in a cell. |
| `allDayPanel` | `Bind<boolean>` | `true` | The panel of all-day and multi-day appointments over the hours. |
| `allDayLines` | `Bind<number>` | 3 | Lines the all-day panel grows to before "+N more". |
| `maxAppointmentsPerCell` | `Bind<number \\| 'auto'>` | `'auto'` | Appointments in a month day before "+N more"; `auto`: as many as fit. |
| `overlapMode` | `Bind<'columns' \\| 'cascade'>` | `'columns'` | Appointments at the same time side by side, or each a little to the side. |
| `isHoliday` | `Bind<(date) => boolean>` | — | Days marked as holidays. |
| `showCurrentTime` | `Bind<boolean>` | `true` | The line at the current time. |
| `dimPast` | `Bind<boolean>` | `false` | Appointments that have ended look quieter. |
| `scrollHour` | `Bind<number \| null>` | work start | The hour the day columns scroll to; by default the work start, or now later on today. |
| `toolbar` | `Bind<boolean>` | `true` | The bar with today, previous, next, the date and the views. |
| `locale` | `Bind<string>` | the page's | Dates, times and the week. |
| `appointmentTemplate` | `Bind<(context) => Component>` | — | Draws an appointment’s content: `{ appointment, start, end, text, time, allDay, view }`. |
| `texts` | `Bind<Partial<UiStrings>>` | — | Its own texts over `uiLocale`. |
| `keys` | `Bind<Partial<SchedulerKeys>>` | see Keyboard | Its keys; an empty list turns one off. |
| `announce` | `Bind<boolean>` | `true` | Says the new date or view to screen readers. |

### Methods and properties

| Member | Description |
| --- | --- |
| `goToday(), next(), previous()` | Move the view (asking `onDateChanging`). |
| `showDate(date), showView(name)` | Show a date, another view. |
| `scrollToTime(hour, minute?)` | Scrolls the day columns to a time of day. |
| `selectCells(cell \| null)` | Selects the cells of a time in the days shown. |
| `appointmentsIn(start, end), findAppointment(key)` | The appointments in a time; one by its key. |
| `refresh()` | Reads the appointments and the resources again. Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refresh()`. |
| `refreshAppointment(appointment)` | Reads one appointment again (an occurrence: its series), after you changed it in place. |
| `refreshResources()` | Reads the resources again: their items, after you changed them in place. |
| `visibleRange, resolvedView, selectedCells, shownAppointments, loading` | Reactive state. |
| `textOf(key, values?)` | A text of `uiLocale` or `texts`, filled in. |

### Events

| Event | Arguments |
| --- | --- |
| `onViewChanging / onViewChanged` | `{ from, to, byUser, cancel }`: another view; cancel keeps this one. |
| `onDateChanging / onDateChanged` | `{ from, to, byUser, cancel }` / `{ …, range }`: today, previous, next, a date chosen. |
| `onCellClick / onCellDblClick` | `{ cell: { start, end, allDay }, event, cancel }`; Space and Enter on a cell too. |
| `onAppointmentClick / onAppointmentDblClick` | `{ appointment, start, end, event, cancel }`; Space and Enter on an appointment too. |
| `onSelectionChanged` | `{ selection }`: the selected cells as one time, or `null`. |
| `onContentReady` | `{ range, appointments }`: after a load, a new date or view, new data. |
| `onMoreOpening` | `{ date, appointments, cancel }`: "+N more" was pressed; cancel to show the day yourself. |

## Example files

`Basics.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A week of appointments; double-click an appointment or a time and the log says what you chose. */
export default function Basics() {
  const state = reactive({
    appointments: sampleAppointments(),
    said: 'Double-click an appointment or a time.',
  });
  return (
    <div class="sched-demo">
      <Scheduler<Meeting>
        appointments={state.appointments}
        startDayHour={7}
        endDayHour={21}
        onAppointmentDblClick={(e) => (state.said = `Open: ${e.appointment.text}`)}
        onCellDblClick={(e) => (state.said = `New at ${e.cell.start.toLocaleString()}`)}
      />
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
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

`FromSource.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Appointments from a data source that answers late, like a server: only the days shown are asked for. */
export default function FromSource() {
  const asked = reactive({ text: '' });
  const adapter = new SlowAdapter<Meeting, number>({ data: sampleAppointments(), key: 'id' }, 600);
  const source = new data.DataSource<Meeting, number>({
    adapter,
    // 'all': a view needs every appointment of its days; the scheduler asks for those days only.
    loadMode: 'all',
  });
  source.onChanged((e) => {
    if (e.reason !== 'loading') return;
    const filter = JSON.stringify(source.filter);
    asked.text = `Asked: ${filter.length > 140 ? filter.slice(0, 140) + '…' : filter}`;
  });
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <Scheduler<Meeting> dataSource={source} currentView="month" />
      <p class="sched-log">{() => asked.text}</p>
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
