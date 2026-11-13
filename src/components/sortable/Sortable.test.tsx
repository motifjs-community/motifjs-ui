import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Sortable } from './Sortable';

const hosts: Component[] = [];

afterEach(async () => {
    vi.restoreAllMocks();
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

// The items' elements, read from the sortable's parts.
const elements = <T,>(s: Sortable<T>) => s.itemParts().map(item => item.element as HTMLElement);
const texts = <T,>(s: Sortable<T>) => elements(s).map(el => el.textContent);
const key = (el: Element, key: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

/** Lays the items out one under the other, 20 px each, so the places can be told apart. */
function layOut(s: Sortable<unknown>) {
    elements(s).forEach((el, i) => vi.spyOn(el, 'getBoundingClientRect').mockImplementation(() => ({ top: i * 20, bottom: i * 20 + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: i * 20, toJSON: () => ({}) }) as DOMRect));
    vi.spyOn(s.element, 'getBoundingClientRect').mockImplementation(() => ({ top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect);
}

const pointer = (el: EventTarget, type: string, x: number, y: number, extra: PointerEventInit = {}) =>
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y, button: 0, pointerType: 'mouse', ...extra }));

describe('Sortable', () => {
    it('takes its JSX children as items, each a Tab stop in turn, and Ctrl + an arrow moves the focused one', async () => {
        const told: string[] = [];
        let s!: Sortable<unknown>;
        page(
            <Sortable ref={(x: Sortable<unknown>) => (s = x)} label="Steps" onReorder={e => told.push(`${e.fromIndex}>${e.toIndex}`)}>
                <div>One</div>
                <div>Two</div>
                <div>Three</div>
            </Sortable>
        );
        await settle();
        expect(s.element.getAttribute('aria-label')).toBe('Steps');
        expect(texts(s)).toEqual(['One', 'Two', 'Three']);
        expect(elements(s).every(el => el.classList.contains('mx-sortable__item'))).toBe(true);
        expect(elements(s).map(el => el.tabIndex)).toEqual([0, -1, -1]);
        const one = elements(s)[0];
        one.focus();
        key(one, 'ArrowDown', { ctrlKey: true });
        expect(texts(s)).toEqual(['Two', 'One', 'Three']);
        expect(told).toEqual(['0>1']);
        expect(document.activeElement).toBe(one);
        key(one, 'End', { ctrlKey: true });
        expect(texts(s)).toEqual(['Two', 'Three', 'One']);
        expect(s.live.element.textContent).toBe('Moved to 3 of 3');
        key(one, 'ArrowDown');
        expect(texts(s)).toEqual(['Two', 'Three', 'One']);
        await uiLocale.use('tr');
        key(one, 'ArrowUp', { ctrlKey: true });
        expect(s.live.element.textContent).not.toBe('Moved to 2 of 3');
    });

    it('draws items with a template, keeps their rows when the order comes back changed, and takes a handle', async () => {
        const state = reactive({ list: ['a', 'b', 'c'] });
        const made: string[] = [];
        let s!: Sortable<string>;
        page(
            <Sortable
                ref={(x: Sortable<string>) => (s = x)}
                items={() => state.list}
                itemTemplate={item => {
                    made.push(item);
                    // The handle is a component of the item: the sortable finds it in the component tree.
                    const row = new Component<HTMLDivElement>('div');
                    const grip = new Component<HTMLSpanElement>('span');
                    grip.class.add('grip');
                    const name = new Component<HTMLElement>('b');
                    name.element.textContent = item;
                    row.controls.add(grip);
                    row.controls.add(name);
                    return row;
                }}
                handle=".grip"
                onReorder={e => {
                    const next = state.list.slice();
                    next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
                    state.list = next;
                }}
            />
        );
        await settle();
        expect(texts(s)).toEqual(['a', 'b', 'c']);
        expect(made).toEqual(['a', 'b', 'c']);
        const grips = elements(s).map(el => el.querySelector<HTMLElement>('.grip')!);
        expect(grips.map(g => g.tabIndex)).toEqual([0, -1, -1]);
        expect(grips[0].getAttribute('role')).toBe('button');
        key(grips[0], 'ArrowDown', { ctrlKey: true });
        await settle();
        expect(state.list).toEqual(['b', 'a', 'c']);
        expect(texts(s)).toEqual(['b', 'a', 'c']);
        expect(made).toEqual(['a', 'b', 'c']);
        state.list = ['c', 'b', 'a'];
        await settle();
        expect(texts(s)).toEqual(['c', 'b', 'a']);
        expect(made).toEqual(['a', 'b', 'c']);
        state.list = ['c', 'a'];
        await settle();
        expect(texts(s)).toEqual(['c', 'a']);
    });

    it('drags an item with the pointer to a new place, telling the drag and the drop; Escape cancels', async () => {
        const told: string[] = [];
        let s!: Sortable<unknown>;
        page(
            <Sortable ref={(x: Sortable<unknown>) => (s = x)} onDragStarting={() => told.push('start')} onDragChanging={e => told.push(`change:${e.toIndex}`)} onDragEnding={() => told.push('end')} onReorder={e => told.push(`reorder:${e.fromIndex}>${e.toIndex}`)}>
                <div>One</div>
                <div>Two</div>
                <div>Three</div>
            </Sortable>
        );
        await settle();
        layOut(s);
        Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => s.element });
        const one = elements(s)[0];
        pointer(one, 'pointerdown', 10, 10);
        pointer(window, 'pointermove', 10, 12);
        expect(s.isDragging).toBe(false);
        pointer(window, 'pointermove', 10, 30);
        measureNow(s);
        expect(s.isDragging).toBe(true);
        expect(one.hasAttribute('data-dragging')).toBe(true);
        pointer(window, 'pointermove', 10, 55);
        measureNow(s);
        expect(s.line.element.hidden).toBe(false);
        pointer(window, 'pointerup', 10, 55);
        expect(s.isDragging).toBe(false);
        expect(texts(s)).toEqual(['Two', 'Three', 'One']);
        expect(told).toEqual(['start', 'change:1', 'change:2', 'end', 'reorder:0>2']);
        pointer(elements(s)[2], 'pointerdown', 10, 50);
        pointer(window, 'pointermove', 10, 20);
        expect(s.isDragging).toBe(true);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        expect(s.isDragging).toBe(false);
        expect(texts(s)).toEqual(['Two', 'Three', 'One']);
    });

    it('may be told not to reorder, and a refused drag start goes nowhere', async () => {
        let s!: Sortable<unknown>;
        page(
            <Sortable ref={(x: Sortable<unknown>) => (s = x)} allowReordering={false}>
                <div>One</div>
                <div>Two</div>
            </Sortable>
        );
        await settle();
        expect(s.element.hasAttribute('data-sortable')).toBe(false);
        expect(elements(s)[0].hasAttribute('tabindex')).toBe(false);
        key(elements(s)[0], 'ArrowDown', { ctrlKey: true });
        expect(texts(s)).toEqual(['One', 'Two']);
        s.allowReordering = true;
        expect(elements(s)[0].tabIndex).toBe(0);
        s.onDragStarting(e => (e.cancel = true));
        expect(s.move(0, 1)).toBe(false);
        expect(texts(s)).toEqual(['One', 'Two']);
    });
});
