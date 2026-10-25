import { reactive } from '@motifx/core';
import { Button, CheckBox } from '@motifx-community/ui';

/** Read-only and disabled, both following state. */
export default function ReadOnly() {
  const s = reactive({ editable: true, paid: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
      <CheckBox label="Read-only" readOnly={() => !s.editable} x-model={() => s.paid} />
      <CheckBox label="Disabled" enabled={() => s.editable} x-model={() => s.paid} />
      <CheckBox label="Disabled, unchecked" enabled={() => s.editable} value={false} />
    </>
  );
}
