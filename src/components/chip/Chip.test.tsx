import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Chip } from './Chip';
import { ChipGroup } from './ChipGroup';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 4; i++) await tick();
}

const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
const part = (chip: Chip, name: string) => chip.element.querySelector<HTMLElement>(`.mx-chip__${name}`)!;

describe('Chip', () => {
  it('shows its text, the same in JSX and programmatically; a plain chip takes no focus', async () => {
    let jsx!: Chip;
    page(<Chip ref={(c: Chip) => (jsx = c)} text="Vegan" class="extra" />);
    const coded = new Chip({ text: 'Beta', size: 'sm', variant: 'outline' });
    page(coded);
    await settle();
    expect(jsx.element.className).toContain('mx-chip');
    expect(jsx.element.className).toContain('extra');
    expect(part(jsx, 'text').textContent).toBe('Vegan');
    expect(jsx.element.dataset.size).toBe('md');
    expect(jsx.element.hasAttribute('tabindex')).toBe(false);
    expect(jsx.element.getAttribute('role')).toBe(null);
    expect(coded.element.dataset.size).toBe('sm');
    expect(coded.element.dataset.variant).toBe('outline');
    expect(jsx.value).toBe('Vegan');
    expect(jsx.element.dataset.tone).toBe('standard');
    jsx.tone = 'success';
    expect(jsx.element.dataset.tone).toBe('success');
  });

  it('turns on and off when selectable, by click and by Space, and says so', async () => {
    const seen: [boolean, boolean][] = [];
    const chip = new Chip({ text: 'Vegan', selectable: true, onSelectedChanged: (e) => seen.push([e.selected, e.byUser]) });
    page(chip);
    await settle();
    expect(chip.element.getAttribute('role')).toBe('button');
    expect(chip.element.getAttribute('aria-pressed')).toBe('false');
    expect(chip.element.getAttribute('tabindex')).toBe('0');
    chip.element.click();
    expect(chip.selected).toBe(true);
    expect(chip.element.hasAttribute('data-selected')).toBe(true);
    expect(chip.element.getAttribute('aria-pressed')).toBe('true');
    key(chip.element, ' ');
    expect(chip.selected).toBe(false);
    chip.selected = true;
    expect(seen).toEqual([
      [true, true],
      [false, true],
      [true, false],
    ]);
  });

  it('follows selected given as a function', async () => {
    const s = reactive({ on: false });
    const chip = new Chip({ text: 'Vegan', selectable: true, selected: () => s.on });
    page(chip);
    await settle();
    s.on = true;
    await settle();
    expect(chip.element.hasAttribute('data-selected')).toBe(true);
  });

  it('asks to be removed from its button and with Delete, named in the kit language', async () => {
    const asked: boolean[] = [];
    const chip = new Chip({ text: 'Ada', removable: true, onRemove: (e) => asked.push(e.byKeyboard) });
    page(chip);
    await settle();
    const remove = part(chip, 'remove');
    expect(remove.hidden).toBe(false);
    expect(remove.getAttribute('aria-label')).toBe('Remove Ada');
    remove.click();
    key(chip.element, 'Delete');
    expect(asked).toEqual([false, true]);
    await uiLocale.use('tr');
    expect(remove.getAttribute('aria-label')).not.toBe('Remove Ada');
    chip.enabled = false;
    remove.click();
    expect(asked.length).toBe(2);
  });

  it('puts an icon or an avatar before the text', async () => {
    const icon = document.createElement('svg');
    const chip = new Chip({ text: 'Ada', icon });
    page(chip);
    await settle();
    expect(part(chip, 'icon').firstChild).toBe(icon);
    expect(chip.element.dataset.lead).toBe('icon');
    chip.icon = null;
    chip.avatar = { name: 'Ada Lovelace' };
    expect(chip.avatarControl?.element.textContent).toBe('AL');
    expect(chip.element.dataset.lead).toBe('avatar');
    const order = Array.from(chip.element.children).map((el) => el.className.split(' ')[0]);
    expect(order.indexOf('mx-avatar')).toBeLessThan(order.indexOf('mx-chip__text'));
  });
});

describe('ChipGroup', () => {
  it('selects one or several, gives a new array, and moves with the arrow keys', async () => {
    const values: unknown[] = [];
    const given = ['a'];
    let group!: ChipGroup;
    page(
      <ChipGroup ref={(g: ChipGroup) => (group = g)} selection="multiple" value={given} label="Diet" onValueChanged={(e) => values.push(e.value)}>
        <Chip text="A" value="a" />
        <Chip text="B" value="b" />
        <Chip text="C" value="c" />
      </ChipGroup>,
    );
    await settle();
    const [a, b, c] = group.chips;
    expect(group.element.getAttribute('role')).toBe('listbox');
    expect(group.element.getAttribute('aria-multiselectable')).toBe('true');
    expect(a.element.getAttribute('role')).toBe('option');
    expect(a.element.getAttribute('aria-selected')).toBe('true');
    expect([a, b, c].map((chip) => chip.element.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    b.element.click();
    expect(group.value).toEqual(['a', 'b']);
    expect(given).toEqual(['a']);
    expect(b.selected).toBe(true);
    a.element.click();
    expect(group.value).toEqual(['b']);
    a.element.focus();
    key(a.element, 'ArrowRight');
    expect(document.activeElement).toBe(b.element);
    key(b.element, 'End');
    expect(document.activeElement).toBe(c.element);
    expect(c.element.getAttribute('tabindex')).toBe('0');
    group.selection = 'single';
    group.value = 'c';
    expect([a, b, c].map((chip) => chip.selected)).toEqual([false, false, true]);
    c.element.click();
    expect(group.value).toBe(null);
    expect(values).toEqual([['a', 'b'], ['b'], 'c', null]);
  });

  it('counts the chips of a JSX list as it changes, and gives chips back their own role without selection', async () => {
    const s = reactive({ tags: [{ name: 'red' }, { name: 'green' }] });
    let group!: ChipGroup;
    page(
      <ChipGroup ref={(g: ChipGroup) => (group = g)} selection="single">
        {s.tags.map((t) => (
          <Chip key={t.name} text={t.name} />
        ))}
      </ChipGroup>,
    );
    await settle();
    expect(group.chips.length).toBe(2);
    s.tags.push({ name: 'blue' });
    await settle();
    expect(group.chips.length).toBe(3);
    expect(group.chips[2].element.getAttribute('role')).toBe('option');
    group.selection = 'none';
    expect(group.element.getAttribute('role')).toBe('group');
    expect(group.chips[0].element.getAttribute('role')).toBe(null);
    expect(group.chips[0].element.hasAttribute('aria-selected')).toBe(false);
  });
});
