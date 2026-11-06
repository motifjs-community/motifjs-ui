import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Button } from './Button';
import { dataKinds } from '../../../tests/data-kinds';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const face = (b: Button) => b.element.querySelector<HTMLButtonElement>('.mx-button__main') ?? (b.element as HTMLButtonElement);
const arrow = (b: Button) => b.element.querySelector<HTMLButtonElement>('.mx-button__arrow');
const popup = (b: Button) => b.element.querySelector<HTMLElement>('.mx-popup');
const items = (b: Button) => Array.from(b.element.querySelectorAll<HTMLButtonElement>('.mx-menu__item'));
const shown = (b: Button) => !!popup(b) && !popup(b)!.hidden;

describe('Button', () => {
  it('is a native button with the look in data attributes, the same in JSX and programmatically', async () => {
    const s = reactive({ tone: 'standard' as 'standard' | 'accent' });
    let jsx!: Button;
    page(<Button ref={(b: Button) => (jsx = b)} text="&Save" tone={() => s.tone} class="extra" />);
    const coded = new Button({ text: 'Retry' });
    page(coded);
    await settle();

    expect(jsx.element.tagName).toBe('BUTTON');
    expect(jsx.element.className).toContain('mx-button');
    expect(jsx.element.className).toContain('extra');
    expect((jsx.element as HTMLButtonElement).type).toBe('button');
    expect(jsx.element.textContent).toBe('Save');
    expect(jsx.element.getAttribute('aria-keyshortcuts')).toBe('Alt+S');
    expect({ ...jsx.element.dataset }).toMatchObject({ variant: 'solid', tone: 'standard', size: 'md' });

    s.tone = 'accent';
    await settle();
    expect(jsx.element.dataset.tone).toBe('accent');

    coded.variant = 'outline';
    coded.size = 'sm';
    coded.text = 'Retry (2)';
    coded.stretch = true;
    expect({ ...coded.element.dataset }).toMatchObject({ variant: 'outline', size: 'sm' });
    expect(coded.element.hasAttribute('data-stretch')).toBe(true);
    expect(coded.element.textContent).toBe('Retry (2)');
  });

  it('takes DOM events programmatically as JSX does, once', async () => {
    const fromCode = vi.fn();
    const fromJsx = vi.fn();
    const coded = new Button({ text: 'Code', onclick: fromCode } as never);
    let jsx!: Button;
    page(coded, <Button ref={(b: Button) => (jsx = b)} text="JSX" onclick={fromJsx} />);
    await settle();
    (coded.element as HTMLButtonElement).click();
    (jsx.element as HTMLButtonElement).click();
    expect(fromCode).toHaveBeenCalledTimes(1);
    expect(fromJsx).toHaveBeenCalledTimes(1);
  });

  it('shows JSX children as the caption, after the text', async () => {
    let b!: Button;
    page(
      <Button ref={(x: Button) => (b = x)} text="Total">
        <b>42</b>
      </Button>,
    );
    await settle();
    expect(b.element.textContent).toBe('Total42');
  });

  it('shows an icon from an address or a component, at the start or the end', async () => {
    const s = reactive({ round: false });
    let b!: Button;
    page(<Button ref={(x: Button) => (b = x)} text="Go" icon={() => (s.round ? <svg class="round" /> : '/go.svg')} />);
    await settle();
    const slot = () => b.element.querySelector('.mx-button__icon')!;
    expect(slot().getAttribute('aria-hidden')).toBe('true');
    expect(slot().querySelector('img')!.getAttribute('src')).toBe('/go.svg');

    s.round = true;
    await settle();
    expect(slot().querySelector('svg.round')).not.toBeNull();
    b.iconPosition = 'end';
    expect(b.element.dataset.iconPosition).toBe('end');
    b.icon = null;
    expect(b.element.querySelector('.mx-button__icon')).toBeNull();
  });

  it('is a toggle when asked: a click flips pressed, two-way with x-model', async () => {
    const s = reactive({ bold: false });
    let b!: Button;
    page(<Button ref={(x: Button) => (b = x)} text="Bold" toggle x-model={() => s.bold} />);
    await settle();
    expect(b.element.getAttribute('aria-pressed')).toBe('false');

    b.element.click();
    await settle();
    expect([b.pressed, s.bold, b.element.getAttribute('aria-pressed')]).toEqual([true, true, 'true']);

    s.bold = false;
    await settle();
    expect(b.pressed).toBe(false);
    b.toggle = false;
    expect(b.element.hasAttribute('aria-pressed')).toBe(false);
  });

  it('writes a pressed state set programmatically to x-model too', async () => {
    const s = reactive({ bold: false });
    let b!: Button;
    page(<Button ref={(x: Button) => (b = x)} text="Bold" toggle x-model={() => s.bold} />);
    await settle();
    b.pressed = true;
    expect(s.bold).toBe(true);
    s.bold = false;
    await settle();
    expect(b.pressed).toBe(false);
  });

  it('ignores presses while busy, keeps its content and shows a spinner', async () => {
    const clicked = vi.fn();
    const b = new Button({ text: 'Send', toggle: true, busy: true });
    b.motif.on('click', clicked);
    page(b);
    await settle();
    b.element.click();
    expect(clicked).not.toHaveBeenCalled();
    expect(b.pressed).toBe(false);
    expect(b.element.getAttribute('aria-busy')).toBe('true');
    expect(b.element.querySelector('.mx-button__spinner')).not.toBeNull();
    expect(b.element.textContent).toBe('Send');

    b.busy = false;
    b.element.click();
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(b.element.hasAttribute('aria-busy')).toBe(false);
  });

  it('keeps focus while disabled when asked, and still cannot be pressed', async () => {
    const clicked = vi.fn();
    const plain = new Button({ text: 'Plain', enabled: false });
    const kept = new Button({ text: 'Kept', focusableWhenDisabled: true });
    kept.motif.on('click', clicked);
    page(plain, kept);
    await settle();
    expect((plain.element as HTMLButtonElement).disabled).toBe(true);

    kept.element.focus();
    kept.enabled = false;
    await settle();
    expect((kept.element as HTMLButtonElement).disabled).toBe(false);
    expect(kept.element.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(kept.element);
    expect(kept.focus()).toBe(true);
    kept.element.click();
    expect(clicked).not.toHaveBeenCalled();

    kept.focusableWhenDisabled = false;
    expect((kept.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('writes type and hint to the native button, and presses itself on its access key', async () => {
    const clicked = vi.fn();
    const b = new Button({ text: '&Send', type: 'submit', hint: 'Send the form' });
    b.motif.on('click', clicked);
    page(b);
    await settle();
    expect((b.element as HTMLButtonElement).type).toBe('submit');
    expect(b.element.title).toBe('Send the form');
    press('s', { altKey: true });
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(b.element);
  });

  it('follows every prop given as a function of a reactive object', async () => {
    const s = reactive({
      text: 'One',
      variant: 'solid' as 'solid' | 'ghost',
      tone: 'standard' as 'standard' | 'danger',
      size: 'md' as 'md' | 'lg',
      icon: null as string | null,
      iconPosition: 'start' as 'start' | 'end',
      stretch: false,
      type: 'button' as 'button' | 'submit',
      hint: '',
      toggle: false,
      pressed: false,
      busy: false,
      focusable: false,
      enabled: true,
      visible: true,
      tabStop: true,
      tabIndex: 0,
    });
    let b!: Button;
    page(
      <Button
        ref={(x: Button) => (b = x)}
        text={() => s.text}
        variant={() => s.variant}
        tone={() => s.tone}
        size={() => s.size}
        icon={() => s.icon}
        iconPosition={() => s.iconPosition}
        stretch={() => s.stretch}
        type={() => s.type}
        hint={() => s.hint}
        toggle={() => s.toggle}
        pressed={() => s.pressed}
        busy={() => s.busy}
        focusableWhenDisabled={() => s.focusable}
        enabled={() => s.enabled}
        visible={() => s.visible}
        tabStop={() => s.tabStop}
        tabIndex={() => s.tabIndex}
      />,
    );
    await settle();
    Object.assign(s, {
      text: '&Two',
      variant: 'ghost',
      tone: 'danger',
      size: 'lg',
      icon: '/i.svg',
      iconPosition: 'end',
      stretch: true,
      type: 'submit',
      hint: 'Hint',
      toggle: true,
      pressed: true,
      busy: true,
      focusable: true,
      enabled: false,
      tabStop: false,
      tabIndex: 4,
    });
    await settle();
    const el = b.element as HTMLButtonElement;
    expect([el.textContent, el.getAttribute('aria-keyshortcuts')]).toEqual(['Two', 'Alt+T']);
    expect({ ...el.dataset }).toMatchObject({ variant: 'ghost', tone: 'danger', size: 'lg', iconPosition: 'end' });
    expect([el.hasAttribute('data-stretch'), el.type, el.title, el.getAttribute('aria-pressed'), el.getAttribute('aria-busy')]).toEqual([
      true,
      'submit',
      'Hint',
      'true',
      'true',
    ]);
    expect(el.querySelector('.mx-button__icon img')).not.toBeNull();
    expect([el.disabled, el.getAttribute('aria-disabled'), el.getAttribute('tabindex'), el.dataset.mxTabindex]).toEqual([false, 'true', '-1', '4']);

    s.focusable = false;
    s.visible = false;
    await settle();
    expect([el.disabled, b.visible]).toEqual([true, false]);
  });

  it('takes a value or a function programmatically too: a function is followed, a value replaces it', async () => {
    const s = reactive({ title: 'Draft', tone: 'standard' as 'standard' | 'accent' });
    const b = new Button();
    page(b);
    await settle();
    b.text = () => s.title;
    b.tone = () => s.tone;
    b.disabled = () => s.title === 'Locked';
    s.title = 'Locked';
    s.tone = 'accent';
    await settle();
    expect([b.element.textContent, b.element.dataset.tone, b.enabled]).toEqual(['Locked', 'accent', false]);

    b.text = 'Fixed';
    s.title = 'Ignored';
    await settle();
    expect([b.element.textContent, b.enabled]).toEqual(['Fixed', true]);
  });

  it('needs split, menu or dropDown when it is created to have a menu', () => {
    const b = new Button({ text: 'Plain' });
    expect(b.hasMenu).toBe(false);
    expect(() => (b.menu = [{ text: 'x' }])).toThrow(TypeError);
  });
});

describe('Button with a menu', () => {
  const fileMenu = (log: string[]): MenuItem[] => [
    { text: '&New', click: () => void log.push('new') },
    { text: 'Open…', click: () => void log.push('open') },
    { text: 'Hidden', visible: false },
    { text: 'Locked', enabled: false, click: () => void log.push('locked') },
    { text: 'Word wrap', checked: true, beginGroup: true },
    { text: 'Exit', click: () => void log.push('exit') },
  ];

  it('opens its menu from the whole button and moves focus into it', async () => {
    const log: string[] = [];
    const b = new Button({ text: 'File', menu: fileMenu(log) });
    page(b);
    await settle();
    expect(b.element.tagName).toBe('DIV');
    expect(b.element.dataset.mode).toBe('menu');
    expect(face(b).getAttribute('aria-haspopup')).toBe('menu');
    expect(face(b).getAttribute('aria-expanded')).toBe('false');
    expect(face(b).querySelector('.mx-button__chevron')).not.toBeNull();

    face(b).click();
    expect(shown(b)).toBe(true);
    expect(b.opened).toBe(true);
    expect(face(b).getAttribute('aria-expanded')).toBe('true');
    expect(b.element.querySelector('.mx-menu')!.getAttribute('role')).toBe('menu');
    expect(items(b).map((i) => i.textContent)).toEqual(['New', 'Open…', 'Locked', 'Word wrap', 'Exit']);
    expect(items(b)[3].getAttribute('role')).toBe('menuitemcheckbox');
    expect(items(b)[3].getAttribute('aria-checked')).toBe('true');
    expect(items(b)[2].getAttribute('aria-disabled')).toBe('true');
    expect(b.element.querySelectorAll('.mx-menu__separator')).toHaveLength(1);
    expect(document.activeElement).toBe(items(b)[0]);

    face(b).click();
    expect(shown(b)).toBe(false);
  });

  it('moves with the arrow keys, Home, End and letters, and chooses with a key or a click', async () => {
    const log: string[] = [];
    const chosen: MenuItemClickEventArgs[] = [];
    const b = new Button({ text: 'File', menu: fileMenu(log), onItemClick: (e) => void chosen.push(e) });
    page(b);
    await settle();
    face(b).focus();
    press('ArrowUp');
    expect(document.activeElement).toBe(items(b)[4]);
    press('ArrowDown');
    expect(document.activeElement).toBe(items(b)[0]);
    press('End');
    press('Home');
    press('o');
    expect(document.activeElement!.textContent).toBe('Open…');
    press('l');
    expect(document.activeElement!.textContent).toBe('Locked');
    items(b)[2].click();
    expect(log).toEqual([]);
    expect(shown(b)).toBe(true);

    press('n'); // the & key of New
    expect(log).toEqual(['new']);
    expect(chosen.map((e) => [e.item.text, e.source === b])).toEqual([['&New', true]]);
    expect(shown(b)).toBe(false);
    expect(document.activeElement).toBe(face(b));

    b.open();
    items(b)[4].click();
    expect(log).toEqual(['new', 'exit']);
  });

  it('closes on Escape, on a press outside and when focus leaves, giving focus back only on Escape', async () => {
    const b = new Button({ text: 'File', menu: [{ text: 'One' }, { text: 'Two' }] });
    page(b, <input name="after" />);
    await settle();
    b.open();
    expect(press('Escape')).toBe(true);
    expect(shown(b)).toBe(false);
    expect(document.activeElement).toBe(face(b));

    b.open();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(shown(b)).toBe(false);

    b.open();
    const after = document.querySelector<HTMLInputElement>('[name=after]')!;
    items(b)[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: after }));
    expect(shown(b)).toBe(false);
  });

  it('with split, keeps its own action and opens the menu from the arrow', async () => {
    const clicked = vi.fn();
    const s = reactive({ split: true });
    let b!: Button;
    page(
      <Button ref={(x: Button) => (b = x)} text="Save" split={() => s.split} menu={[{ text: 'Save as…' }]} onclick={clicked}>
        <i class="mark" />
      </Button>,
    );
    await settle();
    expect(b.element.dataset.mode).toBe('split');
    expect(face(b).querySelector('i.mark')).not.toBeNull();
    expect(face(b).hasAttribute('aria-haspopup')).toBe(false);
    expect(arrow(b)!.getAttribute('aria-haspopup')).toBe('menu');
    expect(arrow(b)!.getAttribute('aria-label')).toBe('More options');
    await uiLocale.use('tr');
    await settle();
    expect(arrow(b)!.getAttribute('aria-label')).toBe('Diğer seçenekler');

    face(b).click();
    expect([clicked.mock.calls.length, shown(b)]).toEqual([1, false]);
    arrow(b)!.click();
    expect([clicked.mock.calls.length, shown(b)]).toEqual([1, true]);
    press('Escape');
    expect(document.activeElement).toBe(arrow(b));

    face(b).focus();
    press('ArrowDown', { altKey: true });
    expect(shown(b)).toBe(true);
    press('Escape');

    s.split = false;
    await settle();
    expect(arrow(b)).toBeNull();
    expect(b.element.dataset.mode).toBe('menu');
    face(b).click();
    expect(shown(b)).toBe(true);
  });

  it('opens any content instead of a menu', async () => {
    const b = new Button({ text: 'Filter', dropDown: <div class="picker"><input name="from" /></div> });
    page(b);
    await settle();
    expect(face(b).getAttribute('aria-haspopup')).toBe('dialog');
    face(b).click();
    expect(popup(b)!.getAttribute('role')).toBe('dialog');
    expect(popup(b)!.getAttribute('aria-label')).toBe('Filter');
    expect(document.activeElement).toBe(popup(b)!.querySelector('[name=from]'));
    press('Escape');
    expect(document.activeElement).toBe(face(b));
  });

  it('does not open while disabled or busy, and closes when it becomes so; menu changes show at once', async () => {
    const b = new Button({ text: 'File', menu: [{ text: 'One' }] });
    page(b);
    await settle();
    b.busy = true;
    expect(b.open()).toBe(false);
    b.busy = false;
    b.open();
    b.menu = [{ text: 'One' }, { text: 'Two' }];
    expect(items(b)).toHaveLength(2);
    b.enabled = false;
    expect(shown(b)).toBe(false);
    expect(b.open()).toBe(false);
  });

  it('follows functions in menu items while the menu is open, keeping focus in place', async () => {
    const s = reactive({ name: 'Bob', canDelete: false, wrap: false, showHelp: true });
    const b = new Button({
      text: 'Edit',
      menu: [
        { text: () => `Rename ${s.name}…` },
        { text: 'Delete', enabled: () => s.canDelete },
        { text: 'Word wrap', checked: () => s.wrap },
        { text: 'Help', visible: () => s.showHelp },
      ],
    });
    page(b);
    await settle();
    b.open();
    press('ArrowDown');
    expect(items(b).map((i) => i.textContent)).toEqual(['Rename Bob…', 'Delete', 'Word wrap', 'Help']);
    expect(document.activeElement).toBe(items(b)[1]);

    Object.assign(s, { name: 'Ann', canDelete: true, wrap: true, showHelp: false });
    await settle();
    expect(items(b).map((i) => i.textContent)).toEqual(['Rename Ann…', 'Delete', 'Word wrap']);
    expect(items(b)[1].hasAttribute('aria-disabled')).toBe(false);
    expect(items(b)[2].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(items(b)[1]);
    expect(shown(b)).toBe(true);
  });

  it('follows split, menu and dropDown given as functions', async () => {
    const s = reactive({ split: false, extra: false });
    let b!: Button;
    page(<Button ref={(x: Button) => (b = x)} text="Save" split={() => s.split} menu={() => [{ text: 'One' }, ...(s.extra ? [{ text: 'Two' }] : [])]} />);
    await settle();
    b.open();
    expect(items(b)).toHaveLength(1);
    s.extra = true;
    await settle();
    expect(items(b)).toHaveLength(2);
    s.split = true;
    await settle();
    expect(arrow(b)).not.toBeNull();
  });

  it('reads functions over plain data again on reState: its props and the items of the open menu', async () => {
    const plain = { text: 'Edit', name: 'Bob', canDelete: false };
    const b = new Button({
      text: () => plain.text,
      menu: [{ text: () => `Rename ${plain.name}…` }, { text: 'Delete', enabled: () => plain.canDelete }],
    });
    const host = page(b);
    await settle();
    b.open();
    Object.assign(plain, { text: 'Change', name: 'Ann', canDelete: true });
    await settle();
    expect(items(b)[0].textContent).toBe('Rename Bob…');
    host.reState();
    expect(b.element.textContent).toContain('Change');
    expect(items(b)[0].textContent).toBe('Rename Ann…');
    expect(items(b)[1].hasAttribute('aria-disabled')).toBe(false);
    expect(plain).toEqual({ text: 'Change', name: 'Ann', canDelete: true });
  });

  it('does not report menu clicks as clicks of the button', async () => {
    const clicked = vi.fn();
    const b = new Button({ text: 'Save', split: true, menu: [{ text: 'Save as…' }] });
    b.motif.on('click', clicked);
    page(b);
    await settle();
    b.open();
    items(b)[0].click();
    expect(clicked).not.toHaveBeenCalled();
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very menu items, and shows a change in place after refresh()', async () => {
      const menu = make<MenuItem[]>([{ text: 'Save as' }, { text: 'Export' }]);
      const clicked: unknown[] = [];
      let b!: Button;
      page(<Button ref={(x: Button) => (b = x)} text="Save" split menu={menu} onItemClick={(e: MenuItemClickEventArgs) => void clicked.push(e.item)} />);
      await settle();
      b.open();
      const labels = () => items(b).map((i) => i.querySelector('.mx-menu__label')!.textContent);
      menu[0].text = 'Save a copy';
      menu.push({ text: 'Print' });
      await settle();
      expect(labels()).toEqual(['Save as', 'Export']);
      b.refresh();
      expect(labels()).toEqual(['Save a copy', 'Export', 'Print']);
      items(b)[2].click();
      expect(clicked[0]).toBe(menu[2]);
    });
  });
});

/** A condition changes its branch on a later task. */
const settled = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('an icon written as a condition in JSX', () => {
  it('shows the branch of the condition and follows it', async () => {
    const s = reactive({ on: false });
    const host = page(<Button text="Favorite" icon={s.on ? <i class="on" /> : <i class="off" />} />);
    await settled();
    const box = host.element.querySelector('.mx-button__icon')!;
    expect(box.querySelector('.off')).not.toBeNull();
    s.on = true;
    await settled();
    expect(box.querySelector('.on')).not.toBeNull();
    expect(box.querySelector('.off')).toBeNull();
  });

  it('is removed with the button', async () => {
    const s = reactive({ on: false });
    const b = new Button({ text: 'Favorite' });
    b.icon = () => (s.on ? <i class="on" /> : <i class="off" />);
    page(b);
    await settle();
    b.icon = null;
    await settle();
    expect(b.element.querySelector('.mx-button__icon')).toBeNull();
  });
});
