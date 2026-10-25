import { reactive } from '@motifx/core';
import { Button, enStrings, toast, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the names of the region and the close button. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Show a toast" variant="outline" onclick={() => toast.info(s.lang === 'en' ? 'Hello.' : 'Merhaba.')} />
    </>
  );
}
