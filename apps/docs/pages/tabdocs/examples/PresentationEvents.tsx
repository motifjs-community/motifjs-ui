import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockPresentation, type TabPresentation } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { outline, problems, toolDocument } from './tools';

/**
 * Every part is a setting: how dock areas show on a phone and a tablet (the outline area says its
 * own), the swipe from an edge, the back button. onPresentationChanging can refuse a change: with
 * "Stay a phone" on, the phone does not go back to a tablet.
 */
export default function PresentationEvents() {
  const s = reactive({
    presentation: 'phone' as TabPresentation,
    phoneDock: 'sheet' as TabDockPresentation,
    tabletDock: 'auto' as TabDockPresentation,
    edge: true,
    back: true,
    stay: false,
    log: [] as string[],
  });
  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 5) s.log.shift();
  };
  const docs = new TabDocumentManager({
    label: 'Editor with presentation settings',
    presentation: () => s.presentation,
    phoneDockMode: () => s.phoneDock,
    tabletDockMode: () => s.tabletDock,
    edgeSwipe: () => s.edge,
    backButton: () => s.back,
    onPresentationChanging: (e) => {
      log(`changing ${e.from} → ${e.to}`);
      if (s.stay && e.from === 'phone') e.cancel = true;
    },
    onPresentationChanged: (e) => log(`changed to ${e.to}`),
  });
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('outline', 'Outline', outline), 'right');
  // The outline's area chooses a drawer for itself on a phone.
  docs.dockArea('right')!.phoneDockMode = 'drawer';
  const modes = [
    { value: 'auto', text: 'Auto' },
    { value: 'sheet', text: 'Sheet' },
    { value: 'drawer', text: 'Drawer' },
    { value: 'hidden', text: 'Hidden' },
  ];

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <Switch label="Stay a phone" x-model={() => s.stay} />
        <Switch label="Swipe from an edge" x-model={() => s.edge} />
        <Switch label="Back goes back" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup label="Dock areas on a phone" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.phoneDock} />
        <RadioGroup label="On a tablet" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.tabletDock} />
      </Stack>
      <output class="td-state">{() => s.log.join(' · ') || 'No changes yet.'}</output>
      {docs}
    </>
  );
}
