import { reactive } from '@motifx/core';
import { Button, Stack, TagBox, ValidationGroup } from '@motifx-community/ui';
import { skills } from './skills';

/** A required tag box checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ reviewers: [] as string[], result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a reviewer.';
  };

  return (
    <>
      <TagBox label="Reviewers" items={skills} required validationGroup={group} x-model={() => s.reviewers} />
      <TagBox label="Read-only" items={skills} value={['Go', 'Rust']} readOnly />
      <TagBox label="Disabled" items={skills} value={['Go', 'Rust']} enabled={false} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Check" variant="outline" onclick={check} />
        <output class="tg-check">{() => s.result}</output>
      </Stack>
    </>
  );
}
