import { reactive } from '@motifx/core';
import { Button, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

const START: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'paste', text: '&Paste' }] },
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
];

/** Items added, removed, moved and changed by path; the list given is never changed. */
export default function MenuChanges() {
  const s = reactive({ changes: 0 });
  let bar!: MenuBar;

  return (
    <Stack gap="md">
      <MenuBar ref={(b: MenuBar) => (bar = b)} class="mb-changes" label="Changes" items={START} onItemsChanged={() => s.changes++} />
      <Stack orientation="horizontal" gap="sm" wrap>
        <Button text="Add Print to File" variant="outline" onclick={() => bar.addItem('file', { key: 'print', text: '&Print', shortcut: 'Ctrl+P' })} />
        <Button text="Turn Save off" variant="outline" onclick={() => bar.updateItem('file/save', { enabled: false })} />
        <Button text="Move Paste to File" variant="outline" onclick={() => bar.moveItem('edit/paste', 0, 'file')} />
        <Button text="Move Help first" variant="outline" onclick={() => bar.moveItem('help', 0)} />
        <Button text="Remove Edit" variant="outline" onclick={() => bar.removeItem('edit')} />
        <Button text="Start again" variant="outline" onclick={() => (bar.items = START)} />
      </Stack>
      <output class="mb-changes-told">{() => `${s.changes} changes`}</output>
    </Stack>
  );
}
