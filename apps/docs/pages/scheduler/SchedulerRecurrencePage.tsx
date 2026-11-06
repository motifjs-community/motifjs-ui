import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import Recurring from './examples/Recurring';
import RuleEditor from './examples/RuleEditor';
import SeriesQuestion from './examples/SeriesQuestion';
import TimeZones from './examples/TimeZones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['timeZone', '`Bind<string | null>`', "`null`: the browser's", 'The clock the days and hours are on, an IANA name (`Europe/Istanbul`). Converted with `Intl` only.'],
  [
    'seriesEdit',
    "`Bind<'ask' \\| 'occurrence' \\| 'following' \\| 'series'>`",
    "`'ask'`",
    'What changing or deleting an occurrence reaches. `ask` asks the user; programmatically it is the occurrence unless the call says.',
  ],
  ['recurrenceMarks', '`Bind<boolean>`', '`true`', 'The marks of an occurrence and of one changed apart, where the design language draws them.'],
  ['editing.allowRecurrence', '`boolean`', '`true`', 'The form holds the recurrence editor.'],
  ['editing.allowTimeZones', '`boolean`', '`false`', 'The form holds a time zone picker, and a box "Separate end time zone" (`separateEndZone` in the form’s data and `items`) that shows a picker for the end; unchecked, the end follows the start’s zone. Not on all-day appointments.'],
  ['fields.recurrenceRule', '`string`', "`'recurrenceRule'`", 'How it repeats: an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`); empty for once.'],
  ['fields.recurrenceException', '`string`', "`'recurrenceException'`", 'The times left out (`EXDATE`): a text apart by commas (`20261104T090000Z,…`) or a list of dates.'],
  ['fields.recurrenceId', '`string`', "`'recurrenceId'`", 'On an occurrence changed apart: the key of its series.'],
  ['fields.startTimeZone / endTimeZone', '`string`', "`'startDateTimeZone'` / `'endDateTimeZone'`", 'The zone the start (and the series) and the end are set in; empty for the scheduler’s (the start) and for the start’s (the end).'],
];

const METHODS = [
  ['updateAppointment(appointment, changes, scope?)', 'For an occurrence, `scope` says what the change reaches: `occurrence`, `following` or `series`.'],
  ['deleteAppointment(appointment, scope?)', 'The same for a delete.'],
  ['askSeries(appointment, action?)', 'Asks the user what a change (`update`) or a delete (`delete`) reaches; resolves to the answer or `null`.'],
  ['seriesOf(appointment)', 'The series of an occurrence or of one changed apart; a series itself; else `null`.'],
  ['isOccurrence(appointment), isException(appointment)', 'An occurrence the scheduler made from a rule; one changed apart from its series.'],
  ['occurrencesOf(series, start, end)', 'The occurrences of a series in a time.'],
  ['recurrenceText(appointment)', 'How it repeats, in plain words of the locale.'],
];

const EVENTS = [
  ['onSeriesAsking', '`{ appointment, series, action, scopes, scope, cancel }`: set `scope` to answer without the question, narrow `scopes`, or cancel the change.'],
  ['onSeriesAnswered', '`{ appointment, series, action, scope, byUser }`: `scope` is `null` when the question was cancelled.'],
  ['onAppointmentUpdating / Updated', 'Now also `scope` and `series` (`null` for an appointment that happens once); `Updated` gives `added`: the occurrence changed apart, or the series that goes on.'],
  ['onAppointmentDeleting / Deleted', 'Now also `scope` and `series`.'],
  ['onDataError', 'Now also `saved` and `unsaved` (each `{ kind, appointment, changes? }`) and `undone`: what a change of a series wrote before it failed, and whether it was all taken back.'],
];

const EDITOR = [
  ['value', '`Bind<string>`', "`''`", 'The rule as RFC 5545 text; empty when it does not repeat. Two-way with `x-model`.'],
  ['start', '`Bind<Date | null>`', 'now', 'When it starts: a rule’s weekday and day of the month come from it unless the rule names them.'],
  ['allDay', '`Bind<boolean>`', '`false`', 'Its last date is written as a date (else as the end of that day, in UTC).'],
  ['timeZone', '`Bind<string | null>`', "the browser's", 'The zone the series repeats in.'],
  ['frequencies', '`Bind<("never" \\| frequency)[]>`', 'all five', 'The choices of the repeat list.'],
  ['firstDayOfWeek, locale, texts, readOnly, summary', '—', '—', 'The first weekday button; names and words; read only; the line in words.'],
  ['rule, summaryText', '—', '—', 'The rule read from `value`, and how it repeats in words. Reactive.'],
  ['onValueChanged', '`{ value, previousValue, byUser }`', '—', 'A choice changed the rule.'],
];

const PARTS = [
  ['TimeZone.of(name) / TimeZone.local', 'A zone: `wall(moment)`, `moment(wall, later?)`, `offset`, `dayStart`, `addDays`, `sameDay`, `toLocal` / `fromLocal` (for editors), `TimeZone.names()`.'],
  ['parseRecurrenceRule(text) / formatRecurrenceRule(rule)', 'A rule as an object (`RecurrenceRule`) and back.'],
  ['recurrenceDates(rule, start, from, to, options?)', 'The times a rule happens in a range, as wall clock times.'],
  ['describeRecurrence(rule, start, options)', 'A rule in plain words.'],
  ['readRuleDates, addRuleDate, filterRuleDates, parseRuleDate, formatRuleDate', 'Exception dates as a field holds them.'],
  ['rangeFilter(range, fields)', 'The data layer’s filter for a range: starts before it ends and (ends at or after it starts, or has a rule). The scheduler’s `remoteFiltering` uses it.'],
];

const KEYS = [
  ['Arrows (in the question)', 'Choose this one, this and the following, the whole series.'],
  ['Enter / Escape', 'Answer / cancel: the change is dropped and the appointment goes back.'],
];

export default function SchedulerRecurrencePage() {
  return (
    <>
      <p class="lead">
        <Rich text="Appointments that repeat by an RFC 5545 rule, with times left out and occurrences changed apart; a question on what a change reaches; an editor of the rule; and the days on the clock of any time zone, summer time included." />
      </p>

      <Section anchor="recurring" title="Recurring appointments">
        <p>
          <Rich text="An appointment with a `recurrenceRule` is a series: the scheduler shows its occurrences in the days on screen only. `recurrenceException` leaves times out; an appointment whose `recurrenceId` names a series stands in for one of its occurrences. Supported: `FREQ` daily to yearly, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (`2MO`, `-1FR`), `BYMONTHDAY`, `BYMONTH`, `BYYEARDAY`, `BYWEEKNO`, `BYSETPOS`, `WKST`, `BYHOUR`, `BYMINUTE`." />
        </p>
        <Example files={code('Recurring.tsx', 'recurring-appointments.ts')}>
          <Recurring />
        </Example>
      </Section>

      <Section anchor="series" title="Changing a series">
        <p>
          <Rich text="Moving, resizing, the form and Delete ask the same question. **This one**: a new appointment takes its place (naming its series) and its time is left out of the series. **This and following**: the series ends before it (`UNTIL`, or a smaller `COUNT`) and a new series goes on from it. **The whole series**: every occurrence moves as this one did; a weekly series moved to another day moves its weekdays." />
        </p>
        <p>
          <Rich text="With a data source every write goes through its adapter, one after another: the new rows first, then the changes, then the deletes. When a later write fails, the earlier ones are taken back through the adapter; `onDataError` tells what was saved (`saved`, `unsaved`) and whether it was all taken back (`undone`). An occurrence changed apart is an ordinary row, linked to its series by `recurrenceId`; deleting the series asks the adapter for those rows, loaded or not. This example runs from a data source." />
        </p>
        <Example files={[...code('SeriesQuestion.tsx', 'recurring-appointments.ts'), slowAdapterFile]}>
          <SeriesQuestion />
        </Example>
      </Section>

      <Section anchor="editor" title="The recurrence editor">
        <p>
          <Rich text="The appointment form holds it (`editing.allowRecurrence`). On its own it is `RecurrenceEditor`: the repeat list, every how many, the weekdays, a day of the month or a weekday by its place, the month, the end; a rule it cannot show whole stays as it is until a choice is changed." />
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
          <Rich text="`timeZone` puts the days and hours on a zone's clock. A series repeats on the clock of its start's zone (`startDateTimeZone`), so 09:00 in New York stays 09:00 there over summer time. On the night the clocks go forward the skipped hour is passed (a time in it moves on by the hour); on the night they go back a box is as long as the appointment lasts." />
        </p>
        <p>
          <Rich text="With `editing.allowTimeZones` the form has one time zone picker and a box, **Separate end time zone**: checked, a second picker sets the end's zone (an appointment whose end zone differs opens with it checked); unchecked, the end follows the start's zone again." />
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
            ['Occurrences', 'An occurrence is named with how its series repeats; one changed apart says so. The marks are only drawn (`aria-hidden`).'],
            ['The question', 'A modal form: its choices are radio buttons under the question, the first one chosen.'],
            ['The editor', 'A group named "Repeat"; the weekdays are toggle buttons (`aria-pressed`) in a group named by its caption; the line in words is polite live text.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-scheduler__appointment', '`data-series`, `data-exception`.'],
            ['scheduler.series-mark, exception-mark', 'Units: the marks (`bar`, `chip`, `open`, `past`, `disabled`); a language that has none leaves them out.'],
            ['scheduler.tooltip-repeat', 'Unit: the tooltip’s line on how it repeats (`exception`).'],
            ['.mx-recurrence-editor, __days, __day, __summary', 'The editor, its weekday buttons and its line in words.'],
            ['recurrence-editor.editor, days-label, days, summary', 'Units of the editor; `day-button` is the weekday buttons’ place; `row-gap`, `column-gap`.'],
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
          <Rich text="Parts" />
        </h3>
        <ApiTable head={['Part', 'Description']} rows={PARTS} />
      </Section>
    </>
  );
}
