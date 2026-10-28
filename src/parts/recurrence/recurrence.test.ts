import { describe, expect, it } from 'vitest';
import { enStrings, trStrings } from '../../core/ui-locale';
import { addRuleDate } from './add-rule-date';
import { describeRecurrence } from './describe-recurrence';
import { filterRuleDates } from './filter-rule-dates';
import { formatRecurrenceRule } from './format-recurrence-rule';
import { parseRecurrenceRule } from './parse-recurrence-rule';
import { readRuleDates } from './read-rule-dates';
import { recurrenceDates } from './recurrence-dates';

const HOUR = 3_600_000;
/** A wall clock time, as the engine counts it. */
const w = (y: number, m: number, d: number, h = 9, min = 0) => Date.UTC(y, m - 1, d, h, min);
const text = (time: number) => new Date(time).toISOString().slice(0, 16).replace('T', ' ');
const day = (time: number) => new Date(time).toISOString().slice(0, 10);
/** New York in 1997–1998, outside summer time: enough for the RFC's UNTIL in UTC. */
const newYorkWinter = (moment: number) => moment - 5 * HOUR;

function dates(rule: string, start: number, to = w(2010, 1, 1), from = start, wallOf?: (t: number) => number) {
  const parsed = parseRecurrenceRule(rule);
  expect(parsed, rule).not.toBeNull();
  return recurrenceDates(parsed!, start, from, to, { wallOf });
}

describe('recurrence rules: the examples of RFC 5545 (3.8.5.3)', () => {
  it('daily: a count, an end in UTC, every other day, every 10 days', () => {
    expect(dates('FREQ=DAILY;COUNT=10', w(1997, 9, 2)).map(day)).toEqual([
      '1997-09-02', '1997-09-03', '1997-09-04', '1997-09-05', '1997-09-06', '1997-09-07', '1997-09-08', '1997-09-09', '1997-09-10', '1997-09-11',
    ]);
    const until = dates('FREQ=DAILY;UNTIL=19971224T000000Z', w(1997, 9, 2), undefined, undefined, newYorkWinter);
    expect(until.length).toBe(113);
    expect(day(until[until.length - 1])).toBe('1997-12-23');
    expect(dates('FREQ=DAILY;INTERVAL=2', w(1997, 9, 2), w(1997, 9, 12)).map(day)).toEqual(['1997-09-02', '1997-09-04', '1997-09-06', '1997-09-08', '1997-09-10']);
    expect(dates('FREQ=DAILY;INTERVAL=10;COUNT=5', w(1997, 9, 2)).map(day)).toEqual(['1997-09-02', '1997-09-12', '1997-09-22', '1997-10-02', '1997-10-12']);
  });

  it('every day in January for three years, yearly and daily', () => {
    const yearly = dates('FREQ=YEARLY;UNTIL=20000131T140000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA', w(1998, 1, 1), undefined, undefined, newYorkWinter);
    const daily = dates('FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1', w(1998, 1, 1), undefined, undefined, newYorkWinter);
    expect(yearly.length).toBe(93);
    expect(daily).toEqual(yearly);
    expect(day(yearly[31])).toBe('1999-01-01');
  });

  it('weekly: a count, every other week on three days until a date, two days for five weeks', () => {
    expect(dates('FREQ=WEEKLY;COUNT=10', w(1997, 9, 2)).map(day).slice(-3)).toEqual(['1997-10-21', '1997-10-28', '1997-11-04']);
    expect(dates('FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR', w(1997, 9, 1), undefined, undefined, newYorkWinter).map(day)).toEqual([
      '1997-09-01', '1997-09-03', '1997-09-05', '1997-09-15', '1997-09-17', '1997-09-19', '1997-09-29', '1997-10-01', '1997-10-03', '1997-10-13',
      '1997-10-15', '1997-10-17', '1997-10-27', '1997-10-29', '1997-10-31', '1997-11-10', '1997-11-12', '1997-11-14', '1997-11-24', '1997-11-26',
      '1997-11-28', '1997-12-08', '1997-12-10', '1997-12-12', '1997-12-22',
    ]);
    expect(dates('FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH', w(1997, 9, 2)).map(day)).toEqual([
      '1997-09-02', '1997-09-04', '1997-09-09', '1997-09-11', '1997-09-16', '1997-09-18', '1997-09-23', '1997-09-25', '1997-09-30', '1997-10-02',
    ]);
  });

  it('the week start changes which days an every-other-week rule takes', () => {
    expect(dates('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO', w(1997, 8, 5)).map(day)).toEqual(['1997-08-05', '1997-08-10', '1997-08-19', '1997-08-24']);
    expect(dates('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU', w(1997, 8, 5)).map(day)).toEqual(['1997-08-05', '1997-08-17', '1997-08-19', '1997-08-31']);
  });

  it('monthly by the place of a weekday: 1FR, 1SU and -1SU, -2MO', () => {
    expect(dates('FREQ=MONTHLY;COUNT=10;BYDAY=1FR', w(1997, 9, 5)).map(day)).toEqual([
      '1997-09-05', '1997-10-03', '1997-11-07', '1997-12-05', '1998-01-02', '1998-02-06', '1998-03-06', '1998-04-03', '1998-05-01', '1998-06-05',
    ]);
    expect(dates('FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU', w(1997, 9, 7)).map(day)).toEqual([
      '1997-09-07', '1997-09-28', '1997-11-02', '1997-11-30', '1998-01-04', '1998-01-25', '1998-03-01', '1998-03-29', '1998-05-03', '1998-05-31',
    ]);
    expect(dates('FREQ=MONTHLY;COUNT=6;BYDAY=-2MO', w(1997, 9, 22)).map(day)).toEqual(['1997-09-22', '1997-10-20', '1997-11-17', '1997-12-22', '1998-01-19', '1998-02-16']);
  });

  it('monthly by the day of the month: from the end, two days, the first and the last, 10th to 15th every 18 months', () => {
    expect(dates('FREQ=MONTHLY;BYMONTHDAY=-3', w(1997, 9, 28), w(1998, 3, 1)).map(day)).toEqual(['1997-09-28', '1997-10-29', '1997-11-28', '1997-12-29', '1998-01-29', '1998-02-26']);
    expect(dates('FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15', w(1997, 9, 2)).map(day).slice(-2)).toEqual(['1998-01-02', '1998-01-15']);
    expect(dates('FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1,-1', w(1997, 9, 30)).map(day)).toEqual([
      '1997-09-30', '1997-10-01', '1997-10-31', '1997-11-01', '1997-11-30', '1997-12-01', '1997-12-31', '1998-01-01', '1998-01-31', '1998-02-01',
    ]);
    expect(dates('FREQ=MONTHLY;INTERVAL=18;COUNT=10;BYMONTHDAY=10,11,12,13,14,15', w(1997, 9, 10)).map(day).slice(5)).toEqual([
      '1997-09-15', '1999-03-10', '1999-03-11', '1999-03-12', '1999-03-13',
    ]);
    expect(dates('FREQ=MONTHLY;INTERVAL=2;BYDAY=TU', w(1997, 9, 2), w(1998, 1, 1)).map(day)).toEqual([
      '1997-09-02', '1997-09-09', '1997-09-16', '1997-09-23', '1997-09-30', '1997-11-04', '1997-11-11', '1997-11-18', '1997-11-25',
    ]);
  });

  it('yearly: by month, every other year, by the day of the year, the 20th Monday, a week number, every Thursday in March', () => {
    expect(dates('FREQ=YEARLY;COUNT=10;BYMONTH=6,7', w(1997, 6, 10)).map(day).slice(-2)).toEqual(['2001-06-10', '2001-07-10']);
    expect(dates('FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3', w(1997, 3, 10)).map(day)).toEqual([
      '1997-03-10', '1999-01-10', '1999-02-10', '1999-03-10', '2001-01-10', '2001-02-10', '2001-03-10', '2003-01-10', '2003-02-10', '2003-03-10',
    ]);
    expect(dates('FREQ=YEARLY;INTERVAL=3;COUNT=10;BYYEARDAY=1,100,200', w(1997, 1, 1)).map(day)).toEqual([
      '1997-01-01', '1997-04-10', '1997-07-19', '2000-01-01', '2000-04-09', '2000-07-18', '2003-01-01', '2003-04-10', '2003-07-19', '2006-01-01',
    ]);
    expect(dates('FREQ=YEARLY;BYDAY=20MO', w(1997, 5, 19), w(2000, 1, 1)).map(day)).toEqual(['1997-05-19', '1998-05-18', '1999-05-17']);
    expect(dates('FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO', w(1997, 5, 12), w(2000, 1, 1)).map(day)).toEqual(['1997-05-12', '1998-05-11', '1999-05-17']);
    expect(dates('FREQ=YEARLY;BYMONTH=3;BYDAY=TH', w(1997, 3, 13), w(1999, 1, 1)).map(day)).toEqual([
      '1997-03-13', '1997-03-20', '1997-03-27', '1998-03-05', '1998-03-12', '1998-03-19', '1998-03-26',
    ]);
  });

  it('days that must be two things at once: Friday the 13th, the Saturday after the first Sunday, election day', () => {
    expect(dates('FREQ=MONTHLY;BYDAY=FR;BYMONTHDAY=13', w(1997, 9, 2), w(2001, 1, 1)).map(day)).toEqual([
      '1998-02-13', '1998-03-13', '1998-11-13', '1999-08-13', '2000-10-13',
    ]);
    expect(dates('FREQ=MONTHLY;BYDAY=SA;BYMONTHDAY=7,8,9,10,11,12,13', w(1997, 9, 13), w(1998, 1, 1)).map(day)).toEqual([
      '1997-09-13', '1997-10-11', '1997-11-08', '1997-12-13',
    ]);
    expect(dates('FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;BYMONTHDAY=2,3,4,5,6,7,8', w(1996, 11, 5), w(2005, 1, 1)).map(day)).toEqual([
      '1996-11-05', '2000-11-07', '2004-11-02',
    ]);
  });

  it('BYSETPOS: the third of Tuesday to Thursday, the second-to-last weekday', () => {
    expect(dates('FREQ=MONTHLY;COUNT=3;BYDAY=TU,WE,TH;BYSETPOS=3', w(1997, 9, 4)).map(day)).toEqual(['1997-09-04', '1997-10-07', '1997-11-06']);
    expect(dates('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-2', w(1997, 9, 29), w(1998, 4, 1)).map(day)).toEqual([
      '1997-09-29', '1997-10-30', '1997-11-27', '1997-12-30', '1998-01-29', '1998-02-26', '1998-03-30',
    ]);
  });

  it('times of a day (BYHOUR, BYMINUTE) and an invalid date (February 30) left out', () => {
    const first = dates('FREQ=DAILY;BYHOUR=9,10,11,12,13,14,15,16;BYMINUTE=0,20,40', w(1997, 9, 2), w(1997, 9, 3));
    expect(first.length).toBe(24);
    expect(text(first[1])).toBe('1997-09-02 09:20');
    expect(dates('FREQ=MONTHLY;BYMONTHDAY=15,30;COUNT=5', w(2007, 1, 15)).map(day)).toEqual(['2007-01-15', '2007-01-30', '2007-02-15', '2007-03-15', '2007-03-30']);
  });
});

describe('recurrence rules: edges', () => {
  it('leap years: the 29th of February comes every four years', () => {
    expect(dates('FREQ=YEARLY', w(2024, 2, 29), w(2033, 1, 1)).map(day)).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
    expect(dates('FREQ=YEARLY;BYYEARDAY=-1', w(2023, 12, 31), w(2026, 1, 1)).map(day)).toEqual(['2023-12-31', '2024-12-31', '2025-12-31']);
    expect(dates('FREQ=YEARLY;BYYEARDAY=366', w(2024, 12, 31), w(2033, 1, 1)).map(day)).toEqual(['2024-12-31', '2028-12-31', '2032-12-31']);
  });

  it('the 31st: months without one are skipped, the last day (-1) is every month', () => {
    expect(dates('FREQ=MONTHLY', w(2026, 1, 31), w(2027, 1, 1)).map(day)).toEqual([
      '2026-01-31', '2026-03-31', '2026-05-31', '2026-07-31', '2026-08-31', '2026-10-31', '2026-12-31',
    ]);
    expect(dates('FREQ=MONTHLY;BYMONTHDAY=-1', w(2024, 1, 31), w(2024, 5, 1)).map(day)).toEqual(['2024-01-31', '2024-02-29', '2024-03-31', '2024-04-30']);
  });

  it('keeps the wall clock time and gives only the range asked for, the same as counting from the start', () => {
    const all = dates('FREQ=WEEKLY;BYDAY=MO,TH', w(2020, 1, 6, 9, 30), w(2027, 1, 1));
    const late = dates('FREQ=WEEKLY;BYDAY=MO,TH', w(2020, 1, 6, 9, 30), w(2027, 1, 1), w(2026, 10, 26));
    expect(late).toEqual(all.filter((t) => t >= w(2026, 10, 26)));
    expect(late.every((t) => text(t).endsWith('09:30'))).toBe(true);
    const counted = dates('FREQ=DAILY;COUNT=5', w(2026, 10, 1), w(2027, 1, 1), w(2026, 10, 4));
    expect(counted.map(day)).toEqual(['2026-10-04', '2026-10-05']);
  });

  it('a start that the rule does not have is not a time of it; UNTIL as a date includes that day', () => {
    expect(dates('FREQ=WEEKLY;BYDAY=TU', w(2026, 10, 26), w(2026, 11, 5)).map(day)).toEqual(['2026-10-27', '2026-11-03']);
    expect(dates('FREQ=DAILY;UNTIL=20261028', w(2026, 10, 26, 18), w(2027, 1, 1)).map(day)).toEqual(['2026-10-26', '2026-10-27', '2026-10-28']);
  });
});

describe('recurrence rules: text', () => {
  it('reads and writes a rule, the same text coming back', () => {
    for (const rule of [
      'FREQ=DAILY',
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
      'FREQ=MONTHLY;COUNT=6;BYDAY=-2MO',
      'FREQ=MONTHLY;UNTIL=20261231T235959Z;BYMONTHDAY=1,-1',
      'FREQ=YEARLY;BYMONTH=11;BYMONTHDAY=2,3,4,5,6,7,8;BYDAY=TU',
      'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-2;WKST=SU',
      'FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO;X-NAME=kept',
    ]) {
      expect(formatRecurrenceRule(parseRecurrenceRule(rule)!)).toBe(rule);
    }
    const read = parseRecurrenceRule('RRULE:freq=weekly;byday=2mo,-1fr;until=20261031');
    expect(read?.frequency).toBe('weekly');
    expect(read?.weekdays).toEqual([
      { day: 1, nth: 2 },
      { day: 5, nth: -1 },
    ]);
    expect(read?.until).toEqual({ time: Date.UTC(2026, 9, 31), utc: false, dateOnly: true });
  });

  it('a text it cannot follow is no rule', () => {
    for (const rule of ['', 'FREQ=HOURLY', 'INTERVAL=2', 'FREQ=DAILY;INTERVAL=0', 'FREQ=MONTHLY;BYMONTHDAY=32', 'FREQ=WEEKLY;BYDAY=XX', 'FREQ=DAILY;UNTIL=20260230', 'nonsense']) {
      expect(parseRecurrenceRule(rule), rule).toBeNull();
    }
  });

  it('exception dates: read from a text or a list, one added in the form the field has, some taken out', () => {
    expect(readRuleDates('20261104T090000Z,20261111T090000Z').map((d) => d.time)).toEqual([Date.UTC(2026, 10, 4, 9), Date.UTC(2026, 10, 11, 9)]);
    expect(readRuleDates([new Date(Date.UTC(2026, 10, 4, 9)), '20261111', null])).toEqual([
      { time: Date.UTC(2026, 10, 4, 9), utc: true, dateOnly: false },
      { time: Date.UTC(2026, 10, 11), utc: false, dateOnly: true },
    ]);
    expect(readRuleDates('2026-11-04T12:00:00+03:00')[0].time).toBe(Date.UTC(2026, 10, 4, 9));
    const moment = { time: Date.UTC(2026, 10, 18, 9), utc: true, dateOnly: false };
    expect(addRuleDate('', moment)).toBe('20261118T090000Z');
    expect(addRuleDate('20261104T090000Z', moment)).toBe('20261104T090000Z,20261118T090000Z');
    expect(addRuleDate([], moment)).toEqual([new Date(Date.UTC(2026, 10, 18, 9))]);
    expect(filterRuleDates('20261104T090000Z,20261118T090000Z', (d) => d.time < Date.UTC(2026, 10, 10))).toBe('20261104T090000Z');
  });
});

describe('recurrence rules: in words', () => {
  const say = (rule: string, start: Date | null = new Date(2026, 9, 28), locale = 'en-GB', strings = enStrings) =>
    describeRecurrence(parseRecurrenceRule(rule), start, { locale, strings, timeZone: 'UTC' });

  it('says how a rule repeats, in English and in Turkish', () => {
    expect(say('')).toBe('Does not repeat');
    expect(say('FREQ=DAILY')).toBe('Every day');
    expect(say('FREQ=DAILY;INTERVAL=3;COUNT=5')).toBe('Every 3 days, 5 times');
    expect(say('FREQ=WEEKLY')).toBe('Every week on Wednesday');
    expect(say('FREQ=WEEKLY;INTERVAL=2;BYDAY=WE,MO;UNTIL=20261231T235959Z')).toBe('Every 2 weeks on Monday and Wednesday, until 31 December 2026');
    expect(say('FREQ=MONTHLY')).toBe('Every month on day 28');
    expect(say('FREQ=MONTHLY;BYMONTHDAY=-1')).toBe('Every month on the last day');
    expect(say('FREQ=MONTHLY;BYDAY=2TU')).toBe('Every month on the second Tuesday');
    expect(say('FREQ=YEARLY')).toBe('Every year on 28 October');
    expect(say('FREQ=YEARLY;BYMONTH=11;BYDAY=-1FR')).toBe('Every year on the last Friday of November');
    expect(say('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1')).toBe('Every month, by a rule of its own');
    expect(say('FREQ=WEEKLY;BYDAY=MO,WE', null, 'tr-TR', trStrings)).toBe('Her hafta, Pazartesi ve Çarşamba');
    expect(say('FREQ=MONTHLY;INTERVAL=2;BYDAY=2TU;COUNT=4', null, 'tr-TR', trStrings)).toBe('2 ayda bir, ayın ikinci Salı günü, 4 kez');
  });
});
