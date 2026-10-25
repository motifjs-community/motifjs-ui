import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { ProgressBar } from './ProgressBar';

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

const bar = (p: ProgressBar) => p.element.querySelector<HTMLElement>('.mx-progress__bar')!;
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
    expect(bar(jsx).style.getPropertyValue('--_value')).toBe('40%');
    expect(shown(jsx).textContent).toBe('40%');
    expect({ ...el.dataset }).toMatchObject({ state: 'determinate', tone: 'accent', size: 'md', labelPosition: 'top' });

    coded.value = 2;
    coded.tone = 'success';
    coded.size = 'lg';
    expect(coded.fraction).toBe(0.25);
    expect(coded.element.getAttribute('aria-valuenow')).toBe('2');
    expect(bar(coded).style.getPropertyValue('--_value')).toBe('25%');
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
    s.value = null;
    await settle();
    expect(el.dataset.state).toBe('indeterminate');
  });

  it('is named from uiLocale without a label', async () => {
    const s = reactive({ label: '' });
    let p!: ProgressBar;
    page(<ProgressBar ref={(x: ProgressBar) => (p = x)} label={() => s.label} />);
    await settle();
    expect(p.element.getAttribute('aria-label')).toBe('Loading…');
    uiLocale.strings = trStrings;
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
