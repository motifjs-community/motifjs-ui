import { Component } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { TestButton } from '../../tests/controls';
import { ContextMenu } from '../components/contextmenu/ContextMenu';
import { MxForm } from '../components/form/MxForm';
import { ListBox } from '../components/listbox/ListBox';
import { addTooltip } from '../components/tooltip/add-tooltip';
import { Popup } from '../parts/popup/Popup';
import { Control } from './control';
import { watchDocument } from './document-watch';
import { deepActiveElement } from './focus';
import { installFocusGuard } from './focus-guard';
import { addShortcut } from './keyboard';
import { mirrorPage } from './mirror-page';
import { isElement, isHtmlElement, isNode } from './node-kind';
import { connectDocument, disconnectDocument, pageDocuments } from './page-documents';
import { ResizeWatch } from './resize-watch';
import { windowStack } from './window-stack';

// A same-origin <iframe> stands in for a window the app opened: a document of its own, with its
// own classes. Every kit part that acts on an element must use that element's document and window.

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

let frames: HTMLIFrameElement[] = [];
let stops: (() => void)[] = [];
let hosts: Component[] = [];

afterEach(async () => {
  for (const stop of stops.splice(0)) stop();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  for (const f of frames.splice(0)) {
    if (f.contentDocument) disconnectDocument(f.contentDocument);
    f.remove();
  }
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

/** Another window's document, connected to the page unless `connect` is false. */
function other(connect = true): Document {
  const f = document.createElement('iframe');
  document.body.append(f);
  frames.push(f);
  const doc = f.contentDocument!;
  if (connect) stops.push(connectDocument(doc));
  return doc;
}

/** A key pressed in a document, with that window's own event class. */
function press(target: Element, key: string, init: KeyboardEventInit = {}): boolean {
  const view = target.ownerDocument.defaultView!;
  const e = new view.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function button(doc: Document, text = 'Go'): HTMLButtonElement {
  const b = doc.createElement('button');
  b.textContent = text;
  doc.body.append(b);
  return b;
}

describe('kit: other documents', () => {
  it('node checks hold for another window\'s nodes, where instanceof does not', () => {
    const doc = other(false);
    const el = doc.createElement('div');
    expect(el instanceof Element).toBe(false);
    expect(isElement(el)).toBe(true);
    expect(isHtmlElement(el)).toBe(true);
    expect(isNode(doc.createTextNode('x'))).toBe(true);
    expect(isElement(doc.createTextNode('x'))).toBe(false);
    expect(isElement({ nodeType: 1 })).toBe(false);
  });

  it('connectDocument adds a document to the page\'s; it leaves when disconnected or when its window goes', () => {
    const doc = other(false);
    expect(pageDocuments()).toEqual([document]);
    const stop = connectDocument(doc);
    expect(pageDocuments()).toEqual([document, doc]);
    stop();
    expect(pageDocuments()).toEqual([document]);
    connectDocument(doc);
    doc.defaultView!.dispatchEvent(new Event('pagehide'));
    expect(pageDocuments()).toEqual([document]);
  });

  it('shortcuts and access keys work in a connected document, with its own key events', () => {
    const run = vi.fn(() => true);
    stops.push(addShortcut('Ctrl+S', run));
    const doc = other();
    const b = button(doc);
    b.focus();
    expect(press(b, 's', { ctrlKey: true })).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);
    // An access key in that document.
    const save = new TestButton({ text: '&Save' });
    save.build();
    doc.body.append(save.element);
    const click = vi.fn();
    save.element.addEventListener('click', click);
    press(b, 's', { altKey: true });
    expect(click).toHaveBeenCalledTimes(1);
    // Once disconnected, the document is the page's no more.
    disconnectDocument(doc);
    press(b, 's', { ctrlKey: true });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('a shortcut scoped to a component holds for its parts moved into another window', () => {
    class Panel extends Control<HTMLDivElement> {}
    const outer = new Panel();
    const inner = new Panel();
    hosts.push(mountHost(outer));
    outer.controls.add(inner);
    const run = vi.fn(() => true);
    stops.push(addShortcut('F2', run, { scope: outer }));
    const doc = other();
    doc.body.append(inner.element);
    const b = doc.createElement('button');
    inner.element.append(b);
    b.focus();
    press(b, 'F2');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('deepActiveElement finds focus in the document of a node, or in the window focus went to last', () => {
    const doc = other();
    const b = button(doc);
    b.focus();
    expect(deepActiveElement(b)).toBe(b);
    expect(deepActiveElement(doc)).toBe(b);
    b.dispatchEvent(new doc.defaultView!.FocusEvent('focusin', { bubbles: true }));
    expect(deepActiveElement()).toBe(b);
  });

  it('the focus guard keeps focus in another window when a focused control goes', async () => {
    installFocusGuard();
    const doc = other();
    class Box extends Control<HTMLButtonElement> {
      static override elementTag = 'button';
    }
    const box = new Box();
    box.build();
    doc.body.append(box.element);
    const next = button(doc, 'Next');
    box.element.focus();
    expect(doc.activeElement).toBe(box.element);
    // jsdom fires no focusout on removal as browsers do: that window's event, then the removal.
    box.element.dispatchEvent(new doc.defaultView!.FocusEvent('focusout', { bubbles: true }));
    box.element.remove();
    await settle();
    expect(doc.activeElement).toBe(next);
  });

  it('a tooltip shows for a target in another window, in that window', async () => {
    const doc = other();
    const target = button(doc, 'Help');
    stops.push(addTooltip(target, { text: 'Opens the guide', delay: 0 }));
    const e = new doc.defaultView!.MouseEvent('pointerover', { bubbles: true });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    target.dispatchEvent(e);
    await settle();
    const tip = doc.querySelector<HTMLElement>('.mx-tooltip');
    expect(tip).not.toBeNull();
    expect(tip!.hidden).toBe(false);
    expect(target.getAttribute('aria-describedby')).toBe(tip!.id);
    // Escape there closes it.
    press(target, 'Escape');
    expect(target.hasAttribute('aria-describedby')).toBe(false);
  });

  it('a popup opened at an anchor in another window goes there, and closes on a press outside it there', () => {
    const popup = new Popup();
    hosts.push(mountHost(popup));
    const doc = other();
    const anchor = button(doc, 'Open');
    popup.open(anchor);
    expect(popup.element.ownerDocument).toBe(doc);
    expect(popup.isOpen).toBe(true);
    const outside = button(doc, 'Elsewhere');
    outside.dispatchEvent(new doc.defaultView!.MouseEvent('pointerdown', { bubbles: true }));
    expect(popup.isOpen).toBe(false);
  });

  it('a context menu opened on an element in another window opens there; its keys work there', async () => {
    const doc = other();
    const target = button(doc, 'File');
    const chosen = vi.fn();
    const menu = new ContextMenu({ target, items: [{ text: 'Open' }, { text: 'Save', click: chosen }] });
    hosts.push(mountHost(menu));
    target.focus();
    target.dispatchEvent(new doc.defaultView!.MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 10, clientY: 10 }));
    await settle();
    expect(menu.opened).toBe(true);
    expect(menu.element.ownerDocument).toBe(doc);
    const items = Array.from(doc.querySelectorAll<HTMLElement>('.mx-menu__item'));
    expect(items.map((i) => i.textContent)).toEqual(['Open', 'Save']);
    items[0].focus();
    press(items[0], 'ArrowDown');
    expect(doc.activeElement).toBe(items[1]);
    items[1].click();
    expect(chosen).toHaveBeenCalled();
    expect(menu.opened).toBe(false);
  });

  it('a list of many takes a key of another window as a key (Space adds, a click replaces)', async () => {
    const list = new ListBox<string, string>({ items: ['a', 'b', 'c'], selectionMode: 'multiple', showCheckBoxes: false });
    hosts.push(mountHost(list));
    await settle();
    const doc = other();
    doc.body.append(list.element);
    const options = () => list.element.querySelectorAll<HTMLElement>('[role="option"]');
    options()[1].click();
    expect(list.value).toEqual(['b']);
    const listbox = list.element.querySelector<HTMLElement>('[role="listbox"]')!;
    press(listbox, 'ArrowDown');
    press(listbox, ' ');
    expect(list.value).toEqual(['b', 'c']);
  });

  it('each document stacks its own windows: one on top in each', () => {
    const doc = other();
    const a = { element: document.createElement('div'), setActive: vi.fn() };
    const b = { element: doc.createElement('div'), setActive: vi.fn() };
    document.body.append(a.element);
    doc.body.append(b.element);
    windowStack.bringToFront(a);
    windowStack.bringToFront(b);
    expect(windowStack.top(document)).toBe(a);
    expect(windowStack.top(doc)).toBe(b);
    expect(a.setActive).toHaveBeenLastCalledWith(true);
    expect(b.setActive).toHaveBeenLastCalledWith(true);
    windowStack.remove(a);
    windowStack.remove(b);
  });

  it("a form shown from a component in another window opens there, on top of that window's stack", async () => {
    const doc = other();
    const host = new Component<HTMLDivElement>('div');
    host.build();
    doc.body.append(host.element);
    hosts.push(host);
    const form = new MxForm({ title: 'Rename' });
    const done = form.showDialog(host);
    await settle();
    expect(form.element.ownerDocument).toBe(doc);
    expect(form.element.hasAttribute('open')).toBe(true);
    // A window of the page shown later does not take that window's top.
    const page = { element: document.createElement('div'), setActive: () => {} };
    document.body.append(page.element);
    windowStack.bringToFront(page);
    expect(windowStack.top(doc)?.element).toBe(form.element);
    windowStack.remove(page);
    form.close('cancel');
    expect(await done).toBe('cancel');
  });

  it('ResizeWatch moves a target to the observer of the window it is moved into', async () => {
    const doc = other();
    const watched: string[] = [];
    const fake = (name: string) =>
      class {
        constructor(private readonly cb: () => void) {}
        observe() {
          watched.push(`${name} observe`);
          this.cb();
        }
        unobserve() {
          watched.push(`${name} unobserve`);
        }
        disconnect() {}
      };
    vi.stubGlobal('ResizeObserver', fake('page'));
    (doc.defaultView as unknown as { ResizeObserver: unknown }).ResizeObserver = fake('frame');
    let calls = 0;
    const watch = new ResizeWatch(() => calls++);
    const el = document.createElement('div');
    document.body.append(el);
    watch.observe(el);
    expect(watched).toEqual(['page observe']);
    doc.body.append(el);
    await settle();
    expect(watched).toEqual(['page observe', 'page unobserve', 'frame observe']);
    expect(calls).toBe(2);
    watch.disconnect();
    vi.unstubAllGlobals();
  });

  it('watchDocument tells when an element moves into another window and back', async () => {
    const doc = other();
    const el = document.createElement('div');
    document.body.append(el);
    const seen: Document[] = [];
    stops.push(watchDocument(el, (d) => seen.push(d)));
    doc.body.append(el);
    await settle();
    document.body.append(el);
    await settle();
    expect(seen).toEqual([doc, document]);
  });

  it('mirrorPage copies the page\'s style sheets and root attributes, and follows them', async () => {
    const doc = other(false);
    const style = document.createElement('style');
    style.textContent = '.a { color: red }';
    document.head.append(style);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'data:text/css,.b{}';
    document.head.append(link);
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.designLanguage = 'material';
    document.body.className = 'docs';
    stops.push(mirrorPage(document, doc));
    const copies = () => Array.from(doc.head.querySelectorAll('style, link')).map((el) => el.textContent || el.getAttribute('href'));
    expect(copies()).toEqual(['.a { color: red }', 'data:text/css,.b{}']);
    expect(doc.documentElement.dataset.theme).toBe('dark');
    expect(doc.documentElement.dataset.designLanguage).toBe('material');
    expect(doc.body.className).toBe('docs');
    style.textContent = '.a { color: blue }';
    document.documentElement.dataset.theme = 'light';
    delete document.documentElement.dataset.designLanguage;
    link.remove();
    const added = document.createElement('style');
    added.textContent = '.c {}';
    document.head.append(added);
    await settle();
    expect(copies()).toEqual(['.a { color: blue }', '.c {}']);
    expect(doc.documentElement.dataset.theme).toBe('light');
    expect(doc.documentElement.hasAttribute('data-design-language')).toBe(false);
    style.remove();
    added.remove();
    document.documentElement.removeAttribute('data-theme');
    document.body.className = '';
  });
});
