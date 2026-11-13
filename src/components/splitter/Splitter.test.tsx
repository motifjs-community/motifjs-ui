import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { SplitPane } from './SplitPane';
import { Splitter } from './Splitter';

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

const handles = (s: Splitter) => Array.from(s.element.querySelectorAll<HTMLElement>(':scope > .mx-splitter__handle > .mx-splitter__bar'));
const tracks = (s: Splitter) => s.element.style.gridTemplateColumns;
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
// jsdom lays nothing out: the panes say how wide they are.
const widths = (s: Splitter, sizes: number[]) => s.panes.forEach((pane, i) => (pane.element.getBoundingClientRect = () => ({ width: sizes[i], height: 100, top: 0, left: 0, right: sizes[i], bottom: 100, x: 0, y: 0, toJSON: () => ({}) })));

describe('Splitter', () => {
    it('places the JSX panes with a handle between each two; the tracks follow pixels, shares and the rest', async () => {
        let s!: Splitter;
        page(
            <Splitter ref={(x: Splitter) => (s = x)}>
                <SplitPane size={240} minSize={100}>
                    <span class="a" />
                </SplitPane>
                <SplitPane size="30%" />
                <SplitPane key="rest" content={() => new Component('b')} />
            </Splitter>
        );
        await settle();
        expect(s.count).toBe(3);
        expect(s.element.dataset.orientation).toBe('horizontal');
        expect(tracks(s)).toMatch(/240px.*var\(--_splitter-size\).*30fr.*var\(--_splitter-size\).*70fr/);
        const bars = handles(s);
        expect(bars.length).toBe(2);
        expect(bars.map(b => b.getAttribute('role'))).toEqual(['separator', 'separator']);
        expect(bars[0].getAttribute('aria-controls')).toBe(s.panes[0].element.id);
        expect(bars[0].getAttribute('aria-orientation')).toBe('vertical');
        expect(bars[0].getAttribute('aria-label')).toBe(enStrings.resize);
        expect(bars.map(b => b.tabIndex)).toEqual([0, 0]);
        expect(Array.from(s.element.children).map(el => el.className.split(' ').find(c => c.startsWith('mx-splitter__')))).toEqual(['mx-splitter__pane', 'mx-splitter__handle', 'mx-splitter__pane', 'mx-splitter__handle', 'mx-splitter__pane']);
        expect(s.panes[0].element.querySelector('span.a')).not.toBe(null);
        expect(s.panes[2].element.querySelector('b')).not.toBe(null);
        expect(s.panes[2].key).toBe('rest');
        expect(bars[0].parentElement!.querySelector<HTMLElement>('.mx-splitter__fold[data-side="before"]')!.hidden).toBe(true);
        await uiLocale.use('tr');
        expect(bars[0].getAttribute('aria-label')).not.toBe(enStrings.resize);
    });

    it('the keys move a handle by a step within the limits and tell; x-model gets the pixels', async () => {
        const m = reactive({ sizes: null as readonly (number | string | null)[] | null });
        let s!: Splitter;
        const told: string[] = [];
        page(
            <Splitter ref={(x: Splitter) => (s = x)} step={20} x-model={() => m.sizes} onResized={e => told.push(`${e.handle}:${e.sizes.join('/')}`)}>
                <SplitPane size={300} minSize={100} />
                <SplitPane minSize={150} />
                <SplitPane size={300} resizable={false} />
            </Splitter>
        );
        await settle();
        widths(s, [300, 300, 300]);
        const [first, second] = handles(s);
        expect(second.hasAttribute('data-resizable')).toBe(false);
        expect(second.tabIndex).toBe(-1);
        key(first, 'ArrowRight');
        expect(tracks(s)).toMatch(/^[a-z]*\([^)]*320px/);
        expect(tracks(s)).toContain('minmax(150px, 280fr)');
        // The sizes the step gives, from the sizes measured before it.
        expect(told).toEqual(['0:320/280/300']);
        expect(m.sizes).toEqual([320, 280, 300]);
        key(first, 'ArrowLeft');
        expect(tracks(s)).toMatch(/^[a-z]*\([^)]*280px/);
        key(first, 'End');
        expect(tracks(s)).toMatch(/^[a-z]*\([^)]*450px/);
        expect(tracks(s)).toContain('minmax(150px, 150fr)');
        key(first, 'Home');
        expect(tracks(s)).toMatch(/^[a-z]*\([^)]*100px/);
        key(second, 'ArrowRight');
        expect(told.length).toBe(4);
    });

    it('a pane is hidden and shown from its handle, Enter and the buttons; onCollapsing may refuse; focus leaves it', async () => {
        let s!: Splitter;
        const told: string[] = [];
        page(
            <Splitter ref={(x: Splitter) => (s = x)} onCollapsing={e => (e.cancel = e.index === 2)} onCollapsed={e => told.push(`${e.index}:${e.collapsed}${e.byUser ? ' user' : ''}`)}>
                <SplitPane size={200} collapsible>
                    <button class="inside" type="button">In</button>
                </SplitPane>
                <SplitPane />
                <SplitPane size={200} collapsible />
            </Splitter>
        );
        await settle();
        const [first, second] = handles(s);
        const fold = first.parentElement!.querySelector<HTMLButtonElement>('.mx-splitter__fold[data-side="before"]')!;
        expect(fold.hidden).toBe(false);
        expect(fold.getAttribute('aria-label')).toBe(enStrings.splitterCollapse);
        s.panes[0].element.querySelector<HTMLElement>('button.inside')!.focus();
        fold.click();
        await settle();
        expect(s.panes[0].collapsed).toBe(true);
        expect(s.panes[0].element.hasAttribute('data-collapsed')).toBe(true);
        expect(tracks(s).startsWith('0px')).toBe(true);
        expect(fold.getAttribute('aria-label')).toBe(enStrings.splitterExpand);
        expect(document.activeElement).toBe(first);
        expect(first.hasAttribute('data-resizable')).toBe(false);
        key(first, 'Enter');
        await settle();
        expect(s.panes[0].collapsed).toBe(false);
        expect(s.collapse(2)).toBe(false);
        expect(s.panes[2].collapsed).toBe(false);
        second.parentElement!.querySelector<HTMLButtonElement>('.mx-splitter__fold[data-side="after"]')!.click();
        expect(s.panes[2].collapsed).toBe(false);
        expect(told).toEqual(['0:true user', '0:false user']);
        // Programmatically any pane may be hidden; `collapsible` is about the handle.
        expect(s.panes[1].collapse()).toBe(true);
        expect(s.panes[1].expand()).toBe(true);
        expect(s.panes[0].collapse()).toBe(true);
        expect(s.panes[0].expand()).toBe(true);
    });

    it('disposed with its panes, nothing is drawn again and nothing fails', async () => {
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        const warns = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const host = page(
            <Splitter>
                <SplitPane size={100} collapsible />
                <SplitPane />
                <SplitPane size={100} />
            </Splitter>
        );
        await settle();
        await host.dispose();
        const logged = [...errors.mock.calls, ...warns.mock.calls].map(c => c.map(String).join(' ')).filter(s => /MJX|motifjs/i.test(s));
        errors.mockRestore();
        warns.mockRestore();
        expect(logged).toEqual([]);
    });

    it('panes are added, inserted and removed programmatically; sizes given take the place of the panes’ own; vertical', async () => {
        const s = new Splitter({ orientation: 'vertical', sizes: [100, null, 200] });
        page(s);
        await settle();
        const a = s.add(new SplitPane({ size: 50 }));
        const c = s.add(new SplitPane({ size: 60 }));
        const b = s.insert(1, new SplitPane({ size: 70 }));
        await settle();
        expect(s.panes).toEqual([a, b, c]);
        expect(s.element.style.gridTemplateRows).toMatch(/100px.*var\(--_splitter-size\).*100fr.*var\(--_splitter-size\).*200px/);
        expect(handles(s)[0].getAttribute('aria-orientation')).toBe('horizontal');
        s.sizes = null;
        await settle();
        expect(s.element.style.gridTemplateRows).toMatch(/50px.*var\(--_splitter-size\).*70px.*var\(--_splitter-size\).*60px/);
        expect(s.remove(b)).toBe(true);
        await settle();
        expect(b.isDisposed).toBe(true);
        expect(s.panes).toEqual([a, c]);
        expect(handles(s).length).toBe(1);
        a.visible = false;
        await settle();
        expect(handles(s).length).toBe(0);
        expect(s.element.style.gridTemplateRows).toMatch(/^[a-z]*\([^)]*60px\)$/);
    });
});
