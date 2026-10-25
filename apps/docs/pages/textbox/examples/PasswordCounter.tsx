import { reactive } from '@motifx/core';
import { Stack, TextBox } from '@motifx-community/ui';

/** A password that can be shown, and a field that counts its characters; a password sits in a form. */
export default function PasswordCounter() {
  const s = reactive({ password: '', note: '' });
  return (
    <form onsubmit={(e: SubmitEvent) => e.preventDefault()}>
      <Stack>
        <TextBox label="Password" type="password" x-model={() => s.password} autocomplete="new-password" />
        <TextBox label="Note" maxLength={40} showCounter x-model={() => s.note} />
      </Stack>
    </form>
  );
}
