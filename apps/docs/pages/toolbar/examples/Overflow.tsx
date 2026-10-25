import { reactive } from '@motifx/core';
import { Button, Stack, Toolbar, type ToolbarOverflow } from '@motifx-community/ui';
import { editorItems } from './editor-items';

const OVERFLOWS: ToolbarOverflow[] = ['menu', 'wrap', 'scroll'];

/** The editor toolbar in less room: a “more” menu, a second row, or a bar that scrolls. */
export default function Overflow() {
  const s = reactive({ width: 100, overflow: 'menu' as ToolbarOverflow });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Width">
        {[100, 70, 45, 25].map((width) => (
          <Button key={width} text={`${width}%`} size="sm" variant={() => (s.width === width ? 'solid' : 'ghost')} aria-pressed={() => s.width === width} onclick={() => (s.width = width)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Overflow">
        {OVERFLOWS.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.overflow === mode ? 'solid' : 'ghost')} aria-pressed={() => s.overflow === mode} onclick={() => (s.overflow = mode)} />
        ))}
      </Stack>
      <div class="tb-frame" style={() => `inline-size: ${s.width}%`}>
        <Toolbar label="Format (narrow)" items={editorItems()} overflow={() => s.overflow} />
      </div>
    </>
  );
}
