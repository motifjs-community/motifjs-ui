import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TextBox, TreeView } from '@motifx-community/ui';
import { world } from './world';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A tree with its own search box, and a tree filtered from a field outside it. */
export default function Search() {
  const s = reactive({ search: '', startsWith: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Starts with" size="sm" variant="outline" toggle x-model={() => s.startsWith} />
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-search" label="Cities" items={world()} searchEnabled searchMode={() => (s.startsWith ? 'startswith' : 'contains')} />
      </Panel>
      <TextBox label="Filter from outside" x-model={() => s.search} clearButton />
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-filter" label="Filtered cities" items={world()} searchValue={() => s.search} />
      </Panel>
    </>
  );
}
