import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import Basics from './examples/Basics';
import Programmatic from './examples/Programmatic';
import FromSource from './examples/FromSource';
import Templates from './examples/Templates';
import Views from './examples/Views';

const code = sources(
  import.meta.glob('./examples/*', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);

const PROPS = [
  [
    'appointments',
    '`Bind<readonly T[]>`',
    '`[]`',
    'The in-memory appointments. Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refresh()`. Changes made by the component (the form, a drag, the methods) appear immediately.',
  ],
  ['dataSource', '`Bind<DataSource | null>`', '`null`', 'Appointments from `@motifx-community/data`, used instead of `appointments`.'],
  ['remoteFiltering', '`Bind<boolean>`', '`true`', 'Requests only the visible days from the data source, by adding a filter on the start and end fields.'],
  [
    'fields',
    '`Bind<Partial<SchedulerFields>>`',
    'See below',
    'The fields it reads: `key`, `start`, `end`, `text`, `allDay`, `description`, `color`, `disabled` and `visible`.',
  ],
  [
    'views',
    '`Bind<(type | SchedulerView)[]>`',
    'Day, week, work week, month',
    'The available views. A `SchedulerView` has its own `name`, `text`, `intervalCount`, hours, `cellDuration`, `allDayPanel` and `maxAppointmentsPerCell`.',
  ],
  ['currentView', '`Bind<string>`', 'The week view', 'The current view, by name.'],
  ['currentDate', '`Bind<Date>`', 'Today', 'The date the view shows.'],
  ['firstDayOfWeek', '`Bind<number | null>`', "From the locale", '0 (Sunday) through 6 (Saturday).'],
  ['workDays', '`Bind<number[]>`', 'Monday to Friday', 'The work week, and the days shaded separately.'],
  ['workStartHour / workEndHour', '`Bind<number>`', '9 / 17', 'The work hours. The rest are shaded.'],
  ['startDayHour / endDayHour', '`Bind<number>`', '0 / 24', 'The hours shown in the day columns.'],
  ['cellDuration', '`Bind<number>`', '30', 'The duration of a cell, in minutes.'],
  ['allDayPanel', '`Bind<boolean>`', '`true`', 'Shows the all-day and multi-day panel above the hours.'],
  ['allDayLines', '`Bind<number>`', '3', 'The number of lines the all-day panel shows before "+N more".'],
  ['maxAppointmentsPerCell', "`Bind<number \\| 'auto'>`", "`'auto'`", 'The number of appointments in a month day before "+N more". `auto` shows as many as fit.'],
  ['overlapMode', "`Bind<'columns' \\| 'cascade'>`", "`'columns'`", 'Shows overlapping appointments side by side, or stacked with a slight offset.'],
  ['isHoliday', '`Bind<(date) => boolean>`', '—', 'Days marked as holidays.'],
  ['showCurrentTime', '`Bind<boolean>`', '`true`', 'Shows a line at the current time.'],
  ['dimPast', '`Bind<boolean>`', '`false`', 'Dims appointments that have ended.'],
  ['scrollHour', '`Bind<number | null>`', 'Work start', 'The hour the day columns scroll to. By default, this is the work start, or the current time later in the day.'],
  ['toolbar', '`Bind<boolean>`', '`true`', 'Shows the toolbar with today, previous, next, the date and the views.'],
  ['locale', '`Bind<string>`', "From the page", 'Dates, times and the week.'],
  ['appointmentTemplate', '`Bind<(context) => Component>`', '—', 'Customizes an appointment\'s content: `{ appointment, start, end, text, time, allDay, view }`.'],
  ['texts', '`Bind<Partial<UiStrings>>`', '—', 'Strings that override `uiLocale`.'],
  ['keys', '`Bind<Partial<SchedulerKeys>>`', 'see Keyboard', 'The key bindings. An empty list disables a binding.'],
  ['announce', '`Bind<boolean>`', '`true`', 'Announces a new date or view to screen readers.'],
];

const EVENTS = [
  ['onViewChanging / onViewChanged', '`{ from, to, byUser, cancel }`: a view change. Cancel to keep the current view.'],
  ['onDateChanging / onDateChanged', '`{ from, to, byUser, cancel }` and `{ …, range }`: today, previous, next or a selected date.'],
  ['onCellClick / onCellDblClick', '`{ cell: { start, end, allDay }, event, cancel }`. Also raised by Space and Enter on a cell.'],
  ['onAppointmentClick / onAppointmentDblClick', '`{ appointment, start, end, event, cancel }`. Also raised by Space and Enter on an appointment.'],
  ['onSelectionChanged', '`{ selection }`: the selected cells as one time range, or `null`.'],
  ['onContentReady', '`{ range, appointments }`: after a load, a new date or view, or new data.'],
  ['onMoreOpening', '`{ date, appointments, cancel }`: "+N more" was clicked. Cancel to display the day yourself.'],
];

const MEMBERS = [
  ['goToday(), next(), previous()', 'Moves the view, raising `onDateChanging`.'],
  ['showDate(date), showView(name)', 'Shows a date or another view.'],
  ['scrollToTime(hour, minute?)', 'Scrolls the day columns to a time of day.'],
  ['selectCells(cell | null)', 'Selects the cells for a time range in the visible days.'],
  ['appointmentsIn(start, end), findAppointment(key)', 'Returns the appointments in a time range, or one by its key.'],
  ['refresh()', 'Re-reads the appointments and resources. Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refresh()`.'],
  ['refreshAppointment(appointment)', 'Re-reads one appointment after it has been changed in place. For an occurrence, this means its series.'],
  ['refreshResources()', 'Re-reads the resources after their items have been changed in place.'],
  ['visibleRange, resolvedView, selectedCells, shownAppointments, loading', 'Reactive state.'],
  ['textOf(key, values?)', 'A string from `uiLocale` or `texts`, with its values filled in.'],
];

const KEYS = [
  [
    'Arrows',
    'Moves across the cells, mirrored on right-to-left pages. Moving past the first or last day advances the view. Up from the first time moves to the all-day panel, and in the month view Up and Down move by a week.',
  ],
  ['Shift + arrows', 'Extends the selection from the starting cell.'],
  ['Home / End', 'Moves to the first or last day of the row. With Ctrl, moves to the first or last cell.'],
  ['Page Up / Page Down', 'Moves up or down one screen of times. In the month view, moves to the previous or next month.'],
  ['Enter, Space', 'On a cell, equivalent to a double-click and a click. The same applies to an appointment.'],
  ['Escape', 'Clears the selection.'],
  ['Tab', 'The toolbar, the cells (one Tab stop), the all-day panel, and then each appointment.'],
  ['T, N / J, P / K', 'Today, next and previous (the `keys` option, not active in a text field).'],
  ['D, W, X, M', 'Day, week, work week and month view.'],
];

export default function SchedulerPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'A full-featured calendar for appointments across days and hours. It provides day, week, work week and month views, all-day and multi-day bars, side-by-side display of overlapping appointments, and a "+N more" link when a day is full. Appointments can come from an array or a data source, and every setting can change at runtime.'} />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Scheduler } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="basics" title="Getting started">
        <p>
          <Rich text="Provide the appointments. By default, it reads `startDate`, `endDate`, `text` and `allDay`, and `fields` maps other names. The toolbar moves by the view's step, and the date opens a calendar." />
        </p>
        <Example files={code('Basics.tsx', 'sample-appointments.ts')}>
          <Basics />
        </Example>
      </Section>

      <Section anchor="views" title="Views and settings">
        <p>
          <Rich text="`views` lists the built-in types or custom views, each with a name, a caption, an `intervalCount` and settings that override the scheduler's. Every setting accepts a value or a function that is tracked." />
        </p>
        <Example files={code('Views.tsx')}>
          <Views />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With a `DataSource` (REST, OData or a service), it requests only the visible days and requests again when the view moves. It shows a loading state, and offers a retry if a request fails." />
        </p>
        <Example files={[...code('FromSource.tsx', 'sample-appointments.ts'), slowAdapterFile]}>
          <FromSource />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="`appointmentTemplate` customizes the content of each appointment. The scheduler still positions it, colors it with `color` and provides its accessible name." />
        </p>
        <Example files={code('Templates.tsx')}>
          <Templates />
        </Example>
      </Section>

      <Section anchor="code" title="Programmatic use">
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            [
              'Cells',
              'The time grid is a `grid`, as are the all-day panel and the month, with one Tab stop. Each cell is named by its day and time and has `aria-selected`.',
            ],
            ['Appointments', 'Buttons in their own group after the cells, named by their time, text and day ("continues" when they span days).'],
            ['Changes', 'A new date or view is announced in a polite live region (`announce`).'],
            ['Loading', '`aria-busy` while the data source loads. A failed load is an alert with Retry.'],
          ]}
        />
      </Section>

      <Section anchor="locale" title="Localization">
        <p>
          <Rich text="Dates and times come from `Intl` using `locale` (12 or 24-hour clock, first day of the week). Strings come from `uiLocale` (English, Turkish), and `texts` can override each one." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-scheduler', '`data-view="day|week|workWeek|month"`.'],
            ['.mx-scheduler__bar, __title, __view-button', 'The toolbar.'],
            ['.mx-scheduler__date, __all-day, __cells, __cell', 'The day views: `data-today`, `data-work`, `data-hour-start`, `aria-selected`.'],
            ['.mx-scheduler__month-cell', '`data-today`, `data-outside`, `data-holiday`.'],
            [
              '.mx-scheduler__appointment',
              '`data-kind="timed|bar|chip"`, `data-before`, `data-after`, `data-short`, `data-past`, `data-disabled`. Its color is `--_color`.',
            ],
            ['.mx-scheduler__more, __more-list, __now', '"+N more", its list, and the current time indicator.'],
            ['scheduler.scheduler, bar, head, date, day-number, hour, time-row, cell, now, week-row, appointment, tooltip, more, more-item, state, …', 'Units: every part in each state (for a cell: `today`, `off`, `holiday`, `month`, `outside`, `weekend`, `past`, `hover`, `selected`, `focus` …).'],
            ['scheduler.height, slot-height, ruler-width, lane-size, appointment-tint, appointment-*-width, appointment-*-mix, chip-*, …', 'Sizes, and the ratios that blend an appointment\'s color into its fill, text and four edges.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Methods and properties" />
        </h3>
        <ApiTable head={['Member', 'Description']} rows={MEMBERS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Arguments']} rows={EVENTS} />
      </Section>
    </>
  );
}
