import { reactive } from '@motifx/core';
import { Button, Stack, TextArea, type TextAreaResize } from '@motifx-community/ui';

const RESIZES: TextAreaResize[] = ['none', 'vertical', 'both'];

/** Which way the user can drag the box bigger. */
export default function Resize() {
  const s = reactive({ resize: 'vertical' as TextAreaResize });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Resize">
        {RESIZES.map((resize) => (
          <Button
            key={resize}
            text={resize}
            size="sm"
            variant={() => (s.resize === resize ? 'solid' : 'ghost')}
            aria-pressed={() => s.resize === resize}
            onclick={() => (s.resize = resize)}
          />
        ))}
      </Stack>
      <TextArea label="Notes" resize={() => s.resize} rows={4} />
    </>
  );
}
