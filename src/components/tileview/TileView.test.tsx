import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TileView } from './TileView';

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

const tiles = (t: TileView) => Array.from(t.element.querySelectorAll<HTMLElement>('.mx-tile-view__tile'));
const texts = (t: TileView) => tiles(t).map(el => el.querySelector('.mx-tile-view__text')!.textContent);
const selected = (t: TileView) => tiles(t).map(el => el.getAttribute('aria-selected'));
const key = (el: HTMLElement, key: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

describe('TileView', () => {
    it('draws a tile per item with its text and spans: a list without selection, a listbox with it', async () => {
        let t!: TileView;
        page(<TileView ref={(x: TileView) => (t = x)} baseItemWidth={120} baseItemHeight={80} items={['Sales', { text: 'Stock', widthRatio: 2 }, { key: 'staff', heightRatio: 2, content: () => new Component('b') }]} />);
        await settle();
        const el = t.element;
        const grid = el.querySelector<HTMLElement>('.mx-tile-view__grid')!;
        expect(grid.getAttribute('role')).toBe('list');
        expect(grid.getAttribute('aria-label')).toBe(enStrings.tiles);
        expect(el.dataset.direction).toBe('horizontal');
        expect(el.style.getPropertyValue('--_base-w')).toBe('120px');
        expect(el.style.getPropertyValue('--_base-h')).toBe('80px');
        expect(texts(t)).toEqual(['Sales', 'Stock', '']);
        expect(tiles(t).map(x => x.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem']);
        expect(tiles(t)[1].style.gridColumn).toBe('span 2');
        expect(tiles(t)[2].style.gridRow).toBe('span 2');
        expect(tiles(t)[2].querySelector('b')).not.toBe(null);
        expect(tiles(t)[2].querySelector<HTMLElement>('.mx-tile-view__text')!.hidden).toBe(true);
        expect(tiles(t).map(x => x.tabIndex)).toEqual([0, -1, -1]);
        t.selectionMode = 'multiple';
        await settle();
        expect(grid.getAttribute('role')).toBe('listbox');
        expect(grid.getAttribute('aria-multiselectable')).toBe('true');
        expect(tiles(t).map(x => x.getAttribute('role'))).toEqual(['option', 'option', 'option']);
        expect(selected(t)).toEqual(['false', 'false', 'false']);
        await uiLocale.use('tr');
        expect(grid.getAttribute('aria-label')).not.toBe(enStrings.tiles);
    });

    it('single and multiple choice by a press, Space and Enter; x-model; a disabled tile is skipped', async () => {
        const m = reactive({ chosen: null as string | number | null | readonly (string | number)[] });
        let t!: TileView;
        const told: string[] = [];
        page(<TileView ref={(x: TileView) => (t = x)} selectionMode="single" x-model={() => m.chosen} items={[{ key: 'a', text: 'A' }, { key: 'b', text: 'B', enabled: false }, { key: 'c', text: 'C' }]} onSelectionChanged={e => told.push(e.indexes.join('+') + (e.byUser ? ' user' : ''))} onItemClick={e => told.push(`click ${e.index}`)} />);
        await settle();
        expect(tiles(t)[1].getAttribute('aria-disabled')).toBe('true');
        tiles(t)[0].click();
        await settle();
        expect(m.chosen).toBe('a');
        expect(selected(t)).toEqual(['true', 'false', 'false']);
        tiles(t)[1].click();
        await settle();
        expect(m.chosen).toBe('a');
        key(tiles(t)[2], 'Enter');
        await settle();
        expect(m.chosen).toBe('c');
        expect(told).toEqual(['click 0', '0 user', 'click 2', '2 user']);
        t.selectionMode = 'multiple';
        m.chosen = ['a'];
        await settle();
        expect(selected(t)).toEqual(['true', 'false', 'false']);
        key(tiles(t)[2], ' ');
        await settle();
        expect(m.chosen).toEqual(['a', 'c']);
        key(tiles(t)[0], ' ');
        await settle();
        expect(m.chosen).toEqual(['c']);
        tiles(t)[0].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
        await settle();
        expect(m.chosen).toEqual(['a', 'c']);
        t.select(2);
        expect(t.selectedIndexes).toEqual([0, 2]);
    });

    it('Ctrl and an arrow move a tile and tell; onReordering may refuse; the items are read again', async () => {
        let t!: TileView;
        const items = [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }];
        const moves: string[] = [];
        page(
            <TileView
                ref={(x: TileView) => (t = x)}
                allowReorder
                items={items}
                onReordering={e => (e.cancel = e.toIndex === 0 && e.fromIndex === 2)}
                onReordered={e => {
                    moves.push(`${e.fromIndex}>${e.toIndex}`);
                    items.splice(e.toIndex, 0, ...items.splice(e.fromIndex, 1));
                }}
            />
        );
        await settle();
        expect(t.element.hasAttribute('data-reorder')).toBe(true);
        tiles(t)[0].focus();
        key(tiles(t)[0], 'ArrowRight', { ctrlKey: true });
        expect(texts(t)).toEqual(['Two', 'One', 'Three']);
        expect(moves).toEqual(['0>1']);
        expect(t.element.querySelector('[aria-live]')!.textContent).toBe('Moved to 2 of 3');
        key(tiles(t)[1], 'End', { ctrlKey: true });
        expect(texts(t)).toEqual(['Two', 'Three', 'One']);
        key(tiles(t)[2], 'Home', { ctrlKey: true });
        expect(texts(t)).toEqual(['Two', 'Three', 'One']);
        t.refresh();
        await settle();
        expect(texts(t)).toEqual(['Two', 'Three', 'One']);
        expect(t.count).toBe(3);
        t.allowReorder = false;
        await settle();
        key(tiles(t)[0], 'ArrowRight', { ctrlKey: true });
        expect(texts(t)).toEqual(['Two', 'Three', 'One']);
    });
});
