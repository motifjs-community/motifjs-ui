const LOCALES = ['en-US', 'en-GB', 'en-AU'];
const formats = new Map<string, Intl.DateTimeFormat>();

/** The short name `Intl` gives a zone at a moment (`CEST`, `EST`, `AEDT`); empty when it gives only an offset (`GMT+3`). */
export function shortZoneName(zone: string, moment: number): string {
  for (const locale of LOCALES) {
    const key = `${locale} ${zone}`;
    let format = formats.get(key);
    if (!format) {
      format = new Intl.DateTimeFormat(locale, { timeZone: zone || undefined, timeZoneName: 'short' });
      formats.set(key, format);
    }
    const name = format.formatToParts(moment).find((part) => part.type === 'timeZoneName')?.value ?? '';
    if (name && !/^(GMT|UTC).*\d/.test(name)) return name;
  }
  return '';
}
