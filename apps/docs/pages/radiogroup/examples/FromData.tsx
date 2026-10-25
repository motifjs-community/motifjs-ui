import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

interface Plan {
  id: number;
  name: string;
  price: number;
}

/** Options from a live list of your own objects: added and renamed ones show at once. */
export default function FromData() {
  const s = reactive({ plan: 2 as number | null });
  const plans = reactive<Plan[]>([
    { id: 1, name: 'Free', price: 0 },
    { id: 2, name: 'Pro', price: 12 },
    { id: 3, name: 'Team', price: 30 },
  ]);

  const addPlan = () => plans.push({ id: plans.length + 1, name: `Plan ${plans.length + 1}`, price: plans.length * 20 });

  return (
    <>
      <RadioGroup
        label="&Plan"
        class="rg-plans"
        items={() => plans}
        itemText={(p) => `${(p as Plan).name} — ${(p as Plan).price} €`}
        itemValue="id"
        x-model={() => s.plan}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a plan" variant="outline" enabled={() => plans.length < 6} onclick={addPlan} />
        <Button text="Raise prices" variant="outline" onclick={() => plans.forEach((p) => (p.price += 1))} />
        <output class="rg-plan">{() => `value: ${String(s.plan)}`}</output>
      </Stack>
    </>
  );
}
