import { Component } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabDropPlace } from './tab-drop-place';
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
  // The click a drop swallows waits for the next press: there is none between two tests.
  window.dispatchEvent(new MouseEvent('pointerdown'));
  document.body.innerHTML = '';
  rects.clear();
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
  vi.useRealTimers();
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

/** A manager with `groups` groups side by side, each with its documents. */
function managerWith(groups: string[][], props: TabDocumentManagerProps = {}) {
  const m = manager(props);
  groups.forEach((titles, i) => {
    const group = i === 0 ? m.groups[0] : m.split(m.groups[i - 1], 'right')!;
    for (const title of titles) m.open(doc(title), { group, index: 99 });
  });
  return m;
}

/** Lays a group out at `b`: a bar 30 tall, tabs 80 wide from the left, the content under the bar. */
function layGroup(g: TabGroup, b: DOMRect) {
  rects.set(g.element, b);
  rects.set(g.element.querySelector('.mx-tabdocs__bar')!, new DOMRect(b.x, b.y, b.width, 30));
  rects.set(g.element.querySelector('.mx-tabdocs__row')!, new DOMRect(b.x, b.y, b.width - 60, 30));
  rects.set(g.element.querySelector('.mx-tabdocs__panels')!, new DOMRect(b.x, b.y + 30, b.width, b.height - 30));
  g.element.querySelectorAll('[role="tab"]').forEach((h, j) => rects.set(h, new DOMRect(b.x + j * 80, b.y, 80, 30)));
}

/** The manager at `box`, the documents' groups side by side in it. */
function lay(m: TabDocumentManager, box = new DOMRect(0, 0, 800, 400)) {
  rects.set(m.element, box);
  const main = m.groups.filter((g) => !g.window && !g.dockArea);
  const width = box.width / main.length;
  main.forEach((g, i) => layGroup(g, new DOMRect(box.x + i * width, box.y, width, box.height)));
}

interface PointerInit {
  ctrlKey?: boolean;
}

function pointer(type: string, target: EventTarget, x: number, y: number, init: PointerInit = {}) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ctrlKey: !!init.ctrlKey });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  target.dispatchEvent(e);
  return e;
}

/** Presses on `from` (at its middle, or `at`), moves through the points and lets go at the last one (unless `hold`). */
function drag(from: Element, points: [number, number][], init: { hold?: boolean; at?: [number, number] } = {}) {
  const r = from.getBoundingClientRect();
  const [sx, sy] = init.at ?? [r.x + r.width / 2, r.y + r.height / 2];
  pointer('pointerdown', from, sx, sy);
  for (const [x, y] of points) pointer('pointermove', document.body, x, y);
  const [x, y] = points[points.length - 1];
  if (!init.hold) pointer('pointerup', document.body, x, y);
}

function key(k: string, init: KeyboardEventInit = {}, target: EventTarget = (document.activeElement as HTMLElement) ?? document.body) {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function rightClick(target: Element) {
  const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 20, clientY: 20 });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const titles = (g: TabGroup) => g.documents.map((d) => d.title);
const header = (m: TabDocumentManager, title: string) =>
  Array.from(m.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.querySelector('.mx-tabdocs__title')!.textContent === title)!;
const live = (m: TabDocumentManager) => m.element.querySelector('.mx-tabdocs__live')!.textContent;
const popups = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-popup')).filter((p) => !p.hidden);
const menuNames = (m: TabDocumentManager) => Array.from(popups(m)[0].querySelectorAll<HTMLElement>('.mx-menu__item')).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const menuItem = (m: TabDocumentManager, name: string) =>
  Array.from(popups(m)[0].querySelectorAll<HTMLButtonElement>('.mx-menu__item')).find((i) => i.querySelector('.mx-menu__label')!.textContent === name)!;
const guides = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-tabdocs__guide')).filter((g) => !g.hidden);
const strip = (m: TabDocumentManager, side: string) => m.element.querySelector<HTMLElement>(`.mx-tabdocs__autohide[data-side="${side}"]`)!;

/** Every docking event, in order. */
function record(m: TabDocumentManager) {
  const log: string[] = [];
  const place = (e: TabDropPlace) => `${e.target}${e.dockSide ? `:${e.dockSide}` : ''}${e.side ? `:${e.side}` : ''}`;
  m.onFloating((e) => log.push(`floating ${e.document?.title ?? 'group'}`));
  m.onFloated((e) => log.push(`floated ${e.document?.title ?? 'group'}`));
  m.onDocking((e) => log.push(`docking ${e.document?.title ?? (e.group ? 'group' : 'window')} ${e.side ?? 'back'}`));
  m.onDocked((e) => log.push(`docked ${e.document?.title ?? 'group'} ${e.side ?? 'documents'}`));
  m.onAutoHiding((e) => log.push(`autoHiding ${e.area.side} ${e.on}`));
  m.onAutoHidden((e) => log.push(`autoHidden ${e.area.side} ${e.on}`));
  m.onSlideChanging((e) => log.push(`slideChanging ${e.document?.title ?? '-'} ${e.open}`));
  m.onSlideChanged((e) => log.push(`slideChanged ${e.document?.title ?? '-'} ${e.open}`));
  m.onWindowClosing(() => log.push('windowClosing'));
  m.onWindowClosed((e) => log.push(`windowClosed ${e.reason}`));
  m.onDragOver((e) => log.push(`over ${place(e)}`));
  m.onDropped((e) => log.push(`dropped ${place(e)}`));
  return log;
}

/** A browser forgets the scroll of what it takes out of the page and puts back (jsdom does not): this plays that browser. */
function forgetScrollOnMove() {
  const reset = (node: Node) => {
    if (!(node instanceof Element) || !node.isConnected) return;
    for (const el of [node, ...node.querySelectorAll('*')]) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    }
  };
  const insertBefore = Node.prototype.insertBefore;
  const appendChild = Node.prototype.appendChild;
  vi.spyOn(Node.prototype, 'insertBefore').mockImplementation(function <T extends Node>(this: Node, node: T, child: Node | null): T {
    reset(node);
    return insertBefore.call(this, node, child) as T;
  });
  vi.spyOn(Node.prototype, 'appendChild').mockImplementation(function <T extends Node>(this: Node, node: T): T {
    reset(node);
    return appendChild.call(this, node) as T;
  });
}

describe('TabDocumentManager: moved content keeps its scroll', () => {
  it('a scrolled element inside a document moved to another group is still scrolled there', async () => {
    const m = manager();
    const list = new Component<HTMLDivElement>('div');
    const inner = document.createElement('div');
    list.element.append(inner);
    const a = m.open(new TabDocument({ title: 'List', content: list }))!;
    m.open(doc('B'));
    const right = m.split(m.groups[0], 'right')!;
    await settle();
    m.activate(a);
    const panel = list.element.closest<HTMLElement>('.mx-tabdocs__panel')!;
    panel.scrollTop = 120;
    inner.scrollLeft = 40;
    forgetScrollOnMove();
    m.move(a, right);
    await settle();
    expect(m.contentOf(a)).toBe(list);
    expect(list.element.closest('.mx-tabdocs__group')).toBe(right.element);
    expect(panel.scrollTop).toBe(120);
    expect(inner.scrollLeft).toBe(40);
  });
});

describe('TabDocumentManager: floating windows', () => {
  it('float(doc) moves a document into a window of its own, sized from its group; dock() puts it back', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const log = record(m);
    const changes: string[] = [];
    m.onLayoutChanged((e) => changes.push(e.change));
    const a = m.findDocument('a')!;
    const content = m.contentOf(a);
    const w = m.float(a)!;
    expect(w).not.toBeNull();
    expect(m.floatingWindows).toEqual([w]);
    expect(w.rect).toEqual({ x: 32, y: 32, width: 400, height: 400 });
    expect(w.documents).toEqual([a]);
    expect(a.window).toBe(w);
    expect(m.contentOf(a)).toBe(content);
    expect(w.element.parentElement).toBe(m.element);
    expect(w.element.getAttribute('role')).toBe('dialog');
    expect(w.element.getAttribute('aria-label')).toBe('Floating window 1');
    expect(log).toEqual(['floating A', 'floated A']);
    expect(changes).toContain('float');
    await settle();
    expect(live(m)).toBe('A floats in a window');
    expect(m.dock(a)).toBe(true);
    expect(titles(m.groups[0])).toEqual(['B', 'A']);
    expect(m.floatingWindows).toEqual([]);
    expect(log.slice(2)).toEqual(['docking A back', 'windowClosed docked', 'docked A documents']);
    expect(m.contentOf(a)).toBe(content);
  });

  it('a whole group floats; the documents keep a group; a window holds splits like the documents do', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    const group = m.groups[0];
    const w = m.float(group, { x: 100, y: 50, width: 500, height: 300 })!;
    expect(w.groups).toEqual([group]);
    expect(w.rect).toEqual({ x: 100, y: 50, width: 500, height: 300 });
    expect(m.groups).toHaveLength(2);
    expect(m.groups[0].window).toBeNull();
    expect(m.groups[0].isEmpty).toBe(true);
    const right = m.split(group, 'right', m.findDocument('b')!)!;
    expect(right.window).toBe(w);
    expect(w.groups.map(titles)).toEqual([['A'], ['B']]);
    // The group at the top end of a window is its title: it has the window's buttons.
    expect(w.element.querySelectorAll('.mx-tabdocs__group')[1]).toBe(right.element);
    // A group of a split window floats into a window of its own; alone there, it does not float again.
    const v = m.float(right)!;
    expect(v.groups).toEqual([right]);
    expect(w.groups).toEqual([group]);
    expect(m.float(right)).toBeNull();
    expect(m.float(m.findDocument('b')!)).toBeNull();
  });

  it('dragging a tab outside every manager floats it at the pointer; dragging the window by its strip moves it', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const log = record(m);
    drag(header(m, 'B'), [
      [100, 15],
      [900, 500],
    ]);
    const w = m.floatingWindows[0];
    expect(w.documents.map((d) => d.title)).toEqual(['B']);
    // At the pointer, kept inside the viewport (jsdom's is 1024 × 768): the window is as large as its group, 400 square.
    expect(w.rect).toEqual({ x: 1024 - 400, y: 768 - 400, width: 400, height: 400 });
    expect(log).toEqual(['over strip', 'over float', 'floating B', 'floated B', 'dropped float']);
    // Its strip's empty part is its title: the window follows the pointer, nothing else moves.
    const g = w.groups[0];
    layGroup(g, new DOMRect(w.rect.x, w.rect.y, w.rect.width, w.rect.height));
    rects.set(w.element, new DOMRect(w.rect.x, w.rect.y, w.rect.width, w.rect.height));
    const from = w.rect;
    const bar = g.element.querySelector('.mx-tabdocs__strip')!;
    drag(bar, [[w.rect.x + 300, w.rect.y + 15], [w.rect.x + 250, w.rect.y - 85]], { at: [w.rect.x + 300, w.rect.y + 15] });
    expect([w.rect.x, w.rect.y]).toEqual([from.x - 50, from.y - 100]);
    expect(w.documents.map((d) => d.title)).toEqual(['B']);
    // Escape puts a window moved back.
    drag(bar, [[from.x + 260, from.y - 70], [from.x + 100, from.y - 70]], { at: [from.x + 250, from.y - 85], hold: true });
    key('Escape', {}, document.body);
    pointer('pointerup', document.body, 0, 0);
    expect([w.rect.x, w.rect.y]).toEqual([from.x - 50, from.y - 100]);
  });

  it('a window let go on a strip of the documents docks there: its documents join that group', async () => {
    const m = managerWith([['A'], ['B', 'C']]);
    lay(m);
    const log = record(m);
    const w = m.float(m.findDocument('c')!, { x: 500, y: 450, width: 300, height: 200 })!;
    rects.set(w.element, new DOMRect(500, 450, 300, 200));
    layGroup(w.groups[0], new DOMRect(500, 450, 300, 200));
    log.length = 0;
    drag(w.groups[0].element.querySelector('.mx-tabdocs__strip')!, [[700, 465], [100, 15]], { at: [700, 465] });
    expect(m.floatingWindows).toEqual([]);
    expect(titles(m.groups[0])).toEqual(['A', 'C']);
    expect(log).toEqual(['over strip', 'docking window back', 'windowClosed docked', 'docked group documents', 'dropped strip']);
  });

  it('moves, resizes, maximizes and restores by code, each asking first; keeps inside the viewport', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    const w = m.float(m.findDocument('a')!, { x: 10, y: 10, width: 300, height: 200 })!;
    const changes: string[] = [];
    m.onLayoutChanging((e) => {
      changes.push(`${e.change}${e.window === w ? ' w' : ''}`);
      if (e.change === 'maximizeWindow' && changes.includes('stop')) e.cancel = true;
    });
    expect(w.move(40, 60)).toBe(true);
    expect(w.resize(320, 240)).toBe(true);
    expect(w.rect).toEqual({ x: 40, y: 60, width: 320, height: 240 });
    expect(w.maximize()).toBe(true);
    expect(w.isMaximized).toBe(true);
    expect(w.element.hasAttribute('data-maximized')).toBe(true);
    expect(w.restore()).toBe(true);
    expect(w.rect).toEqual({ x: 40, y: 60, width: 320, height: 240 });
    changes.push('stop');
    expect(w.maximize()).toBe(false);
    expect(changes.slice(0, 4)).toEqual(['moveWindow w', 'resizeWindow w', 'maximizeWindow w', 'restoreWindow w']);
    // The viewport of jsdom is 1024 × 768.
    w.move(5000, -50);
    expect([w.rect.x, w.rect.y]).toEqual([1024 - 320, 0]);
    m.keepFloatingInView = false;
    w.move(5000, -50);
    expect([w.rect.x, w.rect.y]).toEqual([5000, -50]);
  });

  it('closeWindow closes its documents (each asks) and then the window; the last tab closing closes it too', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    const log = record(m);
    const w = m.float(m.findDocument('b')!)!;
    m.move(m.findDocument('c')!, w.groups[0]);
    m.findDocument('c')!.dirty = true;
    const keep = m.onClosing((e) => {
      if (e.document.dirty) e.cancel = true;
    });
    log.length = 0;
    expect(await w.close()).toBe(false);
    expect(m.floatingWindows).toEqual([w]);
    expect(w.documents.map((d) => d.title)).toEqual(['C']);
    keep.dispose();
    m.onWindowClosing((e) => (e.cancel = e.byUser));
    expect(await m.closeWindow(w)).toBe(true);
    expect(m.floatingWindows).toEqual([]);
    expect(log).toEqual(['windowClosing', 'windowClosing', 'windowClosed closed']);
    await settle();
    expect(live(m)).toBe('Window closed');
    // The last document closing closes the window (closeEmptyWindows), or leaves it empty.
    const v = m.float(m.findDocument('a')!)!;
    await m.close(m.findDocument('a')!);
    expect(m.floatingWindows).not.toContain(v);
    m.closeEmptyWindows = false;
    m.open(doc('D'));
    const u = m.float(m.findDocument('d')!)!;
    await m.close(m.findDocument('d')!);
    expect(m.floatingWindows).toEqual([u]);
    expect(u.groups[0].isEmpty).toBe(true);
    expect(log).toContain('windowClosed empty');
  });

  it('floating asks first: onFloating may change the rect or cancel; a document or a manager may refuse', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    m.onFloating((e) => {
      if (e.document?.title === 'B') e.cancel = true;
      else e.rect = { ...e.rect, x: 7, y: 8 };
    });
    expect(m.float(m.findDocument('b')!)).toBeNull();
    expect(m.floatingWindows).toEqual([]);
    const w = m.float(m.findDocument('a')!)!;
    expect([w.rect.x, w.rect.y]).toEqual([7, 8]);
    m.findDocument('c')!.allowFloat = false;
    expect(m.float(m.findDocument('c')!)).toBeNull();
    m.allowFloat = false;
    m.findDocument('c')!.allowFloat = true;
    expect(m.float(m.findDocument('c')!)).not.toBeNull();
    expect(m.float(m.findDocument('b')!)).toBeNull();
  });

  it('a double click on the empty strip of a window docks it back; the window has a menu of its own', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    const w = m.float(m.findDocument('a')!)!;
    const bar = w.groups[0].element.querySelector('.mx-tabdocs__strip')!;
    rightClick(bar);
    expect(menuNames(m)).toEqual([
      'Reopen closed',
      'Close all',
      'Close saved',
      'Lock group',
      'Split right',
      'Split down',
      'Move group to…',
      'Dock back',
      'Float in a window',
      'Dock left',
      'Dock right',
      'Dock at the top',
      'Dock at the bottom',
      'Move window into new window',
      'Maximize window',
      'Close window',
    ]);
    expect(menuItem(m, 'Float in a window').getAttribute('aria-disabled')).toBe('true');
    menuItem(m, 'Maximize window').click();
    expect(w.isMaximized).toBe(true);
    bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(m.floatingWindows).toEqual([]);
    expect(titles(m.groups[0])).toEqual(['B', 'A']);
  });
});

describe('TabDocumentManager: dock areas', () => {
  it('dock(doc, side) makes the area of that side; more documents join its group; an empty area goes', async () => {
    const m = managerWith([['A', 'B', 'C', 'D']]);
    lay(m);
    const log = record(m);
    expect(m.dock(m.findDocument('a')!, 'left')).toBe(true);
    const left = m.dockArea('left')!;
    expect(m.dockAreas).toEqual([left]);
    expect(left.documents.map((d) => d.title)).toEqual(['A']);
    expect(left.size).toBe(240);
    expect(m.findDocument('a')!.dockArea).toBe(left);
    expect(left.element.getAttribute('aria-label')).toBe('Left dock area');
    expect(left.sash.element.getAttribute('role')).toBe('separator');
    m.dock(m.findDocument('b')!, 'left');
    expect(left.groups.map(titles)).toEqual([['A', 'B']]);
    m.dock(m.findDocument('c')!, 'bottom', '30%');
    expect(m.dockArea('bottom')!.size).toBe('30%');
    expect(m.dockAreas.map((a) => a.side)).toEqual(['left', 'bottom']);
    // The documents' area keeps its group.
    expect(m.groups[0].documents.map((d) => d.title)).toEqual(['D']);
    expect(log.slice(0, 2)).toEqual(['docking A left', 'docked A left']);
    await settle();
    expect(live(m)).toBe('C docked: Bottom dock area');
    // Opened without a group, a document goes among the documents, not into a dock area.
    m.activate(m.findDocument('a')!);
    expect(m.open(doc('E'))!.group).toBe(m.groups[0]);
    await m.close(m.findDocument('c')!);
    expect(m.dockArea('bottom')).toBeNull();
    expect(m.dockAreas.map((a) => a.side)).toEqual(['left']);
  });

  it('areas nest in the order they were made: each takes its side of what the ones before left', async () => {
    const m = managerWith([['A', 'B', 'C', 'D']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    m.dock(m.findDocument('b')!, 'bottom');
    m.dock(m.findDocument('c')!, 'right');
    const [left, bottom, right] = m.dockAreas;
    expect(left.element.style.gridArea).toBe('2 / 2 / 7 / 3');
    expect(left.sash.element.style.gridArea).toBe('2 / 3 / 7 / 4');
    expect(bottom.element.style.gridArea).toBe('6 / 4 / 7 / 7');
    expect(right.element.style.gridArea).toBe('2 / 6 / 5 / 7');
    expect(left.element.style.inlineSize).toBe('240px');
    expect(bottom.element.style.blockSize).toBe('200px');
  });

  it('resizes by its splitter, with the mouse and the keys, within its smallest and the documents\' smallest', async () => {
    const m = managerWith([['A', 'B']], { dockAreaMinSize: 100 });
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    const area = m.dockArea('left')!;
    const sash = area.sash.element;
    const changes: string[] = [];
    m.onLayoutChanged((e) => changes.push(`${e.change}${e.area === area ? ' area' : ''}`));
    pointer('pointerdown', sash, 240, 100);
    pointer('pointermove', sash, 300, 100);
    pointer('pointerup', sash, 300, 100);
    expect(area.size).toBe(300);
    sash.focus();
    key('ArrowLeft');
    expect(area.size).toBe(290);
    key('Home');
    expect(area.size).toBe(100);
    key('End');
    // 800 wide, the documents keep their 160.
    expect(area.size).toBe(640);
    expect(changes).toEqual(['resizeArea area', 'resizeArea area', 'resizeArea area', 'resizeArea area']);
    expect(area.resize('25%')).toBe(true);
    expect(area.pixels()).toBe(200);
    expect(sash.getAttribute('aria-valuenow')).toBe('25');
  });

  it('a group and a whole window dock too; a docked window closes', async () => {
    const m = managerWith([['A'], ['B', 'C']]);
    lay(m);
    const log = record(m);
    expect(m.dock(m.groups[0], 'right')).toBe(true);
    expect(m.dockArea('right')!.groups.map(titles)).toEqual([['A']]);
    const w = m.float(m.findDocument('c')!)!;
    log.length = 0;
    expect(w.dock('right')).toBe(true);
    expect(m.dockArea('right')!.groups.map(titles)).toEqual([['A'], ['C']]);
    expect(m.floatingWindows).toEqual([]);
    expect(log).toEqual(['docking window right', 'windowClosed docked', 'docked group right']);
  });

  it('docking asks first and follows allowDock and dockSides, the document\'s own first', async () => {
    const m = managerWith([['A', 'B', 'C']], { dockSides: ['left', 'bottom'] });
    lay(m);
    m.onDocking((e) => {
      if (e.document?.title === 'B') e.cancel = true;
      if (e.document?.title === 'A') e.side = 'bottom';
    });
    expect(m.dock(m.findDocument('b')!, 'left')).toBe(false);
    expect(m.dock(m.findDocument('a')!, 'left')).toBe(true);
    expect(m.findDocument('a')!.dockArea?.side).toBe('bottom');
    expect(m.dock(m.findDocument('c')!, 'right')).toBe(false);
    m.findDocument('c')!.dockSides = ['right'];
    expect(m.dock(m.findDocument('c')!, 'right')).toBe(true);
    m.findDocument('c')!.allowDock = false;
    expect(m.dock(m.findDocument('c')!, 'left')).toBe(false);
  });
});

describe('TabDocumentManager: auto hide', () => {
  async function folded() {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    m.dock(m.findDocument('b')!, 'left');
    const area = m.dockArea('left')!;
    expect(m.autoHide(area)).toBe(true);
    await settle();
    return { m, area };
  }

  it('folds an area to its edge: its titles stay as a strip, the area and its splitter go', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    const area = m.dockArea('left')!;
    const log = record(m);
    expect(m.autoHide(m.findDocument('a')!)).toBe(true);
    await settle();
    expect(area.autoHidden).toBe(true);
    expect(area.element.hasAttribute('data-auto-hide')).toBe(true);
    expect(area.sash.element.hidden).toBe(true);
    const s = strip(m, 'left');
    expect(s.hidden).toBe(false);
    expect(s.getAttribute('role')).toBe('toolbar');
    expect(s.getAttribute('aria-label')).toBe('Hidden on the left');
    const tab = s.querySelector<HTMLButtonElement>('.mx-tabdocs__autohide-tab')!;
    expect(tab.textContent).toBe('A');
    expect(tab.getAttribute('aria-expanded')).toBe('false');
    expect(tab.getAttribute('aria-controls')).toBe(area.element.id);
    expect(log).toEqual(['autoHiding left true', 'autoHidden left true']);
    expect(live(m)).toBe('Left dock area folded to its edge');
    expect(m.autoHide(area, false)).toBe(true);
    await settle();
    expect(s.hidden).toBe(true);
    expect(area.sash.element.hidden).toBe(false);
  });

  it('a click on a title slides the area out with that document; a click outside slides it back', async () => {
    const { m, area } = await folded();
    const log = record(m);
    const tabs = strip(m, 'left').querySelectorAll<HTMLButtonElement>('.mx-tabdocs__autohide-tab');
    expect([...tabs].map((t) => t.textContent)).toEqual(['A', 'B']);
    tabs[0].click();
    await settle();
    expect(area.isOpen).toBe(true);
    expect(area.element.hasAttribute('data-open')).toBe(true);
    expect(area.groups[0].activeDocument?.title).toBe('A');
    expect(tabs[0].getAttribute('aria-expanded')).toBe('true');
    expect(area.element.contains(document.activeElement)).toBe(true);
    expect(log).toEqual(['slideChanging A true', 'slideChanged A true']);
    // Another title shows its document in the same area.
    tabs[1].click();
    expect(area.groups[0].activeDocument?.title).toBe('B');
    pointer('pointerdown', m.groups[0].element, 500, 200);
    await settle();
    expect(area.isOpen).toBe(false);
    expect(log.slice(-2)).toEqual(['slideChanging - false', 'slideChanged - false']);
  });

  it('Enter on a title slides it out, Escape slides it back and gives the title focus', async () => {
    const { m, area } = await folded();
    const tab = strip(m, 'left').querySelector<HTMLButtonElement>('.mx-tabdocs__autohide-tab')!;
    tab.focus();
    key('ArrowDown');
    expect(document.activeElement?.textContent).toBe('B');
    (document.activeElement as HTMLButtonElement).click();
    await settle();
    expect(area.isOpen).toBe(true);
    expect(area.element.contains(document.activeElement)).toBe(true);
    key('Escape');
    await settle();
    expect(area.isOpen).toBe(false);
    expect(document.activeElement?.textContent).toBe('B');
  });

  it('focus leaving the area slides it back; showAutoHidden and hideAutoHidden do it by code, each asking', async () => {
    const { m, area } = await folded();
    expect(m.showAutoHidden(m.findDocument('b')!)).toBe(true);
    expect(area.isOpen).toBe(true);
    const outside = header(m, 'C');
    area.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
    expect(area.isOpen).toBe(false);
    const stop = m.onSlideChanging((e) => (e.cancel = !e.open));
    m.showAutoHidden(m.findDocument('a')!);
    expect(m.hideAutoHidden()).toBe(false);
    stop.dispose();
    expect(m.hideAutoHidden()).toBe(true);
    // Activating a folded area's document by code slides it out.
    m.activate(m.findDocument('a')!);
    expect(area.isOpen).toBe(true);
  });

  it('resting the pointer on a title slides it out after autoHideDelay; away from it and the area, it slides back', async () => {
    vi.useFakeTimers();
    const { m, area } = await folded();
    const tab = strip(m, 'left').querySelector<HTMLButtonElement>('.mx-tabdocs__autohide-tab')!;
    tab.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    vi.advanceTimersByTime(400);
    expect(area.isOpen).toBe(false);
    vi.advanceTimersByTime(200);
    expect(area.isOpen).toBe(true);
    strip(m, 'left').dispatchEvent(new MouseEvent('pointerleave'));
    vi.advanceTimersByTime(600);
    expect(area.isOpen).toBe(false);
    m.autoHideHover = false;
    tab.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(area.isOpen).toBe(false);
  });

  it('the pin in the area\'s toolbar and the menu fold it; folding asks first and follows allowAutoHide', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'bottom');
    const area = m.dockArea('bottom')!;
    await settle();
    const pin = area.element.querySelector<HTMLElement>('.mx-tabdocs__auto-hide')!;
    expect(pin.getAttribute('aria-label') ?? pin.title).toContain('Auto hide');
    pin.click();
    expect(area.autoHidden).toBe(true);
    m.autoHide(area, false);
    rightClick(header(m, 'A'));
    menuItem(m, 'Auto hide').click();
    expect(area.autoHidden).toBe(true);
    m.autoHide(area, false);
    const stop = m.onAutoHiding((e) => (e.cancel = true));
    expect(m.autoHide(area)).toBe(false);
    stop.dispose();
    m.findDocument('a')!.allowAutoHide = false;
    expect(m.autoHide(area)).toBe(false);
    m.findDocument('a')!.allowAutoHide = undefined;
    m.allowAutoHide = false;
    expect(m.autoHide(area)).toBe(false);
  });
});

describe('TabDocumentManager: dock guides', () => {
  /** Two groups side by side in a manager at 0,0 800×400; guides 32 square, a quarter apart. */
  function guided(props: TabDocumentManagerProps = {}) {
    const m = managerWith([['A', 'B'], ['C']], { dockGuides: true, ...props });
    lay(m);
    return m;
  }

  it('show a cross over the group under the pointer and one guide at each edge; only while over the manager', async () => {
    const m = guided();
    drag(header(m, 'B'), [
      [100, 15],
      [600, 250],
    ], { hold: true });
    const shown = guides(m);
    expect(shown.map((g) => `${g.dataset.kind}:${g.dataset.side}`).sort()).toEqual([
      'cross:center',
      'cross:down',
      'cross:left',
      'cross:right',
      'cross:up',
      'edge:bottom',
      'edge:left',
      'edge:right',
      'edge:top',
    ]);
    // The cross is in the middle of the second group's content: 600, 215.
    const centre = shown.find((g) => g.dataset.kind === 'cross' && g.dataset.side === 'center')!;
    expect([centre.style.left, centre.style.top]).toEqual(['584px', '199px']);
    pointer('pointermove', document.body, 900, 500);
    expect(guides(m)).toHaveLength(0);
    key('Escape', {}, document.body);
    pointer('pointerup', document.body, 900, 500);
  });

  it('a drop on a guide of the cross goes into the group or beside it; away from the guides and strips it floats', async () => {
    const m = guided();
    const log = record(m);
    // The right guide of the cross over the second group: 624 … 656 across, 199 … 231 down.
    drag(header(m, 'B'), [
      [100, 15],
      [640, 215],
    ]);
    expect(m.groups.map(titles)).toEqual([['A'], ['C'], ['B']]);
    expect(log).toEqual(['over strip', 'over dock-guide:right', 'dropped dock-guide:right']);
    lay(m);
    log.length = 0;
    // On the content, away from every guide.
    drag(header(m, 'C'), [
      [300, 15],
      [300, 300],
    ]);
    expect(m.floatingWindows.map((w) => w.documents.map((d) => d.title))).toEqual([['C']]);
    expect(log).toEqual(['over strip', 'over float', 'floating C', 'floated C', 'dropped float']);
  });

  it('a guide at the manager\'s edge docks into that area; the drop area shows what it would take', async () => {
    const m = guided();
    const log = record(m);
    // The bottom edge guide: 384 … 416 across, 360 … 392 down.
    drag(header(m, 'B'), [
      [100, 15],
      [400, 375],
    ], { hold: true });
    const area = m.element.querySelector<HTMLElement>('.mx-tabdocs__drop')!;
    expect(area.hidden).toBe(false);
    expect([area.style.top, area.style.height]).toEqual(['200px', '200px']);
    expect(guides(m).find((g) => g.hasAttribute('data-pointed'))?.dataset.side).toBe('bottom');
    pointer('pointerup', document.body, 400, 375);
    expect(m.dockArea('bottom')?.documents.map((d) => d.title)).toEqual(['B']);
    expect(log).toEqual(['over strip', 'over dock-area:bottom', 'docking B bottom', 'docked B bottom', 'dropped dock-area:bottom']);
  });

  it('which guides show follows dockGuideKinds, dockSides, a group\'s dropSides and allowFloat', async () => {
    const m = guided({ dockGuideKinds: ['edges'], dockSides: ['left', 'right'] });
    drag(header(m, 'B'), [
      [100, 15],
      [600, 250],
    ], { hold: true });
    expect(guides(m).map((g) => g.dataset.side)).toEqual(['left', 'right']);
    key('Escape', {}, document.body);
    pointer('pointerup', document.body, 600, 250);
    m.dockGuideKinds = ['group', 'edges'];
    m.groups[1].dropSides = ['center'];
    m.allowFloat = false;
    const log = record(m);
    drag(header(m, 'B'), [
      [100, 15],
      [600, 300],
    ]);
    expect(guides(m)).toHaveLength(0);
    // Away from the one guide left (the middle), with nothing to float: nowhere.
    expect(log).toEqual(['over strip']);
    expect(m.groups.map(titles)).toEqual([['A', 'B'], ['C']]);
  });

  it('off, the edge zones of milestone 3 work as before and nothing shows', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    drag(header(m, 'B'), [
      [100, 15],
      [790, 215],
    ]);
    expect(guides(m)).toHaveLength(0);
    expect(m.groups.map(titles)).toEqual([['A'], ['C'], ['B']]);
  });
});

describe('TabDocumentManager: dock and float from the keyboard', () => {
  it('keys float, dock to a side, dock back and fold, each one an option', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    header(m, 'A').focus();
    key('k', { ctrlKey: true });
    key('o');
    expect(m.findDocument('a')!.window).not.toBeNull();
    header(m, 'A').focus();
    key('k', { ctrlKey: true });
    key('d');
    expect(m.findDocument('a')!.window).toBeNull();
    header(m, 'B').focus();
    key('k', { ctrlKey: true });
    key('ArrowLeft', { altKey: true });
    expect(m.findDocument('b')!.dockArea?.side).toBe('left');
    header(m, 'B').focus();
    key('k', { ctrlKey: true });
    key('h');
    expect(m.dockArea('left')!.autoHidden).toBe(true);
    m.keys = { float: ['F9'] };
    header(m, 'C').focus();
    key('F9');
    expect(m.findDocument('c')!.window).not.toBeNull();
  });

  it('F6 goes round the documents, the dock areas and the floating windows', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    m.float(m.findDocument('b')!);
    header(m, 'C').focus();
    key('F6');
    expect(document.activeElement?.textContent).toContain('A');
    key('F6');
    expect(document.activeElement?.textContent).toContain('B');
    key('F6');
    expect(document.activeElement?.textContent).toContain('C');
    key('F6', { shiftKey: true });
    expect(document.activeElement?.textContent).toContain('B');
  });

  it('a window moves and resizes by keys; Enter keeps it, Escape puts it back', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    const w = m.float(m.findDocument('a')!, { x: 100, y: 100, width: 300, height: 200 })!;
    header(m, 'A').focus();
    key('k', { ctrlKey: true });
    key(' ');
    await settle();
    expect(live(m)).toContain('Moving the window');
    key('ArrowRight');
    key('ArrowDown');
    key('ArrowRight', { shiftKey: true });
    expect(w.rect).toEqual({ x: 110, y: 110, width: 310, height: 200 });
    key('Escape');
    expect(w.rect).toEqual({ x: 100, y: 100, width: 300, height: 200 });
    header(m, 'A').focus();
    key('k', { ctrlKey: true });
    key(' ');
    key('ArrowUp');
    key('Enter');
    expect(w.rect.y).toBe(90);
    key('k', { ctrlKey: true });
    key('M', { shiftKey: true });
    expect(w.isMaximized).toBe(true);
  });

  it('"Move to…" goes on past the edge of the layout to the dock area there, then to a window of its own', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    header(m, 'A').focus();
    m.showMoveTo(m.findDocument('a')!);
    // From the right of its group: the middle, the left side, the left edge.
    key('ArrowLeft');
    key('ArrowLeft');
    key('ArrowLeft');
    await settle();
    expect(live(m)).toBe('New group along the left edge');
    key('ArrowLeft');
    await settle();
    expect(live(m)).toBe('Into the left dock area');
    key('ArrowLeft');
    await settle();
    expect(live(m)).toBe('Into a floating window of its own');
    key('ArrowRight');
    await settle();
    expect(live(m)).toBe('Into the left dock area');
    key('Enter');
    expect(m.findDocument('a')!.dockArea?.side).toBe('left');
  });

  it('the tab menu has float and the dock sides; in an area, auto hide; in a window, dock back', async () => {
    const m = managerWith([['A', 'B']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left');
    rightClick(header(m, 'A'));
    const names = menuNames(m);
    expect(names.slice(-7)).toEqual(['Float in a window', 'Dock left', 'Dock right', 'Dock at the top', 'Dock at the bottom', 'Auto hide', 'Move into new window']);
    expect(menuItem(m, 'Dock left').getAttribute('aria-disabled')).toBe('true');
    menuItem(m, 'Float in a window').click();
    expect(m.findDocument('a')!.window).not.toBeNull();
    // Docked back, it goes to the area it floated from.
    rightClick(header(m, 'A'));
    expect(menuNames(m)).toContain('Dock back');
    menuItem(m, 'Dock back').click();
    expect(m.findDocument('a')!.dockArea?.side).toBe('left');
  });
});

describe('TabDocumentManager: layout with windows and dock areas', () => {
  it('saves and loads the windows (place, order, layout) and the areas (size, order, folded)', async () => {
    const m = managerWith([['A', 'B', 'C', 'D', 'E']]);
    lay(m);
    m.dock(m.findDocument('a')!, 'left', 260);
    m.dock(m.findDocument('b')!, 'bottom', '30%');
    m.autoHide(m.dockArea('bottom')!);
    const w1 = m.float(m.findDocument('c')!, { x: 10, y: 20, width: 300, height: 200 })!;
    m.move(m.findDocument('d')!, w1.groups[0]);
    m.split(w1.groups[0], 'down', m.findDocument('d')!);
    const w2 = m.float(m.findDocument('e')!, { x: 50, y: 60, width: 320, height: 210 })!;
    w2.maximize();
    w1.focus();
    const saved: TabLayout = JSON.parse(JSON.stringify(m.saveLayout()));
    expect(saved.version).toBe(3);
    expect(saved.areas!.map((a) => [a.side, a.size, !!a.autoHide])).toEqual([
      ['left', 260, false],
      ['bottom', '30%', true],
    ]);
    expect(saved.windows!.map((w) => [w.rect.x, !!w.maximized])).toEqual([
      [50, true],
      [10, false],
    ]);
    const n = manager();
    lay(n);
    expect(n.loadLayout(saved)).toBe(true);
    expect(n.dockAreas.map((a) => [a.side, a.size, a.autoHidden])).toEqual([
      ['left', 260, false],
      ['bottom', '30%', true],
    ]);
    expect(n.floatingWindows.map((w) => [w.rect, w.isMaximized])).toEqual([
      [{ x: 50, y: 60, width: 320, height: 210 }, true],
      [{ x: 10, y: 20, width: 300, height: 200 }, false],
    ]);
    expect(n.floatingWindows[1].groups.map((g) => g.documents.map((d) => d.title))).toEqual([['C'], ['D']]);
    expect(n.dockArea('left')!.documents.map((d) => d.title)).toEqual(['A']);
    // A window loaded back knows where it docks back.
    expect(n.dock(n.findDocument('e')!)).toBe(true);
    expect(n.findDocument('e')!.window).toBeNull();
    // Loading again replaces the windows and the areas.
    expect(n.loadLayout({ version: 1, root: { kind: 'group', documents: [{ id: 'x', type: 't', title: 'X' }], active: 0, recent: [0] }, activeGroup: 0, maximizedGroup: null })).toBe(true);
    expect(n.floatingWindows).toEqual([]);
    expect(n.dockAreas).toEqual([]);
    expect(n.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['X']]);
    expect(n.element.querySelectorAll('.mx-tabdocs__window, .mx-tabdocs__area')).toHaveLength(0);
  });
});
