import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import type { MenuItem } from '../../parts/menu/menu-item';
import { ContextMenu } from '../contextmenu/ContextMenu';
import { ActionSheet } from './ActionSheet';
import { dataKinds } from '../../../tests/data-kinds';

let hosts: Component[] = [];

afterEach(async () => {
  await uiLocale.use('en');
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

const items = (s: ActionSheet) => Array.from(s.element.querySelectorAll<HTMLButtonElement>('.mx-action-sheet__list > .mx-menu__item'));
const names = (s: ActionSheet) => items(s).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const cancel = (s: ActionSheet) => s.element.querySelector<HTMLButtonElement>('.mx-action-sheet__cancel button')!;

describe('ActionSheet', () => {
  it('lists menu items with a message and a cancel button, and resolves with the one chosen after running it', async () => {
    const log: string[] = [];
    const list: MenuItem[] = [
      { text: '&Share', click: () => void log.push('share') },
      { text: 'Hidden', visible: false },
      { text: 'Delete', tone: 'danger', click: () => void log.push('delete') },
    ];
    const sheet = new ActionSheet({ title: 'report.pdf', message: 'What should happen to it?', onItemClick: (e) => void log.push(`event ${e.item.text}`) });
    page(sheet);
    await settle();
    const chosen = sheet.choose(list);
    expect(sheet.isOpen).toBe(true);
    expect(sheet.detents).toEqual(['fit']);
    expect(names(sheet)).toEqual(['Share', 'Delete']);
    expect(sheet.element.querySelector('.mx-action-sheet__message')!.textContent).toBe('What should happen to it?');
    expect(cancel(sheet).textContent).toBe('Cancel');
    // Opened by the pointer: the list has focus, no item yet.
    expect(document.activeElement).toBe(sheet.menu.element);
    items(sheet)[1].click();
    expect(await chosen).toBe(list[2]);
    expect(sheet.isOpen).toBe(false);
    expect(log).toEqual(['delete', 'event Delete']);
    expect(sheet.chosenItem).toBe(list[2]);
  });

  it('reads functions over plain data again on reState: its texts and its items', async () => {
    const plain = { cancel: 'Never mind', message: 'Pick one', label: 'Share' };
    const list: MenuItem[] = [{ text: () => plain.label }, { text: 'Delete' }];
    const sheet = new ActionSheet({ message: () => plain.message, cancelText: () => plain.cancel });
    const host = page(sheet);
    await settle();
    void sheet.choose(list);
    expect(cancel(sheet).textContent).toBe('Never mind');
    Object.assign(plain, { cancel: 'Not now', message: 'Choose', label: 'Send' });
    await settle();
    expect(cancel(sheet).textContent).toBe('Never mind');
    host.reState();
    expect(cancel(sheet).textContent).toBe('Not now');
    expect(sheet.element.querySelector('.mx-action-sheet__message')!.textContent).toBe('Choose');
    expect(names(sheet)).toEqual(['Send', 'Delete']);
    sheet.close();
  });

  it('resolves with null when closed without a choice; a key opening it focuses the first item', async () => {
    const sheet = new ActionSheet({ items: [{ text: 'One' }, { text: 'Two' }] });
    page(sheet);
    await settle();
    sheet.open(true);
    expect(document.activeElement).toBe(items(sheet)[0]);
    sheet.close();
    const done = sheet.choose();
    cancel(sheet).click();
    expect(await done).toBe(null);
    sheet.showCancel = false;
    expect(sheet.element.querySelector<HTMLElement>('.mx-action-sheet__cancel')!.hidden).toBe(true);
  });

  it('opens a submenu in its place, with a way back', async () => {
    const picked: string[] = [];
    const sheet = new ActionSheet({
      items: [
        { text: 'Move to', items: [{ text: 'Group 1', click: () => void picked.push('1') }, { text: 'Group 2' }] },
        { text: 'Close' },
      ],
    });
    page(sheet);
    await settle();
    sheet.open();
    items(sheet)[0].click();
    expect(names(sheet)).toEqual(['Back', 'Group 1', 'Group 2']);
    expect(sheet.isOpen).toBe(true);
    items(sheet)[0].click();
    expect(names(sheet)).toEqual(['Move to', 'Close']);
    items(sheet)[0].click();
    items(sheet)[1].click();
    expect(picked).toEqual(['1']);
    expect(sheet.isOpen).toBe(false);
    await uiLocale.use('tr');
    await settle();
    sheet.open();
    items(sheet)[0].click();
    expect(names(sheet)[0]).toBe('Geri');
    expect(cancel(sheet).textContent).toBe('İptal');
  });

  it('is what a ContextMenu opens in with presentation sheet, or auto when a finger opened it', async () => {
    const target = document.createElement('div');
    target.tabIndex = 0;
    document.body.append(target);
    const clicked: string[] = [];
    const menu = new ContextMenu({ target, label: 'Row', items: [{ text: 'Copy', click: () => void clicked.push('copy') }], presentation: 'sheet' });
    page(menu);
    await settle();
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 }));
    const sheet = menu.actionSheet!;
    expect(sheet.isOpen).toBe(true);
    expect(menu.opened).toBe(true);
    expect(menu.element.querySelector('.mx-popup:not([hidden])')).toBe(null);
    expect(sheet.panelElement.getAttribute('aria-label')).toBe('Row');
    items(sheet)[0].click();
    expect(clicked).toEqual(['copy']);
    expect(menu.opened).toBe(false);
    // auto: the mouse gets the menu, a finger the sheet.
    menu.presentation = 'auto';
    target.dispatchEvent(Object.assign(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 }), { pointerType: 'mouse' }));
    expect(sheet.isOpen).toBe(false);
    expect(menu.element.querySelector('.mx-popup:not([hidden])')).not.toBe(null);
    menu.close();
    target.dispatchEvent(Object.assign(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 0, clientX: 5, clientY: 5 }), { pointerType: 'touch' }));
    expect(sheet.isOpen).toBe(true);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, a submenu after a line, and shows a change in place after refresh()', async () => {
      const list = make<MenuItem[]>([{ text: 'Move to', items: [{ text: 'Group 1' }, { text: 'Group 2' }] }, { text: 'Close' }]);
      const clicked: unknown[] = [];
      const sheet = new ActionSheet({ items: list, onItemClick: (e) => void clicked.push(e.item) });
      page(sheet);
      await settle();
      const done = sheet.choose();
      items(sheet)[0].click();
      const list2 = sheet.element.querySelector('.mx-action-sheet__list')!;
      expect(Array.from(list2.children).map((el) => el.className)).toEqual(['mx-menu__item', 'mx-menu__separator', 'mx-menu__item', 'mx-menu__item']);
      const children = list[0].items as MenuItem[];
      children[0].text = 'Team 1';
      children.push({ text: 'Group 3' });
      await settle();
      expect(names(sheet)).toEqual(['Back', 'Group 1', 'Group 2']);
      sheet.refresh();
      expect(names(sheet)).toEqual(['Back', 'Team 1', 'Group 2', 'Group 3']);
      items(sheet)[1].click();
      expect(await done).toBe(children[0]);
      expect(sheet.chosenItem).toBe(children[0]);
      expect(clicked[0]).toBe(children[0]);
    });
  });
});
