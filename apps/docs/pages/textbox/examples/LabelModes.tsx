import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, type FieldLabelMode } from '@motifx-community/ui';

const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];

/** The label above the box, next to it, floating inside it, or only for screen readers. */
export default function LabelModes() {
  const s = reactive({ email: '', labelMode: 'top' as FieldLabelMode });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Label mode">
        {MODES.map((mode) => (
          <Button
            key={mode}
            text={mode}
            size="sm"
            variant={() => (s.labelMode === mode ? 'solid' : 'ghost')}
            aria-pressed={() => s.labelMode === mode}
            onclick={() => (s.labelMode = mode)}
          />
        ))}
      </Stack>
      <TextBox label="&Email" labelMode={() => s.labelMode} type="email" x-model={() => s.email} helpText="We never share it." />
    </>
  );
}
