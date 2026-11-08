import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { commands } from '../../core/command-registry';
import { Control } from '../../core/control';
import { addShortcut } from '../../core/keyboard';
import { shortcuts } from '../../core/shortcut-registry';
import { uiLocale } from '../../core/ui-locale';
import { TabDocumentManager } from '../tabdocs/TabDocumentManager';
import type { ShortcutEditorKeysChangedEventArgs } from './shortcut-editor-keys-changed-event-args';
import { ShortcutEditor } from './ShortcutEditor';

let hosts: Component[] = [];
let removers: (() => void)[] = [];

afterEach(async () => {
  for (const r of removers.splice(0)) r();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  shortcuts.keymap = null;
  await uiLocale.use('en');
  vi.restoreAllMocks();
});

class Panel extends Control<HTMLDivElement> {}

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle(rounds = 8) {
  for (let i = 0; i < rounds; i++) await tick();
}

const rows = (e: ShortcutEditor) => Array.from(e.element.querySelectorAll<HTMLElement>('.mx-list__item')).map((r) => r.textContent);
const headers = (e: ShortcutEditor) => Array.from(e.element.querySelectorAll<HTMLElement>('.mx-list__header')).map((r) => r.textContent);
const status = (e: ShortcutEditor) => e.element.querySelector<HTMLElement>('.mx-shortcut-editor__status')!;
const tool = (e: ShortcutEditor, text: string) => Array.from(e.element.querySelectorAll<HTMLButtonElement>('.mx-toolbar .mx-button')).find((b) => b.textContent === text)!;

function pressIn(e: ShortcutEditor, key: string, code: string, init: KeyboardEventInit = {}) {
  const input = e.element.querySelector<HTMLInputElement>('.mx-shortcut-editor__capture input')!;
  input.focus();
  input.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true, ...init }));
}

describe('ShortcutEditor', () => {
  it('lists the shortcuts the user can change, one row per name, under their categories', async () => {
    const a = new Panel();
    const b = new Panel();
    page(a, b);
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', category: 'File', run: () => {} }));
    removers.push(commands.add({ key: 'find', text: '&Find', category: 'Edit', run: () => {} }));
    removers.push(addShortcut('Ctrl+D', () => {}, { name: 'duplicate', text: 'Duplicate', scope: a }));
    removers.push(addShortcut('Ctrl+D', () => {}, { name: 'duplicate', text: 'Duplicate', scope: b }));
    removers.push(addShortcut('Ctrl+Q', () => {}));
    removers.push(addShortcut('F6', () => {}, { name: 'fixed', text: 'Fixed', customizable: false }));
    let editor!: ShortcutEditor;
    page(<ShortcutEditor ref={(e: ShortcutEditor) => (editor = e)} />);
    await settle();
    expect(rows(editor)).toEqual(['SaveCtrl+S', 'Find', 'DuplicateCtrl+D']);
    expect(headers(editor)).toEqual(['File', 'Edit', 'Other']);
    editor.grouped = false;
    await settle();
    expect(headers(editor)).toEqual([]);
    editor.filter = (s) => s.name !== null;
    await settle();
    expect(rows(editor)).toEqual(['SaveCtrl+S', 'Find', 'DuplicateCtrl+D', 'FixedF6']);
    // Listed, not changed: its row and the toolbar are off.
    editor.selected = 'fixed';
    await settle();
    expect(tool(editor, 'Remove keys').disabled).toBe(true);
    expect(editor.give(['F7'])).toBe(false);
    expect(shortcuts.keymap).toEqual({});
  });

  it('says who uses the keys pressed, gives them, takes them away and gives the own keys back', async () => {
    const ran: string[] = [];
    const told: ShortcutEditorKeysChangedEventArgs[] = [];
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', run: () => void ran.push('save') }));
    removers.push(commands.add({ key: 'print', text: '&Print', shortcut: 'Ctrl+P', run: () => void ran.push('print') }));
    let editor!: ShortcutEditor;
    page(<ShortcutEditor ref={(e: ShortcutEditor) => (editor = e)} onKeysChanged={(e) => void told.push(e)} />);
    await settle();
    expect(tool(editor, 'Assign').disabled).toBe(true);
    expect(tool(editor, 'Reset all keys').disabled).toBe(true);
    editor.selected = 'save';
    await settle();
    pressIn(editor, 'p', 'KeyP', { ctrlKey: true });
    await settle();
    expect(ran).toEqual([]);
    expect(status(editor).textContent).toBe('Ctrl+P is used by Print');
    pressIn(editor, 'E', 'KeyE', { ctrlKey: true, shiftKey: true });
    await settle();
    expect(status(editor).textContent).toBe('Ctrl+Shift+E is free');
    tool(editor, 'Assign').click();
    await settle();
    expect(told.at(-1)).toEqual({ name: 'save', keys: ['Ctrl+Shift+E'], keymap: { save: ['Ctrl+Shift+E'] } });
    expect(rows(editor)[0]).toBe('SavechangedCtrl+Shift+E');
    expect(status(editor).hidden).toBe(true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'E', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true }));
    expect(ran).toEqual(['save']);
    tool(editor, 'Remove keys').click();
    await settle();
    expect(rows(editor)[0]).toBe('Savechanged');
    expect(shortcuts.keymap).toEqual({ save: [] });
    tool(editor, 'Reset').click();
    await settle();
    expect(rows(editor)[0]).toBe('SaveCtrl+S');
    shortcuts.assign('print', ['F9']);
    await settle();
    expect(tool(editor, 'Reset all keys').disabled).toBe(false);
    tool(editor, 'Reset all keys').click();
    await settle();
    expect(told.at(-1)).toEqual({ name: null, keys: [], keymap: {} });
    expect(rows(editor)).toEqual(['SaveCtrl+S', 'PrintCtrl+P']);
    editor.resetAllEnabled = false;
    await settle();
    expect(tool(editor, 'Reset all keys')).toBeUndefined();
  });

  it('follows the shortcuts as components add and take away theirs, and a component’s keys take the user’s', async () => {
    let editor!: ShortcutEditor;
    page(<ShortcutEditor ref={(e: ShortcutEditor) => (editor = e)} />);
    await settle();
    expect(rows(editor)).toEqual([]);
    const docs = new TabDocumentManager();
    const host = page(docs);
    await settle();
    const all = rows(editor);
    expect(all).toContain('Close documentCtrl+Alt+W, Ctrl+W');
    expect(all).toContain('Go to group 3Ctrl+Alt+3, Ctrl+3');
    expect(headers(editor)).toEqual(['Tab documents']);
    shortcuts.assign('tabDocuments.focusGroup3', ['Alt+3']);
    await settle();
    expect(rows(editor)).toContain('Go to group 3changedAlt+3');
    expect(rows(editor)).toContain('Go to group 4Ctrl+Alt+4, Ctrl+4');
    expect(shortcuts.list().find((s) => s.name === 'tabDocuments.focusGroup3')!.keys).toEqual(['Alt+3']);
    await host.dispose();
    await settle();
    expect(rows(editor)).toEqual([]);
  });

  it('reads its texts and the shortcuts’ names in the language of the kit', async () => {
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', run: () => {} }));
    const docs = new TabDocumentManager();
    page(docs);
    let editor!: ShortcutEditor;
    page(<ShortcutEditor ref={(e: ShortcutEditor) => (editor = e)} />);
    await settle();
    expect(editor.element.getAttribute('aria-label')).toBe('Keyboard shortcuts');
    await uiLocale.use('tr');
    await settle();
    expect(editor.element.getAttribute('aria-label')).toBe('Klavye kısayolları');
    expect(tool(editor, 'Ata')).toBeDefined();
    expect(headers(editor)).toEqual(['Diğer', 'Sekmeli belgeler']);
    expect(rows(editor)).toContain('Belgeyi kapatCtrl+Alt+W, Ctrl+W');
    editor.label = 'Tuşlar';
    await settle();
    expect(editor.element.getAttribute('aria-label')).toBe('Tuşlar');
  });
});
