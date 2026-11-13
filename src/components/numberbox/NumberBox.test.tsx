import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { addDecimal, roundDecimal, shiftDecimal } from './decimal-math';
import { NumberBox } from './NumberBox';
import { parseNumber, plainNumber } from './number-text';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
  vi.useRealTimers();
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

const input = (n: NumberBox) => n.inputPart.element;
const message = (n: NumberBox) => n.element.querySelector('.mx-field__message')!.textContent;
const spinButton = (n: NumberBox, step: 'up' | 'down') => n.element.querySelector<HTMLButtonElement>(`.mx-number-box__step[data-step="${step}"]`)!;

function type(n: NumberBox, text: string) {
  input(n).value = text;
  input(n).dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function press(el: Element, key: string) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

function leave(n: NumberBox) {
  input(n).blur();
}

describe('decimal arithmetic', () => {
  it('adds and rounds without float noise', () => {
    expect(addDecimal(0.1, 0.2)).toBe(0.3);
    expect(addDecimal(1.005, -0.001)).toBe(1.004);
    expect(addDecimal(-0.3, 0.1)).toBe(-0.2);
    expect(roundDecimal(1.005, 2)).toBe(1.01);
    expect(roundDecimal(-2.5, 0)).toBe(-3);
    expect(shiftDecimal(0.07, 2)).toBe(7);
    expect(shiftDecimal(1e-7, 2)).toBe(1e-5);
  });

  it('reads numbers as a locale writes them', () => {
    expect(parseNumber('1.234,5', 'tr-TR')).toBe(1234.5);
    expect(parseNumber('12.5', 'tr-TR')).toBe(12.5);
    expect(parseNumber('1.234', 'tr-TR')).toBe(1234);
    expect(parseNumber('1,234.5', 'en-US')).toBe(1234.5);
    expect(parseNumber('₺1.234,50', 'tr-TR')).toBe(1234.5);
    expect(parseNumber('-12', 'en')).toBe(-12);
    expect(parseNumber('', 'en')).toBeNull();
    expect(parseNumber('-', 'en')).toBeNaN();
    expect(parseNumber('1-2', 'en')).toBeNaN();
    expect(plainNumber(-1234.5, 'tr-TR')).toBe('-1234,5');
  });
});

describe('NumberBox', () => {
  it('is a labelled spin button, the same in JSX and programmatically', async () => {
    let jsx!: NumberBox;
    page(<NumberBox ref={(n: NumberBox) => (jsx = n)} label="&Amount" min={0} max={10} value={4} locale="en" class="extra" />);
    const coded = new NumberBox({ label: 'Count', locale: 'en' });
    page(coded);
    await settle();

    const el = input(jsx);
    expect(el.getAttribute('role')).toBe('spinbutton');
    expect(el.inputMode).toBe('decimal');
    expect(el.getAttribute('aria-valuenow')).toBe('4');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(el.getAttribute('aria-keyshortcuts')).toBe('Alt+A');
    expect(jsx.element.className).toContain('mx-number-box');
    expect(jsx.element.className).toContain('extra');
    expect(el.value).toBe('4');

    coded.value = 1234.5;
    coded.max = 5000;
    expect(input(coded).value).toBe('1,234.5');
    expect(coded.formattedValue).toBe('1,234.5');
    expect(input(coded).getAttribute('aria-valuemax')).toBe('5000');
    coded.value = null;
    expect(input(coded).value).toBe('');
    expect(input(coded).hasAttribute('aria-valuenow')).toBe(false);
  });

  it('binds a number two-way with x-model, as soon as the text is a whole number', async () => {
    const s = reactive({ n: 5 as number | null });
    const seen: ValueChangedEventArgs<number | null>[] = [];
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" x-model={() => s.n} onValueChanged={(e) => seen.push(e)} />);
    await settle();
    input(n).focus();
    type(n, '12.');
    expect(s.n).toBe(5);
    type(n, '12.5');
    expect(s.n).toBe(12.5);
    expect(input(n).value).toBe('12.5');
    type(n, '');
    expect(s.n).toBeNull();
    s.n = 7;
    await settle();
    expect(input(n).value).toBe('7');
    expect(seen.map((e) => [e.value, e.byUser])).toEqual([
      [5, false],
      [12.5, true],
      [null, true],
      [7, false],
    ]);
  });

  it('takes typed text from code as typing does, and only what a number is written with', async () => {
    const s = reactive({ n: 5 as number | null });
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" x-model={() => s.n} />);
    await settle();
    input(n).focus();
    n.typeText('3');
    await settle();
    expect(input(n).value).toBe('3');
    expect(s.n).toBe(3);
    expect([input(n).selectionStart, input(n).selectionEnd]).toEqual([1, 1]);
    n.typeText('a');
    await settle();
    expect(input(n).value).toBe('3');
    expect(s.n).toBe(3);
  });

  it('rounds a value given with more decimals than asked from the start, and writes it to x-model', async () => {
    const s = reactive({ weight: 72.456 as number | null });
    const plain = { weight: 72.456 };
    let n!: NumberBox;
    let p!: NumberBox;
    page(
      <NumberBox ref={(x: NumberBox) => (n = x)} decimals={1} locale="en" x-model={() => s.weight} />,
      <NumberBox ref={(x: NumberBox) => (p = x)} decimals={1} locale="en" value={() => plain.weight} />,
    );
    await settle();
    expect(n.value).toBe(72.5);
    expect(s.weight).toBe(72.5);
    expect(input(n).value).toBe('72.5');
    expect(p.value).toBe(72.5);
    expect(plain.weight).toBe(72.456);
    n.decimals = 0;
    expect(n.value).toBe(73);
    expect(s.weight).toBe(73);
  });

  it('shows exactly decimals digits while not edited, the plain number while edited, unless format says otherwise', async () => {
    let n!: NumberBox;
    let f!: NumberBox;
    page(
      <NumberBox ref={(x: NumberBox) => (n = x)} decimals={2} locale="en" value={72.5} />,
      <NumberBox ref={(x: NumberBox) => (f = x)} decimals={2} format={{ minimumFractionDigits: 0 }} locale="en" value={72.5} />,
    );
    await settle();
    expect(input(n).value).toBe('72.50');
    expect(input(f).value).toBe('72.5');
    input(n).focus();
    await settle();
    expect(input(n).value).toBe('72.5');
    input(n).blur();
    await settle();
    expect(input(n).value).toBe('72.50');
  });

  it('shows its spin buttons again after they were switched off', async () => {
    const s = reactive({ spin: true });
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} showSpinButtons={() => s.spin} />);
    await settle();
    s.spin = false;
    await settle();
    expect(n.element.querySelector('.mx-number-box__step')).toBeNull();
    s.spin = true;
    await settle();
    expect(spinButton(n, 'up').isConnected).toBe(true);
    expect(n.element.querySelectorAll('.mx-number-box__step')).toHaveLength(2);
    n.spinLayout = 'inline';
    expect(n.element.querySelectorAll('.mx-number-box__step')).toHaveLength(2);
  });

  it('reads functions over plain data again on reState, and writes steps and values programmatically to x-model', async () => {
    const plain = { n: 5, max: 10, step: 1 };
    const s = reactive({ qty: 1 as number | null });
    let n!: NumberBox;
    let q!: NumberBox;
    const host = page(
      <NumberBox ref={(x: NumberBox) => (n = x)} locale="en" value={() => plain.n} max={() => plain.max} step={() => plain.step} />,
      <NumberBox ref={(x: NumberBox) => (q = x)} locale="en" x-model={() => s.qty} />,
    );
    await settle();
    Object.assign(plain, { n: 8, max: 20, step: 5 });
    await settle();
    expect(input(n).value).toBe('5');
    host.reState();
    expect(input(n).value).toBe('8');
    expect(n.max).toBe(20);
    n.stepUp();
    expect(n.value).toBe(13);
    expect(plain.n).toBe(8);
    q.stepUp();
    expect(s.qty).toBe(2);
    q.value = 9;
    expect(s.qty).toBe(9);
  });

  it('commits when the field is left with updateOn="change", rounded and kept in range', async () => {
    const s = reactive({ n: 1 as number | null });
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" updateOn="change" min={0} max={100} decimals={2} x-model={() => s.n} />);
    await settle();
    input(n).focus();
    type(n, '3.14159');
    expect(s.n).toBe(1);
    leave(n);
    expect(s.n).toBe(3.14);
    expect(input(n).value).toBe('3.14');
    input(n).focus();
    type(n, '250');
    press(input(n), 'Enter');
    expect(s.n).toBe(100);
  });

  it('leaves an out-of-range value to the range check with clamp off', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" min={1} max={10} clamp={false} />);
    await settle();
    input(n).focus();
    type(n, '42');
    expect(n.value).toBe(42);
    leave(n);
    await settle();
    expect(n.isValid).toBe(false);
    expect(message(n)).toBe('Enter a value from 1 to 10.');
    await uiLocale.use('tr');
    await settle();
    expect(message(n)).toBe('1 ile 10 arasında bir değer girin.');
  });

  it('puts min (or 0) in place of an empty field with allowEmpty off', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" min={3} value={8} allowEmpty={false} />);
    await settle();
    input(n).focus();
    type(n, '');
    expect(n.value).toBe(8);
    leave(n);
    expect(n.value).toBe(3);
    expect(input(n).value).toBe('3');
  });

  it('steps with the keys, without float noise', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" value={0.1} step={0.1} min={0} max={2} />);
    await settle();
    input(n).focus();
    expect(press(input(n), 'ArrowUp')).toBe(true);
    expect(n.value).toBe(0.2);
    press(input(n), 'ArrowUp');
    expect(n.value).toBe(0.3);
    expect(input(n).value).toBe('0.3');
    press(input(n), 'PageUp');
    expect(n.value).toBe(1.3);
    press(input(n), 'PageUp');
    expect(n.value).toBe(2);
    press(input(n), 'ArrowDown');
    expect(n.value).toBe(1.9);
    press(input(n), 'Home');
    expect(n.value).toBe(0);
    press(input(n), 'End');
    expect(n.value).toBe(2);
    n.stepDown(3);
    expect(n.value).toBe(1.7);
    n.readOnly = true;
    press(input(n), 'ArrowUp');
    expect(n.value).toBe(1.7);
  });

  it('lets Home and End move the caret when there is no bound', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} value={5} />);
    await settle();
    expect(press(input(n), 'Home')).toBe(false);
    expect(n.value).toBe(5);
  });

  it('has spin buttons named from uiLocale that repeat while held', async () => {
    vi.useFakeTimers();
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} value={0} max={5} />);
    await vi.advanceTimersByTimeAsync(0);
    const up = spinButton(n, 'up');
    const down = spinButton(n, 'down');
    expect(up.getAttribute('aria-label')).toBe('Increase');
    expect(down.getAttribute('aria-label')).toBe('Decrease');
    expect(up.tabIndex).toBe(-1);
    up.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerType: 'mouse', bubbles: true, cancelable: true }));
    expect(n.value).toBe(1);
    await vi.advanceTimersByTimeAsync(400 + 60 * 2);
    expect(n.value).toBe(4);
    up.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(500);
    expect(n.value).toBe(4);
    // A click from assistive technology has no pointer press before it.
    up.dispatchEvent(new MouseEvent('click', { detail: 0, bubbles: true }));
    expect(n.value).toBe(5);
    expect(up.disabled).toBe(true);
    await uiLocale.use('tr');
    await vi.advanceTimersByTimeAsync(0);
    expect(up.getAttribute('aria-label')).toBe('Artır');
  });

  it('switches the spin buttons off and lays them side by side', async () => {
    const s = reactive({ show: true });
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} showSpinButtons={() => s.show} spinLayout="inline" />);
    await settle();
    const spin = n.element.querySelector<HTMLElement>('.mx-number-box__spin')!;
    expect(spin.dataset.layout).toBe('inline');
    expect(Array.from(spin.children).map((b) => (b as HTMLElement).dataset.step)).toEqual(['down', 'up']);
    s.show = false;
    await settle();
    expect(n.element.querySelector('.mx-number-box__spin')).toBeNull();
  });

  it('changes the value with the wheel only when asked and focused', async () => {
    const s = reactive({ wheel: false });
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} value={1} wheel={() => s.wheel} />);
    await settle();
    const roll = () => input(n).dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
    input(n).focus();
    roll();
    expect(n.value).toBe(1);
    s.wheel = true;
    await settle();
    roll();
    expect(n.value).toBe(2);
    leave(n);
    roll();
    expect(n.value).toBe(2);
  });

  it('shows the formatted value without focus and the plain number with it', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="tr-TR" value={1234.5} format={{ style: 'currency', currency: 'TRY' }} />);
    await settle();
    expect(input(n).value).toMatch(/^₺1\.234,50$/);
    expect(input(n).getAttribute('aria-valuetext')).toBe(input(n).value);
    input(n).focus();
    expect(input(n).value).toBe('1234,5');
    type(n, '99,9');
    leave(n);
    expect(n.value).toBe(99.9);
    expect(input(n).value).toBe('₺99,90');
  });

  it('edits a percent as the number shown', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" value={0.07} format={{ style: 'percent' }} />);
    await settle();
    expect(input(n).value).toBe('7%');
    input(n).focus();
    expect(input(n).value).toBe('7');
    type(n, '12.5');
    expect(n.value).toBe(0.125);
    leave(n);
    expect(input(n).value).toBe('12.5%');
  });

  it('reverts text that is not a number and reports Enter', async () => {
    const onEnter = vi.fn();
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} locale="en" value={3} updateOn="change" onEnter={(e) => onEnter(e.value)} />);
    await settle();
    input(n).focus();
    type(n, '--');
    leave(n);
    expect(n.value).toBe(3);
    expect(input(n).value).toBe('3');
    input(n).focus();
    type(n, '8');
    press(input(n), 'Enter');
    expect(onEnter).toHaveBeenCalledWith(8);
  });

  it('keeps letters out while typing', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} />);
    await settle();
    const letter = new InputEvent('beforeinput', { inputType: 'insertText', data: 'a', bubbles: true, cancelable: true });
    const digit = new InputEvent('beforeinput', { inputType: 'insertText', data: '5', bubbles: true, cancelable: true });
    expect(input(n).dispatchEvent(letter)).toBe(false);
    expect(input(n).dispatchEvent(digit)).toBe(true);
  });

  it('is required on request and passes its attributes on', async () => {
    let n!: NumberBox;
    page(<NumberBox ref={(x: NumberBox) => (n = x)} required name="qty" placeholder="0" align="end" prefix="x" suffix="pcs" />);
    await settle();
    expect(input(n).name).toBe('qty');
    expect(input(n).placeholder).toBe('0');
    expect(input(n).autocomplete).toBe('off');
    expect(n.element.dataset.align).toBe('end');
    expect(n.element.querySelector('.mx-field__suffix')!.textContent).toBe('pcs');
    expect(await n.validate()).toBe(false);
    expect(message(n)).toBe('This field is required.');
  });
});
