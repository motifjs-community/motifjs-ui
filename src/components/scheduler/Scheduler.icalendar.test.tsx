import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { parseICalendar } from '../../parts/icalendar/parse-icalendar';
import { Scheduler } from './Scheduler';

interface Booking {
  id: number | string;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  description?: string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number | string;
  startDateTimeZone?: string;
}

const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const made: Scheduler<Booking>[] = [];

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Booking>({ currentDate: new Date(2026, 9, 28), firstDayOfWeek: 1, locale: 'en-GB', timeZone: 'Europe/Berlin', ...props });
  made.push(scheduler);
  return mount(scheduler);
}

/** A week of the scheduler's clock (Berlin): a series with a day left out and one moved, an all-day one, one in New York. */
function bookings(): Booking[] {
  return reactive([
    {
      id: 1,
      text: 'Standup',
      startDate: new Date(Date.UTC(2026, 9, 19, 8)),
      endDate: new Date(Date.UTC(2026, 9, 19, 8, 15)),
      recurrenceRule: 'FREQ=DAILY;UNTIL=20261106T090000',
      recurrenceException: '20261027T090000,20261028T090000',
      description: 'Room 2; bring notes, please\nSecond line',
    },
    { id: 2, text: 'Standup, moved', startDate: new Date(Date.UTC(2026, 9, 28, 10)), endDate: new Date(Date.UTC(2026, 9, 28, 10, 15)), recurrenceId: 1 },
    { id: 3, text: 'Offsite', startDate: new Date(2026, 9, 29), endDate: new Date(2026, 9, 31), allDay: true },
    { id: 4, text: 'Call with NY', startDate: new Date(Date.UTC(2026, 9, 27, 14)), endDate: new Date(Date.UTC(2026, 9, 27, 15)), startDateTimeZone: 'America/New_York' },
    { id: 5, text: 'Next month', startDate: new Date(Date.UTC(2026, 10, 20, 9)), endDate: new Date(Date.UTC(2026, 10, 20, 10)) },
  ]);
}

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
  document.body.innerHTML = '';
});

describe('Scheduler: iCalendar', () => {
  it('writes the days shown: the series whole (UNTIL in UTC, its left-out days), the one moved apart, an all-day one, each zone with its definition', async () => {
    const s = make({ appointments: bookings() });
    await tick();
    const text = s.exportICalendar()!;
    const file = parseICalendar(text);
    expect(file.events.map((e) => e.summary)).toEqual(['Standup', 'Standup, moved', 'Offsite', 'Call with NY']);
    const [series, moved, offsite, call] = file.events;
    expect(series.uid).toBe('1');
    expect(series.start).toMatchObject({ zone: 'Europe/Berlin', utc: false, time: Date.UTC(2026, 9, 19, 10) });
    expect(series.rule).toBe('FREQ=DAILY;UNTIL=20261106T080000Z');
    expect(series.exceptions.map((d) => d.time)).toEqual([Date.UTC(2026, 9, 27, 9), Date.UTC(2026, 9, 28, 9)]);
    expect(series.description).toBe('Room 2; bring notes, please\nSecond line');
    expect(moved.uid).toBe('1');
    expect(moved.recurrenceId).toMatchObject({ zone: 'Europe/Berlin', time: Date.UTC(2026, 9, 28, 9) });
    expect(offsite.start).toMatchObject({ dateOnly: true, time: Date.UTC(2026, 9, 29) });
    expect(offsite.end).toMatchObject({ dateOnly: true, time: Date.UTC(2026, 9, 31) });
    expect(call.start).toMatchObject({ zone: 'America/New_York', time: Date.UTC(2026, 9, 27, 10) });
    expect(file.timeZones.map((z) => z.id).sort()).toEqual(['America/New_York', 'Europe/Berlin']);
    expect(text).toContain('X-WR-CALNAME:Scheduler');
    expect(text.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(s.exportICalendar({ range: 'all' })!).toContain('SUMMARY:Next month');
  });

  it('reads back what it wrote: the same times, rules, left-out days and the one moved apart, through the editor', async () => {
    const from = make({ appointments: bookings() });
    await tick();
    const text = from.exportICalendar({ range: 'all' })!;
    const list = reactive([] as Booking[]);
    const added: string[] = [];
    const to = make({ appointments: list, onAppointmentAdded: (e: { appointment: Booking }) => added.push(e.appointment.text) });
    await tick();
    const result = (await to.importICalendar(text))!;
    expect(result.added.length).toBe(5);
    expect(added).toEqual(['Standup', 'Offsite', 'Call with NY', 'Next month', 'Standup, moved']);
    const by = (t: string) => list.find((b) => b.text === t)!;
    expect(by('Standup').startDate.getTime()).toBe(Date.UTC(2026, 9, 19, 8));
    expect(by('Standup').recurrenceRule).toBe('FREQ=DAILY;UNTIL=20261106T080000Z');
    expect(by('Standup').recurrenceException).toBe('20261027T090000,20261028T090000');
    expect(by('Standup, moved').recurrenceId).toBe('1');
    expect(to.isException(by('Standup, moved'))).toBe(true);
    expect(by('Offsite')).toMatchObject({ allDay: true, startDate: new Date(2026, 9, 29), endDate: new Date(2026, 9, 31) });
    expect(by('Call with NY')).toMatchObject({ startDateTimeZone: 'America/New_York' });
    expect(by('Call with NY').startDate.getTime()).toBe(Date.UTC(2026, 9, 27, 14));
    // The same file again changes the appointments it made, adding none.
    const again = (await to.importICalendar(text))!;
    expect([again.added.length, again.updated.length]).toEqual([0, 5]);
    expect(list.length).toBe(5);
    // And writes the same events.
    const events = (t: string) => t.replace(/DTSTAMP:.*\r\n/g, '').replace('END:VCALENDAR\r\n', '').split('BEGIN:VEVENT').slice(1).sort();
    expect(events(to.exportICalendar({ range: 'all' })!)).toEqual(events(text));
  });

  it('reads a file with a zone by its Windows name with its VTIMEZONE, DURATION, a cancelled occurrence, folded escaped text', async () => {
    const list = reactive([] as Booking[]);
    const s = make({ appointments: list });
    await tick();
    const file = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
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
      'UID:a@x',
      'DTSTART;TZID=W. Europe Standard Time:20261026T100000',
      'DURATION:PT1H30M',
      'RRULE:FREQ=DAILY;COUNT=5',
      'SUMMARY:Sync\\, weekly',
      'DESCRIPTION:One\\nTwo and a long line that is folded by the wri',
      ' ter',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:a@x',
      'RECURRENCE-ID;TZID=W. Europe Standard Time:20261028T100000',
      'DTSTART;TZID=W. Europe Standard Time:20261028T100000',
      'DTEND;TZID=W. Europe Standard Time:20261028T110000',
      'STATUS:CANCELLED',
      'SUMMARY:Sync',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const importing: number[] = [];
    s.onICalendarImporting((e) => importing.push(e.appointments.length));
    await s.importICalendar(file);
    expect(importing).toEqual([1]);
    expect(list.length).toBe(1);
    const [sync] = list;
    expect(sync.text).toBe('Sync, weekly');
    expect(sync.description).toBe('One\nTwo and a long line that is folded by the writer');
    expect(sync.startDate.getTime()).toBe(Date.UTC(2026, 9, 26, 9));
    expect(sync.endDate.getTime()).toBe(Date.UTC(2026, 9, 26, 10, 30));
    expect(sync.startDateTimeZone).toBeUndefined();
    expect(sync.recurrenceException).toBe('20261028T100000');
    expect(s.occurrencesOf(sync, new Date(Date.UTC(2026, 9, 25)), new Date(Date.UTC(2026, 10, 2))).length).toBe(4);
  });

  it('asks first both ways; a data source gets the adds through its adapter', async () => {
    const s = make({ appointments: bookings() });
    await tick();
    s.onICalendarExporting((e) => (e.cancel = true));
    expect(s.exportICalendar()).toBeNull();
    const source = new data.DataSource<Booking>({ adapter: new data.ArrayAdapter<Booking>({ data: [], key: 'id', createKey: () => 100 }), loadMode: 'all' });
    const t = make({ dataSource: source, remoteFiltering: false });
    await tick();
    await source.load();
    const text = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:z@x\r\nDTSTART:20261028T090000Z\r\nDTEND:20261028T100000Z\r\nSUMMARY:From a file\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const result = (await t.importICalendar(text))!;
    expect(result.added.length).toBe(1);
    await source.load();
    expect(source.rows.map((r) => r.text)).toEqual(['From a file']);
    t.onICalendarImporting((e) => (e.cancel = true));
    expect(await t.importICalendar(text)).toBeNull();
  });
});
