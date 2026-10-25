import { reactive } from '@motifx/core';
import { Button, enStrings, Slider, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the names of the thumbs; the price slider writes its numbers in the chosen language. */
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
        The start thumb is named <output class="sl-minimum">{() => uiLocale.strings.minimum}</output>
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
