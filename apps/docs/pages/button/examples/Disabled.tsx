import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A disabled button leaves the Tab order; with focusableWhenDisabled it keeps its place. */
export default function Disabled() {
  const s = reactive({ enabled: false });
  return (
    <>
      <Button text="Toggle enabled" variant="outline" onclick={() => (s.enabled = !s.enabled)} />
      <Button text="Plain" enabled={() => s.enabled} />
      <Button text="Focusable" enabled={() => s.enabled} focusableWhenDisabled hint="Fill in the form first" />
    </>
  );
}
