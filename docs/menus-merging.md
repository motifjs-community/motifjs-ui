# MenuBar: Merging menus

> MenuBar · @motifx-community/ui 0.1.0-beta.11

A page can have several bars: the app’s bar, and the bars of documents, windows and tabs. The bar of the document in use shows its items in the app’s bar, so the user always finds the commands in one place.

## Merging into the app’s bar

The app’s bar is marked `mergeHost`; a page with several such bars names them with `mergeName` (`'main'` by default). The bar of a document names the app’s bar with `mergeInto`, by name or as the bar itself; the two can be anywhere in the component tree. While it is merged, its items are shown in the app’s bar and it hides itself (`hideWhenMerged`).

`mergeAt` places an item: an index, or `{ before: key }` or `{ after: key }`. A merged item’s action, `onItemClick` and the user’s changes stay with its own bar, and it takes another access key when the app’s bar already uses its letter.

```tsx
import { reactive } from '@motifx/core';
import { MenuBar, Stack, Tab, Tabs, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';

/** The app's bar, and a bar in each document: the bar of the document shown merges into the app's. */
export default function MergedMenus() {
  const s = reactive({ told: 'Nothing yet.' });
  const tell = (e: MenuItemClickEventArgs) => (s.told = `${String(e.item.text).replace('&', '')} in ${(e.source as MenuBar).label}`);

  const app: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },
    { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },
    { key: 'window', text: '&Window', items: [{ key: 'split', text: '&Split' }] },
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
  ];
  const report: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'export', text: 'Export as &PDF', mergeAt: { after: 'open' } }] },
    { key: 'format', text: 'F&ormat', mergeAt: { before: 'window' }, items: [{ key: 'bold', text: '&Bold' }, { key: 'italic', text: '&Italic' }] },
  ];
  const sheet: MenuItem[] = [
    { key: 'edit', text: '&Edit', items: [{ key: 'fill', text: '&Fill down', beginGroup: true }] },
    { key: 'data', text: '&Data', mergeAt: { before: 'window' }, items: [{ key: 'sort', text: '&Sort' }, { key: 'filter', text: 'F&ilter' }] },
    { key: 'window', merge: 'remove', text: 'Window' },
  ];

  return (
    <Stack gap="md">
      <MenuBar label="App" items={app} mergeHost mergeName="docs-demo" onItemClick={tell} />
      <Tabs label="Documents">
        <Tab key="report" title="Report.docx">
          <MenuBar class="mb-merge-report" label="Report" items={report} mergeInto="docs-demo" onItemClick={tell} />
          <p>The report’s own commands are in the app’s bar while this document is shown.</p>
        </Tab>
        <Tab key="sheet" title="Budget.xlsx">
          <MenuBar class="mb-merge-sheet" label="Budget" items={sheet} mergeInto="docs-demo" onItemClick={tell} />
          <p>The budget adds Data, joins Edit and takes Window away.</p>
        </Tab>
      </Tabs>
      <output class="mb-merge-told">{() => s.told}</output>
    </Stack>
  );
}
```

| merge | What the item does in the app’s bar |
| --- | --- |
| `auto` | The default. An item with a menu joins the app’s item with the same key; any other item is added. |
| `add` | Always added beside the app’s items, even when one has the same key. |
| `replace` | Takes the place of the app’s item with the same key. |
| `remove` | Takes the app’s item with the same key away while the bar is merged. |
| `none` | Stays out of the app’s bar. |

## When a bar merges

| mergeWhen | Merged |
| --- | --- |
| `shown` | The default. Merged while the bar’s place (`mergeScope`, its parent by default) is shown: the tab or the document shown. |
| `focus` | Merged while focus is in its place, such as a window that is not modal. |
| `manual` | Merged only by `merge()` and unmerged by `unmerge()`. |

The app’s bar reports the bars that come and go with `onMerged` and `onUnmerged`; `mergedBars`, `mergedInto` and `mergedItems` tell what is merged now. A bar that waits for an app’s bar not yet created merges when it comes.

## Documents of a TabDocumentManager

Each document has a bar in its content; the bar of the active document is the one shown, so its menus are in the app’s bar. A document moved into a browser window of its own is shown there too: its menus stay in the app’s bar of the main window, beside those of the document shown in the main window, until the window closes.

```tsx
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
```

## A window

A window that is not modal stays open while the user works elsewhere, so its bar merges while focus is in it (`mergeWhen: 'focus'`).

```tsx
import type { Component } from '@motifx/core';
import { reactive } from '@motifx/core';
import { Button, MenuBar, MxForm, Stack, TextBox, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';

/** A window with its own bar that merges while focus is in the window (`mergeWhen: 'focus'`). */
export default function MergedWindow() {
  const s = reactive({ told: 'Nothing yet.' });
  const tell = (e: MenuItemClickEventArgs) => (s.told = `${String(e.item.text).replace('&', '')} in ${(e.source as MenuBar).label}`);
  let host: Component<HTMLDivElement> | null = null;
  let form: MxForm | null = null;

  const app: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
  ];
  const notes: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'save', text: '&Save note', mergeAt: { after: 'new' } }] },
    { key: 'insert', text: '&Insert', mergeAt: { before: 'help' }, items: [{ key: 'date', text: '&Date' }, { key: 'list', text: '&List' }] },
  ];

  const open = () => {
    if (form && !form.isDisposed) {
      form.focus();
      return;
    }
    form = new MxForm({
      title: 'Note',
      startPosition: 'manual',
      left: 120,
      top: 160,
      width: '22rem',
      content: (
        <div class="mb-window-note">
          <MenuBar label="Note" items={notes} mergeInto="docs-window" mergeWhen="focus" onItemClick={tell} />
          <TextBox label="Title" />
        </div>
      ),
    });
    form.show(host!);
  };

  return (
    <Stack gap="md" ref={(c: Stack) => (host = c)}>
      <MenuBar label="Desk" items={app} mergeHost mergeName="docs-window" onItemClick={tell} />
      <Button text="Open the note window" variant="outline" onclick={open} />
      <p tabIndex={0} class="mb-window-page">Focus in the window shows its menus in the bar above; click here and they go back.</p>
      <output class="mb-window-told">{() => s.told}</output>
    </Stack>
  );
}
```

## Feedback

Loading issues…
