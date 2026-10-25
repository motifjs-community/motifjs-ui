import { reactive } from '@motifx/core';
import { Button, DropDown, ValidationGroup } from '@motifx-community/ui';
import { cities } from './cities';

/** A required drop-down checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ priority: 'normal' as string | null, result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a priority.';
  };

  return (
    <>
      <DropDown label="Priority" items={['low', 'normal', 'high']} required clearButton validationGroup={group} x-model={() => s.priority} />
      <DropDown label="Read-only" items={cities} value="Bursa" readOnly />
      <DropDown label="Disabled" items={cities} value="Bursa" enabled={false} />
      <Button text="Check" variant="outline" onclick={check} />
      <output class="dd-check">{() => s.result}</output>
    </>
  );
}
