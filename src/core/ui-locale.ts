import en from '../locales/en.json';
import { UiLocale } from './UiLocale';
import type { UiStrings } from './ui-strings';

/** The kit's built-in strings in English, used for anything a language pack leaves out. */
export const enStrings: UiStrings = en;

/** The page's language (`<html lang>`), else the browser's. */
function startLocale(): string {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang || navigator.language || 'en';
}

/**
 * The language of the kit's controls. It starts with the page's language and loads its pack. `uiLocale.use('tr-TR')`
 * switches it, and every control redraws its strings, dates and numbers. Packs ship as
 * `@motifx-community/ui/locales/<language>.json`. `uiLocale.add('de', strings)` adds a custom pack, and
 * `uiLocale.loader` sets where packs are loaded from.
 */
export const uiLocale = new UiLocale(enStrings, (language) => import(`../locales/${language}.json`), startLocale());
