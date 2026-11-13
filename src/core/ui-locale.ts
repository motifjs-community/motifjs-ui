import en from '../locales/en.json';
import { UiLocale } from './UiLocale';
import type { UiStrings } from './ui-strings';

/** The kit's built-in strings in English, used for anything a language pack leaves out. */
export const enStrings: UiStrings = en;

/** The browser's language until the app gives its own (`connectI18n`, `uiLocale.use`); English without a browser. */
function startLocale(): string {
  return (typeof navigator !== 'undefined' && navigator.language) || 'en';
}

/**
 * The language of the kit's controls. It starts with the browser's language and loads its pack; `connectI18n(i18n)`
 * keeps it on the app's language from then on. `uiLocale.use('tr-TR')` switches it, and every control redraws its strings, dates and numbers. Packs ship as
 * `@motifx-community/ui/locales/<language>.json`. `uiLocale.add('de', strings)` adds a custom pack, and
 * `uiLocale.loader` sets where packs are loaded from.
 */
export const uiLocale = new UiLocale(enStrings, (language) => import(`../locales/${language}.json`), startLocale());
