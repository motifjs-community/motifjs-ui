import type { DateKind } from './date-kind';
import type { DatePart } from './date-part';
import type { DatePattern } from './date-pattern';

const SAMPLE = new Date(2006, 10, 22, 13, 44, 55);
const MASK_CHARS = /[09a*\\]/g;

/** The digit pattern `locale` writes dates (and times, in 24 hours) with. */
export function datePatternOf(locale: string, kind: DateKind, seconds = false): DatePattern {
  const options: Intl.DateTimeFormatOptions = { numberingSystem: 'latn' };
  if (kind !== 'time') Object.assign(options, { year: 'numeric', month: '2-digit', day: '2-digit' });
  if (kind !== 'date') Object.assign(options, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', ...(seconds ? { second: '2-digit' } : {}) });
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat(locale, options);
  } catch {
    format = new Intl.DateTimeFormat('en-GB', options);
  }
  const parts: DatePart[] = [];
  let mask = '';
  for (const part of format.formatToParts(SAMPLE)) {
    if (part.type === 'literal') mask += part.value.replace(MASK_CHARS, (ch) => `\\${ch}`);
    else if (part.type === 'year' || part.type === 'month' || part.type === 'day' || part.type === 'hour' || part.type === 'minute' || part.type === 'second') {
      parts.push(part.type);
      mask += part.type === 'year' ? '0000' : '00';
    }
  }
  return { parts, mask };
}
