import { Badge, Button, Stack, type BadgePosition } from '@motifx-community/ui';

const CORNERS: BadgePosition[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start'];

/** On a corner of what it is in: `position` inside a button, or `Badge.attach` on any component (here a `<span>`). */
export default function OnCorner() {
  return (
    <Stack orientation="horizontal" wrap align="center" gap="xl">
      {CORNERS.map((corner) => (
        <Button key={corner} text={corner} variant="outline">
          <Badge count={7} position={corner} />
        </Button>
      ))}
      <span ref={(bell) => Badge.attach(bell, { dot: true, tone: 'danger', label: 'New notifications' })}>Notifications</span>
    </Stack>
  );
}
