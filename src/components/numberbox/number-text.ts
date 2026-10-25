// Numbers as people type them in a locale: its decimal and group separators and its digits.

interface Separators {
  decimal: string;
  group: string;
  /** Every digit the locale writes or a user may type, with its value. */
  digits: Map<string, string>;
  /** The locale's own digits, 0 to 9. */
  own: string[];
}

const known = new Map<string, Separators>();

const MINUS = /[-−‒–﹣－]/;

function separatorsOf(locale: string): Separators {
  let found = known.get(locale);
  if (found) return found;
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6);
  const own = Array.from(new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210)).reverse();
  const digits = new Map<string, string>();
  for (let i = 0; i < 10; i++) {
    digits.set(String(i), String(i));
    if (own[i]) digits.set(own[i], String(i));
  }
  found = {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    digits,
    own: own.length === 10 ? own : '0123456789'.split(''),
  };
  known.set(locale, found);
  return found;
}

/** The locale itself when it is valid, else the page's. */
export function checkedLocale(locale: string | null | undefined): string {
  const page = (typeof document !== 'undefined' && document.documentElement.lang) || (typeof navigator !== 'undefined' && navigator.language) || 'en';
  for (const candidate of [locale, page]) {
    if (!candidate) continue;
    try {
      if (Intl.NumberFormat.supportedLocalesOf(candidate).length) return candidate;
    } catch {
      // not a locale tag; try the next one
    }
  }
  return 'en';
}

/**
 * Reads what was typed: `null` for nothing, `NaN` for text that is not a number. Group
 * separators, spaces, currency and percent signs are skipped. A `.` is also read as the decimal
 * point where it cannot be a group separator (`12.5` in `tr-TR`).
 */
export function parseNumber(text: string, locale: string): number | null {
  const { decimal, group, digits } = separatorsOf(locale);
  let plain = '';
  let seen = false;
  for (const ch of text) {
    const digit = digits.get(ch);
    if (digit !== undefined) {
      plain += digit;
      seen = true;
    } else if (ch === decimal) plain += 'D';
    else if (MINUS.test(ch)) plain += '-';
    else if (ch === '.' || ch === ',') plain += ch;
    else if (ch === group || /[\s\p{L}\p{S}\p{P}]/u.test(ch)) continue;
    else return NaN;
  }
  if (!plain.trim() && !text.trim()) return null;
  if (!seen) return NaN;
  if (plain.includes('D')) plain = plain.replace(/[.,]/g, '').replace('D', '.');
  else {
    plain = plain.replace(/,/g, '');
    const dots = plain.split('.').length - 1;
    if (dots > 1 || (dots === 1 && group === '.' && /\.\d{3}$/.test(plain))) plain = plain.replace(/\./g, '');
  }
  if (!/^-?\d*\.?\d*$/.test(plain)) return NaN;
  return Number(plain);
}

/** The text ends where more is still to come: a sign or a decimal point. */
export function isPartialNumber(text: string, locale: string): boolean {
  const { decimal } = separatorsOf(locale);
  const end = text.trim().slice(-1);
  return end === decimal || end === '.' || MINUS.test(end);
}

/** A number to edit: no grouping, the locale's decimal separator and digits. */
export function plainNumber(value: number, locale: string): string {
  const { decimal, own } = separatorsOf(locale);
  const written = /e/i.test(String(value)) ? value.toLocaleString('en', { useGrouping: false, maximumFractionDigits: 20 }) : String(value);
  let text = '';
  for (const ch of written) {
    if (ch >= '0' && ch <= '9') text += own[Number(ch)];
    else text += ch === '.' ? decimal : ch;
  }
  return text;
}
