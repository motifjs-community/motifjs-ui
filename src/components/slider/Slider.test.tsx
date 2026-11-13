import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { Slider } from './Slider';
import type { SliderValue } from './slider-value';
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
  for (let i = 0; i < 6; i++) await tick();
}

const thumb = (s: Slider, i = 0) => s.thumbParts[i].element as HTMLElement;
const now = (s: Slider, i = 0) => Number(thumb(s, i).getAttribute('aria-valuenow'));

function press(el: Element, key: string) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

/** A 200px wide track at the left of the page, as jsdom draws nothing. */
function sizeTrack(s: Slider) {
  const track = s.element.querySelector('.mx-slider__track') as HTMLElement;
  track.getBoundingClientRect = () => ({ left: 0, right: 200, top: 0, bottom: 40, width: 200, height: 40, x: 0, y: 0, toJSON: () => ({}) });
}

function pointer(s: Slider, type: string, clientX: number, target?: Element) {
  const e = new MouseEvent(type, { clientX, clientY: 20, button: 0, bubbles: true, cancelable: true });
  (target ?? s.element.querySelector('.mx-slider__track')!).dispatchEvent(e);
}

describe('Slider', () => {
  it('is a labelled slider thumb, the same in JSX and programmatically', async () => {
    let jsx!: Slider;
    page(<Slider ref={(x: Slider) => (jsx = x)} label="&Volume" value={30} helpText="Speakers only" class="extra" />);
    const coded = new Slider({ label: 'Zoom', min: 25, max: 400, step: 25 });
    page(coded);
    await settle();

    const label = jsx.element.querySelector('label')!;
    const t = thumb(jsx);
    expect(jsx.element.className).toContain('mx-slider');
    expect(jsx.element.className).toContain('extra');
    expect(t.getAttribute('role')).toBe('slider');
    expect(t.tabIndex).toBe(0);
    expect(t.getAttribute('aria-labelledby')).toBe(label.id);
    expect(t.getAttribute('aria-describedby')).toBe(jsx.element.querySelector('.mx-field__message')!.id);
    expect(t.getAttribute('aria-keyshortcuts')).toBe('Alt+V');
    expect(t.getAttribute('aria-orientation')).toBe('horizontal');
    expect([now(jsx), t.getAttribute('aria-valuemin'), t.getAttribute('aria-valuemax')]).toEqual([30, '0', '100']);
    expect(t.style.getPropertyValue('--_at')).toBe('30%');
    expect(jsx.element.querySelector('.mx-slider__control')!.hasAttribute('aria-labelledby')).toBe(false);
    expect(thumb(jsx, 1).hidden).toBe(true);

    expect(coded.value).toBe(25);
    coded.value = 110;
    expect(coded.value).toBe(100);
    expect(now(coded)).toBe(100);
    coded.size = 'lg';
    expect(coded.element.dataset.size).toBe('lg');
    expect(coded.focus()).toBe(true);
    expect(document.activeElement).toBe(thumb(coded));
  });

  it('binds the value two-way with x-model and reports who changed it', async () => {
    const s = reactive({ v: 40 });
    const seen: ValueChangedEventArgs<SliderValue>[] = [];
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} label="Level" x-model={() => s.v} onValueChanged={(e) => seen.push(e)} />);
    await settle();
    expect(now(b)).toBe(40);

    press(thumb(b), 'ArrowRight');
    expect(s.v).toBe(41);
    s.v = 70;
    await settle();
    expect(now(b)).toBe(70);
    // The first one is x-model handing over its value (as with every Field).
    expect(seen.map((e) => [e.previousValue, e.value, e.byUser])).toEqual([
      [0, 40, false],
      [40, 41, true],
      [41, 70, false],
    ]);
  });

  it('follows getter props and keeps the value inside them', async () => {
    const s = reactive({ v: 80, max: 100, step: 1 });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} max={() => s.max} step={() => s.step} x-model={() => s.v} />);
    await settle();
    s.max = 50;
    await settle();
    expect(b.value).toBe(50);
    expect(s.v).toBe(50);
    expect(thumb(b).getAttribute('aria-valuemax')).toBe('50');
    s.step = 20;
    await settle();
    expect(b.value).toBe(40);
    b.value = 33;
    expect(b.value).toBe(40);
  });

  it('reads functions over plain data again on reState, writes a value set programmatically to x-model, and keeps your array', async () => {
    const plain = { v: 20, max: 100 };
    const s = reactive({ v: 10 });
    const pair: [number, number] = [3, 1];
    let b!: Slider;
    let m!: Slider;
    let r!: Slider;
    const host = page(
      <Slider ref={(x: Slider) => (b = x)} value={() => plain.v} max={() => plain.max} />,
      <Slider ref={(x: Slider) => (m = x)} x-model={() => s.v} />,
      <Slider ref={(x: Slider) => (r = x)} range max={5} value={pair} />,
    );
    await settle();
    Object.assign(plain, { v: 60, max: 50 });
    await settle();
    expect(now(b)).toBe(20);
    host.reState();
    expect(now(b)).toBe(50);
    expect(thumb(b).getAttribute('aria-valuemax')).toBe('50');
    expect(plain.v).toBe(60);
    m.value = 70;
    expect(s.v).toBe(70);
    expect(r.value).toEqual([1, 3]);
    expect(pair).toEqual([3, 1]);
  });

  it('reads the bounds of the props before the value, whatever their order', async () => {
    const b = new Slider({ value: 150, min: 100, max: 200, step: 10 });
    page(b);
    expect(b.value).toBe(150);
    const r = new Slider({ value: [3, 1], range: true, max: 5 });
    page(r);
    expect(r.value).toEqual([1, 3]);
  });

  it('moves with the keys of the slider pattern', async () => {
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} value={50} step={2} />);
    await settle();
    const t = thumb(b);
    const steps: [string, number][] = [
      ['ArrowRight', 52],
      ['ArrowUp', 54],
      ['ArrowLeft', 52],
      ['ArrowDown', 50],
      ['PageUp', 70],
      ['PageDown', 50],
      ['End', 100],
      ['Home', 0],
    ];
    for (const [key, value] of steps) {
      expect(press(t, key)).toBe(true);
      expect([key, b.value]).toEqual([key, value]);
    }
    expect(press(t, 'a')).toBe(false);
    b.largeStep = 5;
    press(t, 'PageUp');
    expect(b.value).toBe(6);
  });

  it('keeps decimal steps exact', async () => {
    const b = new Slider({ min: 0, max: 1, step: 0.1, value: 0.2 });
    page(b);
    press(thumb(b), 'ArrowRight');
    expect(b.value).toBe(0.3);
    b.value = 0.66;
    expect(b.value).toBe(0.7);
  });

  it('has two thumbs that cannot cross with range', async () => {
    const s = reactive({ price: [20, 60] as SliderValue });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} label="Price" range minDistance={10} x-model={() => s.price} />);
    await settle();
    const [start, end] = [thumb(b, 0), thumb(b, 1)];
    const label = b.element.querySelector('label')!;
    const control = b.element.querySelector('.mx-slider__control')!;
    expect(end.hidden).toBe(false);
    expect(control.getAttribute('role')).toBe('group');
    expect(control.getAttribute('aria-labelledby')).toBe(label.id);
    expect(start.getAttribute('aria-label')).toBe('Minimum');
    expect(end.getAttribute('aria-label')).toBe('Maximum');
    expect(start.getAttribute('aria-labelledby')).toBe(`${label.id} ${start.id}`);
    expect([start.getAttribute('aria-valuemax'), end.getAttribute('aria-valuemin')]).toEqual(['50', '30']);

    press(start, 'End');
    expect(s.price).toEqual([50, 60]);
    press(end, 'Home');
    expect(s.price).toEqual([50, 60]);
    press(end, 'PageUp');
    expect(s.price).toEqual([50, 70]);
    expect(b.element.querySelector<HTMLElement>('.mx-slider__rail')!.style.getPropertyValue('--_from')).toBe('50%');

    await uiLocale.use('tr');
    await settle();
    expect(start.getAttribute('aria-label')).toBe('En düşük');

    b.range = false;
    expect(b.value).toBe(70);
    expect(end.hidden).toBe(true);
    expect(control.hasAttribute('role')).toBe(false);
    expect(start.hasAttribute('aria-label')).toBe(false);
  });

  it('follows the pointer: a press on the track moves the nearest thumb, a drag moves it on', async () => {
    const s = reactive({ v: [10, 90] as SliderValue });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} range x-model={() => s.v} />);
    await settle();
    sizeTrack(b);
    pointer(b, 'pointerdown', 140);
    expect(s.v).toEqual([10, 70]);
    expect(b.element.hasAttribute('data-dragging')).toBe(true);
    pointer(b, 'pointermove', 170);
    expect(s.v).toEqual([10, 85]);
    pointer(b, 'pointermove', 0);
    expect(s.v).toEqual([10, 10]);
    pointer(b, 'pointerup', 0);
    expect(b.element.hasAttribute('data-dragging')).toBe(false);
    expect(document.activeElement).toBe(thumb(b, 1));
    pointer(b, 'pointerdown', 4);
    expect(s.v).toEqual([2, 10]);
    pointer(b, 'pointerup', 4);
    expect(document.activeElement).toBe(thumb(b, 0));
  });

  it('commits on release with updateOn="change", while the thumb still moves', async () => {
    const s = reactive({ v: 0 });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} updateOn="change" x-model={() => s.v} />);
    await settle();
    sizeTrack(b);
    pointer(b, 'pointerdown', 50);
    pointer(b, 'pointermove', 100);
    expect(s.v).toBe(0);
    expect(now(b)).toBe(50);
    pointer(b, 'pointerup', 100);
    expect(s.v).toBe(50);
    press(thumb(b), 'ArrowRight');
    expect(s.v).toBe(51);
  });

  it('draws marks and their labels, formatted', async () => {
    const s = reactive({ ticks: true as boolean | number, labels: false });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} max={1} step={0.25} ticks={() => s.ticks} tickLabels={() => s.labels} format={{ style: 'percent' }} locale="en" />);
    await settle();
    const marks = () => [...b.element.querySelectorAll('.mx-slider__tick')];
    expect(marks().length).toBe(5);
    expect(b.element.querySelector('.mx-slider__tick-label')).toBeNull();
    s.labels = true;
    s.ticks = 2;
    await settle();
    expect(marks().map((t) => t.textContent)).toEqual(['0%', '50%', '100%']);
    expect(marks()[1].getAttribute('style')).toContain('--_at: 50%');
    // The ticks that stay are the same parts, moved and written in place.
    const [first, second] = marks();
    s.ticks = 4;
    await settle();
    expect(marks().map((t) => t.textContent)).toEqual(['0%', '25%', '50%', '75%', '100%']);
    expect(marks()[0]).toBe(first);
    expect(marks()[1]).toBe(second);
    expect(second.getAttribute('style')).toContain('--_at: 25%');
    s.ticks = false;
    await settle();
    expect(marks().map((t) => [t.textContent, t.hasAttribute('data-mark')])).toEqual([
      ['0%', false],
      ['100%', false],
    ]);
    s.labels = false;
    await settle();
    expect(marks().length).toBe(0);
    expect(b.element.querySelector<HTMLElement>('.mx-slider__ticks')!.hidden).toBe(true);
  });

  it('writes the value in the bubble and for screen readers', async () => {
    const s = reactive({ show: 'drag' as 'never' | 'drag' | 'always' });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} value={1500} max={5000} step={100} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} locale="en" showValue={() => s.show} />);
    await settle();
    const t = thumb(b);
    expect(b.element.dataset.showValue).toBe('drag');
    expect(t.querySelector('.mx-slider__bubble')!.textContent).toBe('€1,500');
    expect(t.getAttribute('aria-valuetext')).toBe('€1,500');
    s.show = 'always';
    await settle();
    expect(b.element.dataset.showValue).toBe('always');
    b.valueText = (v) => `${v} euros`;
    expect(t.getAttribute('aria-valuetext')).toBe('1500 euros');
    b.format = null;
    b.valueText = null;
    expect(t.hasAttribute('aria-valuetext')).toBe(false);
    expect(t.querySelector('.mx-slider__bubble')!.textContent).toBe('1,500');
  });

  it('grows upwards when vertical', async () => {
    const b = new Slider({ orientation: 'vertical', value: 10 });
    page(b);
    expect(b.element.dataset.orientation).toBe('vertical');
    expect(thumb(b).getAttribute('aria-orientation')).toBe('vertical');
    press(thumb(b), 'ArrowUp');
    expect(b.value).toBe(11);
    const track = b.element.querySelector('.mx-slider__track') as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, right: 40, top: 0, bottom: 200, width: 40, height: 200, x: 0, y: 0, toJSON: () => ({}) });
    track.dispatchEvent(new MouseEvent('pointerdown', { clientX: 20, clientY: 50, button: 0, bubbles: true, cancelable: true }));
    expect(b.value).toBe(75);
  });

  it('is read-only or disabled on request', async () => {
    const s = reactive({ on: true, readOnly: true });
    let b!: Slider;
    page(<Slider ref={(x: Slider) => (b = x)} value={5} readOnly={() => s.readOnly} enabled={() => s.on} required />);
    await settle();
    const t = thumb(b);
    expect(t.getAttribute('aria-readonly')).toBe('true');
    expect(b.element.querySelector('.mx-slider__control')!.hasAttribute('aria-readonly')).toBe(false);
    expect(b.element.querySelector('.mx-slider__control')!.hasAttribute('aria-required')).toBe(false);
    expect(press(t, 'ArrowRight')).toBe(true);
    expect(b.value).toBe(5);
    sizeTrack(b);
    pointer(b, 'pointerdown', 100);
    pointer(b, 'pointermove', 150);
    pointer(b, 'pointerup', 150);
    expect(b.value).toBe(5);
    expect(document.activeElement).toBe(t);
    s.readOnly = false;
    s.on = false;
    await settle();
    expect(t.tabIndex).toBe(-1);
    expect(t.getAttribute('aria-disabled')).toBe('true');
    press(t, 'ArrowRight');
    expect(b.value).toBe(5);
    s.on = true;
    await settle();
    expect(t.tabIndex).toBe(0);
    press(t, 'ArrowRight');
    expect(b.value).toBe(6);
  });

  it('takes both thumbs out of the Tab order with tabStop', async () => {
    const b = new Slider({ range: true, tabStop: false });
    page(b);
    expect([thumb(b, 0).tabIndex, thumb(b, 1).tabIndex]).toEqual([-1, -1]);
    b.tabStop = true;
    expect([thumb(b, 0).tabIndex, thumb(b, 1).tabIndex]).toEqual([0, 0]);
  });

  it('sends its value with a form under a name', async () => {
    const b = new Slider({ name: 'price', range: true, value: [10, 30] });
    page(b);
    const form = document.createElement('form');
    document.body.append(form);
    form.append(b.element);
    expect(new FormData(form).getAll('price')).toEqual(['10', '30']);
    b.range = false;
    expect(new FormData(form).getAll('price')).toEqual(['30']);
    b.name = '';
    expect(new FormData(form).getAll('price')).toEqual([]);
  });

  it('sends nothing with its form while disabled, as a native field', async () => {
    const b = new Slider({ name: 'volume', value: 40, enabled: false });
    page(b);
    const form = document.createElement('form');
    document.body.append(form);
    form.append(b.element);
    expect(new FormData(form).getAll('volume')).toEqual([]);
    b.enabled = true;
    expect(new FormData(form).getAll('volume')).toEqual(['40']);
  });

  it('marks an error on the thumbs', async () => {
    const b = new Slider({ value: 10, rules: [{ type: 'range', min: 20 }] });
    page(b);
    expect(await b.validate()).toBe(false);
    expect(thumb(b).getAttribute('aria-invalid')).toBe('true');
    b.value = 30;
    await settle();
    expect(thumb(b).hasAttribute('aria-invalid')).toBe(false);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('reads a range given by a getter as it is: a change in place waits for a new value', async () => {
      const range = make<[number, number]>([20, 80]);
      let s!: Slider;
      page(<Slider ref={(x: Slider) => (s = x)} range value={() => range} />);
      await settle();
      expect(s.value).toBe(range);
      range[0] = 30;
      await settle();
      expect(thumb(s, 0).getAttribute('aria-valuenow')).toBe('20');
      s.value = [range[0], range[1]];
      await settle();
      expect(s.value).toEqual([30, 80]);
      expect(thumb(s, 0).getAttribute('aria-valuenow')).toBe('30');
    });
  });
});
