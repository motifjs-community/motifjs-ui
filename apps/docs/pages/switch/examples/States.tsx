import { reactive } from '@motifx/core';
import { Button, Stack, Switch, ValidationGroup } from '@motifx-community/ui';

/** A switch that must be on, checked with its group, and read-only and disabled ones following state. */
export default function States() {
  const s = reactive({ terms: false, editable: true, result: '' });
  const group = new ValidationGroup();

  const next = async () => {
    s.result = (await group.validate()).valid ? 'Thanks.' : 'Please agree first.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="I &agree to the terms" required validationGroup={group} x-model={() => s.terms} />
        <Button text="Continue" tone="accent" onclick={next} />
        <output>{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
        <Switch label="Read-only" readOnly={() => !s.editable} value={true} />
        <Switch label="Disabled on" enabled={() => s.editable} value={true} />
        <Switch label="Disabled off" enabled={() => s.editable} />
      </Stack>
    </>
  );
}
