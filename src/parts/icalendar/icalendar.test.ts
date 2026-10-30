import { describe, expect, it } from 'vitest';
import { TimeZone } from '../dates/time-zone';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarEvent } from './icalendar-event';
import { icalendarMoment } from './icalendar-moment';
import type { ICalendarProperty } from './icalendar-property';
import { parseICalendar } from './parse-icalendar';
import { timeZoneLines } from './time-zone-lines';
import { writeICalendar } from './write-icalendar';

const STAMP = Date.UTC(2026, 9, 28, 12, 0);
/** A wall clock time, or a moment for `at`. */
const w = (y: number, m: number, d: number, h = 0, min = 0) => Date.UTC(y, m - 1, d, h, min);
const at = (time: number, zone = ''): ICalendarDate => ({ time, utc: false, dateOnly: false, zone });
const utc = (time: number): ICalendarDate => ({ time, utc: true, dateOnly: false, zone: '' });
const day = (time: number): ICalendarDate => ({ time, utc: false, dateOnly: true, zone: '' });
const iso = (time: number) => new Date(time).toISOString().slice(0, 16);
const calendar = (...lines: string[]) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...lines, 'END:VCALENDAR'].join('\r\n');

function event(fields: Partial<ICalendarEvent>): ICalendarEvent {
  return {
    uid: 'one@example.com',
    start: at(w(2026, 3, 18, 9)),
    end: at(w(2026, 3, 18, 10)),
    summary: '',
    description: '',
    location: '',
    rule: '',
    exceptions: [],
    recurrenceId: null,
    status: '',
    stamp: null,
    sequence: null,
    other: [],
    ...fields,
  };
}

/** Write, read back, write again: the same text. */
function roundTrip(events: ICalendarEvent[]): string {
  const first = writeICalendar({ events, name: 'Team', stamp: STAMP });
  const read = parseICalendar(first);
  const second = writeICalendar({ events: read.events, name: read.name, stamp: STAMP });
  expect(second).toBe(first);
  return first;
}

/** RFC 5545, 3.6.5: New York's rules since 1967, under a name that is not an IANA one. */
const EASTERN = [
  'BEGIN:VTIMEZONE',
  'TZID:Eastern Standard Time',
  'LAST-MODIFIED:20050809T050000Z',
  'BEGIN:DAYLIGHT',
  'DTSTART:19670430T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=-1SU;UNTIL=19730429T070000Z',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'DTSTART:19671029T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU;UNTIL=20061029T060000Z',
  'TZOFFSETFROM:-0400',
  'TZOFFSETTO:-0500',
  'TZNAME:EST',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:19740106T020000',
  'RDATE:19750223T020000',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'END:DAYLIGHT',
  'BEGIN:DAYLIGHT',
  'DTSTART:19760425T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=-1SU;UNTIL=19860427T070000Z',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'END:DAYLIGHT',
  'BEGIN:DAYLIGHT',
  'DTSTART:19870405T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU;UNTIL=20060402T070000Z',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'END:DAYLIGHT',
  'BEGIN:DAYLIGHT',
  'DTSTART:20070311T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'DTSTART:20071104T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'TZOFFSETFROM:-0400',
  'TZOFFSETTO:-0500',
  'TZNAME:EST',
  'END:STANDARD',
  'END:VTIMEZONE',
];

// Zones are worked out through Intl year by year, which takes a while when the other test files run too.
describe('parseICalendar: the examples of RFC 5545', { timeout: 30_000 }, () => {
  it('reads the VEVENT examples of 3.6.1', () => {
    const read = parseICalendar(
      calendar(
        'PRODID:-//Example//EN',
        'BEGIN:VEVENT',
        'UID:19970901T130000Z-123401@example.com',
        'DTSTAMP:19970901T130000Z',
        'DTSTART:19970903T163000Z',
        'DTEND:19970903T190000Z',
        'SUMMARY:Annual Employee Review',
        'CLASS:PRIVATE',
        'CATEGORIES:BUSINESS,HUMAN RESOURCES',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:19970901T130000Z-123402@example.com',
        'DTSTAMP:19970901T130000Z',
        'DTSTART:19970401T163000Z',
        'DTEND:19970402T010000Z',
        'SUMMARY:Laurel is in sensitivity awareness class.',
        'CLASS:PUBLIC',
        'CATEGORIES:BUSINESS,HUMAN RESOURCES',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:19970901T130000Z-123403@example.com',
        'DTSTAMP:19970901T130000Z',
        'DTSTART;VALUE=DATE:19971102',
        'SUMMARY:Our Blissful Anniversary',
        'TRANSP:TRANSPARENT',
        'CLASS:CONFIDENTIAL',
        'CATEGORIES:ANNIVERSARY,PERSONAL,SPECIAL OCCASION',
        'RRULE:FREQ=YEARLY',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:20070423T123432Z-541111@example.com',
        'DTSTAMP:20070423T123432Z',
        'DTSTART;VALUE=DATE:20070628',
        'DTEND;VALUE=DATE:20070709',
        'SUMMARY:Festival International de Jazz de Montreal',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
      ),
    );
    expect(read.prodId).toBe('-//Example//EN');
    expect(read.events).toHaveLength(4);
    const [review, laurel, anniversary, festival] = read.events;
    expect(review.uid).toBe('19970901T130000Z-123401@example.com');
    expect(review.start).toEqual(utc(w(1997, 9, 3, 16, 30)));
    expect(review.end).toEqual(utc(w(1997, 9, 3, 19)));
    expect(review.stamp).toBe(w(1997, 9, 1, 13));
    expect(review.summary).toBe('Annual Employee Review');
    expect(review.other).toEqual([
      { name: 'CLASS', params: {}, value: 'PRIVATE' },
      { name: 'CATEGORIES', params: {}, value: 'BUSINESS,HUMAN RESOURCES' },
    ]);
    expect(laurel.end).toEqual(utc(w(1997, 4, 2, 1)));
    expect(anniversary.start).toEqual(day(w(1997, 11, 2)));
    expect(anniversary.end).toEqual(day(w(1997, 11, 3)));
    expect(anniversary.rule).toBe('FREQ=YEARLY');
    expect(festival.start).toEqual(day(w(2007, 6, 28)));
    expect(festival.end).toEqual(day(w(2007, 7, 9)));
  });

  it('reads the VTIMEZONE of 3.6.5 and finds moments by it for a TZID that is not an IANA name', () => {
    const read = parseICalendar(
      calendar(...EASTERN, 'BEGIN:VEVENT', 'UID:a', 'DTSTART;TZID=Eastern Standard Time:20260701T090000', 'DTEND;TZID=Eastern Standard Time:20260701T100000', 'END:VEVENT'),
    );
    expect(read.timeZones).toHaveLength(1);
    const zone = read.timeZones[0];
    expect(zone.id).toBe('Eastern Standard Time');
    expect(zone.observances).toHaveLength(7);
    expect(zone.observances[2]).toEqual({ kind: 'daylight', start: w(1974, 1, 6, 2), offsetFrom: -300, offsetTo: -240, name: 'EDT', rule: '', dates: [w(1975, 2, 23, 2)] });
    const start = read.events[0].start;
    expect(start).toEqual(at(w(2026, 7, 1, 9), 'Eastern Standard Time'));
    expect(iso(icalendarMoment(start, read.timeZones, 'Europe/Istanbul'))).toBe('2026-07-01T13:00');

    // The same moments as the IANA zone from 1970 on, mid-month and around each change.
    const newYork = TimeZone.of('America/New_York');
    const times: number[] = [];
    for (let year = 1970; year <= 2030; year++) {
      for (let month = 1; month <= 12; month++) times.push(w(year, month, 15, 9));
    }
    times.push(w(1974, 1, 6, 1, 59), w(1974, 1, 6, 3), w(1975, 2, 23, 3), w(1999, 4, 4, 1, 30), w(1999, 4, 4, 3), w(1999, 10, 31, 1, 30), w(1999, 10, 31, 2));
    times.push(w(2026, 3, 8, 1, 59), w(2026, 3, 8, 2, 30), w(2026, 3, 8, 3), w(2026, 11, 1, 0, 59), w(2026, 11, 1, 1, 30), w(2026, 11, 1, 2));
    for (const time of times) {
      expect(iso(icalendarMoment(at(time, 'Eastern Standard Time'), read.timeZones, null)), iso(time)).toBe(iso(newYork.moment(time)));
    }
  });

  it('unfolds the folded line of 3.1 and unescapes text as 3.3.11 writes it', () => {
    const read = parseICalendar(
      calendar(
        'BEGIN:VEVENT',
        'UID:a',
        'DTSTART:20260318T090000Z',
        'DESCRIPTION:This is a lo',
        ' ng description',
        '  that exists on a long line.',
        'SUMMARY:Project XYZ Final Review\\nConference Room - 3B\\NCome Prepared.',
        'LOCATION:Room 1\\, Floor 2\\; East\\\\West',
        'END:VEVENT',
      ),
    );
    const [only] = read.events;
    expect(only.description).toBe('This is a long description that exists on a long line.');
    expect(only.summary).toBe('Project XYZ Final Review\nConference Room - 3B\nCome Prepared.');
    expect(only.location).toBe('Room 1, Floor 2; East\\West');
  });
});

describe('writeICalendar: write, read, write gives the same text', () => {
  it('a timed event in a zone, with the zone written', () => {
    const text = roundTrip([event({ start: at(w(2026, 3, 18, 9), 'Europe/Istanbul'), end: at(w(2026, 3, 18, 10, 30), 'Europe/Istanbul'), summary: 'Stand-up' })]);
    expect(text.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MotifJS//Scheduler//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Team\r\n')).toBe(true);
    expect(text).toContain('\r\nBEGIN:VTIMEZONE\r\nTZID:Europe/Istanbul\r\n');
    expect(text).toContain('\r\nUID:one@example.com\r\nDTSTAMP:20261028T120000Z\r\n');
    expect(text).toContain('\r\nDTSTART;TZID=Europe/Istanbul:20260318T090000\r\nDTEND;TZID=Europe/Istanbul:20260318T103000\r\nSUMMARY:Stand-up\r\n');
    expect(text.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n')).toBe(true);
    expect(text.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('a UTC event and an all-day one', () => {
    const text = roundTrip([
      event({ uid: 'u', start: utc(w(2026, 3, 18, 6)), end: utc(w(2026, 3, 18, 7)) }),
      event({ uid: 'd', start: day(w(2026, 3, 18)), end: day(w(2026, 3, 19)), summary: 'Holiday' }),
    ]);
    expect(text).toContain('\r\nDTSTART:20260318T060000Z\r\nDTEND:20260318T070000Z\r\n');
    expect(text).toContain('\r\nDTSTART;VALUE=DATE:20260318\r\nDTEND;VALUE=DATE:20260319\r\n');
    expect(text).not.toContain('VTIMEZONE');
  });

  it('a weekly series with an end in UTC and exceptions, and a moved occurrence of it', () => {
    const zone = 'Europe/Berlin';
    const series = event({
      uid: 'series@example.com',
      start: at(w(2026, 3, 2, 9), zone),
      end: at(w(2026, 3, 2, 10), zone),
      rule: 'FREQ=WEEKLY;UNTIL=20260427T070000Z;BYDAY=MO',
      exceptions: [at(w(2026, 3, 16, 9), zone), utc(w(2026, 3, 30, 7))],
      sequence: 2,
    });
    const moved = event({
      uid: 'series@example.com',
      start: at(w(2026, 3, 24, 14), zone),
      end: at(w(2026, 3, 24, 15), zone),
      recurrenceId: at(w(2026, 3, 23, 9), zone),
      summary: 'Moved',
    });
    const text = roundTrip([series, moved]);
    expect(text).toContain('\r\nRRULE:FREQ=WEEKLY;UNTIL=20260427T070000Z;BYDAY=MO\r\n');
    // The UTC exception is written in the start's zone: 07:00Z is 09:00 in Berlin's summer.
    expect(text).toContain('\r\nEXDATE;TZID=Europe/Berlin:20260316T090000,20260330T090000\r\nSEQUENCE:2\r\n');
    expect(text).toContain('\r\nRECURRENCE-ID;TZID=Europe/Berlin:20260323T090000\r\nSUMMARY:Moved\r\n');
    const read = parseICalendar(text);
    expect(read.events.map((e) => e.uid)).toEqual(['series@example.com', 'series@example.com']);
    expect(read.events[0].exceptions).toEqual([at(w(2026, 3, 16, 9), zone), at(w(2026, 3, 30, 9), zone)]);
  });

  it('a long description with signs and text of many bytes, folded at 75 octets without splitting a character', () => {
    const description = 'Gündem: bütçe, plan; ve \\yedek\\ dosyalar.\nİkinci satır: ğüşıöç ĞÜŞİÖÇ 🎉🚀👩‍💻 — sonra, bir; daha.\n'.repeat(3);
    const text = roundTrip([event({ description, summary: 'Toplantı 🎉', location: 'Oda 3, Kat 2; Doğu' })]);
    const encoder = new TextEncoder();
    const lines = text.split('\r\n').slice(0, -1);
    for (const line of lines) {
      expect(encoder.encode(line).length, line).toBeLessThanOrEqual(75);
      expect(line, line).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
    }
    expect(lines.some((line) => line.startsWith(' '))).toBe(true);
    expect(text).toContain('DESCRIPTION:Gündem: bütçe\\, plan\\; ve \\\\yedek\\\\ dosyalar.\\nİkinci');
    const [read] = parseICalendar(text).events;
    expect(read.description).toBe(description);
    expect(read.summary).toBe('Toplantı 🎉');
    expect(read.location).toBe('Oda 3, Kat 2; Doğu');
  });

  it('keeps the properties it does not read, and the status', () => {
    const other: ICalendarProperty[] = [
      { name: 'ORGANIZER', params: { CN: 'Doe: John' }, value: 'mailto:john@example.com' },
      { name: 'X-MICROSOFT-CDO-BUSYSTATUS', params: {}, value: 'BUSY' },
      { name: 'CATEGORIES', params: {}, value: 'WORK,TEAM' },
    ];
    const text = roundTrip([event({ other, status: 'CANCELLED' })]);
    expect(text).toContain('\r\nSTATUS:CANCELLED\r\nORGANIZER;CN="Doe: John":mailto:john@example.com\r\nX-MICROSOFT-CDO-BUSYSTATUS:BUSY\r\nCATEGORIES:WORK,TEAM\r\nEND:VEVENT');
    expect(parseICalendar(text).events[0].other).toEqual(other);
  });

  it('gives an event without a uid one, and writes the stamp it has', () => {
    const text = writeICalendar({ events: [event({ uid: '', stamp: w(2026, 1, 2, 3, 4) })], stamp: STAMP, method: 'REQUEST', prodId: '-//Test//EN' });
    expect(text).toContain('\r\nPRODID:-//Test//EN\r\n');
    expect(text).toContain('\r\nMETHOD:REQUEST\r\n');
    expect(text).toContain('\r\nUID:20260318T090000-1@motifjs\r\nDTSTAMP:20260102T030400Z\r\n');
    expect(text).not.toContain('X-WR-CALNAME');
  });
});

describe('timeZoneLines: a VTIMEZONE from Intl', () => {
  const block = (lines: string[], kind: string) => {
    const start = lines.indexOf(`BEGIN:${kind}`);
    return start < 0 ? [] : lines.slice(start, lines.indexOf(`END:${kind}`, start) + 1);
  };

  it('Europe/Berlin and America/New_York: one observance of each kind with a yearly rule', () => {
    const berlin = timeZoneLines('Europe/Berlin', 2026, 2026);
    expect(berlin.slice(0, 2)).toEqual(['BEGIN:VTIMEZONE', 'TZID:Europe/Berlin']);
    expect(block(berlin, 'DAYLIGHT')).toEqual([
      'BEGIN:DAYLIGHT', 'DTSTART:20260329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'END:DAYLIGHT',
    ]);
    expect(block(berlin, 'STANDARD')).toEqual([
      'BEGIN:STANDARD', 'DTSTART:20261025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'END:STANDARD',
    ]);
    const newYork = timeZoneLines('America/New_York', 2026, 2026);
    expect(block(newYork, 'DAYLIGHT')).toEqual([
      'BEGIN:DAYLIGHT', 'DTSTART:20260308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'END:DAYLIGHT',
    ]);
    expect(block(newYork, 'STANDARD')).toEqual([
      'BEGIN:STANDARD', 'DTSTART:20261101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'END:STANDARD',
    ]);
    expect(timeZoneLines('America/New_York', 2010, 2030).filter((line) => line.startsWith('RRULE:'))).toEqual([
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    ]);
  });

  it('Europe/Istanbul (no summer time since 2016) and UTC: one STANDARD', () => {
    expect(timeZoneLines('Europe/Istanbul', 2026, 2027)).toEqual([
      'BEGIN:VTIMEZONE', 'TZID:Europe/Istanbul', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0300', 'TZOFFSETTO:+0300', 'END:STANDARD', 'END:VTIMEZONE',
    ]);
    expect(timeZoneLines('UTC', 2026, 2026)).toEqual([
      'BEGIN:VTIMEZONE', 'TZID:UTC', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0000', 'TZOFFSETTO:+0000', 'TZNAME:UTC', 'END:STANDARD', 'END:VTIMEZONE',
    ]);
    expect(timeZoneLines('Asia/Kolkata', 2026, 2026)).toContain('TZOFFSETTO:+0530');
  });

  it('Australia/Sydney: summer time from October to April', () => {
    const sydney = timeZoneLines('Australia/Sydney', 2026, 2027);
    expect(block(sydney, 'STANDARD')).toEqual([
      'BEGIN:STANDARD', 'DTSTART:20260405T030000', 'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU', 'TZOFFSETFROM:+1100', 'TZOFFSETTO:+1000', 'TZNAME:AEST', 'END:STANDARD',
    ]);
    expect(block(sydney, 'DAYLIGHT')).toEqual([
      'BEGIN:DAYLIGHT', 'DTSTART:20261004T020000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU', 'TZOFFSETFROM:+1000', 'TZOFFSETTO:+1100', 'TZNAME:AEDT', 'END:DAYLIGHT',
    ]);
    expect(sydney.indexOf('BEGIN:STANDARD')).toBeLessThan(sydney.indexOf('BEGIN:DAYLIGHT'));
  });

  it('America/Sao_Paulo 2018–2020: summer time ended, so the changes are written one by one', () => {
    const lines = timeZoneLines('America/Sao_Paulo', 2018, 2020);
    expect(lines.some((line) => line.startsWith('RRULE:'))).toBe(false);
    expect(block(lines, 'STANDARD')).toEqual([
      'BEGIN:STANDARD', 'DTSTART:20180218T000000', 'RDATE:20190217T000000', 'TZOFFSETFROM:-0200', 'TZOFFSETTO:-0300', 'END:STANDARD',
    ]);
    expect(block(lines, 'DAYLIGHT')).toEqual(['BEGIN:DAYLIGHT', 'DTSTART:20181104T000000', 'TZOFFSETFROM:-0300', 'TZOFFSETTO:-0200', 'END:DAYLIGHT']);
  });

  it('what it writes reads back to the same moments as the IANA zone', () => {
    for (const [name, from, to] of [['America/New_York', 2026, 2027], ['America/Sao_Paulo', 2018, 2020], ['Australia/Sydney', 2026, 2027]] as const) {
      const lines = timeZoneLines(name, from, to).map((line) => (line.startsWith('TZID:') ? 'TZID:Written zone' : line));
      const zones = parseICalendar(calendar(...lines)).timeZones;
      const zone = TimeZone.of(name);
      for (let time = w(from, 1, 1, 9); time < w(to + 1, 1, 1); time += 5 * 86_400_000 + 3_600_000) {
        expect(iso(icalendarMoment(at(time, 'Written zone'), zones, null)), `${name} ${iso(time)}`).toBe(iso(zone.moment(time)));
      }
    }
  });
});

describe('icalendarMoment', () => {
  it('a UTC time as it is, a date its midnight, an IANA zone by Intl, floating and unknown zones by the fallback', () => {
    expect(icalendarMoment(utc(w(2026, 3, 18, 6)), [], null)).toBe(w(2026, 3, 18, 6));
    expect(icalendarMoment(day(w(2026, 3, 18)), [], 'Europe/Istanbul')).toBe(w(2026, 3, 18));
    expect(iso(icalendarMoment(at(w(2026, 3, 18, 9), 'Europe/Istanbul'), [], null))).toBe('2026-03-18T06:00');
    expect(iso(icalendarMoment(at(w(2026, 7, 18, 9)), [], 'America/New_York'))).toBe('2026-07-18T13:00');
    expect(iso(icalendarMoment(at(w(2026, 7, 18, 9), 'Somewhere Else'), [], 'Europe/Berlin'))).toBe('2026-07-18T07:00');
    expect(icalendarMoment(at(w(2026, 7, 18, 9)), [], null)).toBe(TimeZone.local.moment(w(2026, 7, 18, 9)));
  });
});

describe('parseICalendar: files as they come', () => {
  it('reads LF-only and CR-only files, lower case names, a BOM, quoted parameters and a TZID with a slash', () => {
    const text = [
      '﻿begin:vcalendar',
      'x-wr-calname:Ekip\\, 2026',
      'x-wr-timezone:Europe/Istanbul',
      'method:publish',
      'begin:vevent',
      'uid:a',
      'dtstart;tzid="/Europe/Istanbul":20260318T090000',
      'dtend;TzId=Europe/Istanbul:20260318T100000',
      'attendee;CN="Doe: John; Jr, PhD";ROLE=REQ-PARTICIPANT:mailto:john@example.com',
      'summary:Hello',
      'end:vevent',
      'end:vcalendar',
    ];
    for (const end of ['\n', '\r']) {
      const read = parseICalendar(text.join(end));
      expect(read.name).toBe('Ekip, 2026');
      expect(read.timeZone).toBe('Europe/Istanbul');
      expect(read.method).toBe('PUBLISH');
      const [only] = read.events;
      expect(only.start).toEqual(at(w(2026, 3, 18, 9), 'Europe/Istanbul'));
      expect(only.end).toEqual(at(w(2026, 3, 18, 10), 'Europe/Istanbul'));
      expect(only.summary).toBe('Hello');
      expect(only.other).toEqual([{ name: 'ATTENDEE', params: { CN: 'Doe: John; Jr, PhD', ROLE: 'REQ-PARTICIPANT' }, value: 'mailto:john@example.com' }]);
    }
  });

  it('skips an alarm inside an event, to-dos and journals, and lines it cannot read', () => {
    const read = parseICalendar(
      calendar(
        'BEGIN:VEVENT',
        'UID:a',
        'DTSTART:20260318T090000Z',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'TRIGGER:-PT15M',
        'END:VALARM',
        'this is not a content line',
        'SUMMARY',
        ';X=1:no name',
        'X-BAD;PARAM:value',
        'BEGIN:X-SOMETHING',
        'X-INSIDE:1',
        'END:X-SOMETHING',
        'DESCRIPTION:The event',
        'STATUS:cancelled',
        'SEQUENCE:x',
        'END:VEVENT',
        'BEGIN:VTODO',
        'UID:todo',
        'DTSTART:20260318T090000Z',
        'END:VTODO',
        'BEGIN:VJOURNAL',
        'UID:journal',
        'END:VJOURNAL',
        'BEGIN:VEVENT',
        'UID:no-start',
        'END:VEVENT',
      ),
    );
    expect(read.events).toHaveLength(1);
    const [only] = read.events;
    expect(only.description).toBe('The event');
    expect(only.status).toBe('CANCELLED');
    expect(only.sequence).toBeNull();
    expect(only.other).toEqual([]);
    expect(only.end).toEqual(only.start);
  });

  it('applies a DURATION, ends an all-day event a day later, and reads EXDATE on several lines', () => {
    const read = parseICalendar(
      calendar(
        'BEGIN:VEVENT',
        'UID:duration',
        'DTSTART;TZID=Europe/Berlin:20260328T120000',
        'DURATION:P1DT2H',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:hours',
        'DTSTART;TZID=Europe/Berlin:20260328T120000',
        'DURATION:PT24H',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:week',
        'DTSTART;VALUE=DATE:20260318',
        'DURATION:P1W',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:back',
        'DTSTART:20260318T090000',
        'DURATION:-PT1H30M',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:all-day',
        'DTSTART;VALUE=DATE:20260318',
        'RRULE:FREQ=DAILY;COUNT=10',
        'EXDATE;VALUE=DATE:20260319,20260320',
        'EXDATE;VALUE=DATE:20260322',
        'exdate:20260324',
        'END:VEVENT',
      ),
    );
    const [duration, hours, week, back, allDay] = read.events;
    // A day on the wall clock, then two exact hours: summer time began in between.
    expect(duration.end).toEqual(at(w(2026, 3, 29, 14), 'Europe/Berlin'));
    expect(hours.end).toEqual(at(w(2026, 3, 29, 13), 'Europe/Berlin'));
    expect(week.end).toEqual(day(w(2026, 3, 25)));
    expect(back.end).toEqual(at(w(2026, 3, 18, 7, 30)));
    expect(allDay.end).toEqual(day(w(2026, 3, 19)));
    expect(allDay.exceptions).toEqual([day(w(2026, 3, 19)), day(w(2026, 3, 20)), day(w(2026, 3, 22)), day(w(2026, 3, 24))]);
  });

  it('merges several calendars in one file', () => {
    const one = calendar('X-WR-CALNAME:First', 'BEGIN:VEVENT', 'UID:a', 'DTSTART:20260318T090000Z', 'END:VEVENT');
    const two = calendar('X-WR-CALNAME:Second', ...EASTERN, 'BEGIN:VEVENT', 'UID:b', 'DTSTART:20260319T090000Z', 'END:VEVENT');
    const read = parseICalendar(`${one}\r\n${two}\r\n`);
    expect(read.events.map((e) => e.uid)).toEqual(['a', 'b']);
    expect(read.timeZones.map((zone) => zone.id)).toEqual(['Eastern Standard Time']);
    expect(read.name).toBe('First');
  });

  it('never throws on a file that is not one', () => {
    for (const text of ['', 'hello', 'BEGIN:VCALENDAR', 'END:VEVENT\nBEGIN:VEVENT\nDTSTART:2026', ':::', 'BEGIN:VEVENT\nDTSTART:20261340T250000\nEND:VEVENT']) {
      expect(parseICalendar(text).events).toEqual([]);
    }
  });
});
