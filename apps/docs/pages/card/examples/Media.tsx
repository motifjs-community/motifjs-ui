import { Button, Card, Stack } from '@motifx-community/ui';
import { PICTURE } from './picture';

/** A picture above the rest, or at its start (`horizontal`); it runs to the card's edges and takes its corners. */
export default function Media() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      <Card media={PICTURE} mediaAlt="A sunset over a field" title="Sunset" subtitle="Above the rest" style="inline-size: 16rem">
        The picture runs to the edges.
      </Card>
      <Card
        media={PICTURE}
        orientation="horizontal"
        title="Sunset"
        subtitle="At the start"
        footer={<Button text="Save" variant="outline" />}
        style="inline-size: 24rem"
      >
        As tall as the card.
      </Card>
    </Stack>
  );
}
