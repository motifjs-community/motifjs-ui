import { reactive } from '@motifx/core';
import { Button, ListBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A list bound with x-model, and lists created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const list = new ListBox<string, string>({ label: `Size ${++added}`, items: ['S', 'M', 'L', 'XL'], height: 4 });
    list.onValueChanged((e) => (form.result = `${list.label}: ${e.value}`));
    host?.controls.add(list);
    list.focus();
  };

  return (
    <>
      <ListBox label="&City" items={cities} x-model={() => form.city} />
      <Stack orientation="horizontal" wrap align="center">
        <output class="lb-city">{() => `city: ${form.city ?? '—'}`}</output>
        <Button text="Add a list programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="lb-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
