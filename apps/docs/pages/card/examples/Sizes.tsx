import { Card, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The space in and between the parts, per size. */
export default function Sizes() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      {SIZES.map((size) => (
        <Card key={size} size={size} title={`Size ${size}`} subtitle="Grace Hopper" avatar={{ name: 'Grace Hopper' }} style="inline-size: 15rem">
          Content of the card.
        </Card>
      ))}
    </Stack>
  );
}
