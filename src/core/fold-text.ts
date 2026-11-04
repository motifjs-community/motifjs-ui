import { uiLocale } from './ui-locale';

/**
 * Text the way a search compares it: lower case by the kit's language, accents and dots taken off, so
 * `iz` finds `İzmir` and `ecole` finds `École` whatever the machine's own locale is.
 */
export function foldText(text: string): string {
  return text.toLocaleLowerCase(uiLocale.locale).normalize('NFD').replace(/\p{M}+/gu, '');
}
