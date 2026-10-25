import { reactive } from '@motifx/core';
import { Button, DropDown, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every drop-down on the page: the search box, the clear button, the empty list. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <DropDown label="Empty" items={[]} placeholder="Open me" />
    </>
  );
}
