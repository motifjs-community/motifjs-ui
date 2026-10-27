import { reactive } from '@motifx/core';
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';

/** An action sheet in JSX, bound with x-model, with checked items and its own cancel text; onItemClick reports the choice. */
export default function InJsx() {
  const s = reactive({ open: false, sort: 'date', said: '' });

  const sortItem = (value: string, text: string): MenuItem => ({
    text,
    group: 'sort',
    checked: () => s.sort === value,
    click: () => (s.sort = value),
  });

  return (
    <>
      <Button text={() => `Sort by: ${s.sort}`} variant="outline" onclick={() => (s.open = true)} />
      <output>{() => s.said}</output>
      <ActionSheet
        title="Sort by"
        cancelText="Keep as it is"
        items={[sortItem('date', 'Date'), sortItem('name', 'Name'), sortItem('size', 'Size')]}
        x-model={() => s.open}
        onItemClick={(e) => (s.said = `Sorted by ${String(e.item.text).toLowerCase()}.`)}
      />
    </>
  );
}
