import type { GridTracks } from './grid-tracks';

/** Splits on spaces outside parentheses: `minmax(100px, 1fr) auto` is two words. */
function words(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let word = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (word) out.push(word);
      word = '';
    } else word += ch;
  }
  if (word) out.push(word);
  return out;
}

function track(word: string | number): string {
  if (typeof word === 'number') return `${word}px`;
  if (/^-?\d*\.?\d+$/.test(word)) return `${word}px`;
  const star = /^(\d*\.?\d*)\*$/.exec(word);
  if (star) return `${star[1] || '1'}fr`;
  return word;
}

/** The CSS `grid-template-rows` / `-columns` value of `GridTracks`, or `''` for none. */
export function trackList(value: GridTracks | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value > 0 ? `repeat(${Math.floor(value)}, minmax(0, 1fr))` : '';
  const list = typeof value === 'string' ? words(value.trim()) : value;
  return list.map(track).join(' ');
}
