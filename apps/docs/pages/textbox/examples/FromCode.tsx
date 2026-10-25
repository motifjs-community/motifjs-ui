import { reactive } from '@motifx/core';
import { Button, Stack, TextBox } from '@motifx-community/ui';

/** A field bound to state with x-model, and fields created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ name: 'Ada', result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const box = new TextBox({ label: `Field ${++added}`, clearButton: true, placeholder: 'Created with new' });
    box.onValueChanged((e) => (form.result = `${box.label}: ${e.value}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <TextBox label="&Name" x-model={() => form.name} clearButton helpText={() => `Hello, ${form.name || 'stranger'}.`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
        <output class="tb-result">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
