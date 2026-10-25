import { describe, expect, it } from 'vitest';
import { MaskedText } from './MaskedText';
import { parseMask } from './parse-mask';

const phone = () => new MaskedText(parseMask('(000) 000'));

describe('MaskedText', () => {
  it('shows the mask with placeholders and gives the typed characters back', () => {
    const t = phone();
    expect(t.text).toBe('(___) ___');
    t.setRaw('53212');
    expect(t.text).toBe('(532) 12_');
    expect(t.raw).toBe('53212');
    expect(t.formatted).toBe('(532) 12');
    expect(t.complete).toBe(false);
    t.setRaw('532123');
    expect(t.complete).toBe(true);
  });

  it('types, skipping the fixed characters, and drops what does not fit', () => {
    const t = phone();
    expect(t.insert(0, 0, '5')).toBe(2);
    expect(t.insert(2, 2, 'x')).toBe(2);
    expect(t.insert(2, 2, '32')).toBe(6);
    expect(t.text).toBe('(532) ___');
    // A typed fixed character moves past it.
    expect(t.insert(4, 4, ')')).toBe(6);
    expect(t.insert(6, 6, '1234')).toBe(9);
    expect(t.raw).toBe('532123');
  });

  it('takes pasted text with or without the fixed characters', () => {
    const t = phone();
    t.insert(0, 0, '(532) 123');
    expect(t.raw).toBe('532123');
    const u = phone();
    u.setText('532 1');
    expect(u.text).toBe('(532) 1__');
  });

  it('inserts in the middle and shifts what follows', () => {
    const t = phone();
    t.setRaw('5321');
    expect(t.insert(1, 1, '9')).toBe(2);
    expect(t.text).toBe('(953) 21_');
  });

  it('deletes backward, forward and a selection', () => {
    const t = phone();
    t.setRaw('532123');
    expect(t.deleteBackward(9, 9)).toBe(8);
    expect(t.text).toBe('(532) 12_');
    expect(t.deleteBackward(6, 6)).toBe(3);
    expect(t.text).toBe('(531) 2__');
    expect(t.deleteForward(1, 1)).toBe(1);
    expect(t.text).toBe('(312) ___');
    t.setRaw('532123');
    expect(t.deleteBackward(2, 7)).toBe(2);
    expect(t.text).toBe('(523) ___');
    expect(t.deleteBackward(0, 0)).toBe(0);
  });

  it('stops the caret at the first empty place', () => {
    const t = phone();
    t.setRaw('53');
    expect(t.clamp(8)).toBe(3);
    expect(t.clamp(1)).toBe(1);
  });

  it('knows letters, optional digits, escapes and characters of your own', () => {
    const plate = new MaskedText(parseMask('00 LL 099', { L: { test: /\p{L}/u, transform: 'upper' } }));
    plate.insert(0, 0, '34ab12');
    expect(plate.text).toBe('34 AB 12_');
    expect(plate.complete).toBe(true);
    const code = new MaskedText(parseMask('\\0-00'), '#');
    expect(code.text).toBe('0-##');
    code.insert(0, 0, '0-42');
    expect(code.raw).toBe('42');
  });
});
