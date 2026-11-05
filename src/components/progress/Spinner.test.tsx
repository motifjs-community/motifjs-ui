import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { Spinner } from './Spinner';

let hosts: Component[] = [];

afterEach(async () => {
  vi.useRealTimers();
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

describe('Spinner', () => {
  it('is a named progress indicator without a value, the same from JSX and from code', async () => {
    let jsx!: Spinner;
    page(<Spinner ref={(x: Spinner) => (jsx = x)} label="Loading orders" size="lg" tone="neutral" class="extra" />);
    const coded = new Spinner();
    page(coded);
    await settle();

    const el = jsx.element;
    expect(el.className).toContain('mx-spinner');
    expect(el.className).toContain('extra');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.getAttribute('aria-labelledby')).toBe(el.querySelector('.mx-spinner__label')!.id);
    expect(el.querySelector('.mx-spinner__label')!.textContent).toBe('Loading orders');
    expect(el.querySelector('.mx-spinner__box')!.getAttribute('aria-hidden')).toBe('true');
    expect({ ...el.dataset }).toMatchObject({ size: 'lg', tone: 'neutral', labelPosition: 'side' });

    expect(coded.element.getAttribute('aria-label')).toBe('Loading…');
    expect(coded.element.querySelector<HTMLElement>('.mx-spinner__label')!.hidden).toBe(true);
    await uiLocale.use('tr');
    await settle();
    expect(coded.element.getAttribute('aria-label')).toBe('Yükleniyor…');
    coded.label = 'Bekleyin';
    coded.labelPosition = 'bottom';
    expect(coded.element.hasAttribute('aria-label')).toBe(false);
    expect(coded.element.dataset.labelPosition).toBe('bottom');
  });

  it('shows after its delay, again each time it is shown', async () => {
    vi.useFakeTimers();
    const s = reactive({ busy: true });
    let sp!: Spinner;
    page(<Spinner ref={(x: Spinner) => (sp = x)} delay={300} visible={() => s.busy} />);
    expect(sp.waiting).toBe(true);
    vi.advanceTimersByTime(299);
    expect(sp.element.hasAttribute('data-waiting')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(sp.waiting).toBe(false);
    s.busy = false;
    await settle();
    s.busy = true;
    await settle();
    expect(sp.waiting).toBe(true);
    vi.advanceTimersByTime(300);
    expect(sp.waiting).toBe(false);
    sp.delay = 0;
    expect(sp.waiting).toBe(false);
  });

  it('covers a container while it loads and keeps focus', async () => {
    const panel = new Component<HTMLDivElement>('div');
    const input = document.createElement('input');
    const after = document.createElement('button');
    page(panel);
    panel.element.append(input, after);
    input.focus();

    const done = Spinner.cover(panel, { label: 'Loading orders' });
    const cover = panel.element.querySelector<HTMLElement>('.mx-spinner')!;
    expect(cover.hasAttribute('data-cover')).toBe(true);
    expect(cover.dataset.size).toBe('lg');
    expect(cover.dataset.labelPosition).toBe('bottom');
    expect(panel.element.getAttribute('aria-busy')).toBe('true');
    expect(panel.element.hasAttribute('data-mx-covered')).toBe(true);
    expect(input.hasAttribute('inert')).toBe(true);
    expect(after.hasAttribute('inert')).toBe(true);
    expect(cover.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(cover);

    done();
    done();
    expect(panel.element.querySelector('.mx-spinner')).toBeNull();
    expect(input.hasAttribute('inert')).toBe(false);
    expect(panel.element.hasAttribute('aria-busy')).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('covers a plain element too, leaving focus alone when it was elsewhere', async () => {
    const outside = document.createElement('button');
    const box = document.createElement('section');
    box.setAttribute('aria-busy', 'false');
    box.append(document.createElement('button'));
    document.body.append(outside, box);
    outside.focus();
    const done = Spinner.cover(box);
    expect(document.activeElement).toBe(outside);
    expect(box.querySelector('.mx-spinner')!.getAttribute('aria-label')).toBe('Loading…');
    done();
    expect(box.getAttribute('aria-busy')).toBe('false');
    expect(box.querySelector('.mx-spinner')).toBeNull();
  });
});
