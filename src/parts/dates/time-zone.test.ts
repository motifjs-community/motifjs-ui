import { describe, expect, it } from 'vitest';
import { TimeZone } from './time-zone';

const HOUR = 3_600_000;
const utc = (y: number, m: number, d: number, h = 0, min = 0) => Date.UTC(y, m - 1, d, h, min);
const iso = (time: number) => new Date(time).toISOString().slice(0, 16);

describe('TimeZone', () => {
  const berlin = TimeZone.of('Europe/Berlin');
  const newYork = TimeZone.of('America/New_York');

  it('knows the offset of a zone at a moment, summer and winter, and half hours', () => {
    expect(berlin.offset(utc(2026, 1, 15))).toBe(60);
    expect(berlin.offset(utc(2026, 7, 15))).toBe(120);
    expect(newYork.offset(utc(2026, 1, 15))).toBe(-300);
    expect(newYork.offset(utc(2026, 7, 15))).toBe(-240);
    expect(TimeZone.of('Asia/Kolkata').offset(utc(2026, 7, 15))).toBe(330);
    expect(TimeZone.of('Pacific/Chatham').offset(utc(2026, 7, 15))).toBe(765);
    expect(TimeZone.of('UTC').offset(utc(2026, 7, 15))).toBe(0);
  });

  it('turns moments into wall clock times and back', () => {
    expect(iso(berlin.wall(utc(2026, 10, 28, 8)))).toBe('2026-10-28T09:00');
    expect(iso(berlin.moment(utc(2026, 10, 28, 9)))).toBe('2026-10-28T08:00');
    expect(iso(newYork.moment(utc(2026, 7, 4, 12)))).toBe('2026-07-04T16:00');
  });

  it('Europe: the hour put forward is skipped (moved on), the hour put back is shown twice (the first, or the later)', () => {
    // 29 March 2026, 02:00 becomes 03:00 (01:00 UTC).
    expect(iso(berlin.moment(utc(2026, 3, 29, 1, 30)))).toBe('2026-03-29T00:30');
    expect(iso(berlin.moment(utc(2026, 3, 29, 2, 30)))).toBe('2026-03-29T01:30');
    expect(iso(berlin.wall(berlin.moment(utc(2026, 3, 29, 2, 30))))).toBe('2026-03-29T03:30');
    expect(iso(berlin.moment(utc(2026, 3, 29, 3, 0)))).toBe('2026-03-29T01:00');
    // 25 October 2026, 03:00 becomes 02:00 again (01:00 UTC).
    expect(iso(berlin.moment(utc(2026, 10, 25, 2, 30)))).toBe('2026-10-25T00:30');
    expect(iso(berlin.moment(utc(2026, 10, 25, 2, 30), true))).toBe('2026-10-25T01:30');
    expect(iso(berlin.wall(utc(2026, 10, 25, 0, 30)))).toBe(iso(berlin.wall(utc(2026, 10, 25, 1, 30))));
  });

  it('America: the same, on its own dates', () => {
    // 8 March 2026, 02:00 becomes 03:00 (07:00 UTC); 1 November 2026, 02:00 becomes 01:00 (06:00 UTC).
    expect(iso(newYork.moment(utc(2026, 3, 8, 2, 30)))).toBe('2026-03-08T07:30');
    expect(iso(newYork.wall(utc(2026, 3, 8, 7, 30)))).toBe('2026-03-08T03:30');
    expect(iso(newYork.moment(utc(2026, 11, 1, 1, 30)))).toBe('2026-11-01T05:30');
    expect(iso(newYork.moment(utc(2026, 11, 1, 1, 30), true))).toBe('2026-11-01T06:30');
    // The days of the change are 23 and 25 hours long.
    expect(newYork.moment(utc(2026, 3, 9)) - newYork.moment(utc(2026, 3, 8))).toBe(23 * HOUR);
    expect(newYork.moment(utc(2026, 11, 2)) - newYork.moment(utc(2026, 11, 1))).toBe(25 * HOUR);
  });

  it('days on its clock: the start of a day, the same time days later, the same day', () => {
    expect(iso(berlin.dayStart(utc(2026, 10, 25, 20)).getTime())).toBe('2026-10-24T22:00');
    expect(iso(berlin.addDays(utc(2026, 10, 24, 7), 1).getTime())).toBe('2026-10-25T08:00');
    expect(berlin.addDays(utc(2026, 10, 24, 7), 1).getTime() - utc(2026, 10, 24, 7)).toBe(25 * HOUR);
    expect(newYork.sameDay(utc(2026, 10, 28, 3), utc(2026, 10, 27, 20))).toBe(true);
    expect(berlin.sameDay(utc(2026, 10, 28, 3), utc(2026, 10, 27, 20))).toBe(false);
  });

  it("gives an editor the zone's clock as a date of the browser's, and takes it back", () => {
    const moment = utc(2026, 10, 28, 14, 15);
    const local = newYork.toLocal(moment);
    expect([local.getHours(), local.getMinutes(), local.getDate()]).toEqual([10, 15, 28]);
    expect(newYork.fromLocal(local).getTime()).toBe(moment);
    expect(TimeZone.local.toLocal(moment).getTime()).toBe(moment);
    expect(TimeZone.local.fromLocal(new Date(moment)).getTime()).toBe(moment);
  });

  it('the browser’s own zone without a name, a name it does not know, the names it knows', () => {
    expect(TimeZone.of(null)).toBe(TimeZone.local);
    expect(TimeZone.of('Europe/Berlin')).toBe(berlin);
    const warn = console.warn;
    console.warn = () => {};
    expect(TimeZone.of('Mars/Olympus')).toBe(TimeZone.local);
    console.warn = warn;
    expect(TimeZone.names()).toContain('Europe/Istanbul');
    expect(TimeZone.names()).toContain('UTC');
    const now = Date.now();
    expect(TimeZone.local.wall(now) - now).toBe(-new Date(now).getTimezoneOffset() * 60_000);
  });
});
