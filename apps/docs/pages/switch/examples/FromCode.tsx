import { reactive } from '@motifx/core';
import { Button, Stack, Switch } from '@motifx-community/ui';

/** A switch bound to state with x-model, and switches created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ wifi: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const sw = new Switch({ label: `Feature ${++added}`, onText: 'On', offText: 'Off' });
    sw.onValueChanged((e) => (s.result = `${sw.label}: ${e.value ? 'on' : 'off'}`));
    host?.controls.add(sw);
    sw.focus();
  };

  return (
    <>
      <Switch label="&Wi-Fi" x-model={() => s.wifi} helpText={() => (s.wifi ? 'Connected to Home.' : 'Not connected.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a switch from code" variant="outline" onclick={addFromCode} />
        <output class="sw-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
