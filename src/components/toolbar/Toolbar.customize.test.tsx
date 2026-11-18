import { Component } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
import { commands as appCommands } from '../../core/command-registry';
import type { MenuItem } from '../../parts/menu/menu-item';
import { MenuBar } from '../menubar/MenuBar';
import { TextBox } from '../textbox/TextBox';
import type { ToolbarCustomization } from './toolbar-customization';
import type { ToolbarItem } from './toolbar-item';
import { Toolbar } from './Toolbar';

let hosts: Component[] = [];
let removers: (() => void)[] = [];

beforeAll(() => {
  // The customizer is a modal window.
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

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
  for (let i = 0; i < 6; i++) await tick();
  for (const host of hosts) await whenMeasured(host);
  for (let i = 0; i < 6; i++) await tick();
}

/** The bar as the user sees it: a button by its text (its tooltip when it shows only its icon), a separator as `|`. */
const row = (bar: Toolbar) =>
  Array.from(bar.element.querySelectorAll<HTMLElement>(':scope > .mx-button:not(.mx-toolbar__more), :scope > .mx-toolbar__separator')).map((el) =>
    el.matches('.mx-toolbar__separator') ? '|' : el.querySelector('.mx-button__text')?.textContent || `[${el.getAttribute('title')}]`,
  );
const buttonOf = (bar: Toolbar, text: string) => Array.from(bar.element.querySelectorAll<HTMLElement>(':scope > .mx-button')).find((el) => el.textContent === text || el.getAttribute('title') === text)!;
const rightClick = (el: Element) => el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 }));
const customMenu = () => Array.from(document.querySelectorAll<HTMLElement>('.mx-popup')).find((p) => !p.hidden && p.querySelector('.mx-menu') && p.closest('.mx-context-menu'));
const commands = () => Array.from(customMenu()?.querySelectorAll<HTMLButtonElement>(':scope > .mx-menu > .mx-menu__item') ?? []);
const label = (el: Element) => el.querySelector('[class$=__label]')!.textContent;
const command = (text: string) => commands().find((c) => label(c)!.includes(text))!;
const closeMenus = async () => {
  document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await settle();
};

const items = (): ToolbarItem[] => [
  { key: 'bold', text: '&Bold', icon: '/i/bold.svg' },
  { key: 'italic', text: '&Italic', icon: '/i/italic.svg' },
  { type: 'separator', key: 'line' },
  { key: 'save', text: '&Save' },
  { key: 'help', text: 'Help', customizable: false },
];

describe('Toolbar customization', () => {
  it('hides and moves items from the menu of the right button, keeping each control, and reports what changed', async () => {
    const saved: ToolbarCustomization[] = [];
    let bar!: Toolbar;
    const given = items();
    page(<Toolbar ref={(b: Toolbar) => (bar = b)} label="Format" items={given} customizable onCustomized={(e) => void saved.push(e.customization)} />);
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);
    const bold = bar.controlOf(given[0]);
    rightClick(buttonOf(bar, 'Bold'));
    await settle();
    expect(commands().map(label)).toEqual(['Hide “Bold”', 'Move left', 'Move right', 'Display', 'Customize…']);
    expect(command('Move left').getAttribute('aria-disabled')).toBe('true');
    command('Move right').click();
    await settle();
    expect(row(bar)).toEqual(['Italic', 'Bold', '|', 'Save', 'Help']);
    expect(bar.controlOf(given[0])).toBe(bold);
    expect(document.activeElement).toBe(buttonOf(bar, 'Bold'));
    // Help stays where it is: nothing moves past it. Save stands after a line: no second one is offered.
    rightClick(buttonOf(bar, 'Save'));
    await settle();
    expect(commands().map(label)).toEqual(['Hide “Save”', 'Move left', 'Move right', 'Customize…', 'Undo all changes']);
    expect(command('Move right').getAttribute('aria-disabled')).toBe('true');
    command('Hide').click();
    await settle();
    expect(row(bar)).toEqual(['Italic', 'Bold', '|', 'Help']);
    expect(saved.at(-1)).toEqual({ hidden: ['save'], order: { '': ['italic', 'bold', 'line', 'save', 'help'] } });
    // Nothing for the fixed item but the menu's own commands.
    rightClick(buttonOf(bar, 'Help'));
    await settle();
    expect(commands().map(label)).toEqual(['Show the hidden items', 'Customize…', 'Undo all changes']);
    command('Undo all').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);
    expect(saved.at(-1)).toEqual({});
    expect(bar.items).toEqual(given);
  });

  it('forgets the user’s changes on `null` each time, and restores a saved object given again', async () => {
    let bar!: Toolbar;
    page(<Toolbar ref={(b: Toolbar) => (bar = b)} label="Format" items={items()} customizable />);
    await settle();
    const hide = async (text: string) => {
      rightClick(buttonOf(bar, text));
      await settle();
      command('Hide').click();
      await settle();
    };
    await hide('Save');
    const saved = bar.customization;
    bar.customization = null;
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);
    await hide('Italic');
    // `null` again: still a change.
    bar.customization = null;
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);
    bar.customization = saved;
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Help']);
    await hide('Italic');
    bar.customization = saved;
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Help']);
  });

  it('adds and removes separators, and lets the user choose what a button shows', async () => {
    let bar!: Toolbar;
    const given = items();
    page(<Toolbar ref={(b: Toolbar) => (bar = b)} label="Format" items={given} customizable />);
    await settle();
    rightClick(buttonOf(bar, 'Italic'));
    await settle();
    command('Add a separator before').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', '|', 'Italic', '|', 'Save', 'Help']);
    expect(bar.customization.added).toEqual([{ id: 'user:1', separator: true }]);
    // Next to a line, no second one is offered.
    rightClick(buttonOf(bar, 'Italic'));
    await settle();
    expect(command('Add a separator')).toBeUndefined();
    await closeMenus();
    rightClick(bar.element.querySelectorAll('.mx-toolbar__separator')[0]);
    await settle();
    expect(commands().map(label)).toEqual(['Remove the separator', 'Move left', 'Move right', 'Customize…', 'Undo all changes']);
    command('Remove the separator').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);
    expect(bar.customization.added).toBeUndefined();

    const bold = bar.controlOf(given[0]);
    rightClick(buttonOf(bar, 'Bold'));
    await settle();
    command('Display').click();
    await settle();
    const choices = () => Array.from(document.querySelectorAll<HTMLElement>('.mx-popup:not([hidden]) .mx-menu .mx-menu .mx-menu__item, .mx-popup:not([hidden]) .mx-menu__item[role="menuitemradio"]'));
    expect([...new Set(choices().map(label))]).toEqual(['Icon only', 'Text only', 'Icon and text']);
    choices().find((el) => label(el) === 'Icon only')!.click();
    await settle();
    expect(row(bar)).toEqual(['[Bold]', 'Italic', '|', 'Save', 'Help']);
    expect(bar.controlOf(given[0])).toBe(bold);
    expect(bar.customization.display).toEqual({ bold: 'icon' });
    expect(buttonOf(bar, 'Bold').getAttribute('data-icon-only')).not.toBeNull();
    // A button without an icon is offered no choice.
    rightClick(buttonOf(bar, 'Save'));
    await settle();
    expect(command('Display')).toBeUndefined();
  });

  it('restores a saved customization, says up and down when vertical, and keeps the browser menu on JSX children', async () => {
    const seen: (string | null)[] = [];
    let bar!: Toolbar;
    let find!: TextBox;
    page(
      <Toolbar
        ref={(b: Toolbar) => (bar = b)}
        label="Format"
        orientation="vertical"
        items={items()}
        customizable
        customization={{ hidden: ['italic'], order: { '': ['save', 'bold', 'italic', 'line', 'help'] }, texts: { save: 'Keep' }, display: { bold: 'text' } }}
        onCustomMenuOpening={(e) => void seen.push(e.path)}
      >
        <TextBox ref={(t: TextBox) => (find = t)} label="Find" labelMode="hidden" />
      </Toolbar>,
    );
    await settle();
    expect(row(bar)).toEqual(['Keep', 'Bold', '|', 'Help']);
    expect(buttonOf(bar, 'Bold').querySelector('.mx-button__icon')).toBeNull();
    rightClick(buttonOf(bar, 'Bold'));
    await settle();
    expect(commands().map(label).slice(0, 3)).toEqual(['Hide “Bold”', 'Move up', 'Move down']);
    await closeMenus();
    const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 });
    find.element.querySelector('input')!.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
    expect(seen).toEqual(['bold', null]);
  });

  it('gives the app the menu of the right button when it is not customizable', async () => {
    let bar!: Toolbar;
    page(
      <Toolbar
        ref={(b: Toolbar) => (bar = b)}
        items={items()}
        onCustomMenuOpening={(e) => {
          if (e.path === 'save') e.items.push({ text: 'Pin' });
        }}
      />,
    );
    await settle();
    const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 });
    buttonOf(bar, 'Bold').dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
    rightClick(buttonOf(bar, 'Save'));
    await settle();
    expect(commands().map(label)).toEqual(['Pin']);
  });

  it('opens a customizer for a flat list: separators instead of groups, what a button shows, and commands added after the selection', async () => {
    removers.push(appCommands.add({ key: 'print', text: '&Print', run: () => {} }));
    let bar!: Toolbar;
    page(<Toolbar ref={(b: Toolbar) => (bar = b)} label="Format" items={items()} customizable />);
    await settle();
    bar.openCustomizer();
    await settle();
    const win = () => document.querySelector<HTMLElement>('.mx-customizer__pages')!;
    const rows = () => Array.from(win().querySelectorAll<HTMLElement>('.mx-tree-view__item'));
    const rowOf = (text: string) => rows().find((el) => el.querySelector(':scope > .mx-tree-view__row > .mx-tree-view__text')!.textContent === text)!;
    const tools = () => Array.from(document.querySelectorAll<HTMLElement>('.mx-customizer__tools .mx-button'));
    const tool = (text: string) => tools().find((el) => el.textContent === text)!;
    const off = (el: HTMLElement) => el.matches(':disabled, [aria-disabled="true"]') || !!el.querySelector(':disabled, [aria-disabled="true"]');
    expect(rows().map((el) => el.querySelector('.mx-tree-view__text')!.textContent)).toEqual(['Bold', 'Italic', 'Separator', 'Save', 'Help']);
    // No groups: no "New group", no "Move to". The commands page (out of the page until shown) has "Add".
    expect(tools().map((el) => el.textContent)).toEqual(['New separator', 'Rename', 'Delete', 'Move up', 'Move down', 'Display', 'Reset']);

    rowOf('Separator').querySelector<HTMLElement>('.mx-tree-view__row')!.click();
    await settle();
    expect(off(tool('Rename'))).toBe(true);
    expect(off(tool('Display'))).toBe(true);
    rowOf('Bold').querySelector<HTMLElement>('.mx-tree-view__row')!.click();
    await settle();
    expect(off(tool('Display'))).toBe(false);
    tool('New separator').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', '|', 'Italic', '|', 'Save', 'Help']);
    // The new one, after Bold, is selected.
    expect(rowOf('Separator').getAttribute('aria-selected')).toBe('true');
    expect(off(tool('Delete'))).toBe(false);
    tool('Delete').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', '|', 'Save', 'Help']);

    rowOf('Italic').querySelector<HTMLElement>('.mx-tree-view__row')!.click();
    await settle();
    Array.from(win().querySelectorAll<HTMLElement>('.mx-tabs__tab')).find((el) => el.textContent === 'Commands')!.click();
    await settle();
    win().querySelector<HTMLElement>('.mx-customizer__commands .mx-list__item')!.click();
    await settle();
    tool('Add').click();
    await settle();
    expect(row(bar)).toEqual(['Bold', 'Italic', 'Print', '|', 'Save', 'Help']);
    expect(bar.customization.added).toEqual([{ id: 'user:1', command: 'print' }]);
    expect(win().querySelector('.mx-tabs__tab[aria-selected="true"]')!.textContent).toBe('Items');
  });

  describe('sending commands from a menu bar', () => {
    const menus = (): MenuItem[] => [{ key: 'format', text: 'F&ormat', items: [{ key: 'bold', command: 'bold' }, { key: 'plain', text: 'Plain' }] }];
    const menuItems = (bar: MenuBar) => Array.from(bar.element.querySelectorAll<HTMLButtonElement>(':scope > .mx-popup .mx-menu__item'));

    it('offers each toolbar that takes commands, adds the command there and takes it away again', async () => {
      removers.push(appCommands.add({ key: 'bold', text: '&Bold', run: () => {} }));
      let menu!: MenuBar;
      let format!: Toolbar;
      page(
        <MenuBar ref={(b: MenuBar) => (menu = b)} items={menus()} />,
        <Toolbar ref={(b: Toolbar) => (format = b)} label="Format" items={[{ key: 'save', text: 'Save' }]} customizable />,
        <Toolbar label="Quick" items={[]} customizable acceptCommands={false} />,
        <Toolbar label="Fixed" items={[]} />,
      );
      await settle();
      menu.open('format');
      await settle();
      // Not customizable itself: only the toolbars.
      rightClick(menuItems(menu)[0]);
      await settle();
      expect(commands().map(label)).toEqual(['Add to the “Format” toolbar']);
      // The pointer crossing the menu on its way leaves the right button's menu open, focus in it.
      menuItems(menu)[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
      await settle();
      expect(commands().map(label)).toEqual(['Add to the “Format” toolbar']);
      expect(customMenu()!.contains(document.activeElement)).toBe(true);
      command('Add to').click();
      await settle();
      expect(row(format)).toEqual(['Save', 'Bold']);
      expect(format.customization.added).toEqual([{ id: 'user:1', command: 'bold' }]);
      menu.open('format');
      await settle();
      rightClick(menuItems(menu)[0]);
      await settle();
      expect(commands().map(label)).toEqual(['Remove from the “Format” toolbar']);
      command('Remove from').click();
      await settle();
      expect(row(format)).toEqual(['Save']);
      // An item without a command is offered nothing.
      menu.open('format');
      await settle();
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 });
      menuItems(menu)[1].dispatchEvent(e);
      expect(e.defaultPrevented).toBe(false);
    });

    it('shows a hidden item of the app again, puts the rows between the bar’s own commands, and can be turned off', async () => {
      removers.push(appCommands.add({ key: 'bold', text: '&Bold', run: () => {} }));
      let menu!: MenuBar;
      let format!: Toolbar;
      page(
        <MenuBar ref={(b: MenuBar) => (menu = b)} items={menus()} customizable />,
        <Toolbar ref={(b: Toolbar) => (format = b)} label="Format" items={[{ key: 'b', command: 'bold' }]} customizable customization={{ hidden: ['b'] }} />,
      );
      await settle();
      expect(row(format)).toEqual([]);
      menu.open('format');
      await settle();
      rightClick(menuItems(menu)[0]);
      await settle();
      const list = commands();
      expect(list.map(label)).toEqual(['Hide “Bold”', 'Move up', 'Move down', 'Add to the “Format” toolbar', 'Customize…']);
      expect(list[3].previousElementSibling?.matches('.mx-menu__separator, [role="separator"]')).toBe(true);
      command('Add to').click();
      await settle();
      expect(row(format)).toEqual(['Bold']);
      expect(format.customization).toEqual({});
      menu.toolbarTargets = false;
      menu.open('format');
      await settle();
      rightClick(menuItems(menu)[0]);
      await settle();
      expect(commands().map(label)).toEqual(['Hide “Bold”', 'Move up', 'Move down', 'Customize…']);
    });
  });
});
