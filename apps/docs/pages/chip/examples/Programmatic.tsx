import { reactive } from '@motifx/core';
import { Chip, Stack } from '@motifx-community/ui';

/** A chip from JSX follows its functions; one made with `new` takes the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ vegan: false });
  const coded = new Chip({ text: 'Spicy', selectable: true });

  return (
    <Stack orientation="horizontal" wrap align="center">
      <Chip text="Vegan" selectable selected={() => s.vegan} onSelectedChanged={(e) => (s.vegan = e.selected)} />
      <span>{() => (s.vegan ? 'Vegan only' : 'Everything')}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
