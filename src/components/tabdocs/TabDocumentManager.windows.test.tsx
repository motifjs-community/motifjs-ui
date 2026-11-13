import { Application, Component, type ComponentBase } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { pageDocuments } from '../../core/page-documents';
import { uiLocale } from '../../core/ui-locale';
import { TabBrowserWindow } from './TabBrowserWindow';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabGroup } from './TabGroup';
import type { TabLayout } from './tab-layout';
import type { TabWindowRequest } from './tab-window-request';

// A same-origin <iframe> stands in for the window `window.open` would give: a document of its own,
// with classes of its own (an element made there is no `instanceof Element` of the page).

let hosts: Component[] = [];
let frames: HTMLIFrameElement[] = [];
const rects = new Map<Element, DOMRect>();

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return rects.get(this) ?? new DOMRect();
  });
});

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  window.dispatchEvent(new MouseEvent('pointerdown'));
  for (const f of frames.splice(0)) f.remove();
  document.body.innerHTML = '';
  rects.clear();
  await uiLocale.use('en');
  vi.restoreAllMocks();
});

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

/** Another window, with its own classes (`view.KeyboardEvent`…). */
type View = Window & typeof globalThis;

function frame(): View {
  const f = document.createElement('iframe');
  document.body.append(f);
  frames.push(f);
  return f.contentWindow as View;
}

/** A manager whose new windows are frames; `opened` lists what it asked for. */
function manager(props: TabDocumentManagerProps = {}) {
  const requests: TabWindowRequest[] = [];
  const views: View[] = [];
  const m = new TabDocumentManager({
    openWindow: (r) => {
      requests.push(r);
      const view = frame();
      views.push(view);
      return view;
    },
    ...props,
  });
  hosts.push(mountHost(m));
  return Object.assign(m, { requests, views });
}

function text(value: string): Component<HTMLDivElement> {
  const c = new Component<HTMLDivElement>('div');
  c.element.textContent = value;
  return c;
}

function doc(title: string, extra: ConstructorParameters<typeof TabDocument>[0] = {}) {
  return new TabDocument({ id: title.toLowerCase(), type: 'text', title, content: () => text(title), ...extra });
}

function managerWith(groups: string[][], props: TabDocumentManagerProps = {}) {
  const m = manager(props);
  groups.forEach((titles, i) => {
    const group = i === 0 ? m.groups[0] : m.split(m.groups[i - 1], 'right')!;
    for (const title of titles) m.open(doc(title), { group, index: 99 });
  });
  return m;
}

/** What the user's closing a window looks like to the page. */
function closeByUser(view: View) {
  view.dispatchEvent(new view.Event('pagehide'));
}

/** Every window event, in order. */
function record(m: TabDocumentManager) {
  const log: string[] = [];
  m.onWindowOpening((e) => log.push(`opening ${e.document?.title ?? (e.window ? 'window' : 'group')}`));
  m.onWindowOpened((e) => log.push(`opened ${e.document?.title ?? 'group'}`));
  m.onWindowClosing((e) => log.push(`closing ${e.kind} ${e.then}`));
  m.onWindowClosed((e) => log.push(`closed ${e.kind} ${e.reason}`));
  m.onError((e) => log.push(`error ${e.error} ${e.fallback}`));
  return log;
}

const titles = (g: TabGroup) => g.documents.map((d) => d.title);
const live = (m: TabDocumentManager) => m.element.querySelector('.mx-tabdocs__live')!.textContent;

describe('TabDocumentManager: new browser windows', () => {
  it('moveToNewWindow(doc) opens a window and moves the document into it: the same content, in that document', async () => {
    const m = managerWith([['A', 'B']]);
    const log = record(m);
    const a = m.findDocument('a')!;
    const content = m.contentOf(a)!;
    const w = m.moveToNewWindow(a)!;
    await settle();
    expect(w).toBeInstanceOf(TabBrowserWindow);
    expect(m.browserWindows).toEqual([w]);
    expect(a.browserWindow).toBe(w);
    expect(m.contentOf(a)).toBe(content);
    expect(content.element.ownerDocument).toBe(m.views[0].document);
    expect(w.part.element.ownerDocument).toBe(m.views[0].document);
    expect(w.groups.map(titles)).toEqual([['A']]);
    expect(titles(m.groups[0])).toEqual(['B']);
    expect(log).toEqual(['opening A', 'opened A']);
    // The page's documents now include the window's: the kit listens there too.
    expect(pageDocuments()).toContain(m.views[0].document);
    expect(m.views[0].document.title).toBe('A');
    a.title = 'Renamed';
    await settle();
    expect(m.views[0].document.title).toBe('Renamed');
    expect(live(m)).toBe('A moved into a new window');
  });

  it('takes the token values the app gave the manager into the new window', async () => {
    const m = managerWith([['A', 'B']]);
    m.element.style.setProperty('--mx-tabdocs-tabs-height', '44px');
    const w = m.moveToNewWindow(m.findDocument('a')!)!;
    await vi.dynamicImportSettled();
    await settle();
    measureNow(m);
    measureNow(w.part);
    expect(w.part.element.style.getPropertyValue('--mx-tabdocs-tabs-height')).toBe('44px');
  });

  it('asks for a popup at the size of the group, beside it, with newWindowUrl', () => {
    const m = managerWith([['A', 'B']], { newWindowUrl: 'about:blank' });
    rects.set(m.groups[0].element, new DOMRect(10, 20, 500, 300));
    m.moveToNewWindow(m.findDocument('a')!);
    const r = m.requests[0];
    expect(r.url).toBe('about:blank');
    expect(r.rect.width).toBe(500);
    expect(r.rect.height).toBe(300);
    expect(r.features).toMatch(/^popup,width=500,height=300,left=-?\d+,top=-?\d+$/);
    m.newWindowSize = { width: 640, height: 480 };
    m.moveToNewWindow(m.findDocument('b')!);
    expect(m.requests[1].rect).toMatchObject({ width: 640, height: 480 });
  });

  it('a whole group, and a floating window with all it holds, move into a new window', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    const log = record(m);
    const right = m.groups[1];
    const w = m.moveToNewWindow(right)!;
    expect(w.groups).toEqual([right]);
    expect(right.element.ownerDocument).toBe(m.views[0].document);
    expect(m.groups.filter((g) => !g.browserWindow).map(titles)).toEqual([['A', 'B']]);
    const floating = m.float(m.findDocument('b')!)!;
    const second = m.moveToNewWindow(floating)!;
    await settle();
    expect(m.floatingWindows).toEqual([]);
    expect(second.documents.map((d) => d.title)).toEqual(['B']);
    expect(log).toEqual(['opening group', 'opened group', 'opening window', 'closed floating moved', 'opened group']);
  });

  it('moveToMainWindow brings a document back into the group it came from; the empty window closes', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const log = record(m);
    const a = m.findDocument('a')!;
    const content = m.contentOf(a)!;
    m.moveToNewWindow(a);
    m.moveToNewWindow(m.findDocument('b')!);
    expect(m.browserWindows.length).toBe(2);
    expect(m.moveToMainWindow(a)).toBe(true);
    await settle();
    expect(titles(m.groups[0])).toEqual(['C', 'A']);
    expect(m.contentOf(a)).toBe(content);
    expect(content.element.ownerDocument).toBe(document);
    expect(m.browserWindows.length).toBe(1);
    expect(log.slice(-1)).toEqual(['closed browser docked']);
    expect(live(m)).toBe('A moved back to the main window');
    // A whole window, by its own method.
    expect(m.browserWindows[0].moveToMainWindow()).toBe(true);
    expect(m.browserWindows).toEqual([]);
    expect(titles(m.groups[0])).toEqual(['C', 'A', 'B']);
    expect(pageDocuments()).toEqual([document]);
  });

  it('the user closing the window brings its documents back, or closes them as newWindowCloseAction says', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const log = record(m);
    m.moveToNewWindow(m.findDocument('a')!);
    closeByUser(m.views[0]);
    await settle();
    expect(titles(m.groups[0])).toEqual(['B', 'C', 'A']);
    expect(log.slice(-2)).toEqual(['closing browser back', 'closed browser closed']);
    m.newWindowCloseAction = 'close';
    m.moveToNewWindow(m.findDocument('a')!);
    closeByUser(m.views[1]);
    await settle();
    expect(m.findDocument('a')).toBeNull();
    expect(titles(m.groups[0])).toEqual(['B', 'C']);
    // onWindowClosing chooses per window.
    m.onWindowClosing((e) => (e.then = 'back'));
    m.moveToNewWindow(m.findDocument('b')!);
    closeByUser(m.views[2]);
    await settle();
    expect(titles(m.groups[0])).toEqual(['C', 'B']);
  });

  it('a document with unsaved changes is asked about back in the main window, and stays when the answer is no', async () => {
    const m = managerWith([['A', 'B']], { newWindowCloseAction: 'close' });
    const a = m.findDocument('a')!;
    a.dirty = true;
    let answer!: (ok: boolean) => void;
    m.onClosing((e) => {
      if (e.document.dirty) e.promise = new Promise((resolve) => (answer = resolve));
    });
    m.moveToNewWindow(a);
    closeByUser(m.views[0]);
    // While it is asked, it is back in the main window.
    expect(a.browserWindow).toBeNull();
    expect(titles(m.groups[0])).toEqual(['B', 'A']);
    answer(false);
    await settle();
    expect(m.findDocument('a')).toBe(a);
  });

  it('closeWindow(newWindow) by code: back, close, and canceled', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const log = record(m);
    let w = m.moveToNewWindow(m.findDocument('a')!)!;
    m.onWindowClosing((e) => (e.cancel = e.window === w && log.length < 4));
    expect(await m.closeWindow(w)).toBe(false);
    expect(m.browserWindows).toEqual([w]);
    expect(await m.closeWindow(w)).toBe(true);
    expect(titles(m.groups[0])).toEqual(['B', 'C', 'A']);
    m.newWindowCloseAction = 'close';
    w = m.moveToNewWindow(m.findDocument('b')!)!;
    expect(await w.close()).toBe(true);
    expect(m.findDocument('b')).toBeNull();
    expect(m.browserWindows).toEqual([]);
    expect(log.filter((l) => l.startsWith('closed'))).toEqual(['closed browser closed', 'closed browser closed']);
  });

  it('a blocked window: onError, then a floating window instead (newWindowFallback), or nothing', async () => {
    const m = managerWith([['A', 'B']], { openWindow: () => null });
    const log = record(m);
    const a = m.findDocument('a')!;
    expect(m.moveToNewWindow(a)).toBeNull();
    expect(a.window).not.toBeNull();
    expect(log).toEqual(['opening A', 'error windowBlocked float']);
    await settle();
    expect(live(m)).toBe('A floats in a window');
    m.newWindowFallback = 'none';
    const b = m.findDocument('b')!;
    m.moveToNewWindow(b);
    expect(b.window).toBeNull();
    expect(b.group).toBe(m.groups[0]);
    // onError may choose again.
    m.onError((e) => (e.fallback = 'float'));
    m.open(doc('C'), { group: m.groups[0] });
    const c = m.findDocument('c')!;
    m.moveToNewWindow(c);
    expect(c.window).not.toBeNull();
  });

  it('allowNewWindow, on the manager and per document (the document wins), and onWindowOpening cancels', () => {
    const m = managerWith([['A', 'B', 'C']], { allowNewWindow: false });
    const log = record(m);
    expect(m.moveToNewWindow(m.findDocument('a')!)).toBeNull();
    expect(log).toEqual([]);
    m.findDocument('b')!.allowNewWindow = true;
    expect(m.moveToNewWindow(m.findDocument('b')!)).not.toBeNull();
    m.allowNewWindow = true;
    m.findDocument('c')!.allowNewWindow = false;
    expect(m.moveToNewWindow(m.findDocument('c')!)).toBeNull();
    expect(m.moveToNewWindow(m.groups[0])).toBeNull();
    m.onWindowOpening((e) => (e.cancel = e.document?.title === 'A'));
    expect(m.moveToNewWindow(m.findDocument('a')!)).toBeNull();
    expect(m.requests.length).toBe(1);
    // Alone in a new window, it is in one already.
    expect(m.moveToNewWindow(m.findDocument('b')!)).toBeNull();
  });

  it('onLayoutChanging may keep documents in a new window; a closed window brings them back anyway', () => {
    const m = managerWith([['A', 'B']]);
    m.onLayoutChanging((e) => (e.cancel = e.change === 'mainWindow'));
    m.onMoving((e) => (e.cancel = e.document.title === 'A' && !e.to.browserWindow));
    const a = m.findDocument('a')!;
    m.moveToNewWindow(a);
    expect(m.moveToMainWindow(a)).toBe(false);
    expect(a.browserWindow).not.toBeNull();
    closeByUser(m.views[0]);
    expect(a.browserWindow).toBeNull();
    expect(m.browserWindows).toEqual([]);
  });

  it('documents move between windows with move, split and dock; the menus and the keys have the commands', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const w = m.moveToNewWindow(m.findDocument('a')!)!;
    const inWindow = w.groups[0];
    // move: from the main window into the new one.
    expect(m.move(m.findDocument('b')!, inWindow)).toBe(true);
    expect(titles(inWindow)).toEqual(['A', 'B']);
    // split inside the new window.
    const made = m.split(inWindow, 'down', m.findDocument('b')!)!;
    expect(made.browserWindow).toBe(w);
    expect(w.groups.length).toBe(2);
    // dock from the new window to a dock area of the main one.
    expect(m.dock(m.findDocument('b')!, 'left')).toBe(true);
    expect(m.findDocument('b')!.dockArea?.side).toBe('left');
    await settle();
    // The keys: Ctrl+K Shift+D on the tab in the new window, sent by that window.
    const view = m.views[0];
    const header = w.part.element.querySelector<HTMLElement>('[role="tab"]')!;
    header.focus();
    expect(view.document.activeElement).toBe(header);
    const press = (key: string, init: KeyboardEventInit = {}) => header.dispatchEvent(new view.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
    press('k', { ctrlKey: true });
    press('D', { shiftKey: true });
    expect(m.findDocument('a')!.browserWindow).toBeNull();
    expect(m.browserWindows).toEqual([]);
    // And Ctrl+K Shift+O on a tab of the main window.
    const main = m.element.querySelector<HTMLElement>('[role="tab"]')!;
    main.focus();
    main.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
    main.dispatchEvent(new KeyboardEvent('keydown', { key: 'O', shiftKey: true, bubbles: true, cancelable: true }));
    expect(m.browserWindows.length).toBe(1);
  });

  it('the tab menu of a document in a new window opens in that window, with "Move back to main window"', async () => {
    const m = managerWith([['A', 'B']]);
    const w = m.moveToNewWindow(m.findDocument('a')!)!;
    await settle();
    const view = m.views[0];
    const header = w.part.element.querySelector<HTMLElement>('[role="tab"]')!;
    header.dispatchEvent(new view.MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 20, clientY: 20 }));
    const popup = Array.from(view.document.querySelectorAll<HTMLElement>('.mx-popup')).find((p) => !p.hidden)!;
    expect(popup).toBeTruthy();
    const names = Array.from(popup.querySelectorAll('.mx-menu__label')).map((l) => l.textContent);
    expect(names.slice(-2)).toEqual(['Move into new window', 'Move back to main window']);
    const back = Array.from(popup.querySelectorAll<HTMLButtonElement>('.mx-menu__item')).find((i) => i.textContent?.startsWith('Move back'))!;
    back.click();
    expect(m.findDocument('a')!.browserWindow).toBeNull();
  });

  it('content made right into a new window still runs its onMounted', async () => {
    const m = managerWith([['A']], { contentLifetime: 'lazy' });
    let mounted = 0;
    class Probe extends Component<HTMLDivElement> {
      override onMounted() {
        mounted++;
      }
    }
    const w = m.moveToNewWindow(m.groups[0])!;
    const probe = new Probe('div');
    m.open(new TabDocument({ title: 'Probe', content: () => probe }), { group: w.groups[0] });
    await settle();
    // The new window mounts in a later task: waited for, at most a second, however busy the machine is.
    for (let i = 0; i < 100 && mounted === 0; i++) await new Promise((resolve) => setTimeout(resolve, 10));
    expect(probe.element.ownerDocument).toBe(m.views[0].document);
    expect(mounted).toBe(1);
  });

  it('saveLayout writes the new windows (version 3); loadLayout makes them floating windows, groups of the main window, or windows again', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const w = m.moveToNewWindow(m.findDocument('b')!)!;
    void w;
    const saved = m.saveLayout();
    expect(saved.version).toBe(3);
    expect(saved.browserWindows?.length).toBe(1);
    expect(saved.browserWindows![0].home).toBe(0);
    expect(saved.browserWindows![0].root).toMatchObject({ kind: 'group', documents: [{ id: 'b' }] });
    const json = JSON.parse(JSON.stringify(saved)) as TabLayout;
    // Floating, by default: the window it was closes with the old layout.
    expect(m.loadLayout(json)).toBe(true);
    await settle();
    expect(m.browserWindows).toEqual([]);
    expect(m.floatingWindows.length).toBe(1);
    expect(m.floatingWindows[0].documents.map((d) => d.title)).toEqual(['B']);
    // Among the main window's documents.
    m.restoreWindows = 'main';
    m.loadLayout(json);
    expect(m.floatingWindows.length).toBe(0);
    expect(m.groups.map(titles)).toEqual([['A', 'C'], ['B']]);
    // Windows again: opened now (a click), or kept floating until reopenWindows().
    m.restoreWindows = 'reopen';
    m.openWindow = () => null;
    m.loadLayout(json);
    expect(m.floatingWindows.length).toBe(1);
    expect(m.reopenWindows()).toBe(0);
    m.openWindow = () => frame();
    expect(m.reopenWindows()).toBe(1);
    expect(m.browserWindows.length).toBe(1);
    expect(m.floatingWindows.length).toBe(0);
    expect(m.reopenWindows()).toBe(0);
  });

  it('still loads layouts of versions 1 and 2', () => {
    const m = managerWith([['A']]);
    const v1: TabLayout = { version: 1, root: { kind: 'group', documents: [{ id: 'x', type: 'text', title: 'X' }], active: 0, recent: [0] }, activeGroup: 0, maximizedGroup: null };
    expect(m.loadLayout(v1)).toBe(true);
    expect(m.groups.map(titles)).toEqual([['X']]);
    const v2: TabLayout = { ...v1, version: 2, windows: [{ rect: { x: 10, y: 10, width: 300, height: 200 }, root: { kind: 'group', documents: [{ id: 'y', type: 'text', title: 'Y' }], active: 0, recent: [0] } }] };
    expect(m.loadLayout(v2)).toBe(true);
    expect(m.floatingWindows.length).toBe(1);
    expect(m.browserWindows).toEqual([]);
  });

  it('"Move to…" goes through the groups of every window; Enter moves the document there', async () => {
    const m = managerWith([['A', 'B'], ['C']]);
    const w = m.moveToNewWindow(m.findDocument('c')!)!;
    const header = Array.from(m.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.textContent!.startsWith('A'))!;
    header.focus();
    expect(m.showMoveTo(m.findDocument('a')!)).toBe(true);
    await settle();
    const say = () => live(m);
    const press = (key: string, init: KeyboardEventInit = {}) => window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
    // The next group is the new window's.
    expect(say()).toBe('Moving A: the arrow keys choose the place, Tab the group, Enter moves it, Escape cancels. Into group 2, in window 1');
    press('Enter');
    await settle();
    expect(titles(w.groups[0])).toEqual(['C', 'A']);
  });

  it('gives a new window to the app: its router links go to the page router, and the app says when it closes', async () => {
    class Page extends Component<HTMLDivElement> {
      static override elementTag = 'div';
    }
    const host = document.body.appendChild(document.createElement('div'));
    history.replaceState(null, '', '/');
    const app = Application.CreateBuilder().build();
    app.useRouter({ routes: [{ path: '/', component: Page }, { path: '/orders', component: Page }] as never, mode: 'history' });
    app.run(host);
    const attach = vi.spyOn(app.windows, 'attach');
    try {
      const m = managerWith([['A', 'B']]);
      const w = m.moveToNewWindow(m.findDocument('a')!)!;
      const view = m.views[0];
      expect(attach).toHaveBeenCalledWith(view, expect.objectContaining({ styles: 'live' }));
      const link = view.document.createElement('a');
      link.href = '/orders';
      link.rel = 'router';
      w.part.element.append(link);
      const click = new view.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      link.dispatchEvent(click);
      await settle();
      expect({ path: location.pathname, prevented: click.defaultPrevented }).toEqual({ path: '/orders', prevented: true });
      // The user closes the window: the app's onClosing brings its documents back.
      view.dispatchEvent(new view.Event('pagehide'));
      await settle();
      expect(m.browserWindows).toHaveLength(0);
      expect(titles(m.groups[0])).toEqual(['B', 'A']);
    } finally {
      await app.dispose();
      host.remove();
      history.replaceState(null, '', '/');
    }
  });

  it('says it in Turkish too', async () => {
    await uiLocale.use('tr');
    const m = managerWith([['A', 'B']]);
    m.moveToNewWindow(m.findDocument('a')!);
    await settle();
    expect(live(m)).toBe('A yeni pencereye taşındı');
    m.moveToMainWindow(m.findDocument('a')!);
    await settle();
    expect(live(m)).toBe('A ana pencereye geri taşındı');
  });

  it('the main page going away closes the new windows', () => {
    const m = managerWith([['A', 'B']]);
    const w = m.moveToNewWindow(m.findDocument('a')!)!;
    const close = vi.spyOn(m.views[0], 'close').mockImplementation(() => {});
    window.dispatchEvent(new Event('pagehide'));
    expect(close).toHaveBeenCalled();
    expect(m.browserWindows).toEqual([]);
    expect(w.isOpen).toBe(false);
  });
});

describe('TabDocumentManager: dragging in and out of new windows', () => {
  /** A part in each window of the drag: a frame of each lands between pointer events, as in a browser. */
  let inWindows: ComponentBase[] = [];

  function pointer(type: string, target: EventTarget, x: number, y: number, view: View = window) {
    const e = new view.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0 });
    Object.defineProperty(e, 'pointerId', { value: 1 });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    target.dispatchEvent(e);
    for (const part of inWindows) measureNow(part);
  }

  function layGroup(g: TabGroup, b: DOMRect) {
    rects.set(g.element, b);
    rects.set(g.element.querySelector('.mx-tabdocs__bar')!, new DOMRect(b.x, b.y, b.width, 30));
    rects.set(g.element.querySelector('.mx-tabdocs__row')!, new DOMRect(b.x, b.y, b.width - 60, 30));
    rects.set(g.element.querySelector('.mx-tabdocs__panels')!, new DOMRect(b.x, b.y + 30, b.width, b.height - 30));
    g.element.querySelectorAll('[role="tab"]').forEach((h, j) => rects.set(h, new DOMRect(b.x + j * 80, b.y, 80, 30)));
  }

  it('a tab dragged past the edge of the page onto a new window drops there, found by its place on the screen', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const w = m.moveToNewWindow(m.findDocument('c')!)!;
    await settle();
    const view = m.views[0];
    inWindows = [m, w.groups[0]];
    // The page fills 0…1024 on the screen; the new window's page starts at 1100, 600 × 400.
    for (const [name, value] of Object.entries({ screenX: 1100, screenY: 0, innerWidth: 600, innerHeight: 400, outerWidth: 600, outerHeight: 400 })) Object.defineProperty(view, name, { value, configurable: true });
    const main = m.groups.find((g) => !g.browserWindow)!;
    rects.set(m.element, new DOMRect(0, 0, 800, 400));
    layGroup(main, new DOMRect(0, 0, 800, 400));
    rects.set(w.part.element, new DOMRect(0, 0, 600, 400));
    layGroup(w.groups[0], new DOMRect(0, 0, 600, 400));
    const tab = Array.from(main.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.textContent!.startsWith('A'))!;
    pointer('pointerdown', tab, 40, 15);
    pointer('pointermove', document.body, 60, 15);
    // 1300 on the screen: 200 into the new window, on its strip after C.
    pointer('pointermove', document.body, 1300, 15);
    pointer('pointerup', document.body, 1300, 15);
    await settle();
    expect(m.findDocument('a')!.browserWindow).toBe(w);
    expect(titles(w.groups[0])).toEqual(['C', 'A']);
  });

  it('a tab dragged within a new window reorders there; dragged past its edge it goes back to the main window', async () => {
    const m = managerWith([['A', 'B', 'C']]);
    const w = m.moveToNewWindow(m.groups[0])!;
    await settle();
    const view = m.views[0];
    Object.defineProperty(view, 'innerWidth', { value: 600, configurable: true });
    Object.defineProperty(view, 'innerHeight', { value: 400, configurable: true });
    const g = w.groups[0];
    inWindows = [m, g];
    rects.set(w.part.element, new DOMRect(0, 0, 600, 400));
    layGroup(g, new DOMRect(0, 0, 600, 400));
    const tab = (title: string) => Array.from(g.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.textContent!.startsWith(title))!;
    pointer('pointerdown', tab('A'), 40, 15, view);
    pointer('pointermove', view.document.body, 60, 15, view);
    pointer('pointermove', view.document.body, 230, 15, view);
    pointer('pointerup', view.document.body, 230, 15, view);
    await settle();
    expect(titles(g)).toEqual(['B', 'C', 'A']);
    // Past the edge of the window, over nothing: back to the main window.
    layGroup(g, new DOMRect(0, 0, 600, 400));
    pointer('pointerdown', tab('C'), 120, 15, view);
    pointer('pointermove', view.document.body, 140, 15, view);
    pointer('pointermove', view.document.body, 900, -200, view);
    pointer('pointerup', view.document.body, 900, -200, view);
    await settle();
    expect(m.findDocument('c')!.browserWindow).toBeNull();
    expect(m.groups.filter((x) => !x.browserWindow).flatMap(titles)).toEqual(['C']);
  });
});
