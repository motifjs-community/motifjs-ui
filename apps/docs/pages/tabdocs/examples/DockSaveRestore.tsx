import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';
import { notes } from './contents';
import { fileDocument } from './files';
import { output, problems, toolDocument } from './tools';

/** Makes a saved document again by its type. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'file') return fileDocument(saved.id);
  if (saved.type === 'tool') return toolDocument(saved.id, saved.title, saved.id === 'output' ? output : problems);
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/** The whole layout as JSON: the documents, the dock areas (size, order, folded) and the floating windows (place, order, inside). */
export default function DockSaveRestore() {
  const s = reactive({ json: '', saved: null as TabLayout | null });
  const docs = new TabDocumentManager({ label: 'Saved layout with windows and areas', dockGuides: true });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'src/app.ts', type: 'file', title: 'app.ts' }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.dock(restore({ id: 'problems', type: 'tool', title: 'Problems' }), 'bottom', 140);
  docs.dock(restore({ id: 'output', type: 'tool', title: 'Output' }), 'right', '30%');

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
        <Button text="Float Notes" variant="outline" onclick={() => docs.float(docs.findDocument('notes')!, { x: 120, y: 140, width: 380, height: 260 })} />
      </Stack>
      {docs}
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
