import { reactive } from '@motifx/core';
import { Button, Stack, Switch, type SwitchStateText } from '@motifx-community/ui';

const PLACES: SwitchStateText[] = ['inside', 'beside', 'none'];

/** An on / off text in the track, next to it, or not shown. */
export default function StateText() {
  const s = reactive({ place: 'inside' as SwitchStateText, sync: false, dark: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Text position">
        {PLACES.map((place) => (
          <Button
            key={place}
            text={place}
            size="sm"
            variant={() => (s.place === place ? 'solid' : 'ghost')}
            aria-pressed={() => s.place === place}
            onclick={() => (s.place = place)}
          />
        ))}
      </Stack>
      <Switch label="&Sync" class="sw-sync" onText="On" offText="Off" showStateText={() => s.place} x-model={() => s.sync} />
      <Switch label="Dark mode" onText="Dark" offText="Light" showStateText={() => s.place} x-model={() => s.dark} />
    </>
  );
}
