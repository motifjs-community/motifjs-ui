/** The CSV field separator spreadsheets expect in a locale: `;` where decimals are written with a comma, else `,`. */
export function listSeparator(locale: string): string {
  const decimal = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value;
  return decimal === ',' ? ';' : ',';
}
