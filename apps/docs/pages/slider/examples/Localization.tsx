import { reactive } from '@motifx/core';
import { Button, Slider, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the names of the thumbs; the price slider writes its numbers in the chosen language. */
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
        The start thumb is named <output class="sl-minimum">{() => kitTexts.strings.minimum}</output>
      </span>
      <Slider
        label={() => (s.lang === 'en' ? 'Price' : 'Fiyat')}
        range
        max={1000}
        step={50}
        value={[200, 800]}
        showValue="drag"
        locale={() => s.lang}
        format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }}
      />
    </>
  );
}
