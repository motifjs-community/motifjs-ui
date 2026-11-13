import { Component } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabDropEventArgs } from './tab-drop-event-args';
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

/**
 * Lays a manager out at `box`, its groups side by side (or at `boxes`): a bar 30 tall on top, tabs
 * 80 wide from the left, the content under the bar.
 */
function lay(m: TabDocumentManager, box = new DOMRect(0, 0, 800, 400), boxes?: DOMRect[]) {
  rects.set(m.element, box);
  const root = m.element.querySelector(':scope > .mx-tabdocs__split, :scope > .mx-tabdocs__group');
  if (root) rects.set(root, box);
  const width = box.width / m.groups.length;
  m.groups.forEach((g, i) => {
    const b = boxes?.[i] ?? new DOMRect(box.x + i * width, box.y, width, box.height);
    rects.set(g.element, b);
    rects.set(g.element.querySelector('.mx-tabdocs__bar')!, new DOMRect(b.x, b.y, b.width, 30));
    rects.set(g.element.querySelector('.mx-tabdocs__row')!, new DOMRect(b.x, b.y, b.width - 60, 30));
    rects.set(g.element.querySelector('.mx-tabdocs__panels')!, new DOMRect(b.x, b.y + 30, b.width, b.height - 30));
    g.element.querySelectorAll('[role="tab"]').forEach((h, j) => rects.set(h, new DOMRect(b.x + j * 80, b.y, 80, 30)));
  });
}

interface PointerInit {
  pointerType?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
}

function pointer(type: string, target: EventTarget, x: number, y: number, init: PointerInit = {}) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ctrlKey: !!init.ctrlKey, altKey: !!init.altKey });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'pointerType', { value: init.pointerType ?? 'mouse' });
  target.dispatchEvent(e);
  // A frame between pointer events, as in a browser: what the event asked to measure lands now.
  if (hosts.length) measureNow(hosts[0]);
  return e;
}

/** Presses on `from`, moves through the points and lets go at the last one (unless `hold`). */
function drag(from: Element, points: [number, number][], init: PointerInit & { hold?: boolean } = {}) {
  const r = from.getBoundingClientRect();
  pointer('pointerdown', from, r.x + r.width / 2, r.y + r.height / 2, init);
  for (const [x, y] of points) pointer('pointermove', document.body, x, y, init);
  const [x, y] = points[points.length - 1];
  if (!init.hold) pointer('pointerup', document.body, x, y, init);
}

function key(k: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const titles = (m: TabDocumentManager, g = 0) => m.groups[g].documents.map((d) => d.title);
const header = (m: TabDocumentManager, title: string) =>
  Array.from(m.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.querySelector('.mx-tabdocs__title')!.textContent === title)!;
const bar = (g: TabGroup) => g.element.querySelector<HTMLElement>('.mx-tabdocs__strip')!;
const live = (m: TabDocumentManager) => m.element.querySelector('.mx-tabdocs__live')!.textContent;
const area = (m: TabDocumentManager) => m.element.querySelector<HTMLElement>('.mx-tabdocs__drop');
const mark = (m: TabDocumentManager) => m.element.querySelector<HTMLElement>('.mx-tabdocs__insert');

/** Every drag event, in order, with what it says. */
function record(m: TabDocumentManager) {
  const log: string[] = [];
  const place = (e: TabDropEventArgs) => `${e.target}:${e.group ? m.groups.indexOf(e.group) : '-'}:${e.index}:${e.side ?? '-'}${e.copy ? ':copy' : ''}`;
  m.onDragStarting((e) => log.push(`starting ${e.document?.title ?? 'group'}`));
  m.onDragOver((e) => log.push(`over ${place(e)}`));
  m.onDropping((e) => log.push(`dropping ${place(e)}`));
  m.onDropped((e) => log.push(`dropped ${e.target} ${e.document?.title ?? 'group'}`));
  m.onDragEnded((e) => log.push(`ended ${e.dropped}`));
  m.onMoving((e) => log.push(`moving ${e.document.title}`));
  m.onMoved((e) => log.push(`moved ${e.document.title}`));
  m.onSplitting((e) => log.push(`splitting ${e.direction}`));
  m.onSplit((e) => log.push(`split ${e.direction}`));
  return log;
}

describe('TabDocumentManager: dragging a tab', () => {
  it('reorders a strip; the events say where, then what the move did', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    lay(m);
    const log = record(m);
    drag(header(m, 'C'), [
      [215, 15],
      [30, 15],
    ]);
    expect(titles(m)).toEqual(['C', 'A', 'B']);
    expect(log).toEqual(['starting C', 'over strip:0:2:-', 'over strip:0:0:-', 'dropping strip:0:0:-', 'moving C', 'moved C', 'dropped strip C', 'ended true']);
    expect(m.dragging).toBeNull();
    expect(m.element.hasAttribute('data-dragging')).toBe(false);
  });

  it('shows a copy under the pointer, the mark between tabs and, over a group, the area a drop takes', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    drag(header(m, 'A'), [[100, 15]], { hold: true });
    expect(m.element.dataset.dragging).toBe('move');
    expect(m.element.querySelector('.mx-tabdocs__ghost')?.textContent).toContain('A');
    expect(header(m, 'A').hasAttribute('data-dragging')).toBe(true);
    expect([mark(m)!.hidden, mark(m)!.style.left, mark(m)!.style.height]).toEqual([false, '80px', '30px']);
    expect(area(m)?.hidden ?? true).toBe(true);
    expect(m.dragging?.document?.title).toBe('A');
    pointer('pointermove', document.body, 600, 215);
    expect(mark(m)!.hidden).toBe(true);
    expect([area(m)!.hidden, area(m)!.style.left, area(m)!.style.top, area(m)!.style.width, area(m)!.style.height]).toEqual([false, '400px', '30px', '400px', '370px']);
    pointer('pointermove', document.body, 410, 215);
    expect([area(m)!.style.left, area(m)!.style.width]).toEqual(['400px', '200px']);
    pointer('pointerup', document.body, 410, 215);
    expect(m.element.querySelector('.mx-tabdocs__ghost')).toBeNull();
    expect(area(m)!.hidden).toBe(true);
  });

  it("moves to another group's strip at the place under the pointer, or at its end from the empty strip", async () => {
    const m = managerWith([['A', 'B'], ['C', 'D']]);
    lay(m);
    drag(header(m, 'A'), [
      [100, 15],
      [470, 15],
    ]);
    expect([titles(m, 0), titles(m, 1)]).toEqual([['B'], ['C', 'A', 'D']]);
    expect(m.groups[1].activeDocument?.title).toBe('A');
    lay(m);
    drag(header(m, 'B'), [
      [100, 15],
      [700, 15],
    ]);
    // The last tab out: its group closes.
    expect(m.groups).toHaveLength(1);
    expect(titles(m)).toEqual(['C', 'A', 'D', 'B']);
  });

  it('into the middle of a group, after its active tab', async () => {
    const m = managerWith([['A', 'B'], ['C', 'D']]);
    m.activate(m.findDocument('c')!);
    lay(m);
    drag(header(m, 'A'), [
      [100, 15],
      [600, 215],
    ]);
    expect(titles(m, 1)).toEqual(['C', 'A', 'D']);
  });

  it.each([
    ['left', 410, 215, ['A'], ['B'], 'horizontal'],
    ['right', 700, 215, ['B'], ['A'], 'horizontal'],
    ['up', 600, 60, ['A'], ['B'], 'vertical'],
    ['down', 600, 360, ['B'], ['A'], 'vertical'],
  ] as const)('on the %s edge of a group: a new group on that side', async (side, x, y, first, second, orientation) => {
    const m = managerWith([['X'], ['A', 'B']]);
    lay(m);
    const log = record(m);
    drag(header(m, 'A'), [
      [480, 15],
      [x, y],
    ]);
    expect(log).toContain(`splitting ${side}`);
    expect(m.groups).toHaveLength(3);
    expect([titles(m, 1), titles(m, 2)]).toEqual([first, second]);
    // Beside it along the split it is in, or in a new split across it.
    const layout = m.saveLayout().root;
    const inner = layout.kind === 'split' ? layout.children[1] : layout;
    expect(inner.kind === 'split' ? inner.orientation : layout.kind === 'split' && layout.orientation).toBe(orientation);
  });

  it('on an edge of the whole layout: a new group along it', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const log = record(m);
    drag(header(m, 'B'), [
      [100, 15],
      [600, 396],
    ]);
    expect(log).toContain('over edge:-:-1:down');
    const layout = m.saveLayout().root;
    expect(layout.kind === 'split' && layout.orientation).toBe('vertical');
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['A'], ['C'], ['B']]);
    lay(m, new DOMRect(0, 0, 800, 400), [new DOMRect(0, 0, 400, 200), new DOMRect(400, 0, 400, 200), new DOMRect(0, 200, 800, 200)]);
    drag(header(m, 'A'), [
      [100, 100],
      [4, 100],
    ]);
    expect(m.saveLayout().root.kind === 'split' && (m.saveLayout().root as { orientation: string }).orientation).toBe('horizontal');
    expect(titles(m, 0)).toEqual(['A']);
  });

  it('across the border between pinned and other tabs pins or unpins, unless told not to', async () => {
    const m = managerWith([['P1', 'P2', 'A', 'B']]);
    m.pin(m.findDocument('p1')!);
    m.pin(m.findDocument('p2')!);
    lay(m);
    drag(header(m, 'B'), [
      [280, 15],
      [30, 15],
    ]);
    expect(titles(m)).toEqual(['B', 'P1', 'P2', 'A']);
    expect(m.findDocument('b')!.pinned).toBe(true);
    lay(m);
    drag(header(m, 'P1'), [
      [130, 15],
      [300, 15],
    ]);
    expect(titles(m)).toEqual(['B', 'P2', 'A', 'P1']);
    expect(m.findDocument('p1')!.pinned).toBe(false);
    m.pinOnDrag = false;
    lay(m);
    drag(header(m, 'A'), [
      [200, 15],
      [10, 15],
    ]);
    expect(titles(m)).toEqual(['B', 'P2', 'A', 'P1']);
    expect(m.findDocument('a')!.pinned).toBe(false);
  });

  it('copies with Ctrl held when the document may be open twice, and moves otherwise', async () => {
    const m = managerWith([['A', 'B'], ['C']], { allowDuplicate: true });
    lay(m);
    const log = record(m);
    drag(
      header(m, 'A'),
      [
        [100, 15],
        [600, 215],
      ],
      { ctrlKey: true },
    );
    expect(log).toContain('dropping group:1:-1:center:copy');
    expect([titles(m, 0), titles(m, 1)]).toEqual([['A', 'B'], ['C', 'A']]);
    expect(m.groups[1].documents[1].original).toBe(m.findDocument('a'));
    await settle();
    expect(live(m)).toBe('A copied to group 2');
    m.allowDuplicate = false;
    lay(m);
    drag(
      header(m, 'B'),
      [
        [100, 15],
        [600, 215],
      ],
      { ctrlKey: true },
    );
    expect([titles(m, 0), titles(m, 1)]).toEqual([['A'], ['C', 'A', 'B']]);
  });

  it('Escape cancels and puts back what resting on a tab activated', async () => {
    vi.useFakeTimers();
    const m = managerWith([['A', 'B'], ['C', 'D']], { dragHoverDelay: 300 });
    m.activate(m.findDocument('c')!);
    m.activate(m.findDocument('a')!);
    lay(m);
    const log = record(m);
    drag(header(m, 'A'), [
      [100, 15],
      [500, 15],
    ], { hold: true });
    vi.advanceTimersByTime(300);
    expect(m.groups[1].activeDocument?.title).toBe('D');
    expect(key('Escape')).toBe(true);
    expect(m.groups[1].activeDocument?.title).toBe('C');
    expect(m.activeGroup).toBe(m.groups[0]);
    expect([titles(m, 0), titles(m, 1)]).toEqual([['A', 'B'], ['C', 'D']]);
    expect(log.slice(-1)).toEqual(['ended false']);
    expect(m.element.querySelector('.mx-tabdocs__ghost')).toBeNull();
    vi.useRealTimers();
    await settle();
    expect(live(m)).toBe('Move canceled');
  });

  it('each event can stop it: dragStarting, dragOver (refused there), dropping', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const stop = m.onDragStarting((e) => (e.cancel = e.document?.title === 'A'));
    drag(header(m, 'A'), [
      [100, 15],
      [600, 215],
    ]);
    expect(titles(m, 0)).toEqual(['A', 'B']);
    stop.dispose();
    const refuse = m.onDragOver((e) => (e.cancel = e.side === 'center'));
    drag(header(m, 'A'), [
      [100, 15],
      [600, 215],
    ], { hold: true });
    expect([m.element.dataset.dragging, area(m)?.hidden ?? true]).toEqual(['none', true]);
    pointer('pointerup', document.body, 600, 215);
    expect(titles(m, 0)).toEqual(['A', 'B']);
    refuse.dispose();
    const keep = m.onDropping((e) => (e.cancel = true));
    lay(m);
    drag(header(m, 'A'), [
      [100, 15],
      [600, 215],
    ]);
    expect(titles(m, 0)).toEqual(['A', 'B']);
    keep.dispose();
  });

  it('dragOver and dropping can send the drop elsewhere; outside every manager it floats, or is refused where it may not', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const log = record(m);
    m.onDropping((e) => {
      if (e.side === 'right') e.side = 'down';
    });
    drag(header(m, 'A'), [
      [100, 15],
      [700, 215],
    ]);
    expect(log).toContain('split down');
    lay(m);
    log.length = 0;
    m.allowFloat = false;
    drag(header(m, 'B'), [
      [100, 15],
      [900, 500],
    ]);
    expect(log).toEqual(['starting B', 'over strip:0:0:-', 'over outside:-:-1:-', 'ended false']);
    m.allowFloat = true;
    log.length = 0;
    drag(header(m, 'B'), [
      [100, 15],
      [900, 500],
    ]);
    expect(log).toEqual(['starting B', 'over strip:0:0:-', 'over float:-:-1:-', 'dropping float:-:-1:-', 'moving B', 'moved B', 'dropped float B', 'ended true']);
    expect(m.floatingWindows).toHaveLength(1);
    expect(m.floatingWindows[0].documents.map((d) => d.title)).toEqual(['B']);
  });

  it('follows allowDrag (the document first), allowDragGroups and a group that takes no drops', async () => {
    const m = managerWith([['A', 'B'], ['C']], { allowDrag: false });
    lay(m);
    m.findDocument('b')!.allowDrag = true;
    drag(header(m, 'A'), [
      [100, 15],
      [600, 215],
    ]);
    drag(header(m, 'B'), [
      [100, 15],
      [600, 215],
    ]);
    expect([titles(m, 0), titles(m, 1)]).toEqual([['A'], ['C', 'B']]);
    m.allowDrag = true;
    m.groups[1].allowDrop = false;
    lay(m);
    drag(header(m, 'A'), [
      [30, 15],
      [600, 215],
    ]);
    expect(titles(m, 0)).toEqual(['A']);
    m.groups[1].allowDrop = true;
    m.groups[1].dropSides = ['left'];
    lay(m);
    drag(header(m, 'A'), [
      [30, 15],
      [600, 215],
    ]);
    expect(titles(m, 0)).toEqual(['A']);
    m.dropSides = ['center'];
    m.groups[1].dropSides = null;
    drag(header(m, 'A'), [
      [30, 15],
      [410, 215],
    ]);
    expect(m.groups).toHaveLength(1);
    expect(titles(m, 0)).toEqual(['C', 'B', 'A']);
  });

  it('starts with a long press of a finger, while a swipe before it scrolls instead', async () => {
    vi.useFakeTimers();
    const m = managerWith([['A', 'B'], ['C']], { longPressDelay: 400 });
    lay(m);
    const touch = { pointerType: 'touch' };
    drag(header(m, 'A'), [[200, 15]], touch);
    vi.advanceTimersByTime(500);
    expect(m.dragging).toBeNull();
    pointer('pointerdown', header(m, 'A'), 40, 15, touch);
    vi.advanceTimersByTime(399);
    expect(m.dragging).toBeNull();
    vi.advanceTimersByTime(1);
    expect(m.dragging?.document?.title).toBe('A');
    // A long press opens no menu of its own while it drags.
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    header(m, 'A').dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
    pointer('pointermove', document.body, 300, 215, touch);
    pointer('pointermove', document.body, 600, 215, touch);
    pointer('pointerup', document.body, 600, 215, touch);
    expect(titles(m, 1)).toEqual(['C', 'A']);
  });

  it('holds a touchmove listener on each bar from the start, so a finger drag can stop the page scrolling', async () => {
    // A phone decides when the finger lands whether the page may scroll at once: a listener added on the press is too late.
    const add = EventTarget.prototype.addEventListener;
    const held = new Set<EventTarget>();
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (this: EventTarget, type: string, fn: any, options?: any) {
      // On an element a listener is not passive unless asked: only the window, the document and the body default to passive.
      if (type === 'touchmove' && !(typeof options === 'object' && options?.passive)) held.add(this);
      return add.call(this, type, fn, options);
    });
    vi.useFakeTimers();
    const m = managerWith([['A', 'B'], ['C']], { longPressDelay: 400 });
    lay(m);
    expect(m.groups.every((g) => held.has(g.barPart.element))).toBe(true);
    const move = () => {
      const e = new Event('touchmove', { bubbles: true, cancelable: true });
      header(m, 'A').dispatchEvent(e);
      return e.defaultPrevented;
    };
    // Without a drag the strip scrolls; once a long press drags, the finger moves the tab.
    expect(move()).toBe(false);
    pointer('pointerdown', header(m, 'A'), 40, 15, { pointerType: 'touch' });
    vi.advanceTimersByTime(400);
    expect(m.dragging?.document?.title).toBe('A');
    expect(move()).toBe(true);
    m.cancelDrag();
    expect(move()).toBe(false);
  });

  it('a long press let go where it started opens the tab menu there, and moves nothing', async () => {
    vi.useFakeTimers();
    const m = managerWith([['A', 'B']], { longPressDelay: 400 });
    lay(m);
    const log = record(m);
    pointer('pointerdown', header(m, 'B'), 120, 15, { pointerType: 'pen' });
    vi.advanceTimersByTime(400);
    pointer('pointerup', document.body, 121, 16, { pointerType: 'pen' });
    expect(titles(m)).toEqual(['A', 'B']);
    expect(log.slice(-1)).toEqual(['ended false']);
    const menu = Array.from(m.element.querySelectorAll<HTMLElement>('.mx-popup')).find((p) => !p.hidden);
    expect(menu?.getAttribute('aria-label') ?? menu?.querySelector('[role="menu"]')?.getAttribute('aria-label')).toBe('B');
  });
});

describe('TabDocumentManager: dragging a group', () => {
  it('by the empty part of its bar, beside another group or into it', async () => {
    const m = managerWith([['A'], ['B'], ['C', 'D']]);
    lay(m);
    const log = record(m);
    const third = m.groups[2];
    rects.set(bar(third), new DOMRect(533, 0, 267, 30));
    drag(bar(third), [
      [700, 15],
      [10, 215],
    ]);
    expect(log[0]).toBe('starting group');
    expect(m.groups[0]).toBe(third);
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['C', 'D'], ['A'], ['B']]);
    lay(m);
    drag(bar(m.groups[0]), [
      [200, 20],
      [700, 215],
    ]);
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['A'], ['B', 'C', 'D']]);
    expect(m.groups[1].activeDocument?.title).toBe('D');
  });

  it('by its handle, when the manager has one: a drag moves the group, a click starts "Move group to…"', async () => {
    const m = managerWith([['A'], ['B', 'C']]);
    await settle();
    expect(m.element.querySelector('.mx-tabdocs__grip')).toBeNull();
    m.groupDragHandle = true;
    await settle();
    lay(m);
    const grip = m.groups[1].element.querySelector<HTMLElement>('.mx-tabdocs__grip')!;
    expect(grip.querySelector('[aria-label], [title]')?.getAttribute('aria-label') ?? grip.getAttribute('aria-label') ?? grip.title).toBe('Move group to…');
    rects.set(grip, new DOMRect(400, 0, 24, 30));
    drag(grip, [
      [420, 20],
      [10, 215],
    ]);
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['B', 'C'], ['A']]);
    // The click that ends a drag is swallowed; a later one is a click.
    await new Promise((done) => setTimeout(done, 0));
    m.groups[0].element.querySelector<HTMLElement>('.mx-tabdocs__grip')!.click();
    expect(m.dragging?.document).toBeNull();
    expect(m.dragging?.group).toBe(m.groups[0]);
    key('Escape');
  });

  it('a group of another manager of the same dragGroup: its documents come over and it closes', async () => {
    const left = managerWith([['A'], ['B', 'C']], { dragGroup: 'files' });
    const right = managerWith([['D']], { dragGroup: 'files' });
    lay(left, new DOMRect(0, 0, 400, 400));
    lay(right, new DOMRect(400, 0, 400, 400));
    const group = left.groups[1];
    rects.set(bar(group), new DOMRect(200, 0, 200, 30));
    drag(bar(group), [
      [300, 20],
      [600, 215],
    ]);
    expect(left.groups).toHaveLength(1);
    expect(titles(right)).toEqual(['D', 'B', 'C']);
    expect(right.findDocument('c')!.manager).toBe(right);
  });

  it('moveGroup and split(null) programmatically', async () => {
    const m = managerWith([['A'], ['B'], ['C']]);
    const [a, b, c] = m.groups;
    expect(m.moveGroup(a, c, 'down')).toBe(true);
    let root = m.saveLayout().root;
    expect(root.kind === 'split' && root.children.map((n) => n.kind)).toEqual(['group', 'split']);
    expect(m.groups).toEqual([b, c, a]);
    expect(m.moveGroup(b, null, 'up')).toBe(true);
    root = m.saveLayout().root;
    expect(root.kind === 'split' && root.orientation).toBe('vertical');
    expect(m.groups[0]).toBe(b);
    const made = m.split(null, 'right', m.findDocument('a')!)!;
    expect(m.groups[m.groups.length - 1]).toBe(made);
    expect(titles(m, m.groups.length - 1)).toEqual(['A']);
    expect(m.moveGroup(made, c, 'center')).toBe(true);
    expect(c.documents.map((d) => d.title)).toEqual(['C', 'A']);
  });
});

describe('TabDocumentManager: moving with keys', () => {
  it('moves the active tab along its strip, to the next group and to a group on any side', async () => {
    const m = managerWith([['A', 'B', 'C'], ['D']], { keyPreset: 'desktop' });
    m.activate(m.findDocument('b')!, true);
    header(m, 'B').focus();
    expect(key('PageUp', { ctrlKey: true, shiftKey: true })).toBe(true);
    expect(titles(m)).toEqual(['B', 'A', 'C']);
    key('PageDown', { ctrlKey: true, shiftKey: true });
    key('PageDown', { ctrlKey: true, shiftKey: true });
    expect(titles(m)).toEqual(['A', 'C', 'B']);
    key('ArrowRight', { ctrlKey: true, altKey: true });
    expect(titles(m, 1)).toEqual(['D', 'B']);
    key('k', { ctrlKey: true });
    key('ArrowDown', { shiftKey: true });
    expect(m.groups).toHaveLength(3);
    expect(titles(m, 2)).toEqual(['B']);
    expect(m.moveToGroup(m.findDocument('b')!, 'up')).toBe(true);
    expect(titles(m, 1)).toEqual(['D', 'B']);
    expect(m.moveInGroup(m.findDocument('b')!, -5)).toBe(true);
    expect(titles(m, 1)).toEqual(['B', 'D']);
  });

  it('Ctrl+K M starts "Move to…" for the tab with focus', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    header(m, 'A').focus();
    key('k', { ctrlKey: true });
    key('m');
    expect(m.dragging?.document?.title).toBe('A');
    expect(m.cancelDrag()).toBe(true);
    expect(m.dragging).toBeNull();
  });

  it('the browser keys move along the strip with Alt + Shift + Page Up / Down', async () => {
    const m = managerWith([['A', 'B']], { keyPreset: 'browser' });
    m.activate(m.findDocument('b')!);
    header(m, 'B').focus();
    expect(key('PageUp', { altKey: true, shiftKey: true })).toBe(true);
    expect(titles(m)).toEqual(['B', 'A']);
  });

  it('"Move to…": the arrows and Tab choose, the areas show, Enter moves, and each place is said', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    const log = record(m);
    header(m, 'A').focus();
    expect(m.showMoveTo(m.findDocument('a')!)).toBe(true);
    await settle();
    expect(live(m)).toBe('Moving A: the arrow keys choose the place, Tab the group, Enter moves it, Escape cancels. Into group 2');
    expect(area(m)!.hidden).toBe(false);
    key('ArrowDown');
    await settle();
    expect(live(m)).toBe('New group below group 2');
    key('ArrowDown');
    await settle();
    expect(live(m)).toBe('New group along the bottom edge');
    key('ArrowUp');
    await settle();
    expect(live(m)).toBe('Into group 2');
    key('Tab');
    await settle();
    expect(live(m)).toBe('Into group 1: cannot go here');
    key('ArrowLeft');
    await settle();
    expect(live(m)).toBe('New group to the left of group 1');
    key('Enter');
    expect(log.filter((l) => l.startsWith('starting') || l.startsWith('dropped') || l.startsWith('ended'))).toEqual(['starting A', 'dropped group A', 'ended true']);
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['A'], ['B'], ['C']]);
    expect(area(m)!.hidden).toBe(true);
  });

  it('"Move to…" from the menus, for a tab and for a group; Escape leaves everything', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    lay(m);
    m.runCommand('moveTo', m.groups[0], m.findDocument('b'));
    expect(m.dragging?.document?.title).toBe('B');
    key('Escape');
    expect(m.dragging).toBeNull();
    await settle();
    expect(live(m)).toBe('Move canceled');
    m.runCommand('moveGroupTo', m.groups[1], null);
    expect(m.dragging?.document).toBeNull();
    // It starts in the middle of the other group; to the left of it instead.
    key('ArrowLeft');
    key('Enter');
    expect(m.groups.map((g) => g.documents.map((d) => d.title))).toEqual([['C'], ['A', 'B']]);
  });
});

describe('TabDocumentManager: drop settings in the layout', () => {
  it('a group that takes no drops, or only some sides, stays so after a save and a load', async () => {
    const m = managerWith([['A'], ['B']]);
    m.groups[1].allowDrop = false;
    m.groups[0].dropSides = ['left', 'right'];
    const saved = m.saveLayout();
    const json = JSON.parse(JSON.stringify(saved));
    expect(json.root.children.map((g: { allowDrop?: boolean; dropSides?: string[] }) => [g.allowDrop, g.dropSides])).toEqual([
      [undefined, ['left', 'right']],
      [false, undefined],
    ]);
    m.loadLayout(json);
    expect([m.groups[0].allowDrop, m.groups[0].dropSides, m.groups[1].allowDrop, m.groups[1].dropSides]).toEqual([true, ['left', 'right'], false, null]);
  });
});

describe('TabDocumentManager: between managers', () => {
  it('a tab goes to another manager of the same dragGroup, its content along, not made again', async () => {
    const left = managerWith([['A', 'B']], { dragGroup: 'files' });
    const right = managerWith([['C']], { dragGroup: 'files' });
    const other = managerWith([['X']]);
    lay(left, new DOMRect(0, 0, 400, 400));
    lay(right, new DOMRect(400, 0, 400, 400));
    lay(other, new DOMRect(0, 400, 800, 400));
    const content = left.contentOf(left.findDocument('a')!);
    const log: string[] = [];
    left.onMoving((e) => log.push(`left moving ${e.document.title}`));
    left.onMoved((e) => log.push(`left moved ${e.to.manager === right}`));
    right.onOpening((e) => log.push(`right opening ${e.document.title}`));
    right.onOpened((e) => log.push(`right opened ${e.document.title}`));
    drag(header(left, 'A'), [
      [100, 15],
      [600, 215],
    ]);
    expect(log).toEqual(['left moving A', 'right opening A', 'right opened A', 'left moved true']);
    expect([titles(left), titles(right)]).toEqual([['B'], ['C', 'A']]);
    const a = right.findDocument('a')!;
    expect([a.manager, right.contentOf(a), left.findDocument('a')]).toEqual([right, content, null]);
    // A manager outside the group takes nothing.
    lay(right, new DOMRect(400, 0, 400, 400));
    drag(header(right, 'A'), [
      [500, 15],
      [400, 600],
    ]);
    expect(titles(right)).toEqual(['C', 'A']);
    // A copy with Ctrl, when the document may be open twice.
    right.allowDuplicate = true;
    lay(left, new DOMRect(0, 0, 400, 400));
    lay(right, new DOMRect(400, 0, 400, 400));
    drag(
      header(right, 'C'),
      [
        [450, 15],
        [200, 215],
      ],
      { ctrlKey: true },
    );
    expect([titles(left), titles(right)]).toEqual([['B', 'C'], ['C', 'A']]);
    expect(left.findDocument('c')!.original).toBe(right.findDocument('c'));
    // The tab follows its new manager now.
    right.closeButton = 'never';
    left.closeButton = 'always';
    await settle();
    expect([header(right, 'C').hasAttribute('data-close'), header(right, 'A').hasAttribute('data-close')]).toEqual([false, false]);
  });
});
