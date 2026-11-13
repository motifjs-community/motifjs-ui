import { effect } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from '../../tests/helpers';
import { enStrings, uiLocale } from './ui-locale';

afterEach(async () => {
  await uiLocale.use('en');
  uiLocale.strings = enStrings;
});

describe('uiLocale', () => {
  it("starts with the browser's language; the page's <html lang> is not read", async () => {
    vi.resetModules();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('tr-TR');
    document.documentElement.lang = 'de';
    try {
      const fresh = await import('./ui-locale');
      expect(fresh.uiLocale.locale).toBe('tr-TR');
    } finally {
      vi.restoreAllMocks();
      document.documentElement.removeAttribute('lang');
    }
  });

  it('keeps the set it is given as it is, and tells a new set; nothing follows it', async () => {
    const seen: string[] = [];
    const followed: string[] = [];
    const told = uiLocale.onChanged(() => seen.push(uiLocale.strings.close));
    const stop = effect(() => void followed.push(uiLocale.strings.close));
    await uiLocale.use('tr');
    await tick();
    expect(uiLocale.strings.close).toBe('Kapat');
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
