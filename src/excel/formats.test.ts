import { describe, expect, it } from 'vitest';
import { excelDateFormat } from './date-format';
import { excelNumberFormat } from './number-format';

const num = (locale: string, options: Intl.NumberFormatOptions, value: number) => excelNumberFormat(new Intl.NumberFormat(locale, options), value);
const date = (locale: string, options: Intl.DateTimeFormatOptions) => excelDateFormat(new Intl.DateTimeFormat(locale, options));

describe('Excel number formats from Intl', () => {
  it('keeps the grouping and the fraction digits a value shows', () => {
    expect(num('en-US', {}, 1234.5)).toBe('#,##0.0');
    expect(num('en-US', {}, 1234)).toBe('#,##0');
    expect(num('en-US', { useGrouping: false, minimumFractionDigits: 2 }, 3)).toBe('0.00');
    expect(num('tr', { maximumFractionDigits: 2 }, 1.239)).toBe('#,##0.00');
  });

  it('writes percents, currencies where the locale puts them, and the exponent', () => {
    expect(num('en-US', { style: 'percent' }, 0.25)).toBe('#,##0%');
    expect(num('tr', { style: 'percent' }, 0.25)).toBe('%#,##0');
    expect(num('en-US', { style: 'currency', currency: 'USD' }, 12)).toBe('"$"#,##0.00');
    expect(num('de-DE', { style: 'currency', currency: 'EUR' }, 12)).toBe('#,##0.00" €"');
    expect(num('en-US', { style: 'currency', currency: 'USD', currencySign: 'accounting' }, 12)).toBe('"$"#,##0.00;"($"#,##0.00")"');
    expect(num('en-US', { notation: 'scientific' }, 1234)).toBe('0.000E+00');
  });

  it('has none for what Excel cannot show', () => {
    expect(num('en-US', { notation: 'compact' }, 1234)).toBeUndefined();
    expect(num('en-US', { style: 'unit', unit: 'kilogram' }, 3)).toBeUndefined();
    expect(num('en-US', {}, Number.NaN)).toBeUndefined();
  });
});

describe('Excel date formats from Intl', () => {
  it('follows the order, the padding and the separators of the locale', () => {
    expect(date('en-US', { dateStyle: 'short' })).toBe('m\\/d\\/yy');
    expect(date('tr', { dateStyle: 'short' })).toBe('d\\.mm\\.yyyy');
    expect(date('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })).toBe('d mmmm yyyy');
    expect(date('en-US', { dateStyle: 'medium', timeStyle: 'short' })).toBe('mmm d\\, yyyy\\, h\\:mm\\ AM/PM');
    expect(date('de-DE', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false })).toBe('dddd\\, hh:mm'.replace(':', '\\:'));
  });
});
