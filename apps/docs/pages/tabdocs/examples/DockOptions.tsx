import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockSide } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { problems, toolDocument } from './tools';

const SIDES: Record<string, readonly TabDockSide[]> = {
  all: ['left', 'right', 'top', 'bottom'],
  sides: ['left', 'right'],
  bottom: ['bottom'],
};

/** Every part of docking and floating is a setting, live; package.json may not float, README.md docks only at the bottom. */
export default function DockOptions() {
  const s = reactive({ guides: true, float: true, dock: true, autoHide: true, inView: true, emptyWindows: true, hover: true, sides: 'all' });
  const docs = new TabDocumentManager({
    label: 'Files with dock settings',
    dockGuides: () => s.guides,
    allowFloat: () => s.float,
    allowDock: () => s.dock,
    allowAutoHide: () => s.autoHide,
    keepFloatingInView: () => s.inView,
    closeEmptyWindows: () => s.emptyWindows,
    autoHideHover: () => s.hover,
    dockSides: () => SIDES[s.sides],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(4)) {
    const extra = file.path === 'package.json' ? { allowFloat: false } : file.path === 'README.md' ? { dockSides: ['bottom'] as TabDockSide[] } : {};
    docs.open(fileDocument(file.path, extra), { index: 99 });
  }
  docs.dock(toolDocument('problems', 'Problems', problems), 'right', 200);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Dock guides" x-model={() => s.guides} />
        <Switch label="Float" x-model={() => s.float} />
        <Switch label="Dock" x-model={() => s.dock} />
        <Switch label="Auto hide" x-model={() => s.autoHide} />
        <Switch label="Windows stay in view" x-model={() => s.inView} />
        <Switch label="Close empty windows" x-model={() => s.emptyWindows} />
        <Switch label="Slide out on hover" x-model={() => s.hover} />
      </Stack>
      <RadioGroup
        label="Dock areas"
        orientation="horizontal"
        items={[
          { value: 'all', text: 'All four sides' },
          { value: 'sides', text: 'Left and right' },
          { value: 'bottom', text: 'Bottom only' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.sides}
      />
      {docs}
    </>
  );
}
