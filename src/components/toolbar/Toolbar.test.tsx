import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { TextBox } from '../textbox/TextBox';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemType } from './toolbar-item-type';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import { Toolbar } from './Toolbar';
import { ToolbarSeparator } from './ToolbarSeparator';
import { dataKinds } from '../../../tests/data-kinds';
import type { MenuItem } from '../../parts/menu/menu-item';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 8; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const faces = (t: Toolbar) =>
  Array.from(t.element.querySelectorAll<HTMLElement>(':scope > .mx-button:not(.mx-toolbar__more)')).map((b) => b.querySelector<HTMLElement>('.mx-button__main') ?? b);
const more = (t: Toolbar) => t.element.querySelector<HTMLElement>('.mx-toolbar__more');
const moreFace = (t: Toolbar) => more(t)!.querySelector<HTMLButtonElement>('.mx-button__main')!;
const moreItems = (t: Toolbar) => Array.from(more(t)!.querySelectorAll<HTMLButtonElement>('.mx-menu__item'));
const name = (el: Element) => el.querySelector('.mx-menu__label')!.textContent;
const tabbable = (t: Toolbar) => Array.from(t.element.querySelectorAll<HTMLElement>('button, input')).filter((el) => el.tabIndex === 0 && !(el as HTMLButtonElement).disabled && !el.closest('[data-idle], [data-overflowed]'));

function formatItems(s: { bold: boolean; italic: boolean; log: string[] }): ToolbarItem[] {
  return [
    { type: 'toggle', text: '&Bold', pressed: () => s.bold, click: () => (s.bold = !s.bold) },
    { type: 'toggle', text: 'Italic', pressed: () => s.italic, click: () => (s.italic = !s.italic) },
    { type: 'separator' },
    { text: 'Undo', hint: 'Undo the last change', click: () => void s.log.push('undo') },
    { type: 'menu', text: 'Insert', menu: [{ text: 'Table', click: () => void s.log.push('table') }] },
  ];
}

describe('Toolbar', () => {
  it('is a toolbar of buttons made from items, then its JSX children, the same from JSX and from code', async () => {
    const s = reactive({ bold: false, italic: true, log: [] as string[], label: 'Format' });
    let jsx!: Toolbar;
    page(
      <Toolbar ref={(t: Toolbar) => (jsx = t)} label={() => s.label} items={formatItems(s)} class="extra">
        <Button text="Share" />
      </Toolbar>,
    );
    const coded = new Toolbar({ label: 'Actions' });
    page(coded);
    coded.controls.add(new Button({ text: 'Refresh' }));
    await settle();

    expect(jsx.element.getAttribute('role')).toBe('toolbar');
    expect(jsx.element.getAttribute('aria-label')).toBe('Format');
    expect(jsx.element.getAttribute('aria-orientation')).toBe('horizontal');
    expect(jsx.element.className).toContain('extra');
    expect(faces(jsx).map((f) => f.textContent)).toEqual(['Bold', 'Italic', 'Undo', 'Insert', 'Share']);
    expect(faces(jsx).map((f) => f.getAttribute('aria-pressed'))).toEqual(['false', 'true', null, null, null]);
    expect(faces(jsx)[2].title).toBe('Undo the last change');
    expect(faces(jsx)[3].getAttribute('aria-haspopup')).toBe('menu');
    const separator = jsx.element.querySelector('.mx-toolbar__separator')!;
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(faces(coded).map((f) => f.textContent)).toEqual(['Refresh']);

    s.label = 'Text';
    await settle();
    expect(jsx.element.getAttribute('aria-label')).toBe('Text');
  });

  it('runs an item, keeps a toggle with its state and reports it', async () => {
    const s = reactive({ bold: false, italic: false, log: [] as string[] });
    const pressed: ToolbarItemClickEventArgs[] = [];
    const t = new Toolbar({ items: formatItems(s), onItemClick: (e) => void pressed.push(e) });
    page(t);
    await settle();
    faces(t)[0].click();
    await settle();
    expect(s.bold).toBe(true);
    expect(faces(t)[0].getAttribute('aria-pressed')).toBe('true');
    s.bold = false;
    await settle();
    expect(faces(t)[0].getAttribute('aria-pressed')).toBe('false');
    faces(t)[2].click();
    expect(s.log).toEqual(['undo']);
    expect(pressed.map((e) => [e.item.text, e.source === t])).toEqual([
      ['&Bold', true],
      ['Undo', true],
    ]);
  });

  it('is one Tab stop; the arrows, Home and End move between its controls and wrap around', async () => {
    const s = reactive({ bold: false, italic: false, log: [] as string[] });
    const t = new Toolbar({ items: formatItems(s) });
    page(<input name="before" />, t, <input name="after" />);
    await settle();
    expect(tabbable(t)).toEqual([faces(t)[0]]);
    expect(t.focus()).toBe(true);
    expect(document.activeElement).toBe(faces(t)[0]);
    expect(press('ArrowRight')).toBe(true);
    expect(document.activeElement).toBe(faces(t)[1]);
    expect(tabbable(t)).toEqual([faces(t)[1]]);
    press('ArrowRight');
    expect(document.activeElement).toBe(faces(t)[2]);
    press('End');
    expect(document.activeElement).toBe(faces(t)[3]);
    press('ArrowRight');
    expect(document.activeElement).toBe(faces(t)[0]);
    press('ArrowLeft');
    expect(document.activeElement).toBe(faces(t)[3]);
    press('Home');
    expect(document.activeElement).toBe(faces(t)[0]);
    // Up and Down belong to the controls in a horizontal toolbar (a menu button opens).
    expect(press('ArrowDown')).toBe(false);
  });

  it('leaves the arrows to a text field inside, and reaches it with them', async () => {
    let t!: Toolbar;
    page(
      <Toolbar ref={(x: Toolbar) => (t = x)} label="Find">
        <Button text="Prev" />
        <TextBox label="Find" labelMode="hidden" />
        <Button text="Next" />
      </Toolbar>,
    );
    await settle();
    const input = t.element.querySelector('input')!;
    t.focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(input);
    expect(input.tabIndex).toBe(0);
    expect(press('ArrowRight')).toBe(false);
    expect(press('Home')).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('follows the reading direction and the orientation', async () => {
    const t = new Toolbar({ items: [{ text: 'A' }, { text: 'B' }], orientation: 'vertical' });
    page(t);
    await settle();
    expect(t.element.dataset.orientation).toBe('vertical');
    expect(t.element.getAttribute('aria-orientation')).toBe('vertical');
    t.focus();
    expect(press('ArrowRight')).toBe(false);
    press('ArrowDown');
    expect(document.activeElement).toBe(faces(t)[1]);

    t.orientation = 'horizontal';
    t.element.style.direction = 'rtl';
    press('ArrowLeft');
    expect(document.activeElement).toBe(faces(t)[0]);
  });

  it('gives its size and button variant to the controls that have none', async () => {
    const s = reactive({ size: 'sm' as 'sm' | 'lg' });
    let t!: Toolbar;
    page(
      <Toolbar ref={(x: Toolbar) => (t = x)} size={() => s.size} items={[{ text: 'Item' }]}>
        <Button text="Plain" />
        <Button text="Own" size="lg" variant="solid" />
        <TextBox label="Find" />
      </Toolbar>,
    );
    await settle();
    const buttons = Array.from(t.element.querySelectorAll<HTMLElement>(':scope > .mx-button'));
    // Without a buttonVariant the toolbar's place decides the look in CSS (jsdom has none): no variant is forced.
    expect(buttons.map((b) => [b.dataset.size, b.dataset.variant])).toEqual([
      ['sm', 'solid'],
      ['sm', 'solid'],
      ['lg', 'solid'],
    ]);
    expect(t.element.querySelector<HTMLElement>('.mx-field')!.dataset.size).toBe('sm');
    s.size = 'lg';
    t.buttonVariant = 'outline';
    await settle();
    expect(buttons.map((b) => [b.dataset.size, b.dataset.variant])).toEqual([
      ['lg', 'outline'],
      ['lg', 'outline'],
      ['lg', 'solid'],
    ]);
  });

  it('moves items into the "more" menu with their names, checks and menus', async () => {
    const s = reactive({ bold: true, italic: false, log: [] as string[] });
    const items: ToolbarItem[] = [
      { text: 'Save', overflow: 'never' },
      { type: 'separator' },
      { type: 'toggle', icon: '/bold.svg', hint: 'Bold', pressed: () => s.bold, click: () => (s.bold = !s.bold), overflow: 'always' },
      { type: 'menu', text: 'Insert', menu: [{ text: 'Table', click: () => void s.log.push('table') }], overflow: 'always' },
      { text: '&Print', click: () => void s.log.push('print'), overflow: 'always' },
    ];
    const t = new Toolbar({ items });
    page(t);
    await settle();
    expect(more(t)!.hasAttribute('data-idle')).toBe(false);
    expect(moreFace(t).getAttribute('aria-label')).toBe('More options');
    expect(t.overflowed).toEqual([t.controlOf(items[2]), t.controlOf(items[3]), t.controlOf(items[4])]);
    expect(t.controlOf(items[2])!.element.hasAttribute('data-overflowed')).toBe(true);
    // The separator before them has nothing after it in the bar.
    expect(t.controlOf(items[1])!.element.hasAttribute('data-overflowed')).toBe(true);
    expect(tabbable(t).length).toBe(1);
    t.focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(moreFace(t));

    moreFace(t).click();
    expect(moreItems(t).map(name)).toEqual(['Bold', 'Insert', 'Print']);
    expect(moreItems(t)[0].getAttribute('role')).toBe('menuitemcheckbox');
    expect(moreItems(t)[0].getAttribute('aria-checked')).toBe('true');
    expect(moreItems(t)[0].querySelector('.mx-menu__icon img')!.getAttribute('src')).toBe('/bold.svg');
    expect(moreItems(t)[1].getAttribute('aria-haspopup')).toBe('menu');

    moreItems(t)[0].click();
    await settle();
    expect(s.bold).toBe(false);
    moreFace(t).click();
    press('p');
    expect(s.log).toEqual(['print']);

    moreFace(t).click();
    press('ArrowDown');
    press('ArrowRight');
    (document.activeElement as HTMLElement).click();
    expect(s.log).toEqual(['print', 'table']);

    uiLocale.strings = trStrings;
    await settle();
    expect(moreFace(t).getAttribute('aria-label')).toBe('Diğer seçenekler');
  });

  it('keeps a button\'s tone on its item in the "more" menu', async () => {
    let t!: Toolbar;
    page(
      <Toolbar ref={(x: Toolbar) => (t = x)}>
        <Button text="Delete" tone="danger" data-overflow="always" />
        <Button text="Print" data-overflow="always" />
      </Toolbar>,
    );
    await settle();
    moreFace(t).click();
    expect(moreItems(t).map((item) => item.getAttribute('data-tone'))).toEqual(['danger', null]);
  });

  it('keeps an icon-only button named in the "more" menu, and puts a moved one back', async () => {
    const s = reactive({ out: 'always' as 'always' | 'auto' });
    let t!: Toolbar;
    page(
      <Toolbar ref={(x: Toolbar) => (t = x)} items={[{ icon: '/cut.svg', hint: 'Cut', overflow: () => s.out }]}>
        <Button icon="/copy.svg" aria-label="Copy" data-overflow="always" />
        <ToolbarSeparator />
      </Toolbar>,
    );
    await settle();
    moreFace(t).click();
    expect(moreItems(t).map(name)).toEqual(['Cut', 'Copy']);
    s.out = 'auto';
    await settle();
    expect(t.overflowed.length).toBe(1);
    t.overflow = 'wrap';
    await settle();
    expect(t.overflowed.length).toBe(0);
    expect(more(t)!.hasAttribute('data-idle')).toBe(true);
    expect(t.element.dataset.overflow).toBe('wrap');
  });

  it('follows controls added and disabled from code', async () => {
    const t = new Toolbar({ items: [{ text: 'A' }] });
    page(t);
    await settle();
    const b = new Button({ text: 'B' });
    t.controls.add(b);
    await settle();
    t.focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(faces(t)[1]);
    expect((b.element as HTMLElement).dataset.size).toBe('md');
    b.enabled = false;
    await settle();
    expect(tabbable(t)).toEqual([faces(t)[0]]);
  });

  it('can leave the Tab order, and follows items that change', async () => {
    const s = reactive({ items: [{ text: 'A' }] as { text: string }[] });
    const t = new Toolbar({ items: () => s.items, tabStop: false });
    page(t);
    await settle();
    expect(tabbable(t)).toEqual([]);
    t.tabStop = true;
    await settle();
    expect(tabbable(t)).toEqual([faces(t)[0]]);
    const a = s.items[0];
    s.items = [{ text: 'Z' }, a];
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['Z', 'A']);
    expect(t.controlOf(a)).toBe(t.controlOf(s.items[1]));
  });

  it('reads functions over plain data again on reState: the item list, an item\'s type and its fields', async () => {
    const plain = { items: [{ text: 'A' }] as ToolbarItem[], save: 'Save', kind: 'button' as ToolbarItemType, shown: false };
    const saveItem: ToolbarItem = { text: () => plain.save, type: () => plain.kind };
    plain.items = [saveItem, { text: 'B', visible: () => plain.shown }];
    const given = JSON.stringify(plain.items.map((item) => Object.keys(item)));
    const t = new Toolbar({ items: () => plain.items });
    const host = page(t);
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['Save']);
    Object.assign(plain, { save: 'Store', kind: 'toggle', shown: true });
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['Save']);
    host.reState();
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['Store', 'B']);
    expect(faces(t)[0].hasAttribute('aria-pressed')).toBe(true);
    plain.items = [{ text: 'Z' }, ...plain.items];
    t.reState();
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['Z', 'Store', 'B']);
    expect(JSON.stringify(plain.items.slice(1).map((item) => Object.keys(item)))).toBe(given);
  });

  it('keeps an item hidden from the start out of sight, made with new and added later, in its place when shown', async () => {
    const s = reactive({ shown: false });
    const t = new Toolbar({ items: [{ text: 'A' }, { text: 'B', visible: () => s.shown }, { text: 'C' }] });
    await settle();
    page(t);
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['A', 'C']);
    s.shown = true;
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['A', 'B', 'C']);
    s.shown = false;
    await settle();
    expect(faces(t).map((f) => f.textContent)).toEqual(['A', 'C']);

    const built = new Toolbar({ items: [{ text: 'X', visible: false }, { text: 'Y' }] });
    page(built);
    await settle();
    expect(faces(built).map((f) => f.textContent)).toEqual(['Y']);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const pressed: unknown[] = [];
      const items = make<ToolbarItem[]>([{ text: 'Save', click: (e) => pressed.push(e.item) }, { text: 'Print' }]);
      const t = new Toolbar({ items });
      page(t);
      await settle();
      faces(t)[0].click();
      expect(pressed[0]).toBe(items[0]);
      const save = t.controlOf(items[0]);

      items[0].text = 'Save all';
      items.push({ text: 'Share' });
      await settle();
      expect(faces(t).map((f) => f.textContent)).toEqual(['Save', 'Print']);
      t.refresh();
      await settle();
      expect(faces(t).map((f) => f.textContent)).toEqual(['Save all', 'Print', 'Share']);
      expect(t.controlOf(items[0])).toBe(save);
      items.splice(1, 1);
      t.refresh();
      await settle();
      expect(faces(t).map((f) => f.textContent)).toEqual(['Save all', 'Share']);
    });

    it('moves a split button into the "more" menu with its very menu items, after a line', async () => {
      const chosen: unknown[] = [];
      const menu = make<MenuItem[]>([{ text: 'Save as', click: (e) => chosen.push(e.item) }, { text: 'Save a copy' }]);
      let t!: Toolbar;
      page(
        <Toolbar ref={(x: Toolbar) => (t = x)}>
          <Button text="Save" split menu={menu} data-overflow="always" />
        </Toolbar>,
      );
      await settle();
      moreFace(t).click();
      press('ArrowDown');
      press('ArrowRight');
      await settle();
      const sub = Array.from(document.querySelectorAll<HTMLElement>('.mx-menu')).at(-1)!;
      expect(Array.from(sub.children).map((el) => el.className)).toEqual(['mx-menu__item', 'mx-menu__separator', 'mx-menu__item', 'mx-menu__item']);
      sub.querySelectorAll<HTMLElement>('.mx-menu__item')[1].click();
      expect(chosen[0]).toBe(menu[0]);
    });
  });
});
