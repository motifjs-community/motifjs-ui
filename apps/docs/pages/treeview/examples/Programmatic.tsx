import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { project } from './project';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A tree bound with x-model, and a tree made with `new` whose items change in place and are read again on `refresh()`. */
export default function Programmatic() {
  const s = reactive({ file: 'tree' as unknown, clicked: '' });
  const menu = reactive<Entry[]>([
    { id: 'home', text: 'Home' },
    { id: 'products', text: 'Products', children: [{ id: 'new', text: 'New' }] },
  ]);
  let added = 0;

  const tree = new TreeView<Entry>({ items: menu, label: 'Menu', selectionMode: 'none' });
  tree.onItemClick((e) => (s.clicked = `Pressed “${e.item.text}”.`));

  const addProduct = () => {
    added++;
    menu[1].children!.push({ id: `p${added}`, text: `Product ${added}` });
    tree.refresh();
    tree.expand('products');
  };

  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-ways" label="Project files" items={project()} expandedKeys={['src', 'components']} x-model={() => s.file} />
      </Panel>
      <output class="tv-value">{() => `value: ${JSON.stringify(s.file)}`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a product programmatically" variant="outline" onclick={addProduct} />
        <Button text="Expand all" variant="ghost" onclick={() => tree.expandAll()} />
        <Button text="Collapse all" variant="ghost" onclick={() => tree.collapseAll()} />
        <output class="tv-clicked">{() => s.clicked}</output>
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(tree)} />
    </>
  );
}
