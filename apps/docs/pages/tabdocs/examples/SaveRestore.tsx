import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';
import { notes, ordersGrid } from './contents';

/** Recreates a saved document by its type, with its `state` providing what it needs. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid((saved.state as { count: number }).count) });
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/** The layout as JSON: change it (split, move, resize, close), save, change it again, restore. */
export default function SaveRestore() {
  const s = reactive({ json: '', saved: null as TabLayout | null });
  const docs = new TabDocumentManager({ label: 'Saved layout' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders', state: { count: 40 } }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));
  docs.split(docs.groups[0], 'down', docs.findDocument('todo')!);

  const save = () => {
    s.saved = docs.saveLayout();
    s.json = JSON.stringify(s.saved, null, 2);
  };
  const load = () => {
    if (s.saved) docs.loadLayout(s.saved, restore);
  };
  save();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save layout" variant="outline" onclick={save} />
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />
      </Stack>
      {docs}
      <pre class="td-json" tabindex="0" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
