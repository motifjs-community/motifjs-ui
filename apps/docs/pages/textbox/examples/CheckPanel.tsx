import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, validateFields } from '@motifx-community/ui';

/** Every field inside a panel checked at once, without a group. */
export default function CheckPanel() {
  const s = reactive({ result: '' });
  let panel: Stack | null = null;

  const check = async () => {
    const result = await validateFields(panel!);
    s.result = result.valid ? 'All fields are fine.' : `${result.invalid.length} field(s) to fix.`;
  };

  return (
    <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (panel = c)}>
      <TextBox label="First name" required />
      <TextBox label="Last name" required />
      <Button text="Check the panel" variant="outline" onclick={check} />
      <output>{() => s.result}</output>
    </Stack>
  );
}
