import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Draggable } from './Draggable';
import { DropTarget } from './DropTarget';

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

const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const pointer = (el: EventTarget, type: string, x: number, y: number) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, isPrimary: true }));
const rect = (el: HTMLElement, x: number, y: number, w: number, h: number) => (el.getBoundingClientRect = () => ({ x, y, width: w, height: h, left: x, top: y, right: x + w, bottom: y + h, toJSON: () => ({}) }));

describe('Draggable', () => {
    it('is a group named Move that takes the keys; with a handle, the handle does', async () => {
        let d!: Draggable;
        page(
            <Draggable ref={(x: Draggable) => (d = x)}>
                <span class="grip">⋮</span>
                <button type="button" class="inside">In</button>
            </Draggable>
        );
        await settle();
        const el = d.element;
        expect(el.getAttribute('role')).toBe('group');
        expect(el.getAttribute('aria-roledescription')).toBe('draggable');
        expect(el.tabIndex).toBe(0);
        expect(el.getAttribute('aria-label')).toBe(enStrings.move);
        d.handle = '.grip';
        await settle();
        const grip = el.querySelector<HTMLElement>('.grip')!;
        expect(d.handlePart?.element).toBe(grip);
        expect(grip.classList.contains('mx-draggable__handle')).toBe(true);
        expect(grip.getAttribute('role')).toBe('button');
        expect(grip.tabIndex).toBe(0);
        expect(grip.getAttribute('aria-label')).toBe(enStrings.move);
        expect(el.hasAttribute('tabindex')).toBe(false);
        expect(el.hasAttribute('data-handle')).toBe(true);
        await uiLocale.use('tr');
        expect(grip.getAttribute('aria-label')).not.toBe(enStrings.move);
        d.handle = null;
        await settle();
        expect(grip.classList.contains('mx-draggable__handle')).toBe(false);
        expect(grip.hasAttribute('role')).toBe(false);
        expect(el.tabIndex).toBe(0);
    });

    it('the arrow keys move it by a step along the axis, inside the boundary; x-model and the events follow', async () => {
        const m = reactive({ at: null as { x: number; y: number } | null });
        let d!: Draggable;
        const told: string[] = [];
        page(
            <div class="room">
                <Draggable ref={(x: Draggable) => (d = x)} step={20} axis="x" boundary="parent" x-model={() => m.at} onDragEnded={e => told.push(`${e.x},${e.y}`)} />
            </div>
        );
        await settle();
        const room = d.element.parentElement!;
        rect(room, 0, 0, 300, 100);
        // The box lies where its position says.
        d.element.getBoundingClientRect = () => ({ x: d.currentPosition.x, y: d.currentPosition.y, width: 100, height: 50, left: d.currentPosition.x, top: d.currentPosition.y, right: d.currentPosition.x + 100, bottom: d.currentPosition.y + 50, toJSON: () => ({}) });
        key(d.element, 'ArrowRight');
        expect(d.currentPosition).toEqual({ x: 20, y: 0 });
        expect(m.at).toEqual({ x: 20, y: 0 });
        key(d.element, 'ArrowDown');
        expect(d.currentPosition).toEqual({ x: 20, y: 0 });
        key(d.element, 'ArrowLeft');
        key(d.element, 'ArrowLeft');
        expect(d.currentPosition).toEqual({ x: 0, y: 0 });
        expect(told).toEqual(['20,0', '0,0']);
        expect(d.element.querySelector('[aria-live]')!.textContent).toBe('Moved 0 across and 0 down');
        m.at = { x: 40, y: 10 };
        await settle();
        expect(d.currentPosition).toEqual({ x: 40, y: 10 });
    });

    it('a drag over a target of its group tells the target, which may refuse; the drop hands the data over', async () => {
        let d!: Draggable;
        let t!: DropTarget;
        let other!: DropTarget;
        const told: string[] = [];
        page(
            <div>
                <Draggable ref={(x: Draggable) => (d = x)} group="cards" data={{ id: 7 }} onDragStarting={() => told.push('start')} onDragEnded={e => told.push(`end ${e.dropped ? 'dropped' : 'kept'} ${e.x},${e.y}`)} />
                <DropTarget ref={(x: DropTarget) => (t = x)} group="cards" onDragEntering={e => told.push(`enter ${(e.data as { id: number }).id}`)} onDragLeaving={() => told.push('leave')} onDropped={e => told.push(`drop ${(e.data as { id: number }).id}`)} />
                <DropTarget ref={(x: DropTarget) => (other = x)} group="other" onDragEntering={() => told.push('other')} />
            </div>
        );
        await settle();
        rect(d.element, 0, 0, 50, 50);
        // The targets are where the drag reads their boxes: the other one around (40, 40), this one from (45, 45).
        rect(other.element, 35, 35, 9, 9);
        rect(t.element, 45, 45, 55, 55);
        // Each move is aimed in the next measuring round.
        const move = (x: number, y: number) => {
            pointer(window, 'pointermove', x, y);
            measureNow(d);
        };
        pointer(d.element, 'pointerdown', 10, 10);
        move(12, 12);
        expect(d.isDragging).toBe(false);
        move(30, 30);
        expect(d.isDragging).toBe(true);
        expect(d.element.hasAttribute('data-dragging')).toBe(true);
        expect(t.element.hasAttribute('data-drop-active')).toBe(true);
        expect(other.element.hasAttribute('data-drop-active')).toBe(false);
        move(40, 40);
        move(50, 50);
        expect(t.element.hasAttribute('data-drop-over')).toBe(true);
        move(60, 20);
        expect(t.element.hasAttribute('data-drop-over')).toBe(false);
        move(70, 70);
        pointer(window, 'pointerup', 70, 70);
        expect(d.isDragging).toBe(false);
        expect(d.currentPosition).toEqual({ x: 60, y: 60 });
        expect(t.element.hasAttribute('data-drop-active')).toBe(false);
        expect(told).toEqual(['start', 'enter 7', 'leave', 'enter 7', 'drop 7', 'end dropped 60,60']);
        // Refused: the target says no, the drop lands nowhere; Escape brings it back.
        told.length = 0;
        t.onDragEntering(e => (e.cancel = true));
        pointer(d.element, 'pointerdown', 70, 70);
        move(90, 90);
        expect(t.element.hasAttribute('data-drop-refused')).toBe(true);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        expect(d.isDragging).toBe(false);
        expect(d.currentPosition).toEqual({ x: 60, y: 60 });
        expect(told).toEqual(['start', 'enter 7', 'end kept 60,60']);
    });
});
