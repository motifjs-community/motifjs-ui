const FORMULA_START = /^[=+\-@\t\r]/;

/** Text a spreadsheet would run as a formula (it starts with `=`, `+`, `-`, `@`, a tab or a return) with a `'` in front, so it stays text. */
export function guardFormula(text: string): string {
  return FORMULA_START.test(text) ? `'${text}` : text;
}
