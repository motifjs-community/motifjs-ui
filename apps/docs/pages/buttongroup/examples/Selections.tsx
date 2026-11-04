import { reactive } from '@motifx/core';
import { ButtonGroup, Stack } from '@motifx-community/ui';

const MARKS = [
  { value: 'bold', text: 'Bold' },
  { value: 'italic', text: 'Italic' },
  { value: 'underline', text: 'Underline' },
];

/** Several on and off (`multiple`), and plain actions (`none`, `onItemClick`). */
export default function Selections() {
  const s = reactive({ marks: ['bold'] as unknown, last: '' });

  return (
    <Stack gap="lg">
      <ButtonGroup label="Text marks" selection="multiple" items={MARKS} x-model={() => s.marks} />
      <span>{() => `Marks: ${(s.marks as string[]).join(', ') || 'none'}`}</span>
      <ButtonGroup label="Clipboard" selection="none" items={['Cut', 'Copy', 'Paste']} onItemClick={(e) => (s.last = String(e.value))} />
      <span>{() => (s.last ? `Pressed: ${s.last}` : 'Nothing pressed yet')}</span>
    </Stack>
  );
}
