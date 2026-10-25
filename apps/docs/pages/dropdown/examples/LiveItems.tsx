import { reactive } from '@motifx/core';
import { Button, DropDown } from '@motifx-community/ui';

/** Items given as a function of a reactive array: an item pushed into it shows at once. */
export default function LiveItems() {
  const model = reactive({ statuses: ['Draft', 'Review'], status: 'Draft' as string | null });
  return (
    <>
      <DropDown label="Status" items={() => model.statuses} x-model={() => model.status} />
      <Button
        text="Add “Published”"
        variant="outline"
        enabled={() => !model.statuses.includes('Published')}
        onclick={() => model.statuses.push('Published')}
      />
    </>
  );
}
