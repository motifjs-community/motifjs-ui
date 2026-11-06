/** A day whose parts can be told apart: month 2, day 3, hour 4 (one digit each unless padded). */
const SAMPLE = new Date(2009, 1, 3, 4, 5, 6, 789);

/**
 * The Excel number format that displays a date as `format` (an `Intl.DateTimeFormat`) writes it, in
 * the same order and with the same separators: `dd.mm.yyyy`, `m/d/yy h:mm AM/PM`, `d mmmm yyyy`. Month
 * and day names are Excel's own, in the language of the computer that opens the file.
 */
export function excelDateFormat(format: Intl.DateTimeFormat): string {
  const locale = format.resolvedOptions().locale;
  const longMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(SAMPLE);
  const longDay = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(SAMPLE);
  return format
    .formatToParts(SAMPLE)
    .map((p) => {
      const v = p.value;
      switch (p.type) {
        case 'year':
          return v.length === 2 ? 'yy' : 'yyyy';
        case 'month':
          if (/^\d+$/.test(v)) return v.length === 1 ? 'm' : 'mm';
          return v === longMonth ? 'mmmm' : [...v].length === 1 ? 'mmmmm' : 'mmm';
        case 'day':
          return v.length === 1 ? 'd' : 'dd';
        case 'weekday':
          return v === longDay ? 'dddd' : 'ddd';
        case 'hour':
          return v.length === 1 ? 'h' : 'hh';
        case 'minute':
          return 'mm';
        case 'second':
          return 'ss';
        case 'fractionalSecond':
          return '0'.repeat(v.length);
        case 'dayPeriod':
          return 'AM/PM';
        case 'literal':
          return [...v].map((ch) => (ch === ' ' ? ' ' : `\\${ch}`)).join('');
        default:
          // Eras and time zone names have no Excel code.
          return '';
      }
    })
    .join('');
}
