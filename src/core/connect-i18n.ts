import type { LocaleSource } from './locale-source';
import type { UiLocale } from './UiLocale';
import { uiLocale } from './ui-locale';

/**
 * Keeps the kit's language with the app's: the kit switches when the app's translations do (their
 * `onLocaleChanged`), loading its own pack. Returns what stops it.
 *
 * @example
 * const i18n = createI18n({ locale: 'tr', load: (l) => import(`./locales/${l}.json`) });
 * connectI18n(i18n);
 */
export function connectI18n(source: LocaleSource, target: UiLocale = uiLocale): () => void {
  void target.use(source.locale);
  const changed = source.onLocaleChanged(({ locale }) => void target.use(locale));
  return () => changed.dispose();
}
