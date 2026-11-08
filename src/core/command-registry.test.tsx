import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { Button } from '../components/button/Button';
import { ContextMenu } from '../components/contextmenu/ContextMenu';
import { MenuBar } from '../components/menubar/MenuBar';
import { RibbonMenu } from '../components/ribbonmenu/RibbonMenu';
import { Toolbar } from '../components/toolbar/Toolbar';
import type { CommandRunEventArgs } from './command-run-event-args';
import { commands } from './command-registry';
import { Control } from './control';
import { shortcutText } from './shortcut-text';

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
}

function press(key: string, mods: Partial<KeyboardEventInit> = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...mods });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

class Doc extends Control<HTMLDivElement> {}

describe('commands', () => {
  it('runs a command from its keys, and not while it is off', () => {
    const ran: string[] = [];
    const s = reactive({ on: true });
    removers.push(commands.add({ key: 'save', text: '&Save', shortcut: 'Ctrl+S', enabled: () => s.on, run: (e) => void ran.push(`${e.command.key}:${e.event?.type ?? null}`) }));
    expect(press('s', { ctrlKey: true })).toBe(true);
    s.on = false;
    expect(press('s', { ctrlKey: true })).toBe(false);
    expect(commands.run('save')).toBe(false);
    s.on = true;
    expect(commands.run('save')).toBe(true);
    expect(ran).toEqual(['save:keydown', 'save:null']);
  });

  it('picks the command of the scope that holds the item, else of the one that holds focus, else the app-wide one', async () => {
    const ran: string[] = [];
    const a = new Doc();
    const b = new Doc();
    page(a, b);
    const field = a.element.appendChild(document.createElement('input'));
    removers.push(commands.add({ key: 'save', run: () => void ran.push('app') }));
    commands.add({ key: 'save', scope: a, run: () => void ran.push('a') });
    commands.add({ key: 'save', scope: b, run: () => void ran.push('b') });
    commands.run('save', b.element);
    commands.run('save');
    field.focus();
    commands.run('save');
    await b.dispose();
    commands.run('save', document.body);
    expect(ran).toEqual(['b', 'app', 'a', 'a']);
    expect(commands.list().filter((c) => c.key === 'save')).toHaveLength(2);
  });

  it('reads keys as they read on the platform', () => {
    expect(shortcutText('Mod+Shift+S')).toBe('Ctrl+Shift+S');
    expect(shortcutText('Alt+ArrowUp')).toBe('Alt+↑');
    expect(shortcutText('Ctrl+K W')).toBe('Ctrl+K W');
  });

  it('gives menus what their items are not given, and runs it from them', async () => {
    const ran: string[] = [];
    removers.push(commands.add({ key: 'print', text: '&Print', shortcut: 'Mod+P', hint: 'Print the page', run: (e: CommandRunEventArgs) => void ran.push(`print:${!!e.item}`) }));
    let bar!: MenuBar;
    page(<MenuBar ref={(m: MenuBar) => (bar = m)} items={[{ key: 'file', text: '&File', items: [{ command: 'print' }, { command: 'print', text: 'Print &again' }] }]} />);
    await settle();
    bar.open('file');
    await settle();
    const items = Array.from(bar.element.querySelectorAll<HTMLElement>('.mx-popup .mx-menu__item'));
    expect(items.map((i) => i.querySelector('.mx-menu__label')!.textContent)).toEqual(['Print', 'Print again']);
    expect(items[0].querySelector('.mx-menu__shortcut')!.textContent).toBe('Ctrl+P');
    expect(items[0].title).toBe('Print the page');
    items[1].click();
    expect(ran).toEqual(['print:true']);
  });

  it('draws a menu bar again when a command it names comes later', async () => {
    let bar!: MenuBar;
    page(<MenuBar ref={(m: MenuBar) => (bar = m)} items={[{ key: 'later', command: 'later' }, { key: 'b', text: 'B' }]} />);
    await settle();
    const labels = () => Array.from(bar.element.querySelectorAll('.mx-menubar__label')).map((l) => l.textContent);
    expect(labels()).toEqual(['', 'B']);
    removers.push(commands.add({ key: 'later', text: '&Later', run: () => {} }));
    await settle();
    expect(labels()).toEqual(['Later', 'B']);
  });

  it('serves context menus, button menus, toolbars and ribbons', async () => {
    const ran: string[] = [];
    const s = reactive({ bold: true });
    removers.push(commands.add({ key: 'bold', text: '&Bold', checked: () => s.bold, run: () => void ran.push('bold') }));
    const bar = new Toolbar({ items: [{ type: 'toggle', command: 'bold' }] });
    const button = new Button({ text: 'More', menu: [{ command: 'bold' }] });
    const ribbon = new RibbonMenu({ items: [{ key: 'home', text: 'Home', groups: [{ key: 'font', text: 'Font', commands: [{ key: 'b', type: 'toggle', command: 'bold' }] }] }] });
    const holder = new Doc();
    const context = new ContextMenu({ items: [{ command: 'bold' }] });
    holder.controls.add(context);
    page(bar, button, ribbon, holder);
    await settle();
    const toolButton = bar.element.querySelector<HTMLElement>('.mx-button')!;
    expect(toolButton.textContent).toBe('Bold');
    expect(toolButton.querySelector('[aria-pressed]')?.getAttribute('aria-pressed') ?? toolButton.getAttribute('aria-pressed')).toBe('true');
    (toolButton.querySelector<HTMLElement>('button') ?? toolButton).click();
    const ribbonButton = ribbon.element.querySelector<HTMLElement>('.mx-ribbon-menu__command')!;
    expect(ribbonButton.textContent).toContain('Bold');
    (ribbonButton.querySelector<HTMLElement>('button') ?? ribbonButton).click();
    button.element.querySelector<HTMLElement>('button')!.click();
    await settle();
    button.element.querySelector<HTMLElement>('.mx-menu__item')!.click();
    context.open({ x: 1, y: 1 }, holder.element);
    await settle();
    document.querySelector<HTMLElement>('.mx-context-menu .mx-menu__item')!.click();
    expect(ran).toEqual(['bold', 'bold', 'bold', 'bold']);
  });
});
