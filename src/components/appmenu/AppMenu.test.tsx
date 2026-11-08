import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { AppMenu } from './AppMenu';
import type { AppMenuItem } from './app-menu-item';

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
    await new Promise(r => setTimeout(r, 0));
}

/** A page of its own, counting how often it is made. */
class Sheet extends Component<HTMLDivElement> {
    static made = 0;
    constructor(text: string) {
        super('div');
        this.element.className = 'sheet';
        this.element.textContent = text;
        Sheet.made++;
    }
}

const items = (extra: Partial<Record<string, Partial<AppMenuItem>>> = {}): AppMenuItem[] => [
    { key: 'home', text: '&Home', glyph: 'home', page: () => new Sheet('Home page'), ...extra.home },
    { key: 'open', text: '&Open', glyph: 'folder', page: () => new Sheet('Open page'), ...extra.open },
    { key: 'save', text: '&Save', glyph: 'save', group: 'file', ...extra.save },
    { key: 'export', text: '&Export', group: 'file', page: () => new Sheet('Export page'), ...extra.export },
    { key: 'account', text: '&Account', bottom: true, page: () => new Sheet('Account page'), ...extra.account },
    { key: 'options', text: 'O&ptions', bottom: true, page: () => new Sheet('Options page'), ...extra.options }
];

async function make(props: Record<string, unknown> = {}, width = 1280) {
    let menu!: AppMenu;
    page(<AppMenu ref={(m: AppMenu) => (menu = m)} {...props} />);
    Object.defineProperty(menu.element, 'clientWidth', { configurable: true, get: () => width });
    await settle();
    return menu;
}

const texts = (menu: AppMenu) => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-app-menu__item:not([hidden])')).map(el => el.querySelector('.mx-app-menu__label')!.textContent);
const item = (menu: AppMenu, key: string) => menu.element.querySelector<HTMLElement>(`.mx-app-menu__item[data-key="${key}"]`)!;
const shownPage = (menu: AppMenu) => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-app-menu__view:not([hidden])')).map(v => v.textContent);
const press = (el: Element, key: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }));

describe('AppMenu', () => {
    it('is an empty shell until it is given items, named by the kit until it is given a name', async () => {
        const menu = await make();
        menu.open();
        await settle();
        expect(texts(menu)).toEqual([]);
        expect(menu.panelElement.getAttribute('role')).toBe('dialog');
        expect(menu.panelElement.getAttribute('aria-label')).toBe('Menu');
        expect(menu.element.querySelector('.mx-app-menu__close')!.getAttribute('aria-label')).toBe('Close the menu');
        expect(menu.element.querySelector('.mx-app-menu__list--bottom')!.hasAttribute('hidden')).toBe(true);
    });

    it('lists the items in two lists with lines between groups, and shows the first page once it opens', async () => {
        Sheet.made = 0;
        const menu = await make({ label: 'File', items: items() });
        expect(texts(menu)).toEqual(['Home', 'Open', 'Save', 'Export', 'Account', 'Options']);
        expect(menu.element.querySelector('.mx-app-menu__list--bottom')!.querySelectorAll('.mx-app-menu__item').length).toBe(2);
        const lines = Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-app-menu__separator')).filter(s => !s.hidden);
        expect(lines.length).toBe(1);
        expect(lines[0].nextElementSibling).toBe(item(menu, 'save'));
        expect(item(menu, 'home').querySelector('.mx-access-key')!.textContent).toBe('H');
        // No page is made before the menu opens.
        expect(Sheet.made).toBe(0);
        menu.open();
        await settle();
        expect(shownPage(menu)).toEqual(['Home page']);
        expect(item(menu, 'home').getAttribute('aria-current')).toBe('page');
        expect(document.activeElement).toBe(item(menu, 'home'));
        expect(menu.panelElement.getAttribute('aria-label')).toBe('File');
    });

    it('keeps a page once made, and asks onSelecting before another page shows', async () => {
        Sheet.made = 0;
        const told: string[] = [];
        let refuse = false;
        const menu = await make({
            items: items(),
            onSelecting: (e: { key: string; cancel: boolean }) => (e.cancel = refuse && e.key === 'options'),
            onSelectionChanged: (e: { key: string; previous: string }) => told.push(`${e.previous}>${e.key}`)
        });
        menu.open();
        await settle();
        item(menu, 'open').click();
        await settle();
        const first = menu.pageOf('open');
        expect(shownPage(menu)).toEqual(['Open page']);
        item(menu, 'home').click();
        item(menu, 'open').click();
        await settle();
        expect(menu.pageOf('open')).toBe(first);
        expect(Sheet.made).toBe(2);
        refuse = true;
        item(menu, 'options').click();
        await settle();
        expect(shownPage(menu)).toEqual(['Open page']);
        expect(menu.select('account')).toBe(true);
        await settle();
        expect(shownPage(menu)).toEqual(['Account page']);
        expect(told).toEqual(['home>open', 'open>home', 'home>open', 'open>account']);
        expect(menu.selected).toBe('account');
    });

    it('runs a command and closes, unless the item, the menu or the handler keeps it open', async () => {
        const ran: string[] = [];
        const menu = await make({
            items: items({ save: { click: () => ran.push('save') }, export: { page: undefined, closeOnClick: false } }),
            onItemClick: (e: { key: string; keepOpen: boolean }) => ran.push(`menu:${e.key}`)
        });
        menu.open();
        await settle();
        item(menu, 'export').click();
        await settle();
        expect(menu.isOpen).toBe(true);
        item(menu, 'save').click();
        await settle();
        expect(ran).toEqual(['menu:export', 'save', 'menu:save']);
        expect(menu.isOpen).toBe(false);
        menu.closeOnCommand = false;
        menu.open();
        await settle();
        item(menu, 'save').click();
        await settle();
        expect(menu.isOpen).toBe(true);
    });

    it('moves with the arrows across both lists, Home and End, and a letter chooses by access key or goes by its text', async () => {
        const menu = await make({ items: items({ open: { enabled: false } }) });
        menu.open();
        await settle();
        const at = () => (document.activeElement as HTMLElement).dataset.key;
        press(item(menu, 'home'), 'ArrowDown');
        expect(at()).toBe('save');
        press(item(menu, 'save'), 'End');
        expect(at()).toBe('options');
        press(item(menu, 'options'), 'ArrowDown');
        expect(at()).toBe('home');
        press(item(menu, 'home'), 'ArrowUp');
        expect(at()).toBe('options');
        press(item(menu, 'options'), 'Home');
        expect(at()).toBe('home');
        // P is the access key of Options: it shows its page.
        press(item(menu, 'home'), 'p');
        await settle();
        expect(at()).toBe('options');
        expect(shownPage(menu)).toEqual(['Options page']);
        // The disabled item is passed over.
        expect(item(menu, 'open').getAttribute('aria-disabled')).toBe('true');
        item(menu, 'open').click();
        expect(shownPage(menu)).toEqual(['Options page']);
    });

    it('follows the items’ own live fields and a new list, and lets the pages of removed items go', async () => {
        const s = reactive({ unread: 2, show: true, list: items() });
        const menu = await make({ items: () => s.list });
        s.list = items({ home: { text: () => (s.show ? 'Home' : 'Start'), badge: () => s.unread } });
        await settle();
        menu.open();
        await settle();
        expect(item(menu, 'home').querySelector('.mx-badge')!.textContent).toBe('2');
        s.show = false;
        s.unread = 5;
        await settle();
        expect(texts(menu)[0]).toBe('Start');
        expect(item(menu, 'home').querySelector('.mx-badge')!.textContent).toBe('5');
        const home = menu.pageOf('home')!;
        s.list = s.list.filter(i => i.key !== 'home');
        await settle();
        expect(home.isDisposed).toBe(true);
        expect(shownPage(menu)).toEqual(['Open page']);
    });

    it('takes half the window, the whole of it when that is too narrow, and the list and the page in turns when they do not fit', async () => {
        const wide = await make({ items: items() }, 1280);
        wide.open();
        await settle();
        expect([wide.element.hasAttribute('data-full'), wide.element.hasAttribute('data-stacked')]).toEqual([false, false]);

        const phone = await make({ items: items() }, 390);
        phone.open();
        await settle();
        expect([phone.element.hasAttribute('data-full'), phone.element.hasAttribute('data-stacked')]).toEqual([true, true]);
        expect(phone.element.getAttribute('data-view')).toBe('list');
        item(phone, 'open').click();
        await settle();
        expect(phone.element.getAttribute('data-view')).toBe('page');
        expect(document.activeElement).toBe(phone.element.querySelector('.mx-app-menu__view:not([hidden])'));
        // Escape goes back to the list first; the menu stays open.
        press(document.activeElement!, 'Escape');
        await settle();
        expect(phone.element.getAttribute('data-view')).toBe('list');
        expect(phone.isOpen).toBe(true);
        expect(document.activeElement).toBe(item(phone, 'open'));
        item(phone, 'open').click();
        (phone.element.querySelector('.mx-app-menu__back') as HTMLElement).click();
        expect(phone.element.getAttribute('data-view')).toBe('list');
        press(item(phone, 'open'), 'Escape');
        await settle();
        expect(phone.isOpen).toBe(false);

        const tablet = await make({ items: items() }, 800);
        tablet.open();
        await settle();
        expect([tablet.element.hasAttribute('data-full'), tablet.element.hasAttribute('data-stacked')]).toEqual([false, true]);
    });

    it('opens on a page programmatically and returns focus where it was when it closes', async () => {
        const opener = document.createElement('button');
        document.body.append(opener);
        opener.focus();
        const menu = await make({ items: items() });
        menu.openAt('export');
        await settle();
        expect(shownPage(menu)).toEqual(['Export page']);
        expect(document.activeElement).toBe(item(menu, 'export'));
        menu.close();
        await settle();
        expect(document.activeElement).toBe(opener);
    });
});
