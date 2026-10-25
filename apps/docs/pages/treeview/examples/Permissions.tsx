import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

const PERMISSIONS = (): Entry[] => [
  {
    id: 'admin',
    text: 'Administration',
    expanded: true,
    children: [
      { id: 'users', text: 'Users', children: [{ id: 'users.view', text: 'View' }, { id: 'users.edit', text: 'Edit' }, { id: 'users.delete', text: 'Delete' }] },
      { id: 'roles', text: 'Roles', children: [{ id: 'roles.view', text: 'View' }, { id: 'roles.edit', text: 'Edit' }] },
    ],
  },
  {
    id: 'content',
    text: 'Content',
    expanded: true,
    children: [
      { id: 'articles', text: 'Articles', children: [{ id: 'articles.read', text: 'Read' }, { id: 'articles.write', text: 'Write' }, { id: 'articles.publish', text: 'Publish' }] },
      { id: 'media', text: 'Media', children: [{ id: 'media.upload', text: 'Upload' }, { id: 'media.delete', text: 'Delete' }] },
    ],
  },
  { id: 'billing', text: 'Billing', children: [{ id: 'invoices', text: 'Invoices' }, { id: 'cards', text: 'Payment methods', enabled: false }] },
];

/** A permissions tree with check boxes that add up to their parents, the checked keys bound both ways. */
export default function Permissions() {
  const s = reactive({ checked: ['users.view', 'articles.read'] as unknown[], recursive: true });
  let tree!: TreeView<Entry>;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Recursive" size="sm" variant="outline" toggle x-model={() => s.recursive} />
        <Button text="Check all" size="sm" variant="ghost" onclick={() => tree.checkAll()} />
        <Button text="Uncheck all" size="sm" variant="ghost" onclick={() => tree.uncheckAll()} />
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          ref={(t: TreeView<Entry>) => (tree = t)}
          class="tv-checks"
          label="Permissions"
          items={PERMISSIONS()}
          showCheckBoxes
          selectionMode="none"
          checkRecursive={() => s.recursive}
          checkedKeys={() => s.checked}
          onCheckChanged={(e) => (s.checked = e.keys)}
        />
      </Panel>
      <output class="tv-checked">{() => `checkedKeys: ${JSON.stringify(s.checked)}`}</output>
    </>
  );
}
