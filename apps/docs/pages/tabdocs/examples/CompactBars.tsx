import { reactive } from '@motifx/core';
import { Button, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * The bars of dock areas and floating windows are compact: tabs shrink before the strip scrolls, a
 * single document shows as a title, and only the pin and the close button (a window's own close
 * button) stay beside one "…" menu. Each part is a setting for every area and window, and an area
 * may have its own.
 */
export default function CompactBars() {
  const s = reactive({ compact: true, small: true, scroll: false, title: true, shrink: true, leftScroll: false });
  const docs = new TabDocumentManager({
    label: 'Files with compact tool bars',
    minGroupWidth: 120,
    dockAreaSize: { left: 230, bottom: 130 },
    compactBarButtons: () => (s.compact ? 'auto' : 'all'),
    compactBarButtonSize: () => (s.small ? 'small' : 'normal'),
    compactScrollButtons: () => s.scroll,
    compactSingleTabTitle: () => s.title,
    compactTabSize: () => (s.shrink ? 'shrink' : 'fit'),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'left');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  // This area's own setting wins over the manager's (null follows it again).
  docs.dockArea('left')!.scrollButtons = () => (s.leftScroll ? true : null);
  const float = () => {
    const doc = docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;
    const box = docs.element.getBoundingClientRect();
    docs.float(doc, { x: box.right - 340, y: box.top + 60, width: 300, height: 200 });
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Compact bars" x-model={() => s.compact} />
        <Switch label="Small buttons" x-model={() => s.small} />
        <Switch label="Scroll buttons" x-model={() => s.scroll} />
        <Switch label="One document as a title" x-model={() => s.title} />
        <Switch label="Tabs shrink" x-model={() => s.shrink} />
        <Switch label="Left area: scroll buttons" x-model={() => s.leftScroll} />
        <Button text="Float README.md" variant="outline" onclick={float} />
      </Stack>
      {docs}
    </>
  );
}
