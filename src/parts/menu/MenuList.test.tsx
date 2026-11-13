import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../../components/button/Button';
import { checkMark } from '../../core/glyphs';
import type { MenuItem } from './menu-item';
import type { MenuItemClickEventArgs } from './menu-item-click-event-args';
import { MenuList } from './MenuList';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
  vi.useRealTimers();
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

const menus = (root: Element) => Array.from(root.querySelectorAll<HTMLElement>('.mx-menu'));
const itemsOf = (menu: Element) => Array.from(menu.querySelectorAll<HTMLButtonElement>(':scope > .mx-menu__item'));
// A closed popup is out of the page.
const open = (menu: Element | undefined) => {
  const popup = menu?.closest<HTMLElement>('.mx-popup');
  return !!popup && popup.isConnected && !popup.hidden;
};
const label = (el: Element) => el.querySelector('.mx-menu__label')!.textContent;

describe('MenuList submenus', () => {
  it('changes an item in place: a new text or check keeps its button', async () => {
    const list = new MenuList();
    page(list);
    const state = reactive({ text: 'Open', checked: false });
    list.setItems([{ text: () => state.text, checked: () => state.checked }]);
    const button = itemsOf(list.element)[0];
    state.text = 'Close';
    state.checked = true;
    await settle();
    expect(itemsOf(list.element)[0]).toBe(button);
    expect(label(button)).toBe('Close');
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  const tree = (log: string[]): MenuItem[] => [
    { text: '&New', shortcut: 'Ctrl+N', click: () => void log.push('new') },
    {
      text: 'Open &recent',
      items: [
        { text: 'a.txt', click: () => void log.push('a') },
        { text: '&More', items: [{ text: 'b.txt', click: () => void log.push('b') }] },
      ],
    },
    { text: 'Exit', click: () => void log.push('exit') },
  ];

  it('marks an item with a submenu and opens it with Right, Enter or a letter, focus on its first item', async () => {
    const log: string[] = [];
    const b = new Button({ text: 'File', menu: tree(log) });
    page(b);
    await settle();
    b.open();
    const root = menus(b.element)[0];
    const recent = itemsOf(root)[1];
    expect(recent.getAttribute('aria-haspopup')).toBe('menu');
    expect(recent.getAttribute('aria-expanded')).toBe('false');
    expect(recent.querySelector('.mx-menu__arrow .mx-glyph')).not.toBeNull();
    expect(itemsOf(root)[0].querySelector('.mx-menu__shortcut')!.textContent).toBe('Ctrl+N');

    press('ArrowDown');
    expect(press('ArrowRight')).toBe(true);
    const sub = menus(b.element)[1];
    expect(open(sub)).toBe(true);
    expect(recent.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(itemsOf(sub)[0]);
    // The submenu is not inside the menu that opened it, but in the same popup.
    expect(root.contains(sub)).toBe(false);
    expect(root.closest('.mx-popup')!.contains(sub)).toBe(true);

    press('ArrowLeft');
    expect(open(sub)).toBe(false);
    expect(document.activeElement).toBe(recent);
    expect(recent.getAttribute('aria-expanded')).toBe('false');

    recent.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(document.activeElement).toBe(itemsOf(sub)[0]);
    press('Escape');
    expect(open(sub)).toBe(false);
    expect(b.opened).toBe(true);
    expect(document.activeElement).toBe(recent);

    press('r');
    expect(open(sub)).toBe(true);
    expect(log).toEqual([]);
  });

  it('opens submenus of submenus; choosing anywhere reaches the owner and closes them all', async () => {
    const log: string[] = [];
    const chosen: MenuItemClickEventArgs[] = [];
    const b = new Button({ text: 'File', menu: tree(log), onItemClick: (e) => void chosen.push(e) });
    page(b);
    await settle();
    b.open();
    press('ArrowDown');
    press('ArrowRight');
    press('m');
    const deep = menus(b.element)[2];
    expect(open(deep)).toBe(true);
    expect(label(document.activeElement!)).toBe('b.txt');

    press('Enter');
    (document.activeElement as HTMLElement).click();
    expect(log).toEqual(['b']);
    expect(chosen[0].source).toBe(b);
    expect(b.opened).toBe(false);
    expect(menus(b.element).slice(1).every((m) => !open(m))).toBe(true);
  });

  it('closes its submenus when the menu closes', async () => {
    const b = new Button({ text: 'File', menu: tree([]) });
    page(b);
    await settle();
    b.open();
    press('ArrowDown');
    press('ArrowRight');
    const [first, sub] = menus(b.element);
    b.close();
    expect(open(sub)).toBe(false);
    // Closed, the menu is out of the page: read through the part held before.
    expect(itemsOf(first)[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('opens a submenu when the pointer rests on its item, and closes it when it rests elsewhere', async () => {
    vi.useFakeTimers();
    const b = new Button({ text: 'File', menu: tree([]) });
    page(b);
    await settle();
    b.open();
    const root = menus(b.element)[0];
    const [first, recent] = itemsOf(root);
    recent.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    expect(document.activeElement).toBe(recent);
    expect(menus(b.element)).toHaveLength(1);
    vi.advanceTimersByTime(300);
    const sub = menus(b.element)[1];
    expect(open(sub)).toBe(true);
    // Focus stays on the item: the pointer opened it.
    expect(document.activeElement).toBe(recent);

    first.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    expect(open(sub)).toBe(true);
    // The pointer reached the submenu in time: it stays.
    sub.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    vi.advanceTimersByTime(300);
    expect(open(sub)).toBe(true);

    first.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    vi.advanceTimersByTime(300);
    expect(open(sub)).toBe(false);
  });

  it('leaves hovering to the pointer only when openOnHover is on', async () => {
    vi.useFakeTimers();
    const b = new Button({ text: 'File', menu: tree([]) });
    page(b);
    await settle();
    b.open();
    const root = menus(b.element)[0];
    const list = findList(b);
    list.openOnHover = false;
    itemsOf(root)[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    vi.advanceTimersByTime(500);
    expect(menus(b.element)).toHaveLength(1);
  });

  it('opens towards the start in a right-to-left page', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const b = new Button({ text: 'File', menu: tree([]) });
    page(b);
    await settle();
    const style = document.createElement('style');
    style.textContent = '[dir=rtl] * { direction: rtl; }';
    document.head.append(style);
    b.open();
    press('ArrowDown');
    expect(press('ArrowRight')).toBe(false);
    expect(menus(b.element)).toHaveLength(1);
    press('ArrowLeft');
    const sub = menus(b.element)[1];
    expect(open(sub)).toBe(true);
    press('ArrowRight');
    expect(open(sub)).toBe(false);
    style.remove();
  });

  it('shows check items and radio items of a group, and follows them', async () => {
    const s = reactive({ wrap: true, align: 'left' });
    const b = new Button({
      text: 'View',
      menu: [
        { text: 'Word wrap', checked: () => s.wrap },
        { text: 'Left', group: 'align', checked: () => s.align === 'left', beginGroup: true },
        { text: 'Right', group: 'align', checked: () => s.align === 'right' },
      ],
    });
    page(b);
    await settle();
    b.open();
    const items = () => itemsOf(menus(b.element)[0]);
    expect(items().map((i) => [i.getAttribute('role'), i.getAttribute('aria-checked')])).toEqual([
      ['menuitemcheckbox', 'true'],
      ['menuitemradio', 'true'],
      ['menuitemradio', 'false'],
    ]);
    expect(items()[1].querySelector('.mx-menu__check .mx-glyph')).not.toBeNull();
    expect(menus(b.element)[0].hasAttribute('data-checks')).toBe(true);

    s.align = 'right';
    s.wrap = false;
    await settle();
    expect(items().map((i) => i.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
    expect(items()[2].querySelector('.mx-menu__check .mx-glyph')).not.toBeNull();
  });

  it('follows a submenu given as a function, and a shortcut that changes', async () => {
    const s = reactive({ files: ['a.txt'], key: 'Ctrl+S' });
    const b = new Button({
      text: 'File',
      menu: [
        { text: 'Save', shortcut: () => s.key },
        { text: 'Recent', items: () => s.files.map((f) => ({ text: f })) },
      ],
    });
    page(b);
    await settle();
    b.open();
    const root = menus(b.element)[0];
    expect(itemsOf(root)[0].querySelector('.mx-menu__shortcut')!.textContent).toBe('Ctrl+S');
    press('ArrowDown');
    press('ArrowRight');
    s.files = ['a.txt', 'b.txt'];
    s.key = 'Mod+S';
    await settle();
    expect(itemsOf(menus(b.element)[1]).map(label)).toEqual(['a.txt', 'b.txt']);
    expect(itemsOf(root)[0].querySelector('.mx-menu__shortcut')!.textContent).toBe('Mod+S');

    s.files = [];
    await settle();
    expect(itemsOf(root)[1].hasAttribute('aria-haspopup')).toBe(false);
    expect(open(menus(b.element)[1])).toBe(false);
  });

  it('does not open the submenu of a disabled item', async () => {
    const b = new Button({ text: 'File', menu: [{ text: 'Recent', enabled: false, items: [{ text: 'a' }] }] });
    page(b);
    await settle();
    b.open();
    press('ArrowRight');
    itemsOf(menus(b.element)[0])[0].click();
    expect(menus(b.element)).toHaveLength(1);
  });

  it('writes the tone of an item, none for standard, and follows a function', async () => {
    const s = reactive<{ tone: 'standard' | 'caution' | 'danger' }>({ tone: 'danger' });
    const list = new MenuList();
    page(list);
    list.setItems([{ text: 'Open' }, { text: 'Approve', tone: 'success' }, { text: 'Delete', tone: () => s.tone }]);
    const tones = () => itemsOf(list.element).map((i) => i.dataset.tone ?? null);
    expect(tones()).toEqual([null, 'success', 'danger']);
    s.tone = 'standard';
    await settle();
    expect(tones()).toEqual([null, 'success', null]);
    s.tone = 'caution';
    await settle();
    expect(tones()).toEqual([null, 'success', 'caution']);
  });

  it('shows a description after the label, dim, apart from the shortcut, and follows a function', async () => {
    const s = reactive({ folder: 'src' });
    const list = new MenuList();
    page(list);
    list.setItems([{ text: 'index.ts', description: () => s.folder, shortcut: 'Ctrl+1' }, { text: 'Close all' }]);
    const [file, close] = itemsOf(list.element);
    const description = file.querySelector('.mx-menu__description')!;
    expect(description.textContent).toBe('src');
    expect(description.previousElementSibling).toBe(file.querySelector('.mx-menu__label'));
    expect(file.querySelector('.mx-menu__label')!.textContent).toBe('index.ts');
    expect(file.querySelector('.mx-menu__shortcut')!.textContent).toBe('Ctrl+1');
    expect(file.hasAttribute('aria-keyshortcuts')).toBe(false);
    expect(file.textContent).toBe('index.ts srcCtrl+1');
    expect(close.querySelector('.mx-menu__description')).toBeNull();
    s.folder = 'lib';
    await settle();
    expect(itemsOf(list.element)[0].querySelector('.mx-menu__description')!.textContent).toBe('lib');
    // Typing goes by the label alone.
    list.focusItem('last');
    press('i');
    expect(label(document.activeElement!)).toBe('index.ts');
  });

  it('keeps the column for marks and icons when asked, so its texts line up with a menu beside it', async () => {
    const list = new MenuList();
    page(list);
    list.setItems([{ text: 'Close all' }]);
    expect(list.element.hasAttribute('data-icons')).toBe(false);
    list.markColumn = true;
    list.setItems([{ text: 'Close all' }]);
    expect(list.element.hasAttribute('data-icons')).toBe(true);
    list.markColumn = false;
    list.setItems([{ text: 'Close all' }]);
    expect(list.element.hasAttribute('data-icons')).toBe(false);
  });

  it('can keep the icon of a checked item, the mark in a column of its own, and a check for a chosen radio item', async () => {
    const list = new MenuList();
    page(list);
    const icon = () => <svg />;
    const items = [
      { text: 'index.ts', icon, group: 'doc', checked: true },
      { text: 'app.ts', icon, group: 'doc', checked: false },
    ];
    list.setItems(items);
    const mark = () => itemsOf(list.element)[0].querySelector<HTMLElement>('.mx-menu__check .mx-glyph')!.dataset.icon;
    const dot = mark();
    expect(list.element.hasAttribute('data-marks-apart')).toBe(false);

    list.markBesideIcon = true;
    list.radioMark = 'check';
    list.setItems(items);
    expect(list.element.hasAttribute('data-marks-apart')).toBe(true);
    expect(itemsOf(list.element)[0].querySelector('.mx-menu__icon svg')).not.toBeNull();
    expect(mark()).not.toBe(dot);
    expect(mark()).toBe(checkMark().element.dataset.icon);
    expect(itemsOf(list.element)[0].getAttribute('role')).toBe('menuitemradio');
  });

  it('can focus the menu itself; Down then goes to the first item', async () => {
    const list = new MenuList();
    page(list);
    list.setItems([{ text: 'One' }, { text: 'Two' }]);
    list.focusList();
    expect(document.activeElement).toBe(list.element);
    press('ArrowDown');
    expect(label(document.activeElement!)).toBe('One');
  });
});

function findList(b: Button): MenuList {
  let found: MenuList | null = null;
  const walk = (c: Component | { controls?: { items: Component[] } }) => {
    for (const child of (c as Component).controls?.items ?? []) {
      if (child instanceof MenuList) found ??= child;
      walk(child);
    }
  };
  walk(b);
  return found!;
}
