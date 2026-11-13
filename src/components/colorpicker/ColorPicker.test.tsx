import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { ColorBox } from '../colorbox/ColorBox';
import { ColorPicker } from './ColorPicker';

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

const thumbs = (p: ColorPicker) => Array.from(p.element.querySelectorAll<HTMLElement>('.mx-color-picker__thumb'));
const key = (el: HTMLElement, name: string, shift = false) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey: shift, bubbles: true }));

describe('ColorPicker', () => {
  it('reads any colour form, keeps it as hex, and names its handles', async () => {
    let jsx!: ColorPicker;
    page(<ColorPicker ref={(p: ColorPicker) => (jsx = p)} value="rgb(255, 0, 0)" />);
    await settle();
    const [area, hue] = thumbs(jsx);
    expect(area.getAttribute('role')).toBe('slider');
    expect(area.getAttribute('aria-label')).toBe(enStrings.colorArea);
    expect(hue.getAttribute('aria-label')).toBe(enStrings.colorHue);
    expect(hue.getAttribute('aria-valuenow')).toBe('0');
    expect(area.getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 100%');
    expect(jsx.value).toBe('rgb(255, 0, 0)');
    key(hue, 'ArrowRight', true);
    expect(jsx.value).toBe('#ff9900');
    expect(hue.getAttribute('aria-valuenow')).toBe('36');
  });

  it('follows a value given as a function, and keeps the hue of a grey', async () => {
    const s = reactive({ color: '#3b5bdb' as string | null });
    const seen: (string | null)[] = [];
    const picker = new ColorPicker({ value: () => s.color, onValueChanged: (e) => e.byUser && seen.push(e.value) });
    page(picker);
    await settle();
    const [area, hue] = thumbs(picker);
    const before = hue.getAttribute('aria-valuenow');
    s.color = '#808080';
    await settle();
    expect(hue.getAttribute('aria-valuenow')).toBe(before);
    key(area, 'End');
    expect(seen.length).toBe(1);
  });

  it('takes a preset with one press, opacity only with alpha', async () => {
    const picker = new ColorPicker({ palette: ['#2b8a3e', '#e03131'], value: '#2b8a3e' });
    page(picker);
    await settle();
    const swatches = Array.from(picker.element.querySelectorAll<HTMLButtonElement>('.mx-color-picker__swatch'));
    expect(swatches.map((s) => s.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    swatches[1].click();
    expect(picker.value).toBe('#e03131');
    expect(swatches[1].getAttribute('aria-pressed')).toBe('true');
    expect(picker.element.querySelector('.mx-color-picker__alpha')).toBeNull();
    picker.alpha = true;
    const alpha = thumbs(picker)[2];
    key(alpha, 'Home');
    expect(picker.value).toBe('#e0313100');
  });

  it('writes a new palette into the swatches it has', async () => {
    const picker = new ColorPicker({ palette: ['#2b8a3e', '#e03131'], value: '#1971c2' });
    page(picker);
    await settle();
    const before = Array.from(picker.element.querySelectorAll<HTMLButtonElement>('.mx-color-picker__swatch'));
    picker.palette = ['#1971c2', '#f08c00', '#000000'];
    await settle();
    const now = Array.from(picker.element.querySelectorAll<HTMLButtonElement>('.mx-color-picker__swatch'));
    expect(now.slice(0, 2)).toEqual(before);
    expect(now[0]).toBe(before[0]);
    expect(now.map((s) => s.dataset.color)).toEqual(['#1971c2', '#f08c00', '#000000']);
    expect(now.map((s) => s.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    now[1].click();
    expect(picker.value).toBe('#f08c00');
    picker.palette = ['#e03131'];
    await settle();
    expect(picker.element.querySelectorAll('.mx-color-picker__swatch')).toHaveLength(1);
    expect(picker.element.querySelector('.mx-color-picker__swatch')).toBe(before[0]);
    before[0].click();
    expect(picker.value).toBe('#e03131');
  });
});

describe('ColorBox', () => {
  it('keeps a colour typed as hex, shows its swatch, and opens the picker', async () => {
    const box = new ColorBox({ label: 'Accent', value: 'rgb(59, 91, 219)' });
    page(box);
    await settle();
    expect(box.value).toBe('#3b5bdb');
    expect(box.inputPart.element.value).toBe('#3b5bdb');
    box.inputPart.element.value = 'f80';
    box.inputPart.element.dispatchEvent(new Event('change'));
    expect(box.value).toBe('#ff8800');
    box.inputPart.element.value = 'not a colour';
    box.inputPart.element.dispatchEvent(new Event('change'));
    expect(box.value).toBe('#ff8800');
    expect(await box.validate()).toBe(false);
    expect(box.open()).toBe(true);
    expect(box.picker?.value).toBe('#ff8800');
  });

  it('with buttons, changes on OK and not on Cancel', async () => {
    const box = new ColorBox({ value: '#000000', apply: 'useButtons', palette: ['#e03131'] });
    page(box);
    await settle();
    box.open();
    box.picker!.element.querySelector<HTMLButtonElement>('.mx-color-picker__swatch')!.click();
    expect(box.value).toBe('#000000');
    box.picker!.element.closest('.mx-color-box__popup')!.querySelector<HTMLElement>('.mx-color-box__cancel .mx-button__face, .mx-color-box__cancel')!.click();
    expect(box.value).toBe('#000000');
    box.open();
    box.picker!.element.querySelector<HTMLButtonElement>('.mx-color-picker__swatch')!.click();
    box.picker!.element.closest('.mx-color-box__popup')!.querySelector<HTMLElement>('.mx-color-box__ok .mx-button__face, .mx-color-box__ok')!.click();
    expect(box.value).toBe('#e03131');
  });
});
