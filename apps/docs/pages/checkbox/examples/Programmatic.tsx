import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack } from '@motifx-community/ui';

/** A checkbox bound to state with x-model, and checkboxes created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ remember: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const box = new CheckBox({ label: `Option ${++added}`, threeState: true });
    box.onValueChanged((e) => (s.result = `${box.label}: ${String(e.value)}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <CheckBox label="&Remember me" x-model={() => s.remember} helpText={() => (s.remember ? 'You stay signed in.' : 'You sign in every time.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a checkbox programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="cb-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
