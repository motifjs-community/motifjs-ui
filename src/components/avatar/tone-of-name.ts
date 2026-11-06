import type { AvatarTone } from './avatar-tone';

/** The tones `auto` picks from: a name always lands on the same one. */
const TONES: AvatarTone[] = ['accent', 'success', 'caution', 'info', 'danger'];

/** Returns the tone of a name for `tone: 'auto'`. The same name has the same tone on every page and every visit. */
export function toneOfName(name: string): AvatarTone {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return name.trim() ? TONES[hash % TONES.length] : 'standard';
}
