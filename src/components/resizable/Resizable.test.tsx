import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
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
        const grip = r.gripElement;
        expect(grip.getAttribute('role')).toBe('button');
        expect(grip.tabIndex).toBe(0);
        expect(grip.getAttribute('aria-label')).toBe(enStrings.resize);
        r.handles = 'edges';
        await settle();
        expect(handles(r).filter(h => !h.hidden).map(h => h.dataset.edge)).toEqual(['top', 'bottom', 'start', 'end']);
        expect(grip.hidden).toBe(false);
        r.handles = ['end'];
        await settle();
        expect(handles(r).filter(h => !h.hidden).map(h => h.dataset.edge)).toEqual(['end']);
        r.handles = [];
        await settle();
        expect(grip.hidden).toBe(true);
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
        key(r.gripElement, 'ArrowRight');
        expect(r.element.style.inlineSize).toBe('210px');
        expect(m.size).toEqual({ width: 210, height: 100 });
        expect(told).toEqual(['bottom-end 210x100']);
        key(r.gripElement, 'ArrowLeft');
        key(r.gripElement, 'ArrowLeft');
        expect(r.element.style.inlineSize).toBe('200px');
        key(r.gripElement, 'ArrowDown');
        key(r.gripElement, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
        key(r.gripElement, 'ArrowUp');
        expect(r.element.style.blockSize).toBe('100px');
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
        key(r.gripElement, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
        expect(r.element.style.inlineSize).toBe('220px');
        refuse = true;
        key(r.gripElement, 'ArrowDown');
        expect(r.element.style.blockSize).toBe('110px');
    });
});
