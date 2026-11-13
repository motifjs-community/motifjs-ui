import { Component, reactive } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabGroup } from './TabGroup';

let hosts: Component[] = [];
const rects = new Map<Element, DOMRect>();

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return rects.get(this) ?? new DOMRect();
  });
});

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  window.dispatchEvent(new MouseEvent('pointerdown'));
  document.body.innerHTML = '';
  rects.clear();
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
});

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

function manager(props: TabDocumentManagerProps = {}) {
  const m = new TabDocumentManager(props);
  hosts.push(mountHost(m));
  return m;
}

function text(value: string): Component<HTMLDivElement> {
  const c = new Component<HTMLDivElement>('div');
  c.element.textContent = value;
  return c;
}

function doc(title: string, extra: ConstructorParameters<typeof TabDocument>[0] = {}) {
  return new TabDocument({ id: title.toLowerCase(), type: 'text', title, content: () => text(title), ...extra });
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  target.dispatchEvent(e);
  return e;
}

function key(k: string, init: KeyboardEventInit = {}, target: EventTarget = (document.activeElement as HTMLElement) ?? document.body) {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

/** The names of the buttons shown in a group's toolbar, in order. */
const buttons = (g: TabGroup) =>
  Array.from(g.element.querySelectorAll<HTMLElement>('.mx-tabdocs__actions > .mx-button:not(.mx-toolbar__more)'))
    .filter((b) => !b.hidden && b.style.display !== 'none')
    .map((b) => (b.querySelector('.mx-button__main') ?? b).getAttribute('title') || b.textContent!.trim());
const moreOf = (g: TabGroup) =>
  Array.from(g.element.querySelectorAll<HTMLElement>('.mx-tabdocs__actions > .mx-button')).find((b) => /^Open documents/.test(b.getAttribute('title') ?? b.querySelector('[title]')?.getAttribute('title') ?? ''))!;
const popup = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-tabdocs__popup')).find((p) => !p.hidden)!;
const commands = (m: TabDocumentManager) => Array.from(popup(m).querySelectorAll<HTMLButtonElement>('.mx-menu:not(.mx-tabdocs__documents) > .mx-menu__item'));
const menuNames = (m: TabDocumentManager) => commands(m).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const menuItem = (m: TabDocumentManager, name: string) => commands(m).find((i) => i.querySelector('.mx-menu__label')!.textContent === name)!;
const documentNames = (p: HTMLElement) => Array.from(p.querySelectorAll('.mx-tabdocs__documents > .mx-menu__item')).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const header = (g: TabGroup, title: string) => Array.from(g.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.querySelector('.mx-tabdocs__title')!.textContent === title)!;

/** A manager with A, B among the documents, Tool in the left dock area and Note in a floating window. */
async function places(props: TabDocumentManagerProps = {}) {
  const m = manager(props);
  m.open(doc('A'));
  m.open(doc('B'));
  m.dock(doc('Tool'), 'left');
  const w = m.float(m.open(doc('Note'))!, { x: 10, y: 10, width: 300, height: 200 })!;
  await settle();
  const main = m.groups.find((g) => !g.window && !g.dockArea)!;
  const area = m.dockArea('left')!;
  return { m, main, area, side: area.groups[0], w, floating: w.groups[0] };
}

/** Lays a strip out: `room` pixels wide, its tabs `width` each, scrolled by `scroll`. */
function layStrip(g: TabGroup, room: number, width: number, scroll = 0) {
  // What opening the tabs asked of the next frame (the active tab kept in sight) lands before the strip is laid out.
  measureNow(g);
  const row = g.rowPart.element;
  const tabs = Array.from(row.children);
  Object.defineProperty(row, 'scrollWidth', { value: tabs.length * width, configurable: true });
  Object.defineProperty(row, 'clientWidth', { value: room, configurable: true });
  row.scrollLeft = scroll;
  rects.set(row, new DOMRect(0, 0, room, 30));
  tabs.forEach((t, i) => rects.set(t, new DOMRect(i * width - scroll, 0, width, 30)));
  g.queueOverflow();
  // The strip is read with the window's next frame: it lands now.
  measureNow(g);
}

describe('TabDocumentManager: compact bars', () => {
  it('dock areas and floating windows have compact bars; the documents keep the whole bar', async () => {
    const { main, side, floating } = await places();
    expect([main.element.hasAttribute('data-compact'), main.element.hasAttribute('data-scroll-buttons'), main.element.dataset.tabSize]).toEqual([false, true, 'fit']);
    expect(buttons(main)).toEqual(['Split right', 'Open documents']);
    for (const g of [side, floating]) {
      expect([g.element.hasAttribute('data-compact'), g.element.hasAttribute('data-scroll-buttons'), g.element.dataset.tabSize]).toEqual([true, false, 'shrink']);
      expect(g.element.style.getPropertyValue('--_tab-min')).toBe('64px');
    }
    // An area keeps its pin and the close button of its document, a window its own close button, both with "…".
    expect(buttons(side)).toEqual(['Open documents and commands', 'Auto hide', 'Close Tool']);
    expect(buttons(floating)).toEqual(['Open documents and commands', 'Close window']);
  });

  it('the manager-wide compact settings are live', async () => {
    const s = reactive({ buttons: ['autoHide', 'closeWindow'] as const as readonly ('autoHide' | 'closeWindow' | 'maximizeWindow' | 'split')[] | 'all', scroll: false, size: 'shrink' as 'shrink' | 'fixed', min: 64, title: true });
    const { main, side, floating } = await places({
      compactBarButtons: () => s.buttons,
      compactScrollButtons: () => s.scroll,
      compactTabSize: () => s.size,
      compactTabMinWidth: () => s.min,
      compactSingleTabTitle: () => s.title,
    });
    expect(side.element.hasAttribute('data-title')).toBe(true);
    s.buttons = ['maximizeWindow', 'closeWindow', 'split'];
    s.scroll = true;
    s.size = 'fixed';
    s.min = 90;
    s.title = false;
    await settle();
    expect(buttons(floating)).toEqual(['Split right', 'Open documents and commands', 'Maximize window', 'Close window']);
    expect(buttons(side)).toEqual(['Open documents and commands']);
    expect([floating.element.hasAttribute('data-scroll-buttons'), floating.element.dataset.tabSize, floating.element.style.getPropertyValue('--_tab-min')]).toEqual([true, 'fixed', '90px']);
    expect(side.element.hasAttribute('data-title')).toBe(false);
    s.buttons = 'all';
    await settle();
    expect(buttons(floating)).toEqual(['Split right', 'Open documents', 'Close Note', 'Maximize window', 'Close window']);
    expect(floating.element.hasAttribute('data-compact')).toBe(false);
    expect(main.element.hasAttribute('data-compact')).toBe(false);
  });

  it('an area\'s or a window\'s own setting wins, as a value or a function; null follows the manager again', async () => {
    const s = reactive({ scroll: true });
    const { m, side, floating, area, w } = await places();
    area.scrollButtons = () => s.scroll;
    area.tabMinWidth = 100;
    w.barButtons = 'all';
    w.tabSize = 'fit';
    w.singleTabTitle = false;
    await settle();
    expect([side.element.hasAttribute('data-scroll-buttons'), side.element.style.getPropertyValue('--_tab-min')]).toEqual([true, '100px']);
    expect([floating.element.hasAttribute('data-compact'), floating.element.dataset.tabSize, floating.element.hasAttribute('data-title')]).toEqual([false, 'fit', false]);
    s.scroll = false;
    await settle();
    expect(side.element.hasAttribute('data-scroll-buttons')).toBe(false);
    m.compactScrollButtons = true;
    area.scrollButtons = null;
    w.barButtons = null;
    await settle();
    expect(side.element.hasAttribute('data-scroll-buttons')).toBe(true);
    expect(floating.element.hasAttribute('data-compact')).toBe(true);
    // The setting goes with the area, not with the group: a group docked elsewhere follows its new place.
    m.dock(floating, 'left');
    await settle();
    expect(floating.element.style.getPropertyValue('--_tab-min')).toBe('100px');
  });

  it('the buttons of compact bars are small; each level of the setting is live, and the area\'s or the window\'s own value wins', async () => {
    const s = reactive({ size: 'small' as 'small' | 'normal' });
    const { m, main, side, floating, area, w } = await places({ compactBarButtonSize: () => s.size });
    expect([main.element.dataset.barSize, side.element.dataset.barSize, floating.element.dataset.barSize]).toEqual(['normal', 'small', 'small']);
    s.size = 'normal';
    m.barButtonSize = 'small';
    area.barButtonSize = () => 'small';
    await settle();
    expect([main.element.dataset.barSize, side.element.dataset.barSize, floating.element.dataset.barSize]).toEqual(['small', 'small', 'normal']);
    w.barButtonSize = 'small';
    area.barButtonSize = null;
    await settle();
    expect([side.element.dataset.barSize, floating.element.dataset.barSize]).toEqual(['normal', 'small']);
    // A plain value goes with the layout.
    expect(m.saveLayout().windows![0].bar).toEqual({ barButtonSize: 'small' });
  });

  it('the documents\' bar can be compact too, and its single document a title', async () => {
    const { m, main } = await places({ barButtons: [], singleTabTitle: true });
    expect([main.element.hasAttribute('data-compact'), main.element.hasAttribute('data-title')]).toEqual([true, false]);
    expect(buttons(main)).toEqual(['Open documents and commands']);
    await m.close(m.findDocument('b')!);
    await settle();
    expect(main.element.hasAttribute('data-title')).toBe(true);
  });

  it('saves the plain settings of areas and windows with the layout, and loads them back', async () => {
    const { m, area, w } = await places();
    area.tabMinWidth = 90;
    area.singleTabTitle = () => false;
    w.barButtons = ['closeWindow', 'maximizeWindow'];
    const layout = m.saveLayout();
    expect(layout.areas![0].bar).toEqual({ tabMinWidth: 90 });
    expect(layout.windows![0].bar).toEqual({ barButtons: ['closeWindow', 'maximizeWindow'] });
    const n = manager();
    n.loadLayout(JSON.parse(JSON.stringify(layout)), (d) => text(d.title));
    await settle();
    expect(n.dockArea('left')!.tabMinWidth).toBe(90);
    expect(n.floatingWindows[0].barButtons).toEqual(['closeWindow', 'maximizeWindow']);
    expect(buttons(n.floatingWindows[0].groups[0])).toEqual(['Open documents and commands', 'Maximize window', 'Close window']);
  });
});

describe('TabDocumentManager: tabs out of sight', () => {
  it('without scroll buttons the "…" button shows how many tabs are not fully in sight, also in its name', async () => {
    const { m, floating } = await places();
    for (const title of ['N2', 'N3', 'N4']) m.open(doc(title), { group: floating, index: 99 });
    await settle();
    layStrip(floating, 150, 60);
    await settle();
    // 4 tabs of 60 in 150: two in sight, the third cut, the fourth out.
    expect(floating.hiddenTabCount).toBe(2);
    const more = moreOf(floating);
    expect(more.querySelector('.mx-tabdocs__count')!.textContent).toBe('+2');
    expect((more.querySelector('.mx-button__main') ?? more).getAttribute('title')).toBe('Open documents and commands, 2 not in sight');
    layStrip(floating, 150, 60, 90);
    await settle();
    expect(floating.hiddenTabCount).toBe(2);
    layStrip(floating, 400, 60);
    await settle();
    expect(floating.hiddenTabCount).toBe(0);
    expect(moreOf(floating).querySelector('.mx-tabdocs__count')).toBeNull();
    // With scroll buttons the count is not shown (the documents' bar as it was).
    m.compactScrollButtons = true;
    layStrip(floating, 150, 60);
    await settle();
    expect(floating.hiddenTabCount).toBe(2);
    expect(moreOf(floating).querySelector('.mx-tabdocs__count')).toBeNull();
    expect((moreOf(floating).querySelector('.mx-button__main') ?? moreOf(floating)).getAttribute('title')).toBe('Open documents and commands');
  });

  it('the documents\' bar without scroll buttons counts too; with them the name stays', async () => {
    const m = manager({ scrollButtons: false });
    for (const title of ['A', 'B', 'C']) m.open(doc(title), { index: 99 });
    await settle();
    const g = m.groups[0];
    layStrip(g, 100, 60);
    await settle();
    expect((moreOf(g).querySelector('.mx-button__main') ?? moreOf(g)).getAttribute('title')).toBe('Open documents, 2 not in sight');
  });

  it('the thin scrollbar follows the strip and drags it; pressing it moves no group or window', async () => {
    const { m, floating } = await places();
    for (const title of ['N2', 'N3', 'N4']) m.open(doc(title), { group: floating, index: 99 });
    await settle();
    layStrip(floating, 120, 60, 60);
    await settle();
    const bar = floating.element.querySelector<HTMLElement>('.mx-tabdocs__scrollbar')!;
    expect(bar.getAttribute('aria-hidden')).toBe('true');
    expect([bar.style.getPropertyValue('--_thumb-size'), bar.style.getPropertyValue('--_thumb-at'), bar.style.getPropertyValue('--_track-size')]).toEqual(['50.00%', '25.00%', '120px']);
    expect(floating.isStripSpaceEvent({ target: bar.firstElementChild } as unknown as Event)).toBe(false);
    const dragged: string[] = [];
    m.onDragStarting(() => dragged.push('drag'));
    const thumb = bar.firstElementChild as HTMLElement;
    pointer('pointerdown', thumb, 50, 28);
    pointer('pointermove', thumb, 70, 28);
    pointer('pointerup', thumb, 70, 28);
    // Core makes the scroll a microtask later.
    await settle();
    // 20 pixels of a track that shows half the tabs: 40 pixels of tabs.
    expect(floating.rowPart.element.scrollLeft).toBe(100);
    expect(dragged).toEqual([]);
  });
});

describe('TabDocumentManager: the single "…" menu', () => {
  it('a window\'s menu has its buttons first, then dock back and the group\'s commands, then the documents', async () => {
    const { m, floating } = await places();
    m.open(doc('N2'), { group: floating });
    await settle();
    expect(m.showOpenList(floating)).toBe(true);
    await settle();
    expect(menuNames(m)).toEqual(['Split right', 'Close N2', 'Maximize window', 'Dock back', 'Close all', 'Close saved', 'Lock group']);
    const p = popup(m);
    const menu = p.querySelector('.mx-tabdocs__commands')!;
    const list = p.querySelector('.mx-tabdocs__list')!;
    expect(menu.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // One line between the commands and the documents.
    expect(menu.nextElementSibling!.matches('.mx-menu__separator')).toBe(true);
    expect(menu.nextElementSibling!.nextElementSibling).toBe(list);
    expect(documentNames(p)).toEqual(['Note', 'N2']);
    // The search heads the documents, and has focus.
    expect(list.firstElementChild!.contains(document.activeElement)).toBe(true);
    menuItem(m, 'Maximize window').click();
    await settle();
    expect(floating.window!.isMaximized).toBe(true);
  });

  it('the documents\' bar keeps its own list, with the commands under it', async () => {
    const { m, main } = await places();
    m.showOpenList(main);
    await settle();
    expect(menuNames(m)).toEqual(['Close all', 'Close saved', 'Lock group']);
    const p = popup(m);
    expect(p.querySelector('.mx-tabdocs__list')!.compareDocumentPosition(p.querySelector('.mx-tabdocs__commands')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(p.querySelector('.mx-tabdocs__list')!.nextElementSibling!.matches('.mx-menu__separator')).toBe(true);
  });

  it('the app\'s buttons go into the menu unless they ask to stay; a chosen one runs', async () => {
    const log: string[] = [];
    const { m, side } = await places({
      toolbarItems: () => [
        { text: 'Refresh', click: () => void log.push('refresh') },
        { type: 'separator' },
        { text: 'Filter', type: 'toggle', pressed: false, click: () => void log.push('filter') },
        { text: 'Run', overflow: 'never', click: () => void log.push('run') },
      ],
    });
    expect(buttons(side)).toEqual(['Run', 'Open documents and commands', 'Auto hide', 'Close Tool']);
    m.showOpenList(side);
    await settle();
    expect(menuNames(m)).toEqual(['Refresh', 'Filter', 'Close all', 'Close saved', 'Lock group']);
    menuItem(m, 'Refresh').click();
    await settle();
    expect(log).toEqual(['refresh']);
  });

  it('every built-in button may stay outside, and what stays is not in the menu', async () => {
    const { m, floating, w } = await places();
    w.barButtons = ['split', 'maximizeWindow', 'closeWindow'];
    await settle();
    m.showOpenList(floating);
    await settle();
    expect(menuNames(m)).toEqual(['Close Note', 'Dock back', 'Close all', 'Close saved', 'Lock group']);
  });

  it('with no list of documents the menu has the commands only, and focus goes to them', async () => {
    const { m, side } = await places({ openList: false });
    expect(buttons(side)).toEqual(['More options', 'Auto hide', 'Close Tool']);
    m.showOpenList(side);
    await settle();
    const p = popup(m);
    expect((p.querySelector('.mx-tabdocs__list') as HTMLElement).hidden).toBe(true);
    expect((p.querySelector(':scope > .mx-menu__separator') as HTMLElement).hidden).toBe(true);
    expect(p.querySelector('.mx-tabdocs__commands')!.contains(document.activeElement)).toBe(true);
  });
});

describe('TabDocumentManager: a single document as a title', () => {
  it('shows as a title with its close button and marks, a tab still; a second document makes tabs again', async () => {
    const { m, side, area } = await places();
    const tool = m.findDocument('tool')!;
    const h = header(side, 'Tool');
    expect(side.element.hasAttribute('data-title')).toBe(true);
    expect([h.getAttribute('role'), h.getAttribute('aria-selected'), h.dataset.close]).toEqual(['tab', 'true', 'always']);
    expect(side.listPart.element.getAttribute('role')).toBe('tablist');
    tool.dirty = true;
    tool.badge = 3;
    await settle();
    expect([h.hasAttribute('data-dirty'), h.querySelector('.mx-tabdocs__badge')!.textContent]).toEqual([true, '3']);
    m.open(doc('Second'), { group: side });
    await settle();
    expect(side.element.hasAttribute('data-title')).toBe(false);
    await m.close(m.findDocument('second')!);
    await settle();
    expect(side.element.hasAttribute('data-title')).toBe(true);
    // A document that cannot close shows no close button on its title.
    m.open(doc('Fixed', { closable: false }), { group: area.groups[0] });
    tool.dirty = false;
    await m.close(tool);
    await settle();
    expect(header(side, 'Fixed').hasAttribute('data-close')).toBe(false);
  });

  it('the title keeps a tab\'s menu, keys, close button and drag', async () => {
    const { m, floating } = await places();
    const h = header(floating, 'Note');
    // The close button.
    const shown: string[] = [];
    m.onContextMenuOpening((e) => shown.push(e.document?.title ?? 'strip'));
    h.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 20, clientY: 20 }));
    await settle();
    expect(shown).toEqual(['Note']);
    key('Escape');
    // Dragging the title drags the document, the empty bar the window.
    rects.set(h, new DOMRect(10, 10, 80, 30));
    rects.set(floating.barPart.element, new DOMRect(10, 10, 300, 30));
    const started: string[] = [];
    m.onDragStarting((e) => {
      started.push(e.document?.title ?? 'window');
      e.cancel = true;
    });
    pointer('pointerdown', h, 30, 20);
    pointer('pointermove', document.body, 60, 60);
    pointer('pointerup', document.body, 60, 60);
    expect(started).toEqual(['Note']);
    // Delete closes it, as on a tab; the window goes with its last document.
    h.focus();
    key('Delete');
    await settle();
    expect(m.findDocument('note')).toBeNull();
    expect(m.floatingWindows.length).toBe(0);
  });

  it('a click on its close button closes the document; in a dock area the bar\'s close button does, and the title shows none', async () => {
    const { m, side, floating } = await places();
    expect([side.element.hasAttribute('data-bar-close'), floating.element.hasAttribute('data-bar-close')]).toEqual([true, false]);
    header(floating, 'Note').querySelector<HTMLElement>('.mx-tabdocs__close')!.click();
    await settle();
    expect(m.findDocument('note')).toBeNull();
    header(side, 'Tool').querySelector<HTMLElement>('.mx-tabdocs__close')!.click();
    await settle();
    expect(m.findDocument('tool')!.isOpen).toBe(true);
    side.element.querySelector<HTMLElement>('.mx-tabdocs__bar-close .mx-button__main, .mx-tabdocs__bar-close')!.click();
    await settle();
    expect(m.findDocument('tool')).toBeNull();
  });
});
