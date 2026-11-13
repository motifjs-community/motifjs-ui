import { Component, errorHandler } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../tests/helpers';
import { MenuBar } from '../components/menubar/MenuBar';
import { commands } from './command-registry';
import { Control } from './control';
import { addShortcut } from './keyboard';
import type { ShortcutConflict } from './shortcut-conflict';
import { shortcuts } from './shortcut-registry';

let hosts: Component[] = [];
let removers: (() => void)[] = [];

afterEach(async () => {
  for (const r of removers.splice(0)) r();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  shortcuts.warnings = true;
  shortcuts.keymap = null;
  vi.restoreAllMocks();
});

class Panel extends Control<HTMLDivElement> {}

describe('shortcuts', () => {
  it('lists every shortcut with its name: commands, the app’s own, the components’', async () => {
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', run: () => {} }));
    removers.push(addShortcut('F5', () => {}, { name: 'reload' }));
    const bar = new MenuBar({ items: [{ text: 'File' }], focusOnF10: true });
    hosts.push(mountHost(bar));
    const list = shortcuts.list();
    expect(list.find((s) => s.name === 'save')).toMatchObject({ keys: ['Mod+S'], text: 'Save', scope: null, customizable: true });
    expect(list.find((s) => s.name === 'reload')).toMatchObject({ keys: ['F5'], text: 'reload', category: '' });
    expect(list.find((s) => s.name === 'menuBar.focus')).toMatchObject({ keys: ['F10'], text: 'Go to the menu bar', category: 'Menu bar' });
  });

  it('gives the user’s keys to every shortcut with the name, a component’s too, and lists a command without keys', () => {
    const ran: string[] = [];
    const press = (key: string, init: KeyboardEventInit) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
    removers.push(addShortcut(['F5', 'Ctrl+R'], () => void ran.push('reload'), { name: 'reload', text: () => 'Reload', category: 'View' }));
    removers.push(addShortcut('F6', () => void ran.push('fixed'), { name: 'fixed', customizable: false }));
    removers.push(commands.add({ key: 'find', text: '&Find', run: () => void ran.push('find') }));
    press('F5', {});
    press('r', { ctrlKey: true });
    expect(ran).toEqual(['reload', 'reload']);
    shortcuts.assign('reload', ['Shift+F5']);
    shortcuts.assign('fixed', ['F7']);
    shortcuts.assign('find', ['Ctrl+F']);
    press('F5', {});
    press('F5', { shiftKey: true });
    press('F7', {});
    press('F6', {});
    press('f', { ctrlKey: true });
    expect(ran).toEqual(['reload', 'reload', 'reload', 'fixed', 'find']);
    const reload = shortcuts.list().find((s) => s.name === 'reload')!;
    expect(reload).toMatchObject({ keys: ['Shift+F5'], defaults: ['F5', 'Ctrl+R'], text: 'Reload', category: 'View' });
    expect(shortcuts.list().find((s) => s.name === 'fixed')).toMatchObject({ keys: ['F6'], customizable: false });
    expect(shortcuts.keysOf('reload')).toEqual(['Shift+F5']);
    shortcuts.assign('reload', null);
    expect(shortcuts.keysOf('reload')).toEqual(['F5', 'Ctrl+R']);
  });

  it('a component’s shortcut added later takes the keys the user gave before', () => {
    const ran: string[] = [];
    shortcuts.keymap = { later: ['Ctrl+Alt+L'] };
    removers.push(addShortcut('Ctrl+L', () => void ran.push('later'), { name: 'later' }));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, altKey: true, bubbles: true, cancelable: true }));
    expect(ran).toEqual(['later']);
  });

  it('tells when a shortcut added takes keys already taken in the same place, not in a narrower one', () => {
    // Told through the app's error handling (shown in development).
    const warn = vi.spyOn(errorHandler, 'reportSuppressed').mockImplementation(() => {});
    const told: ShortcutConflict[] = [];
    const listening = shortcuts.onConflict((c) => void told.push(c));
    const panel = new Panel();
    hosts.push(mountHost(panel));
    removers.push(addShortcut('Ctrl+S', () => {}, { name: 'first' }));
    removers.push(addShortcut('Ctrl+S', () => {}, { name: 'narrow', scope: panel }));
    expect(told).toHaveLength(0);
    removers.push(addShortcut('ctrl+s', () => {}, { name: 'second' }));
    removers.push(addShortcut('Ctrl+K W', () => {}, { name: 'long' }));
    removers.push(addShortcut('Ctrl+K', () => {}, { name: 'short' }));
    listening.dispose();
    expect(told.map((c) => `${c.reason}:${c.shortcuts.map((s) => s.name).join('/')}`)).toEqual(['same:first/second', 'prefix:long/short']);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(shortcuts.takenBy('Ctrl+S').map((s) => s.name)).toEqual(['first', 'second']);
    expect(shortcuts.takenBy('Ctrl+S', panel).map((s) => s.name)).toEqual(['narrow']);
    expect(shortcuts.conflicts().map((c) => c.reason)).toEqual(['same', 'prefix']);
  });

  it('lets shortcuts of different parts of one place share keys, and runs each only in its part', () => {
    const warn = vi.spyOn(errorHandler, 'reportSuppressed').mockImplementation(() => {});
    const told: ShortcutConflict[] = [];
    const listening = shortcuts.onConflict((c) => void told.push(c));
    const tab = <button role="tab" />;
    const sash = <div class="sash" tabindex="0" />;
    const panel = new Panel({ childs: [tab, sash] });
    hosts.push(mountHost(panel));
    const ran: string[] = [];
    removers.push(addShortcut('Home', () => void ran.push('first tab'), { name: 'stripFirst', scope: panel, within: tab }));
    removers.push(addShortcut('Home', () => void ran.push('smallest'), { name: 'resizeMin', scope: panel, within: sash }));
    listening.dispose();
    expect(told).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    const home = (el: HTMLElement) => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    tab.element.focus();
    home(tab.element);
    sash.element.focus();
    home(sash.element);
    expect(ran).toEqual(['first tab', 'smallest']);
  });

  it('can keep quiet, and finds an Alt shortcut that takes an access key of the page', () => {
    const warn = vi.spyOn(errorHandler, 'reportSuppressed').mockImplementation(() => {});
    shortcuts.warnings = false;
    removers.push(addShortcut('Alt+F', () => {}, { name: 'find' }));
    removers.push(addShortcut('Alt+F', () => {}, { name: 'again' }));
    expect(warn).not.toHaveBeenCalled();
    const bar = new MenuBar({ items: [{ text: '&File', items: [{ text: 'New' }] }] });
    hosts.push(mountHost(bar));
    expect(shortcuts.conflicts().filter((c) => c.reason === 'accessKey').map((c) => c.shortcuts[0].name)).toEqual(['find', 'again']);
  });

  it('runs commands from the keys the user gave, shows them in menus, and forgets them again', async () => {
    const ran: string[] = [];
    const told: (string | null)[] = [];
    const listening = shortcuts.onKeymapChanged((e) => void told.push(e.name));
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', run: () => void ran.push('save') }));
    let bar!: MenuBar;
    hosts.push(mountHost(<MenuBar ref={(m: MenuBar) => (bar = m)} items={[{ key: 'file', text: 'File', items: [{ command: 'save' }] }]} />));
    const press = (key: string, init: KeyboardEventInit) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
    const shown = async () => {
      bar.open('file');
      await Promise.resolve();
      const text = bar.element.querySelector('.mx-menu__shortcut')?.textContent ?? '';
      bar.close();
      return text;
    };
    shortcuts.assign('save', ['Ctrl+Shift+S']);
    press('s', { ctrlKey: true });
    press('S', { ctrlKey: true, shiftKey: true });
    expect(ran).toEqual(['save']);
    expect(await shown()).toBe('Ctrl+Shift+S');
    expect(shortcuts.keymap).toEqual({ save: ['Ctrl+Shift+S'] });
    shortcuts.assign('save', []);
    press('S', { ctrlKey: true, shiftKey: true });
    expect(ran).toEqual(['save']);
    expect(await shown()).toBe('');
    shortcuts.keymap = null;
    press('s', { ctrlKey: true });
    expect(ran).toEqual(['save', 'save']);
    expect(await shown()).toBe('Ctrl+S');
    listening.dispose();
    expect(told).toEqual(['save', 'save', null]);
  });
});
