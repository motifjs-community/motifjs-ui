import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocumentManager, type TabKeyPreset, type TabListScope } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Hold Ctrl and press E (Ctrl+Tab in an installed app) for the documents used last: E again walks
 * the list, Shift walks back, letting go of Ctrl opens one. Back and forward go over the documents
 * activated in every group; a closed document opens again where it was.
 */
export default function Recent() {
  const s = reactive({ scope: 'group' as TabListScope, preset: 'auto' as TabKeyPreset });
  const docs = new TabDocumentManager({ label: 'Recently used', recentListScope: () => s.scope, keyPreset: () => s.preset });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });
  docs.split(docs.groups[0], 'right', docs.findDocument('README.md') ?? undefined);
  docs.open(fileDocument('package.json'), { group: docs.groups[1] });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Recent list"
          orientation="horizontal"
          items={[
            { value: 'group', text: 'This group' },
            { value: 'all', text: 'Every group' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.scope}
        />
        <RadioGroup
          label="Keys"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'Auto' },
            { value: 'browser', text: 'Browser tab' },
            { value: 'desktop', text: 'Installed app' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.preset}
        />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Recent list" variant="outline" onclick={() => docs.showRecentList()} />
        <Button text="Back" variant="outline" enabled={() => docs.canGoBack} onclick={() => docs.goBack()} />
        <Button text="Forward" variant="outline" enabled={() => docs.canGoForward} onclick={() => docs.goForward()} />
        <Button text="Reopen closed" variant="outline" enabled={() => docs.closedDocuments.length > 0} onclick={() => docs.reopenClosed()} />
        <output class="td-state">{() => `keys: ${docs.keys.recentNext.join(' or ')}, ${docs.keys.goBack[0]}, ${docs.keys.reopenClosed[0]}`}</output>
      </Stack>
      {docs}
    </>
  );
}
