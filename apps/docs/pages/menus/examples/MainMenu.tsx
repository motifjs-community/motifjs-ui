import { reactive, type Component } from '@motifx/core';
import { CheckBox, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

/** An app's menu bar made with `new`: submenus, check and radio items, shortcuts, access keys, and `onItemClick`. */
export default function MainMenu() {
  const s = reactive({
    log: 'Nothing chosen yet.',
    chosen: 0,
    wrap: true,
    statusBar: false,
    zoom: '100%',
    theme: 'light',
    f10: false,
    canUndo: true,
  });

  const did = (what: string) => (s.log = what);
  const undo = (back: boolean) => {
    s.canUndo = !back;
    did(back ? 'Undo' : 'Redo');
  };
  const zoom = (value: string): MenuItem => ({ text: value, group: 'zoom', checked: () => s.zoom === value, click: () => (s.zoom = value) });
  const theme = (value: string, text: string): MenuItem => ({ text, group: 'theme', checked: () => s.theme === value, click: () => (s.theme = value) });

  const menus: MenuItem[] = [
    {
      text: '&File',
      items: [
        { text: '&New', shortcut: 'Ctrl+N', click: () => did('New') },
        { text: '&Open…', shortcut: 'Ctrl+O', click: () => did('Open…') },
        { text: 'Open &recent', items: ['report.docx', 'budget.xlsx', 'notes.md'].map((name) => ({ text: name, click: () => did(`Open ${name}`) })) },
        { text: '&Save', shortcut: 'Ctrl+S', beginGroup: true, click: () => did('Save') },
        { text: 'Save &as…', click: () => did('Save as…') },
        { text: 'E&xit', beginGroup: true, click: () => did('Exit') },
      ],
    },
    {
      text: '&Edit',
      items: [
        { text: '&Undo', shortcut: 'Ctrl+Z', enabled: () => s.canUndo, click: () => undo(true) },
        { text: '&Redo', shortcut: 'Ctrl+Y', click: () => undo(false) },
        { text: 'Cu&t', shortcut: 'Ctrl+X', beginGroup: true, click: () => did('Cut') },
        { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copy') },
        { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Paste') },
        { text: 'Paste &special', enabled: false },
      ],
    },
    {
      text: '&View',
      items: [
        { text: '&Word wrap', checked: () => s.wrap, click: () => (s.wrap = !s.wrap) },
        { text: '&Status bar', checked: () => s.statusBar, click: () => (s.statusBar = !s.statusBar) },
        { ...zoom('100%'), beginGroup: true },
        zoom('125%'),
        zoom('150%'),
        { text: '&Theme', beginGroup: true, items: [theme('light', 'Light'), theme('dark', 'Dark'), theme('system', 'Same as the system')] },
      ],
    },
    { text: '&Help', items: [{ text: '&About', click: () => did('About') }] },
  ];

  const bar = new MenuBar({ label: 'Main', items: menus, focusOnF10: () => s.f10 });
  bar.onItemClick(() => s.chosen++);

  return (
    <>
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="F10 focuses the bar" x-model={() => s.f10} />
        <output class="mb-log">{() => s.log}</output>
        <output class="mb-count">{() => `onItemClick ran ${s.chosen} times.`}</output>
      </Stack>
      <span class="mb-view">{() => `Word wrap ${s.wrap ? 'on' : 'off'} · status bar ${s.statusBar ? 'on' : 'off'} · zoom ${s.zoom} · theme ${s.theme}`}</span>
    </>
  );
}
