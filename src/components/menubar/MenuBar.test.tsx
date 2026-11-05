import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { MenuBar } from './MenuBar';
import { dataKinds } from '../../../tests/data-kinds';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const tops = (bar: MenuBar) => Array.from(bar.element.querySelectorAll<HTMLButtonElement>('.mx-menubar__item'));
const popup = (bar: MenuBar) => bar.element.querySelector<HTMLElement>(':scope > .mx-popup');
const shown = (bar: MenuBar) => !!popup(bar) && !popup(bar)!.hidden;
const menuItems = (bar: MenuBar) => Array.from(popup(bar)!.querySelectorAll<HTMLButtonElement>(':scope > .mx-menu > .mx-menu__item'));
const names = (els: Element[]) => els.map((e) => e.querySelector('[class$=__label]')!.textContent);

function menus(log: string[]): MenuItem[] {
  return [
    {
      text: '&File',
      items: [
        { text: '&New', shortcut: 'Ctrl+N', click: () => void log.push('new') },
        { text: 'Open &recent', items: [{ text: 'a.txt', click: () => void log.push('a') }] },
        { text: 'E&xit', beginGroup: true, click: () => void log.push('exit') },
      ],
    },
    { text: '&Edit', items: [{ text: '&Undo', click: () => void log.push('undo') }, { text: 'Redo' }] },
    { text: '&Help', click: () => void log.push('help') },
  ];
}

describe('MenuBar', () => {
  it('is a menubar of top items with one Tab stop, the same in JSX and programmatically', async () => {
    const s = reactive({ label: 'Main' });
    let jsx!: MenuBar;
    page(<MenuBar ref={(b: MenuBar) => (jsx = b)} label={() => s.label} items={menus([])} class="extra" />);
    const coded = new MenuBar({ items: [{ text: 'One', items: [{ text: 'x' }] }] });
    page(coded);
    await settle();

    const bar = jsx.element.querySelector('.mx-menubar__bar')!;
    expect(jsx.element.className).toContain('extra');
    expect(bar.getAttribute('role')).toBe('menubar');
    expect(bar.getAttribute('aria-label')).toBe('Main');
    expect(names(tops(jsx))).toEqual(['File', 'Edit', 'Help']);
    expect(tops(jsx).map((t) => t.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem']);
    expect(tops(jsx).map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(tops(jsx)[0].getAttribute('aria-haspopup')).toBe('menu');
    expect(tops(jsx)[2].hasAttribute('aria-haspopup')).toBe(false);
    expect(tops(jsx)[0].getAttribute('aria-keyshortcuts')).toBe('Alt+F');

    s.label = 'App';
    await settle();
    expect(bar.getAttribute('aria-label')).toBe('App');
    coded.items = [{ text: 'Two' }];
    expect(names(tops(coded))).toEqual(['Two']);
  });

  it('moves along the bar with Left, Right, Home, End and letters; Down opens a menu', async () => {
    const b = new MenuBar({ items: menus([]) });
    page(b);
    await settle();
    expect(b.focus()).toBe(true);
    press('ArrowRight');
    expect(document.activeElement).toBe(tops(b)[1]);
    expect(tops(b).map((t) => t.tabIndex)).toEqual([-1, 0, -1]);
    press('ArrowRight');
    press('ArrowRight');
    expect(document.activeElement).toBe(tops(b)[0]);
    press('ArrowLeft');
    expect(document.activeElement).toBe(tops(b)[2]);
    press('Home');
    expect(document.activeElement).toBe(tops(b)[0]);
    press('End');
    press('e');
    expect(document.activeElement).toBe(tops(b)[1]);

    press('ArrowDown');
    expect(shown(b)).toBe(true);
    expect(b.openItem).toBe(b.items[1]);
    expect(tops(b)[1].getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(menuItems(b)[0]);
    press('Escape');
    expect(shown(b)).toBe(false);
    expect(document.activeElement).toBe(tops(b)[1]);
    press('ArrowUp');
    expect(document.activeElement).toBe(menuItems(b)[1]);
  });

  it('moves to the next menu with Left and Right while one is open, past submenus', async () => {
    const b = new MenuBar({ items: menus([]) });
    page(b);
    await settle();
    b.open(0);
    expect(names(menuItems(b))).toEqual(['New', 'Open recent', 'Exit']);
    press('ArrowRight');
    expect(b.openItem).toBe(b.items[1]);
    expect(names(menuItems(b))).toEqual(['Undo', 'Redo']);
    expect(document.activeElement).toBe(menuItems(b)[0]);
    expect(tops(b)[0].getAttribute('aria-expanded')).toBe('false');
    press('ArrowLeft');
    expect(b.openItem).toBe(b.items[0]);

    // Right on an item with a submenu opens the submenu; Right in it goes on to the next menu.
    press('ArrowDown');
    press('ArrowRight');
    expect(popup(b)!.querySelectorAll('.mx-menu')).toHaveLength(2);
    expect(document.activeElement!.textContent).toBe('a.txt');
    press('ArrowRight');
    expect(b.openItem).toBe(b.items[1]);
    // Help has no menu: it gets focus and the menu closes.
    press('ArrowRight');
    expect(shown(b)).toBe(false);
    expect(document.activeElement).toBe(tops(b)[2]);
  });

  it('runs chosen items and top items without a menu', async () => {
    const log: string[] = [];
    const chosen: MenuItemClickEventArgs[] = [];
    const b = new MenuBar({ items: menus(log), onItemClick: (e) => void chosen.push(e) });
    page(b);
    await settle();
    tops(b)[0].dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(shown(b)).toBe(true);
    // A pointer opens the menu with focus on the menu itself.
    expect(document.activeElement).toBe(popup(b)!.querySelector('.mx-menu'));
    press('x');
    expect(log).toEqual(['exit']);
    expect(shown(b)).toBe(false);
    tops(b)[2].click();
    expect(log).toEqual(['exit', 'help']);
    expect(chosen.map((e) => [e.item.text, e.source === b])).toEqual([
      ['E&xit', true],
      ['&Help', true],
    ]);

    tops(b)[1].click();
    expect(shown(b)).toBe(true);
    tops(b)[1].click();
    expect(shown(b)).toBe(false);
  });

  it('switches menus when the pointer moves along the bar while one is open', async () => {
    const b = new MenuBar({ items: menus([]) });
    page(b);
    await settle();
    tops(b)[1].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    expect(shown(b)).toBe(false);
    b.open(0);
    tops(b)[1].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    expect(b.openItem).toBe(b.items[1]);
    b.openOnHover = false;
    tops(b)[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    expect(b.openItem).toBe(b.items[1]);
  });

  it('opens a menu from its access key', async () => {
    const b = new MenuBar({ items: menus([]) });
    page(b);
    await settle();
    press('e', { altKey: true, code: 'KeyE' });
    expect(b.openItem).toBe(b.items[1]);
    expect(document.activeElement).toBe(menuItems(b)[0]);
  });

  it('takes focus on F10 only when asked', async () => {
    const s = reactive({ f10: false });
    let b!: MenuBar;
    page(<input name="before" />, <MenuBar ref={(x: MenuBar) => (b = x)} items={menus([])} focusOnF10={() => s.f10} />);
    await settle();
    const before = document.querySelector<HTMLInputElement>('[name=before]')!;
    before.focus();
    press('F10');
    expect(document.activeElement).toBe(before);
    s.f10 = true;
    await settle();
    press('F10');
    expect(document.activeElement).toBe(tops(b)[0]);
    s.f10 = false;
    await settle();
    before.focus();
    press('F10');
    expect(document.activeElement).toBe(before);
  });

  it('follows functions in its items, keeping an open menu with its item', async () => {
    const s = reactive({ edit: true, title: 'File' });
    const items: MenuItem[] = [
      { text: () => s.title, items: [{ text: 'New' }] },
      { text: 'Edit', visible: () => s.edit, items: [{ text: 'Undo' }] },
    ];
    const b = new MenuBar({ items });
    page(b);
    await settle();
    b.open(0);
    s.edit = false;
    s.title = 'Document';
    await settle();
    expect(names(tops(b))).toEqual(['Document']);
    expect(shown(b)).toBe(true);
    expect(tops(b)[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('reads functions over plain data again on reState: its items and the open menu', async () => {
    const plain = { edit: true, title: 'File', undo: 'Undo' };
    const items: MenuItem[] = [
      { text: () => plain.title, items: [{ text: 'New' }] },
      { text: 'Edit', visible: () => plain.edit, items: [{ text: () => plain.undo }] },
    ];
    const b = new MenuBar({ items });
    const host = page(b);
    await settle();
    b.open(1);
    Object.assign(plain, { title: 'Document', undo: 'Undo typing' });
    await settle();
    expect(names(tops(b))).toEqual(['File', 'Edit']);
    host.reState();
    expect(names(tops(b))).toEqual(['Document', 'Edit']);
    expect(names(menuItems(b))).toEqual(['Undo typing']);
    plain.edit = false;
    host.reState();
    expect(names(tops(b))).toEqual(['Document']);
    expect(Object.keys(items[1])).toEqual(['text', 'visible', 'items']);
  });

  it('closes its menu and ignores presses while disabled', async () => {
    const b = new MenuBar({ items: menus([]) });
    page(b);
    await settle();
    b.open(0);
    b.enabled = false;
    expect(shown(b)).toBe(false);
    expect(b.open(0)).toBe(false);
    expect(tops(b)[0].disabled).toBe(true);
    b.enabled = true;
    expect(b.open(0)).toBe(true);
  });

  it('can leave the Tab order', async () => {
    const b = new MenuBar({ items: menus([]), tabStop: false });
    page(b);
    await settle();
    expect(tops(b).map((t) => t.tabIndex)).toEqual([-1, -1, -1]);
    b.tabStop = true;
    expect(tops(b)[0].tabIndex).toBe(0);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const list = make<MenuItem[]>([{ text: 'File', items: [{ text: 'New' }, { text: 'Open' }] }, { text: 'Help' }]);
      const clicked: unknown[] = [];
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={list} onItemClick={(e: MenuItemClickEventArgs) => void clicked.push(e.item)} />);
      await settle();
      bar.open(0);
      const file = list[0].items as MenuItem[];
      list[1].text = 'About';
      file[1].text = 'Open…';
      file.push({ text: 'Close' });
      await settle();
      expect(names(tops(bar))).toEqual(['File', 'Help']);
      expect(names(menuItems(bar))).toEqual(['New', 'Open']);
      bar.refresh();
      expect(names(tops(bar))).toEqual(['File', 'About']);
      expect(names(menuItems(bar))).toEqual(['New', 'Open…', 'Close']);
      expect(bar.openItem).toBe(list[0]);
      menuItems(bar)[2].click();
      expect(clicked[0]).toBe(file[2]);
    });
  });
});
