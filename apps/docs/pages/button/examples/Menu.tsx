import { reactive } from '@motifx/core';
import { Button, type MenuItem } from '@motifx-community/ui';

const NewIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

/** A button that opens a menu: an icon, a disabled item, a check mark, group lines and & keys. */
export default function Menu() {
  const s = reactive({ last: '', wrap: true });

  const fileMenu = (): MenuItem[] => [
    { text: '&New', icon: () => <NewIcon />, click: () => (s.last = 'New') },
    { text: '&Open…', click: () => (s.last = 'Open…') },
    { text: 'Open &recent', enabled: false },
    { text: '&Word wrap', checked: () => s.wrap, beginGroup: true, click: () => (s.wrap = !s.wrap) },
    { text: 'E&xit', beginGroup: true, click: () => (s.last = 'Exit') },
  ];

  return (
    <>
      <Button text="&File" menu={fileMenu} variant="outline" />
      <span>
        Last: <output class="menu-log">{() => s.last || '—'}</output>
      </span>
    </>
  );
}
