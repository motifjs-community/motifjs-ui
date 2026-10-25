import { reactive } from '@motifx/core';
import { Button, ListBox, Stack, ValidationGroup } from '@motifx-community/ui';
import { cities } from './cities';

/** A required list checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ sizes: [] as string[], result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a size.';
  };

  return (
    <>
      <ListBox
        label="Sizes"
        items={['S', 'M', 'L', 'XL']}
        selectionMode="multiple"
        required
        helpText="Pick one or more."
        validationGroup={group}
        x-model={() => s.sizes}
      />
      <ListBox label="Read-only" items={cities} value="Bursa" readOnly height={4} />
      <ListBox label="Disabled" items={cities} value="Bursa" enabled={false} height={4} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Check" variant="outline" onclick={check} />
        <output class="lb-check">{() => s.result}</output>
      </Stack>
    </>
  );
}
