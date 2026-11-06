import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup } from '@motifx-community/ui';

/** Simulates a server call: "ada" is taken. */
const isFree = (value: string) =>
  new Promise<boolean | string>((done) => setTimeout(() => done(value.toLowerCase() === 'ada' ? `“${value}” is taken.` : true), 600));

/** Built-in rules, custom rules including an async one, an external error, and a group validated on Save. */
export default function Validation() {
  const s = reactive({ user: '', serverError: '' as string | null, result: '' });
  const group = new ValidationGroup();

  const save = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Saved.' : `${result.invalid.length} field(s) to fix.`;
  };

  return (
    <>
      <TextBox label="Email" type="email" required validationGroup={group} />
      <TextBox
        label="User name"
        required
        helpText="Try “ada”: the server says it is taken."
        x-model={() => s.user}
        rules={[
          { type: 'length', min: 3 },
          { type: 'pattern', pattern: '[a-z0-9_]+', message: 'Lower case letters, digits and _ only.' },
          { type: 'custom', check: isFree },
        ]}
        validationGroup={group}
      />
      <TextBox label="Code" error={() => s.serverError} validationGroup={group} helpText="An error from outside shows until cleared." />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save" tone="accent" onclick={save} />
        <Button text="Server error" variant="outline" onclick={() => (s.serverError = s.serverError ? null : 'This code expired.')} />
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
        <output class="tb-save">{() => s.result}</output>
      </Stack>
    </>
  );
}
