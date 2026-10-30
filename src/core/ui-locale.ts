import en from '../locales/en.json';
import tr from '../locales/tr.json';
import { UiLocale } from './UiLocale';
import type { UiStrings } from './ui-strings';

/** The kit's built-in texts (English): what a language pack leaves out is shown in them. */
export const enStrings: UiStrings = en;

/** The Turkish pack. `uiLocale.use('tr')` loads it by itself; this is for code that assigns `uiLocale.strings`. */
export const trStrings: UiStrings = tr;

/** The page's language (`<html lang>`), else the browser's. */
function startLocale(): string {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang || navigator.language || 'en';
}

/**
 * The language of the kit's controls. It starts with the page's and loads its pack; `uiLocale.use('tr-TR')`
 * switches, and every control draws its texts, dates and numbers again. Packs ship as
 * `@motifx-community/ui/locales/<language>.json`; `uiLocale.add('de', strings)` adds one of your own, and
 * `uiLocale.loader` changes where they come from.
 */
export const uiLocale = new UiLocale(enStrings, (language) => import(`../locales/${language}.json`), startLocale());
