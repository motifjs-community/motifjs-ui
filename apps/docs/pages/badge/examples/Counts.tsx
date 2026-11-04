import { reactive } from '@motifx/core';
import { Badge, NumberBox, Stack, Switch } from '@motifx-community/ui';

/** A count up to `max` and `max+` beyond it; at 0 it hides unless `showZero`; a dot says only that there is something. */
export default function Counts() {
  const s = reactive({ count: 120, max: 99, showZero: false });

  return (
    <>
      <NumberBox label="Count" min={0} x-model={() => s.count} />
      <NumberBox label="Max" min={1} x-model={() => s.max} />
      <Switch label="Show zero" x-model={() => s.showZero} />
      <Stack orientation="horizontal" align="center">
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} />
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} variant="subtle" />
        <Badge count={() => s.count} dot label="Something new" />
      </Stack>
    </>
  );
}
