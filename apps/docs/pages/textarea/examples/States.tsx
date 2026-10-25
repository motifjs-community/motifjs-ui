import { reactive } from '@motifx/core';
import { Button, TextArea } from '@motifx-community/ui';

const TERMS = 'Line one of the terms.\nLine two of the terms.';

/** Read-only and disabled, both following state, and a required field. */
export default function States() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />
      <TextArea label="Terms" readOnly={() => !s.editing} value={TERMS} rows={2} />
      <TextArea label="Reason" required enabled={() => s.editing} rows={2} />
    </>
  );
}
