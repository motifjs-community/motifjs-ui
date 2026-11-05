import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Skeleton } from './Skeleton';

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

const bones = (s: Skeleton) => Array.from(s.element.querySelectorAll('.mx-skeleton__bone'));

describe('Skeleton', () => {
  it('draws a bone per line before its content, the same in JSX and programmatically', async () => {
    let jsx!: Skeleton;
    page(
      <Skeleton ref={(s: Skeleton) => (jsx = s)} lines={3} class="extra">
        <p>Loaded</p>
      </Skeleton>,
    );
    const coded = new Skeleton({ shape: 'circle', width: 40, lines: 3 });
    page(coded);
    await settle();
    expect(jsx.element.className).toContain('extra');
    expect(bones(jsx).length).toBe(3);
    expect(jsx.element.firstElementChild?.classList.contains('mx-skeleton__bone')).toBe(true);
    expect(jsx.element.lastElementChild?.classList.contains('mx-skeleton__content')).toBe(true);
    expect(jsx.element.dataset.shape).toBe('text');
    expect(bones(coded).length).toBe(1);
    expect(coded.element.style.getPropertyValue('--_width')).toBe('40px');
    jsx.lines = 1;
    expect(bones(jsx).length).toBe(1);
  });

  it('says it is loading, in the kit language, and shows its content once loaded', async () => {
    const s = reactive({ loading: true });
    const skeleton = new Skeleton({ loading: () => s.loading, height: '2rem' });
    page(skeleton);
    await settle();
    const el = skeleton.element;
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.getAttribute('aria-label')).toBe(enStrings.loading);
    expect(el.style.getPropertyValue('--_height')).toBe('2rem');
    await uiLocale.use('tr');
    expect(el.getAttribute('aria-label')).not.toBe(enStrings.loading);
    s.loading = false;
    await settle();
    expect(el.hasAttribute('data-loading')).toBe(false);
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-busy')).toBe(false);
  });
});
