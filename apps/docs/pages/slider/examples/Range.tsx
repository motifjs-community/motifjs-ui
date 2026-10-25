import { reactive } from '@motifx/core';
import { Slider, type SliderValue } from '@motifx-community/ui';

const EURO: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };

/** Two thumbs that cannot cross, kept apart by minDistance. */
export default function Range() {
  const s = reactive({ price: [120, 380] as SliderValue });
  return (
    <>
      <Slider label="Price" range max={500} step={10} minDistance={50} format={EURO} showValue="drag" x-model={() => s.price} />
      <output class="sl-price">{() => `value: [${(s.price as number[]).join(', ')}]`}</output>
    </>
  );
}
