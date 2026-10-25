import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of the kit; the trees on the page follow at once. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        A failed load reads <output class="tv-failed">{() => `${uiLocale.strings.loadFailed} ${uiLocale.strings.retry}`}</output>
      </span>
    </>
  );
}
