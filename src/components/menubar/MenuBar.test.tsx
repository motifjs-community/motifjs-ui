import { Component, reactive } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { MenuBar } from './MenuBar';
import { dataKinds } from '../../../tests/data-kinds';
import type { MenuBarCustomization } from './menu-bar-customization';
import { commands as appCommands } from '../../core/command-registry';
import { shortcuts } from '../../core/shortcut-registry';

let hosts: Component[] = [];
let removers: (() => void)[] = [];

beforeAll(() => {
  // The customizer is a modal window.
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

afterEach(async () => {
  for (const r of removers.splice(0)) r();
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
  describe('changes by path', () => {
    const keyed = (): MenuItem[] => [
      { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'recent', text: 'Open &recent', items: [{ text: 'a.txt' }] }] },
      { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }] },
      { key: 'help', text: '&Help' },
    ];

    it('adds, removes, moves and changes items by key, reporting a new list and keeping the one given', async () => {
      const given = keyed();
      const frozen = JSON.stringify(given);
      const told: (readonly MenuItem[])[] = [];
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={given} onItemsChanged={(e) => void told.push(e.items)} />);
      await settle();
      expect(bar.addItem('', { key: 'view', text: '&View', items: [{ text: 'Zoom' }] }, 2)).toBe(true);
      expect(bar.addItem('file/recent', { text: 'b.txt' })).toBe(true);
      expect(bar.updateItem('help', { text: '&About' })).toBe(true);
      expect(bar.moveItem('edit/undo', 0, 'file')).toBe(true);
      expect(bar.removeItem('file/new')).toBe(true);
      expect(bar.removeItem('nothing')).toBe(false);
      await settle();
      expect(JSON.stringify(given)).toBe(frozen);
      expect(told.length).toBe(5);
      expect(bar.items).toBe(told[4]);
      expect(names(tops(bar))).toEqual(['File', 'Edit', 'View', 'About']);
      expect(bar.findItem('file/recent/1')?.text).toBe('b.txt');
      bar.open('file');
      expect(names(menuItems(bar))).toEqual(['Undo', 'Open recent']);
    });

    it('keeps an open menu open with its new items, and the Tab stop on its item', async () => {
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={keyed()} />);
      await settle();
      bar.open('edit');
      bar.addItem('edit', { key: 'redo', text: '&Redo' });
      await settle();
      expect(shown(bar)).toBe(true);
      expect(names(menuItems(bar))).toEqual(['Undo', 'Redo']);
      expect(tops(bar)[1].getAttribute('aria-expanded')).toBe('true');
      expect(tops(bar)[1].tabIndex).toBe(0);
    });

    it('applies the changes held between beginUpdate and endUpdate at once', async () => {
      let count = 0;
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={keyed()} onItemsChanged={() => void count++} />);
      await settle();
      bar.beginUpdate();
      bar.removeItem('help');
      bar.moveItem('edit', 0);
      expect(names(tops(bar))).toEqual(['File', 'Edit', 'Help']);
      bar.endUpdate();
      await settle();
      expect(count).toBe(1);
      expect(names(tops(bar))).toEqual(['Edit', 'File']);
    });
  });
  describe('customization', () => {
    const keyed = (): MenuItem[] => [
      { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }, { key: 'exit', text: 'E&xit', customizable: false }] },
      { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }] },
      { key: 'help', text: '&Help', customizable: false },
    ];
    const rightClick = (el: Element) => el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 }));
    const openMenus = () => Array.from(document.querySelectorAll<HTMLElement>('.mx-popup')).filter((p) => !p.hidden && p.querySelector('.mx-menu'));
    const customMenu = () => openMenus().find((p) => p.closest('.mx-context-menu'))!;
    const commands = () => Array.from(customMenu().querySelectorAll<HTMLButtonElement>('.mx-menu__item'));
    const command = (text: string) => commands().find((c) => c.textContent!.includes(text))!;

    it('hides and moves top items from the menu of the right button, reporting what changed', async () => {
      const saved: unknown[] = [];
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={keyed()} customizable onCustomized={(e) => void saved.push(e.customization)} />);
      await settle();
      rightClick(tops(bar)[0]);
      await settle();
      expect(commands().map((c) => names([c])[0])).toEqual(['Hide “File”', 'Move left', 'Move right', 'Customize…']);
      expect(command('Move left').getAttribute('aria-disabled')).toBe('true');
      command('Move right').click();
      await settle();
      expect(names(tops(bar))).toEqual(['Edit', 'File', 'Help']);
      expect(document.activeElement).toBe(tops(bar)[1]);
      rightClick(tops(bar)[1]);
      await settle();
      // Help is fixed: nothing moves past it.
      expect(command('Move right').getAttribute('aria-disabled')).toBe('true');
      command('Hide').click();
      await settle();
      expect(names(tops(bar))).toEqual(['Edit', 'Help']);
      expect(saved.at(-1)).toEqual({ hidden: ['file'], order: { '': ['edit', 'file', 'help'] } });
      rightClick(tops(bar)[1]);
      await settle();
      expect(commands().map((c) => names([c])[0])).toEqual(['Show the hidden items', 'Customize…', 'Undo all changes']);
      command('Undo all').click();
      await settle();
      expect(names(tops(bar))).toEqual(['File', 'Edit', 'Help']);
      expect(saved.at(-1)).toEqual({});
    });

    it('changes the items of an open menu, which stays open', async () => {
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={keyed()} customizable />);
      await settle();
      bar.open('file');
      await settle();
      rightClick(menuItems(bar)[0]);
      await settle();
      expect(commands().map((c) => names([c])[0])).toEqual(['Hide “New”', 'Move up', 'Move down', 'Customize…']);
      command('Move down').click();
      await settle();
      expect(shown(bar)).toBe(true);
      expect(names(menuItems(bar))).toEqual(['Save', 'New', 'Exit']);
      expect(document.activeElement).toBe(menuItems(bar)[1]);
      rightClick(menuItems(bar)[1]);
      await settle();
      expect(command('Move down').getAttribute('aria-disabled')).toBe('true');
      command('Hide').click();
      await settle();
      expect(names(menuItems(bar))).toEqual(['Save', 'Exit']);
      expect(bar.customization).toEqual({ hidden: ['file/new'], order: { file: ['save', 'new', 'exit'] } });
      expect(bar.items[0].items).toHaveLength(3);
    });

    it('opens the customizer from its menu: every item in a tree, shown or hidden by its box, and buttons that change them', async () => {
      const told: MenuBarCustomization[] = [];
      let bar!: MenuBar;
      page(
        <MenuBar
          ref={(b: MenuBar) => (bar = b)}
          items={keyed()}
          customizable
          commands={[{ key: 'print', text: '&Print' }]}
          onCustomized={(e) => void told.push(e.customization)}
        />,
      );
      await settle();
      rightClick(tops(bar)[0]);
      await settle();
      command('Customize').click();
      await settle();
      const win = () => document.querySelector<HTMLElement>('.mx-customizer__pages')!;
      const rows = () => Array.from(win().querySelectorAll<HTMLElement>('.mx-tree-view__item'));
      const row = (text: string) => rows().find((el) => el.querySelector(':scope > .mx-tree-view__row > .mx-tree-view__text')!.textContent === text)!;
      const off = (el: HTMLElement) => el.matches(':disabled, [aria-disabled="true"]') || !!el.querySelector(':disabled, [aria-disabled="true"]');
      const tool = (text: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('.mx-customizer__tools .mx-button, .mx-customizer__footer .mx-button')).find((el) => el.textContent === text)!;
      expect(rows().map((el) => el.querySelector('.mx-tree-view__text')!.textContent)).toEqual(['File', 'Edit', 'Help']);
      expect(row('File').getAttribute('aria-checked')).toBe('true');

      row('Edit').querySelector<HTMLElement>('.mx-tree-view__check')!.click();
      await settle();
      expect(names(tops(bar))).toEqual(['File', 'Help']);
      expect(row('Edit').getAttribute('aria-checked')).toBe('false');
      row('Help').querySelector<HTMLElement>('.mx-tree-view__check')!.click();
      await settle();
      expect(row('Help').getAttribute('aria-checked')).toBe('true');

      row('File').querySelector<HTMLElement>('.mx-tree-view__row')!.click();
      await settle();
      expect(off(tool('Rename'))).toBe(false);
      expect(off(tool('Delete'))).toBe(true);
      // The commands page: Print added to File.
      Array.from(win().querySelectorAll<HTMLElement>('.mx-tabs__tab')).find((el) => el.textContent === 'Commands')!.click();
      await settle();
      win().querySelector<HTMLElement>('.mx-customizer__commands .mx-list__item')!.click();
      await settle();
      const addTo = Array.from(win().querySelectorAll<HTMLElement>('.mx-customizer__tools .mx-button')).find((el) => el.textContent === 'Add to')!;
      addTo.querySelector<HTMLElement>('.mx-button__face')!.click();
      await settle();
      Array.from(document.querySelectorAll<HTMLElement>('.mx-popup:not([hidden]) .mx-menu__item')).find((el) => el.textContent!.includes('File'))!.click();
      await settle();
      expect(win().querySelector('.mx-tabs__tab[aria-selected="true"]')!.textContent).toBe('Menus');
      expect(bar.customization.added).toEqual([{ id: 'user:1', parent: 'file', command: 'print' }]);
      expect(row('Print').getAttribute('aria-selected')).toBe('true');
      // Exit is fixed: nothing moves past it.
      expect(off(tool('Move up'))).toBe(true);
      bar.open('file');
      await settle();
      expect(names(menuItems(bar))).toEqual(['New', 'Save', 'Exit', 'Print']);
      bar.close();

      tool('Delete').click();
      await settle();
      expect(bar.customization.added).toBeUndefined();
      tool('Reset all').click();
      await settle();
      expect(names(tops(bar))).toEqual(['File', 'Edit', 'Help']);
      expect(told.at(-1)).toEqual({});
    });

    it('has a keyboard page (ShortcutEditor) that gives the app’s shortcuts other keys, saying first when the keys are in use', async () => {
      const ran: string[] = [];
      removers.push(appCommands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', run: () => void ran.push('save') }));
      removers.push(appCommands.add({ key: 'print', text: '&Print', shortcut: 'Ctrl+P', run: () => void ran.push('print') }));
      let bar!: MenuBar;
      page(<MenuBar ref={(b: MenuBar) => (bar = b)} items={keyed()} customizable />);
      await settle();
      bar.openCustomizer();
      await settle();
      const win = () => document.querySelector<HTMLElement>('.mx-customizer__pages')!;
      Array.from(win().querySelectorAll<HTMLElement>('.mx-tabs__tab')).find((el) => el.textContent === 'Keyboard')!.click();
      await settle();
      const rows = () => Array.from(win().querySelectorAll<HTMLElement>('.mx-tabs__panel:not([hidden]) .mx-shortcut-editor__list .mx-list__item'));
      expect(rows().map((r) => r.textContent)).toEqual(['SaveCtrl+S', 'PrintCtrl+P']);
      // The commands page lists the app's commands too (a hidden page is out of the page: shown to be read).
      const tabNamed = (text: string) => Array.from(win().querySelectorAll<HTMLElement>('.mx-tabs__tab')).find((el) => el.textContent === text)!;
      tabNamed('Commands').click();
      await settle();
      expect(Array.from(win().querySelectorAll('.mx-tabs__panel .mx-customizer__commands .mx-list__item')).map((r) => r.textContent)).toEqual(['Save', 'Print']);
      tabNamed('Keyboard').click();
      await settle();
      rows()[0].click();
      await settle();
      const input = win().querySelector<HTMLInputElement>('.mx-shortcut-editor__capture input')!;
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', code: 'KeyP', ctrlKey: true, bubbles: true, cancelable: true }));
      await settle();
      expect(ran).toEqual([]);
      expect(win().querySelector('.mx-shortcut-editor__status')!.textContent).toBe('Ctrl+P is used by Print');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', code: 'KeyD', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true }));
      await settle();
      expect(win().querySelector('.mx-shortcut-editor__status')!.textContent).toBe('Ctrl+Shift+D is free');
      Array.from(win().querySelectorAll<HTMLElement>('.mx-toolbar .mx-button')).find((el) => el.textContent === 'Assign')!.click();
      await settle();
      expect(shortcuts.keymap).toEqual({ save: ['Ctrl+Shift+D'] });
      expect(rows()[0].textContent).toBe('SavechangedCtrl+Shift+D');
      shortcuts.keymap = null;
    });

    it('restores a saved customization, and lets the app add its own commands or keep the menu closed', async () => {
      const seen: (string | null)[] = [];
      let bar!: MenuBar;
      page(
        <MenuBar
          ref={(b: MenuBar) => (bar = b)}
          items={keyed()}
          customization={{ hidden: ['edit/undo'], order: { '': ['help', 'edit', 'file'] } }}
          onCustomMenuOpening={(e) => {
            seen.push(e.path);
            if (e.path === 'help') e.cancel = true;
            else e.items.push({ text: 'Add to the toolbar' });
          }}
        />,
      );
      await settle();
      expect(names(tops(bar))).toEqual(['Help', 'Edit', 'File']);
      // Its only item hidden, Edit has no menu to open.
      expect(bar.open('edit')).toBe(false);
      rightClick(tops(bar)[2]);
      await settle();
      // Not customizable: only the app's own command.
      expect(commands().map((c) => names([c])[0])).toEqual(['Add to the toolbar']);
      expect(seen).toEqual(['file']);
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 });
      tops(bar)[0].dispatchEvent(e);
      expect(e.defaultPrevented).toBe(false);
      expect(seen).toEqual(['file', 'help']);
    });
  });
});
