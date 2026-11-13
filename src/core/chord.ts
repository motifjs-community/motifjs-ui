/** One key with its modifiers, as `parseChord` reads it. */
export interface Chord {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  /** Lower-case `KeyboardEvent.key`, or a single lower-case character. */
  key: string;
}
