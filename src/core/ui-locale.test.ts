import { effect } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { tick } from '../../tests/helpers';
import { enStrings, trStrings, uiLocale } from './ui-locale';

afterEach(() => {
  uiLocale.strings = enStrings;
});

describe('uiLocale', () => {
  it('keeps the set it is given as it is, and tells a new set; nothing follows it', async () => {
    const seen: string[] = [];
    const followed: string[] = [];
    const told = uiLocale.onChanged(() => seen.push(uiLocale.strings.close));
    const stop = effect(() => void followed.push(uiLocale.strings.close));
    uiLocale.strings = trStrings;
    await tick();
    expect(uiLocale.strings).toBe(trStrings);
    const mine = { ...enStrings, close: 'Shut' };
    uiLocale.strings = mine;
    await tick();
    expect(uiLocale.strings).toBe(mine);
    expect(seen).toEqual(['Kapat', 'Shut']);
    expect(followed).toEqual(['Close']);
    told.dispose();
    stop();
    uiLocale.strings = enStrings;
  });
});
