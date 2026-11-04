import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Rating } from './Rating';

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

const row = (r: Rating) => r.element.querySelector<HTMLElement>('.mx-rating__stars')!;
const items = (r: Rating) => Array.from(r.element.querySelectorAll<HTMLElement>('.mx-rating__item'));
const fills = (r: Rating) => Array.from(r.element.querySelectorAll<HTMLElement>('.mx-rating__fill')).map((f) => f.style.getPropertyValue('--_fill'));
const key = (r: Rating, name: string) => row(r).dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

describe('Rating', () => {
  it('draws max stars filled to its value and says it, the same from JSX and from code', async () => {
    let jsx!: Rating;
    page(<Rating ref={(r: Rating) => (jsx = r)} label="Your rating" value={3} />);
    const coded = new Rating({ max: 10, value: 7 });
    page(coded);
    await settle();
    expect(items(jsx).length).toBe(5);
    expect(fills(jsx)).toEqual(['100%', '100%', '100%', '0%', '0%']);
    expect(row(jsx).getAttribute('role')).toBe('slider');
    expect(row(jsx).getAttribute('aria-valuenow')).toBe('3');
    expect(row(jsx).getAttribute('aria-valuemax')).toBe('5');
    expect(row(jsx).getAttribute('aria-valuetext')).toBe('3 of 5');
    expect(items(coded).length).toBe(10);
    await uiLocale.use('tr');
    expect(row(jsx).getAttribute('aria-valuetext')).not.toBe('3 of 5');
  });

  it('is pressed to a value, and pressed on it again it clears', async () => {
    const seen: (number | null)[] = [];
    const rating = new Rating({ onValueChanged: (e) => seen.push(e.value) });
    page(rating);
    await settle();
    items(rating)[3].click();
    expect(rating.value).toBe(4);
    items(rating)[3].click();
    expect(rating.value).toBe(null);
    expect(row(rating).getAttribute('aria-valuetext')).toBe(enStrings.ratingNone);
    expect(seen).toEqual([4, null]);
    rating.allowClear = false;
    items(rating)[1].click();
    items(rating)[1].click();
    expect(rating.value).toBe(2);
  });

  it('takes halves, and rounds a value given to its step', async () => {
    const rating = new Rating({ step: 0.5, value: 2.3 });
    page(rating);
    await settle();
    expect(rating.value).toBe(2.5);
    expect(fills(rating)).toEqual(['100%', '100%', '50%', '0%', '0%']);
    key(rating, 'ArrowRight');
    expect(rating.value).toBe(3);
    key(rating, 'ArrowLeft');
    key(rating, 'ArrowLeft');
    expect(rating.value).toBe(2);
  });

  it('is moved with the keyboard, and not at all when read-only', async () => {
    const s = reactive({ stars: 1 as number | null });
    const rating = new Rating({ value: () => s.stars });
    page(rating);
    await settle();
    key(rating, 'End');
    expect(rating.value).toBe(5);
    key(rating, '2');
    expect(rating.value).toBe(2);
    key(rating, 'Delete');
    expect(rating.value).toBe(null);
    key(rating, 'Home');
    expect(rating.value).toBe(null);
    rating.readOnly = true;
    key(rating, 'End');
    items(rating)[4].click();
    expect(rating.value).toBe(null);
    expect(row(rating).getAttribute('aria-readonly')).toBe('true');
  });
});
