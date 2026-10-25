import { reactive } from '@motifx/core';
import { DropDown } from '@motifx-community/ui';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷', member: true },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪', member: true },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷', member: true },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵', member: true },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷', member: true },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷', member: true },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦', member: true },
];

/** Draws a country as its flag and its name, in the list and in the field. */
const drawCountry = (c: Country, host: HTMLElement) => {
  host.textContent = `${c.flag}  ${c.name}`;
};

/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with templates. */
export default function Countries() {
  const form = reactive({ country: 'TR' as string | null });
  return (
    <>
      <DropDown
        label="Country"
        items={countries}
        textField="name"
        valueField="code"
        groupField="region"
        enabledField={(c: Country) => c.member !== false}
        itemTemplate={drawCountry}
        fieldTemplate={drawCountry}
        x-model={() => form.country}
      />
      <output class="dd-country">{() => `code: ${form.country ?? '—'}`}</output>
    </>
  );
}
