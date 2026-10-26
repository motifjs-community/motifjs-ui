import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument, type TabRestoreWindows } from '@motifx-community/ui';
import { notes, ordersGrid } from './contents';

/** Makes a saved document again by its type. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid(40) });
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/**
 * The layout saves its new windows too (place on the screen, layout). Loading puts them back as
 * floating windows, among the documents, or as windows again: a browser opens windows only on a
 * click, so the restore button, a click, may open them, and "Reopen windows" opens what was blocked.
 */
export default function WindowLayout() {
  const s = reactive({ json: '', saved: null as TabLayout | null, mode: 'float' as TabRestoreWindows });
  const docs = new TabDocumentManager({ label: 'Saved layout with new windows', restoreWindows: () => s.mode });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders' }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));

  const save = () => {
    s.saved = docs.saveLayout();
    s.json = JSON.stringify(s.saved, null, 2);
  };
  save();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move To do into a new window" variant="outline" onclick={() => docs.moveToNewWindow(docs.findDocument('todo')!)} />
        <Button text="Save layout" variant="outline" onclick={save} />
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={() => s.saved && docs.loadLayout(s.saved, restore)} />
        <Button text="Reopen windows" variant="outline" onclick={() => docs.reopenWindows()} />
      </Stack>
      <RadioGroup
        label="Saved windows come back"
        orientation="horizontal"
        items={[
          { value: 'float', text: 'As floating windows' },
          { value: 'reopen', text: 'As windows again' },
          { value: 'main', text: 'In this window' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.mode}
      />
      {docs}
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
