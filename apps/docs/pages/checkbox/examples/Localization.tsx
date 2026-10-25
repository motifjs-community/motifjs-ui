import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every field on the page; a required message already shown follows too. */
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
        Required reads <output>{() => uiLocale.strings.required}</output>
      </span>
    </>
  );
}
