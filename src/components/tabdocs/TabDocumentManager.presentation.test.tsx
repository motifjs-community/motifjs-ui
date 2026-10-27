import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { backButtonHolders } from '../../core/back-button';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabGroup } from './TabGroup';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
  for (let i = 0; i < 4; i++) await tick();
}

async function until(ok: () => boolean) {
  for (let i = 0; i < 50 && !ok(); i++) await new Promise((r) => setTimeout(r, 10));
}

function manager(props: TabDocumentManagerProps = {}) {
  const m = new TabDocumentManager(props);
  hosts.push(mountHost(m));
  return m;
}

/** A content that remembers what was typed in it: the same object must come back after every change. */
class Note extends Component<HTMLDivElement> {
  constructor(readonly title: string) {
    super('div');
    const input = document.createElement('input');
    input.className = 'note';
    input.setAttribute('aria-label', title);
    this.element.append(input);
  }
}

function doc(title: string, extra: ConstructorParameters<typeof TabDocument>[0] = {}) {
  return new TabDocument({ id: title.toLowerCase(), type: 'note', title, content: () => new Note(title), ...extra });
}

/** Groups side by side (`groups[i]` the titles of the i-th), the last one split down when `down` has titles. */
function layout(groups: string[][], props: TabDocumentManagerProps = {}, down: string[] = []) {
  const m = manager(props);
  groups.forEach((titles, i) => {
    const group = i === 0 ? m.groups[0] : m.split(m.groups[i - 1], 'right')!;
    for (const title of titles) m.open(doc(title), { group, index: 99 });
  });
  if (down.length) {
    const g = m.split(m.groups[m.groups.length - 1], 'down')!;
    for (const title of down) m.open(doc(title), { group: g, index: 99 });
  }
  return m;
}

/** A `(pointer: coarse)` media query that answers `on`, and tells its listeners when `set` changes it. */
function touchScreen(on: boolean) {
  const listeners = new Set<() => void>();
  let coarse = on;
  // jsdom has no matchMedia: the test gives the window one, and takes it away after.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) =>
      ({
        get matches() {
          return query.includes('coarse') && coarse;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      }) as unknown as MediaQueryList,
  });
  return {
    set(value: boolean) {
      coarse = value;
      for (const fn of listeners) fn();
    },
  };
}

const titles = (g: TabGroup) => [...g.element.querySelectorAll<HTMLElement>('[role="tab"]')].map((t) => (t.querySelector('.mx-tabdocs__title')!.textContent ?? '') + (t.hasAttribute('data-guest') ? '*' : ''));
const slotOf = (g: TabGroup) => g.element.dataset.slot ?? '';
const bar = (m: TabDocumentManager) => m.element.querySelector<HTMLElement>('.mx-tabdocs__phone-bar')!;
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

function touch(el: Element, type: string, x: number, y: number) {
  const point = { identifier: 5, clientX: x, clientY: y, target: el };
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { touches: type === 'touchend' ? [] : [point], changedTouches: [point] });
  el.dispatchEvent(e);
  return e;
}

describe('TabDocumentManager presentations', () => {
  it('stays a desktop by default and in jsdom, where it has no width', async () => {
    const m = layout([['A'], ['B']]);
    await settle();
    expect(m.presentation).toBe('auto');
    expect(m.currentPresentation).toBe('desktop');
    expect(m.element.hasAttribute('data-presentation')).toBe(false);
    expect([m.tabletWidth, m.phoneWidth, m.tabletWhen, m.narrowBars]).toEqual([1024, 560, 'touch', 'compact']);
  });

  it('is a phone under phoneWidth whatever the pointer, a tablet under tabletWidth only on a touch screen, asking first', async () => {
    let width = 900;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return this.classList.contains('mx-tabdocs') ? new DOMRect(0, 0, width, 600) : new DOMRect();
    });
    const pointer = touchScreen(false);
    const log: string[] = [];
    const m = layout([['A'], ['B']], {
      onPresentationChanging: (e) => {
        log.push(`${e.from}>${e.to}@${e.width}`);
        if (e.to === 'tablet' && log.length === 1) e.cancel = true;
      },
      onPresentationChanged: (e) => void log.push(`now ${e.to}`),
    });
    await settle();
    // A mouse: 900 pixels under tabletWidth stays a desktop.
    m.tabletWidth = 1000;
    expect(m.currentPresentation).toBe('desktop');
    // The screen turns out to be a touch screen: a tablet (the first ask is refused, the next one goes).
    pointer.set(true);
    expect(m.currentPresentation).toBe('desktop');
    m.tabletWidth = 1024;
    expect(m.currentPresentation).toBe('tablet');
    pointer.set(false);
    expect(m.currentPresentation).toBe('desktop');
    // `tabletWhen: 'width'`: the width alone decides.
    m.tabletWhen = 'width';
    expect(m.currentPresentation).toBe('tablet');
    m.tabletWhen = 'touch';
    width = 500;
    m.phoneWidth = 559;
    expect(m.currentPresentation).toBe('phone');
    m.presentation = 'desktop';
    expect(m.currentPresentation).toBe('desktop');
    expect(log).toEqual([
      'desktop>tablet@900',
      'desktop>tablet@900',
      'now tablet',
      'tablet>desktop@900',
      'now desktop',
      'desktop>tablet@900',
      'now tablet',
      'tablet>desktop@900',
      'now desktop',
      'desktop>phone@500',
      'now phone',
      'phone>desktop@500',
      'now desktop',
    ]);
  });

  it('gives the documents\' groups the compact bars on a tablet, or the desktop ones with narrowBars', async () => {
    const m = layout([['A', 'B'], ['C']]);
    m.element.getBoundingClientRect = () => new DOMRect(0, 0, 800, 600);
    await settle();
    const [g1, g2] = m.groups;
    const look = (g: TabGroup) => [g.element.hasAttribute('data-compact'), g.element.hasAttribute('data-scroll-buttons'), g.element.dataset.barSize, g.element.dataset.tabSize, g.element.hasAttribute('data-title')];
    expect(look(g1)).toEqual([false, true, 'normal', 'fit', false]);
    m.presentation = 'tablet';
    await settle();
    expect(look(g1)).toEqual([true, false, 'small', 'shrink', false]);
    // A single document shows as a title.
    expect(look(g2)).toEqual([true, false, 'small', 'shrink', true]);
    // The app's own compact settings follow, and narrowBars turns it off.
    m.compactTabSize = 'fit';
    m.compactBarButtons = ['split'];
    await settle();
    expect(look(g1)[3]).toBe('fit');
    m.narrowBars = 'documents';
    await settle();
    expect(look(g1)).toEqual([false, true, 'normal', 'fit', false]);
    m.narrowBars = 'compact';
    m.presentation = 'desktop';
    await settle();
    expect(look(g1)).toEqual([false, true, 'normal', 'fit', false]);
  });

  it('on a tablet shows two groups side by side and folds the others into the one beside them, the layout unchanged', async () => {
    const m = layout([['A', 'B'], ['C']], {}, ['D', 'E']);
    m.element.getBoundingClientRect = () => new DOMRect(0, 0, 800, 600);
    await settle();
    const saved = JSON.stringify(m.saveLayout());
    const [g1, g2, g3] = m.groups;
    const content = m.contentOf(m.findDocument('d')!);
    m.presentation = 'tablet';
    await settle();
    expect(m.element.dataset.presentation).toBe('tablet');
    expect([slotOf(g1), slotOf(g2), slotOf(g3)]).toEqual(['1', 'none', '2']);
    // The right column shows the group used last (D and E's), with C's tab folded in before them.
    expect(titles(g3)).toEqual(['C*', 'D', 'E']);
    expect(g3.element.querySelector('[data-guest]')!.getAttribute('aria-selected')).toBe('false');
    expect(JSON.stringify(m.saveLayout())).toBe(saved);
    expect(m.groups.length).toBe(3);
    // A tap on the folded tab activates its own group, which now shows with D and E folded in.
    g3.element.querySelector<HTMLElement>('[data-guest]')!.click();
    await settle();
    expect(m.activeDocument?.title).toBe('C');
    expect([slotOf(g2), slotOf(g3)]).toEqual(['2', 'none']);
    expect(titles(g2)).toEqual(['C', 'D*', 'E*']);
    // The arrow keys go along the strip as it shows.
    g2.element.querySelector<HTMLElement>('[role="tab"]')!.focus();
    key(document.activeElement!, 'ArrowRight');
    await settle();
    expect(m.activeDocument?.title).toBe('D');
    // Back to a desktop: every header in its own strip, the content the same object, the layout as it was then.
    const now = JSON.stringify(m.saveLayout());
    m.presentation = 'desktop';
    await settle();
    expect([titles(g1), titles(g2), titles(g3)]).toEqual([['A', 'B'], ['C'], ['D', 'E']]);
    expect(m.element.querySelector('[data-guest]')).toBe(null);
    expect(m.contentOf(m.findDocument('d')!)).toBe(content);
    expect(JSON.stringify(m.saveLayout())).toBe(now);
  });

  it('on a tablet puts the side dock areas in drawers and the bottom one in a sheet, their titles along the edges', async () => {
    const m = layout([['A']]);
    m.dock(doc('Explorer', { closable: false }), 'left');
    m.dock(doc('Problems', { closable: false }), 'bottom');
    await settle();
    const left = m.dockArea('left')!;
    const bottom = m.dockArea('bottom')!;
    m.presentation = 'tablet';
    await settle();
    expect(left.element.closest('.mx-drawer')).not.toBe(null);
    expect(bottom.element.closest('.mx-bottom-sheet')).not.toBe(null);
    expect(left.strip!.element.hidden).toBe(false);
    expect(left.sash.element.hidden).toBe(true);
    // A title opens its drawer with that tool; again, it closes it.
    left.strip!.element.querySelector<HTMLElement>('.mx-tabdocs__autohide-tab')!.click();
    await settle();
    expect(left.element.closest('.mx-drawer')!.hasAttribute('data-open')).toBe(true);
    expect(left.isOpen).toBe(true);
    left.strip!.element.querySelector<HTMLElement>('.mx-tabdocs__autohide-tab')!.click();
    await settle();
    expect(left.element.closest('.mx-drawer')!.hasAttribute('data-open')).toBe(false);
    // An area's own setting wins: hidden on a tablet.
    left.tabletDockMode = 'hidden';
    await settle();
    expect(left.element.closest('.mx-drawer')).toBe(null);
    expect(left.strip!.element.hidden).toBe(true);
    left.tabletDockMode = 'sheet';
    await settle();
    expect(left.element.closest('.mx-bottom-sheet')).not.toBe(null);
    m.presentation = 'desktop';
    await settle();
    expect(left.element.parentElement).toBe(m.element);
    expect(bottom.element.parentElement).toBe(m.element);
    expect(left.sash.element.hidden).toBe(false);
    expect(m.element.querySelector('.mx-drawer, .mx-bottom-sheet')).toBe(null);
  });

  it('on a phone shows one document under a bar with its title, its close button and the count', async () => {
    const m = layout([['A', 'B'], ['C']], { presentation: 'phone' });
    await settle();
    const [g1, g2] = m.groups;
    expect(m.currentPresentation).toBe('phone');
    expect(slotOf(g2)).toBe('solo');
    expect(slotOf(g1)).toBe('none');
    const title = bar(m).querySelector<HTMLButtonElement>('.mx-tabdocs__phone-title')!;
    expect(title.textContent).toBe('C');
    expect(title.getAttribute('aria-label')).toBe('C, its commands');
    const count = bar(m).querySelector<HTMLElement>('.mx-tabdocs__phone-count')!;
    expect(count.textContent).toBe('3');
    expect(count.getAttribute('aria-label')).toBe('Open documents: 3');
    // The arrow keys on the title go to the document beside (round at the ends), swipes too.
    key(title, 'ArrowRight');
    await settle();
    expect(m.activeDocument?.title).toBe('A');
    expect(slotOf(g1)).toBe('solo');
    touch(title, 'touchstart', 200, 20);
    expect(touch(title, 'touchmove', 150, 22).defaultPrevented).toBe(true);
    touch(title, 'touchmove', 100, 22);
    touch(title, 'touchend', 100, 22);
    await settle();
    expect(m.activeDocument?.title).toBe('B');
    touch(title, 'touchstart', 100, 20);
    touch(title, 'touchmove', 170, 22);
    touch(title, 'touchend', 170, 22);
    await settle();
    expect(m.activeDocument?.title).toBe('A');
    // Its close button closes the document shown.
    bar(m).querySelector<HTMLElement>('.mx-tabdocs__phone-close button, button.mx-tabdocs__phone-close')!.click();
    await until(() => !m.findDocument('a'));
    expect(m.findDocument('a')).toBe(null);
    expect(title.textContent).toBe('B');
    expect(count.textContent).toBe('2');
    uiLocale.strings = trStrings;
    m.activate(m.findDocument('c')!);
    await settle();
    expect(count.getAttribute('aria-label')).toBe('Açık belgeler: 2');
  });

  it('opens the list of documents from the count: sections, tap, Delete, moving with Alt and the arrows', async () => {
    const m = layout([['A', 'B'], ['C']], { presentation: 'phone' });
    await settle();
    bar(m).querySelector<HTMLElement>('.mx-tabdocs__phone-count button, button.mx-tabdocs__phone-count')!.click();
    await settle();
    expect(m.documentListOpen).toBe(true);
    const sheet = m.element.querySelector<HTMLElement>('.mx-tabdocs__phone-list')!;
    expect(sheet.hasAttribute('data-open')).toBe(true);
    const heads = [...sheet.querySelectorAll('.mx-tabdocs__list-head')].map((h) => h.textContent);
    expect(heads).toEqual(['Group 1', 'Group 2']);
    const rows = () => [...sheet.querySelectorAll('.mx-tabdocs__list-section')].map((s) => [...s.querySelectorAll('.mx-tabdocs__list-title')].map((t) => t.textContent));
    expect(rows()).toEqual([['A', 'B'], ['C']]);
    expect(sheet.querySelector('[aria-current="true"] .mx-tabdocs__list-title')!.textContent).toBe('C');
    // Alt+Up moves A? No: B up, then past the start of group 2 C goes into group 1.
    const open = (t: string) => [...sheet.querySelectorAll<HTMLElement>('.mx-tabdocs__list-open')].find((b) => b.textContent?.startsWith(t))!;
    key(open('B'), 'ArrowUp', { altKey: true });
    await settle();
    expect(rows()).toEqual([['B', 'A'], ['C']]);
    key(open('C'), 'ArrowUp', { altKey: true });
    await settle();
    expect(m.groups.length).toBe(1);
    expect(rows()).toEqual([['B', 'A', 'C']]);
    // Delete closes the focused one.
    open('A').focus();
    key(open('A'), 'Delete');
    await until(() => !m.findDocument('a'));
    expect(rows()).toEqual([['B', 'C']]);
    // A tap shows the document and closes the list.
    open('B').click();
    await settle();
    expect(m.activeDocument?.title).toBe('B');
    expect(m.documentListOpen).toBe(false);
  });

  it('searches the list, and swipes a row sideways to close it', async () => {
    const m = layout([['Orders', 'Invoices', 'Customers']], { presentation: 'phone' });
    await settle();
    expect(m.showDocumentList()).toBe(true);
    await settle();
    const sheet = m.element.querySelector<HTMLElement>('.mx-tabdocs__phone-list')!;
    const input = sheet.querySelector<HTMLInputElement>('.mx-tabdocs__list-search input')!;
    input.value = 'in';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    const shown = () => [...sheet.querySelectorAll<HTMLElement>('.mx-tabdocs__list-row')].filter((r) => !r.hidden).map((r) => r.querySelector('.mx-tabdocs__list-title')!.textContent);
    expect(shown()).toEqual(['Invoices']);
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    const row = [...sheet.querySelectorAll<HTMLElement>('.mx-tabdocs__list-row')].find((r) => r.textContent?.includes('Orders'))!;
    row.getBoundingClientRect = () => new DOMRect(0, 0, 300, 48);
    const target = row.querySelector('.mx-tabdocs__list-open')!;
    touch(target, 'touchstart', 200, 20);
    expect(touch(target, 'touchmove', 160, 21).defaultPrevented).toBe(true);
    touch(target, 'touchmove', 60, 21);
    touch(target, 'touchend', 60, 21);
    await until(() => !m.findDocument('orders'));
    expect(m.findDocument('orders')).toBe(null);
    expect(shown()).toEqual(['Invoices', 'Customers']);
  });

  it('puts the tools of the dock areas in a bar at the bottom, each opening its area in a sheet', async () => {
    const m = layout([['A']], { presentation: 'phone' });
    m.dock(doc('Problems', { closable: false }), 'bottom');
    m.dock(doc('Output', { closable: false }), 'bottom');
    m.dock(doc('Outline', { closable: false }), 'right');
    await settle();
    const tools = m.element.querySelector<HTMLElement>('.mx-tabdocs__phone-tools')!;
    const buttons = () => [...tools.querySelectorAll<HTMLButtonElement>('.mx-tabdocs__phone-tool')];
    expect(buttons().map((b) => b.textContent)).toEqual(['PProblems', 'OOutput', 'OOutline']);
    buttons()[1].click();
    await settle();
    const bottom = m.dockArea('bottom')!;
    const sheet = bottom.element.closest('.mx-bottom-sheet')!;
    expect(sheet.hasAttribute('data-open')).toBe(true);
    expect(bottom.groups[0].activeDocument?.title).toBe('Output');
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
    buttons()[1].click();
    await settle();
    expect(sheet.hasAttribute('data-open')).toBe(false);
    // An area that asks for a drawer gets one; a hidden one has no button.
    m.dockArea('right')!.phoneDockMode = 'drawer';
    await settle();
    expect(m.dockArea('right')!.element.closest('.mx-drawer')).not.toBe(null);
    m.phoneDockMode = 'hidden';
    await settle();
    expect(buttons().map((b) => b.textContent)).toEqual(['OOutline']);
  });

  it('shows a floating window as a full-screen sheet on a phone; new browser windows are off', async () => {
    const m = layout([['A', 'B']], { presentation: 'phone', openWindow: () => null });
    await settle();
    const w = m.float(m.findDocument('b')!)!;
    await settle();
    const sheet = w.body.closest('.mx-bottom-sheet')!;
    expect(sheet).not.toBe(null);
    expect(sheet.classList.contains('mx-tabdocs__window-sheet')).toBe(true);
    m.activate(m.findDocument('b')!);
    await settle();
    expect(sheet.hasAttribute('data-open')).toBe(true);
    expect(m.moveToNewWindow(m.findDocument('a')!)).toBe(null);
    expect(m.mayDrag(m.findDocument('a')!)).toBe(false);
    m.presentation = 'desktop';
    await settle();
    expect(w.body.parentElement).toBe(w.element);
    expect(m.floatingWindows).toEqual([w]);
  });

  it("goes back on the browser's back: a sheet first, then through the documents", async () => {
    const m = layout([['A', 'B', 'C']], { presentation: 'phone' });
    m.dock(doc('Problems', { closable: false }), 'bottom');
    await settle();
    m.activate(m.findDocument('a')!);
    m.activate(m.findDocument('b')!);
    await settle();
    expect(m.canGoBack).toBe(true);
    expect(backButtonHolders(window)).toBe(1);
    m.showTool(m.dockArea('bottom')!.documents[0]);
    await settle();
    const sheet = m.dockArea('bottom')!.element.closest('.mx-bottom-sheet')!;
    expect(sheet.hasAttribute('data-open')).toBe(true);
    const before = m.activeDocument;
    history.back();
    await until(() => !sheet.hasAttribute('data-open'));
    expect(sheet.hasAttribute('data-open')).toBe(false);
    expect(m.activeDocument).toBe(before);
    history.back();
    await until(() => m.activeDocument?.title !== before?.title);
    expect(m.activeDocument?.title).not.toBe(before?.title);
    m.backButton = false;
    await settle();
    await until(() => backButtonHolders(window) === 0);
    expect(backButtonHolders(window)).toBe(0);
  });

  it('opens the tab menu as an action sheet on a phone, from the title', async () => {
    const m = layout([['A', 'B']], { presentation: 'phone' });
    await settle();
    bar(m).querySelector<HTMLElement>('.mx-tabdocs__phone-title')!.click();
    await settle();
    const sheet = m.element.querySelector<HTMLElement>('.mx-tabdocs__menu-sheet')!;
    expect(sheet.hasAttribute('data-open')).toBe(true);
    const items = [...sheet.querySelectorAll('.mx-menu__item .mx-menu__label')].map((l) => l.textContent);
    expect(items).toContain('Close');
    expect(items).toContain('Pin');
    expect(items).not.toContain('Move into new window');
    [...sheet.querySelectorAll<HTMLElement>('.mx-menu__item')].find((i) => i.textContent?.startsWith('Pin'))!.click();
    await settle();
    expect(m.findDocument('b')!.pinned).toBe(true);
  });

  it('goes away cleanly in a tablet or a phone presentation, with its sheets, drawers and list', async () => {
    const errors = vi.spyOn(console, 'error');
    for (const presentation of ['tablet', 'phone'] as const) {
      const m = layout([['A']], { presentation });
      m.dock(doc('Tool', { closable: false }), 'left');
      m.float(m.open(doc('B'))!);
      m.showDocumentList();
      await settle();
      await hosts.pop()!.dispose();
      expect(document.querySelector('.mx-bottom-sheet, .mx-drawer')).toBe(null);
    }
    expect(errors).not.toHaveBeenCalled();
    expect(backButtonHolders(window)).toBe(0);
  });

  it('keeps every content, typed text and the active document across every change of presentation', async () => {
    const m = layout([['A', 'B'], ['C']]);
    m.dock(doc('Tool', { closable: false }), 'left');
    await settle();
    const inputs = () => [...m.element.querySelectorAll<HTMLInputElement>('input.note')];
    for (const input of inputs()) input.value = `typed in ${input.getAttribute('aria-label')}`;
    const contents = m.documents.map((d) => m.contentOf(d));
    for (const kind of ['tablet', 'phone', 'desktop', 'phone', 'tablet', 'desktop'] as const) {
      m.presentation = kind;
      await settle();
      expect(m.currentPresentation).toBe(kind);
      expect(m.documents.map((d) => m.contentOf(d))).toEqual(contents);
      expect(inputs().map((i) => i.value)).toEqual(inputs().map((i) => `typed in ${i.getAttribute('aria-label')}`));
    }
  });
});
