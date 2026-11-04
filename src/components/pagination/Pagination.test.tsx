import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Pagination } from './Pagination';

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

const pageTexts = (p: Pagination) =>
  Array.from(p.element.querySelectorAll<HTMLElement>('.mx-pagination__pages > *')).map((el) => (el.classList.contains('mx-pagination__gap') ? '…' : el.textContent));
const face = (el: Element) => (el.matches('.mx-button__face') ? el : el.querySelector('.mx-button__face')) as HTMLElement;

describe('Pagination', () => {
  it('counts pages from the total, says where it stands, and shows pages around the current one', async () => {
    let jsx!: Pagination;
    page(<Pagination ref={(p: Pagination) => (jsx = p)} mode="full" total={250} pageSize={20} page={6} />);
    await settle();
    expect(jsx.pageCount).toBe(13);
    expect(jsx.element.tagName).toBe('NAV');
    expect(jsx.element.getAttribute('aria-label')).toBe(enStrings.gridPager);
    expect(jsx.element.querySelector('.mx-pagination__info')?.textContent).toBe('Page 6 of 13 (250 items)');
    expect(pageTexts(jsx)).toEqual(['1', '…', '5', '6', '7', '…', '13']);
    expect(jsx.element.querySelector('[aria-current="page"]')?.textContent).toBe('6');
  });

  it('moves with its buttons and tells it; the steps are disabled at the ends', async () => {
    const seen: [number, boolean][] = [];
    const s = reactive({ page: 1 });
    const p = new Pagination({ mode: 'full', total: 50, page: () => s.page, onPageChanged: (e) => seen.push([e.page, e.byUser]) });
    page(p);
    await settle();
    const step = (name: string) => p.element.querySelector<HTMLElement>(`.mx-pagination__step[data-step="${name}"]`)!;
    expect(step('previous').hasAttribute('data-disabled')).toBe(true);
    face(step('next')).click();
    expect(p.page).toBe(2);
    face(step('last')).click();
    expect(p.page).toBe(5);
    expect(step('next').hasAttribute('data-disabled')).toBe(true);
    s.page = 3;
    await settle();
    expect(p.page).toBe(3);
    expect(seen).toEqual([
      [2, true],
      [5, true],
      [3, false],
    ]);
  });

  it('binds the page with x-model', async () => {
    const s = reactive({ page: 3 });
    let p!: Pagination;
    page(<Pagination ref={(x: Pagination) => (p = x)} mode="full" total={100} x-model={() => s.page} />);
    await settle();
    expect(p.page).toBe(3);
    face(p.element.querySelector('.mx-pagination__step[data-step="next"]')!).click();
    await settle();
    expect(s.page).toBe(4);
  });

  it('changes the page size keeping the first item of the page in view', async () => {
    const p = new Pagination({ mode: 'full', total: 100, pageSize: 10, page: 5, pageSizes: [10, 25, 0] });
    page(p);
    await settle();
    const sizes = Array.from(p.element.querySelectorAll<HTMLElement>('.mx-pagination__size'));
    expect(sizes.map((b) => b.textContent)).toEqual(['10', '25', 'All']);
    face(sizes[1]).click();
    expect(p.pageSize).toBe(25);
    expect(p.page).toBe(2);
    face(sizes[2]).click();
    expect(p.pageCount).toBe(1);
    expect(p.page).toBe(1);
  });

  it('in the compact look has a page box instead of page buttons, and writes numbers in the kit language', async () => {
    const p = new Pagination({ mode: 'compact', total: 12000, pageSize: 10, page: 1 });
    page(p);
    await settle();
    expect(p.compact).toBe(true);
    expect(p.element.dataset.look).toBe('compact');
    expect(p.element.querySelector('.mx-pagination__number')).not.toBe(null);
    expect(p.element.textContent).toContain('of 1,200');
    await uiLocale.use('tr');
    expect(p.element.textContent).toContain('1.200');
  });
});
