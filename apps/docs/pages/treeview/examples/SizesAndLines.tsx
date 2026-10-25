import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { FILE, FOLDER, icon } from './icon';
import { project } from './project';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** Row sizes, lines under the parents, and what opens a row. */
export default function SizesAndLines() {
  const s = reactive({ size: 'md' as 'sm' | 'md' | 'lg', lines: true, expandOn: 'expander' as 'expander' | 'click' | 'dblclick' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Button
            key={size}
            text={size}
            size="sm"
            variant={() => (s.size === size ? 'solid' : 'ghost')}
            aria-pressed={() => s.size === size}
            onclick={() => (s.size = size)}
          />
        ))}
        <Button text="Lines" size="sm" variant="outline" toggle x-model={() => s.lines} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Opens on">
        {(['expander', 'click', 'dblclick'] as const).map((how) => (
          <Button
            key={how}
            text={`expandOn ${how}`}
            size="sm"
            variant={() => (s.expandOn === how ? 'solid' : 'ghost')}
            aria-pressed={() => s.expandOn === how}
            onclick={() => (s.expandOn = how)}
          />
        ))}
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          class="tv-look"
          label="Look"
          items={project()}
          expandedKeys={['src', 'components', 'docs']}
          size={() => s.size}
          showLines={() => s.lines}
          expandOn={() => s.expandOn}
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
        />
      </Panel>
    </>
  );
}
