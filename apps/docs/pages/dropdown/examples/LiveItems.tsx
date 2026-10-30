import { reactive } from '@motifx/core';
import { Button, DropDown } from '@motifx-community/ui';

/** Items changed in place: the drop-down reads them again on `refresh()`. */
export default function LiveItems() {
  const model = reactive({ statuses: ['Draft', 'Review'], status: 'Draft' as string | null });
  let field!: DropDown<string, string>;
  const add = () => {
    model.statuses.push('Published');
    field.refresh();
  };
  return (
    <>
      <DropDown ref={(d: DropDown<string, string>) => (field = d)} label="Status" items={() => model.statuses} x-model={() => model.status} />
      <Button text="Add “Published”" variant="outline" enabled={() => !model.statuses.includes('Published')} onclick={add} />
    </>
  );
}
