import { reactive, type Component } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument, source } from './files';
import { problems, toolDocument } from './tools';

/**
 * A manager that follows its own width (`presentation: 'auto'`): drag the frame's corner, or pick a
 * width. Under 560 pixels it shows as on a phone; under 1024 as on a tablet when the screen is a touch
 * screen (with a mouse it stays a desktop). A text and a scroll position are kept across every change:
 * the content moves, it is never made again.
 */
export default function FollowsWidth() {
  const s = reactive({ shown: '', typed: '' });
  let frame!: Component<HTMLDivElement>;
  const docs = new TabDocumentManager({ label: 'Editor that follows its width' });
  docs.element.style.cssText = 'block-size: 100%; inline-size: 100%';
  docs.open(
    { id: 'note', title: 'Note', content: () => <textarea aria-label="Note" style="display: block; box-sizing: border-box; inline-size: 100%; block-size: 100%; padding: var(--mx-space-3); font: inherit; border: 0; resize: none" x-model={() => s.typed} /> },
    { index: 99 },
  );
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  // A long one: a plain swipe over it scrolls it, on a phone too.
  docs.open({ id: 'log', title: 'Build log', content: () => source(Array.from({ length: 80 }, (_, i) => `${String(i + 1).padStart(3, ' ')}  step ${i + 1} done`).join('\n')) }, { index: 99 });
  docs.split(docs.activeGroup!, 'right', docs.findDocument('src/orders/index.ts')!);
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.activate(docs.findDocument('note')!);
  docs.onPresentationChanged((e) => (s.shown = `${e.to} at ${e.width} px`));
  const width = (px: string) => (frame.element.style.inlineSize = px);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />
        <Button text="720 px" variant="outline" onclick={() => width('720px')} />
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />
        <output class="td-state">{() => s.shown || `Shown as: ${docs.currentPresentation}`}</output>
      </Stack>
      <div
        ref={(c: Component<HTMLDivElement>) => (frame = c)}
        class="td-frame"
        style="box-sizing: border-box; inline-size: 100%; max-inline-size: 100%; min-inline-size: 18rem; block-size: 30rem; overflow: hidden; resize: horizontal; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)"
      >
        {docs}
      </div>
    </>
  );
}
