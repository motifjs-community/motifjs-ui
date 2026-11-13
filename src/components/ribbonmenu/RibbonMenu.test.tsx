import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
import { uiLocale } from '../../core/ui-locale';
import { RibbonMenu } from './RibbonMenu';
import type { RibbonCommand } from './ribbon-command';
import type { RibbonTab } from './ribbon-tab';

let hosts: Component[] = [];

afterEach(async () => {
    await uiLocale.use('en');
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
});

async function settle() {
    for (let i = 0; i < 5; i++) await tick();
    await new Promise(r => setTimeout(r, 0));
}

async function make(props: Record<string, unknown> = {}) {
    let menu!: RibbonMenu;
    const host = mountHost(<RibbonMenu ref={(m: RibbonMenu) => (menu = m)} {...props} />);
    hosts.push(host);
    await settle();
    return menu;
}

const ran: string[] = [];

const tabs = (extra: { paste?: Partial<RibbonCommand>; picture?: Partial<RibbonTab> } = {}): RibbonTab[] => [
    {
        key: 'home',
        text: '&Home',
        groups: [
            {
                key: 'clipboard',
                text: 'Clipboard',
                more: () => ran.push('more:clipboard'),
                commands: [
                    { key: 'paste', text: 'Paste', glyph: 'file', size: 'large', type: 'split', menu: [{ text: 'Keep text only' }], click: () => ran.push('paste'), ...extra.paste },
                    { key: 'cut', text: 'Cut', glyph: 'trash', click: () => ran.push('cut') },
                    { key: 'copy', text: 'Copy', glyph: 'file', click: () => ran.push('copy') }
                ]
            },
            {
                key: 'font',
                text: 'Font',
                commands: [
                    { type: 'row', commands: [{ key: 'bold', text: 'Bold', glyph: 'pencil', type: 'toggle' }, { key: 'italic', text: 'Italic', glyph: 'pencil', type: 'toggle' }] },
                    { type: 'separator' },
                    { key: 'size', type: 'content', content: () => new Sheet('size') }
                ]
            }
        ]
    },
    { key: 'insert', text: '&Insert', groups: [{ text: 'Tables', commands: [{ key: 'table', text: 'Table', glyph: 'table', size: 'large' }] }] },
    { key: 'picture', text: '&Format', context: 'Picture', visible: false, groups: [{ text: 'Adjust', commands: [{ key: 'crop', text: 'Crop', glyph: 'split' }] }], ...extra.picture }
];

class Sheet extends Component<HTMLDivElement> {
    static made = 0;
    constructor(text: string) {
        super('div');
        this.element.className = 'sheet';
        this.element.textContent = text;
        Sheet.made++;
    }
}

const tab = (menu: RibbonMenu, key: string) => menu.element.querySelector<HTMLElement>(`.mx-ribbon-menu__tab[data-key="${key}"]`)!;
const shownTexts = (menu: RibbonMenu) => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__tab:not([hidden])')).map(t => t.textContent);
const shownPanel = (menu: RibbonMenu) => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__panel:not([hidden])'));
const press = (el: Element, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const rightClick = (el: Element) => el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 40, clientY: 40 }));
const menuItems = (menu: RibbonMenu) => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-popup:not([hidden]) > .mx-menu > .mx-menu__item'));
const menuNames = (menu: RibbonMenu) => menuItems(menu).map(i => i.querySelector('.mx-menu__label')!.textContent);

describe('RibbonMenu', () => {
    it('is an empty shell until it is given tabs, named by the kit until it is given a name', async () => {
        const menu = await make();
        expect(shownTexts(menu)).toEqual([]);
        const list = menu.element.querySelector('.mx-ribbon-menu__tabs')!;
        expect(list.getAttribute('role')).toBe('tablist');
        expect(list.getAttribute('aria-label')).toBe('Commands');
        menu.label = 'Editor';
        await settle();
        expect(list.getAttribute('aria-label')).toBe('Editor');
    });

    it('shows the first tab, makes a tab’s groups only when it is first shown, and keeps them', async () => {
        Sheet.made = 0;
        const told: string[] = [];
        const menu = await make({ items: tabs(), onSelectionChanged: (e: { previous: string; key: string }) => told.push(`${e.previous}>${e.key}`) });
        expect(shownTexts(menu)).toEqual(['Home', 'Insert']);
        expect(tab(menu, 'home').getAttribute('aria-selected')).toBe('true');
        expect(menu.element.querySelectorAll('.mx-ribbon-menu__panel').length).toBe(1);
        expect(Sheet.made).toBe(1);
        const panel = shownPanel(menu)[0];
        expect(panel.getAttribute('aria-labelledby')).toBe(tab(menu, 'home').id);
        expect(Array.from(panel.querySelectorAll('.mx-ribbon-menu__group-label')).map(l => l.textContent)).toEqual(['Clipboard', 'Font']);
        tab(menu, 'insert').click();
        await settle();
        expect(menu.value).toBe('insert');
        expect(shownPanel(menu)[0].textContent).toContain('Table');
        tab(menu, 'home').click();
        await settle();
        expect(shownPanel(menu)[0]).toBe(panel);
        expect(Sheet.made).toBe(1);
        expect(told).toEqual(['home>insert', 'insert>home']);
    });

    it('draws each command by its size and type, and runs it', async () => {
        ran.length = 0;
        const clicked: string[] = [];
        const menu = await make({ items: tabs(), onCommandClick: (e: { command: RibbonCommand }) => clicked.push(String(e.command.key)) });
        const large = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__command[data-ribbon-size="large"]')!;
        expect(large.querySelector('.mx-button__arrow')).not.toBeNull();
        (large.querySelector('.mx-button__main') as HTMLElement).click();
        (large.querySelector('.mx-button__arrow') as HTMLElement).click();
        const small = Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__row > .mx-ribbon-menu__command'));
        expect(small.map(b => b.getAttribute('data-ribbon-size'))).toEqual(['small', 'small']);
        expect(small[0].textContent).toBe('');
        expect(small[0].getAttribute('aria-pressed')).toBe('false');
        small[0].click();
        await settle();
        expect(small[0].getAttribute('aria-pressed')).toBe('true');
        expect(menu.element.querySelector('.mx-ribbon-menu__separator')!.getAttribute('role')).toBe('separator');
        expect(menu.element.querySelector('.mx-ribbon-menu__content .sheet')!.textContent).toBe('size');
        expect(ran).toEqual(['paste']);
        expect(clicked).toEqual(['paste', 'bold']);
    });

    it('opens more options of a group from the button beside its name', async () => {
        ran.length = 0;
        const told: string[] = [];
        const menu = await make({ items: tabs(), onGroupMore: (e: { part: { element: HTMLElement } }) => told.push(e.part.element.className.includes('mx-ribbon-menu__more') ? 'more' : '?') });
        const more = menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__more');
        expect(more.length).toBe(1);
        expect(more[0].getAttribute('title') ?? more[0].getAttribute('aria-label')).toContain('Clipboard');
        more[0].click();
        expect(ran).toEqual(['more:clipboard']);
        expect(told).toEqual(['more']);
    });

    it('shows the tabs of a context in its color while it lasts, its name told and not shown, and follows live fields', async () => {
        const s = reactive({ picture: false, big: true, list: tabs() });
        s.list = tabs({ picture: { visible: () => s.picture }, paste: { size: () => (s.big ? 'large' : 'medium') } });
        const menu = await make({ items: () => s.list });
        expect(tab(menu, 'picture').hidden).toBe(true);
        s.picture = true;
        await settle();
        expect(shownTexts(menu)).toEqual(['Home', 'Insert', 'Format']);
        expect(tab(menu, 'picture').getAttribute('data-context')).toBe('Picture');
        expect(tab(menu, 'picture').getAttribute('aria-description')).toBe('Picture');
        expect(menu.element.querySelector('.mx-ribbon-menu__tabs')!.textContent).not.toContain('Picture');
        s.big = false;
        await settle();
        expect(menu.element.querySelector('.mx-ribbon-menu__command[data-ribbon-size="large"]')).toBeNull();
    });

    it('moves between tabs with the arrows, into the commands with Down, between them with the arrows, and back with Escape', async () => {
        const menu = await make({ items: tabs({ picture: { visible: true } }) });
        tab(menu, 'home').focus();
        press(tab(menu, 'home'), 'ArrowRight');
        await settle();
        expect(document.activeElement).toBe(tab(menu, 'insert'));
        expect(menu.value).toBe('insert');
        press(tab(menu, 'insert'), 'End');
        await settle();
        expect(menu.value).toBe('picture');
        press(tab(menu, 'picture'), 'Home');
        await settle();
        expect(menu.value).toBe('home');
        press(tab(menu, 'home'), 'ArrowDown');
        const main = menu.element.querySelector<HTMLElement>('[data-ribbon-size="large"] > .mx-button__main')!;
        expect(document.activeElement).toBe(main);
        // One Tab stop in each group.
        const stops = Array.from(shownPanel(menu)[0].querySelectorAll<HTMLElement>('.mx-ribbon-menu__group button')).filter(b => b.tabIndex === 0);
        expect(stops.length).toBe(2);
        press(main, 'ArrowRight');
        expect(document.activeElement).toBe(menu.element.querySelector('[data-ribbon-size="large"] > .mx-button__arrow'));
        press(document.activeElement!, 'Escape');
        expect(document.activeElement).toBe(tab(menu, 'home'));
    });

    it('lets go of the panel of a tab that is gone, and asks before another tab shows', async () => {
        const s = reactive({ list: tabs() });
        const menu = await make({ items: () => s.list, onSelecting: (e: { key: string; cancel: boolean }) => (e.cancel = e.key === 'insert') });
        expect(menu.select('insert')).toBe(false);
        expect(menu.value).not.toBe('insert');
        const panel = shownPanel(menu)[0];
        s.list = s.list.filter(t => t.key !== 'home');
        await settle();
        expect(panel.isConnected).toBe(false);
        expect(shownTexts(menu)).toEqual(['Insert']);
    });

    it('switches between the classic and the simplified layout with the button at the end of the tabs, unless it is told not to show it', async () => {
        const told: string[] = [];
        const menu = await make({ items: tabs({ paste: { simple: false } }), onLayoutChanged: (e: { previous: string; layout: string }) => told.push(`${e.previous}>${e.layout}`) });
        expect(menu.element.getAttribute('data-layout')).toBe('classic');
        const button = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__switch')!;
        expect(button.getAttribute('title') ?? button.getAttribute('aria-label')).toBe('Show the simplified layout');
        button.click();
        await settle();
        await whenMeasured(menu);
        expect(menu.layout).toBe('simple');
        expect(menu.element.getAttribute('data-layout')).toBe('simple');
        expect(menu.element.querySelector('[data-ribbon-size="large"].mx-ribbon-menu__command:not(.mx-ribbon-menu__fold)')).toBeNull();
        expect(menu.element.querySelector('.mx-ribbon-menu__command[data-simple-hidden]')!.textContent).toContain('Paste');
        expect(told).toEqual(['classic>simple']);
        menu.layoutSwitch = false;
        await settle();
        expect(button.hidden).toBe(true);
    });

    it('gives way when the commands do not fit: the least important group first, folded into one button that opens the group', async () => {
        const items = tabs();
        (items[0].groups as unknown as { priority?: number }[])[0].priority = 1;
        const menu = await make({ items });
        const panel = shownPanel(menu)[0];
        const groups = () => Array.from(panel.querySelectorAll<HTMLElement>(':scope > .mx-ribbon-menu__group'));
        // A room of 300 pixels that holds the commands once one group is folded.
        Object.defineProperty(panel, 'clientWidth', { configurable: true, get: () => 300 });
        Object.defineProperty(panel, 'scrollWidth', { configurable: true, get: () => (panel.querySelector('[data-folded]') ? 280 : 400) });
        menu.adaptive = false;
        await settle();
        menu.adaptive = true;
        await settle();
        await whenMeasured(menu);
        expect(groups().map(g => g.hasAttribute('data-folded'))).toEqual([false, true]);
        const fold = groups()[1].querySelector<HTMLElement>('.mx-ribbon-menu__fold')!;
        expect(fold.textContent).toContain('Font');
        expect(fold.getAttribute('aria-expanded')).toBe('false');
        fold.click();
        await settle();
        const popup = groups()[1].querySelector<HTMLElement>('.mx-ribbon-menu__drop')!;
        expect(fold.getAttribute('aria-expanded')).toBe('true');
        expect(popup.querySelector('.mx-ribbon-menu__group-label')!.textContent).toBe('Font');
        fold.click();
        await settle();
        expect(groups()[1].querySelector(':scope > .mx-ribbon-menu__group-inner')).not.toBeNull();
        expect(fold.getAttribute('aria-expanded')).toBe('false');
    });

    it('shows only the tabs when told, a tab opening the commands over the page until a command, Escape or a click elsewhere', async () => {
        ran.length = 0;
        const told: string[] = [];
        const menu = await make({ items: tabs(), display: 'tabs', onDisplayChanged: (e: { display: string }) => told.push(e.display) });
        expect(menu.element.getAttribute('data-display')).toBe('tabs');
        expect(menu.isOpenOver).toBe(false);
        tab(menu, 'insert').click();
        await settle();
        expect(menu.isOpenOver).toBe(true);
        expect(menu.value).toBe('insert');
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(menu.isOpenOver).toBe(false);
        tab(menu, 'home').click();
        await settle();
        menu.element.querySelector<HTMLElement>('[data-ribbon-size="medium"]')!.click();
        expect(ran).toEqual(['cut']);
        expect(menu.isOpenOver).toBe(false);
        // A double-click on a tab shows the commands always again.
        tab(menu, 'home').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await settle();
        expect(menu.display).toBe('always');
        expect(told).toEqual(['always']);
        expect(menu.customization.display).toBe('always');
    });

    it('hides behind a strip when told, the strip opening the whole menu over the page', async () => {
        const menu = await make({ items: tabs(), display: 'auto' });
        const strip = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__reveal')!;
        expect(strip.getAttribute('aria-label')).toBe('Show the commands');
        expect(strip.getAttribute('aria-expanded')).toBe('false');
        strip.click();
        await settle();
        expect(menu.isOpenOver).toBe(true);
        expect(strip.getAttribute('aria-expanded')).toBe('true');
        press(tab(menu, 'home'), 'Escape');
        expect(menu.isOpenOver).toBe(false);
    });

    it('has a button before the tabs, the app’s content at their ends, and quick commands the user can add to', async () => {
        const told: string[] = [];
        const saved: string[] = [];
        const end = new Sheet('search');
        const menu = await make({
            items: tabs(),
            appButton: '&File',
            barEnd: end,
            quickCommands: [{ key: 'save', text: 'Save', glyph: 'save', click: () => saved.push('save') }],
            onAppButton: () => told.push('app'),
            onCustomized: (e: { customization: { quick?: string[] } }) => told.push(`quick:${(e.customization.quick ?? []).join(',')}`)
        });
        const app = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__app')!;
        expect(app.textContent).toBe('File');
        expect(app.getAttribute('aria-keyshortcuts')).toContain('F');
        app.click();
        expect(menu.element.querySelector('.mx-ribbon-menu__bar-end .sheet')).not.toBeNull();
        const quick = () => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__quick:not([hidden]) > .mx-button'));
        expect(quick().map(b => b.getAttribute('title'))).toEqual(['Save']);
        quick()[0].click();
        expect(saved).toEqual(['save']);
        // The user adds Cut from its context menu.
        rightClick(menu.element.querySelector('[data-ribbon-size="medium"]')!);
        await settle();
        expect(menuNames(menu)).toEqual(['Add to the quick commands', 'Hide “Cut”', 'Move earlier', 'Move later', 'Hide the “Clipboard” group', 'Move the group earlier', 'Move the group later', 'Layout', 'Show the commands', 'Quick commands']);
        menuItems(menu)[0].click();
        await settle();
        expect(quick().map(b => b.getAttribute('title'))).toEqual(['Save', 'Cut']);
        expect(told).toEqual(['app', 'quick:home/clipboard/cut']);
    });

    it('lets the app add its own commands to the menu of the right button, or keep it closed, even when not customizable', async () => {
        const seen: (string | null)[] = [];
        const menu = await make({
            items: tabs(),
            onCustomMenuOpening: (e: { path: string | null; items: { text: string }[]; cancel: boolean }) => {
                seen.push(e.path);
                if (e.path === 'insert') e.cancel = true;
                else e.items.unshift({ text: 'Add to the toolbar' });
            }
        });
        rightClick(menu.element.querySelector('[data-ribbon-size="medium"]')!);
        await settle();
        expect(menuNames(menu)[0]).toBe('Add to the toolbar');
        expect(menuNames(menu)[1]).toBe('Add to the quick commands');
        press(menuItems(menu)[0], 'Escape');
        await settle();
        const closed = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 40, clientY: 40 });
        tab(menu, 'insert').dispatchEvent(closed);
        expect(closed.defaultPrevented).toBe(false);
        menu.customizable = false;
        rightClick(tab(menu, 'home'));
        await settle();
        expect(menuNames(menu)).toEqual(['Add to the toolbar']);
        expect(seen).toEqual(['home/clipboard/cut', 'insert', 'home']);
    });

    it('takes back what the user changed: hidden and moved groups and commands, quick commands, layout', async () => {
        const menu = await make({ items: tabs(), customization: { hidden: ['home/clipboard/copy'], order: { home: ['font', 'clipboard'], 'home/clipboard': ['cut', 'paste'] }, quick: ['home/clipboard/cut'], layout: 'simple' } });
        const panel = shownPanel(menu)[0];
        expect(Array.from(panel.querySelectorAll('.mx-ribbon-menu__group-label')).map(l => l.textContent)).toEqual(['Font', 'Clipboard']);
        const clipboard = panel.querySelectorAll<HTMLElement>(':scope > .mx-ribbon-menu__group')[1];
        // The command the user hid is kept out of sight.
        expect(Array.from(clipboard.querySelectorAll<HTMLElement>('.mx-ribbon-menu__commands > .mx-ribbon-menu__command:not([hidden])')).map(b => b.textContent || b.getAttribute('title'))).toEqual(['Cut', 'Paste']);
        const copy = clipboard.querySelector<HTMLElement>('.mx-ribbon-menu__commands > .mx-ribbon-menu__command[hidden]')!;
        expect(copy).not.toBeNull();
        menu.customization = {};
        await settle();
        expect(copy.isConnected && !copy.hidden).toBe(true);
        menu.customization = { hidden: ['home/clipboard/copy'], order: { home: ['font', 'clipboard'], 'home/clipboard': ['cut', 'paste'] }, quick: ['home/clipboard/cut'], layout: 'simple' };
        await settle();
        expect(menu.layout).toBe('simple');
        expect(menu.element.querySelectorAll('.mx-ribbon-menu__quick:not([hidden]) > .mx-button').length).toBe(1);
        expect(menu.findCommand('home/clipboard/paste')!.text).toBe('Paste');
        // Moving a command from the context menu.
        rightClick(clipboard.querySelector('.mx-ribbon-menu__command')!);
        await settle();
        menuItems(menu).find(i => i.textContent!.includes('Move later'))!.click();
        await settle();
        expect(menu.customization.order!['home/clipboard']).toEqual(['paste', 'cut']);
    });

    it('shows key hints on Alt: a letter on each tab, then on each command of the tab it presses', async () => {
        ran.length = 0;
        const menu = await make({ items: tabs() });
        const hints = () => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__hint:not([hidden])')).map(h => h.textContent);
        tab(menu, 'home').focus();
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', bubbles: true }));
        document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt', bubbles: true }));
        // jsdom has no layout: the hints are drawn for elements with a size.
        expect(menu.element.querySelector('.mx-ribbon-menu__hints')!.hasAttribute('hidden')).toBe(false);
        expect(hints()).toEqual([]);
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(menu.element.querySelector('.mx-ribbon-menu__hints')!.hasAttribute('hidden')).toBe(true);
        menu.keyHints = false;
        await settle();
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', bubbles: true }));
        expect(menu.element.querySelector('.mx-ribbon-menu__hints')!.hasAttribute('hidden')).toBe(true);
    });

    it('gives a gallery its choices in a row and all of them in a grid, the chosen one marked', async () => {
        const told: string[] = [];
        const s = reactive({ style: 'b' });
        const items = tabs();
        (items[1].groups as unknown as { commands: RibbonCommand[] }[])[0].commands = [
            { key: 'styles', type: 'gallery', text: 'Styles', columns: 2, value: () => s.style, items: [{ key: 'a', text: 'A' }, { key: 'b', text: 'B' }, { key: 'c', text: 'C' }], click: e => told.push(String(e.item?.key)) }
        ];
        const menu = await make({ items, value: 'insert' });
        const gallery = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__gallery')!;
        const row = Array.from(gallery.querySelectorAll<HTMLElement>('.mx-ribbon-menu__gallery-row > .mx-ribbon-menu__tile'));
        expect(row.map(t => t.textContent)).toEqual(['A', 'B']);
        expect(row.map(t => t.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
        const grid = Array.from(gallery.querySelectorAll<HTMLElement>('.mx-ribbon-menu__gallery-grid > .mx-ribbon-menu__tile'));
        expect(grid.map(t => t.textContent)).toEqual(['A', 'B', 'C']);
        grid[2].click();
        s.style = 'c';
        await settle();
        expect(told).toEqual(['c']);
        expect(Array.from(gallery.querySelectorAll<HTMLElement>('.mx-ribbon-menu__gallery-grid > .mx-ribbon-menu__tile')).map(t => t.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    });

    it('gives each gallery tile its own icon: a function is called again, a component given as is goes to the grid', async () => {
        const kept = new Component('i');
        const items = tabs();
        (items[1].groups as unknown as { commands: RibbonCommand[] }[])[0].commands = [
            { key: 'styles', type: 'gallery', text: 'Styles', columns: 2, items: [{ key: 'a', text: 'A', icon: () => <svg class="drawn" /> }, { key: 'b', text: 'B', icon: kept }] }
        ];
        const menu = await make({ items, value: 'insert' });
        const gallery = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__gallery')!;
        const tiles = (place: string) => Array.from(gallery.querySelectorAll<HTMLElement>(`.mx-ribbon-menu__gallery-${place} > .mx-ribbon-menu__tile`));
        const [rowA, rowB] = tiles('row');
        const [gridA, gridB] = tiles('grid');
        const drawn = [rowA.querySelector('svg.drawn'), gridA.querySelector('svg.drawn')];
        expect(drawn[0]).not.toBeNull();
        expect(drawn[1]).not.toBeNull();
        expect(drawn[0]).not.toBe(drawn[1]);
        expect(rowB.contains(kept.element)).toBe(false);
        expect(gridB.contains(kept.element)).toBe(true);
    });

    it('turns compact when it is narrow: a tab picker in place of the tabs, the simplified layout', async () => {
        const menu = await make({ items: tabs() });
        Object.defineProperty(menu.element, 'clientWidth', { configurable: true, get: () => 320 });
        menu.adaptive = false;
        await settle();
        await whenMeasured(menu);
        expect(menu.isCompact).toBe(true);
        expect(menu.element.hasAttribute('data-compact')).toBe(true);
        expect(menu.element.getAttribute('data-layout')).toBe('simple');
        expect(menu.layout).toBe('classic');
        const picker = menu.element.querySelector<HTMLElement>('.mx-ribbon-menu__picker')!;
        expect(picker.textContent).toContain('Home');
    });

    it('adds, removes, moves and changes tabs, groups and commands by path, never changing what it was given', async () => {
        const given = tabs();
        const snapshot = JSON.stringify(given);
        const told: number[] = [];
        const menu = await make({ items: given, onItemsChanged: (e: { items: RibbonTab[] }) => told.push(e.items.length) });
        const cutButton = () => shownPanel(menu)[0].querySelectorAll<HTMLElement>('.mx-ribbon-menu__commands > .mx-ribbon-menu__command')[1];
        const before = cutButton();
        const labels = () => Array.from(shownPanel(menu)[0].querySelectorAll('.mx-ribbon-menu__group-label')).map(l => l.textContent);
        const names = (group: number) => Array.from(shownPanel(menu)[0].querySelectorAll<HTMLElement>(':scope > .mx-ribbon-menu__group')[group].querySelectorAll<HTMLElement>('.mx-ribbon-menu__commands > .mx-ribbon-menu__command')).map(b => b.querySelector('.mx-button__text')?.textContent || b.getAttribute('title'));

        expect(menu.addCommand('home/clipboard', { key: 'copylook', text: 'Copy look', glyph: 'eyedropper' })).toBe(true);
        await settle();
        expect(names(0)).toEqual(['Paste', 'Cut', 'Copy', 'Copy look']);
        // The commands already made stay the same buttons.
        expect(cutButton()).toBe(before);
        expect(menu.addGroup('home', { key: 'styles', text: 'Styles', commands: [{ key: 'normal', text: 'Normal' }] }, 1)).toBe(true);
        await settle();
        expect(labels()).toEqual(['Clipboard', 'Styles', 'Font']);
        expect(menu.update('home/clipboard/cut', { text: 'Cut out' })).toBe(true);
        await settle();
        expect(names(0)).toEqual(['Paste', 'Cut out', 'Copy', 'Copy look']);
        expect(menu.move('home/clipboard/copy', 0)).toBe(true);
        await settle();
        expect(names(0)).toEqual(['Copy', 'Paste', 'Cut out', 'Copy look']);
        expect(menu.move('home/styles/normal', 0, 'home/clipboard')).toBe(true);
        await settle();
        expect(names(0)[0]).toBe('Normal');
        expect(menu.remove('home/styles')).toBe(true);
        await settle();
        expect(labels()).toEqual(['Clipboard', 'Font']);
        expect(menu.addTab({ key: 'review', text: '&Review', groups: [] }, 1)).toBe(true);
        await settle();
        expect(shownTexts(menu)).toEqual(['Home', 'Review', 'Insert']);
        expect(menu.remove('home/nothing/here')).toBe(false);
        expect(menu.findCommand('home/clipboard/cut')!.text).toBe('Cut out');
        expect(menu.findGroup('home/font')!.text).toBe('Font');
        expect(JSON.stringify(given)).toBe(snapshot);
        expect(told.length).toBe(7);
    });

    it('keeps its tabs, groups and commands when they change: a command changed by path is the same button', async () => {
        const menu = await make({ items: tabs() });
        const tabNodes = () => Array.from(menu.element.querySelectorAll<HTMLElement>('.mx-ribbon-menu__tab'));
        const groupNodes = () => Array.from(shownPanel(menu)[0].querySelectorAll<HTMLElement>(':scope > .mx-ribbon-menu__group'));
        const commandNodes = () => Array.from(shownPanel(menu)[0].querySelectorAll<HTMLElement>('.mx-ribbon-menu__commands > .mx-ribbon-menu__command'));
        const allTabs = tabNodes();
        const [home, insert] = allTabs;
        const groups = groupNodes();
        const commands = commandNodes();
        const cut = commands[1];

        menu.update('home/clipboard/cut', { text: 'Cut out' });
        await settle();
        expect(commandNodes()).toEqual(commands);
        expect(cut.querySelector('.mx-button__text')?.textContent || cut.getAttribute('title')).toBe('Cut out');
        menu.move('home/clipboard/cut', 0);
        await settle();
        expect(commandNodes()[0]).toBe(cut);
        menu.update('home/clipboard', { text: 'Board' });
        await settle();
        expect(groupNodes()).toEqual(groups);
        menu.addTab({ key: 'review', text: '&Review', groups: [] }, 0);
        await settle();
        expect(tabNodes()[1]).toBe(home);
        expect(tabNodes()[2]).toBe(insert);
        menu.remove('review');
        await settle();
        expect(tabNodes()).toEqual(allTabs);
        expect(groupNodes()).toEqual(groups);
    });

    it('holds changes by path between beginUpdate and endUpdate, and applies them at once', async () => {
        const told: number[] = [];
        const menu = await make({ items: tabs(), onItemsChanged: (e: { items: RibbonTab[] }) => told.push(e.items.length) });
        menu.beginUpdate();
        menu.addTab({ key: 'a', text: 'A', groups: [] });
        menu.addTab({ key: 'b', text: 'B', groups: [] });
        menu.remove('insert');
        await settle();
        expect(shownTexts(menu)).toEqual(['Home', 'Insert']);
        expect(told).toEqual([]);
        menu.endUpdate();
        await settle();
        expect(shownTexts(menu)).toEqual(['Home', 'A', 'B']);
        expect(told).toEqual([4]);
    });
});
