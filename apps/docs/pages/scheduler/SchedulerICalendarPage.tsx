import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ExportCalendar from './examples/ExportCalendar';
import ImportCalendar from './examples/ImportCalendar';
import PrintCalendar from './examples/PrintCalendar';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
  ['UID', 'The appointment\'s key. An individually edited occurrence uses the key of its series. On import, the UID becomes the new appointment\'s key (with a data source, the adapter assigns the key).'],
  ['DTSTART, DTEND (DURATION read too)', 'In the appointment\'s own zone (`fields.startTimeZone`, `endTimeZone`), otherwise the scheduler\'s `timeZone`, otherwise the browser\'s, with `TZID`. All-day appointments are written as dates (`VALUE=DATE`), with the end on the following day.'],
  ['SUMMARY, DESCRIPTION', 'The text and the description, escaped and folded at 75 octets as RFC 5545 requires.'],
  ['RRULE', 'The series rule. An `UNTIL` in wall clock time is written in UTC, as the RFC requires for a rule with a time zone.'],
  ['EXDATE', 'The times excluded from a series, in the same form as its start.'],
  ['RECURRENCE-ID', 'An individually edited occurrence: the time in its series that it replaces (the excluded time closest to it). On import, the series excludes that time and the event references it (`fields.recurrenceId`).'],
  ['VTIMEZONE', 'Written for every zone used, from the browser\'s own time zone data (with one rule per year when the changes follow a pattern). On import, a zone that is not an IANA name (such as `W. Europe Standard Time`) follows its VTIMEZONE.'],
  ['STATUS:CANCELLED', 'On import, a canceled occurrence is excluded from its series, and a canceled event is not added.'],
];

const METHODS = [
  ['exportICalendar(options?)', '`string | null`', "`{ range: 'visible' (default) | 'all' | { start, end }, appointments, name }`. Returns the file's text, or `null` if `onICalendarExporting` canceled the export."],
  ['importICalendar(text)', '`Promise<ICalendarImportResult | null>`', '`{ added, updated, failed }`. Each event is added through the data layer, with `onAppointmentAdding` first. An event whose UID matches an appointment\'s key updates that appointment.'],
  ['print()', '`Promise<boolean>`', 'Prints the scheduler alone. Returns `false` if `onPrinting` canceled it.'],
];

const EVENTS = [
  ['onICalendarExporting', '`{ appointments, range, cancel }`', 'Occurs before writing. Change `appointments` to export different ones.'],
  ['onICalendarExported', '`{ text, appointments }`', 'Occurs after writing.'],
  ['onICalendarImporting', '`{ text, appointments, cancel }`', 'Occurs before adding. `appointments` holds the values read, which you can change or filter.'],
  ['onICalendarImported', '`{ added, updated, failed }`', 'Occurs after adding.'],
  ['onPrinting', '`{ cancel }`', 'Occurs before the print dialog opens.'],
  ['onPrinted', '`{}`', 'Occurs when the print dialog closes, including after the browser\'s own print command.'],
];

const PARTS = [
  ['parseICalendar(text)', '`ICalendar`', 'Returns the events, time zones and calendar name of a file. It handles folded lines, escaped text, multiple calendars and components inside events, and never throws.'],
  ['writeICalendar(options)', '`string`', '`{ events, name, prodId, method, timeZones, stamp }`.'],
  ['timeZoneLines(zone, fromYear, toYear)', '`string[]`', 'Returns the VTIMEZONE of an IANA zone, using `Intl`.'],
  ['icalendarMoment(date, zones, fallback)', '`number`', 'Returns the moment a date in a file refers to: in UTC, an IANA zone, the file\'s VTIMEZONE, or otherwise `fallback`.'],
];

export default function SchedulerICalendarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Exports appointments to an iCalendar file (RFC 5545) and imports them back, for use with other calendar applications. The scheduler can also be printed." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Scheduler, parseICalendar, writeICalendar } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="export" title="Export">
        <p>
          <Rich text="`exportICalendar()` writes the appointments of the displayed days, or all appointments. A series is exported whole with its rule, so another calendar repeats it the same way." />
        </p>
        <Example files={code('ExportCalendar.tsx', 'recurring-appointments.ts')}>
          <ExportCalendar />
        </Example>
      </Section>

      <Section anchor="read" title="Importing a file">
        <p>
          <Rich text="`importICalendar(text)` reads the events and adds them in the same way as any new appointment: to the array, or through a data source's adapter." />
        </p>
        <Example files={code('ImportCalendar.tsx')}>
          <ImportCalendar />
        </Example>
      </Section>

      <Section anchor="fields" title="What is exported and imported">
        <ApiTable head={['iCalendar', 'The appointment']} rows={FIELDS} />
      </Section>

      <Section anchor="print" title="Printing">
        <p>
          <Rich text="When printing, every hour, row and column is rendered and visible (a large view is rendered in full for printing), nothing scrolls, colors are preserved, and the toolbar is omitted. A week of the month, a timeline row, a day of the agenda and an appointment are not split across pages." />
        </p>
        <Example files={code('PrintCalendar.tsx', 'sample-appointments.ts')}>
          <PrintCalendar />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.scheduler `print`, appointment `print`', 'Unit states: the printed appearance, where a design language differs on paper (for example, no card frame).'],
            ['[data-printing]', 'Set on the scheduler while printing. `print()` also marks the page so that only this scheduler prints.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Arguments', 'When']} rows={EVENTS} />
        <h3>
          <Rich text="The iCalendar utilities" />
        </h3>
        <p>
          <Rich text="The reader and writer have no DOM dependency and can be used without a scheduler." />
        </p>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={PARTS} />
      </Section>
    </>
  );
}
