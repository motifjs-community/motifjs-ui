import type { MaskChar } from './mask-char';

/** `0` is a digit, `9` is an optional digit, `a` is a letter, and `*` is a letter or a digit. */
export const maskChars: Readonly<Record<string, MaskChar>> = {
  '0': /\d/,
  '9': /\d/,
  a: /\p{L}/u,
  '*': /[\p{L}\d]/u,
};
