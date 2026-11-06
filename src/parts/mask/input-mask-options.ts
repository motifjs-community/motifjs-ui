import type { MaskChar } from './mask-char';

export interface InputMaskOptions {
  /** The mask, such as `(000) 000 00 00`. See `maskChars` for the characters a mask recognizes. */
  mask: string;
  /** Custom mask characters: `{ H: /[0-9a-f]/i }`. */
  chars?: Readonly<Record<string, MaskChar>>;
  /** Shown in the unfilled places. The default is `_`. */
  placeholder?: string;
  /** `focus` (the default) shows an empty mask only while the input has focus. */
  showMask?: 'always' | 'focus';
}
