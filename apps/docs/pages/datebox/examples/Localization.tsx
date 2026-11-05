import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';

/** Switches the button names and messages of every date box on the page. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />;
}
