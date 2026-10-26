import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, FilterBuilder, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { saleFields } from './sales';

/** The builder's texts come from `uiLocale`; `texts` changes some for one builder only. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <FilterBuilder
        class="fb-i18n"
        fields={saleFields}
        locale={() => s.lang}
        value={data.or(data.where('city', 'contains', 'an'), data.not(data.where('paid', '=', true)))}
        texts={{ filterBuilderEnterValue: '…' }}
        label={() => (s.lang === 'en' ? 'Localized filter' : 'Yerelleştirilmiş filtre')}
      />
    </>
  );
}
