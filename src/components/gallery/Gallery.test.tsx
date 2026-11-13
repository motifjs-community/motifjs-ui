import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Gallery } from './Gallery';
import type { GalleryItem } from './gallery-item';

const hosts: Component[] = [];

afterEach(async () => {
    vi.useRealTimers();
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
    const host = mountHost(...children);
    hosts.push(host);
    return host;
}

async function settle() {
    for (let i = 0; i < 4; i++) await tick();
}

const panes = (g: Gallery) => Array.from(g.element.querySelectorAll<HTMLElement>('.mx-gallery__item'));
const dots = (g: Gallery) => Array.from(g.element.querySelectorAll<HTMLButtonElement>('.mx-gallery__dot'));
const nav = (g: Gallery, direction: string) => g.element.querySelector<HTMLButtonElement>(`.mx-gallery__nav[data-direction='${direction}']`)!;
const hidden = (g: Gallery) => panes(g).map(p => p.getAttribute('aria-hidden'));
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const pointer = (el: HTMLElement, type: string, pointerType = 'mouse') => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType }));

describe('Gallery', () => {
    it('draws a pane per item with its image and caption, the dots and the buttons; the pane in view is read, the others hidden', async () => {
        let g!: Gallery;
        page(<Gallery ref={(x: Gallery) => (g = x)} items={['a.png', { image: 'b.png', alt: 'A boat', text: 'Two', description: 'Second' }, { key: 'c', content: () => new Component('p') }]} />);
        await settle();
        expect(g.element.getAttribute('role')).toBe('region');
        expect(g.element.getAttribute('aria-roledescription')).toBe('carousel');
        expect(g.element.getAttribute('aria-label')).toBe(enStrings.gallery);
        const [a, b, c] = panes(g);
        expect(panes(g).length).toBe(3);
        expect(a.getAttribute('aria-roledescription')).toBe('slide');
        expect(a.getAttribute('aria-label')).toBe('Slide 1 of 3');
        expect(a.querySelector('img')!.getAttribute('src')).toBe('a.png');
        expect(a.querySelector('.mx-gallery__caption')).toBe(null);
        expect(b.querySelector('img')!.alt).toBe('A boat');
        expect(b.querySelector('.mx-gallery__title')!.textContent).toBe('Two');
        expect(b.querySelector('.mx-gallery__description')!.textContent).toBe('Second');
        expect(c.querySelector('img')).toBe(null);
        expect(c.querySelector('.mx-gallery__figure > p')).not.toBe(null);
        expect(hidden(g)).toEqual([null, 'true', 'true']);
        expect(a.hasAttribute('data-current')).toBe(true);
        expect(dots(g).length).toBe(3);
        expect(dots(g).map(d => d.getAttribute('aria-current'))).toEqual(['true', null, null]);
        expect(dots(g).map(d => d.tabIndex)).toEqual([0, -1, -1]);
        expect(nav(g, 'previous').getAttribute('aria-disabled')).toBe('true');
        expect(nav(g, 'next').getAttribute('aria-disabled')).toBe(null);
        expect(g.element.querySelector('.mx-gallery__play')).toBeNull();
        expect(g.count).toBe(3);
    });

    it('keeps its slides and dots when the value or an item changes, and writes only the slide that changed', async () => {
        const s = reactive({ title: 'One', items: [] as (string | GalleryItem)[] });
        s.items = [{ image: 'a.png', text: () => s.title }, { image: 'b.png', text: 'Two' }, 'c.png'];
        const g = new Gallery({ items: () => s.items });
        page(g);
        await settle();
        const before = panes(g);
        const dotsBefore = dots(g);
        g.value = 1;
        await settle();
        expect(panes(g)).toEqual(before);
        expect(dots(g)).toEqual(dotsBefore);
        expect(before[1].hasAttribute('data-current')).toBe(true);
        const seen: Node[] = [];
        const watcher = new MutationObserver(records => seen.push(...records.map(r => r.target)));
        watcher.observe(g.element, { subtree: true, childList: true, characterData: true, attributes: true });
        s.title = 'Uno';
        await settle();
        watcher.disconnect();
        expect(before[0].querySelector('.mx-gallery__title')!.textContent).toBe('Uno');
        expect(seen.length).toBeGreaterThan(0);
        expect(seen.every(node => before[0].contains(node))).toBe(true);
        // A slide stays with its item: one taken out leaves the others as they are.
        s.items = s.items.filter(item => item !== s.items[0]);
        await settle();
        expect(panes(g)).toEqual(before.slice(1));
        expect(dots(g)).toEqual(dotsBefore.slice(0, 2));
    });

    it('next, previous, goTo and the keys move the pane in view; x-model follows; loop goes around the ends', async () => {
        const s = reactive({ shown: 0 as string | number | null });
        let g!: Gallery;
        page(<Gallery ref={(x: Gallery) => (g = x)} items={['a.png', 'b.png', { key: 'c', image: 'c.png' }]} x-model={() => s.shown} />);
        await settle();
        expect(await g.next()).toBe(true);
        await settle();
        expect(s.shown).toBe(1);
        expect(hidden(g)).toEqual(['true', null, 'true']);
        const viewport = g.element.querySelector<HTMLElement>('.mx-gallery__viewport')!;
        key(viewport, 'ArrowRight');
        await settle();
        expect(g.selectedIndex).toBe(2);
        expect(s.shown).toBe('c');
        expect(await g.next()).toBe(false);
        expect(nav(g, 'next').getAttribute('aria-disabled')).toBe('true');
        g.loop = true;
        await settle();
        expect(nav(g, 'next').getAttribute('aria-disabled')).toBe(null);
        expect(await g.next()).toBe(true);
        await settle();
        expect(g.selectedIndex).toBe(0);
        expect(await g.previous()).toBe(true);
        expect(g.selectedIndex).toBe(2);
        key(viewport, 'Home');
        expect(g.selectedIndex).toBe(0);
        key(viewport, 'End');
        expect(g.selectedIndex).toBe(2);
        expect(await g.goTo('c')).toBe(false);
        expect(await g.goTo(1)).toBe(true);
        s.shown = 0;
        await settle();
        expect(g.selectedIndex).toBe(0);
    });

    it('a press on a dot or a nav button changes the pane and tells byUser; onSlideChanging may refuse', async () => {
        let g!: Gallery;
        const told: string[] = [];
        page(
            <Gallery
                ref={(x: Gallery) => (g = x)}
                items={['a.png', 'b.png', 'c.png']}
                onSlideChanging={e => {
                    if (e.to === 2) e.cancel = true;
                }}
                onSlideChanged={e => told.push(`${e.previous}>${e.index}${e.byUser ? ' user' : ''}`)}
            />
        );
        await settle();
        dots(g)[2].click();
        await settle();
        expect(g.selectedIndex).toBe(0);
        nav(g, 'next').click();
        await settle();
        expect(g.selectedIndex).toBe(1);
        expect(dots(g)[1].getAttribute('aria-current')).toBe('true');
        nav(g, 'previous').click();
        await settle();
        await g.goTo(1);
        await settle();
        expect(told).toEqual(['0>1 user', '1>0 user', '0>1']);
    });

    it('several panes side by side: the first in view and its neighbours are shown; next stops when the last is in', async () => {
        let g!: Gallery;
        page(<Gallery ref={(x: Gallery) => (g = x)} items={['a', 'b', 'c', 'd', 'e']} itemsPerPage={2} />);
        await settle();
        expect(hidden(g)).toEqual([null, null, 'true', 'true', 'true']);
        expect(g.element.querySelector<HTMLElement>('.mx-gallery__track')!.style.getPropertyValue('--_per')).toBe('2');
        await g.goTo(4);
        await settle();
        expect(g.selectedIndex).toBe(3);
        expect(hidden(g)).toEqual(['true', 'true', 'true', null, null]);
        expect(nav(g, 'next').getAttribute('aria-disabled')).toBe('true');
        expect(await g.next()).toBe(false);
    });

    it('the slideshow moves on by itself, waits under the pointer and while focus is inside, and its button pauses it', async () => {
        vi.useFakeTimers();
        let g!: Gallery;
        page(<Gallery ref={(x: Gallery) => (g = x)} items={['a', 'b', 'c']} slideInterval={1000} />);
        await settle();
        const play = g.element.querySelector<HTMLButtonElement>('.mx-gallery__play')!;
        const viewport = g.element.querySelector<HTMLElement>('.mx-gallery__viewport')!;
        expect(play?.isConnected).toBe(true);
        expect(play.getAttribute('aria-label')).toBe(enStrings.galleryPause);
        expect(g.element.hasAttribute('data-playing')).toBe(true);
        expect(viewport.getAttribute('aria-live')).toBe('off');
        vi.advanceTimersByTime(1000);
        await settle();
        expect(g.selectedIndex).toBe(1);
        pointer(g.element, 'pointerenter');
        expect(viewport.getAttribute('aria-live')).toBe('polite');
        vi.advanceTimersByTime(2500);
        expect(g.selectedIndex).toBe(1);
        pointer(g.element, 'pointerleave');
        vi.advanceTimersByTime(1000);
        await settle();
        expect(g.selectedIndex).toBe(2);
        vi.advanceTimersByTime(1000);
        await settle();
        expect(g.selectedIndex).toBe(0);
        viewport.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        vi.advanceTimersByTime(2500);
        expect(g.selectedIndex).toBe(0);
        viewport.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
        play.click();
        expect(play.getAttribute('aria-label')).toBe(enStrings.galleryPlay);
        expect(g.element.hasAttribute('data-playing')).toBe(false);
        vi.advanceTimersByTime(3000);
        expect(g.selectedIndex).toBe(0);
        play.click();
        vi.advanceTimersByTime(1000);
        await settle();
        expect(g.selectedIndex).toBe(1);
        g.pause();
        expect(g.isPlaying).toBe(false);
    });

    it('an item press is told, the items are read again on refresh, and the texts follow the language', async () => {
        let g!: Gallery;
        const items = [{ text: 'One' }, { text: 'Two' }];
        const clicked: number[] = [];
        page(<Gallery ref={(x: Gallery) => (g = x)} items={items} onItemClick={e => clicked.push(e.index)} />);
        await settle();
        panes(g)[0].querySelector<HTMLElement>('.mx-gallery__figure')!.click();
        expect(clicked).toEqual([0]);
        items[1].text = 'Second';
        g.refresh();
        await settle();
        expect(panes(g)[1].querySelector('.mx-gallery__title')!.textContent).toBe('Second');
        expect(panes(g).length).toBe(2);
        await uiLocale.use('tr');
        expect(g.element.getAttribute('aria-label')).not.toBe(enStrings.gallery);
        expect(nav(g, 'next').getAttribute('aria-label')).not.toBe(enStrings.galleryNext);
    });
});
