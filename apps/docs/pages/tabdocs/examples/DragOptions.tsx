import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDropSide } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

const SIDES: Record<string, readonly TabDropSide[]> = {
  all: ['center', 'left', 'right', 'up', 'down'],
  sides: ['left', 'right'],
  center: ['center'],
};

/** Every part of drag and drop is a setting, live; a group can take no drops at all. */
export default function DragOptions() {
  const s = reactive({ allowDrag: true, allowDragGroups: true, pinOnDrag: true, layoutEdgeDrop: true, hover: true, ghost: true, sides: 'all', closed: false });
  const docs = new TabDocumentManager({
    label: 'Files with drag settings',
    allowDrag: () => s.allowDrag,
    allowDragGroups: () => s.allowDragGroups,
    pinOnDrag: () => s.pinOnDrag,
    layoutEdgeDrop: () => s.layoutEdgeDrop,
    dragHoverActivate: () => s.hover,
    dragGhost: () => s.ghost,
    dropSides: () => SIDES[s.sides],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  FILES.slice(0, 5).forEach((file, i) => docs.open(fileDocument(file.path), { index: 99, pinned: i < 2 }));
  const second = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(5)) second.open(fileDocument(file.path), { index: 99 });
  second.allowDrop = () => !s.closed;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Drag tabs" x-model={() => s.allowDrag} />
        <Switch label="Drag groups" x-model={() => s.allowDragGroups} />
        <Switch label="Pin across the border" x-model={() => s.pinOnDrag} />
        <Switch label="Layout edges" x-model={() => s.layoutEdgeDrop} />
        <Switch label="Activate on hover" x-model={() => s.hover} />
        <Switch label="Copy under the pointer" x-model={() => s.ghost} />
        <Switch label="Group 2 takes nothing" x-model={() => s.closed} />
      </Stack>
      <RadioGroup
        label="Drops on a group"
        orientation="horizontal"
        items={[
          { value: 'all', text: 'Centre and edges' },
          { value: 'sides', text: 'Left and right only' },
          { value: 'center', text: 'Centre only' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.sides}
      />
      {docs}
    </>
  );
}
