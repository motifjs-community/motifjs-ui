import { reactive } from '@motifx/core';
import { Button, ListBox, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every list on the page: “Select all”, the search box, “No items”. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <ListBox label="Fruit" items={['Apple', 'Cherry', 'Pear']} selectionMode="multiple" selectAll searchEnabled />
      <ListBox label="Empty" items={[]} height={3} />
    </>
  );
}
