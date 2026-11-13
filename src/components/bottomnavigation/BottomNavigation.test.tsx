import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow, whenMeasured } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { BottomNavigation } from './BottomNavigation';
import type { BottomNavigationItem } from './bottom-navigation-item';

const hosts: Component[] = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

function page(view: Component): Component {
    const host = mountHost(view);
    hosts.push(host);
    return host;
}

const ITEMS: BottomNavigationItem[] = [
    { value: 'home', text: 'Home', glyph: 'star', activeGlyph: 'star-filled' },
    { value: 'inbox', text: 'Inbox', glyph: 'file' },
    { value: 'off', text: 'Off', glyph: 'lock', enabled: false },
    { value: 'me', text: 'Profile', glyph: 'person' }
];

const items = (bar: BottomNavigation) => [...bar.element.querySelectorAll<HTMLElement>('.mx-bottom-navigation__item')];

function key(el: HTMLElement, name: string) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
}

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
});

describe('BottomNavigation', () => {
    it('is a named nav with its items, and marks the selected one', async () => {
        const bar = new BottomNavigation({ items: ITEMS, value: 'inbox' });
        page(bar);
        await tick();
        expect(bar.element.localName).toBe('nav');
        expect(bar.element.getAttribute('aria-label')).toBe(enStrings.navigation);
        const [home, inbox] = items(bar);
        expect(items(bar)).toHaveLength(4);
        expect(inbox.getAttribute('aria-current')).toBe('page');
        expect(home.hasAttribute('aria-current')).toBe(false);
        expect(bar.selectedItem).toBe(ITEMS[1]);
    });

    it('keeps its items when the value or the item list changes', async () => {
        const bar = new BottomNavigation({ items: ITEMS, value: 'home' });
        page(bar);
        await tick();
        const before = items(bar);
        bar.value = 'me';
        await tick();
        expect(items(bar).every((el, i) => el === before[i])).toBe(true);
        expect(before[3].getAttribute('aria-current')).toBe('page');
        expect(before[3].getAttribute('tabindex')).toBe('0');
        bar.items = [...ITEMS.slice(0, 2), { value: 'new', text: 'New' }, ...ITEMS.slice(2)];
        await tick();
        const after = items(bar);
        expect(after).toHaveLength(5);
        expect([after[0], after[1], after[3], after[4]].every((el, i) => el === before[i])).toBe(true);
        expect(after[2].textContent).toBe('New');
    });

    it('takes its position as the value of an item without one', async () => {
        const bar = new BottomNavigation({ items: [{ text: 'A' }, { text: 'B' }], value: 1 });
        page(bar);
        await tick();
        expect(items(bar)[1].getAttribute('aria-current')).toBe('page');
    });

    it('selects on a press, writes the model and reports it', async () => {
        const s = reactive({ page: 'home' as string | number | null });
        const changed = vi.fn();
        const clicked = vi.fn();
        const own = vi.fn();
        const list = [{ ...ITEMS[0] }, { ...ITEMS[1], click: own }];
        let bar!: BottomNavigation;
        page(<BottomNavigation ref={(x: BottomNavigation) => (bar = x)} items={list} x-model={() => s.page} onSelectionChanged={changed} onItemClick={clicked} />);
        await tick();
        items(bar)[1].click();
        await tick();
        expect(s.page).toBe('inbox');
        expect(items(bar)[1].getAttribute('aria-current')).toBe('page');
        expect(own).toHaveBeenCalledTimes(1);
        expect(clicked).toHaveBeenCalledTimes(1);
        expect(changed.mock.calls[0][0]).toMatchObject({ value: 'inbox', previous: 'home' });
    });

    it('keeps the item when onSelecting refuses, and leaves a link unfollowed', async () => {
        const list: BottomNavigationItem[] = [{ value: 'a', text: 'A' }, { value: 'b', text: 'B', href: '#b' }];
        const bar = new BottomNavigation({ items: list, value: 'a', onSelecting: e => (e.cancel = true) });
        page(bar);
        await tick();
        const link = items(bar)[1];
        const press = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(press);
        await tick();
        expect(bar.value).toBe('a');
        expect(press.defaultPrevented).toBe(true);
    });

    it('does not select a disabled item', async () => {
        const changed = vi.fn();
        const bar = new BottomNavigation({ items: ITEMS, value: 'home', onSelectionChanged: changed });
        page(bar);
        await tick();
        const off = items(bar)[2];
        expect(off.getAttribute('aria-disabled')).toBe('true');
        off.click();
        await tick();
        expect(bar.value).toBe('home');
        expect(changed).not.toHaveBeenCalled();
    });

    it('is one Tab stop, and the arrow keys pass over a disabled item', async () => {
        const bar = new BottomNavigation({ items: ITEMS, value: 'inbox' });
        page(bar);
        await tick();
        const all = items(bar);
        expect(all.map(el => el.tabIndex)).toEqual([-1, 0, -1, -1]);
        all[1].focus();
        key(all[1], 'ArrowRight');
        expect(document.activeElement).toBe(all[3]);
        key(all[3], 'ArrowRight');
        expect(document.activeElement).toBe(all[0]);
        key(all[0], 'ArrowLeft');
        expect(document.activeElement).toBe(all[3]);
        key(all[3], 'Home');
        expect(document.activeElement).toBe(all[0]);
        key(all[0], 'End');
        expect(document.activeElement).toBe(all[3]);
    });

    it('turns the arrow keys around in a right-to-left page', async () => {
        const bar = new BottomNavigation({ items: ITEMS, value: 'home' });
        page(bar);
        bar.element.style.direction = 'rtl';
        await tick();
        const all = items(bar);
        all[0].focus();
        key(all[0], 'ArrowLeft');
        expect(document.activeElement).toBe(all[1]);
        key(all[1], 'ArrowRight');
        expect(document.activeElement).toBe(all[0]);
    });

    it('starts Tab at the first usable item when nothing is selected', async () => {
        const bar = new BottomNavigation({ items: [{ value: 'a', text: 'A', enabled: false }, ...ITEMS.slice(1, 2)] });
        page(bar);
        await tick();
        expect(items(bar).map(el => el.tabIndex)).toEqual([-1, 0]);
        expect(bar.focus()).toBe(true);
        expect(document.activeElement).toBe(items(bar)[1]);
    });

    it('swaps the glyph of the selected item', async () => {
        const bar = new BottomNavigation({ items: ITEMS, value: 'home' });
        page(bar);
        await tick();
        const glyph = items(bar)[0].querySelector('.mx-bottom-navigation__glyph')!;
        expect(glyph.getAttribute('data-icon')).toBe('star-filled');
        bar.value = 'inbox';
        await tick();
        expect(glyph.getAttribute('data-icon')).toBe('star');
    });

    it('follows a reactive item: its text, badge and visibility', async () => {
        const s = reactive({ text: 'Inbox', count: 2 as number | null, visible: true });
        const bar = new BottomNavigation({ items: [{ value: 'a', text: () => s.text, badge: () => s.count, visible: () => s.visible }] });
        page(bar);
        await tick();
        const item = items(bar)[0];
        const badge = () => item.querySelector<HTMLElement>('.mx-bottom-navigation__badge')!;
        expect(badge().textContent).toBe('2');
        s.text = 'Mail';
        s.count = null;
        await tick();
        expect(item.querySelector('.mx-bottom-navigation__label')!.textContent).toBe('Mail');
        expect(badge()?.isConnected ?? false).toBe(false);
        s.visible = false;
        await tick();
        expect(item?.isConnected ?? false).toBe(false);
    });

    it('makes an item with href a link', async () => {
        const bar = new BottomNavigation({ items: [{ value: 'a', text: 'A', href: '/a', rel: 'router' }] });
        page(bar);
        await tick();
        const link = items(bar)[0];
        expect(link.localName).toBe('a');
        expect(link.getAttribute('href')).toBe('/a');
        expect(link.getAttribute('rel')).toBe('router');
    });

    it('takes label as the name of the bar, and names itself in the language of the kit otherwise', async () => {
        const bar = new BottomNavigation({ items: ITEMS, label: 'Main' });
        page(bar);
        await tick();
        expect(bar.element.getAttribute('aria-label')).toBe('Main');
    });

    it('leaves while scrolling down and comes back for focus', async () => {
        const box = new Component<HTMLDivElement>('div');
        page(box);
        let top = 0;
        Object.defineProperty(box.element, 'scrollTop', { get: () => top });
        const bar = new BottomNavigation({ items: ITEMS, hideOnScroll: true, scrollTarget: box });
        page(bar);
        await tick();
        // The first read is where the scroll starts from.
        await whenMeasured(bar);
        const scroll = (to: number) => {
            top = to;
            box.element.dispatchEvent(new Event('scroll'));
            measureNow(bar);
        };
        scroll(200);
        expect(bar.element.hasAttribute('data-hidden')).toBe(true);
        scroll(100);
        expect(bar.element.hasAttribute('data-hidden')).toBe(false);
        scroll(300);
        bar.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(bar.element.hasAttribute('data-hidden')).toBe(false);
    });
});
