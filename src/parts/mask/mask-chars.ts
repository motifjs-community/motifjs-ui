import type { MaskChar } from './mask-char';

/** `0` a digit, `9` a digit that may stay empty, `a` a letter, `*` a letter or a digit. */
export const maskChars: Readonly<Record<string, MaskChar>> = {
  '0': /\d/,
  '9': /\d/,
  a: /\p{L}/u,
  '*': /[\p{L}\d]/u,
};
