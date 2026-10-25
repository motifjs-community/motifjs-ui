/**
 * Where `needle` occurs in `text`, as `[start, end)` pairs, without case in the locale unless
 * `caseSensitive`. Letters whose lower case is longer (`İ` outside Turkish) still map back to their
 * place in `text`.
 */
export function textRanges(text: string, needle: string, locale: string, caseSensitive: boolean): [number, number][] {
  if (!needle || !text) return [];
  const lower = (s: string) => (caseSensitive ? s : s.toLocaleLowerCase(locale));
  let folded = '';
  // The index in `text` of each unit of `folded`, and one past the end.
  const at: number[] = [];
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    const low = lower(ch);
    for (let k = 0; k < low.length; k++) at.push(i);
    folded += low;
    i += ch.length;
  }
  at.push(text.length);
  const find = lower(needle);
  const out: [number, number][] = [];
  let from = 0;
  for (;;) {
    const hit = folded.indexOf(find, from);
    if (hit < 0) break;
    const end = hit + find.length;
    // The end maps to the start of the next letter of `text`.
    let stop = at[end];
    if (end < at.length - 1 && at[end] === at[end - 1]) stop = nextLetter(text, at[end]);
    out.push([at[hit], stop]);
    from = end;
  }
  return out;
}

function nextLetter(text: string, i: number): number {
  return i + String.fromCodePoint(text.codePointAt(i)!).length;
}
