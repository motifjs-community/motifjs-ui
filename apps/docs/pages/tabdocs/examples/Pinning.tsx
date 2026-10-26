import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, Switch, TabDocumentManager, type PinnedTabSize } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** Pinned tabs stay first, in the order they were pinned. Their pin mark unpins them; the menu and Ctrl+K Shift+Enter do too. */
export default function Pinning() {
  const s = reactive({ size: 'normal' as PinnedTabSize, separateRow: false, closeButton: false, keepPinned: true });
  const docs = new TabDocumentManager({
    label: 'Files with pinned tabs',
    pinnedTabSize: () => s.size,
    pinnedTabsOnSeparateRow: () => s.separateRow,
    closeButtonOnPinned: () => s.closeButton,
    keepPinned: () => s.keepPinned,
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES) docs.open(fileDocument(file.path), { index: 99, pinned: file.path === 'README.md' || file.path === 'package.json' });

  const toggle = () => {
    const doc = docs.activeDocument;
    if (doc) (doc.pinned ? docs.unpin(doc) : docs.pin(doc));
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Pinned tab size"
          orientation="horizontal"
          items={[
            { value: 'normal', text: 'Normal' },
            { value: 'compact', text: 'Compact' },
            { value: 'shrink', text: 'Shrink' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.size}
        />
        <Switch label="Row of their own" x-model={() => s.separateRow} />
        <Switch label="Close button" x-model={() => s.closeButton} />
        <Switch label="Close all keeps them" x-model={() => s.keepPinned} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (docs.activeDocument?.pinned ? 'Unpin active' : 'Pin active')} variant="outline" onclick={toggle} />
        <Button text="Close all" variant="outline" onclick={() => docs.closeAll()} />
        <Button text="Open the files again" variant="ghost" onclick={() => FILES.forEach((f) => docs.findDocument(f.path) || docs.open(fileDocument(f.path), { index: 99 }))} />
      </Stack>
      {docs}
    </>
  );
}
