const NUMBER_PARTS = new Set(['integer', 'group', 'decimal', 'fraction', 'exponentSeparator', 'exponentMinusSign', 'exponentInteger', 'nan', 'infinity']);

/** Text Excel shows as it is in a number format. */
function formatLiteral(text: string): string {
  if (text === '') return '';
  return text.includes('"') ? [...text].map((ch) => `\\${ch}`).join('') : `"${text}"`;
}

/**
 * The Excel number format that shows `value` as `format` (an `Intl.NumberFormat`) writes it: the
 * grouping, the fraction digits the value shows, a percent, a currency symbol where the locale puts
 * it, a scientific exponent. `undefined` for what Excel cannot write (compact notation, units).
 */
export function excelNumberFormat(format: Intl.NumberFormat, value: number): string | undefined {
  if (!Number.isFinite(value)) return undefined;
  const o = format.resolvedOptions();
  if (o.notation === 'compact' || o.style === 'unit') return undefined;
  const positive = section(format.formatToParts(Math.abs(value)), o);
  const negative = format.formatToParts(-Math.abs(value) || -1);
  // Excel puts a minus in front by itself; a second section only when the locale writes it otherwise.
  if (negative[0]?.type === 'minusSign' && section(negative.slice(1), o) === positive) return positive;
  return `${positive};${section(negative, o)}`;
}

function section(parts: readonly Intl.NumberFormatPart[], o: Intl.ResolvedNumberFormatOptions): string {
  const first = parts.findIndex((p) => NUMBER_PARTS.has(p.type));
  let last = -1;
  parts.forEach((p, i) => {
    if (NUMBER_PARTS.has(p.type)) last = i;
  });
  if (first < 0) return 'General';
  const fraction = parts.find((p) => p.type === 'fraction')?.value.length ?? 0;
  const grouping = (o.useGrouping as unknown) !== false && (o.useGrouping as unknown) !== 'false';
  const digits = Math.max(1, o.minimumIntegerDigits ?? 1);
  const integer = grouping && digits <= 3 ? `#,${'#'.repeat(3 - digits)}${'0'.repeat(digits)}` : '0'.repeat(digits);
  let core = integer + (fraction ? `.${'0'.repeat(fraction)}` : '');
  if (o.notation === 'scientific' || o.notation === 'engineering') core = `${'0'.repeat(digits)}${fraction ? `.${'0'.repeat(fraction)}` : ''}E+00`;
  return around(parts.slice(0, first)) + core + around(parts.slice(last + 1));
}

/** The parts before or after the number: a percent sign as Excel's `%`, the rest as quoted text. */
function around(parts: readonly Intl.NumberFormatPart[]): string {
  let out = '';
  let text = '';
  for (const p of parts) {
    if (p.type !== 'percentSign') {
      text += p.value;
      continue;
    }
    out += `${formatLiteral(text)}%`;
    text = '';
  }
  return out + formatLiteral(text);
}
