import { reactive } from '@motifx/core';
import { Button, NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A field bound to a number with x-model, and fields created with `new` and stepped from code. */
export default function FromCode() {
  const s = reactive({ quantity: 3 as number | null, log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const box = new NumberBox({ label: `Count ${++added}`, min: 0, max: 10, value: 5, locale: 'en' });
    box.onValueChanged((e) => (s.log = `${box.label}: ${show(e.value)}`));
    host?.controls.add(box);
    box.stepUp();
    box.focus();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="&Quantity" min={1} max={99} locale="en" x-model={() => s.quantity} />
        <output class="nb-quantity">{() => `value: ${show(s.quantity)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
        <output class="nb-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
