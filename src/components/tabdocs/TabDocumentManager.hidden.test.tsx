import { Component, effect } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabGroup } from './TabGroup';
import type { TabLayout } from './tab-layout';

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

const tool = (title: string, extra: ConstructorParameters<typeof TabDocument>[0] = {}) => doc(title, { type: 'tool', closable: false, ...extra });

function key(k: string, init: KeyboardEventInit = {}, target: EventTarget = (document.activeElement as HTMLElement) ?? document.body) {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function rightClick(target: Element) {
  target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 20, clientY: 20 }));
}

const titles = (g: TabGroup) => g.documents.map((d) => d.title);
const header = (m: TabDocumentManager, title: string) =>
  Array.from(m.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.querySelector('.mx-tabdocs__title')!.textContent === title)!;
const live = (m: TabDocumentManager) => m.element.querySelector('.mx-tabdocs__live')!.textContent;
const popups = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-popup')).filter((p) => !p.hidden);
const menuNames = (p: HTMLElement) => Array.from(p.querySelectorAll<HTMLElement>(':scope .mx-menu__item')).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const menuItem = (p: HTMLElement, name: string) => Array.from(p.querySelectorAll<HTMLButtonElement>('.mx-menu__item')).find((i) => i.querySelector('.mx-menu__label')!.textContent === name)!;
/** The close button of a group's bar, and its name. */
const barClose = (g: TabGroup) => g.element.querySelector<HTMLElement>('.mx-tabdocs__bar-close')!;
const isDimmed = (button: HTMLElement) => [button, button.querySelector('.mx-button__main')].some((b) => !!b && (b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'));
const nameOf = (button: HTMLElement) => (button.querySelector('.mx-button__main') ?? button).getAttribute('title');
const click = (button: HTMLElement) => (button.querySelector<HTMLElement>('.mx-button__main') ?? button).click();

/** Files among the documents, two tools at the left and one at the bottom. */
async function ide(props: TabDocumentManagerProps = {}) {
  const m = manager(props);
  m.open(doc('A'));
  m.open(doc('B'));
  m.dock(tool('Explorer'), 'left');
  m.dock(tool('Outline'), 'left');
  m.dock(tool('Output'), 'bottom');
  await settle();
  const main = m.groups.find((g) => !g.dockArea && !g.window)!;
  return { m, main, left: m.dockArea('left')!.groups[0], bottom: m.dockArea('bottom')!.groups[0] };
}

describe('TabDocumentManager: the close button of a dock area', () => {
  it('stays next to the pin; it closes a document that may close and hides one that may not', async () => {
    const { m, left } = await ide();
    m.open(doc('Notes'), { group: left });
    await settle();
    const close = barClose(left);
    expect(close.previousElementSibling!.classList.contains('mx-tabdocs__auto-hide')).toBe(true);
    expect(nameOf(close)).toBe('Close Notes');
    const closed: string[] = [];
    m.onClosed((e) => closed.push(e.document.title));
    click(close);
    await settle();
    expect(closed).toEqual(['Notes']);
    expect(m.findDocument('notes')).toBeNull();
    // A tool is hidden, not closed.
    m.activate(m.findDocument('outline')!);
    await settle();
    expect(nameOf(close)).toBe('Hide Outline');
    click(close);
    await settle();
    const outline = m.findDocument('outline')!;
    expect([outline.isHidden, outline.isOpen, outline.group, closed.length]).toEqual([true, true, null, 1]);
    expect(titles(left)).toEqual(['Explorer']);
    expect(m.hiddenDocuments).toEqual([outline]);
    expect(live(m)).toBe('Outline hidden');
  });

  it('a dirty document asks through onClosing first', async () => {
    const { m, left } = await ide();
    m.open(doc('Draft', { dirty: true }), { group: left });
    let answer: (ok: boolean) => void = () => {};
    m.onClosing((e) => (e.promise = new Promise((resolve) => (answer = resolve))));
    click(barClose(left));
    await settle();
    expect(m.findDocument('draft')).not.toBeNull();
    answer(true);
    await settle();
    expect(m.findDocument('draft')).toBeNull();
  });

  it('is dimmed for a document that may neither close nor hide; every place may list it or leave it out', async () => {
    const { m, left, bottom } = await ide();
    m.findDocument('outline')!.allowHide = false;
    await settle();
    const close = barClose(left);
    expect(isDimmed(close)).toBe(true);
    click(close);
    await settle();
    expect(m.findDocument('outline')!.isHidden).toBe(false);
    // Off for one area, on for every floating window.
    m.dockArea('bottom')!.barButtons = ['autoHide'];
    m.compactBarButtons = ['autoHide', 'close', 'closeWindow'];
    const w = m.float(m.open(doc('Note'))!, { x: 0, y: 0, width: 300, height: 200 })!;
    await settle();
    expect(barClose(bottom)).toBeNull();
    expect(nameOf(barClose(w.groups[0]))).toBe('Close Note');
    expect(w.groups[0].element.hasAttribute('data-bar-close')).toBe(true);
  });

  it('a floating window shows no second close button by default; its own one closes what may close and hides the tools', async () => {
    const m = manager();
    m.open(doc('A'));
    const w = m.float(m.open(tool('Log'))!, { x: 40, y: 50, width: 300, height: 200 })!;
    m.open(doc('Note'), { group: w.groups[0] });
    await settle();
    const g = w.groups[0];
    expect(g.element.hasAttribute('data-bar-close')).toBe(false);
    expect(barClose(g)).toBeNull();
    await m.closeWindow(w);
    // From code every document closes, as before; from the button the tool is hidden.
    expect(m.findDocument('log')).toBeNull();
    const v = m.float(m.open(tool('Log2'))!, { x: 40, y: 50, width: 300, height: 200 })!;
    await settle();
    const closeWindow = Array.from(v.groups[0].element.querySelectorAll<HTMLElement>('.mx-tabdocs__actions .mx-button')).find((b) => nameOf(b) === 'Close window')!;
    click(closeWindow);
    await settle();
    expect(m.floatingWindows.length).toBe(0);
    expect(m.findDocument('log2')!.isHidden).toBe(true);
    // Shown again, it floats where its window was.
    expect(m.show(m.findDocument('log2')!)).toBe(true);
    expect(m.floatingWindows[0].rect).toEqual({ x: 40, y: 50, width: 300, height: 200 });
  });
});

describe('TabDocumentManager: hidden documents', () => {
  it('hide and show by code, each with a cancelable event, the event after and layoutChanged', async () => {
    const { m, left } = await ide();
    const log: string[] = [];
    const explorer = m.findDocument('explorer')!;
    let refuse = true;
    m.onHiding((e) => {
      log.push(`hiding ${e.document.title} from ${e.group.dockArea?.side}`);
      e.cancel = refuse;
    });
    m.onHidden((e) => log.push(`hidden ${e.document.title}`));
    m.onShowing((e) => {
      log.push(`showing ${e.document.title} at ${e.index}`);
      e.cancel = refuse;
    });
    m.onShown((e) => log.push(`shown ${e.document.title} at ${e.index}`));
    m.onLayoutChanged((e) => (e.change === 'hide' || e.change === 'show') && log.push(`${e.change} ${e.area?.side}`));
    expect(m.hide(explorer)).toBe(false);
    expect(explorer.isHidden).toBe(false);
    refuse = false;
    expect(explorer.hide()).toBe(true);
    refuse = true;
    expect(m.show(explorer)).toBe(false);
    expect(explorer.isHidden).toBe(true);
    refuse = false;
    expect(explorer.show()).toBe(true);
    expect(log).toEqual(['hiding Explorer from left', 'hiding Explorer from left', 'hidden Explorer', 'hide left', 'showing Explorer at 0', 'showing Explorer at 0', 'shown Explorer at 0', 'show left']);
    // Back in its place: the same group, the same index, active again.
    expect(titles(left)).toEqual(['Explorer', 'Outline']);
    expect(left.activeDocument).toBe(explorer);
    expect(m.hiddenDocuments).toEqual([]);
  });

  it('onShowing may send it to another group', async () => {
    const { m, main } = await ide();
    const output = m.findDocument('output')!;
    m.hide(output);
    m.onShowing((e) => (e.group = main));
    m.show(output);
    expect(output.group).toBe(main);
  });

  it('allowHide refuses, the document\'s own value winning', async () => {
    const { m } = await ide({ allowHide: false });
    const explorer = m.findDocument('explorer')!;
    expect(m.hide(explorer)).toBe(false);
    explorer.allowHide = true;
    expect(m.hide(explorer)).toBe(true);
    m.allowHide = true;
    const outline = m.findDocument('outline')!;
    outline.allowHide = () => false;
    expect(m.hide(outline)).toBe(false);
  });

  it('a dock area left empty goes, and comes back at its size and fold; a group gone sends it to its area', async () => {
    const { m } = await ide();
    const bottom = m.dockArea('bottom')!;
    bottom.resize(180);
    m.autoHide(bottom);
    const output = m.findDocument('output')!;
    m.hide(output);
    await settle();
    expect(m.dockArea('bottom')).toBeNull();
    m.show(output);
    await settle();
    const again = m.dockArea('bottom')!;
    expect([again.size, again.autoHidden, output.dockArea]).toEqual([180, true, again]);
    // Shown by code into a folded area: it slides out with the document.
    expect(again.isOpen).toBe(true);
    // Its group is gone, its area is there: into the area's group.
    const explorer = m.findDocument('explorer')!;
    m.hide(explorer);
    m.split(m.findDocument('outline')!.group, 'down', m.findDocument('outline')!);
    m.show(explorer);
    expect(explorer.dockArea?.side).toBe('left');
  });

  it('without a place of its own it goes among the documents; options name a group or a dock area', async () => {
    const m = manager();
    m.open(doc('A'));
    const t = m.open(tool('T'))!;
    m.split(m.groups[0], 'right', t);
    m.hide(t);
    expect(m.groups.length).toBe(1);
    m.show(t);
    expect(t.group).toBe(m.groups[0]);
    m.hide(t);
    m.show(t, { side: 'right' });
    expect(t.dockArea?.side).toBe('right');
    m.hide(t);
    m.show(t, { group: m.groups[0], index: 0, active: false });
    expect([t.group, m.groups[0].documents.indexOf(t), m.groups[0].activeDocument?.title]).toEqual([m.groups[0], 0, 'A']);
    // A side the document may not dock to is refused.
    m.hide(t);
    t.dockSides = ['left'];
    expect(m.show(t, { side: 'top' })).toBe(false);
    expect(t.isHidden).toBe(true);
  });

  it('the content stays as its lifetime says: kept, or let go and made again', async () => {
    const m = manager();
    const kept = m.open(doc('Kept'))!;
    const gone = m.open(doc('Gone', { contentLifetime: 'dispose' }))!;
    m.activate(kept);
    m.activate(gone);
    await settle();
    const before = kept.contentComponent;
    m.hide(kept);
    m.hide(gone);
    await settle();
    expect(kept.contentComponent).toBe(before);
    expect(kept.contentComponent!.element.isConnected).toBe(true);
    expect(gone.contentComponent).toBeNull();
    m.show(kept);
    m.show(gone);
    await settle();
    expect(kept.contentComponent).toBe(before);
    expect(gone.contentComponent).not.toBeNull();
  });

  it('hiddenDocuments and isHidden are reactive; findDocument finds a hidden one; open and the keys', async () => {
    const { m } = await ide();
    const seen: number[] = [];
    const stop = effect(() => void seen.push(m.hiddenDocuments.length));
    const explorer = m.findDocument('explorer')!;
    const states: boolean[] = [];
    const stop2 = effect(() => void states.push(explorer.isHidden));
    m.hide(explorer);
    await settle();
    expect(m.findDocument('explorer')).toBe(explorer);
    expect(m.documents.includes(explorer)).toBe(false);
    // Opening it again shows it.
    expect(m.open(explorer)).toBe(explorer);
    await settle();
    expect(explorer.dockArea?.side).toBe('left');
    stop();
    stop2();
    expect(seen).toEqual([0, 1, 0]);
    expect(states).toEqual([false, true, false]);
    // Ctrl+K X hides the focused document.
    header(m, 'Outline').focus();
    key('k', { ctrlKey: true });
    key('x');
    expect(m.findDocument('outline')!.isHidden).toBe(true);
    m.keys = { hide: ['F8'] };
    header(m, 'Output').focus();
    key('F8');
    expect(m.findDocument('output')!.isHidden).toBe(true);
  });
});

describe('TabDocumentManager: hidden documents in the menus', () => {
  it('a tool\'s tab menu has Hide; the strip\'s menu and the "…" menu show the hidden ones', async () => {
    const { m, main, left } = await ide();
    rightClick(header(m, 'Explorer'));
    await settle();
    const tabMenu = popups(m)[0];
    expect(menuNames(tabMenu).slice(0, 2)).toEqual(['Close', 'Hide']);
    menuItem(tabMenu, 'Hide').click();
    await settle();
    expect(m.findDocument('explorer')!.isHidden).toBe(true);
    // A document that may close has no Hide.
    rightClick(header(m, 'A'));
    await settle();
    expect(menuNames(popups(m)[0])).not.toContain('Hide');
    key('Escape');
    await settle();
    // The strip's menu: "Show hidden", with the hidden documents.
    rightClick(main.element.querySelector('.mx-tabdocs__strip')!);
    await settle();
    const strip = popups(m)[0];
    expect(menuNames(strip)).toContain('Show hidden');
    const show = menuItem(strip, 'Show hidden');
    show.click();
    await settle();
    const sub = popups(m).find((p) => p !== strip && menuNames(p).includes('Explorer'))!;
    expect(menuNames(sub)).toEqual(['Explorer']);
    menuItem(sub, 'Explorer').click();
    await settle();
    expect(m.findDocument('explorer')!.dockArea?.side).toBe('left');
    // The "…" menu of an area.
    m.hide(m.findDocument('outline')!);
    await settle();
    m.showOpenList(left);
    await settle();
    const list = popups(m).find((p) => p.classList.contains('mx-tabdocs__popup'))!;
    expect(menuNames(list)).toContain('Show hidden');
    m.menuItems = { showHidden: false, hide: false };
    key('Escape');
    await settle();
    m.showOpenList(left);
    await settle();
    expect(menuNames(popups(m).find((p) => p.classList.contains('mx-tabdocs__popup'))!)).not.toContain('Show hidden');
  });

  it('says it in Turkish too', async () => {
    uiLocale.strings = trStrings;
    const { m, left } = await ide();
    expect(nameOf(barClose(left))).toBe('Gizle: Outline');
    click(barClose(left));
    await settle();
    expect(live(m)).toBe('Outline gizlendi');
    m.show(m.findDocument('outline')!);
    await settle();
    expect(live(m)).toBe('Outline yeniden gösteriliyor');
  });
});

describe('TabDocumentManager: hidden documents in the layout', () => {
  it('saveLayout keeps them and where they belong; loadLayout puts them back hidden', async () => {
    const { m } = await ide();
    m.hide(m.findDocument('outline')!);
    m.dockArea('bottom')!.resize(150);
    m.hide(m.findDocument('output')!);
    const layout = m.saveLayout();
    expect(layout.version).toBe(3);
    expect(layout.hidden).toEqual([
      { document: { id: 'outline', type: 'tool', title: 'Outline' }, group: m.groups.indexOf(m.findDocument('explorer')!.group!), index: 1, side: 'left', size: 240 },
      { document: { id: 'output', type: 'tool', title: 'Output' }, side: 'bottom', size: 150 },
    ]);
    const n = manager();
    n.loadLayout(JSON.parse(JSON.stringify(layout)), (d) => ({ content: text(d.title), closable: false }));
    await settle();
    expect(n.hiddenDocuments.map((d) => d.title)).toEqual(['Outline', 'Output']);
    expect(n.hiddenDocuments.every((d) => d.isHidden && d.manager === n)).toBe(true);
    expect(n.dockArea('bottom')).toBeNull();
    n.show(n.findDocument('outline')!);
    expect(titles(n.dockArea('left')!.groups[0])).toEqual(['Explorer', 'Outline']);
    n.show(n.findDocument('output')!);
    expect(n.dockArea('bottom')!.size).toBe(150);
    // A layout saved before hidden documents still loads, and a new load drops the hidden ones.
    n.hide(n.findDocument('outline')!);
    const old: TabLayout = { version: 2, root: { kind: 'group', documents: [{ id: 'x', type: 't', title: 'X' }], active: 0, recent: [0] }, activeGroup: 0, maximizedGroup: null };
    expect(n.loadLayout(old, (d) => text(d.title))).toBe(true);
    expect(n.hiddenDocuments).toEqual([]);
    expect(n.documents.map((d) => d.title)).toEqual(['X']);
  });
});
