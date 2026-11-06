import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ExportCalendar from './examples/ExportCalendar';
import ImportCalendar from './examples/ImportCalendar';
import PrintCalendar from './examples/PrintCalendar';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
  ['UID', 'The appointment’s key; an occurrence changed apart takes its series’ key. Read in, the UID is the new appointment’s key (with a data source, the adapter gives the key).'],
  ['DTSTART, DTEND (DURATION read too)', 'On the appointment’s own zone (`fields.startTimeZone`, `endTimeZone`), else the scheduler’s `timeZone`, else the browser’s, with `TZID`; an all-day one as dates (`VALUE=DATE`, the end the day after).'],
  ['SUMMARY, DESCRIPTION', 'The text and the description; escaped and folded at 75 octets as RFC 5545 says.'],
  ['RRULE', 'The series’ rule; an `UNTIL` on the wall clock is written in UTC, as the RFC asks of a rule with a zone.'],
  ['EXDATE', 'The times left out of a series, in the form of its start.'],
  ['RECURRENCE-ID', 'An occurrence changed apart: the time of its series it replaces (the left-out time nearest to it). Read in, the series leaves that time out and the event names it (`fields.recurrenceId`).'],
  ['VTIMEZONE', 'Written for every zone used, from the browser’s own time zone data (a rule a year when the changes follow one). Read in, a zone that is not an IANA name (`W. Europe Standard Time`) is followed by its VTIMEZONE.'],
  ['STATUS:CANCELLED', 'Read in: a cancelled occurrence is left out of its series; a cancelled event is not added.'],
];

const METHODS = [
  ['exportICalendar(options?)', '`string | null`', "`{ range: 'visible' (default) | 'all' | { start, end }, appointments, name }`: the file's text; `null` when `onICalendarExporting` said no."],
  ['importICalendar(text)', '`Promise<ICalendarImportResult | null>`', '`{ added, updated, failed }`: each event added through the data layer (with `onAppointmentAdding` first); an event whose UID is an appointment’s key changes it.'],
  ['print()', '`Promise<boolean>`', 'Prints the scheduler alone; `false` when `onPrinting` said no.'],
];

const EVENTS = [
  ['onICalendarExporting', '`{ appointments, range, cancel }`', 'Before writing; change `appointments` to write others.'],
  ['onICalendarExported', '`{ text, appointments }`', 'After writing.'],
  ['onICalendarImporting', '`{ text, appointments, cancel }`', 'Before adding: `appointments` are the values read, to change or filter.'],
  ['onICalendarImported', '`{ added, updated, failed }`', 'After adding.'],
  ['onPrinting', '`{ cancel }`', 'Before the print dialog.'],
  ['onPrinted', '`{}`', 'The print dialog closed (also after the browser’s own print).'],
];

const PARTS = [
  ['parseICalendar(text)', '`ICalendar`', 'The events, the time zones and the calendar’s name of a file; folded lines, escaped text, several calendars, components inside events; never throws.'],
  ['writeICalendar(options)', '`string`', '`{ events, name, prodId, method, timeZones, stamp }`.'],
  ['timeZoneLines(zone, fromYear, toYear)', '`string[]`', 'The VTIMEZONE of an IANA zone, from `Intl`.'],
  ['icalendarMoment(date, zones, fallback)', '`number`', 'The moment a date of a file names: UTC, an IANA zone, the file’s VTIMEZONE, else `fallback`.'],
];

export default function SchedulerICalendarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Appointments out to an iCalendar file and back in (RFC 5545), for use with other calendar applications; and the scheduler on paper." />
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
          <Rich text="`exportICalendar()` writes the appointments of the days shown, or all of them. A series goes whole with its rule, so another calendar repeats it the same way." />
        </p>
        <Example files={code('ExportCalendar.tsx', 'recurring-appointments.ts')}>
          <ExportCalendar />
        </Example>
      </Section>

      <Section anchor="read" title="Import a file">
        <p>
          <Rich text="`importICalendar(text)` reads the events and adds them as any new appointment is added: to the array, or through a data source's adapter." />
        </p>
        <Example files={code('ImportCalendar.tsx')}>
          <ImportCalendar />
        </Example>
      </Section>

      <Section anchor="fields" title="What is written and read">
        <ApiTable head={['iCalendar', 'The appointment']} rows={FIELDS} />
      </Section>

      <Section anchor="print" title="Print">
        <p>
          <Rich text="On paper every hour, row and column is built and shown (a big view is built whole while it prints), nothing is scrolled, the colours are kept and the bar is left out; a week of the month, a timeline row, a day of the agenda and an appointment are not split between pages." />
        </p>
        <Example files={code('PrintCalendar.tsx', 'sample-appointments.ts')}>
          <PrintCalendar />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.scheduler `print`, appointment `print`', 'Unit states: the look on paper, where a language draws it otherwise (no card frame).'],
            ['[data-printing]', 'On the scheduler while it prints; `print()` also marks the page so only this scheduler prints.'],
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
          <Rich text="The iCalendar part" />
        </h3>
        <p>
          <Rich text="The reader and the writer are DOM-free parts of the kit, usable without a scheduler." />
        </p>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={PARTS} />
      </Section>
    </>
  );
}
