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
    'The appointments in memory. Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refresh()`. Its own edits (the form, a drag, the methods) show at once.',
  ],
  ['dataSource', '`Bind<DataSource | null>`', '`null`', 'The appointments from `@motifx-community/data`, in place of `appointments`.'],
  ['remoteFiltering', '`Bind<boolean>`', '`true`', 'Asks the data source for the days shown only (a filter on the start and end fields, added to its own).'],
  [
    'fields',
    '`Bind<Partial<SchedulerFields>>`',
    'see below',
    'The fields it reads: `key`, `start`, `end`, `text`, `allDay`, `description`, `color`, `disabled`, `visible`.',
  ],
  [
    'views',
    '`Bind<(type | SchedulerView)[]>`',
    'day, week, work week, month',
    'The views offered. A `SchedulerView` has its own `name`, `text`, `intervalCount`, hours, `cellDuration`, `allDayPanel`, `maxAppointmentsPerCell`.',
  ],
  ['currentView', '`Bind<string>`', 'the week', 'The view on screen, by name.'],
  ['currentDate', '`Bind<Date>`', 'today', 'The date the view shows.'],
  ['firstDayOfWeek', '`Bind<number | null>`', "the locale's", '0 (Sunday) through 6 (Saturday).'],
  ['workDays', '`Bind<number[]>`', 'Monday–Friday', 'The work week, and the days shaded apart.'],
  ['workStartHour / workEndHour', '`Bind<number>`', '9 / 17', 'The work hours; the rest is shaded.'],
  ['startDayHour / endDayHour', '`Bind<number>`', '0 / 24', 'The hours the day columns show.'],
  ['cellDuration', '`Bind<number>`', '30', 'Minutes in a cell.'],
  ['allDayPanel', '`Bind<boolean>`', '`true`', 'The panel of all-day and multi-day appointments over the hours.'],
  ['allDayLines', '`Bind<number>`', '3', 'Lines the all-day panel grows to before "+N more".'],
  ['maxAppointmentsPerCell', "`Bind<number \\| 'auto'>`", "`'auto'`", 'Appointments in a month day before "+N more"; `auto`: as many as fit.'],
  ['overlapMode', "`Bind<'columns' \\| 'cascade'>`", "`'columns'`", 'Appointments at the same time side by side, or each a little to the side.'],
  ['isHoliday', '`Bind<(date) => boolean>`', '—', 'Days marked as holidays.'],
  ['showCurrentTime', '`Bind<boolean>`', '`true`', 'The line at the current time.'],
  ['dimPast', '`Bind<boolean>`', '`false`', 'Appointments that have ended look quieter.'],
  ['scrollHour', '`Bind<number | null>`', 'work start', 'The hour the day columns scroll to; by default the work start, or now later on today.'],
  ['toolbar', '`Bind<boolean>`', '`true`', 'The bar with today, previous, next, the date and the views.'],
  ['locale', '`Bind<string>`', "From the page", 'Dates, times and the week.'],
  ['appointmentTemplate', '`Bind<(context) => Component>`', '—', 'Draws an appointment’s content: `{ appointment, start, end, text, time, allDay, view }`.'],
  ['texts', '`Bind<Partial<UiStrings>>`', '—', 'Its own texts over `uiLocale`.'],
  ['keys', '`Bind<Partial<SchedulerKeys>>`', 'see Keyboard', 'Its keys; an empty list turns one off.'],
  ['announce', '`Bind<boolean>`', '`true`', 'Says the new date or view to screen readers.'],
];

const EVENTS = [
  ['onViewChanging / onViewChanged', '`{ from, to, byUser, cancel }`: another view; cancel keeps this one.'],
  ['onDateChanging / onDateChanged', '`{ from, to, byUser, cancel }` / `{ …, range }`: today, previous, next, a date chosen.'],
  ['onCellClick / onCellDblClick', '`{ cell: { start, end, allDay }, event, cancel }`; Space and Enter on a cell too.'],
  ['onAppointmentClick / onAppointmentDblClick', '`{ appointment, start, end, event, cancel }`; Space and Enter on an appointment too.'],
  ['onSelectionChanged', '`{ selection }`: the selected cells as one time, or `null`.'],
  ['onContentReady', '`{ range, appointments }`: after a load, a new date or view, new data.'],
  ['onMoreOpening', '`{ date, appointments, cancel }`: "+N more" was pressed; cancel to show the day yourself.'],
];

const MEMBERS = [
  ['goToday(), next(), previous()', 'Move the view (asking `onDateChanging`).'],
  ['showDate(date), showView(name)', 'Show a date, another view.'],
  ['scrollToTime(hour, minute?)', 'Scrolls the day columns to a time of day.'],
  ['selectCells(cell | null)', 'Selects the cells of a time in the days shown.'],
  ['appointmentsIn(start, end), findAppointment(key)', 'The appointments in a time; one by its key.'],
  ['refresh()', 'Reads the appointments and the resources again. Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refresh()`.'],
  ['refreshAppointment(appointment)', 'Reads one appointment again (an occurrence: its series), after you changed it in place.'],
  ['refreshResources()', 'Reads the resources again: their items, after you changed them in place.'],
  ['visibleRange, resolvedView, selectedCells, shownAppointments, loading', 'Reactive state.'],
  ['textOf(key, values?)', 'A text of `uiLocale` or `texts`, filled in.'],
];

const KEYS = [
  [
    'Arrows',
    'Move over the cells (mirrored right to left); past the first or the last day the view moves on. Up from the first time goes to the all-day panel. In the month, Up and Down move by a week.',
  ],
  ['Shift + arrows', 'Select from the cell where it began.'],
  ['Home / End', 'The first / last day of the row; with Ctrl the first / last cell.'],
  ['Page Up / Page Down', 'A screen of times up / down; in the month, the month before / after.'],
  ['Enter, Space', 'On a cell: double click, click. On an appointment: the same.'],
  ['Escape', 'Clears the selection.'],
  ['Tab', 'The bar, the cells (one Tab stop), the all-day panel, then each appointment.'],
  ['T, N / J, P / K', 'Today, next, previous (option `keys`; not in a text field).'],
  ['D, W, X, M', 'Day, week, work week and month view.'],
];

export default function SchedulerPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'Appointments over days and hours: day, week, work week and month views, all-day and multi-day bars, appointments at the same time side by side, and "+N more" where a day is full. From an array or a data source, with every setting live.'} />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Scheduler } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="basics" title="Basics">
        <p>
          <Rich text="Give it the appointments; it reads `startDate`, `endDate`, `text` and `allDay` by default (`fields` names others). The bar moves by the view's step and the date opens a calendar." />
        </p>
        <Example files={code('Basics.tsx', 'sample-appointments.ts')}>
          <Basics />
        </Example>
      </Section>

      <Section anchor="views" title="Views and settings">
        <p>
          <Rich text="`views` lists the built-in types or views of their own: a name, a caption, an `intervalCount` and settings that win over the scheduler's. Every setting is a value or a function that is followed." />
        </p>
        <Example files={code('Views.tsx')}>
          <Views />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With a `DataSource` (REST, OData, a service…) it asks for the days on screen only, and asks again when the view moves. It shows that it is loading, and a retry when a load fails." />
        </p>
        <Example files={[...code('FromSource.tsx', 'sample-appointments.ts'), slowAdapterFile]}>
          <FromSource />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="`appointmentTemplate` draws the content of each appointment; the scheduler still places it, colours it with its `color` and names it for screen readers." />
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
              'The times are a `grid` (the all-day panel and the month too) with one Tab stop; each cell is named with its day and time and has `aria-selected`.',
            ],
            ['Appointments', 'Buttons in their own group after the cells, named by their time, text and day ("continues" when they go on over days).'],
            ['Changes', 'A new date or view is said in a polite live region (`announce`).'],
            ['Loading', '`aria-busy` while the data source loads; a failed load is an alert with Retry.'],
          ]}
        />
      </Section>

      <Section anchor="locale" title="Localization">
        <p>
          <Rich text="Dates and times come from `Intl` in its `locale` (12 or 24 hours, the first day of the week); its texts from `uiLocale` (English, Turkish), each one changed with `texts`." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-scheduler', '`data-view="day|week|workWeek|month"`.'],
            ['.mx-scheduler__bar, __title, __view-button', 'The bar.'],
            ['.mx-scheduler__date, __all-day, __cells, __cell', 'The day views: `data-today`, `data-work`, `data-hour-start`, `aria-selected`.'],
            ['.mx-scheduler__month-cell', '`data-today`, `data-outside`, `data-holiday`.'],
            [
              '.mx-scheduler__appointment',
              '`data-kind="timed|bar|chip"`, `data-before`, `data-after`, `data-short`, `data-past`, `data-disabled`; its colour is `--_color`.',
            ],
            ['.mx-scheduler__more, __more-list, __now', '"+N more", its list, the current time.'],
            ['scheduler.scheduler, bar, head, date, day-number, hour, time-row, cell, now, week-row, appointment, tooltip, more, more-item, state, …', 'Units: every piece in its states (a cell: `today`, `off`, `holiday`, `month`, `outside`, `weekend`, `past`, `hover`, `selected`, `focus` …).'],
            ['scheduler.height, slot-height, ruler-width, lane-size, appointment-tint, appointment-*-width, appointment-*-mix, chip-*, …', 'Sizes, and the shares that mix an appointment\'s own colour into its fill, its text and its four edges.'],
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
