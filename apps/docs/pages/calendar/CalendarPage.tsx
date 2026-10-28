import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FromCode from './examples/FromCode';
import Limits from './examples/Limits';
import Views from './examples/Views';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<Date | null>`', '`null`', 'The chosen date. `x-model` binds it two-way.'],
  ['min / max', '`Bind<Date | null>`', '—', 'Days outside cannot be chosen; the arrows stop there.'],
  ['disabledDates', '`Bind<(date) => boolean>`', '—', 'Days that cannot be chosen.'],
  ['locale', '`Bind<string>`', "the page's", 'Month and day names, and where weeks start.'],
  ['firstDayOfWeek', '`Bind<number | null>`', 'the locale’s', '0 Sunday … 6 Saturday.'],
  ['showWeekNumbers', '`Bind<boolean>`', '`false`', 'ISO week numbers before each week.'],
  ['showOtherMonths', '`Bind<boolean>`', '`true`', 'Days of the months before and after.'],
  ['showTodayButton', '`Bind<boolean>`', '`false`', 'A Today button under the grid.'],
  ['currentView', "`Bind<'month' | 'year' | 'decade'>`", "`'month'`", 'The view on screen; the title zooms out, a choice zooms in.'],
  ['minView', '`Bind<CalendarView>`', "`'month'`", 'The view a choice is made in: `year` picks a month, `decade` a year.'],
];

const KEYS = [
  ['Left / Right', 'The day before / after (mirrored right to left); a month or a year in the other views.'],
  ['Up / Down', 'The same day a week before / after; four months or years in the other views.'],
  ['Home / End', 'The first / last day of the week; the start / end of the row in the other views.'],
  ['Page Up / Page Down', 'The month before / after; with Shift, the year. A year, a decade in the other views.'],
  ['Enter, Space', 'Choose the day; in the other views, open the month or the year.'],
];

export default function CalendarPage() {
  return (
    <>
      <p class="lead">
        A month of days to pick a date from, with a year and a decade view to get far quickly. It is the picker of
        DateBox, and it works on its own.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Calendar } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <Example files={code('FromCode.tsx')}>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="limits" title="Limits">
        <Example files={code('Limits.tsx')}>
          <Limits />
        </Example>
      </Section>

      <Section anchor="views" title="Views">
        <p>
          <Rich text="The title zooms out to the months of the year and to twelve years; a choice there zooms back in. `minView` makes a month or a year the choice itself." />
        </p>
        <Example files={code('Views.tsx')}>
          <Views />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'How']}
          rows={[
            ['Pattern', 'The APG date picker grid: `role="grid"`, one Tab stop on the focused day, the arrows inside.'],
            ['Cells', 'Each day is named in full ("Sunday, 25 October 2026"); `aria-selected`, `aria-current="date"` for today, `aria-disabled`.'],
            ['Header', 'Weekday names have their full form in `abbr`; the title is a live region, so a new month is read out.'],
            ['Buttons', 'Previous / next are named from `uiLocale` for the view on screen.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'What it is']}
          rows={[
            ['.mx-calendar', '`data-view="month|year|decade"`.'],
            ['.mx-calendar__header, __previous, __title, __next', 'The header.'],
            ['.mx-calendar__cell', '`aria-selected`, `aria-disabled`, `data-today`, `data-outside`.'],
            ['calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today', 'Units: every piece in its states (a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …).'],
            ['calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate', 'A day\'s size (the grid is built on it), the zoomed-out views\' cells, the arrows\' turns.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties, methods, events</h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['focusedDate', 'The day with the Tab stop; its month is on screen.'],
            ['goTo(date)', 'Shows the month of a date.'],
            ['canChoose(date)', 'Whether a day can be chosen.'],
            ['focus()', 'Focuses the day with the Tab stop.'],
            ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`.'],
          ]}
        />
      </Section>
    </>
  );
}
