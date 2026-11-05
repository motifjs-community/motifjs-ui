import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every field on the page; a required message already shown follows too. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        Required reads <output>{() => kitTexts.strings.required}</output>
      </span>
    </>
  );
}
