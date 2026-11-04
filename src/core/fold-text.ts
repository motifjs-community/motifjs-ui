import { uiLocale } from './ui-locale';

/**
 * Text the way a search compares it: lower case by the kit's language, accents and dots taken off, so
 * `iz` finds `İzmir` and `ecole` finds `École` whatever the machine's own locale is. A search with a locale of
 * its own gives it.
 */
export function foldText(text: string, locale: string = uiLocale.locale): string {
  return text.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}+/gu, '');
}
