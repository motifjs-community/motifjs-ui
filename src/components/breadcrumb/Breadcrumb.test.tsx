import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Breadcrumb } from './Breadcrumb';

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

const steps = (b: Breadcrumb) => Array.from(b.element.querySelectorAll<HTMLElement>('.mx-breadcrumb__item:not(.mx-breadcrumb__more)'));

describe('Breadcrumb', () => {
  it('draws links, buttons and the current page, the same from JSX and from code', async () => {
    let jsx!: Breadcrumb;
    page(<Breadcrumb ref={(b: Breadcrumb) => (jsx = b)} rel="router" items={[{ text: 'Home', href: '/' }, 'Orders', { text: 'Order 42' }]} />);
    const coded = new Breadcrumb({ items: ['A', 'B'], lastIsCurrent: false });
    page(coded);
    await settle();
    expect(jsx.element.tagName).toBe('NAV');
    expect(jsx.element.getAttribute('aria-label')).toBe(enStrings.breadcrumb);
    const [home, orders, current] = steps(jsx);
    expect(home.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(home.querySelector('a')?.getAttribute('rel')).toBe('router');
    expect(orders.querySelector('button')?.textContent).toBe('Orders');
    expect(current.querySelector('[aria-current="page"]')?.textContent).toBe('Order 42');
    expect(current.querySelector('.mx-breadcrumb__divider')).toBe(null);
    expect(home.querySelector('.mx-breadcrumb__divider')).not.toBe(null);
    expect(steps(coded)[1].querySelector('button')?.textContent).toBe('B');
    await uiLocale.use('tr');
    expect(jsx.element.getAttribute('aria-label')).not.toBe(enStrings.breadcrumb);
  });

  it('tells a press, and a cancelled link is not followed', async () => {
    const seen: number[] = [];
    const crumb = new Breadcrumb({ items: [{ text: 'Home', href: '#home' }, 'Docs', 'Page'], onItemClick: (e) => {
      seen.push(e.index);
      e.cancel = e.index === 0;
    } });
    page(crumb);
    await settle();
    const link = steps(crumb)[0].querySelector('a')!;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    steps(crumb)[1].querySelector('button')!.click();
    expect(seen).toEqual([0, 1]);
  });

  it('puts the steps between the first and the last into a menu beyond maxItems, and follows items as functions', async () => {
    const s = reactive({ last: 'Five' });
    const crumb = new Breadcrumb({ maxItems: 3, items: ['One', 'Two', 'Three', 'Four', { text: () => s.last }] });
    page(crumb);
    await settle();
    expect(crumb.collapsed).toEqual([1, 2]);
    const shownTexts = steps(crumb).filter((el) => !el.hidden).map((el) => el.textContent);
    expect(shownTexts).toEqual(['One', 'Four', 'Five']);
    expect(crumb.element.querySelector<HTMLElement>('.mx-breadcrumb__more')!.hidden).toBe(false);
    s.last = 'Fifth';
    await settle();
    expect(steps(crumb).at(-1)?.textContent).toBe('Fifth');
    crumb.maxItems = null;
    expect(crumb.collapsed).toEqual([]);
  });
});
