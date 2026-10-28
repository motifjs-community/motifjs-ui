const SHAPE = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i;

/** A duration (`P1W`, `PT1H30M`, `-P1DT2H`) as whole days and the exact time beside them; `null` when it is none. */
export function readDuration(text: string): { days: number; time: number } | null {
  const value = text.trim();
  const m = SHAPE.exec(value);
  if (!m || /^[+-]?PT?$/i.test(value) || /T$/i.test(value)) return null;
  const [, sign, weeks, days, hours, minutes, seconds] = m;
  const way = sign === '-' ? -1 : 1;
  const n = (part: string | undefined) => Number(part ?? 0);
  return {
    days: way * (n(weeks) * 7 + n(days)),
    time: way * ((n(hours) * 60 + n(minutes)) * 60 + n(seconds)) * 1000,
  };
}
