import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';
import type { Booking } from './recurring-appointments';

const pad = (n: number) => String(n).padStart(2, '0');
const today = new Date();
const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
const date = (offset: number) => {
  const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

/** A zone with its Windows name and VTIMEZONE, a weekly series with one excluded day, an all-day event, and folded, escaped text. */
const FILE = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Example//Calendar//EN',
  'BEGIN:VTIMEZONE',
  'TZID:W. Europe Standard Time',
  'BEGIN:STANDARD',
  'DTSTART:16010101T030000',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:16010101T020000',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
  'BEGIN:VEVENT',
  'UID:sync-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART;TZID=W. Europe Standard Time:${date(0)}T100000`,
  `DTEND;TZID=W. Europe Standard Time:${date(0)}T110000`,
  'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12',
  `EXDATE;TZID=W. Europe Standard Time:${date(2)}T100000`,
  'SUMMARY:Sync with Berlin',
  'DESCRIPTION:Agenda:\n1. Status\, risks\n2. Next steps',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:offsite-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART;VALUE=DATE:${date(3)}`,
  `DTEND;VALUE=DATE:${date(5)}`,
  'SUMMARY:Team offsite',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:call-1@example.com',
  'DTSTAMP:20260101T000000Z',
  `DTSTART:${date(1)}T130000Z`,
  'DURATION:PT45M',
  'SUMMARY:Call with the customer about the long running rollout of the new pl',
  ' anning tool',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

/**
 * A file read in: each event is added through the data layer as any new appointment is (here an
 * array; a data source gets the same adds through its adapter), with `onAppointmentAdding` first.
 * Read it in again: an event whose UID is there already changes that appointment.
 */
export default function ImportCalendar() {
  const s = reactive({ text: FILE, said: '' });
  const scheduler = (<Scheduler<Booking> appointments={reactive([] as Booking[])} startDayHour={8} endDayHour={18} />) as Scheduler<Booking>;
  const read = async () => {
    const result = await scheduler.importICalendar(s.text);
    s.said = result ? `${result.added.length} added, ${result.updated.length} changed, ${result.failed.length} refused` : 'Not read in';
  };
  return (
    <div class="sched-demo">
      <TextArea label="iCalendar file" rows={8} spellcheck={false} wrap="off" x-model={() => s.text} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Read in" tone="accent" onclick={() => void read()} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      {scheduler}
    </div>
  );
}
