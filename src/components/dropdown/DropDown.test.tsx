import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DropDown } from './DropDown';

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
  for (let i = 0; i < 6; i++) await tick();
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

const display = (d: { element: HTMLElement }) => d.element.querySelector<HTMLElement>('[role="combobox"]')!;
const shownText = (d: { element: HTMLElement }) => d.element.querySelector('.mx-drop-down__text')!.textContent;
const options = (d: { element: HTMLElement }) => Array.from(d.element.querySelectorAll<HTMLElement>('[role="option"]'));
const active = (d: { element: HTMLElement }) => d.element.querySelector<HTMLElement>('[role="option"][data-active]')?.textContent;
const popupShown = (d: { element: HTMLElement }) => !!d.element.querySelector('.mx-popup') && !d.element.querySelector<HTMLElement>('.mx-popup')!.hidden;

const CITIES = ['Ankara', 'Bursa', 'İstanbul', 'İzmir', 'Konya'];

describe('DropDown', () => {
  it('is a labelled combobox showing the chosen item, the same from JSX and from code', async () => {
    const s = reactive({ city: 'Bursa' as string | null });
    let jsx!: DropDown<string, string>;
    page(<DropDown ref={(d: DropDown<string, string>) => (jsx = d)} label="&City" items={CITIES} x-model={() => s.city} />);
    const coded = new DropDown({ label: 'Size', items: ['S', 'M', 'L'], placeholder: 'Pick one' });
    page(coded);
    await settle();

    const box = display(jsx);
    expect(box.getAttribute('aria-haspopup')).toBe('listbox');
    expect(box.getAttribute('aria-expanded')).toBe('false');
    expect(box.getAttribute('aria-labelledby')).toBe(jsx.element.querySelector('label')!.id);
    expect(box.getAttribute('aria-keyshortcuts')).toBe('Alt+C');
    expect(shownText(jsx)).toBe('Bursa');
    s.city = 'Konya';
    await settle();
    expect(shownText(jsx)).toBe('Konya');

    expect(shownText(coded)).toBe('Pick one');
    coded.value = 'M';
    await settle();
    expect(shownText(coded)).toBe('M');
    expect(coded.selectedItem).toBe('M');
  });

  it('reads functions over plain data again on reState: the field, the open list and its items', async () => {
    const plain = { city: 'Bursa', items: ['Ankara', 'Bursa'], placeholder: 'Pick' };
    const given = plain.items;
    const s = reactive({ city: 'Ankara' as string | null });
    let d!: DropDown<string, string>;
    let m!: DropDown<string, string>;
    const host = page(
      <DropDown ref={(x: DropDown<string, string>) => (d = x)} items={() => plain.items} value={() => plain.city} placeholder={() => plain.placeholder} />,
      <DropDown ref={(x: DropDown<string, string>) => (m = x)} items={CITIES} x-model={() => s.city} />,
    );
    await settle();
    d.open();
    await settle();
    plain.items = ['Ankara', 'Bursa', 'Konya'];
    plain.city = 'Konya';
    await settle();
    expect(shownText(d)).toBe('Bursa');
    host.reState();
    await settle();
    expect(shownText(d)).toBe('Konya');
    expect(options(d).map((o) => o.textContent)).toEqual(['Ankara', 'Bursa', 'Konya']);
    expect(given).toEqual(['Ankara', 'Bursa']);
    m.value = 'İzmir';
    expect(s.city).toBe('İzmir');
    m.clear();
    expect(s.city).toBeNull();
  });

  it('opens with the keyboard on the chosen item and chooses with Enter', async () => {
    const s = reactive({ city: 'Bursa' as string | null });
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} x-model={() => s.city} />);
    await settle();
    display(d).focus();
    expect(press(display(d), 'ArrowDown')).toBe(true);
    expect(popupShown(d)).toBe(true);
    expect(d.opened).toBe(true);
    expect(display(d).getAttribute('aria-expanded')).toBe('true');
    expect(active(d)).toBe('Bursa');
    expect(options(d).find((o) => o.textContent === 'Bursa')!.getAttribute('aria-selected')).toBe('true');
    expect(display(d).getAttribute('aria-activedescendant')).toBe(options(d)[1].id);

    press(display(d), 'ArrowDown');
    press(display(d), 'ArrowDown');
    expect(active(d)).toBe('İzmir');
    press(display(d), 'End');
    expect(active(d)).toBe('Konya');
    press(display(d), 'Home');
    press(display(d), 'Enter');
    expect(s.city).toBe('Ankara');
    expect(popupShown(d)).toBe(false);
    expect(document.activeElement).toBe(display(d));
    expect(display(d).hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('closes on Escape without choosing, and Tab chooses the highlighted item', async () => {
    const s = reactive({ city: 'Bursa' as string | null });
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} x-model={() => s.city} />);
    await settle();
    display(d).focus();
    d.open();
    press(display(d), 'ArrowDown');
    d.element.querySelector('.mx-popup')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    // Escape on the field reaches the popup through the list owner.
    press(display(d), 'Escape');
    expect(s.city).toBe('Bursa');
    d.open();
    press(display(d), 'ArrowDown');
    press(display(d), 'Tab');
    expect(s.city).toBe('İstanbul');
    expect(d.opened).toBe(false);
  });

  it('jumps to an item by typing, open or closed', async () => {
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} />);
    await settle();
    display(d).focus();
    press(display(d), 'k');
    expect(d.opened).toBe(true);
    expect(active(d)).toBe('Konya');
    // Letters typed close together search together: "ki" finds nothing, the highlight stays.
    press(display(d), 'i');
    expect(active(d)).toBe('Konya');
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 1000);
    press(display(d), 'i');
    expect(active(d)).toBe('İstanbul');
    clock.mockReturnValue(now + 2000);
    press(display(d), 'i');
    expect(active(d)).toBe('İzmir');
    clock.mockRestore();
  });

  it('chooses with a click and toggles from a press on the box', async () => {
    const onClosed = vi.fn();
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} onClosed={onClosed} />);
    await settle();
    d.element.querySelector<HTMLElement>('.mx-drop-down__chevron')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(d.opened).toBe(true);
    options(d)[3].click();
    expect(d.value).toBe('İzmir');
    expect(d.opened).toBe(false);
    expect(onClosed).toHaveBeenCalledWith('code');
  });

  it('reads objects of any shape, with groups, icons and disabled items', async () => {
    const people = [
      { id: 1, name: 'Ada', team: 'Core', away: false },
      { id: 2, name: 'Grace', team: 'Core', away: true },
      { id: 3, name: 'Linus', team: 'Tools', away: false },
    ];
    let d!: DropDown<(typeof people)[number], number>;
    page(
      <DropDown
        ref={(x: DropDown<(typeof people)[number], number>) => (d = x)}
        items={people}
        textField="name"
        valueField="id"
        groupField="team"
        enabledField={(p: (typeof people)[number]) => !p.away}
        iconField={(_p: unknown) => '/i.svg'}
        value={3}
      />,
    );
    await settle();
    expect(shownText(d)).toBe('Linus');
    d.open();
    const groups = Array.from(d.element.querySelectorAll('[role="listbox"] > [role="group"]'));
    expect(groups.map((g) => g.querySelector('.mx-list__header')!.textContent)).toEqual(['Core', 'Tools']);
    expect(options(d)[1].getAttribute('aria-disabled')).toBe('true');
    expect(options(d)[0].querySelector('.mx-list__icon img')).not.toBeNull();
    press(display(d), 'Home');
    press(display(d), 'ArrowDown');
    // The away one is skipped.
    expect(active(d)).toBe('Linus');
    options(d)[1].click();
    expect(d.value).toBe(3);
  });

  it('searches inside the list with a search box', async () => {
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} searchEnabled />);
    await settle();
    display(d).focus();
    d.open();
    const search = d.element.querySelector<HTMLInputElement>('.mx-drop-down__search input')!;
    expect(document.activeElement).toBe(search);
    expect(search.getAttribute('aria-controls')).toBe(d.element.querySelector('[role="listbox"]')!.id);
    search.value = 'zm';
    search.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(options(d).map((o) => o.textContent)).toEqual(['İzmir']);
    expect(search.getAttribute('aria-activedescendant')).toBe(options(d)[0].id);
    press(search, 'Enter');
    expect(d.value).toBe('İzmir');
    expect(document.activeElement).toBe(display(d));
    d.open();
    expect(options(d).length).toBe(5);
  });

  it('says when there is nothing to pick, in the reader’s language', async () => {
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={[]} />);
    await settle();
    d.open();
    expect(d.element.querySelector('.mx-list__empty')!.textContent).toBe('No items');
    uiLocale.strings = trStrings;
    await settle();
    expect(d.element.querySelector('.mx-list__empty')!.textContent).toBe('Öğe yok');
  });

  it('follows items given anew', async () => {
    const s = reactive({ items: [{ value: 1, text: 'One' }] });
    let d!: DropDown<{ value: number; text: string }, number>;
    page(<DropDown ref={(x: DropDown<{ value: number; text: string }, number>) => (d = x)} items={() => s.items} value={2} />);
    await settle();
    s.items = [{ value: 1, text: 'One' }, { value: 2, text: 'Two' }];
    await settle();
    expect(shownText(d)).toBe('Two');
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const items = make([{ value: 1, text: 'One' }, { value: 2, text: 'Two' }]);
      const changed = vi.fn();
      let d!: DropDown<{ value: number; text: string }, number>;
      page(<DropDown ref={(x: DropDown<{ value: number; text: string }, number>) => (d = x)} items={items} value={2} onValueChanged={changed} />);
      await settle();
      expect(d.selectedItem).toBe(items[1]);
      d.open();
      options(d)[0].click();
      await settle();
      expect(d.value).toBe(1);
      expect(d.selectedItem).toBe(items[0]);
      expect(changed).toHaveBeenCalledTimes(1);
      items[0].text = 'Un';
      items.push({ value: 3, text: 'Three' });
      await settle();
      expect(shownText(d)).toBe('One');
      d.refresh();
      await settle();
      expect(shownText(d)).toBe('Un');
      d.open();
      expect(options(d).map((o) => o.textContent)).toEqual(['Un', 'Two', 'Three']);
    });

    it('keeps an object value it wrote to a reactive model as the very item', async () => {
      const items = make([{ name: 'Ada' }, { name: 'Linus' }]);
      const form = reactive({ person: null as { name: string } | null });
      const changed = vi.fn();
      let d!: DropDown<{ name: string }, { name: string }>;
      page(<DropDown ref={(x: DropDown<{ name: string }, { name: string }>) => (d = x)} items={items} textField="name" x-model={() => form.person} onValueChanged={changed} />);
      await settle();
      d.open();
      options(d)[1].click();
      await settle();
      expect(d.value).toBe(items[1]);
      expect(d.selectedItem).toBe(items[1]);
      expect(shownText(d)).toBe('Linus');
      expect(changed).toHaveBeenCalledTimes(1);
    });
  });

  it('empties with its clear button or Escape, and is checked when required', async () => {
    const s = reactive({ city: 'Bursa' as string | null });
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} clearButton required x-model={() => s.city} />);
    await settle();
    expect(press(display(d), 'Escape')).toBe(true);
    expect(s.city).toBeNull();
    expect(press(display(d), 'Escape')).toBe(false);
    expect(await d.validate()).toBe(false);
    expect(d.validationMessage).toBe('This field is required.');
    d.value = 'Konya';
    d.element.querySelector<HTMLButtonElement>('.mx-drop-down__clear')!.click();
    expect(d.value).toBeNull();
  });

  it('does not open while read-only or disabled', async () => {
    const s = reactive({ on: true });
    let d!: DropDown<string, string>;
    page(<DropDown ref={(x: DropDown<string, string>) => (d = x)} items={CITIES} readOnly={() => !s.on} />);
    await settle();
    s.on = false;
    await settle();
    expect(d.open()).toBe(false);
    d.readOnly = false;
    d.enabled = false;
    expect(d.open()).toBe(false);
    d.enabled = true;
    expect(d.open()).toBe(true);
  });

  it('draws only the rows in view of a long list', async () => {
    const items = Array.from({ length: 2000 }, (_, i) => ({ value: i, text: `Item ${i}` }));
    let d!: DropDown<(typeof items)[number], number>;
    page(<DropDown ref={(x: DropDown<(typeof items)[number], number>) => (d = x)} items={items} value={1500} />);
    await settle();
    d.open();
    expect(options(d).length).toBeLessThan(100);
    expect(active(d)).toBe('Item 1500');
    expect(options(d).find((o) => o.textContent === 'Item 1500')!.getAttribute('aria-posinset')).toBe('1501');
    press(display(d), 'End');
    expect(active(d)).toBe('Item 1999');
  });
});
