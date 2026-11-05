import { reactive } from '@motifx/core';
import { Button, ProgressBar, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the name of unlabelled bars and spinners, and the language the percent is written in. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <ProgressBar value={40} showValue locale={() => s.lang} />
      <span>
        Unlabelled ones are named <output class="pr-loading">{() => kitTexts.strings.loading}</output>
      </span>
    </>
  );
}
