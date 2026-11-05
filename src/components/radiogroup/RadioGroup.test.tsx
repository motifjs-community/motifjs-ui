import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import { RadioGroup } from './RadioGroup';
import type { RadioItem } from './radio-item';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
  await uiLocale.use('en');
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

const texts = <T,>(g: RadioGroup<T>) => Array.from(g.element.querySelectorAll('.mx-radio-group__text')).map((t) => t.textContent);
const stops = <T,>(g: RadioGroup<T>) => g.inputs.map((i) => i.tabIndex);

describe('RadioGroup', () => {
  it('is a labelled radiogroup of native radios, the same in JSX and programmatically', async () => {
    let jsx!: RadioGroup<string>;
    page(<RadioGroup ref={(g: RadioGroup<string>) => (jsx = g)} label="&Size" items={['S', 'M', 'L']} helpText="Pick one" />);
    const coded = new RadioGroup<string>({ label: 'Shipping', items: [{ value: 'std', text: 'Standard' }, { value: 'exp', text: 'Express' }] });
    page(coded);
    await settle();

    const list = jsx.listElement;
    const label = jsx.element.querySelector('.mx-field__label')!;
    expect(list.getAttribute('role')).toBe('radiogroup');
    expect(list.getAttribute('aria-labelledby')).toBe(label.id);
    expect(list.getAttribute('aria-orientation')).toBe('vertical');
    expect(list.getAttribute('aria-keyshortcuts')).toBe('Alt+S');
    expect(texts(jsx)).toEqual(['S', 'M', 'L']);
    expect(jsx.inputs.every((i) => i.type === 'radio' && i.name === jsx.inputs[0].name && !!i.name)).toBe(true);
    expect(jsx.inputs[0].closest('label')!.textContent).toBe('S');
    expect(jsx.value).toBe(null);
    expect(stops(jsx)).toEqual([0, -1, -1]);

    coded.value = 'exp';
    expect(texts(coded)).toEqual(['Standard', 'Express']);
    expect(coded.inputs.map((i) => i.checked)).toEqual([false, true]);
    expect(stops(coded)).toEqual([-1, 0]);
    expect(coded.inputs[0].name).not.toBe(jsx.inputs[0].name);
  });

  it('binds the value two-way with x-model', async () => {
    const s = reactive({ size: 'M' });
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} items={['S', 'M', 'L']} x-model={() => s.size} />);
    await settle();
    expect(g.inputs[1].checked).toBe(true);
    g.inputs[2].click();
    expect(s.size).toBe('L');
    expect(stops(g)).toEqual([-1, -1, 0]);
    s.size = 'S';
    await settle();
    expect(g.inputs.map((i) => i.checked)).toEqual([true, false, false]);
  });

  it('reads functions over plain data again on reState, and writes a value set programmatically to x-model', async () => {
    const plain = { size: 'M', large: 'Large', canXl: false };
    const items = [{ value: 'S', text: 'Small' }, { value: 'L', text: () => plain.large }, { value: 'XL', text: 'Extra', enabled: () => plain.canXl }];
    const s = reactive({ size: 'S' });
    let g!: RadioGroup<string>;
    let m!: RadioGroup<string>;
    const host = page(
      <RadioGroup ref={(x: RadioGroup<string>) => (g = x)} items={items} value={() => plain.size} />,
      <RadioGroup ref={(x: RadioGroup<string>) => (m = x)} items={['S', 'M', 'L']} x-model={() => s.size} />,
    );
    await settle();
    Object.assign(plain, { size: 'L', large: 'Big', canXl: true });
    await settle();
    expect(texts(g)).toEqual(['Small', 'Large', 'Extra']);
    host.reState();
    expect(texts(g)).toEqual(['Small', 'Big', 'Extra']);
    expect(g.inputs.map((i) => i.checked)).toEqual([false, true, false]);
    expect(g.inputs[2].disabled).toBe(false);
    g.inputs[0].click();
    expect(plain.size).toBe('L');
    expect(Object.keys(items[1])).toEqual(['value', 'text']);
    m.value = 'L';
    expect(s.size).toBe('L');
  });

  it('moves and chooses with the arrow keys, wrapping and skipping disabled and hidden items', async () => {
    const s = reactive({ v: 1 as number | null });
    const items: RadioItem<number>[] = [
      { value: 1, text: 'One' },
      { value: 2, text: 'Two', enabled: false },
      { value: 3, text: 'Three' },
      { value: 4, text: 'Four', visible: false },
    ];
    let g!: RadioGroup<number>;
    page(<RadioGroup ref={(x: RadioGroup<number>) => (g = x)} items={items} x-model={() => s.v} />);
    await settle();
    expect(g.inputs[1].disabled).toBe(true);
    expect(g.element.querySelectorAll('.mx-radio-group__item')[3].hasAttribute('hidden')).toBe(true);

    g.focus();
    expect(document.activeElement).toBe(g.inputs[0]);
    expect(press(g.inputs[0], 'ArrowDown')).toBe(true);
    expect(s.v).toBe(3);
    expect(document.activeElement).toBe(g.inputs[2]);
    press(g.inputs[2], 'ArrowRight');
    expect(s.v).toBe(1);
    press(g.inputs[0], 'ArrowUp');
    expect(s.v).toBe(3);
    press(g.inputs[2], 'ArrowLeft');
    expect(s.v).toBe(1);
    expect(press(g.inputs[0], 'Home')).toBe(false);
  });

  it('turns the horizontal arrows around right to left', async () => {
    document.documentElement.dir = 'rtl';
    const s = reactive({ v: 'a' });
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} orientation="horizontal" items={['a', 'b', 'c']} x-model={() => s.v} />);
    await settle();
    expect(g.element.dataset.orientation).toBe('horizontal');
    expect(g.listElement.getAttribute('aria-orientation')).toBe('horizontal');
    press(g.inputs[0], 'ArrowLeft');
    expect(s.v).toBe('b');
    press(g.inputs[1], 'ArrowRight');
    expect(s.v).toBe('a');
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('shows items changed in place after refresh(), keeping focus where it is', async () => {
      const plans = make([
        { id: 1, name: 'Free', open: true },
        { id: 2, name: 'Pro', open: true },
      ]);
      const s = reactive({ plan: 2 });
      let g!: RadioGroup<number>;
      page(
        <RadioGroup
          ref={(x: RadioGroup<number>) => (g = x)}
          items={() => plans}
          itemText={(p) => (p as { name: string }).name}
          itemValue="id"
          x-model={() => s.plan}
        />,
      );
      await settle();
      expect(texts(g)).toEqual(['Free', 'Pro']);
      g.focus();
      const focused = document.activeElement;

      plans.push({ id: 3, name: 'Team', open: true });
      plans[1].name = 'Pro+';
      await settle();
      expect(texts(g)).toEqual(['Free', 'Pro']);
      g.refresh();
      await settle();
      expect(texts(g)).toEqual(['Free', 'Pro+', 'Team']);
      expect(document.activeElement).toBe(focused);
      expect(g.inputs[1].checked).toBe(true);

      plans.splice(0, 1);
      g.refresh();
      await settle();
      expect(texts(g)).toEqual(['Pro+', 'Team']);
      expect(g.inputs[0].checked).toBe(true);
    });

    it('gives back the very item that is its own value', async () => {
      const sizes = make([{ text: 'Small' }, { text: 'Large' }]);
      const changed = vi.fn();
      let g!: RadioGroup<{ text: string }>;
      page(<RadioGroup ref={(x: RadioGroup<{ text: string }>) => (g = x)} items={sizes} onValueChanged={changed} />);
      await settle();
      g.inputs[1].click();
      await settle();
      expect(g.value).toBe(sizes[1]);
      expect(changed.mock.calls[0][0].value).toBe(sizes[1]);
      expect(changed).toHaveBeenCalledTimes(1);
    });
  });

  it('reads per-item hint, help text and enabled live', async () => {
    const s = reactive({ can: false, help: 'Ships in a day' });
    let g!: RadioGroup<string>;
    page(
      <RadioGroup
        ref={(x: RadioGroup<string>) => (g = x)}
        items={[
          { value: 'std', text: 'Standard', hint: 'The usual way' },
          { value: 'exp', text: 'Express', helpText: () => s.help, enabled: () => s.can },
        ]}
      />,
    );
    await settle();
    const [std, exp] = Array.from(g.element.querySelectorAll<HTMLElement>('.mx-radio-group__item'));
    expect(std.title).toBe('The usual way');
    const help = exp.querySelector('.mx-radio-group__help')!;
    expect(help.textContent).toBe('Ships in a day');
    expect(g.inputs[1].getAttribute('aria-describedby')).toBe(help.id);
    expect(g.inputs[1].closest('label')!.textContent).toBe('Express');
    expect(g.inputs[1].disabled).toBe(true);
    s.can = true;
    s.help = 'Ships today';
    await settle();
    expect(g.inputs[1].disabled).toBe(false);
    expect(help.textContent).toBe('Ships today');
  });

  it('is read-only: arrows move without choosing, a click changes nothing', async () => {
    const s = reactive({ v: 'a' });
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} readOnly items={['a', 'b', 'c']} x-model={() => s.v} />);
    await settle();
    expect(g.listElement.getAttribute('aria-readonly')).toBe('true');
    g.inputs[1].click();
    expect(s.v).toBe('a');
    expect(g.inputs[0].checked).toBe(true);
    g.focus();
    press(g.inputs[0], 'ArrowDown');
    expect(document.activeElement).toBe(g.inputs[1]);
    expect(s.v).toBe('a');
    expect(stops(g)).toEqual([-1, 0, -1]);
  });

  it('is disabled as a whole, keeping disabled items disabled after', async () => {
    const s = reactive({ on: true });
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} enabled={() => s.on} items={[{ value: 'a' }, { value: 'b', enabled: false }]} />);
    await settle();
    s.on = false;
    await settle();
    expect(g.inputs.map((i) => i.disabled)).toEqual([true, true]);
    expect(g.focus()).toBe(false);
    s.on = true;
    await settle();
    expect(g.inputs.map((i) => i.disabled)).toEqual([false, true]);
  });

  it('lays the options out in columns and takes them out of the Tab order on request', async () => {
    const s = reactive({ columns: 2, tab: true });
    let g!: RadioGroup<number>;
    page(<RadioGroup ref={(x: RadioGroup<number>) => (g = x)} columns={() => s.columns} tabStop={() => s.tab} items={[1, 2, 3, 4, 5]} />);
    await settle();
    expect(g.element.hasAttribute('data-columns')).toBe(true);
    expect(g.listElement.style.getPropertyValue('--_columns')).toBe('2');
    expect(g.listElement.style.getPropertyValue('--_rows')).toBe('3');
    s.columns = 0;
    s.tab = false;
    await settle();
    expect(g.element.hasAttribute('data-columns')).toBe(false);
    expect(stops(g)).toEqual([-1, -1, -1, -1, -1]);
    expect(g.listElement.hasAttribute('tabindex')).toBe(false);
    s.tab = true;
    await settle();
    expect(stops(g)).toEqual([0, -1, -1, -1, -1]);
  });

  it('needs a choice when required, focuses the first option and speaks the locale', async () => {
    const group = new ValidationGroup();
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} label="Plan" required validationGroup={group} items={['a', 'b']} />);
    await settle();
    expect(g.listElement.getAttribute('aria-required')).toBe('true');
    expect((await group.validate()).valid).toBe(false);
    expect(document.activeElement).toBe(g.inputs[0]);
    expect(g.listElement.getAttribute('aria-invalid')).toBe('true');
    await uiLocale.use('tr');
    await settle();
    expect(g.element.querySelector('.mx-field__message')!.textContent).toBe('Bu alan zorunludur.');
    g.inputs[1].click();
    await settle();
    expect(g.isValid).toBe(true);
  });

  it('focuses from its access key and its label, and takes a form name', async () => {
    const s = reactive({ name: 'plan' });
    let g!: RadioGroup<string>;
    page(<RadioGroup ref={(x: RadioGroup<string>) => (g = x)} label="&Plan" name={() => s.name} items={['a', 'b']} value="b" />);
    await settle();
    expect(g.inputs.map((i) => i.name)).toEqual(['plan', 'plan']);
    press(document.body, 'p', { altKey: true, code: 'KeyP' });
    expect(document.activeElement).toBe(g.inputs[1]);
    (document.activeElement as HTMLElement).blur();
    (g.element.querySelector('.mx-field__label') as HTMLElement).click();
    expect(document.activeElement).toBe(g.inputs[1]);
    s.name = 'tier';
    await settle();
    expect(g.inputs[0].name).toBe('tier');
  });
});
