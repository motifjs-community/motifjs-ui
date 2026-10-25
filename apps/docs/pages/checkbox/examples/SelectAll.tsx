import { reactive } from '@motifx/core';
import { CheckBox, Stack } from '@motifx-community/ui';

interface Topping {
  id: number;
  name: string;
  on: boolean;
}

/** A box over a list: indeterminate while only some are checked, and a click checks or unchecks them all. */
export default function SelectAll() {
  const toppings = reactive<Topping[]>([
    { id: 1, name: 'Cheese', on: true },
    { id: 2, name: 'Olives', on: false },
    { id: 3, name: 'Peppers', on: true },
  ]);

  const allToppings = (): boolean | null => {
    const on = toppings.filter((t) => t.on).length;
    return on === 0 ? false : on === toppings.length ? true : null;
  };

  return (
    <>
      <CheckBox
        label="All toppings"
        class="cb-all"
        value={allToppings}
        onValueChanged={(e) => {
          if (e.byUser) for (const t of toppings) t.on = e.value === true;
        }}
      />
      <Stack orientation="horizontal" wrap align="center" style="padding-inline-start: var(--mx-space-6)">
        {toppings.map((t) => (
          <CheckBox key={t.id} label={t.name} x-model={() => t.on} />
        ))}
      </Stack>
    </>
  );
}
