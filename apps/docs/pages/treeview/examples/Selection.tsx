import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView, type TreeViewSelectionMode } from '@motifx-community/ui';
import { world } from './world';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** Single, multiple or no selection, the selected keys bound with x-model. */
export default function Selection() {
  const s = reactive({ mode: 'multiple' as TreeViewSelectionMode, picked: [] as unknown[] });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">
        {(['single', 'multiple', 'none'] as const).map((mode) => (
          <Button
            key={mode}
            text={mode}
            size="sm"
            variant={() => (s.mode === mode ? 'solid' : 'ghost')}
            aria-pressed={() => s.mode === mode}
            onclick={() => (s.mode = mode)}
          />
        ))}
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-select" label="Places" items={world()} expandedKeys={['europe', 'tr']} selectionMode={() => s.mode} x-model={() => s.picked} />
      </Panel>
      <output class="tv-picked">{() => `value: ${JSON.stringify(s.picked)}`}</output>
    </>
  );
}
