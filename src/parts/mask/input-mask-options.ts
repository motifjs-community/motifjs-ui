import type { MaskChar } from './mask-char';

export interface InputMaskOptions {
  /** `(000) 000 00 00`; see `maskChars` for the characters a mask knows. */
  mask: string;
  /** Your own mask characters: `{ H: /[0-9a-f]/i }`. */
  chars?: Readonly<Record<string, MaskChar>>;
  /** Shown in the places not filled yet. Default `_`. */
  placeholder?: string;
  /** `focus` (default): an empty mask shows only while the input has focus. */
  showMask?: 'always' | 'focus';
}
