import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocumentManager, type TabPresentation } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * One layout shown four ways: two groups (the second split again), the explorer and the outline on
 * the left, problems and output at the bottom, a floating window. Pick a presentation: the layout
 * stays the same (Save shows its JSON does not change), only where things show changes.
 */
export default function Presentations() {
  const s = reactive({ presentation: 'tablet' as TabPresentation, shown: '', saved: '' });
  const docs = new TabDocumentManager({ label: 'Editor shown as on a desktop, a tablet or a phone', presentation: () => s.presentation, minGroupWidth: 120 });
  docs.element.style.cssText = 'block-size: 32rem; inline-size: 100%; max-inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right', docs.findDocument('src/router.ts')!)!;
  right.open(fileDocument('README.md'));
  docs.split(right, 'down', docs.findDocument('README.md')!);
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  docs.float(docs.open(fileDocument('package.json'))!, { x: 80, y: 80, width: 360, height: 220 });
  docs.activate(docs.findDocument('src/index.ts')!);
  docs.onPresentationChanged((e) => (s.shown = `${e.from} → ${e.to} (${e.width} px wide)`));
  let first = '';
  const save = () => {
    const json = JSON.stringify(docs.saveLayout());
    first ||= json;
    s.saved = `Saved as ${docs.currentPresentation}: ${json.length} characters, ${json === first ? 'the same as the first save' : 'not the same as the first save'}.`;
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'By its width' },
            { value: 'desktop', text: 'Desktop' },
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <output class="td-state">{() => (s.shown ? `Shown: ${s.shown}` : `Shown as: ${docs.currentPresentation}`)}</output>
      </Stack>
      {docs}
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save the layout" variant="outline" onclick={save} />
        <output class="td-state">{() => s.saved || 'The layout saves the same in every presentation.'}</output>
      </Stack>
    </>
  );
}
