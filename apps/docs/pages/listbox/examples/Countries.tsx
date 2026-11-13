import { reactive, type ComponentBase } from '@motifx/core';
import { ListBox } from '@motifx-community/ui';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪' },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷' },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦' },
];

/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with a template. */
export default function Countries() {
  const form = reactive({ country: 'JP' as string | null });
  return (
    <>
      <ListBox
        label="Country"
        items={countries}
        textField="name"
        valueField="code"
        groupField="region"
        enabledField={(c: Country) => c.member !== false}
        itemTemplate={(c: Country, host: ComponentBase) => {
          host.setText(`${c.flag}  ${c.name}`);
        }}
        height={8}
        x-model={() => form.country}
      />
      <output class="lb-country">{() => `code: ${form.country ?? '—'}`}</output>
    </>
  );
}
