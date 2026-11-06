import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import Recurring from './examples/Recurring';
import RuleEditor from './examples/RuleEditor';
import SeriesQuestion from './examples/SeriesQuestion';
import TimeZones from './examples/TimeZones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['timeZone', '`Bind<string | null>`', "`null` uses the browser time zone", 'The time zone for days and hours, as an IANA name (`Europe/Istanbul`). Conversion uses `Intl` only.'],
  [
    'seriesEdit',
    "`Bind<'ask' \\| 'occurrence' \\| 'following' \\| 'series'>`",
    "`'ask'`",
    'What changing or deleting an occurrence applies to. `ask` prompts the user. Programmatically, it applies to the occurrence unless the call specifies otherwise.',
  ],
  ['recurrenceMarks', '`Bind<boolean>`', '`true`', 'The indicators of an occurrence and of an individually edited one, where the design language draws them.'],
  ['editing.allowRecurrence', '`boolean`', '`true`', 'Includes the recurrence editor in the form.'],
  ['editing.allowTimeZones', '`boolean`', '`false`', 'Includes a time zone picker and a "Separate end time zone" check box in the form (`separateEndZone` in the form `data` and `items`), which shows a picker for the end. When unchecked, the end follows the start zone. It is not available for all-day appointments.'],
  ['fields.recurrenceRule', '`string`', "`'recurrenceRule'`", 'The recurrence, as an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`). Leave it empty for a single appointment.'],
  ['fields.recurrenceException', '`string`', "`'recurrenceException'`", 'The excluded times (`EXDATE`), as comma-separated text (`20261104T090000Z,…`) or a list of dates.'],
  ['fields.recurrenceId', '`string`', "`'recurrenceId'`", 'On an individually edited occurrence, the key of its series.'],
  ['fields.startTimeZone / endTimeZone', '`string`', "`'startDateTimeZone'` / `'endDateTimeZone'`", 'The time zones of the start (and the series) and the end. Leave them empty to use the scheduler zone for the start and the start zone for the end.'],
];

const METHODS = [
  ['updateAppointment(appointment, changes, scope?)', 'For an occurrence, `scope` sets what the change applies to: `occurrence`, `following` or `series`.'],
  ['deleteAppointment(appointment, scope?)', 'The same for a delete.'],
  ['askSeries(appointment, action?)', 'Asks the user what a change (`update`) or a delete (`delete`) applies to. Resolves to the answer, or `null`.'],
  ['seriesOf(appointment)', 'The series of an occurrence or an individually edited one, the series itself, or otherwise `null`.'],
  ['isOccurrence(appointment), isException(appointment)', 'Indicate an occurrence generated from a rule, and an occurrence edited individually from its series.'],
  ['occurrencesOf(series, start, end)', 'The occurrences of a series in a time range.'],
  ['recurrenceText(appointment)', 'Describes the recurrence in plain words in the current locale.'],
];

const EVENTS = [
  ['onSeriesAsking', '`{ appointment, series, action, scopes, scope, cancel }`. Set `scope` to answer without prompting, narrow `scopes`, or cancel the change.'],
  ['onSeriesAnswered', '`{ appointment, series, action, scope, byUser }`. `scope` is `null` when the prompt was canceled.'],
  ['onAppointmentUpdating / Updated', 'These also include `scope` and `series` (`null` for a non-recurring appointment). `Updated` includes `added`, which is the individually edited occurrence or the continuing series.'],
  ['onAppointmentDeleting / Deleted', 'These also include `scope` and `series`.'],
  ['onDataError', 'This also includes `saved` and `unsaved` (each `{ kind, appointment, changes? }`) and `undone`, which report what a series change wrote before failing and whether it was rolled back.'],
];

const EDITOR = [
  ['value', '`Bind<string>`', "`''`", 'The rule as RFC 5545 text, empty when it does not repeat. `x-model` provides two-way binding.'],
  ['start', '`Bind<Date | null>`', 'Now', 'The start of the series. A rule takes its weekday and day of the month from it, unless the rule specifies them.'],
  ['allDay', '`Bind<boolean>`', '`false`', 'Writes the last date as a date, instead of the end of that day in UTC.'],
  ['timeZone', '`Bind<string | null>`', "The browser time zone", 'The time zone the series recurs in.'],
  ['frequencies', '`Bind<("never" \\| frequency)[]>`', 'all five', 'The options in the repeat list.'],
  ['firstDayOfWeek, locale, texts, readOnly, summary', '—', '—', 'The first weekday button, names and strings, read-only state, and the description line.'],
  ['rule, summaryText', '—', '—', 'The rule parsed from `value`, and its description in words. Reactive.'],
  ['onValueChanged', '`{ value, previousValue, byUser }`', '—', 'Occurs when a selection changes the rule.'],
];

const PARTS = [
  ['TimeZone.of(name) / TimeZone.local', 'A time zone: `wall(moment)`, `moment(wall, later?)`, `offset`, `dayStart`, `addDays`, `sameDay`, `toLocal` and `fromLocal` (for editors), and `TimeZone.names()`.'],
  ['parseRecurrenceRule(text) / formatRecurrenceRule(rule)', 'Converts a rule to an object (`RecurrenceRule`) and back.'],
  ['recurrenceDates(rule, start, from, to, options?)', 'The times a rule occurs in a range, as wall clock times.'],
  ['describeRecurrence(rule, start, options)', 'Describes a rule in plain words.'],
  ['readRuleDates, addRuleDate, filterRuleDates, parseRuleDate, formatRuleDate', 'Exception dates as stored in the field.'],
  ['rangeFilter(range, fields)', 'The data layer filter for a range: it starts before the range ends and either ends at or after the range starts or has a rule. The scheduler\'s `remoteFiltering` uses it.'],
];

const KEYS = [
  ['Arrows (in the question)', 'Chooses this occurrence, this and following, or the whole series.'],
  ['Enter / Escape', 'Confirms, or cancels so that the change is discarded and the appointment reverts.'],
];

export default function SchedulerRecurrencePage() {
  return (
    <>
      <p class="lead">
        <Rich text="Recurring appointments based on RFC 5545 rules, with exceptions and individually edited occurrences, a prompt that asks what a change should apply to, a recurrence editor, and time zone support that handles daylight saving time." />
      </p>

      <Section anchor="recurring" title="Recurring appointments">
        <p>
          <Rich text="An appointment with a `recurrenceRule` is a series, and the scheduler shows its occurrences only in the visible days. `recurrenceException` excludes specific times, and an appointment whose `recurrenceId` references a series replaces one of its occurrences. Supported parts are `FREQ` (daily to yearly), `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (`2MO`, `-1FR`), `BYMONTHDAY`, `BYMONTH`, `BYYEARDAY`, `BYWEEKNO`, `BYSETPOS`, `WKST`, `BYHOUR` and `BYMINUTE`." />
        </p>
        <Example files={code('Recurring.tsx', 'recurring-appointments.ts')}>
          <Recurring />
        </Example>
      </Section>

      <Section anchor="series" title="Editing a series">
        <p>
          <Rich text="Moving, resizing, the form and Delete all ask the same question. **This one**: a new appointment takes its place, referencing its series, and its time is excluded from the series. **This and following**: the series ends before it (with `UNTIL` or a smaller `COUNT`), and a new series continues from it. **The whole series**: every occurrence moves the same way, and moving a weekly series to another day moves its weekdays." />
        </p>
        <p>
          <Rich text="With a data source, each write goes through its adapter in sequence: new rows first, then updates, then deletes. If a later write fails, the earlier ones are rolled back through the adapter. `onDataError` reports what was saved (`saved`, `unsaved`) and whether everything was rolled back (`undone`). An individually edited occurrence is an ordinary row linked to its series through `recurrenceId`, and deleting the series requests those rows from the adapter, whether they are loaded or not. This example uses a data source." />
        </p>
        <Example files={[...code('SeriesQuestion.tsx', 'recurring-appointments.ts'), slowAdapterFile]}>
          <SeriesQuestion />
        </Example>
      </Section>

      <Section anchor="editor" title="Recurrence editor">
        <p>
          <Rich text="The appointment form includes it (`editing.allowRecurrence`). On its own, it is `RecurrenceEditor`, with the repeat list, the interval, the weekdays, a day of the month or a weekday by position, the month and the end. A rule it cannot fully display stays unchanged until a selection is changed." />
        </p>
        <Example files={code('RuleEditor.tsx')}>
          <RuleEditor />
        </Example>
        <Code
          code={`
// In a form of your own:
FormLayout.editors.set('recurrence', (p) => new RecurrenceEditor(p));
// { field: 'rule', label: 'Repeat', editor: 'recurrence' }
`}
        />
      </Section>

      <Section anchor="zones" title="Time zones">
        <p>
          <Rich text="`timeZone` displays days and hours in a given zone. A series recurs in the zone of its start (`startDateTimeZone`), so 09:00 in New York stays 09:00 there across daylight saving changes. On the night the clocks go forward, the skipped hour is passed, and a time inside it moves forward by the hour. On the night they go back, an appointment's box is as long as the appointment lasts." />
        </p>
        <p>
          <Rich text="With `editing.allowTimeZones`, the form has a time zone picker and a **Separate end time zone** check box. When checked, a second picker sets the end zone, and an appointment with a different end zone opens with it checked. When unchecked, the end follows the start zone again." />
        </p>
        <Example files={code('TimeZones.tsx')}>
          <TimeZones />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Occurrences', 'An occurrence is named with how its series repeats, and an individually edited one says so. The indicators are decorative (`aria-hidden`).'],
            ['The question', 'A modal form with radio buttons under the question. The first option is selected.'],
            ['The editor', 'A group named "Repeat". The weekdays are toggle buttons (`aria-pressed`) in a group named by its label, and the description is polite live text.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-scheduler__appointment', '`data-series`, `data-exception`.'],
            ['scheduler.series-mark, exception-mark', 'Units: the indicators (`bar`, `chip`, `open`, `past`, `disabled`). A design language without them omits them.'],
            ['scheduler.tooltip-repeat', 'Unit: the tooltip line that describes the recurrence (`exception`).'],
            ['.mx-recurrence-editor, __days, __day, __summary', 'The editor, its weekday buttons and its description.'],
            ['recurrence-editor.editor, days-label, days, summary', 'Units of the editor. `day-button` is the place for the weekday buttons, plus `row-gap` and `column-gap`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Arguments']} rows={EVENTS} />
        <h3>
          <Rich text="RecurrenceEditor" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Default', 'Description']} rows={EDITOR} />
        <h3>
          <Rich text="Utilities" />
        </h3>
        <ApiTable head={['Part', 'Description']} rows={PARTS} />
      </Section>
    </>
  );
}
