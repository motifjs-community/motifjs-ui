import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, ValidationGroup } from '@motifx-community/ui';

/** A required choice validated with its group, and read-only and disabled groups that follow state. */
export default function States() {
  const s = reactive({ payment: null as string | null, editable: true, result: '' });
  const group = new ValidationGroup();

  const pay = async () => {
    s.result = (await group.validate()).valid ? 'Paid.' : 'Choose a payment.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup label="Pa&yment" orientation="horizontal" required validationGroup={group} items={['Card', 'Transfer', 'Cash']} x-model={() => s.payment} />
        <Button text="Pay" tone="accent" onclick={pay} />
        <output>{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
        <RadioGroup label="Read-only" readOnly={() => !s.editable} items={['Free', 'Pro']} value="Pro" />
        <RadioGroup label="Disabled" enabled={() => s.editable} items={['Free', 'Pro']} value="Pro" />
      </Stack>
    </>
  );
}
