import { reactive } from '@motifx/core';
import { RadioGroup, Stack, TabDocumentManager, type TabListScope } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

const FormatIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 4h10M3 8h6M3 12h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
  </svg>
);

const RunIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5 3.5v9l7-4.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/**
 * The "…" button lists the group's documents to search and open, with close all, close saved and
 * lock under them. The app adds its own buttons: "Run" for every group, "Format" while a file of code is active.
 */
export default function OpenList() {
  const s = reactive({ scope: 'group' as TabListScope, runs: 0, formatted: '' });
  const docs = new TabDocumentManager({
    label: 'Open documents',
    openListScope: () => s.scope,
    toolbarItems: (group) => [{ icon: () => <RunIcon />, hint: () => `Run group ${group.index + 1}`, tone: 'accent', click: () => s.runs++ }],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES) {
    const code = file.path.endsWith('.ts');
    const doc = fileDocument(file.path, code ? { actions: [{ icon: () => <FormatIcon />, hint: 'Format', click: () => (s.formatted = file.path) }] } : {});
    docs.open(doc, { index: 99, group: file.path.startsWith('src/') ? docs.groups[0] : (docs.groups[1] ?? docs.split(docs.groups[0], 'right')!) });
  }
  docs.findDocument('src/app.ts')!.dirty = true;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="The list shows"
          orientation="horizontal"
          items={[
            { value: 'group', text: "The group's documents" },
            { value: 'all', text: 'Every group' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.scope}
        />
        <output class="td-state">{() => `runs: ${s.runs}${s.formatted ? `; formatted ${s.formatted}` : ''}`}</output>
      </Stack>
      {docs}
    </>
  );
}
