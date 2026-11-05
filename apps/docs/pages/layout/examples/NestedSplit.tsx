import { reactive } from '@motifx/core';
import { Button, Panel, SplitContainer, Stack, type SplitPanel, type SplitPosition } from '@motifx-community/ui';

const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';
const LAYER = 'background: var(--mx-color-bg-layer);';

/** A split container inside another: a position bound with x-model, minimum sizes, a fixed pane, and hiding a pane programmatically. */
export default function NestedSplit() {
  const s = reactive({ tree: 180 as SplitPosition, fixed: 'first' as SplitPanel, log: '' });
  let outer: SplitContainer | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Hide folders" size="sm" variant="outline" onclick={() => outer?.collapse('first')} />
        <Button text="Restore" size="sm" variant="outline" onclick={() => outer?.restore()} />
        <Button text={() => `fixedPanel: ${s.fixed}`} size="sm" variant="outline" onclick={() => (s.fixed = s.fixed === 'first' ? 'none' : 'first')} />
        <output class="layout-split-out">{() => `position: ${s.tree}`}</output>
        <output class="layout-split-log">{() => s.log}</output>
      </Stack>
      <SplitContainer
        class="layout-split"
        ref={(c: SplitContainer) => (outer = c)}
        position={180}
        fixedPanel={() => s.fixed}
        firstMinSize={120}
        secondMinSize={200}
        x-model={() => s.tree}
        onSplitterMoved={(e: { position: SplitPosition; byUser: boolean; collapsed: SplitPanel }) => (s.log = `moved${e.byUser ? ' by you' : ''}${e.collapsed !== 'none' ? `, ${e.collapsed} hidden` : ''}`)}
        style={`block-size: 20rem; inline-size: 100%; ${FRAME}`}
      >
        <Panel text="Folders" scrollable padding="sm" style={LAYER}>
          <Stack gap="xxs">
            {FOLDERS.map((f) => (
              <Button key={f} text={f} variant="ghost" stretch />
            ))}
          </Stack>
        </Panel>
        <SplitContainer orientation="vertical" position="65%" secondMinSize={48}>
          <Panel text="Editor" scrollable padding="sm">
            <p>Drag the splitters, or Tab to one and use the arrow keys, Home, End and Enter.</p>
          </Panel>
          <Panel text="Output" scrollable padding="sm" style={LAYER}>
            <code>Build finished in 1.2 s.</code>
          </Panel>
        </SplitContainer>
      </SplitContainer>
    </>
  );
}
