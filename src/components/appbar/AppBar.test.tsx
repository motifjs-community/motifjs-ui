import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow, whenMeasured } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TextBox } from '../textbox/TextBox';
import { AppBar } from './AppBar';

const hosts: Component[] = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

function page(view: Component): Component {
    const host = mountHost(view);
    hosts.push(host);
    return host;
}

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
});

describe('AppBar', () => {
    it('is a header with its titles, and leaves out what it was not given', async () => {
        const bar = new AppBar({ title: 'Orders' });
        page(bar);
        await tick();
        expect(bar.element.localName).toBe('header');
        expect(bar.element.hasAttribute('title')).toBe(false);
        expect(bar.titlePart.element.textContent).toBe('Orders');
        expect(bar.subtitlePart.element.isConnected).toBe(false);
        expect(bar.start.element.isConnected).toBe(false);
        expect(bar.actionsHost.element.isConnected).toBe(false);
        expect(bar.element.dataset.position).toBe('sticky');
        expect(bar.element.dataset.tone).toBe('surface');
    });

    it('follows reactive titles, and makes the title a heading when asked', async () => {
        const s = reactive({ title: 'One', level: null as number | null });
        const bar = new AppBar({ title: () => s.title, headingLevel: () => s.level });
        page(bar);
        await tick();
        expect(bar.titlePart.element.hasAttribute('role')).toBe(false);
        s.title = 'Two';
        s.level = 1;
        await tick();
        expect(bar.titlePart.element.textContent).toBe('Two');
        expect(bar.titlePart.element.getAttribute('role')).toBe('heading');
        expect(bar.titlePart.element.getAttribute('aria-level')).toBe('1');
    });

    it('names the navigation button in the language of the kit and reports a press', async () => {
        const pressed = vi.fn();
        const bar = new AppBar({ title: 'Orders', navigation: 'menu', onNavigationClick: pressed });
        page(bar);
        await tick();
        const button = bar.navigationButton!;
        expect(button.element.getAttribute('aria-label') ?? button.hint).toBe(enStrings.navigationMenu);
        (button.element as HTMLButtonElement).click();
        expect(pressed).toHaveBeenCalledTimes(1);
        expect(pressed.mock.calls[0][0].navigation).toBe('menu');
        bar.navigation = 'back';
        await tick();
        expect(button.element.hasAttribute('data-back')).toBe(true);
        expect(button.hint).toBe(enStrings.back);
    });

    it('shows a logo, changes it and takes it away', async () => {
        const bar = new AppBar({ title: 'Orders', logo: 'a.png' });
        page(bar);
        await tick();
        expect(bar.logoHost.element.querySelector('img')!.getAttribute('src')).toBe('a.png');
        expect(bar.start.element.isConnected).toBe(true);
        bar.logo = 'b.png';
        await tick();
        expect(bar.logoHost.element.querySelectorAll('img')).toHaveLength(1);
        expect(bar.logoHost.element.querySelector('img')!.getAttribute('src')).toBe('b.png');
        bar.logo = null;
        await tick();
        expect(bar.logoHost.element.querySelector('img')).toBeNull();
        expect(bar.start.element.isConnected).toBe(false);
    });

    it('takes navigationGlyph and navigationLabel over the defaults', async () => {
        const bar = new AppBar({ navigation: 'menu', navigationGlyph: 'dismiss', navigationLabel: 'Close the panel' });
        page(bar);
        await tick();
        expect(bar.navigationGlyph).toBe('dismiss');
        expect(bar.navigationLabel).toBe('Close the panel');
    });

    it('draws its commands with a toolbar and names it', async () => {
        const click = vi.fn();
        const bar = new AppBar({ actions: [{ text: 'Save', click }] });
        page(bar);
        await tick();
        expect(bar.actionsHost.element.isConnected).toBe(true);
        expect(bar.toolbar.element.getAttribute('role')).toBe('toolbar');
        expect(bar.toolbar.element.getAttribute('aria-label')).toBe(enStrings.appBarActions);
        bar.toolbar.element.querySelector('button')!.click();
        expect(click).toHaveBeenCalledTimes(1);
        bar.actions = [];
        await tick();
        expect(bar.actionsHost.element.isConnected).toBe(false);
    });

    it('holds a control given as content, and takes it out again', async () => {
        const box = new TextBox({ label: 'Search' });
        const bar = new AppBar({ title: 'Orders' });
        page(bar);
        await tick();
        expect(bar.contentHost.element.isConnected).toBe(false);
        bar.content = box;
        await tick();
        expect(bar.contentHost.element.contains(box.element)).toBe(true);
        expect(bar.contentHost.element.isConnected).toBe(true);
        bar.content = null;
        await tick();
        expect(bar.contentHost.element.contains(box.element)).toBe(false);
    });

    it('lifts over what scrolls, and leaves when scrolling down until focus comes back', async () => {
        const box = new Component<HTMLDivElement>('div');
        box.element.style.overflow = 'auto';
        page(box);
        let top = 0;
        Object.defineProperty(box.element, 'scrollTop', { get: () => top });
        const bar = new AppBar({ title: 'Orders', scrollBehavior: 'hide', scrollTarget: box });
        page(bar);
        await tick();
        // The first read is where the scroll starts from.
        await whenMeasured(bar);
        const scroll = (to: number) => {
            top = to;
            box.element.dispatchEvent(new Event('scroll'));
            measureNow(bar);
        };
        expect(bar.element.hasAttribute('data-lifted')).toBe(false);
        scroll(200);
        expect(bar.element.hasAttribute('data-lifted')).toBe(true);
        expect(bar.element.hasAttribute('data-hidden')).toBe(true);
        scroll(150);
        expect(bar.element.hasAttribute('data-hidden')).toBe(false);
        scroll(300);
        expect(bar.element.hasAttribute('data-hidden')).toBe(true);
        bar.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(bar.element.hasAttribute('data-hidden')).toBe(false);
        scroll(0);
        expect(bar.element.hasAttribute('data-lifted')).toBe(false);
    });

    it('stops watching when the behavior is none', async () => {
        const box = new Component<HTMLDivElement>('div');
        page(box);
        Object.defineProperty(box.element, 'scrollTop', { get: () => 200 });
        const remove = vi.spyOn(document, 'removeEventListener');
        const bar = new AppBar({ scrollBehavior: 'lift', scrollTarget: box });
        page(bar);
        await tick();
        bar.scrollBehavior = 'none';
        await tick();
        expect(remove.mock.calls.some(([type]) => type === 'scroll')).toBe(true);
        box.element.dispatchEvent(new Event('scroll'));
        measureNow(bar);
        expect(bar.element.hasAttribute('data-lifted')).toBe(false);
    });

    it('stops watching when it is disposed', async () => {
        const box = new Component<HTMLDivElement>('div');
        page(box);
        const remove = vi.spyOn(document, 'removeEventListener');
        const bar = new AppBar({ scrollBehavior: 'lift', scrollTarget: box });
        const host = page(bar);
        await tick();
        await host.dispose();
        expect(remove.mock.calls.some(([type]) => type === 'scroll')).toBe(true);
    });
});
