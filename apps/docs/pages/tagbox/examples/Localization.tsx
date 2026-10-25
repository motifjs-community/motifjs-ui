import { reactive } from '@motifx/core';
import { Button, TagBox, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { skills } from './skills';

/** Switches the texts of every tag box on the page: remove buttons, “+3”, “Select all”. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <TagBox label="Skills" items={skills} value={['CSS', 'Go', 'HTML', 'Rust']} maxTags={2} selectAll clearButton />
    </>
  );
}
