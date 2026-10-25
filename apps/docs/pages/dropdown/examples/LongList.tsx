import { reactive } from '@motifx/core';
import { DropDown } from '@motifx-community/ui';

const orders = Array.from({ length: 5000 }, (_, i) => ({ value: i + 1, text: `Order #${String(i + 1).padStart(5, '0')}` }));

/** 5,000 orders with a search box; the list draws only the rows in view. */
export default function LongList() {
  const form = reactive({ order: 1200 as number | null });
  return (
    <>
      <DropDown label="Order" items={orders} searchEnabled x-model={() => form.order} />
      <output class="dd-order">{() => `order: ${form.order ?? '—'}`}</output>
    </>
  );
}
