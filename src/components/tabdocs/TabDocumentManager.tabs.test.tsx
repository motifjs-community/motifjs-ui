import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
  vi.unstubAllGlobals();
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

function press(key: string, init: KeyboardEventInit = {}, type: 'keydown' | 'keyup' = 'keydown') {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function rightClick(target: Element) {
  const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 20, clientY: 20 });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const titles = (m: TabDocumentManager, g = 0) => m.groups[g].documents.map((d) => d.title);
const headers = (m: TabDocumentManager, g = 0) => Array.from(m.groups[g].element.querySelectorAll<HTMLElement>('[role="tab"]'));
const header = (m: TabDocumentManager, title: string) => Array.from(m.element.querySelectorAll<HTMLElement>('[role="tab"]')).find((h) => h.querySelector('.mx-tabdocs__title')!.textContent === title)!;
const popups = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-popup')).filter((p) => !p.hidden);
const menuNames = (m: TabDocumentManager) => Array.from(popups(m)[0].querySelectorAll<HTMLElement>('.mx-menu__item')).map((i) => i.querySelector('.mx-menu__label')!.textContent);
const menuItem = (m: TabDocumentManager, name: string) =>
  Array.from(popups(m)[0].querySelectorAll<HTMLButtonElement>('.mx-menu__item')).find((i) => i.querySelector('.mx-menu__label')!.textContent === name)!;
const options = (m: TabDocumentManager) => Array.from(popups(m)[0].querySelectorAll<HTMLElement>('[role="option"]')).map((o) => o.querySelector('.mx-tabdocs__list-title')!.textContent);
const live = (m: TabDocumentManager) => m.element.querySelector('.mx-tabdocs__live')!.textContent;
const nameOf = (el: Element) => document.getElementById(el.getAttribute('aria-labelledby')!)!.textContent;

describe('TabDocumentManager: preview tabs', () => {
  it('a preview takes the place of the group\'s preview tab, and is shown in italics', async () => {
    const m = manager();
    m.open(doc('A'));
    const b = m.open(doc('B'), { preview: true })!;
    expect(b.preview).toBe(true);
    expect(header(m, 'B').hasAttribute('data-preview')).toBe(true);
    expect(header(m, 'B').textContent).toContain('preview');
    m.activate(m.findDocument('a')!);
    const c = m.open(doc('C'), { preview: true })!;
    expect(titles(m)).toEqual(['A', 'C']);
    expect(b.isOpen).toBe(false);
    expect(m.groups[0].previewDocument).toBe(c);
    m.open(doc('D'));
    expect(titles(m)).toEqual(['A', 'C', 'D']);
  });

  it('becomes permanent by a double click, unsaved changes, keep, the menu or a move; keeping asks first', async () => {
    const s = reactive({ dirty: false });
    const m = manager();
    const seen: string[] = [];
    m.onKeeping((e) => {
      if (e.document.title === 'No') e.cancel = true;
    });
    m.onKept((e) => seen.push(`${e.document.title}${e.byUser ? ' (user)' : ''}`));
    const a = m.open(doc('A'), { preview: true })!;
    header(m, 'A').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(a.preview).toBe(false);
    expect(m.maximizedGroup).toBeNull();
    const b = m.open(doc('B', { dirty: () => s.dirty }), { preview: true })!;
    s.dirty = true;
    await settle();
    expect(b.preview).toBe(false);
    const c = m.open(doc('C'), { preview: true })!;
    expect(m.keep(c)).toBe(true);
    const no = m.open(doc('No'), { preview: true })!;
    expect(m.keep(no)).toBe(false);
    expect(no.preview).toBe(true);
    const right = m.split(m.groups[0], 'right')!;
    m.move(no, right);
    expect(no.preview).toBe(true); // kept from keeping by the handler
    const e = m.open(doc('E'), { preview: true, group: m.groups[0] })!;
    m.move(e, right);
    expect(e.preview).toBe(false);
    expect(seen).toEqual(['A (user)', 'B', 'C', 'E']);
    await settle();
    expect(live(m)).toBe('E kept open');
  });

  it('previewTabs off opens every document to stay; opening a preview again with preview: false keeps it', () => {
    const m = manager({ previewTabs: false });
    const a = m.open(doc('A'), { preview: true })!;
    expect(a.preview).toBe(false);
    m.previewTabs = true;
    const b = m.open(doc('B'), { preview: true })!;
    expect(m.open(b, { preview: false })).toBe(b);
    expect(b.preview).toBe(false);
  });

  it('closing asked by the old preview keeps it next to the new one', () => {
    const m = manager();
    m.onClosing((e) => {
      if (e.document.title === 'A') e.cancel = true;
    });
    const a = m.open(doc('A'), { preview: true })!;
    m.open(doc('B'), { preview: true });
    expect(titles(m)).toEqual(['B', 'A']);
    expect(a.preview).toBe(false);
  });
});

describe('TabDocumentManager: pinning', () => {
  it('pins to the start in pin order and unpins to the first of the others, asking first', async () => {
    const m = manager();
    const [a, b, c, d] = ['A', 'B', 'C', 'D'].map((t) => m.open(doc(t), { index: 99 })!);
    const log: string[] = [];
    m.onPinning((e) => {
      if (e.document === d) e.cancel = true;
    });
    m.onPinned((e) => log.push(`pin ${e.document.title}`));
    m.onUnpinned((e) => log.push(`unpin ${e.document.title}`));
    expect(m.pin(c)).toBe(true);
    expect(m.pin(a)).toBe(true);
    expect(m.pin(d)).toBe(false);
    expect(titles(m)).toEqual(['C', 'A', 'B', 'D']);
    const group = m.groups[0].element;
    expect(Array.from(group.querySelectorAll('.mx-tabdocs__pinned [role="tab"] .mx-tabdocs__title')).map((t) => t.textContent)).toEqual(['C', 'A']);
    await settle();
    expect(header(m, 'C').hasAttribute('data-pinned')).toBe(true);
    expect(header(m, 'C').textContent).toContain('pinned');
    m.unpin(c);
    expect(titles(m)).toEqual(['A', 'C', 'B', 'D']);
    expect(log).toEqual(['pin C', 'pin A', 'unpin C']);
    await settle();
    expect(live(m)).toBe('C unpinned');
    void b;
  });

  it('keeps pinned tabs before the others when moving; a pinned document opens among them', () => {
    const m = manager();
    const [a, b, c] = ['A', 'B', 'C'].map((t) => m.open(doc(t), { index: 99 })!);
    m.pin(a);
    m.move(c, m.groups[0], 0);
    expect(titles(m)).toEqual(['A', 'C', 'B']);
    m.move(a, m.groups[0], 2);
    expect(titles(m)).toEqual(['A', 'C', 'B']);
    m.open(doc('P'), { pinned: true, index: 99 });
    expect(titles(m)).toEqual(['A', 'P', 'C', 'B']);
    void b;
  });

  it('shows a pin mark that unpins and no close button unless closeButtonOnPinned', async () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    m.pin(a);
    await settle();
    const h = header(m, 'A');
    expect(h.hasAttribute('data-close')).toBe(false);
    m.closeButtonOnPinned = true;
    await settle();
    expect(h.dataset.close).toBe('always');
    h.querySelector<HTMLElement>('.mx-tabdocs__pin')!.click();
    expect(a.pinned).toBe(false);
  });

  it('close all, others, to the right and saved leave pinned tabs, unless keepPinned is off', async () => {
    const m = manager();
    const [a, b, c, d] = ['A', 'B', 'C', 'D'].map((t) => m.open(doc(t), { index: 99 })!);
    m.pin(a);
    d.dirty = true;
    await m.closeOthers(b);
    expect(titles(m)).toEqual(['A', 'B']);
    m.open(doc('C2'), { index: 99 });
    await m.closeToLeft(m.findDocument('c2')!);
    expect(titles(m)).toEqual(['A', 'C2']);
    await m.closeAll();
    expect(titles(m)).toEqual(['A']);
    m.keepPinned = false;
    await m.closeAll();
    expect(titles(m)).toEqual([]);
    void c;
  });

  it('closeSaved leaves the documents with unsaved changes', async () => {
    const m = manager();
    const [, b] = ['A', 'B', 'C'].map((t) => m.open(doc(t), { index: 99 })!);
    b.dirty = true;
    await m.closeSaved();
    expect(titles(m)).toEqual(['B']);
  });

  it('pinned tabs are saved and come back first, in order', () => {
    const m = manager();
    const [, b, c] = ['A', 'B', 'C'].map((t) => m.open(doc(t), { index: 99 })!);
    m.pin(c);
    m.pin(b);
    const json = m.saveLayout();
    m.loadLayout(json, (saved) => ({ content: text(saved.title) }));
    expect(titles(m)).toEqual(['C', 'B', 'A']);
    expect(m.documents.map((d) => d.pinned)).toEqual([true, true, false]);
  });
});

describe('TabDocumentManager: the strip', () => {
  it('writes how tabs are sized, where pinned tabs go and whether they wrap', () => {
    const m = manager({ tabSize: 'fixed', tabFixedWidth: 120, tabMinWidth: 60, pinnedTabSize: 'compact', pinnedTabsOnSeparateRow: true });
    const el = m.element;
    // The widths go on each group: the root's inline style is the app's.
    el.style.cssText = 'block-size: 20rem';
    const group = m.groups[0].element.style;
    expect([el.dataset.tabSize, el.dataset.pinnedSize, el.hasAttribute('data-pinned-row'), el.hasAttribute('data-wrap')]).toEqual(['fixed', 'compact', true, false]);
    expect([group.getPropertyValue('--_tab-fixed'), group.getPropertyValue('--_tab-min'), group.getPropertyValue('--_tab-max')]).toEqual(['120px', '60px', '']);
    m.wrapTabs = true;
    m.tabMaxWidth = 200;
    m.scrollButtons = false;
    expect([el.hasAttribute('data-wrap'), group.getPropertyValue('--_tab-max'), el.hasAttribute('data-scroll-buttons')]).toEqual([true, '200px', false]);
    const made = m.split(m.groups[0], 'right')!.element.style;
    expect([made.getPropertyValue('--_tab-min'), made.getPropertyValue('--_tab-max'), made.getPropertyValue('--_min-width')]).toEqual(['60px', '200px', '160px']);
  });

  it('a compact pinned tab keeps its title for screen readers and shows its first letter', async () => {
    const m = manager({ pinnedTabSize: 'compact' });
    const a = m.open(doc('alpha'))!;
    m.pin(a);
    await settle();
    const h = header(m, 'alpha');
    expect(h.querySelector('.mx-tabdocs__letter')!.textContent).toBe('A');
    expect(h.querySelector('.mx-tabdocs__letter')!.getAttribute('aria-hidden')).toBe('true');
    expect(h.textContent).toContain('alpha');
  });

  it('shows a badge as text or a dot, colours the tab by its tone, and the description only for equal titles', async () => {
    const s = reactive({ badge: 3 as number | boolean });
    const m = manager();
    const a = m.open(doc('Index', { description: 'src/a', badge: () => s.badge, tone: 'warning' }))!;
    await settle();
    const h = header(m, 'Index');
    expect(h.querySelector('.mx-tabdocs__badge')!.textContent).toBe('3');
    expect(h.dataset.tone).toBe('warning');
    expect(h.querySelector('.mx-tabdocs__description')).toBeNull();
    s.badge = true;
    m.open(doc('Index', { id: 'b', description: 'src/b' }));
    await settle();
    expect(h.querySelector('.mx-tabdocs__badge')!.hasAttribute('data-dot')).toBe(true);
    expect(h.querySelector('.mx-tabdocs__description')!.textContent).toBe('src/a');
    m.showDescription = 'never';
    await settle();
    expect(h.querySelector('.mx-tabdocs__description')).toBeNull();
    a.tone = null;
    await settle();
    expect(h.hasAttribute('data-tone')).toBe(false);
  });
});

describe('TabDocumentManager: menus', () => {
  it('a tab\'s context menu has the commands for it, and they work', async () => {
    const m = manager();
    const [a, b, c] = ['A', 'B', 'C'].map((t) => m.open(doc(t), { index: 99 })!);
    m.open(doc('P'), { preview: true });
    expect(rightClick(header(m, 'B'))).toBe(true);
    expect(menuNames(m)).toEqual([
      'Close',
      'Close others',
      'Close to the right',
      'Close to the left',
      'Close saved',
      'Close all',
      'Copy the title',
      'Pin',
      'Split up',
      'Split down',
      'Split left',
      'Split right',
      'Move to the next group',
      'Move to the previous group',
      'Move to…',
      'Float in a window',
      'Dock left',
      'Dock right',
      'Dock at the top',
      'Dock at the bottom',
    ]);
    menuItem(m, 'Pin').click();
    expect(b.pinned).toBe(true);
    rightClick(header(m, 'P'));
    expect(menuNames(m)).toContain('Keep open');
    menuItem(m, 'Keep open').click();
    expect(m.findDocument('p')!.preview).toBe(false);
    rightClick(header(m, 'C'));
    menuItem(m, 'Close to the right').click();
    await settle();
    expect(titles(m)).toEqual(['B', 'A', 'C']);
    rightClick(header(m, 'C'));
    menuItem(m, 'Move to the next group').click();
    expect(m.groups).toHaveLength(2);
    expect(titles(m, 1)).toEqual(['C']);
    rightClick(header(m, 'A'));
    menuItem(m, 'Split down').click();
    expect(m.groups).toHaveLength(3);
    expect(titles(m, 1)).toEqual(['A']);
    void a;
    void c;
  });

  it('hides items through menuItems; contextMenuOpening adds, changes or cancels per document', () => {
    const m = manager({ menuItems: { copyTitle: false, splitUp: false } });
    m.open(doc('A'));
    m.open(doc('B'));
    const ran: string[] = [];
    m.onContextMenuOpening((e) => {
      if (e.document?.title === 'B') e.cancel = true;
      e.items.push({ text: 'Reveal', beginGroup: true, click: () => void ran.push(e.document!.title) });
    });
    rightClick(header(m, 'A'));
    const names = menuNames(m);
    expect(names).not.toContain('Copy the title');
    expect(names).not.toContain('Split up');
    expect(names.at(-1)).toBe('Reveal');
    menuItem(m, 'Reveal').click();
    expect(ran).toEqual(['A']);
    expect(rightClick(header(m, 'B'))).toBe(false);
    m.contextMenu = false;
    expect(rightClick(header(m, 'A'))).toBe(false);
  });

  it('the empty strip has a menu of its own: new document, reopen, lock', async () => {
    let made = 0;
    const m = manager({ newDocument: () => ({ title: `Untitled-${++made}`, content: () => text('new') }) });
    const strip = m.groups[0].element.querySelector<HTMLElement>('.mx-tabdocs__strip')!;
    rightClick(strip);
    expect(menuNames(m)).toEqual([
      'New document',
      'Reopen closed',
      'Close all',
      'Close saved',
      'Lock group',
      'Split right',
      'Split down',
      'Move group to…',
      'Float in a window',
      'Dock left',
      'Dock right',
      'Dock at the top',
      'Dock at the bottom',
    ]);
    expect(menuItem(m, 'Reopen closed').getAttribute('aria-disabled')).toBe('true');
    menuItem(m, 'New document').click();
    expect(titles(m)).toEqual(['Untitled-1']);
    strip.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(titles(m)).toEqual(['Untitled-1', 'Untitled-2']);
    rightClick(strip);
    menuItem(m, 'Lock group').click();
    expect(m.groups[0].locked).toBe(true);
    expect(rightClick(m.groups[0].element.querySelector('.mx-tabdocs__panels')!)).toBe(false);
  });

  it('the "…" list shows the group\'s documents to search and open, with its commands', async () => {
    const m = manager();
    ['Alpha', 'Beta', 'Gamma'].forEach((t) => m.open(doc(t), { index: 99 }));
    m.findDocument('beta')!.dirty = true;
    expect(m.showOpenList()).toBe(true);
    await settle();
    expect(options(m)).toEqual(['Alpha', 'Beta', 'Gamma']);
    const popup = popups(m)[0];
    expect(nameOf(popup.querySelector('[role="listbox"]')!)).toBe('Open documents');
    expect(popup.textContent).toContain('unsaved changes');
    const search = popup.querySelector<HTMLInputElement>('input')!;
    expect(document.activeElement).toBe(search);
    search.value = 'gam';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(options(m)).toEqual(['Gamma']);
    popup.querySelector<HTMLElement>('[role="option"]')!.click();
    await settle();
    expect(m.activeDocument?.title).toBe('Gamma');
    expect(popups(m)).toHaveLength(0);
    m.showOpenList();
    menuItem(m, 'Close saved').click();
    await settle();
    expect(titles(m)).toEqual(['Beta']);
    m.showOpenList();
    menuItem(m, 'Lock group').click();
    expect(m.groups[0].locked).toBe(true);
  });

  it('the "…" list can show every group', async () => {
    const m = manager({ openListScope: 'all' });
    m.open(doc('A'));
    m.split(m.groups[0], 'right', m.open(doc('B'))!);
    m.showOpenList(m.groups[0]);
    await settle();
    expect(options(m)).toEqual(['A', 'B']);
    expect(popups(m)[0].textContent).toContain('group 2');
  });

  it('adds the app\'s buttons to every group and the active document\'s own, with their tones', async () => {
    const clicked: string[] = [];
    const m = manager({ toolbarItems: (g) => [{ text: () => `Run ${g.index + 1}`, tone: 'accent', click: () => void clicked.push('run') }] });
    m.open(doc('A', { actions: [{ text: 'Format', click: () => void clicked.push('format') }] }));
    m.open(doc('B'));
    await settle();
    const bar = () => Array.from(m.groups[0].element.querySelectorAll<HTMLElement>('.mx-tabdocs__actions .mx-button')).map((b) => b.textContent);
    expect(bar()).toContain('Run 1');
    expect(bar()).not.toContain('Format');
    m.activate(m.findDocument('a')!);
    await settle();
    expect(bar()).toContain('Format');
    const run = Array.from(m.groups[0].element.querySelectorAll<HTMLElement>('.mx-tabdocs__actions .mx-button')).find((b) => b.textContent === 'Run 1')!;
    expect(run.dataset.tone).toBe('accent');
  });
});

describe('TabDocumentManager: recently used, history, reopening', () => {
  it('the recent list opens on its key with the document used before, walks while the key is held, and opens on release', async () => {
    const m = manager();
    const [a, b, c] = ['A', 'B', 'C'].map((t) => m.open(doc(t))!);
    m.activate(a);
    m.activate(c);
    header(m, 'C').focus();
    expect(press('e', { ctrlKey: true })).toBe(true);
    await settle();
    const popup = popups(m)[0];
    expect(nameOf(popup.querySelector('[role="listbox"]')!)).toBe('Recently used documents');
    expect(options(m)).toEqual(['C', 'A', 'B']);
    const active = () => popup.querySelector('#' + popup.querySelector('[role="listbox"]')!.getAttribute('aria-activedescendant'))!.textContent;
    expect(active()).toContain('A');
    press('e', { ctrlKey: true });
    expect(active()).toContain('B');
    press('E', { ctrlKey: true, shiftKey: true });
    expect(active()).toContain('A');
    press('Control', {}, 'keyup');
    await settle();
    expect(m.activeDocument).toBe(a);
    expect(popups(m)).toHaveLength(0);
    void b;
  });

  it('the recent list works by keyboard alone: arrows, Enter, Escape', async () => {
    const m = manager({ keys: { recentNext: ['F6'] } });
    const [a, b] = ['A', 'B'].map((t) => m.open(doc(t))!);
    header(m, 'B').focus();
    press('F6');
    await settle();
    press('ArrowDown');
    press('Enter');
    await settle();
    expect(m.activeDocument).toBe(b);
    m.showRecentList();
    await settle();
    press('Escape');
    await settle();
    expect(popups(m)).toHaveLength(0);
    expect(m.activeDocument).toBe(b);
    void a;
  });

  it('goes back and forward over the documents activated, across groups', () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const b = m.open(doc('B'))!;
    const right = m.split(m.groups[0], 'right')!;
    const c = m.open(doc('C'), { group: right })!;
    expect(m.canGoBack).toBe(true);
    expect(m.goBack()).toBe(true);
    expect(m.activeDocument).toBe(b);
    m.goBack();
    expect(m.activeDocument).toBe(a);
    expect(m.goBack()).toBe(false);
    m.goForward();
    m.goForward();
    expect(m.activeDocument).toBe(c);
    expect(m.canGoForward).toBe(false);
    header(m, 'C').focus();
    press('ArrowLeft', { altKey: true });
    expect(m.activeDocument).toBe(b);
    m.historySize = 0;
    m.activate(c);
    expect(m.canGoBack).toBe(false);
  });

  it('reopens the documents closed last where they were', async () => {
    const m = manager();
    const [a, b, c] = ['A', 'B', 'C'].map((t) => m.open(doc(t), { index: 99 })!);
    const given = m.open(new TabDocument({ title: 'Given', content: text('given') }))!;
    await m.close(b);
    await m.close(given);
    await m.close(c);
    expect(m.closedDocuments).toEqual([c, b]);
    expect(m.reopenClosed()).toBe(c);
    expect(m.reopenClosed()).toBe(b);
    expect(titles(m)).toEqual(['A', 'B', 'C']);
    expect(m.reopenClosed()).toBeNull();
    m.closedHistorySize = 0;
    await m.close(a);
    expect(m.closedDocuments).toEqual([]);
  });

  it('reopens by its key', async () => {
    const m = manager();
    m.open(doc('A'));
    const b = m.open(doc('B'))!;
    await m.close(b);
    header(m, 'A').focus();
    press('T', { ctrlKey: true, altKey: true, shiftKey: true });
    expect(m.activeDocument).toBe(b);
  });
});

describe('TabDocumentManager: locked groups', () => {
  it('a locked group takes no document opened without naming it; when all are, a new group opens', () => {
    const m = manager();
    const log: string[] = [];
    m.onLocking((e) => log.push(`locking ${e.group.index}`));
    m.onLocked((e) => log.push(`locked ${e.group.index}`));
    m.onUnlocked((e) => log.push(`unlocked ${e.group.index}`));
    const first = m.groups[0];
    m.open(doc('A'));
    m.lock(first);
    expect(first.element.getAttribute('aria-label')).toBe('Group 1, locked');
    m.open(doc('B'));
    expect(titles(m)).toEqual(['A', 'B']); // the only group
    const right = m.split(first, 'right')!;
    m.focusGroup(first);
    m.open(doc('C'));
    expect(titles(m, 1)).toEqual(['C']);
    m.lock(right);
    m.open(doc('D'));
    expect(m.groups).toHaveLength(3);
    m.open(doc('E'), { group: first });
    expect(titles(m, 0)).toContain('E');
    m.unlock(first);
    expect(log).toEqual(['locking 0', 'locked 0', 'locking 1', 'locked 1', 'unlocked 0']);
  });

  it('shows a lock mark that unlocks, and is saved', async () => {
    const m = manager();
    m.open(doc('A'));
    m.lock(m.groups[0]);
    await settle();
    const mark = m.groups[0].element.querySelector<HTMLElement>('.mx-tabdocs__actions [title="Unlock group"]')!;
    mark.click();
    expect(m.groups[0].locked).toBe(false);
    m.lock(m.groups[0]);
    const json = m.saveLayout();
    m.unlock(m.groups[0]);
    await settle();
    expect(live(m)).toBe('Group 1 unlocked');
    m.loadLayout(json, (saved) => ({ content: text(saved.title) }));
    expect(m.groups[0].locked).toBe(true);
  });
});

describe('TabDocumentManager: the same document in two groups', () => {
  it('opens a copy in another group that shares the title and unsaved changes, with content of its own', async () => {
    const m = manager({ allowDuplicate: true });
    const a = m.open(doc('A'))!;
    const right = m.split(m.groups[0], 'right')!;
    const copy = m.open(a, { group: right })!;
    expect(copy).not.toBe(a);
    expect(copy.original).toBe(a);
    expect(copy.id).toBe(a.id);
    expect(m.contentOf(copy)).not.toBe(m.contentOf(a));
    a.dirty = true;
    a.title = 'A2';
    expect(copy.dirty && copy.title === 'A2').toBe(true);
    expect(m.open(a, { group: right })).toBe(copy);
    await settle();
    expect(header(m, 'A2').querySelector('.mx-tabdocs__description')).toBeNull();
    const closing: boolean[] = [];
    m.onClosing((e) => closing.push(e.lastCopy));
    await m.close(copy);
    await m.close(a);
    expect(closing).toEqual([false, true]);
  });

  it('splitting copies the document when it may be open twice, and moves it otherwise', () => {
    const m = manager({ allowDuplicate: true });
    const a = m.open(doc('A'))!;
    const split: (string | null)[] = [];
    m.onSplit((e) => split.push(e.copy?.title ?? null));
    m.split(m.groups[0], 'right', a);
    expect([titles(m, 0), titles(m, 1)]).toEqual([['A'], ['A']]);
    m.splitCopies = false;
    const b = m.open(doc('B'), { group: m.groups[0] })!;
    m.split(m.groups[0], 'down', b);
    expect(titles(m, 0)).toEqual(['A']);
    expect(split).toEqual(['A', null]);
  });

  it('without allowDuplicate an open document is activated where it is; a copy comes back from a saved layout', () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const right = m.split(m.groups[0], 'right')!;
    expect(m.open(a, { group: right })).toBe(a);
    expect(m.documents).toHaveLength(1);
    m.allowDuplicate = true;
    m.open(a, { group: right });
    const json = m.saveLayout();
    m.loadLayout(json, (saved) => ({ content: () => text(saved.title) }));
    const [first, second] = m.documents;
    expect(second.original).toBe(first);
  });
});

describe('TabDocumentManager: keys', () => {
  it('starts with keys a browser tab lets through, and the desktop ones when installed or asked', () => {
    const m = manager();
    expect(m.keys.closeTab).toEqual(['Ctrl+Alt+W', 'Ctrl+W']);
    m.keyPreset = 'desktop';
    expect(m.keys.closeTab).toEqual(['Ctrl+W', 'Ctrl+F4']);
    m.keys = { closeTab: ['F4'] };
    expect(m.keys.closeTab).toEqual(['F4']);
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('standalone') }));
    const installed = manager();
    expect(installed.keys.recentNext).toEqual(['Ctrl+Tab']);
  });

  it('the browser keys work: close, next tab, a group, pin, keep, close all', async () => {
    const m = manager();
    const [a, b] = ['A', 'B'].map((t) => m.open(doc(t), { index: 99 })!);
    header(m, 'B').focus();
    press('PageUp', { altKey: true });
    expect(m.activeDocument).toBe(a);
    press('k', { ctrlKey: true });
    press('Enter', { shiftKey: true });
    expect(a.pinned).toBe(true);
    const c = m.open(doc('C'), { preview: true })!;
    press('k', { ctrlKey: true });
    press('Enter');
    expect(c.preview).toBe(false);
    press('w', { ctrlKey: true, altKey: true });
    await settle();
    expect(c.isOpen).toBe(false);
    m.split(m.groups[0], 'right', b);
    press('1', { ctrlKey: true, altKey: true });
    expect(m.activeGroup).toBe(m.groups[0]);
    press('k', { ctrlKey: true });
    press('w');
    await settle();
    expect(titles(m)).toEqual(['A']);
  });
});
