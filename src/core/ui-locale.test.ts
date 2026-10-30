import { effect } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { tick } from '../../tests/helpers';
import { enStrings, trStrings, uiLocale } from './ui-locale';

afterEach(() => {
  uiLocale.strings = enStrings;
});

describe('uiLocale', () => {
  it('keeps the set it is given as it is, and every reader follows a new set', async () => {
    const seen: string[] = [];
    const stop = effect(() => void seen.push(uiLocale.strings.close));
    uiLocale.strings = trStrings;
    await tick();
    expect(uiLocale.strings).toBe(trStrings);
    const mine = { ...enStrings, close: 'Shut' };
    uiLocale.strings = mine;
    await tick();
    expect(uiLocale.strings).toBe(mine);
    expect(seen).toEqual(['Close', 'Kapat', 'Shut']);
    stop();
  });
});
