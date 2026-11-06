import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Views from './examples/Views';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<Date | null>`', '`null`', 'The selected date. `x-model` provides two-way binding.'],
  ['min / max', '`Bind<Date | null>`', '—', 'Days outside these limits cannot be selected, and the arrow keys stop there.'],
  ['disabledDates', '`Bind<(date) => boolean>`', '—', 'Days that cannot be selected.'],
  ['locale', '`Bind<string>`', "From the page", 'Sets the month and day names and the first day of the week.'],
  ['firstDayOfWeek', '`Bind<number | null>`', 'From the locale', '0 (Sunday) through 6 (Saturday).'],
  ['showWeekNumbers', '`Bind<boolean>`', '`false`', 'Shows ISO week numbers before each week.'],
  ['showOtherMonths', '`Bind<boolean>`', '`true`', 'Shows days from the previous and next months.'],
  ['showTodayButton', '`Bind<boolean>`', '`false`', 'Shows a Today button below the grid.'],
  ['currentView', "`Bind<'month' | 'year' | 'decade'>`", "`'month'`", 'The current view. The title zooms out, and a selection zooms in.'],
  ['minView', '`Bind<CalendarView>`', "`'month'`", 'The view a selection is made in: `year` selects a month, and `decade` selects a year.'],
];

const KEYS = [
  ['Left / Right', 'Moves to the previous or next day, mirrored on right-to-left pages. In the other views, moves by month or year.'],
  ['Up / Down', 'Moves to the same day one week earlier or later. In the other views, moves by four months or years.'],
  ['Home / End', 'Moves to the first or last day of the week. In the other views, moves to the start or end of the row.'],
  ['Page Up / Page Down', 'Moves to the previous or next month, or by a year with Shift. In the other views, moves by a year or a decade.'],
  ['Enter, Space', 'Selects the day. In the other views, opens the month or year.'],
];

export default function CalendarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A month view for selecting a date, with year and decade views for quick navigation. It serves as the DateBox picker and can also be used on its own." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Calendar } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="limits" title="Limits">
        <Example files={code('Limits.tsx')}>
          <Limits />
        </Example>
      </Section>

      <Section anchor="views" title="Views">
        <p>
          <Rich text="Clicking the title zooms out to the months of the year and then to twelve years, and making a selection zooms back in. `minView` makes a month or a year the final selection." />
        </p>
        <Example files={code('Views.tsx')}>
          <Views />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Pattern', 'The APG date picker grid: `role="grid"`, one Tab stop on the focused day, and arrow keys inside.'],
            ['Cells', 'Each day has a full name ("Sunday, 25 October 2026"), with `aria-selected`, `aria-current="date"` for today and `aria-disabled`.'],
            ['Header', 'Weekday names carry their full form in `abbr`. The title is a live region, so a new month is announced.'],
            ['Buttons', 'The previous and next buttons get names from `uiLocale` for the current view.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-calendar', '`data-view="month|year|decade"`.'],
            ['.mx-calendar__header, __previous, __title, __next', 'The header.'],
            ['.mx-calendar__cell', '`aria-selected`, `aria-disabled`, `data-today`, `data-outside`.'],
            ['calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today', 'Units: every part in each state (for a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …).'],
            ['calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate', 'The size of a day, which the grid is built on, the cells of the zoomed-out views, and the arrow rotation.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties, methods, events" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['focusedDate', 'The day with the Tab stop, whose month is on screen.'],
            ['goTo(date)', 'Shows the month of a date.'],
            ['canChoose(date)', 'Indicates whether a day can be selected.'],
            ['focus()', 'Sets focus on the day with the Tab stop.'],
            ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`.'],
          ]}
        />
      </Section>
    </>
  );
}
