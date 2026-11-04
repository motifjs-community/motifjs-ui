import { reactive } from '@motifx/core';
import { Card, Stack } from '@motifx-community/ui';

const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];

/** The whole card can be pressed: with the mouse, Enter or Space. */
export default function Clickable() {
  const s = reactive({ chosen: '' });

  return (
    <Stack gap="lg">
      <Stack orientation="horizontal" wrap align="start">
        {PLACES.map((place) => (
          <Card key={place} title={place} subtitle="Press to choose" clickable onclick={() => (s.chosen = place)} style="inline-size: 12rem" />
        ))}
      </Stack>
      <span>{() => (s.chosen ? `Chosen: ${s.chosen}` : 'Nothing chosen yet')}</span>
    </Stack>
  );
}
