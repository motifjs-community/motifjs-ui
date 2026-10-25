import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack, ValidationGroup } from '@motifx-community/ui';

/** Boxes that must be checked, checked with their group; the first one left unchecked gets focus. */
export default function Required() {
  const s = reactive({ terms: false, privacy: false, result: '' });
  const group = new ValidationGroup();

  const signUp = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Signed up.' : `${result.invalid.length} box(es) to check.`;
  };

  return (
    <>
      <CheckBox label="I accept the &terms" required validationGroup={group} x-model={() => s.terms} />
      <CheckBox label="I read the privacy notice" required validationGroup={group} x-model={() => s.privacy} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Sign up" tone="accent" onclick={signUp} />
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
        <output class="cb-save">{() => s.result}</output>
      </Stack>
    </>
  );
}
