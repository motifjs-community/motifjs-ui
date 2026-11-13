import { Component, reactive, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabLayoutSplit } from './tab-layout-split';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
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

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const titles = (m: TabDocumentManager, g = 0) => m.groups[g].documents.map((d) => d.title);
const headers = (m: TabDocumentManager, g = 0) => Array.from(m.groups[g].element.querySelectorAll<HTMLElement>('[role="tab"]'));
const shown = (m: TabDocumentManager, g = 0) => Array.from(m.groups[g].element.querySelectorAll<HTMLElement>('[role="tabpanel"]')).filter((p) => !p.hidden);

describe('TabDocumentManager: documents', () => {
  it('starts with one empty group that says so', () => {
    const m = manager();
    expect(m.groups).toHaveLength(1);
    const group = m.groups[0];
    expect(m.activeGroup).toBe(group);
    expect(group.element.getAttribute('role')).toBe('group');
    expect(group.element.getAttribute('aria-label')).toBe('Group 1');
    expect(group.element.querySelector('[role="tablist"]')).toBeNull();
    expect(group.element.querySelector('.mx-tabdocs__empty')!.textContent).toBe('No open documents');
    expect(m.element.hasAttribute('role')).toBe(false);
  });

  it('opens documents after the active one, with the tabs pattern', () => {
    const m = manager({ label: 'Editor' });
    expect(m.element.getAttribute('role')).toBe('region');
    expect(m.element.getAttribute('aria-label')).toBe('Editor');
    const a = m.open(doc('A'))!;
    m.open(doc('B'));
    m.activate(a);
    m.open(doc('C'));
    expect(titles(m)).toEqual(['A', 'C', 'B']);
    expect(m.activeDocument?.title).toBe('C');
    const [ha, hc, hb] = headers(m);
    expect([ha.tabIndex, hc.tabIndex, hb.tabIndex]).toEqual([-1, 0, -1]);
    expect(hc.getAttribute('aria-selected')).toBe('true');
    const panel = shown(m)[0];
    expect(panel.getAttribute('aria-labelledby')).toBe(hc.id);
    expect(hc.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.textContent).toBe('C');
    expect(m.groups[0].element.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Documents in group 1');
    m.open(doc('D'), { active: false, index: 0 });
    expect(titles(m)).toEqual(['D', 'A', 'C', 'B']);
    expect(m.activeDocument?.title).toBe('C');
  });

  it('takes plain options, finds documents, and activates one opened again', () => {
    const m = manager({ openPosition: 'end' });
    const made = m.open({ id: 'x', title: 'X' })!;
    expect(made).toBeInstanceOf(TabDocument);
    m.open(doc('Y'));
    expect(m.findDocument('x')).toBe(made);
    expect(m.open(made)).toBe(made);
    expect(m.activeDocument).toBe(made);
    expect(m.documents.map((d) => d.id)).toEqual(['x', 'y']);
    expect(made.isOpen && made.group === m.groups[0] && made.manager === m).toBe(true);
  });

  it('fires opening, which can cancel or move the document, and opened', () => {
    const m = manager();
    const seen: string[] = [];
    m.onOpening((e) => {
      if (e.document.title === 'No') e.cancel = true;
      if (e.document.title === 'First') e.index = 0;
    });
    m.onOpened((e) => seen.push(`${e.document.title}@${e.index}`));
    m.open(doc('A'));
    expect(m.open(doc('No'))).toBeNull();
    m.open(doc('First'));
    expect(titles(m)).toEqual(['First', 'A']);
    expect(seen).toEqual(['A@0', 'First@0']);
  });

  it('activates by code and by click, asking first', () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const b = m.open(doc('B'))!;
    const log: string[] = [];
    m.onDocumentActivating((e) => {
      if (e.document.title === 'A' && e.byUser) e.cancel = true;
    });
    m.onDocumentActivated((e) => log.push(`${e.previous?.title ?? '-'}→${e.document?.title}${e.byUser ? ' (user)' : ''}`));
    headers(m)[0].click();
    expect(m.activeDocument).toBe(b);
    m.activate(a);
    expect(m.activeDocument).toBe(a);
    expect(a.isActive && !b.isActive).toBe(true);
    headers(m)[1].click();
    expect(log).toEqual(['B→A', 'A→B (user)']);
    expect(m.activateNext()).toBe(true);
    expect(m.activeDocument).toBe(a);
    expect(m.activatePrevious()).toBe(true);
    expect(m.activeDocument).toBe(b);
  });

  it('shows title, description, icon, badge, dirty dot and close button, all followed', async () => {
    const s = reactive({ dirty: false, title: 'Report' });
    const m = manager({ showDescription: 'always' });
    const d = m.open(doc('R', { title: () => s.title, description: 'src/a', icon: '/i.svg', badge: 3, dirty: () => s.dirty }))!;
    const h = headers(m)[0];
    expect(h.querySelector('.mx-tabdocs__title')!.textContent).toBe('Report');
    expect(h.querySelector('.mx-tabdocs__description')!.textContent).toBe('src/a');
    expect(h.querySelector('.mx-tabdocs__icon img')!.getAttribute('src')).toBe('/i.svg');
    expect(h.querySelector('.mx-tabdocs__badge')!.textContent).toBe('3');
    expect(h.dataset.close).toBe('always');
    expect(h.getAttribute('aria-keyshortcuts')).toBe('Delete');
    expect(h.hasAttribute('data-dirty')).toBe(false);
    s.dirty = true;
    s.title = 'Report 2';
    await settle();
    expect(h.hasAttribute('data-dirty')).toBe(true);
    expect(h.querySelector<HTMLElement>('.mx-tabdocs__hidden')!.hidden).toBe(false);
    expect(h.textContent).toContain('Report 2');
    expect(h.textContent).toContain('unsaved changes');
    m.closeButton = 'active';
    await settle();
    expect(h.dataset.close).toBe('active');
    d.closable = false;
    await settle();
    expect(h.hasAttribute('data-close')).toBe(false);
    expect(h.hasAttribute('aria-keyshortcuts')).toBe(false);
    m.closeButton = 'never';
    d.closable = true;
    await settle();
    expect(h.hasAttribute('data-close')).toBe(false);
    expect(d.dirty).toBe(true);
  });
});

describe('TabDocumentManager: closing', () => {
  it('closes as asked, then activates the tab used last', async () => {
    const m = manager();
    const [a, b, c] = [m.open(doc('A'))!, m.open(doc('B'))!, m.open(doc('C'))!];
    m.activate(a);
    m.activate(c);
    const closed: string[] = [];
    m.onClosed((e) => closed.push(`${e.document.title}@${e.index}`));
    expect(await m.close(c)).toBe(true);
    expect(m.activeDocument).toBe(a);
    expect(titles(m)).toEqual(['A', 'B']);
    expect(c.isOpen).toBe(false);
    expect(closed).toEqual(['C@2']);
    m.afterClose = 'right';
    await m.close(a);
    expect(m.activeDocument).toBe(b);
  });

  it('activates the left or the right neighbour when told to', async () => {
    const m = manager({ afterClose: 'left', openPosition: 'end' });
    const [, b, c] = [m.open(doc('A'))!, m.open(doc('B'))!, m.open(doc('C'))!];
    m.activate(b);
    await m.close(b);
    expect(m.activeDocument?.title).toBe('A');
    m.activate(c);
    m.afterClose = 'right';
    await m.close(c);
    expect(m.activeDocument?.title).toBe('A');
  });

  it('closing can be cancelled, or wait for a promise', async () => {
    const m = manager();
    const a = m.open(doc('A', { dirty: true }))!;
    let answer = false;
    m.onClosing((e) => {
      if (e.document.title === 'Keep') e.cancel = true;
      else if (e.document.dirty) e.promise = Promise.resolve(answer);
    });
    const keep = m.open(doc('Keep'))!;
    expect(await m.close(keep)).toBe(false);
    expect(await m.close(a)).toBe(false);
    expect(a.isOpen).toBe(true);
    answer = true;
    expect(await m.close(a)).toBe(true);
    expect(a.isOpen).toBe(false);
  });

  it('a document that is not closable stays when the user closes it, not when code does', async () => {
    const m = manager();
    const a = m.open(doc('A', { closable: false }))!;
    headers(m)[0].focus();
    press('Delete');
    await settle();
    expect(a.isOpen).toBe(true);
    expect(await m.close(a)).toBe(true);
  });

  it('closes by the close button and by the middle button', async () => {
    const m = manager();
    m.open(doc('A'));
    m.open(doc('B'));
    headers(m)[1].querySelector<HTMLElement>('.mx-tabdocs__close')!.click();
    await settle();
    expect(titles(m)).toEqual(['A']);
    headers(m)[0].dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true }));
    await settle();
    expect(titles(m)).toEqual([]);
  });

  it('closeAll closes every document it may', async () => {
    const m = manager();
    m.open(doc('A'));
    m.open(doc('B', { dirty: true }));
    m.open(doc('C'));
    m.onClosing((e) => (e.cancel = e.document.dirty));
    expect(await m.closeAll()).toBe(false);
    expect(titles(m)).toEqual(['B']);
  });
});

describe('TabDocumentManager: groups', () => {
  it('splits right, down and left, nesting and sharing the room', () => {
    const m = manager();
    const one = m.groups[0];
    const right = m.split(one, 'right')!;
    expect(m.groups).toEqual([one, right]);
    let root = m.saveLayout().root as TabLayoutSplit;
    expect(root.kind).toBe('split');
    expect(root.orientation).toBe('horizontal');
    expect(root.sizes).toEqual([0.5, 0.5]);
    const below = m.split(right, 'down')!;
    const left = m.split(one, 'left')!;
    expect(m.groups).toEqual([left, one, right, below]);
    root = m.saveLayout().root as TabLayoutSplit;
    expect(root.sizes).toEqual([0.25, 0.25, 0.5]);
    const inner = root.children[2] as TabLayoutSplit;
    expect(inner.orientation).toBe('vertical');
    expect(inner.sizes).toEqual([0.5, 0.5]);
    expect(m.groups.map((g) => g.element.getAttribute('aria-label'))).toEqual(['Group 1', 'Group 2', 'Group 3', 'Group 4']);
    const sashes = m.element.querySelectorAll('[role="separator"]');
    expect(sashes).toHaveLength(3);
    expect(sashes[0].getAttribute('aria-orientation')).toBe('vertical');
    expect(sashes[0].getAttribute('aria-valuenow')).toBe('50');
    expect(sashes[0].getAttribute('aria-label')).toBe('Resize groups');
    expect(m.element.querySelector('.mx-tabdocs__split[data-orientation="vertical"] > [role="separator"]')!.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('moves the document it is given into the new group; splitting can be cancelled', () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const b = m.open(doc('B'))!;
    const content = b.contentComponent!;
    const made: string[] = [];
    m.onSplit((e) => made.push(`${e.direction}:${e.document?.title}`));
    m.onSplitting((e) => (e.cancel = e.direction === 'up'));
    expect(m.split(m.groups[0], 'up')).toBeNull();
    const second = m.split(m.groups[0], 'right', b)!;
    expect(second.documents).toEqual([b]);
    expect(titles(m)).toEqual(['A']);
    expect(b.contentComponent).toBe(content);
    expect(content.isDisposed).toBe(false);
    expect(m.activeGroup).toBe(second);
    expect(m.activeDocument).toBe(b);
    expect(a.isActive).toBe(true);
    expect(made).toEqual(['right:B']);
  });

  it('a group left empty closes, and its split gives the place back', async () => {
    const m = manager();
    m.open(doc('A'));
    const b = m.open(doc('B'))!;
    const c = m.open(doc('C'))!;
    const right = m.split(m.groups[0], 'right', b)!;
    m.split(right, 'down', c);
    expect(m.groups).toHaveLength(3);
    const changes: string[] = [];
    m.onLayoutChanged((e) => changes.push(e.change));
    await m.close(c);
    expect(m.groups).toHaveLength(2);
    const root = m.saveLayout().root as TabLayoutSplit;
    expect(root.children.map((x) => x.kind)).toEqual(['group', 'group']);
    expect(m.element.querySelectorAll('.mx-tabdocs__split')).toHaveLength(1);
    expect(changes).toEqual(['closeGroup']);
    await m.close(b);
    expect(m.groups).toHaveLength(1);
    expect(m.saveLayout().root.kind).toBe('group');
    expect(m.element.querySelectorAll('.mx-tabdocs__split, [role="separator"]')).toHaveLength(0);
  });

  it('keeps empty groups when closeEmptyGroups is off; closeGroup closes them, never the last', async () => {
    const m = manager({ closeEmptyGroups: false });
    const a = m.open(doc('A'))!;
    const second = m.split(m.groups[0], 'right')!;
    await m.close(a);
    expect(m.groups).toHaveLength(2);
    expect(m.groups[0].isEmpty).toBe(true);
    expect(await m.closeGroup(m.groups[0])).toBe(true);
    expect(m.groups).toEqual([second]);
    expect(await m.closeGroup(second)).toBe(true);
    expect(m.groups).toEqual([second]);
  });

  it('closing a group closes its documents first, and can be stopped', async () => {
    const m = manager();
    m.open(doc('A'));
    const b = m.open(doc('B', { dirty: true }))!;
    const second = m.split(m.groups[0], 'right', b)!;
    m.onClosing((e) => (e.cancel = e.document.dirty));
    expect(await m.closeGroup(second)).toBe(false);
    expect(m.groups).toHaveLength(2);
    m.onLayoutChanging((e) => (e.cancel = e.change === 'closeGroup'));
    b.dirty = false;
    expect(await second.close()).toBe(false);
    expect(b.isOpen).toBe(true);
  });

  it('merges a split into the split around it when they run the same way', async () => {
    const m = manager();
    const g1 = m.groups[0];
    const g2 = m.split(g1, 'right')!;
    const g3 = m.split(g2, 'down')!;
    m.split(g3, 'right');
    // g2 over (g3 | g4), beside g1: closing g2 leaves g3 | g4 inside the outer row.
    await m.closeGroup(g2);
    const root = m.saveLayout().root as TabLayoutSplit;
    expect(root.orientation).toBe('horizontal');
    expect(root.children.map((c) => c.kind)).toEqual(['group', 'group', 'group']);
    expect(root.sizes.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(m.element.querySelectorAll('.mx-tabdocs__split')).toHaveLength(1);
  });

  it('moves documents within a group and across, the same content object along', async () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const b = m.open(doc('B'))!;
    const c = m.open(doc('C'))!;
    const moves: string[] = [];
    m.onMoving((e) => (e.cancel = e.toIndex === 99));
    m.onMoved((e) => moves.push(`${e.document.title}:${e.fromIndex}→${e.to.index}/${e.toIndex}`));
    expect(m.move(a, m.groups[0], 2)).toBe(true);
    expect(titles(m)).toEqual(['B', 'C', 'A']);
    const second = m.split(m.groups[0], 'right')!;
    const content = c.contentComponent!;
    const element = content.element;
    expect(m.move(c, second)).toBe(true);
    expect(c.group).toBe(second);
    expect(c.contentComponent).toBe(content);
    expect(content.element).toBe(element);
    expect(content.isDisposed).toBe(false);
    expect(second.element.contains(element)).toBe(true);
    expect(m.activeDocument).toBe(c);
    expect(titles(m)).toEqual(['B', 'A']);
    expect(moves).toEqual(['A:0→0/2', 'C:1→1/0']);
    await m.close(b);
    m.move(a, second, 0);
    expect(m.groups).toEqual([second]);
    expect(titles(m)).toEqual(['A', 'C']);
  });

  it('resizes by share and evens the sizes, asking first', () => {
    const m = manager();
    const g1 = m.groups[0];
    const g2 = m.split(g1, 'right')!;
    m.split(g2, 'right');
    expect(m.resizeGroup(g1, '30%')).toBe(true);
    let root = m.saveLayout().root as TabLayoutSplit;
    expect(root.sizes.map((s) => Math.round(s * 100))).toEqual([30, 45, 25]);
    expect(g1.element.style.flex).toBe('0.3 1 0px');
    m.evenSizes();
    root = m.saveLayout().root as TabLayoutSplit;
    expect(root.sizes.map((s) => Math.round(s * 100))).toEqual([33, 33, 33]);
    m.onLayoutChanging((e) => (e.cancel = e.change === 'resize'));
    expect(m.resizeGroup(g1, '20%')).toBe(false);
    m.element.querySelector<HTMLElement>('[role="separator"]')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  });

  it('maximizes a group and restores the others', () => {
    const m = manager();
    const g1 = m.groups[0];
    const g2 = m.split(g1, 'right')!;
    const g3 = m.split(g2, 'down')!;
    expect(m.maximizeGroup(g3)).toBe(true);
    expect(m.maximizedGroup).toBe(g3);
    expect(g3.isMaximized).toBe(true);
    // The others are out of the page, their splitters too.
    expect(g1.element.isConnected || g2.element.isConnected).toBe(false);
    expect(g3.element.isConnected).toBe(true);
    expect(m.element.querySelectorAll('[role="separator"]')).toHaveLength(0);
    expect(m.activeGroup).toBe(g3);
    expect(m.restoreGroups()).toBe(true);
    expect(g1.element.isConnected && g2.element.isConnected).toBe(true);
    expect(m.maximizedGroup).toBeNull();
    m.maximizeGroup(g1);
    m.focusGroup(g2);
    expect(m.maximizedGroup).toBeNull();
    expect(m.activeGroup).toBe(g2);
  });

  it('focusGroup goes back to what had focus in the group', () => {
    const m = manager();
    m.open(doc('A', { content: () => {
      const c = new Component<HTMLDivElement>('div');
      c.element.innerHTML = '<input class="one"><input class="two">';
      return c;
    } }));
    const second = m.split(m.groups[0], 'right')!;
    m.open(doc('B'), { group: second });
    m.groups[0].element.querySelector<HTMLInputElement>('.two')!.focus();
    expect(m.activeGroup).toBe(m.groups[0]);
    m.focusGroup(1);
    expect(m.activeGroup).toBe(second);
    expect(second.element.contains(document.activeElement)).toBe(true);
    m.focusGroup(0);
    expect((document.activeElement as HTMLElement).className).toBe('two');
  });

  it('a press on text in a panel that holds controls makes its document the active one', () => {
    const m = manager();
    const told: string[] = [];
    m.open(doc('A', { content: () => {
      const c = new Component<HTMLDivElement>('div');
      c.element.innerHTML = '<p class="text">Some text</p><input>';
      return c;
    } }));
    const second = m.split(m.groups[0], 'right')!;
    m.open(doc('B'), { group: second });
    expect(m.activeDocument?.title).toBe('B');
    m.onDocumentActivated((e) => told.push(e.document?.title ?? ''));
    m.groups[0].element.querySelector('.text')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(m.activeGroup).toBe(m.groups[0]);
    expect(m.activeDocument?.title).toBe('A');
    expect(told).toEqual(['A']);
  });
});

describe('TabDocumentManager: content lifetime', () => {
  function counted(log: string[]) {
    return (d: TabDocument): ComponentBase => {
      log.push(`make ${d.title}`);
      const c = text(d.title);
      c.motif.setDisposable(() => log.push(`drop ${d.title}`));
      return c;
    };
  }

  it('keep builds on open and keeps; lazy builds when shown; dispose drops when hidden', async () => {
    const log: string[] = [];
    const m = manager();
    m.open(doc('Keep', { content: counted(log) }));
    m.open(doc('Lazy', { content: counted(log), contentLifetime: 'lazy' }), { active: false });
    expect(log).toEqual(['make Keep']);
    const lazy = m.findDocument('lazy')!;
    expect(lazy.contentComponent).toBeNull();
    m.activate(lazy);
    expect(log).toEqual(['make Keep', 'make Lazy']);
    const gone = m.open(doc('Gone', { content: counted(log), contentLifetime: 'dispose', state: { n: 1 } }))!;
    m.activate(lazy);
    await settle();
    expect(log.slice(2)).toEqual(['make Gone', 'drop Gone']);
    expect(gone.contentComponent).toBeNull();
    m.activate(gone);
    expect(log.slice(4)).toEqual(['make Gone']);
  });

  it("follows the manager's setting and a document's own, live", async () => {
    const log: string[] = [];
    const m = manager({ contentLifetime: 'lazy' });
    m.open(doc('A', { content: counted(log) }));
    const b = m.open(doc('B', { content: counted(log) }), { active: false })!;
    expect(log).toEqual(['make A']);
    b.contentLifetime = 'keep';
    await settle();
    expect(log).toEqual(['make A', 'make B']);
    m.contentLifetime = 'dispose';
    await settle();
    expect(log).toEqual(['make A', 'make B']);
    b.contentLifetime = undefined;
    await settle();
    expect(log).toEqual(['make A', 'make B', 'drop B']);
  });

  it("uses the manager's factory for documents without content; a given component stays", () => {
    const m = manager({ contentLifetime: 'dispose', factory: (d) => text(`made ${d.type}`) });
    const plain = m.open({ title: 'P', type: 'note' })!;
    expect(plain.contentComponent!.element.textContent).toBe('made note');
    const given = text('given');
    const g = m.open({ title: 'G', content: given })!;
    expect(plain.contentComponent).toBeNull();
    m.activate(plain);
    expect(g.contentComponent).toBe(given);
    expect(given.isDisposed).toBe(false);
  });

  it('disposing the manager disposes the content and lets the documents go', async () => {
    const m = manager();
    const a = m.open(doc('A'))!;
    const content = a.contentComponent!;
    await hosts[0].dispose();
    expect(content.isDisposed).toBe(true);
    expect(a.isOpen).toBe(false);
  });
});

describe('TabDocumentManager: layout as JSON', () => {
  it('saves and loads back the tree, the sizes, the documents and what was active', () => {
    const m = manager();
    m.open(doc('A', { state: { line: 3 } }));
    const b = m.open(doc('B', { pinned: true }))!;
    const c = m.open(doc('C'))!;
    const right = m.split(m.groups[0], 'right', b)!;
    m.split(right, 'down', c);
    m.resizeGroup(m.groups[0], '40%');
    m.open(doc('D', { preview: true }), { group: m.groups[0] });
    m.activate(m.findDocument('a')!);
    m.focusGroup(1);
    const saved = m.saveLayout();
    const json = JSON.parse(JSON.stringify(saved));
    expect(json).toEqual(saved);
    expect(saved.activeGroup).toBe(1);
    const first = (saved.root as TabLayoutSplit).children[0];
    expect(first).toEqual({
      kind: 'group',
      documents: [
        { id: 'a', type: 'text', title: 'A', state: { line: 3 } },
        { id: 'd', type: 'text', title: 'D', preview: true },
      ],
      active: 0,
      recent: [0, 1],
    });

    const other = manager();
    const made: string[] = [];
    expect(other.loadLayout(json, (s) => (made.push(s.id), text(`restored ${s.title}`)))).toBe(true);
    expect(made).toEqual(['a', 'd', 'b', 'c']);
    expect(other.saveLayout()).toEqual(saved);
    expect(other.activeGroup).toBe(other.groups[1]);
    expect(other.findDocument('a')!.state).toEqual({ line: 3 });
    expect(other.findDocument('b')!.pinned).toBe(true);
    expect(other.findDocument('a')!.contentComponent!.element.textContent).toBe('restored A');
    expect(other.groups.map((g) => g.documents.length)).toEqual([2, 1, 1]);
  });

  it('a factory may return the document or its options; null leaves one out; a maximized group comes back', () => {
    const m = manager();
    m.open(doc('A'));
    m.open(doc('B'));
    const right = m.split(m.groups[0], 'right', m.findDocument('b')!)!;
    m.maximizeGroup(right);
    const saved = m.saveLayout();
    expect(saved.maximizedGroup).toBe(1);
    const other = manager({ closeEmptyGroups: false });
    other.loadLayout(saved, (s) => (s.id === 'a' ? new TabDocument({ ...s, icon: '/a.svg' }) : { description: 'again' }));
    expect(other.findDocument('a')!.icon).toBe('/a.svg');
    expect(other.findDocument('b')!.description).toBe('again');
    expect(other.maximizedGroup).toBe(other.groups[1]);
    const third = manager();
    third.loadLayout(saved, (s) => (s.id === 'a' ? null : text('b')));
    expect(third.documents.map((d) => d.id)).toEqual(['b']);
  });

  it('loading replaces what was there and can be cancelled', async () => {
    const m = manager();
    const old = m.open(doc('Old'))!;
    const content = old.contentComponent!;
    m.onLayoutChanging((e) => (e.cancel = e.change === 'load' && !m.findDocument('ok')));
    const layout = { version: 1 as const, root: { kind: 'group' as const, documents: [{ id: 'new', type: 't', title: 'New' }], active: 0, recent: [0] }, activeGroup: 0, maximizedGroup: null };
    expect(m.loadLayout(layout)).toBe(false);
    m.open(doc('OK'));
    expect(m.loadLayout(layout)).toBe(true);
    expect(old.isOpen).toBe(false);
    await settle();
    expect(content.isDisposed).toBe(true);
    expect(m.documents.map((d) => d.title)).toEqual(['New']);
    expect(m.groups).toHaveLength(1);
  });
});

describe('TabDocumentManager: keys', () => {
  it('Ctrl+PageDown / PageUp go round the tabs, Ctrl+W closes the active one', async () => {
    const m = manager({ openPosition: 'end' });
    m.open(doc('A'));
    m.open(doc('B'));
    m.open(doc('C'));
    headers(m)[2].focus();
    expect(press('PageDown', { ctrlKey: true })).toBe(true);
    expect(m.activeDocument?.title).toBe('A');
    expect(document.activeElement).toBe(headers(m)[0]);
    press('PageUp', { ctrlKey: true });
    expect(m.activeDocument?.title).toBe('C');
    press('w', { ctrlKey: true });
    await settle();
    expect(titles(m)).toEqual(['A', 'B']);
  });

  it('arrows, Home and End move along the strip; Delete closes the focused tab', async () => {
    const m = manager({ openPosition: 'end' });
    m.open(doc('A'));
    m.open(doc('B'));
    m.open(doc('C'));
    m.activate(m.findDocument('a')!);
    headers(m)[0].focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(headers(m)[1]);
    expect(m.activeDocument?.title).toBe('B');
    press('End');
    expect(m.activeDocument?.title).toBe('C');
    press('ArrowRight');
    expect(m.activeDocument?.title).toBe('A');
    m.activation = 'manual';
    press('ArrowLeft');
    expect(document.activeElement).toBe(headers(m)[2]);
    expect(m.activeDocument?.title).toBe('A');
    press('Delete');
    await settle();
    expect(titles(m)).toEqual(['A', 'B']);
    press('Home');
    expect(document.activeElement).toBe(headers(m)[0]);
  });

  it('Ctrl+\\ splits right, Ctrl+1..9 focus a group', () => {
    const m = manager();
    m.open(doc('A'));
    m.open(doc('B'));
    headers(m)[1].focus();
    press('\\', { ctrlKey: true });
    expect(m.groups).toHaveLength(2);
    expect(m.groups[1].documents.map((d) => d.title)).toEqual(['B']);
    expect(m.activeGroup).toBe(m.groups[1]);
    expect(m.groups[1].element.contains(document.activeElement)).toBe(true);
    press('1', { ctrlKey: true });
    expect(m.activeGroup).toBe(m.groups[0]);
    expect(m.groups[0].element.contains(document.activeElement)).toBe(true);
    expect(press('5', { ctrlKey: true })).toBe(false);
  });

  it('every key is an option', async () => {
    const m = manager({ keys: { closeTab: ['Alt+X'], nextTab: [], closeFocusedTab: ['Backspace'] } });
    m.open(doc('A'));
    m.open(doc('B'));
    headers(m)[1].focus();
    expect(headers(m)[1].getAttribute('aria-keyshortcuts')).toBe('Backspace');
    expect(press('PageDown', { ctrlKey: true })).toBe(false);
    press('Delete');
    press('w', { ctrlKey: true });
    await settle();
    expect(titles(m)).toEqual(['A', 'B']);
    press('Backspace');
    await settle();
    expect(titles(m)).toEqual(['A']);
    headers(m)[0].focus();
    press('x', { altKey: true });
    await settle();
    expect(titles(m)).toEqual([]);
    expect(TabDocumentManager.desktopKeys.closeTab).toEqual(['Ctrl+W', 'Ctrl+F4']);
    expect(TabDocumentManager.browserKeys.closeTab).toEqual(['Ctrl+Alt+W', 'Ctrl+W']);
  });

  it('keys do nothing outside the manager', () => {
    const m = manager();
    m.open(doc('A'));
    m.open(doc('B'));
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    expect(press('PageDown', { ctrlKey: true })).toBe(false);
    expect(m.activeDocument?.title).toBe('B');
  });
});

describe('TabDocumentManager: texts and announcements', () => {
  it('writes its texts from uiLocale, texts over them', async () => {
    const m = manager({ texts: { tabDocsEmpty: 'Nothing here' } });
    const group = m.groups[0];
    expect(group.element.querySelector('.mx-tabdocs__empty')!.textContent).toBe('Nothing here');
    await uiLocale.use('tr');
    await settle();
    expect(group.element.getAttribute('aria-label')).toBe('1. grup');
    m.texts = {};
    await settle();
    expect(group.element.querySelector('.mx-tabdocs__empty')!.textContent).toBe('Açık belge yok');
  });

  it('announces politely what happened', async () => {
    const m = manager();
    const live = m.element.querySelector('[aria-live="polite"]')!;
    const a = m.open(doc('Notes'))!;
    await settle();
    expect(live.textContent).toBe('Notes opened');
    await m.close(a);
    await settle();
    expect(live.textContent).toBe('Notes closed');
    m.announce = false;
    m.open(doc('Quiet'));
    await settle();
    expect(live.textContent).toBe('Notes closed');
  });

  it('runs the events given as props', () => {
    const opened = vi.fn();
    const changed = vi.fn();
    const m = manager({ onOpened: opened, onLayoutChanged: changed });
    m.open(doc('A'));
    m.split(m.groups[0], 'down');
    expect(opened).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0].change).toBe('split');
  });
});
