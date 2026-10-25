import { describe, expect, it } from 'vitest';
import { addMonths } from './add-months';
import { datePatternOf } from './date-pattern-of';
import { dateToDigits } from './date-to-digits';
import { digitsToDate } from './digits-to-date';
import { firstDayOfWeek } from './first-day-of-week';
import { isoWeek } from './iso-week';

describe('dates', () => {
  it('reads the order and the separators of a locale', () => {
    expect(datePatternOf('tr-TR', 'date')).toEqual({ parts: ['day', 'month', 'year'], mask: '00.00.0000' });
    expect(datePatternOf('en-US', 'date')).toEqual({ parts: ['month', 'day', 'year'], mask: '00/00/0000' });
    expect(datePatternOf('ja-JP', 'date').parts).toEqual(['year', 'month', 'day']);
    expect(datePatternOf('tr-TR', 'datetime').mask).toBe('00.00.0000 00:00');
    expect(datePatternOf('en-GB', 'time', true)).toEqual({ parts: ['hour', 'minute', 'second'], mask: '00:00:00' });
  });

  it('turns dates into the digits of a pattern and back, and refuses dates that do not exist', () => {
    const tr = datePatternOf('tr-TR', 'datetime');
    expect(dateToDigits(new Date(2026, 9, 5, 9, 7), tr)).toBe('051020260907');
    expect(digitsToDate('051020260907', tr)).toEqual(new Date(2026, 9, 5, 9, 7));
    expect(digitsToDate('31022026', datePatternOf('tr-TR', 'date'))).toBeNull();
    expect(digitsToDate('29022024', datePatternOf('tr-TR', 'date'))).toEqual(new Date(2024, 1, 29));
    expect(digitsToDate('0512', datePatternOf('tr-TR', 'date'))).toBeNull();
    expect(digitsToDate('2561', datePatternOf('tr-TR', 'time'))).toBeNull();
    expect(digitsToDate('01010012', datePatternOf('tr-TR', 'date'))!.getFullYear()).toBe(12);
  });

  it('knows where weeks start and counts ISO weeks', () => {
    expect(firstDayOfWeek('tr-TR')).toBe(1);
    expect(firstDayOfWeek('en-US')).toBe(0);
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);
    expect(isoWeek(new Date(2021, 0, 3))).toBe(53);
  });

  it('adds months without running past the end of a month', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2024, 2, 31), -1)).toEqual(new Date(2024, 1, 29));
  });
});
