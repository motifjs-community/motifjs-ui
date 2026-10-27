import { reactive } from '@motifx/core';
import { Button, ListBox, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Choosing a file opens it as a preview (in italics): the next one chosen takes its place. A double
 * click on the tab, an edit, "Keep open" or moving it makes it stay.
 */
export default function Preview() {
  const s = reactive({ previewTabs: true, kept: [] as string[] });
  // Narrow beside its log, it still shows as on a desktop (see the Tablet and phone page).
  const docs = new TabDocumentManager({ label: 'Files in preview', previewTabs: () => s.previewTabs, presentation: 'desktop' });
  docs.element.style.cssText = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';
  docs.onKept((e) => s.kept.unshift(e.document.title));

  const show = (path: string | null) => {
    if (path) docs.open(docs.findDocument(path) ?? fileDocument(path), { preview: true });
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Preview tabs" x-model={() => s.previewTabs} />
        <Button text="Keep open" variant="outline" enabled={() => !!docs.activeDocument?.preview} onclick={() => docs.keep(docs.activeDocument!)} />
        <output class="td-state">{() => `preview: ${docs.activeGroup?.previewDocument?.title ?? 'none'}; kept: ${s.kept.join(', ') || 'none'}`}</output>
      </Stack>
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">
        <ListBox
          label="Files"
          items={FILES}
          textField="path"
          valueField="path"
          height="28rem"
          style="inline-size: 14rem; flex: none"
          onValueChanged={(e) => show(e.value as string | null)}
        />
        {docs}
      </div>
    </>
  );
}
