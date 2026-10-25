import { reactive } from '@motifx/core';
import { NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** Rounding to one decimal, and a field that cannot stay empty. */
export default function DecimalsAndEmpty() {
  const s = reactive({ weight: 72.456 as number | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Weight" decimals={1} step={0.1} suffix="kg" locale="en" x-model={() => s.weight} />
        <output class="nb-weight">{() => `value: ${show(s.weight)}`}</output>
      </Stack>
      <NumberBox label="Guests" min={1} allowEmpty={false} locale="en" value={2} />
    </>
  );
}
