import { reactive } from '@motifx/core';
import { Button, MenuBar, Stack, Switch, TabDocument, TabDocumentManager, TextBox, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';

/**
 * Documents of a TabDocumentManager, each with its own bar: the menus of the active document are shown in the app's
 * bar, also while the document is in a browser window of its own. The switch merges a bar only while focus is in its
 * document.
 */
export default function MergedDocuments() {
  const s = reactive({ told: 'Nothing yet.', focus: false });
  const tell = (e: MenuItemClickEventArgs) => (s.told = `${String(e.item.text).replace('&', '')} in ${(e.source as MenuBar).label}`);

  const app: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }, { key: 'close', text: '&Close', beginGroup: true }] },
    { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }] },
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
  ];
  const documentOf = (title: string, items: MenuItem[], text: string) => () => (
    <div class="mb-doc">
      <MenuBar label={title} items={items} mergeInto="docs-documents" mergeWhen={() => (s.focus ? 'focus' : 'shown')} onItemClick={tell} />
      <p>{text}</p>
      <TextBox label={`${title} notes`} />
    </div>
  );

  const docs = new TabDocumentManager({ label: 'Documents with menus' });
  docs.element.style.cssText = 'block-size: 18rem; inline-size: 100%';
  docs.open(
    new TabDocument({
      id: 'letter',
      title: 'Letter',
      content: documentOf('Letter', [{ key: 'format', text: 'F&ormat', mergeAt: { before: 'help' }, items: [{ key: 'bold', text: '&Bold' }, { key: 'italic', text: '&Italic' }] }], 'The letter adds Format.'),
    }),
  );
  docs.open(
    new TabDocument({
      id: 'photo',
      title: 'Photo',
      content: documentOf(
        'Photo',
        [
          { key: 'image', text: '&Image', mergeAt: { before: 'help' }, items: [{ key: 'crop', text: '&Crop' }, { key: 'rotate', text: '&Rotate' }] },
          { key: 'view', text: '&View', items: [{ key: 'actual', text: '&Actual size' }] },
        ],
        'The photo adds Image and joins View.',
      ),
    }),
  );

  return (
    <>
      <MenuBar label="Studio" items={app} mergeHost mergeName="docs-documents" onItemClick={tell} />
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Merge only while focus is in the document" x-model={() => s.focus} />
        <Button
          text="Move the active document into a new window"
          variant="outline"
          enabled={() => !!docs.activeDocument && !docs.activeDocument.browserWindow}
          onclick={() => docs.moveToNewWindow(docs.activeDocument!)}
        />
        <Button text="Bring it back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />
      </Stack>
      {docs}
      <output class="mb-docs-told">{() => s.told}</output>
    </>
  );
}
