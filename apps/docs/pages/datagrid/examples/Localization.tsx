import { reactive } from '@motifx/core';
import { Button, DataGrid, enStrings, Stack, trStrings, uiLocale } from '@motifx-community/ui';
import type { Order } from './order';
import { columns } from './orders';

/** Every grid on the page follows `uiLocale.strings`; one grid's own `texts` and `locale` win. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
        <span>
          New row reads <output class="dg-text">{() => uiLocale.strings.gridNewRow}</output>
        </span>
      </Stack>
      <DataGrid
        style="block-size: 10rem"
        rows={[] as Order[]}
        rowKey="id"
        columns={columns.slice(0, 4)}
        label="No orders yet"
        locale={() => s.lang}
        texts={() => ({ gridNoRows: s.lang === 'en' ? 'Nothing here yet' : 'Henüz bir şey yok' })}
        settings={{ addRows: true }}
      />
    </>
  );
}
