import { Component } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { TestButton, TestWindow } from '../../tests/controls';
import { Control } from './control';
import { addShortcut, parseChord, parseShortcut } from './keyboard';
import { parseAccessKey } from './access-key';

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

let hosts: Component[] = [];
let removers: (() => void)[] = [];

afterEach(async () => {
  for (const r of removers.splice(0)) r();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

/** Presses a key on the focused element (or body), the way a user would. */
function press(key: string, mods: Partial<KeyboardEventInit> = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...mods });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

class Panel extends Control<HTMLDivElement> {}

describe('parseChord', () => {
  it('reads modifiers, aliases and the plus key', () => {
    expect(parseChord('Ctrl+Shift+S')).toMatchObject({ ctrl: true, shift: true, alt: false, key: 's' });
    expect(parseChord('alt+up')).toMatchObject({ alt: true, key: 'arrowup' });
    expect(parseChord('Ctrl++')).toMatchObject({ ctrl: true, key: '+' });
    expect(parseChord('F2')).toMatchObject({ key: 'f2' });
    expect(() => parseChord('Ctrl+')).not.toThrow();
    expect(() => parseChord('Ctrl')).toThrow();
  });
});

describe('addShortcut', () => {
  it('fires an app-wide shortcut and stops the key there', async () => {
    let saves = 0;
    removers.push(addShortcut('Ctrl+S', () => void saves++));
    page(<input name="field" />);
    document.querySelector<HTMLInputElement>('[name=field]')!.focus();
    expect(press('s', { ctrlKey: true })).toBe(true);
    expect(press('s')).toBe(false); // typing an s is not the shortcut
    expect(saves).toBe(1);
  });

  it('matches letters by physical key on other layouts', () => {
    let hits = 0;
    removers.push(addShortcut('Ctrl+S', () => void hits++));
    press('ы', { ctrlKey: true, code: 'KeyS' });
    expect(hits).toBe(1);
  });

  it('prefers the most specific scope holding focus, and falls through on false', async () => {
    const calls: string[] = [];
    const inner = new Panel({ childs: [<input name="x" />] });
    const outer = new Panel({ childs: [inner] });
    page(outer);
    await settle();
    removers.push(addShortcut('Ctrl+D', () => void calls.push('app')));
    removers.push(addShortcut('Ctrl+D', () => void calls.push('outer'), { scope: outer }));
    removers.push(addShortcut('Ctrl+D', () => (calls.push('inner'), false), { scope: inner }));
    outer.element.querySelector<HTMLInputElement>('[name=x]')!.focus();
    press('d', { ctrlKey: true });
    expect(calls).toEqual(['inner', 'outer']);
  });

  it('skips a scope that is disabled or does not hold focus', async () => {
    let hits = 0;
    const scoped = new Panel({ childs: [<input name="x" />] });
    page(scoped, <input name="elsewhere" />);
    await settle();
    removers.push(addShortcut('Ctrl+E', () => void hits++, { scope: scoped }));
    document.querySelector<HTMLInputElement>('[name=elsewhere]')!.focus();
    press('e', { ctrlKey: true });
    scoped.element.querySelector<HTMLInputElement>('[name=x]')!.focus();
    scoped.enabled = false; // focus moves on; the scope is disabled anyway
    scoped.element.querySelector<HTMLInputElement>('[name=x]')!.focus();
    press('e', { ctrlKey: true });
    expect(hits).toBe(0);
  });

  it('leaves text fields alone for plain keys unless asked', async () => {
    let deletes = 0;
    removers.push(addShortcut('Delete', () => void deletes++));
    page(<input name="field" />, <button type="button">b</button>);
    document.querySelector<HTMLInputElement>('[name=field]')!.focus();
    press('Delete');
    expect(deletes).toBe(0);
    document.querySelector<HTMLButtonElement>('button')!.focus();
    press('Delete');
    expect(deletes).toBe(1);
  });

  it('is silent while a modal window is open, except inside it', async () => {
    const calls: string[] = [];
    removers.push(addShortcut('Ctrl+K', () => void calls.push('app')));
    const host = page();
    const win = new TestWindow({ childs: [<input name="in-modal" />] });
    win.open(host);
    await settle();
    win.addShortcut('Ctrl+K', () => void calls.push('window'));
    win.element.querySelector<HTMLInputElement>('[name=in-modal]')!.focus();
    press('k', { ctrlKey: true });
    expect(calls).toEqual(['window']);
    await win.close();
    await settle();
    press('k', { ctrlKey: true });
    expect(calls).toEqual(['window', 'app']);
  });

  it('Control.addShortcut goes away with the control', async () => {
    let hits = 0;
    const panel = new Panel({ childs: [<input name="x" />] });
    const host = page(panel);
    await settle();
    panel.addShortcut('Ctrl+J', () => void hits++);
    panel.element.querySelector<HTMLInputElement>('[name=x]')!.focus();
    press('j', { ctrlKey: true });
    await panel.dispose();
    host.element.append(panel.element); // even if the element were still around
    press('j', { ctrlKey: true });
    expect(hits).toBe(1);
  });

  it('runs two chords in a row, in a text field too, and takes the key that ends nothing', async () => {
    const calls: string[] = [];
    removers.push(addShortcut('Ctrl+K W', () => void calls.push('close all')));
    removers.push(addShortcut('Ctrl+K Ctrl+P', () => void calls.push('list')));
    removers.push(addShortcut('Ctrl+K Shift+Enter', () => void calls.push('pin')));
    expect(parseShortcut('Ctrl + S')).toHaveLength(1);
    expect(parseShortcut('Ctrl+K Ctrl+W')).toHaveLength(2);
    page(<input name="field" />);
    document.querySelector<HTMLInputElement>('[name=field]')!.focus();
    expect(press('k', { ctrlKey: true })).toBe(true);
    expect(press('Control', { ctrlKey: true })).toBe(false); // a modifier alone keeps it waiting
    expect(press('w')).toBe(true);
    press('k', { ctrlKey: true });
    press('p', { ctrlKey: true });
    press('k', { ctrlKey: true });
    press('Enter', { shiftKey: true });
    expect(calls).toEqual(['close all', 'list', 'pin']);
    press('k', { ctrlKey: true });
    expect(press('x')).toBe(true);
    expect(press('w')).toBe(false); // a plain key alone starts nothing in a text field
    expect(calls).toHaveLength(3);
  });

  it('leaves a Ctrl+Alt chord alone when AltGr typed a character with it', () => {
    let hits = 0;
    removers.push(addShortcut('Ctrl+Alt+7', () => void hits++));
    removers.push(addShortcut('Ctrl+Alt+W', () => void hits++));
    press('7', { ctrlKey: true, altKey: true, code: 'Digit7' });
    press('{', { ctrlKey: true, altKey: true, code: 'Digit7' });
    press('w', { ctrlKey: true, altKey: true, code: 'KeyW' });
    press('ц', { ctrlKey: true, altKey: true, code: 'KeyW' });
    expect(hits).toBe(3);
  });
});

describe('access keys (&Text)', () => {
  it('parses markers and escapes', () => {
    expect(parseAccessKey('&Dosya')).toEqual({ text: 'Dosya', key: 'D', index: 0 });
    expect(parseAccessKey('Save &as…')).toEqual({ text: 'Save as…', key: 'a', index: 5 });
    expect(parseAccessKey('Tom && Jerry')).toEqual({ text: 'Tom & Jerry', key: null, index: -1 });
    expect(parseAccessKey('A&&B &C')).toEqual({ text: 'A&B C', key: 'C', index: 4 });
    expect(parseAccessKey('Trailing&')).toEqual({ text: 'Trailing&', key: null, index: -1 });
  });

  it('renders the key underlinable, keeps the plain name, and announces Alt+key', async () => {
    const b = new TestButton({ text: '&Kaydet' });
    page(b);
    await settle();
    expect(b.element.textContent).toBe('Kaydet');
    expect(b.element.querySelector('.mx-access-key')!.textContent).toBe('K');
    expect(b.element.getAttribute('aria-keyshortcuts')).toBe('Alt+K');

    b.text = 'Save';
    expect(b.element.textContent).toBe('Save');
    expect(b.element.hasAttribute('aria-keyshortcuts')).toBe(false);
  });

  it('clicks a button on Alt + its key, but not on AltGr', async () => {
    let clicks = 0;
    const b = new TestButton({ text: '&Save' });
    b.motif.on('click', () => clicks++);
    page(b, <input name="field" />);
    await settle();
    document.querySelector<HTMLInputElement>('[name=field]')!.focus();
    press('q', { altKey: true, ctrlKey: true }); // AltGr+Q types @ on a Turkish keyboard
    expect(press('s', { altKey: true })).toBe(true);
    expect(clicks).toBe(1);
    expect(document.activeElement).toBe(b.element);
  });

  it('moves focus between controls sharing a key instead of clicking', async () => {
    let clicks = 0;
    const one = new TestButton({ text: '&Open' });
    const two = new TestButton({ text: '&Other' });
    one.motif.on('click', () => clicks++);
    two.motif.on('click', () => clicks++);
    page(one, two);
    await settle();
    press('o', { altKey: true });
    expect(document.activeElement).toBe(one.element);
    press('o', { altKey: true });
    expect(document.activeElement).toBe(two.element);
    expect(clicks).toBe(0);
  });

  it('ignores disabled controls and works for plain elements with aria-keyshortcuts', async () => {
    const off = new TestButton({ text: '&Name', enabled: false });
    page(off, <input name="n" aria-keyshortcuts="Alt+N" />);
    await settle();
    press('n', { altKey: true });
    expect(document.activeElement).toBe(document.querySelector('[name=n]'));
  });

  it('only uses the keys of the modal window while one is open', async () => {
    let pageClicks = 0;
    const pageButton = new TestButton({ text: '&Print' });
    pageButton.motif.on('click', () => pageClicks++);
    const host = page(pageButton);
    const win = new TestWindow({ childs: [<input name="p" aria-keyshortcuts="Alt+P" />] });
    win.open(host);
    await settle();
    press('p', { altKey: true });
    expect(pageClicks).toBe(0);
    expect(document.activeElement).toBe(win.element.querySelector('[name=p]'));
    await win.close();
  });

  it('shows the access keys while Alt is held, and after a tap until the next action', async () => {
    page(new TestButton({ text: '&Save' }));
    await settle();
    const shown = () => document.documentElement.hasAttribute('data-mx-alt');
    const altDown = () => press('Alt', { altKey: true });
    const altUp = () => {
      const e = new KeyboardEvent('keyup', { key: 'Alt', bubbles: true, cancelable: true });
      document.body.dispatchEvent(e);
      return e.defaultPrevented;
    };

    // Held, then used in a chord: hidden on release.
    altDown();
    expect(shown()).toBe(true);
    press('x', { altKey: true });
    altUp();
    expect(shown()).toBe(false);

    // Tapped: kept from the browser (which would take focus to its menu) and stays shown.
    expect(altDown()).toBe(true);
    expect(altUp()).toBe(true);
    expect(shown()).toBe(true);
    // Tapped again: hidden.
    altDown();
    altUp();
    expect(shown()).toBe(false);

    // Tapped, then another key or the pointer hides it.
    altDown();
    altUp();
    press('a');
    expect(shown()).toBe(false);
    altDown();
    altUp();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(shown()).toBe(false);
  });

  it('leaves the Alt tap to the browser when the page has no access keys', async () => {
    page(new TestButton({ text: 'Plain' }));
    removers.push(addShortcut('Ctrl+Q', () => {})); // installs the listener
    await settle();
    expect(press('Alt', { altKey: true })).toBe(false);
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt', bubbles: true }));
  });

  it('uses Control + Option on Apple platforms, where Option alone types characters', async () => {
    const platform = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
    Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
    try {
      let clicks = 0;
      const b = new TestButton({ text: '&Save' });
      b.motif.on('click', () => clicks++);
      page(b);
      await settle();
      expect(b.element.getAttribute('aria-keyshortcuts')).toBe('Control+Alt+S');
      // Option+S types ß: neither that nor Option alone is an access key here.
      expect(press('ß', { altKey: true, code: 'KeyS' })).toBe(false);
      expect(clicks).toBe(0);
      // Control+Option+S: the key reports ß too, the physical key is S.
      press('Control', { ctrlKey: true, altKey: true });
      expect(document.documentElement.hasAttribute('data-mx-alt')).toBe(true);
      expect(press('ß', { altKey: true, ctrlKey: true, code: 'KeyS' })).toBe(true);
      expect(clicks).toBe(1);
      document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', bubbles: true }));
      expect(document.documentElement.hasAttribute('data-mx-alt')).toBe(false);
    } finally {
      delete (navigator as unknown as Record<string, unknown>).platform;
      if (platform) Object.defineProperty(Navigator.prototype, 'platform', platform);
    }
  });
});

describe('focus guard', () => {
  it('moves focus on when a focused control is removed', async () => {
    const doomed = new TestButton({ text: 'Doomed' });
    const next = new TestButton({ text: 'Next' });
    page(new Panel({ childs: [doomed] }), next);
    await settle();
    doomed.element.focus();
    // jsdom does not fire focusout on removal like browsers do: fire it, then remove.
    doomed.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    doomed.element.remove();
    await settle();
    expect(document.activeElement).toBe(next.element);
  });

  it('leaves focus alone after a click on an empty spot', async () => {
    const b = new TestButton({ text: 'Stay' });
    page(b);
    await settle();
    b.element.focus();
    b.element.blur(); // fires focusout with the element still there
    await settle();
    expect(document.activeElement).toBe(document.body);
  });
});
