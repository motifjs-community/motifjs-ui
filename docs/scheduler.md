# Scheduler

> Scheduler · @motifx-community/ui 0.1.0-beta.7

A full-featured calendar for appointments across days and hours. It provides day, week, work week and month views, all-day and multi-day bars, side-by-side display of overlapping appointments, and a "+N more" link when a day is full. Appointments can come from an array or a data source, and every setting can change at runtime.

## Import

```tsx
import { Scheduler } from '@motifx-community/ui';
```

## Getting started

Provide the appointments. By default, it reads `startDate`, `endDate`, `text` and `allDay`, and `fields` maps other names. The toolbar moves by the view's step, and the date opens a calendar.

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

`views` lists the built-in types or custom views, each with a name, a caption, an `intervalCount` and settings that override the scheduler's. Every setting accepts a value or a function that is tracked.

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
  // Every Friday is a holiday here, to show the appearance.
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

With a `DataSource` (REST, OData or a service), it requests only the visible days and requests again when the view moves. It shows a loading state, and offers a retry if a request fails.

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

`appointmentTemplate` customizes the content of each appointment. The scheduler still positions it, colors it with `color` and provides its accessible name.

```tsx
import { Scheduler, type AppointmentTemplateContext } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** The content of each appointment drawn by a template. The scheduler still positions it, colors it and provides its name. */
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

## Programmatic use

```tsx
import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A scheduler created with `new`, added programmatically and controlled through its methods. */
export default function Programmatic() {
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

| Key | Description |
| --- | --- |
| `Arrows` | Moves across the cells, mirrored on right-to-left pages. Moving past the first or last day advances the view. Up from the first time moves to the all-day panel, and in the month view Up and Down move by a week. |
| `Shift + arrows` | Extends the selection from the starting cell. |
| `Home / End` | Moves to the first or last day of the row. With Ctrl, moves to the first or last cell. |
| `Page Up / Page Down` | Moves up or down one screen of times. In the month view, moves to the previous or next month. |
| `Enter, Space` | On a cell, equivalent to a double-click and a click. The same applies to an appointment. |
| `Escape` | Clears the selection. |
| `Tab` | The toolbar, the cells (one Tab stop), the all-day panel, and then each appointment. |
| `T, N / J, P / K` | Today, next and previous (the `keys` option, not active in a text field). |
| `D, W, X, M` | Day, week, work week and month view. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Cells` | The time grid is a `grid`, as are the all-day panel and the month, with one Tab stop. Each cell is named by its day and time and has `aria-selected`. |
| `Appointments` | Buttons in their own group after the cells, named by their time, text and day ("continues" when they span days). |
| `Changes` | A new date or view is announced in a polite live region (`announce`). |
| `Loading` | `aria-busy` while the data source loads. A failed load is an alert with Retry. |

## Localization

Dates and times come from `Intl` using `locale` (12 or 24-hour clock, first day of the week). Strings come from `uiLocale` (English, Turkish), and `texts` can override each one.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-scheduler` | `data-view="day\|week\|workWeek\|month"`. |
| `.mx-scheduler__bar, __title, __view-button` | The toolbar. |
| `.mx-scheduler__date, __all-day, __cells, __cell` | The day views: `data-today`, `data-work`, `data-hour-start`, `aria-selected`. |
| `.mx-scheduler__month-cell` | `data-today`, `data-outside`, `data-holiday`. |
| `.mx-scheduler__appointment` | `data-kind="timed\|bar\|chip"`, `data-before`, `data-after`, `data-short`, `data-past`, `data-disabled`. Its color is `--_color`. |
| `.mx-scheduler__more, __more-list, __now` | "+N more", its list, and the current time indicator. |
| `scheduler.scheduler, bar, head, date, day-number, hour, time-row, cell, now, week-row, appointment, tooltip, more, more-item, state, …` | Units: every part in each state (for a cell: `today`, `off`, `holiday`, `month`, `outside`, `weekend`, `past`, `hover`, `selected`, `focus` …). |
| `scheduler.height, slot-height, ruler-width, lane-size, appointment-tint, appointment-*-width, appointment-*-mix, chip-*, …` | Sizes, and the ratios that blend an appointment's color into its fill, text and four edges. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appointments` | `Bind<readonly T[]>` | `[]` | The in-memory appointments. Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refresh()`. Changes made by the component (the form, a drag, the methods) appear immediately. |
| `dataSource` | `Bind<DataSource \| null>` | `null` | Appointments from `@motifx-community/data`, used instead of `appointments`. |
| `remoteFiltering` | `Bind<boolean>` | `true` | Requests only the visible days from the data source, by adding a filter on the start and end fields. |
| `fields` | `Bind<Partial<SchedulerFields>>` | See below | The fields it reads: `key`, `start`, `end`, `text`, `allDay`, `description`, `color`, `disabled` and `visible`. |
| `views` | `Bind<(type \| SchedulerView)[]>` | Day, week, work week, month | The available views. A `SchedulerView` has its own `name`, `text`, `intervalCount`, hours, `cellDuration`, `allDayPanel` and `maxAppointmentsPerCell`. |
| `currentView` | `Bind<string>` | The week view | The current view, by name. |
| `currentDate` | `Bind<Date>` | Today | The date the view shows. |
| `firstDayOfWeek` | `Bind<number \| null>` | From the locale | 0 (Sunday) through 6 (Saturday). |
| `workDays` | `Bind<number[]>` | Monday to Friday | The work week, and the days shaded separately. |
| `workStartHour / workEndHour` | `Bind<number>` | 9 / 17 | The work hours. The rest are shaded. |
| `startDayHour / endDayHour` | `Bind<number>` | 0 / 24 | The hours shown in the day columns. |
| `cellDuration` | `Bind<number>` | 30 | The duration of a cell, in minutes. |
| `allDayPanel` | `Bind<boolean>` | `true` | Shows the all-day and multi-day panel above the hours. |
| `allDayLines` | `Bind<number>` | 3 | The number of lines the all-day panel shows before "+N more". |
| `maxAppointmentsPerCell` | `Bind<number \\| 'auto'>` | `'auto'` | The number of appointments in a month day before "+N more". `auto` shows as many as fit. |
| `overlapMode` | `Bind<'columns' \\| 'cascade'>` | `'columns'` | Shows overlapping appointments side by side, or stacked with a slight offset. |
| `isHoliday` | `Bind<(date) => boolean>` | — | Days marked as holidays. |
| `showCurrentTime` | `Bind<boolean>` | `true` | Shows a line at the current time. |
| `dimPast` | `Bind<boolean>` | `false` | Dims appointments that have ended. |
| `scrollHour` | `Bind<number \| null>` | Work start | The hour the day columns scroll to. By default, this is the work start, or the current time later in the day. |
| `toolbar` | `Bind<boolean>` | `true` | Shows the toolbar with today, previous, next, the date and the views. |
| `locale` | `Bind<string>` | From the page | Dates, times and the week. |
| `appointmentTemplate` | `Bind<(context) => Component>` | — | Customizes an appointment's content: `{ appointment, start, end, text, time, allDay, view }`. |
| `texts` | `Bind<Partial<UiStrings>>` | — | Strings that override `uiLocale`. |
| `keys` | `Bind<Partial<SchedulerKeys>>` | see Keyboard | The key bindings. An empty list disables a binding. |
| `announce` | `Bind<boolean>` | `true` | Announces a new date or view to screen readers. |

### Methods and properties

| Member | Description |
| --- | --- |
| `goToday(), next(), previous()` | Moves the view, raising `onDateChanging`. |
| `showDate(date), showView(name)` | Shows a date or another view. |
| `scrollToTime(hour, minute?)` | Scrolls the day columns to a time of day. |
| `selectCells(cell \| null)` | Selects the cells for a time range in the visible days. |
| `appointmentsIn(start, end), findAppointment(key)` | Returns the appointments in a time range, or one by its key. |
| `refresh()` | Re-reads the appointments and resources. Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refresh()`. |
| `refreshAppointment(appointment)` | Re-reads one appointment after it has been changed in place. For an occurrence, this means its series. |
| `refreshResources()` | Re-reads the resources after their items have been changed in place. |
| `visibleRange, resolvedView, selectedCells, shownAppointments, loading` | Reactive state. |
| `textOf(key, values?)` | A string from `uiLocale` or `texts`, with its values filled in. |

### Events

| Event | Arguments |
| --- | --- |
| `onViewChanging / onViewChanged` | `{ from, to, byUser, cancel }`: a view change. Cancel to keep the current view. |
| `onDateChanging / onDateChanged` | `{ from, to, byUser, cancel }` and `{ …, range }`: today, previous, next or a selected date. |
| `onCellClick / onCellDblClick` | `{ cell: { start, end, allDay }, event, cancel }`. Also raised by Space and Enter on a cell. |
| `onAppointmentClick / onAppointmentDblClick` | `{ appointment, start, end, event, cancel }`. Also raised by Space and Enter on an appointment. |
| `onSelectionChanged` | `{ selection }`: the selected cells as one time range, or `null`. |
| `onContentReady` | `{ range, appointments }`: after a load, a new date or view, or new data. |
| `onMoreOpening` | `{ date, appointments, cancel }`: "+N more" was clicked. Cancel to display the day yourself. |

## Feedback

Loading issues…

## Example files

`Basics.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A week of appointments. Double-click an appointment or a time, and the log shows your selection. */
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

/** Appointments from a data source that responds with a delay, like a server. Only the displayed days are requested. */
export default function FromSource() {
  const asked = reactive({ text: '' });
  const adapter = new SlowAdapter<Meeting, number>({ data: sampleAppointments(), key: 'id' }, 600);
  const source = new data.DataSource<Meeting, number>({
    adapter,
    // 'all': a view needs every appointment of its days, and the scheduler requests only those days.
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
