import { reactive } from '@motifx/core';
import { Button, TextBox } from '@motifx-community/ui';

/** Read-only and disabled, both following state. */
export default function ReadOnly() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />
      <TextBox label="Read-only" value="#1042" readOnly={() => !s.editing} clearButton />
      <TextBox label="Disabled" value="#1042" enabled={() => s.editing} />
    </>
  );
}
