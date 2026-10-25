import { reactive } from '@motifx/core';
import { Stack, TextBox } from '@motifx-community/ui';

/** A phone number, an IBAN kept with its spaces, and a plate with a mask character of its own. */
export default function Masks() {
  const s = reactive({ phone: '', iban: '', plate: '' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <TextBox label="Phone" type="tel" mask="(000) 000 00 00" x-model={() => s.phone} />
        <output class="tb-phone">{() => `value: "${s.phone}"`}</output>
      </Stack>
      <TextBox label="IBAN" mask="TR00 0000 0000 0000 0000 0000 00" maskValue="formatted" stretch x-model={() => s.iban} />
      <Stack orientation="horizontal" wrap align="center">
        <TextBox label="Plate" mask="00 LLL 099" maskChars={{ L: { test: /\p{L}/u, transform: 'upper' } }} x-model={() => s.plate} />
        <output>{() => `value: "${s.plate}"`}</output>
      </Stack>
    </>
  );
}
