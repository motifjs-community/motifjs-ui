import { createI18n } from '@motifx-community/i18n';
import { describe, expect, it, vi } from 'vitest';
import { connectI18n } from './connect-i18n';
import { UiLocale } from './UiLocale';
import { enStrings, uiLocale } from './ui-locale';
import type { UiPackModule } from './ui-pack-module';

const make = (packs: Record<string, object> = { tr: { close: 'Kapat' } }) => {
  const loader = vi.fn((language: string) => (packs[language] ? Promise.resolve({ default: packs[language] } as UiPackModule) : Promise.reject(new Error('none'))));
  const locale = new UiLocale(enStrings, loader, 'en');
  const told: string[] = [];
  locale.onChanged(({ locale: now, previous }) => told.push(`${previous}>${now}`));
  return { locale, loader, told };
};

describe('UiLocale', () => {
  it('loads the pack of a language before it switches, and tells once', async () => {
    const { locale, loader, told } = make();
    await locale.ready;
    const switching = locale.use('tr-TR');
    expect(locale.locale).toBe('en');
    await switching;
    expect(locale.locale).toBe('tr-TR');
    expect(locale.strings.close).toBe('Kapat');
    // What the pack leaves out stays in the built-in language.
    expect(locale.strings.cancel).toBe('Cancel');
    expect(loader.mock.calls.map((c) => c[0])).toEqual(['tr-tr', 'tr']);
    expect(told).toEqual(['en>tr-TR']);
    await locale.use('tr');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('lets a later call win over one still loading', async () => {
    let release!: () => void;
    const loader = vi.fn((language: string) =>
      language === 'tr' ? new Promise<UiPackModule>((r) => (release = () => r({ close: 'Kapat' }))) : Promise.reject(new Error('none')),
    );
    const locale = new UiLocale(enStrings, loader, 'en');
    await locale.ready;
    const slow = locale.use('tr');
    await locale.use('en');
    release();
    await slow;
    expect(locale.locale).toBe('en');
    expect(locale.strings.close).toBe('Close');
  });

  it('keeps the built-in texts for a language without a pack, writing dates its way, and asks for it once', async () => {
    const { locale, loader, told } = make();
    await locale.use('de-DE');
    await locale.use('en');
    await locale.use('de-DE');
    expect(locale.locale).toBe('de-DE');
    expect(locale.strings).toBe(enStrings);
    expect(loader.mock.calls.filter((c) => c[0] === 'de').length).toBe(1);
    expect(told).toEqual(['en>de-DE', 'de-DE>en', 'en>de-DE']);
  });

  it('takes packs of the app, and more texts for a language in use at once', async () => {
    const { locale, told } = make();
    locale.add('de', { close: 'Schließen' });
    await locale.use('de');
    expect(locale.strings.close).toBe('Schließen');
    locale.add('de', { cancel: 'Abbrechen' });
    await new Promise((r) => setTimeout(r, 0));
    expect([locale.strings.close, locale.strings.cancel]).toEqual(['Schließen', 'Abbrechen']);
    expect(told).toEqual(['en>de', 'de>de']);
  });

  it('fills its texts with ICU, in the locale in use', async () => {
    const { locale } = make();
    locale.strings = { ...enStrings, gridRecords: '{count, plural, one {# record} other {# records}}' };
    expect(locale.text('gridRecords', { count: 1 })).toBe('1 record');
    expect(locale.text('gridRecords', { count: 1234 })).toBe('1,234 records');
    expect(locale.text('removeItem', { text: 'Ada' })).toBe('Remove Ada');
    expect(locale.dir).toBe('ltr');
    await locale.use('ar');
    expect(locale.dir).toBe('rtl');
  });

  it('follows the app’s translations with connectI18n, until stopped', async () => {
    const { locale } = make();
    const i18n = createI18n({ locale: 'en', messages: { en: {}, tr: {} }, dom: false });
    const stop = connectI18n(i18n, locale);
    await i18n.setLocale('tr');
    await vi.waitFor(() => expect(locale.locale).toBe('tr'));
    expect(locale.strings.close).toBe('Kapat');
    stop();
    await i18n.setLocale('en');
    await new Promise((r) => setTimeout(r, 0));
    expect(locale.locale).toBe('tr');
  });

  it('loads the shipped Turkish pack by itself', async () => {
    const before = uiLocale.locale;
    await uiLocale.use('tr-TR');
    expect(uiLocale.strings.close).toBe('Kapat');
    await uiLocale.use(before);
    expect(uiLocale.strings.close).toBe('Close');
  });
});
