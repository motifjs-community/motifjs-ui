import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { attachContextMenu } from './attach-context-menu';
import { ContextMenu } from './ContextMenu';
import { dataKinds } from '../../../tests/data-kinds';
import type { MenuItem } from '../../parts/menu/menu-item';

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

function rightClick(target: Element, x = 40, y = 60) {
  const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: x, clientY: y });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const popupOf = (m: ContextMenu) => m.element.querySelector<HTMLElement>('.mx-popup');
const shown = (m: ContextMenu) => !!popupOf(m) && !popupOf(m)!.hidden;
const items = (m: ContextMenu) => Array.from(popupOf(m)!.querySelectorAll<HTMLButtonElement>(':scope > .mx-menu > .mx-menu__item'));
const names = (m: ContextMenu) => items(m).map((i) => i.querySelector('.mx-menu__label')!.textContent);

function List() {
  return (
    <ul class="rows" tabindex="0">
      <li data-id="1" tabindex="-1">
        One
      </li>
      <li data-id="2" tabindex="-1">
        Two
      </li>
    </ul>
  );
}

describe('ContextMenu', () => {
  it('opens at the pointer on a right-click of its target, from JSX', async () => {
    const log: string[] = [];
    let menu!: ContextMenu;
    let list!: Component<HTMLUListElement>;
    page(
      <div>
        <List ref={(c: Component<HTMLUListElement>) => (list = c)} />
        <ContextMenu ref={(m: ContextMenu) => (menu = m)} target={() => list} label="Row" items={[{ text: '&Copy', shortcut: 'Ctrl+C', click: () => void log.push('copy') }, { text: 'Delete' }]} />
      </div>,
    );
    await settle();
    expect(menu.target).toBe(list.element);
    expect(menu.element.className).toContain('mx-context-menu');

    const row = list.element.querySelector('li')!;
    expect(rightClick(row, 40, 60)).toBe(true);
    expect(shown(menu)).toBe(true);
    expect(menu.opened).toBe(true);
    expect(menu.targetElement).toBe(row);
    const anchor = menu.element.querySelector<HTMLElement>('.mx-context-menu__anchor')!;
    expect([anchor.style.left, anchor.style.top]).toEqual(['40px', '60px']);
    expect(popupOf(menu)!.querySelector('.mx-menu')!.getAttribute('aria-label')).toBe('Row');
    // Opened by the pointer: focus on the menu, no item highlighted.
    expect(document.activeElement).toBe(popupOf(menu)!.querySelector('.mx-menu'));
    press('c');
    expect(log).toEqual(['copy']);
    expect(shown(menu)).toBe(false);
  });

  it('opens at the focused element with the Menu key and Shift+F10, focus on the first item', async () => {
    const menu = new ContextMenu({ items: [{ text: 'Open' }, { text: 'Rename' }] });
    const host = page(<List />);
    host.element.append(menu.element);
    menu.target = host.element.querySelector('ul')!;
    await settle();
    const row = host.element.querySelector<HTMLElement>('li')!;
    row.focus();
    expect(press('ContextMenu')).toBe(true);
    expect(shown(menu)).toBe(true);
    expect(menu.targetElement).toBe(row);
    expect(document.activeElement).toBe(items(menu)[0]);
    // The contextmenu event the same key sends does not open it again, nor the browser's.
    expect(rightClick(document.activeElement!, 0, 0)).toBe(true);
    press('Escape');
    expect(shown(menu)).toBe(false);
    expect(document.activeElement).toBe(row);

    expect(press('F10', { shiftKey: true })).toBe(true);
    expect(shown(menu)).toBe(true);
    menu.close();
    menu.keyboard = false;
    expect(press('ContextMenu')).toBe(false);
    expect(shown(menu)).toBe(false);
  });

  it('builds the items per element in onOpening, and can cancel', async () => {
    const chosen: MenuItemClickEventArgs[] = [];
    let ul!: HTMLElement;
    const menu = new ContextMenu({
      onItemClick: (e) => void chosen.push(e),
      onOpening: (e) => {
        const id = e.target.closest('li')?.getAttribute('data-id');
        if (!id) e.cancel = true;
        else e.items = [{ text: `Open ${id}` }, { text: `Delete ${id}` }];
      },
    });
    page(<List ref={(c: Component<HTMLElement>) => (ul = c.element)} />, menu);
    menu.target = () => ul;
    await settle();
    rightClick(ul.querySelectorAll('li')[1]);
    expect(names(menu)).toEqual(['Open 2', 'Delete 2']);
    items(menu)[1].click();
    expect(chosen.map((e) => [e.item.text, e.source === menu])).toEqual([['Delete 2', true]]);

    // Not on a row: canceled, and the browser keeps its own menu.
    expect(rightClick(ul)).toBe(false);
    expect(shown(menu)).toBe(false);
  });

  it('opens for the element it is placed in when no target is given', async () => {
    let menu!: ContextMenu;
    page(
      <section class="area">
        <p>Text</p>
        <ContextMenu ref={(m: ContextMenu) => (menu = m)} items={[{ text: 'Select all' }]} />
      </section>,
    );
    await settle();
    expect(menu.target).toBe(document.querySelector('section.area'));
    rightClick(document.querySelector('section.area p')!);
    expect(shown(menu)).toBe(true);
  });

  it('closes on a press outside; scrolling the menu itself never closes it', async () => {
    const menu = new ContextMenu({ items: [{ text: 'One' }] });
    page(<div class="zone" />, menu);
    menu.target = document.querySelector('.zone')!;
    await settle();
    rightClick(menu.target!);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(shown(menu)).toBe(false);

    rightClick(menu.target!);
    popupOf(menu)!.dispatchEvent(new Event('scroll'));
    expect(shown(menu)).toBe(true);
  });

  it('follows the element it opened on while the page scrolls, and closes once that element is off the screen', async () => {
    const menu = new ContextMenu({ items: [{ text: 'One' }] });
    page(<div class="zone" />, menu);
    const zone = document.querySelector<HTMLElement>('.zone')!;
    menu.target = zone;
    await settle();
    let top = 50;
    zone.getBoundingClientRect = () => new DOMRect(10, top, 200, 40);
    const anchor = menu.element.querySelector<HTMLElement>('.mx-context-menu__anchor')!;
    const scroll = (by: number) => {
      top -= by;
      document.dispatchEvent(new Event('scroll'));
      document.dispatchEvent(new Event('scrollend'));
    };

    // The late scroll a press makes when it moves focus: the menu goes along.
    rightClick(zone, 40, 60);
    scroll(30);
    expect(shown(menu)).toBe(true);
    expect([anchor.style.left, anchor.style.top]).toEqual(['40px', '30px']);
    // Another element scrolled: nothing moves.
    const other = document.createElement('div');
    document.body.append(other);
    top -= 5;
    other.dispatchEvent(new Event('scroll'));
    expect([shown(menu), anchor.style.top]).toEqual([true, '30px']);
    top += 5;

    scroll(200);
    expect(shown(menu)).toBe(false);

    // Told not to close on scrolling: it stays even then.
    top = 50;
    menu.closeOnScroll = false;
    rightClick(zone, 40, 60);
    scroll(200);
    expect(shown(menu)).toBe(true);
  });

  it('closes once the element it opened on is scrolled out of the box that holds it', async () => {
    const menu = new ContextMenu({ items: [{ text: 'One' }] });
    page(
      <div class="box">
        <div class="row" />
      </div>,
      menu,
    );
    const box = document.querySelector<HTMLElement>('.box')!;
    const row = document.querySelector<HTMLElement>('.row')!;
    box.style.overflow = 'auto';
    menu.target = box;
    await settle();
    let top = 120;
    box.getBoundingClientRect = () => new DOMRect(0, 100, 300, 200);
    row.getBoundingClientRect = () => new DOMRect(0, top, 300, 30);
    rightClick(row, 20, 130);
    const scroll = (to: number) => {
      top = to;
      box.dispatchEvent(new Event('scroll'));
      box.dispatchEvent(new Event('scrollend'));
    };
    scroll(85);
    expect(shown(menu)).toBe(true);
    // Still on the screen, but out of the box's sight.
    scroll(60);
    expect(shown(menu)).toBe(false);
  });

  it('leaves the browser its own menu while disabled or empty, and follows a target that changes', async () => {
    const s = reactive({ second: false });
    let a!: HTMLElement;
    let b!: HTMLElement;
    const menu = new ContextMenu({ items: [{ text: 'One' }], enabled: false });
    page(<div ref={(c: Component<HTMLElement>) => (a = c.element)} />, <div ref={(c: Component<HTMLElement>) => (b = c.element)} />, menu);
    menu.target = () => (s.second ? b : a);
    await settle();
    expect(rightClick(a)).toBe(false);
    menu.enabled = true;
    expect(rightClick(a)).toBe(true);
    menu.close();
    s.second = true;
    await settle();
    expect(menu.target).toBe(b);
    expect(rightClick(a)).toBe(false);
    menu.items = [{ text: 'Gone', visible: false }];
    expect(rightClick(b)).toBe(false);
  });

  it('reads a target given as a function over plain data again on reState', async () => {
    const plain = { second: false };
    let a!: HTMLElement;
    let b!: HTMLElement;
    const menu = new ContextMenu({ items: [{ text: 'One' }], target: () => (plain.second ? b : a) });
    const host = page(<div ref={(c: Component<HTMLElement>) => (a = c.element)} />, <div ref={(c: Component<HTMLElement>) => (b = c.element)} />, menu);
    await settle();
    expect(menu.target).toBe(a);
    plain.second = true;
    await settle();
    expect(menu.target).toBe(a);
    host.reState();
    expect(menu.target).toBe(b);
    expect(rightClick(b)).toBe(true);
  });

  it('opens programmatically at a point or at an element', async () => {
    const menu = new ContextMenu({ items: [{ text: 'One' }] });
    page(<button class="go">Go</button>, menu);
    const go = document.querySelector<HTMLElement>('.go')!;
    menu.target = go;
    expect(menu.open({ x: 5, y: 7 })).toBe(true);
    expect(menu.targetElement).toBe(go);
    menu.close();
    expect(menu.open(go)).toBe(true);
    expect(document.activeElement).toBe(items(menu)[0]);
  });

  it('attachContextMenu gives an element a menu made per opening, until removed', async () => {
    const host = page(<List />);
    const ul = host.element.querySelector('ul')!;
    const remove = attachContextMenu(ul, (e) => [{ text: `Row ${e.target.closest('li')?.getAttribute('data-id') ?? '-'}` }]);
    expect(rightClick(ul.querySelector('li')!)).toBe(true);
    const popup = document.querySelector<HTMLElement>('.mx-context-menu .mx-popup')!;
    expect(popup.textContent).toBe('Row 1');
    expect(popup.hidden).toBe(false);
    remove();
    expect(document.querySelector('.mx-context-menu')).toBeNull();
    expect(rightClick(ul)).toBe(false);

    const fixed = attachContextMenu(ul, [{ text: 'Same' }]);
    expect(rightClick(ul)).toBe(true);
    fixed();
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const target = document.createElement('div');
      target.tabIndex = 0;
      document.body.append(target);
      const list = make<MenuItem[]>([{ text: 'Copy' }, { text: 'Delete' }]);
      const clicked: unknown[] = [];
      const menu = new ContextMenu({ target, items: list, onItemClick: (e) => void clicked.push(e.item) });
      page(menu);
      await settle();
      rightClick(target);
      list[0].text = 'Copy link';
      list.push({ text: 'Share' });
      await settle();
      expect(names(menu)).toEqual(['Copy', 'Delete']);
      menu.refresh();
      expect(names(menu)).toEqual(['Copy link', 'Delete', 'Share']);
      items(menu)[2].click();
      expect(clicked[0]).toBe(list[2]);
    });
  });
});
