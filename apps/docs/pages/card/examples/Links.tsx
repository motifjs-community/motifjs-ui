import { reactive } from '@motifx/core';
import { Button, Card, Stack } from '@motifx-community/ui';

const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];

/**
 * A link card: its title is the link, and a click anywhere on the card follows it (`rel="router"` hands it to the router).
 * Its own button stays a button. A selectable card toggles with a click or with its check box.
 */
export default function Links() {
  const s = reactive({ picked: [] as string[] });
  const toggle = (place: string, on: boolean) => {
    s.picked = on ? [...s.picked, place] : s.picked.filter((p) => p !== place);
  };

  return (
    <Stack gap="lg">
      <Stack orientation="horizontal" wrap align="start">
        <Card title="Tokens" subtitle="A link to the tokens page" href="/tokens" rel="router" footer={<Button text="Later" variant="ghost" />} style="inline-size: 14rem" />
        <Card title="Keyboard" subtitle="A link to the keyboard page" href="/keyboard" rel="router" style="inline-size: 14rem" />
      </Stack>
      <Stack orientation="horizontal" wrap align="start">
        {PLACES.map((place) => (
          <Card
            key={place}
            title={place}
            subtitle="Press to pick"
            selectable
            selected={() => s.picked.includes(place)}
            onSelectedChanged={(e) => e.byUser && toggle(place, e.selected)}
            style="inline-size: 12rem"
          />
        ))}
      </Stack>
      <span>{() => `Picked: ${s.picked.join(', ') || 'none'}`}</span>
    </Stack>
  );
}
