import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { TabDocument } from './TabDocument';
import { TabDocumentManager } from './TabDocumentManager';
import type { TabDocumentManagerProps } from './tab-document-manager-props';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

function manager(props: TabDocumentManagerProps = {}) {
  const m = new TabDocumentManager(props);
  hosts.push(mountHost(m));
  return m;
}

function doc(title: string, extra: ConstructorParameters<typeof TabDocument>[0] = {}) {
  return new TabDocument({ id: title.toLowerCase(), type: 'text', title, content: () => new Component<HTMLDivElement>('div'), ...extra });
}

function press(key: string, init: KeyboardEventInit = {}, type: 'keydown' | 'keyup' = 'keydown') {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const popup = (m: TabDocumentManager) => Array.from(m.element.querySelectorAll<HTMLElement>('.mx-tabdocs__popup')).find((p) => !p.hidden)!;
const documentItems = (m: TabDocumentManager) => Array.from(popup(m).querySelectorAll<HTMLButtonElement>('.mx-tabdocs__documents > .mx-menu__item'));
const commandItems = (m: TabDocumentManager) => Array.from(popup(m).querySelectorAll<HTMLButtonElement>('.mx-tabdocs__commands > .mx-menu__item'));
const label = (item: Element) => item.querySelector('.mx-menu__label')!.textContent;
const focused = () => {
  const item = document.activeElement!.closest('.mx-menu__item');
  return item ? label(item) : document.activeElement!.tagName.toLowerCase();
};
const search = (m: TabDocumentManager) => popup(m).querySelector<HTMLInputElement>('.mx-tabdocs__search input')!;

/** A group with index.ts (src), app.ts (src, unsaved), R&D.md; app.ts shown. */
async function three(props: TabDocumentManagerProps = {}) {
  const m = manager(props);
  m.open(doc('index.ts', { description: 'src' }));
  m.open(doc('app.ts', { description: 'src', dirty: true }));
  m.open(doc('R&D.md', { tooltip: 'Research notes' }));
  m.activate(m.findDocument('app.ts')!);
  await settle();
  return m;
}

describe('TabDocumentManager: the "…" menu of documents', () => {
  it('draws the documents as items of the same menu as its commands, a line between them, no list box', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    const p = popup(m);
    expect(p.querySelector('[role="listbox"], [role="option"], .mx-list-box')).toBeNull();
    expect(Array.from(p.querySelectorAll(':scope .mx-menu')).map((menu) => menu.className)).toEqual(['mx-tabdocs__documents mx-menu', 'mx-tabdocs__commands mx-menu']);
    expect(documentItems(m).map(label)).toEqual(['index.ts', 'app.ts', 'R&D.md']);
    expect(commandItems(m).map(label)).toEqual(['Close all', 'Close saved', 'Lock group']);
    // The commands keep the documents' mark column: their texts line up.
    expect(p.querySelector('.mx-tabdocs__commands')!.hasAttribute('data-icons')).toBe(true);
    const between = p.querySelector('.mx-tabdocs__list')!.nextElementSibling as HTMLElement;
    expect([between.className, between.getAttribute('role'), between.hidden]).toEqual(['mx-menu__separator', 'separator', false]);
  });

  it('marks the shown document as the chosen item, with its description as the secondary text, its tooltip and its unsaved mark', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    const [index, app, notes] = documentItems(m);
    expect(documentItems(m).map((i) => [i.getAttribute('role'), i.getAttribute('aria-checked')])).toEqual([
      ['menuitemradio', 'false'],
      ['menuitemradio', 'true'],
      ['menuitemradio', 'false'],
    ]);
    expect(app.querySelector('.mx-menu__check svg')).not.toBeNull();
    expect(index.querySelector('.mx-menu__check svg')).toBeNull();
    expect(index.querySelector('.mx-menu__description')!.textContent).toBe('src');
    expect(notes.querySelector('.mx-menu__description')).toBeNull();
    expect(index.hasAttribute('aria-keyshortcuts')).toBe(false);
    expect([index.title, notes.title]).toEqual(['index.ts — src', 'Research notes']);
    // The name says what the eyes see: the title, the description, unsaved changes.
    expect(app.textContent).toBe('app.ts src, unsaved changes');
    expect(app.querySelector('.mx-tabdocs__list-dirty')).not.toBeNull();
    expect(index.querySelector('.mx-tabdocs__list-dirty')).toBeNull();
    // An & in a title is a letter, not a key.
    expect(notes.querySelector('.mx-menu__label u')).toBeNull();
  });

  it('says which group each document is in when it lists every group', async () => {
    const m = manager({ openListScope: 'all' });
    m.open(doc('A', { description: 'src' }));
    m.split(m.groups[0], 'right', m.open(doc('B'))!);
    await settle();
    m.showOpenList(m.groups[0]);
    await settle();
    expect(documentItems(m).map((i) => i.querySelector('.mx-menu__description')!.textContent)).toEqual(['src · group 1', 'group 2']);
    expect(documentItems(m).map((i) => i.getAttribute('aria-checked'))).toEqual(['true', 'false']);
  });

  it('filters the documents as the search is typed in, shows a dimmed "No items" when none has it, and Enter there opens the first', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    const box = search(m);
    expect(document.activeElement).toBe(box);
    expect(box.type).toBe('search');
    box.value = 'TS';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(documentItems(m).map(label)).toEqual(['index.ts', 'app.ts']);
    expect(documentItems(m)[1].getAttribute('aria-checked')).toBe('true');
    box.value = 'zzz';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(documentItems(m).map((i) => [label(i), i.getAttribute('aria-disabled')])).toEqual([['No items', 'true']]);
    expect(press('Enter')).toBe(false);
    box.value = 'r&';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(press('Enter')).toBe(true);
    await settle();
    expect(m.activeDocument!.title).toBe('R&D.md');
    expect(m.element.querySelector('.mx-tabdocs__popup:not([hidden])')).toBeNull();
  });

  it('Down goes from the search into the documents, on to the commands and around; Up goes back', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    const walked: string[] = [];
    for (let i = 0; i < 7; i++) {
      press('ArrowDown');
      walked.push(focused());
    }
    expect(walked).toEqual(['index.ts', 'app.ts', 'R&D.md', 'Close all', 'Close saved', 'Lock group', 'input']);
    press('ArrowUp');
    expect(focused()).toBe('Lock group');
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowUp');
    expect(focused()).toBe('input');
  });

  it('typing on a document goes back to the search with what was typed; Backspace too', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    press('ArrowDown');
    expect(press('a')).toBe(true);
    await settle();
    expect(document.activeElement).toBe(search(m));
    expect(search(m).value).toBe('a');
    expect(documentItems(m).map(label)).toEqual(['app.ts']);
    press('ArrowDown');
    press('Backspace');
    await settle();
    expect([document.activeElement, search(m).value]).toEqual([search(m), '']);
    expect(documentItems(m)).toHaveLength(3);
    // Space chooses a focused item, as in any menu: it is not typed.
    press('ArrowDown');
    expect(press(' ')).toBe(false);
  });

  it('Tab goes from the search to the documents and the commands; Shift+Tab comes back to the last item', async () => {
    const m = await three();
    m.showOpenList();
    await settle();
    expect(press('Tab')).toBe(true);
    expect(focused()).toBe('index.ts');
    press('Tab');
    expect(focused()).toBe('Close all');
    // From the last part Tab goes on out of the menu.
    expect(press('Tab')).toBe(false);
    press('Tab', { shiftKey: true });
    expect(focused()).toBe('R&D.md');
    press('Tab', { shiftKey: true });
    expect(focused()).toBe('input');
  });

  it('Enter on a document opens it and closes the menu; Escape closes it and focus goes back', async () => {
    const m = await three();
    const strip = m.groups[0].element.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')!;
    strip.focus();
    m.showOpenList();
    await settle();
    press('Escape');
    await settle();
    expect(m.element.querySelector('.mx-tabdocs__popup:not([hidden])')).toBeNull();
    expect(document.activeElement).toBe(strip);
    m.showOpenList();
    await settle();
    press('ArrowDown');
    expect(press('Enter')).toBe(true);
    await settle();
    expect(m.activeDocument!.title).toBe('index.ts');
    expect(m.element.querySelector('.mx-tabdocs__popup:not([hidden])')).toBeNull();
  });

  it('with the documents first in a compact bar, Shift+Tab from the search reaches the commands at their last one', async () => {
    const m = manager();
    m.open(doc('A'));
    m.dock(doc('Tool'), 'left');
    m.dock(doc('Tool 2'), 'left');
    await settle();
    m.showOpenList(m.dockArea('left')!.groups[0]);
    await settle();
    expect(document.activeElement).toBe(search(m));
    press('Tab', { shiftKey: true });
    expect(document.activeElement).toBe(commandItems(m).at(-1));
    press('ArrowDown');
    expect(focused()).toBe('input');
  });
});

describe('TabDocumentManager: the recently used menu', () => {
  it('is the same menu, without a search, the shown document marked, walked while the key is held', async () => {
    const m = manager();
    const [a, , c] = ['A', 'B', 'C'].map((t) => m.open(doc(t))!);
    m.activate(a);
    m.activate(c);
    m.groups[0].element.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')!.focus();
    expect(press('e', { ctrlKey: true })).toBe(true);
    await settle();
    const p = popup(m);
    expect(p.querySelector('input, [role="listbox"]')).toBeNull();
    expect(p.querySelectorAll('.mx-menu')).toHaveLength(1);
    expect(documentItems(m).map(label)).toEqual(['C', 'A', 'B']);
    expect(documentItems(m).map((i) => i.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    expect(focused()).toBe('A');
    press('e', { ctrlKey: true });
    expect(focused()).toBe('B');
    press('e', { ctrlKey: true });
    expect(focused()).toBe('C');
    // Plain arrows walk it too, and typing goes to the item that starts with the letter.
    press('ArrowUp');
    expect(focused()).toBe('B');
    press('a');
    expect(focused()).toBe('A');
    press('Control', {}, 'keyup');
    await settle();
    expect(m.activeDocument).toBe(a);
  });
});
