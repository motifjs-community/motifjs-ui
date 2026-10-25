import { reactive } from '@motifx/core';
import { Button, enStrings, ProgressBar, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the name of unlabelled bars and spinners, and the language the percent is written in. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <ProgressBar value={40} showValue locale={() => s.lang} />
      <span>
        Unlabelled ones are named <output class="pr-loading">{() => uiLocale.strings.loading}</output>
      </span>
    </>
  );
}
