import { reactive } from '@motifx/core';
import { Button, Stack } from '@motifx-community/ui';

/** Removing the row that holds focus moves focus to the next row, not to `<body>`. */
export default function FocusGuard() {
  const s = reactive({ items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });
  return (
    <>
      {s.items.map((item) => (
        <Stack key={item.id} orientation="horizontal" wrap align="center">
          <span>Row {item.id}</span>
          <Button text={`Remove row ${item.id}`} onclick={() => s.items.splice(s.items.indexOf(item), 1)} />
        </Stack>
      ))}
    </>
  );
}
