import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, settled, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Resizable } from './Resizable';

const hosts: Component[] = [];

afterEach(async () => {
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

const handles = (r: Resizable) => Array.from(r.element.querySelectorAll<HTMLElement>('.mx-resizable__handle'));
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const pointer = (el: EventTarget, type: string, x: number, y: number) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, isPrimary: true }));
// jsdom lays nothing out: the box is as wide and tall as its inline size says, else as given.
const measured = (r: Resizable, w: number, h: number) => {
    const el = r.element;
    Object.defineProperty(el, 'offsetWidth', { get: () => parseFloat(el.style.inlineSize) || w, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { get: () => parseFloat(el.style.blockSize) || h, configurable: true });
};

describe('Resizable', () => {
    it('frames its content with eight handles and a grip; the handles asked for stay, the rest go', async () => {
        let r!: Resizable;
        page(
            <Resizable ref={(x: Resizable) => (r = x)} width={240} height="10rem">
                <span class="in" />
            </Resizable>
        );
        await settle();
        expect(r.element.querySelector('span.in')).not.toBe(null);
        expect(handles(r).map(h => h.dataset.edge)).toEqual(['top', 'bottom', 'start', 'end', 'top-start', 'top-end', 'bottom-start', 'bottom-end']);
        expect(handles(r).every(h => !h.hidden)).toBe(true);
        expect(r.element.style.inlineSize).toBe('240px');
        expect(r.element.style.blockSize).toBe('10rem');
        const grip = r.grip.element;
        expect(grip.getAttribute('role')).toBe('button');
        expect(grip.tabIndex).toBe(0);
        expect(grip.getAttribute('aria-label')).toBe(enStrings.resize);
        r.handles = 'edges';
        await settle();
        expect(handles(r).filter(h => !h.hidden).map(h => h.dataset.edge)).toEqual(['top', 'bottom', 'start', 'end']);
        expect(grip?.isConnected).toBe(true);
        r.handles = ['end'];
        await settle();
        expect(handles(r).filter(h => !h.hidden).map(h => h.dataset.edge)).toEqual(['end']);
        r.handles = [];
        await settle();
        expect(grip?.isConnected ?? false).toBe(false);
        await uiLocale.use('tr');
        expect(grip.getAttribute('aria-label')).not.toBe(enStrings.resize);
    });

    it('the keys on the grip change the size by a step within the limits; x-model and the events get the pixels', async () => {
        const m = reactive({ size: null as { width: number; height: number } | null });
        let r!: Resizable;
        const told: string[] = [];
        page(<Resizable ref={(x: Resizable) => (r = x)} minWidth={200} maxHeight={110} step={10} x-model={() => m.size} onResized={e => told.push(`${e.edge} ${e.width}x${e.height}`)} />);
        await settle();
        measured(r, 200, 100);
        key(r.grip.element, 'ArrowRight');
        expect(r.element.style.inlineSize).toBe('210px');
        // The size is told once it is laid out: in the next measuring round.
        measureNow(r);
        expect(m.size).toEqual({ width: 210, height: 100 });
        expect(told).toEqual(['bottom-end 210x100']);
        key(r.grip.element, 'ArrowLeft');
        key(r.grip.element, 'ArrowLeft');
        expect(r.element.style.inlineSize).toBe('200px');
        key(r.grip.element, 'ArrowDown');
        key(r.grip.element, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
        key(r.grip.element, 'ArrowUp');
        expect(r.element.style.blockSize).toBe('100px');
        measureNow(r);
        expect(r.currentSize).toEqual({ width: 200, height: 100 });
        expect(r.element.querySelector('[aria-live]')!.textContent).toBe('Width 200, height 100');
        m.size = { width: 300, height: 150 };
        await settle();
        expect(r.element.style.inlineSize).toBe('300px');
        expect(r.element.style.blockSize).toBe('150px');
    });

    it('keeps the aspect ratio when told, and onResizeStarting may refuse', async () => {
        let r!: Resizable;
        let refuse = false;
        page(<Resizable ref={(x: Resizable) => (r = x)} keepAspectRatio minWidth={10} minHeight={10} onResizeStarting={e => (e.cancel = refuse)} />);
        await settle();
        measured(r, 200, 100);
        key(r.grip.element, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
        expect(r.element.style.inlineSize).toBe('220px');
        refuse = true;
        key(r.grip.element, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
    });

    it('keeps the edge under the pointer when the page scrolls during a drag, the pointer at rest too: in the flow, and positioned', async () => {
        // A window that lays pages out.
        Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });
        try {
            let r!: Resizable;
            page(
                <div class="room">
                    <Resizable ref={(x: Resizable) => (r = x)} />
                </div>
            );
            await settle();
            measured(r, 200, 200);
            // The page is scrolled down by `scrolled`: the room and the box in it go up on the screen.
            let scrolled = 0;
            const el = r.element;
            el.parentElement!.getBoundingClientRect = () => ({ x: 0, y: 100 - scrolled, width: 600, height: 600, left: 0, top: 100 - scrolled, right: 600, bottom: 700 - scrolled, toJSON: () => ({}) });
            el.getBoundingClientRect = () => {
                const x = parseFloat(el.style.left) || 0;
                const y = 100 - scrolled + (parseFloat(el.style.top) || 0);
                const w = parseFloat(el.style.inlineSize) || 200;
                const h = parseFloat(el.style.blockSize) || 200;
                return { x, y, width: w, height: h, left: x, top: y, right: x + w, bottom: y + h, toJSON: () => ({}) };
            };
            const drag = async (edge: string, from: [number, number], to: [number, number], by: number) => {
                const handle = handles(r).find(h => h.dataset.edge === edge)!;
                pointer(handle, 'pointerdown', ...from);
                pointer(handle, 'pointermove', ...to);
                measureNow(r);
                const before = [el.style.inlineSize, el.style.blockSize, el.style.top];
                // The scroll watch starts a timer turn later.
                await settled();
                scrolled += by;
                document.dispatchEvent(new Event('scroll'));
                measureNow(r);
                pointer(handle, 'pointerup', ...to);
                return [before, [el.style.inlineSize, el.style.blockSize, el.style.top]];
            };
            // In the flow: the bottom edge goes 60 further down the page with it.
            expect(await drag('bottom-end', [200, 300], [220, 310], 60)).toEqual([['220px', '210px', ''], ['220px', '270px', '']]);
            // Positioned: its top edge, which moves the box, stays under the pointer too.
            el.style.position = 'absolute';
            el.style.left = '0px';
            el.style.top = '20px';
            scrolled = 0;
            expect(await drag('top', [100, 120], [100, 130], 40)).toEqual([['220px', '260px', '30px'], ['220px', '220px', '70px']]);
        } finally {
            delete (window as { ResizeObserver?: unknown }).ResizeObserver;
        }
    });
});
