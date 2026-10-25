// Arithmetic on the decimal digits a number is written with, so 0.1 + 0.2 gives 0.3.

/** `value` × 10^`places`, moved on the written digits: `shiftDecimal(0.07, 2)` is exactly 7. */
export function shiftDecimal(value: number, places: number): number {
  const [digits, exponent = '0'] = String(value).split('e');
  return Number(`${digits}e${Number(exponent) + places}`);
}

/** How many digits a number has after the decimal point. */
export function decimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const [digits, exponent = '0'] = String(value).split('e');
  const fraction = digits.split('.')[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
}

export function addDecimal(a: number, b: number): number {
  const places = Math.min(20, Math.max(decimalPlaces(a), decimalPlaces(b)));
  return shiftDecimal(Math.round(shiftDecimal(a, places)) + Math.round(shiftDecimal(b, places)), -places);
}

/** Rounds half away from zero to `places` digits after the point. */
export function roundDecimal(value: number, places: number): number {
  if (!Number.isFinite(value) || decimalPlaces(value) <= places) return value;
  const rounded = shiftDecimal(Math.round(shiftDecimal(Math.abs(value), places)), -places);
  return value < 0 ? -rounded : rounded;
}
