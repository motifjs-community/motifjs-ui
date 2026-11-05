import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { ProgressBar } from './ProgressBar';

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

const done = (p: ProgressBar) => p.element.style.getPropertyValue('--_fraction');
const shown = (p: ProgressBar) => p.element.querySelector<HTMLElement>('.mx-progress__value')!;

describe('ProgressBar', () => {
  it('is a labelled progress bar, the same from JSX and from code', async () => {
    let jsx!: ProgressBar;
    page(<ProgressBar ref={(x: ProgressBar) => (jsx = x)} label="Uploading" value={40} showValue locale="en" class="extra" />);
    const coded = new ProgressBar({ label: 'Import', max: 8 });
    page(coded);
    await settle();

    const el = jsx.element;
    expect(el.className).toContain('mx-progress');
    expect(el.className).toContain('extra');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-labelledby')).toBe(el.querySelector('.mx-progress__label')!.id);
    expect(el.querySelector('.mx-progress__label')!.textContent).toBe('Uploading');
    expect(['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext'].map((n) => el.getAttribute(n))).toEqual(['40', '0', '100', '40%']);
    expect(done(jsx)).toBe('0.4');
    expect(shown(jsx).textContent).toBe('40%');
    expect({ ...el.dataset }).toMatchObject({ state: 'determinate', shape: 'line', tone: 'accent', size: 'md', labelPosition: 'top' });
    expect(el.hasAttribute('data-complete')).toBe(false);

    coded.value = 2;
    coded.tone = 'success';
    coded.size = 'lg';
    expect(coded.fraction).toBe(0.25);
    expect(coded.element.getAttribute('aria-valuenow')).toBe('2');
    expect(done(coded)).toBe('0.25');
    expect(coded.element.dataset.tone).toBe('success');
    expect(shown(coded).hidden).toBe(true);
  });

  it('runs without a value and says nothing about one', async () => {
    const s = reactive({ value: null as number | null });
    let p!: ProgressBar;
    page(<ProgressBar ref={(x: ProgressBar) => (p = x)} value={() => s.value} showValue />);
    await settle();
    const el = p.element;
    expect(el.dataset.state).toBe('indeterminate');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuemin')).toBe(false);
    expect(el.hasAttribute('aria-valuetext')).toBe(false);
    expect(p.value).toBeNull();
    expect(el.querySelector<HTMLElement>('.mx-progress__head')!.hidden).toBe(true);
    s.value = 150;
    await settle();
    expect(el.dataset.state).toBe('determinate');
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    expect(el.hasAttribute('data-complete')).toBe(true);
    s.value = null;
    await settle();
    expect(el.dataset.state).toBe('indeterminate');
    expect(el.hasAttribute('data-complete')).toBe(false);
    expect(done(p)).toBe('');
  });

  it('is a circle when told, with its caption under it, and a line again', async () => {
    const s = reactive({ shape: 'circle' as 'line' | 'circle', value: 30 as number | null });
    let p!: ProgressBar;
    page(<ProgressBar ref={(x: ProgressBar) => (p = x)} label="Saving" shape={() => s.shape} value={() => s.value} showValue locale="en" />);
    await settle();
    const el = p.element;
    const circle = el.querySelector('.mx-progress__circle')!;
    expect(circle.getAttribute('aria-hidden')).toBe('true');
    expect([...circle.children].map((c) => `${c.localName}.${c.getAttribute('class')}`)).toEqual(['circle.mx-progress__ring', 'circle.mx-progress__arc']);
    expect({ ...el.dataset }).toMatchObject({ shape: 'circle', labelPosition: 'bottom', state: 'determinate' });
    expect(p.labelPosition).toBe('bottom');
    expect(el.getAttribute('aria-valuetext')).toBe('30%');
    expect(done(p)).toBe('0.3');
    s.value = null;
    await settle();
    expect(el.dataset.state).toBe('indeterminate');
    s.shape = 'line';
    await settle();
    expect({ ...el.dataset }).toMatchObject({ shape: 'line', labelPosition: 'top' });
    p.labelPosition = 'bottom';
    expect(el.dataset.labelPosition).toBe('bottom');
  });

  it('draws no wave where the design language gives it none', async () => {
    const p = new ProgressBar({ value: 50 });
    page(p);
    await settle();
    expect(p.element.hasAttribute('data-wave')).toBe(false);
    expect(p.element.querySelector('.mx-progress__wave')).toBeNull();
    p.shape = 'circle';
    await settle();
    expect(p.element.querySelector('.mx-progress__circle path')).toBeNull();
  });

  it('is named from uiLocale without a label', async () => {
    const s = reactive({ label: '' });
    let p!: ProgressBar;
    page(<ProgressBar ref={(x: ProgressBar) => (p = x)} label={() => s.label} />);
    await settle();
    expect(p.element.getAttribute('aria-label')).toBe('Loading…');
    await uiLocale.use('tr');
    await settle();
    expect(p.element.getAttribute('aria-label')).toBe('Yükleniyor…');
    s.label = 'Kopyalanıyor';
    await settle();
    expect(p.element.hasAttribute('aria-label')).toBe(false);
    expect(p.element.getAttribute('aria-labelledby')).toBeTruthy();
    uiLocale.strings = enStrings;
    await settle();
    expect(p.element.hasAttribute('aria-label')).toBe(false);
  });

  it('reads functions over plain data again on reState: its value and its label', async () => {
    const plain = { value: 10, label: '' };
    let p!: ProgressBar;
    const host = page(<ProgressBar ref={(x: ProgressBar) => (p = x)} value={() => plain.value} label={() => plain.label} showValue locale="en" />);
    await settle();
    expect(p.element.getAttribute('aria-label')).toBe('Loading…');
    Object.assign(plain, { value: 40, label: 'Copying' });
    await settle();
    expect(shown(p).textContent).toBe('10%');
    host.reState();
    expect(shown(p).textContent).toBe('40%');
    expect(p.element.hasAttribute('aria-label')).toBe(false);
    expect(p.element.getAttribute('aria-labelledby')).toBeTruthy();
  });

  it('writes the value its own way, rounded down by default', async () => {
    const p = new ProgressBar({ value: 99.6, showValue: true, locale: 'en' });
    page(p);
    expect(shown(p).textContent).toBe('99%');
    p.locale = 'tr';
    expect(shown(p).textContent).toBe('%99');
    p.max = 12;
    p.value = 3;
    p.valueText = (v) => v + ' of 12 files';
    expect(shown(p).textContent).toBe('3 of 12 files');
    expect(p.element.getAttribute('aria-valuetext')).toBe('3 of 12 files');
    p.showValue = false;
    expect(shown(p).hidden).toBe(true);
  });

  it('follows getter props for its look', async () => {
    const s = reactive({ tone: 'accent' as 'accent' | 'danger', side: false, wide: false });
    let p!: ProgressBar;
    page(
      <ProgressBar
        ref={(x: ProgressBar) => (p = x)}
        value={10}
        tone={() => s.tone}
        labelPosition={() => (s.side ? 'side' : 'top')}
        stretch={() => s.wide}
      />,
    );
    await settle();
    s.tone = 'danger';
    s.side = true;
    s.wide = true;
    await settle();
    expect({ ...p.element.dataset }).toMatchObject({ tone: 'danger', labelPosition: 'side' });
    expect(p.element.hasAttribute('data-stretch')).toBe(true);
  });
});
