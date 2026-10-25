import { reactive } from '@motifx/core';
import { Button, ComboBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A combo box bound with x-model, and combo boxes created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const town = new ComboBox<string, string>({ label: `Town ${++added}`, items: cities, minSearchLength: 2 });
    town.onValueChanged((e) => (form.result = `${town.label}: ${e.value ?? '—'}`));
    host?.controls.add(town);
    town.focus();
  };

  return (
    <>
      <ComboBox label="&City" items={cities} x-model={() => form.city} clearButton />
      <output class="cb-city">{() => `city: ${form.city ?? '—'}`}</output>
      <Button text="Add a combo box from code" variant="outline" onclick={addFromCode} />
      <output class="cb-made">{() => form.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
