import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of the kit; the splitters on the page take the new name at once. */
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
        The splitter is named <output class="layout-resize">{() => uiLocale.strings.resize}</output>
      </span>
    </>
  );
}
