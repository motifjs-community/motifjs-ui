import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { SpeedDial } from './SpeedDial';

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

const actions = (d: SpeedDial) => Array.from(d.element.querySelectorAll<HTMLButtonElement>('.mx-speed-dial__action'));
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('SpeedDial', () => {
    it('a main button that opens a menu of actions with their labels; a press on one runs it and closes the fan', async () => {
        const s = reactive({ open: false, told: '' });
        let d!: SpeedDial;
        page(
            <SpeedDial
                ref={(x: SpeedDial) => (d = x)}
                position="inline"
                x-model={() => s.open}
                actions={[
                    { text: 'Note', glyph: 'pencil', click: () => (s.told = 'note') },
                    { text: 'Event', glyph: 'calendar', enabled: false },
                    { text: 'File', glyph: 'file', visible: false },
                    { key: 'photo', text: 'Photo', glyph: 'upload' }
                ]}
                onActionClick={e => (s.told += ` ${e.index}`)}
            />
        );
        await settle();
        const main = d.mainElement;
        expect(main.getAttribute('aria-haspopup')).toBe('menu');
        expect(main.getAttribute('aria-expanded')).toBe('false');
        expect(main.getAttribute('aria-label')).toBe(enStrings.actions);
        expect(main.querySelector('.mx-speed-dial__main-glyph')!.getAttribute('data-icon')).toBe('plus');
        expect(d.element.dataset.position).toBe('inline');
        expect(d.element.dataset.direction).toBe('up');
        const fan = d.element.querySelector<HTMLElement>('.mx-speed-dial__fan')!;
        expect(fan.getAttribute('role')).toBe('menu');
        expect(fan.getAttribute('aria-hidden')).toBe('true');
        expect(actions(d).map(a => a.getAttribute('aria-label'))).toEqual(['Note', 'Event', 'File', 'Photo']);
        expect(actions(d).map(a => a.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem']);
        expect(actions(d)[1].getAttribute('aria-disabled')).toBe('true');
        expect(actions(d)[2].hidden).toBe(true);
        expect(actions(d)[0].querySelector('.mx-glyph')!.getAttribute('data-icon')).toBe('pencil');
        expect(actions(d)[0].querySelector('.mx-speed-dial__label')!.textContent).toBe('Note');
        main.click();
        await settle();
        expect(d.isOpen).toBe(true);
        expect(s.open).toBe(true);
        expect(d.element.hasAttribute('data-open')).toBe(true);
        expect(main.getAttribute('aria-expanded')).toBe('true');
        expect(main.querySelector('.mx-speed-dial__main-glyph')!.getAttribute('data-icon')).toBe('dismiss');
        expect(fan.getAttribute('aria-hidden')).toBe(null);
        actions(d)[1].click();
        expect(d.isOpen).toBe(true);
        actions(d)[0].click();
        await settle();
        expect(s.told).toBe('note 0');
        expect(d.isOpen).toBe(false);
        expect(s.open).toBe(false);
        s.open = true;
        await settle();
        expect(main.getAttribute('aria-expanded')).toBe('true');
        await uiLocale.use('tr');
        d.close();
        expect(main.getAttribute('aria-label')).not.toBe(enStrings.actions);
    });

    it('the keys: an arrow on the main button opens the fan on the first action, the arrows move, Escape closes and comes back', async () => {
        let d!: SpeedDial;
        const told: string[] = [];
        page(<SpeedDial ref={(x: SpeedDial) => (d = x)} position="inline" direction="up" actions={[{ text: 'A' }, { text: 'B', enabled: false }, { text: 'C' }]} onOpened={e => told.push(`open ${e.byUser}`)} onClosed={e => told.push(`close ${e.byUser}`)} />);
        await settle();
        const main = d.mainElement;
        main.focus();
        key(main, 'ArrowUp');
        expect(d.isOpen).toBe(true);
        const [a, , c] = actions(d);
        expect(document.activeElement).toBe(a);
        key(a, 'ArrowUp');
        expect(document.activeElement).toBe(c);
        key(c, 'ArrowUp');
        expect(document.activeElement).toBe(a);
        key(a, 'ArrowDown');
        expect(document.activeElement).toBe(c);
        key(c, 'Home');
        expect(document.activeElement).toBe(a);
        key(a, 'Escape');
        expect(d.isOpen).toBe(false);
        expect(document.activeElement).toBe(main);
        key(main, 'ArrowDown');
        expect(document.activeElement).toBe(c);
        d.close();
        expect(told).toEqual(['open true', 'close true', 'open true', 'close false']);
    });

    it('with one action shown, the main button does it itself; a press outside closes the fan', async () => {
        let d!: SpeedDial;
        const told: string[] = [];
        const items = [{ text: 'Only', glyph: 'save', click: () => told.push('only') }, { text: 'Hidden', visible: false }];
        page(<SpeedDial ref={(x: SpeedDial) => (d = x)} position="inline" text="New" extended actions={items} />);
        await settle();
        const main = d.mainElement;
        expect(main.getAttribute('aria-haspopup')).toBe(null);
        expect(main.getAttribute('aria-label')).toBe('Only');
        expect(main.querySelector('.mx-speed-dial__main-glyph')!.getAttribute('data-icon')).toBe('save');
        expect(d.element.hasAttribute('data-single')).toBe(true);
        expect(main.querySelector<HTMLElement>('.mx-speed-dial__main-text')!.textContent).toBe('Only');
        main.click();
        expect(told).toEqual(['only']);
        expect(d.isOpen).toBe(false);
        items[1].visible = true;
        d.refresh();
        await settle();
        expect(main.getAttribute('aria-haspopup')).toBe('menu');
        expect(main.getAttribute('aria-label')).toBe('New');
        expect(main.querySelector<HTMLElement>('.mx-speed-dial__main-text')!.textContent).toBe('New');
        d.show();
        expect(d.isOpen).toBe(true);
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(d.isOpen).toBe(false);
    });
});
