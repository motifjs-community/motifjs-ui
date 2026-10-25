import { reactive } from '@motifx/core';
import { Button, DropDown, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** Drop-downs bound with x-model, and drop-downs created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ city: 'İzmir' as string | null, size: null as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const size = new DropDown<string, string>({ label: `Size ${++added}`, items: ['S', 'M', 'L'], placeholder: 'Pick one' });
    size.onValueChanged((e) => (form.result = `${size.label}: ${e.value}`));
    host?.controls.add(size);
    size.focus();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <DropDown label="&City" items={cities} x-model={() => form.city} />
        <output class="dd-city">{() => `city: ${form.city ?? '—'}`}</output>
      </Stack>
      <DropDown label="Size" items={['S', 'M', 'L', 'XL']} placeholder="Pick one" x-model={() => form.size} clearButton />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a drop-down from code" variant="outline" onclick={addFromCode} />
        <output class="dd-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
