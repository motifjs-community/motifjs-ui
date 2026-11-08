import { reactive } from '@motifx/core';
import { MenuBar, Stack, Tab, Tabs, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';

/** The app's bar, and a bar in each document: the bar of the document shown merges into the app's. */
export default function MergedMenus() {
  const s = reactive({ told: 'Nothing yet.' });
  const tell = (e: MenuItemClickEventArgs) => (s.told = `${String(e.item.text).replace('&', '')} in ${(e.source as MenuBar).label}`);

  const app: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },
    { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },
    { key: 'window', text: '&Window', items: [{ key: 'split', text: '&Split' }] },
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
  ];
  const report: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'export', text: 'Export as &PDF', mergeAt: { after: 'open' } }] },
    { key: 'format', text: 'F&ormat', mergeAt: { before: 'window' }, items: [{ key: 'bold', text: '&Bold' }, { key: 'italic', text: '&Italic' }] },
  ];
  const sheet: MenuItem[] = [
    { key: 'edit', text: '&Edit', items: [{ key: 'fill', text: '&Fill down', beginGroup: true }] },
    { key: 'data', text: '&Data', mergeAt: { before: 'window' }, items: [{ key: 'sort', text: '&Sort' }, { key: 'filter', text: 'F&ilter' }] },
    { key: 'window', merge: 'remove', text: 'Window' },
  ];

  return (
    <Stack gap="md">
      <MenuBar label="App" items={app} mergeHost mergeName="docs-demo" onItemClick={tell} />
      <Tabs label="Documents">
        <Tab key="report" title="Report.docx">
          <MenuBar class="mb-merge-report" label="Report" items={report} mergeInto="docs-demo" onItemClick={tell} />
          <p>The report’s own commands are in the app’s bar while this document is shown.</p>
        </Tab>
        <Tab key="sheet" title="Budget.xlsx">
          <MenuBar class="mb-merge-sheet" label="Budget" items={sheet} mergeInto="docs-demo" onItemClick={tell} />
          <p>The budget adds Data, joins Edit and takes Window away.</p>
        </Tab>
      </Tabs>
      <output class="mb-merge-told">{() => s.told}</output>
    </Stack>
  );
}
