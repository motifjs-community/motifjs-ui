import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** The name of a split button's arrow, from uiLocale: a shipped language or a text of your own. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Own text" variant="outline" onclick={() => (uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' })} />
      <span>
        The arrow above is named <output class="arrow-name">{() => uiLocale.strings.moreOptions}</output>
      </span>
    </>
  );
}
