import { reactive } from '@motifx/core';
import { Button, Slider, Stack } from '@motifx-community/ui';

/** The three sizes, read-only and disabled following state, and a range rule checked while it moves. */
export default function States() {
  const s = reactive({ editable: true, age: 16 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Slider label="Small" size="sm" value={30} />
        <Slider label="Medium" value={50} />
        <Slider label="Large" size="lg" value={70} />
      </Stack>
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
      <Stack orientation="horizontal" wrap align="center">
        <Slider label="Read-only" value={30} readOnly={() => !s.editable} />
        <Slider label="Disabled" range value={[20, 60]} enabled={() => s.editable} />
      </Stack>
      <Slider label="Age" max={99} validateOn="input" rules={[{ type: 'range', min: 18, message: 'You must be 18 or older.' }]} x-model={() => s.age} />
    </>
  );
}
