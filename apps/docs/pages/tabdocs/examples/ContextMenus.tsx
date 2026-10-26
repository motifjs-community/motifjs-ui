import { reactive } from '@motifx/core';
import { Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument, source } from './files';

/**
 * Right-click a tab (or press Shift+F10 on it) for its menu, and the empty strip for the group's.
 * `onContextMenuOpening` adds an item for files; a double click on the empty strip makes a new file.
 */
export default function ContextMenus() {
  const s = reactive({ menus: true, copy: true, split: true, made: 0, said: '' });
  const docs = new TabDocumentManager({
    label: 'Files with menus',
    contextMenu: () => s.menus,
    menuItems: () => ({ copyTitle: s.copy, splitUp: s.split, splitDown: s.split, splitLeft: s.split, splitRight: s.split }),
    newDocument: () => {
      const n = ++s.made;
      return { id: `untitled-${n}`, title: `Untitled-${n}`, content: () => source('') };
    },
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.onContextMenuOpening((e) => {
    const doc = e.document;
    if (doc?.type !== 'file') return;
    e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.said = String(doc.id)) });
  });
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Context menus" x-model={() => s.menus} />
        <Switch label="Copy the title" x-model={() => s.copy} />
        <Switch label="Split items" x-model={() => s.split} />
        <output class="td-state">{() => (s.said ? `path: ${s.said}` : 'Right-click a tab, or the strip after the tabs')}</output>
      </Stack>
      {docs}
    </>
  );
}
