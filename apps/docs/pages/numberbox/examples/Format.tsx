import { reactive } from '@motifx/core';
import { NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A Turkish lira price, a percent edited as shown, and US dollars. */
export default function Format() {
  const s = reactive({ price: 1234.5 as number | null, share: 0.125 as number | null, dollars: 99.99 as number | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Price" locale="tr-TR" min={0} format={{ style: 'currency', currency: 'TRY' }} x-model={() => s.price} />
        <output class="nb-price">{() => `value: ${show(s.price)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Share" locale="en" min={0} max={1} step={0.01} format={{ style: 'percent', maximumFractionDigits: 1 }} x-model={() => s.share} />
        <output class="nb-share">{() => `value: ${show(s.share)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Amount" locale="en-US" format={{ style: 'currency', currency: 'USD' }} x-model={() => s.dollars} />
        <output>{() => `value: ${show(s.dollars)}`}</output>
      </Stack>
    </>
  );
}
