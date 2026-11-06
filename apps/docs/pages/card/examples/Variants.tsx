import { Button, Card, Stack, type CardVariant } from '@motifx-community/ui';

const VARIANTS: CardVariant[] = ['elevated', 'filled', 'outline'];

/** Each appearance with a header, content and actions. */
export default function Variants() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      {VARIANTS.map((variant) => (
        <Card
          key={variant}
          variant={variant}
          title={variant}
          subtitle="A card of this look"
          footer={
            <Stack orientation="horizontal" gap="sm">
              <Button text="Cancel" variant="ghost" />
              <Button text="Open" />
            </Stack>
          }
          style="inline-size: 16rem"
        >
          The same header, content and actions in each look.
        </Card>
      ))}
    </Stack>
  );
}
