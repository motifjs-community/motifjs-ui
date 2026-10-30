import { reactive } from '@motifx/core';
import { uiLocale } from '@motifx-community/ui';

/**
 * The kit's texts for the page's own bindings (`{() => kitTexts.strings.close}`). The kit follows nothing and tells
 * a change of language through `uiLocale.onChanged`; the app keeps its own state with it.
 */
export const kitTexts = reactive({ strings: uiLocale.strings, locale: uiLocale.locale });

uiLocale.onChanged(() => {
  kitTexts.strings = uiLocale.strings;
  kitTexts.locale = uiLocale.locale;
});
