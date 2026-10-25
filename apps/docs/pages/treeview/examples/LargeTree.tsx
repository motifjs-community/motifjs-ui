import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

const DEPARTMENTS: Entry[] = Array.from({ length: 50 }, (_, d) => ({
  id: `d${d}`,
  text: `Department ${d + 1}`,
  children: Array.from({ length: 200 }, (_, p) => ({ id: `d${d}p${p}`, text: `Person ${d + 1}.${p + 1}` })),
}));

/** 50 departments of 200 people, made with `new`: only the rows in view are drawn. */
export default function LargeTree() {
  const people = new TreeView<Entry>({ items: DEPARTMENTS, label: 'People', showLines: true });
  people.element.style.blockSize = '20rem';
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Expand all" variant="outline" onclick={() => people.expandAll()} />
        <Button text="Collapse all" variant="ghost" onclick={() => people.collapseAll()} />
        <Button text="Go to Person 37.150" variant="ghost" onclick={() => people.focusNode('d36p149')} />
      </Stack>
      <Panel class="tv-large" variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(people)} />
    </>
  );
}
