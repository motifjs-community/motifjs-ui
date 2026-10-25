import type { MaskChar } from './mask-char';
import { maskChars } from './mask-chars';
import type { MaskSlot } from './mask-slot';

/** `(000) 000 00 00` → its places. `\` makes the next character fixed. */
export function parseMask(mask: string, chars: Readonly<Record<string, MaskChar>> = {}): MaskSlot[] {
  const known = { ...maskChars, ...chars };
  const slots: MaskSlot[] = [];
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i];
    if (ch === '\\' && i + 1 < mask.length) {
      slots.push({ literal: mask[++i] });
      continue;
    }
    const rule = known[ch];
    if (!rule) slots.push({ literal: ch });
    else if (rule instanceof RegExp) slots.push({ test: rule, optional: ch === '9' && !(ch in chars) });
    else slots.push({ test: rule.test, optional: false, transform: rule.transform });
  }
  return slots;
}
