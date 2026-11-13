import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Timeline } from './Timeline';

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

const items = (t: Timeline) => Array.from(t.element.querySelectorAll<HTMLLIElement>('.mx-timeline__item'));
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const EVENTS = [
    { key: 'start', date: new Date(2026, 2, 1), title: 'Kick-off', description: 'The plan agreed', glyph: 'calendar' },
    { key: 'beta', date: '2026-05-14T10:00:00Z', title: 'Beta', description: 'First users in', tone: 'accent' as const },
    { key: 'ship', date: Date.UTC(2026, 8, 30), title: 'Shipped', tone: 'success' as const, glyph: 'check' }
];

describe('Timeline', () => {
    it('down the page: a row per event with its date in the language, its title, its tone and glyph; folds and sides', async () => {
        let t!: Timeline;
        page(<Timeline ref={(x: Timeline) => (t = x)} items={EVENTS} />);
        await settle();
        const list = t.element.querySelector('.mx-timeline__list')!;
        expect(t.element.dataset.orientation).toBe('vertical');
        expect(list.getAttribute('aria-label')).toBe(enStrings.timeline);
        const rows = items(t);
        expect(rows.length).toBe(3);
        expect(rows.map(r => r.dataset.tone)).toEqual(['default', 'accent', 'success']);
        expect(rows[0].querySelector('.mx-timeline__title')!.textContent).toBe('Kick-off');
        expect(rows[0].querySelector('.mx-timeline__description')!.textContent).toBe('The plan agreed');
        expect(rows[0].querySelector('.mx-timeline__date')!.textContent).toBe(new Intl.DateTimeFormat(uiLocale.locale, { dateStyle: 'medium' }).format(new Date(2026, 2, 1)));
        expect(rows[0].querySelector('.mx-timeline__date')!.getAttribute('datetime')).toBe(new Date(2026, 2, 1).toISOString());
        expect(rows[0].querySelector('.mx-timeline__dot-glyph')!.getAttribute('data-icon')).toBe('calendar');
        expect(rows[1].querySelector<HTMLElement>('.mx-timeline__dot-glyph')!.hidden).toBe(true);
        expect(rows[2].querySelector<HTMLElement>('.mx-timeline__description')!.hidden).toBe(true);
        expect(rows.map(r => r.querySelector('.mx-timeline__card')!.tagName)).toEqual(['DIV', 'DIV', 'DIV']);
        expect(rows.map(r => r.dataset.side)).toEqual(['end', 'end', 'end']);
        t.alternate = true;
        await settle();
        expect(items(t).map(r => r.dataset.side)).toEqual(['end', 'start', 'end']);
        t.collapsible = true;
        await settle();
        const cards = items(t).map(r => r.querySelector<HTMLButtonElement>('.mx-timeline__card')!);
        expect(cards.map(c => c.tagName)).toEqual(['BUTTON', 'BUTTON', 'BUTTON']);
        expect(cards[0].getAttribute('aria-expanded')).toBe('false');
        expect(cards[0].querySelector<HTMLElement>('.mx-timeline__description')!.hidden).toBe(true);
        cards[0].click();
        await settle();
        expect(cards[0].getAttribute('aria-expanded')).toBe('true');
        expect(cards[0].querySelector<HTMLElement>('.mx-timeline__description')!.hidden).toBe(false);
        expect(t.isUnfolded('start')).toBe(true);
        t.unfold('start', false);
        expect(cards[0].getAttribute('aria-expanded')).toBe('false');
        t.dateFormat = { year: 'numeric' };
        await settle();
        expect(cards[0].querySelector('.mx-timeline__date')!.textContent).toBe('2026');
        await uiLocale.use('tr');
        expect(list.getAttribute('aria-label')).not.toBe(enStrings.timeline);
    });

    it('along a line: the dates are tabs, the shown event under them; a press, the keys and x-model choose it', async () => {
        const s = reactive({ shown: 'beta' as string | number | null, told: '' });
        let t!: Timeline;
        page(<Timeline ref={(x: Timeline) => (t = x)} orientation="horizontal" items={EVENTS} x-model={() => s.shown} onSelectionChanged={e => (s.told = `${e.previous}>${e.index}${e.byUser ? ' user' : ''}`)} onItemClick={e => (s.told += ` click ${e.index}`)} />);
        await settle();
        const flags = Array.from(t.element.querySelectorAll<HTMLButtonElement>('.mx-timeline__flag'));
        const detail = t.element.querySelector<HTMLElement>('.mx-timeline__detail')!;
        expect(t.element.querySelector('.mx-timeline__list')!.getAttribute('role')).toBe('tablist');
        expect(flags.map(f => f.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
        expect(flags.map(f => f.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
        expect(flags.map(f => f.tabIndex)).toEqual([-1, 0, -1]);
        expect(detail.getAttribute('role')).toBe('tabpanel');
        expect(detail.getAttribute('aria-labelledby')).toBe(flags[1].id);
        expect(detail.querySelector('.mx-timeline__title')!.textContent).toBe('Beta');
        expect(detail.querySelector('.mx-timeline__description')!.textContent).toBe('First users in');
        flags[2].click();
        await settle();
        expect(s.shown).toBe('ship');
        expect(detail.querySelector('.mx-timeline__title')!.textContent).toBe('Shipped');
        expect(detail.querySelector<HTMLElement>('.mx-timeline__description')!.hidden).toBe(true);
        expect(s.told).toBe('1>2 user click 2');
        key(flags[2], 'Home');
        await settle();
        expect(t.selectedIndex).toBe(0);
        expect(document.activeElement).toBe(flags[0]);
        key(flags[0], 'ArrowRight');
        expect(t.selectedIndex).toBe(1);
        s.shown = 'start';
        await settle();
        expect(flags[0].getAttribute('aria-selected')).toBe('true');
        expect(t.goTo('ship')).toBe(true);
        expect(t.selectedIndex).toBe(2);
        expect(t.goTo('nowhere')).toBe(false);
    });

    it('keeps the rows of the events that stay: an event added, taken out or changed writes only its own', async () => {
        let t!: Timeline;
        const s = reactive({ events: [...EVENTS] as { key: string; title: string; date?: Date | string | number }[] });
        page(<Timeline ref={(x: Timeline) => (t = x)} items={() => s.events as never} />);
        await settle();
        const before = items(t);
        const writes: MutationRecord[] = [];
        const watcher = new MutationObserver((list) => writes.push(...list));
        watcher.observe(before[0], { subtree: true, childList: true, characterData: true });
        s.events = [...s.events, { key: 'later', title: 'Later' }];
        await settle();
        expect(items(t).slice(0, 3)).toEqual(before);
        expect(items(t)).toHaveLength(4);
        s.events[1].title = 'Beta 2';
        s.events = s.events.filter((e) => e.key !== 'ship');
        await settle();
        expect(items(t)).toEqual([before[0], before[1], items(t)[2]]);
        expect(before[1].querySelector('.mx-timeline__title')!.textContent).toBe('Beta 2');
        watcher.disconnect();
        expect(writes).toEqual([]);
    });
});
