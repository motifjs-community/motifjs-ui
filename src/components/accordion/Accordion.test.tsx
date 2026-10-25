import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Accordion } from './Accordion';
import { AccordionItem } from './AccordionItem';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const headers = (a: Accordion) => Array.from(a.element.querySelectorAll<HTMLButtonElement>('.mx-accordion__header'));
const open = (a: Accordion) => headers(a).map((h) => h.getAttribute('aria-expanded') === 'true');

describe('Accordion', () => {
  it('builds the accordion pattern from JSX children', async () => {
    let a!: Accordion;
    page(
      <Accordion ref={(x: Accordion) => (a = x)}>
        <AccordionItem title="&Shipping">
          <p>Ship it</p>
        </AccordionItem>
        <AccordionItem title="Payment" expanded>
          <p class="pay">Pay</p>
        </AccordionItem>
      </Accordion>,
    );
    await settle();
    const [shipping, payment] = headers(a);
    const heading = shipping.parentElement!;
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('3');
    expect(shipping.textContent).toBe('Shipping');
    expect(shipping.getAttribute('aria-keyshortcuts')).toBe('Alt+S');
    expect(open(a)).toEqual([false, true]);
    const region = a.items[1].regionElement;
    expect(payment.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-labelledby')).toBe(payment.id);
    expect(region.querySelector('.pay')).not.toBeNull();
    expect(a.value).toEqual([1]);
    expect({ ...a.element.dataset }).toMatchObject({ variant: 'list', size: 'md', chevron: 'end' });
  });

  it('opens one item at a time unless multiple', async () => {
    let a!: Accordion;
    const s = reactive({ multiple: false });
    page(
      <Accordion ref={(x: Accordion) => (a = x)} multiple={() => s.multiple}>
        <AccordionItem title="A" />
        <AccordionItem title="B" />
        <AccordionItem title="C" />
      </Accordion>,
    );
    await settle();
    headers(a)[0].click();
    headers(a)[1].click();
    expect(open(a)).toEqual([false, true, false]);
    headers(a)[1].click();
    expect(open(a)).toEqual([false, false, false]);

    s.multiple = true;
    await settle();
    headers(a)[0].click();
    headers(a)[2].click();
    expect(open(a)).toEqual([true, false, true]);
    s.multiple = false;
    await settle();
    expect(open(a)).toEqual([true, false, false]);
  });

  it('keeps one item open when not collapsible, and says so on its header', async () => {
    let a!: Accordion;
    page(
      <Accordion ref={(x: Accordion) => (a = x)} collapsible={false}>
        <AccordionItem title="A" />
        <AccordionItem title="B" />
      </Accordion>,
    );
    await settle();
    expect(open(a)).toEqual([true, false]);
    expect(headers(a)[0].getAttribute('aria-disabled')).toBe('true');
    headers(a)[0].click();
    expect(open(a)).toEqual([true, false]);
    headers(a)[1].click();
    expect(open(a)).toEqual([false, true]);
    expect(headers(a)[0].hasAttribute('aria-disabled')).toBe(false);
    a.collapsible = true;
    expect(headers(a)[1].hasAttribute('aria-disabled')).toBe(false);
  });

  it('binds value two-way with x-model, by key', async () => {
    const s = reactive({ open: ['payment'] as (string | number)[] });
    let a!: Accordion;
    page(
      <Accordion ref={(x: Accordion) => (a = x)} multiple x-model={() => s.open}>
        <AccordionItem key="shipping" title="Shipping" />
        <AccordionItem key="payment" title="Payment" />
        <AccordionItem title="No key" />
      </Accordion>,
    );
    await settle();
    expect(open(a)).toEqual([false, true, false]);
    headers(a)[0].click();
    await settle();
    expect([...s.open]).toEqual(['shipping', 'payment']);
    headers(a)[2].click();
    await settle();
    expect([...s.open]).toEqual(['shipping', 'payment', 2]);
    s.open = [];
    await settle();
    expect(open(a)).toEqual([false, false, false]);
  });

  it('fires cancelable events for the user, and reports every change', async () => {
    const expanded = vi.fn();
    const collapsed = vi.fn();
    let a!: Accordion;
    page(
      <Accordion
        ref={(x: Accordion) => (a = x)}
        onExpanding={(e) => {
          if (e.item.title === 'Locked') e.cancel = true;
        }}
        onCollapsing={(e) => {
          if (e.item.title === 'Sticky') e.cancel = true;
        }}
        onExpanded={expanded}
        onCollapsed={collapsed}
      >
        <AccordionItem title="Locked" />
        <AccordionItem title="Sticky" />
        <AccordionItem title="Other" />
      </Accordion>,
    );
    await settle();
    headers(a)[0].click();
    expect(open(a)).toEqual([false, false, false]);
    headers(a)[1].click();
    expect(expanded).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1, byUser: true }));
    headers(a)[1].click();
    expect(open(a)).toEqual([false, true, false]);
    a.items[0].expanded = true;
    expect(open(a)).toEqual([true, false, false]);
    expect(expanded).toHaveBeenLastCalledWith(expect.objectContaining({ index: 0, byUser: false }));
    expect(collapsed).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1, byUser: false }));
  });

  it('is complete from code: add, insert, remove, expand', async () => {
    const a = new Accordion({ variant: 'separated' });
    page(a);
    const two = a.add(new AccordionItem({ title: 'Two', key: 'two' }));
    const one = a.insert(0, new AccordionItem({ title: 'One' }));
    expect(a.items).toEqual([one, two]);
    expect(two.expand()).toBe(true);
    expect(a.value).toEqual(['two']);
    a.value = [0];
    expect(open(a)).toEqual([true, false]);
    two.headerElement.focus();
    a.remove(two);
    await settle();
    expect(two.isDisposed).toBe(true);
    expect(a.items).toEqual([one]);
    expect(document.activeElement).toBe(one.headerElement);
    expect(a.element.dataset.variant).toBe('separated');
  });

  it('builds a section when first opened and keeps it; content factories can be dropped', async () => {
    const built = vi.fn();
    let made = 0;
    let a!: Accordion;
    page(
      <Accordion ref={(x: Accordion) => (a = x)} keepAlive={false}>
        <AccordionItem title="Lazy">
          <div onBuilt={built} />
        </AccordionItem>
        <AccordionItem
          title="Made"
          content={() => {
            made++;
            return new Component<HTMLParagraphElement>('p');
          }}
        />
        <AccordionItem title="Eager" lazy={false}>
          <p class="eager" />
        </AccordionItem>
      </Accordion>,
    );
    await settle();
    expect(built).not.toHaveBeenCalled();
    expect(a.element.querySelector('.eager')).not.toBeNull();
    headers(a)[0].click();
    await settle();
    expect(built).toHaveBeenCalledTimes(1);
    headers(a)[1].click();
    headers(a)[1].click();
    headers(a)[1].click();
    expect(made).toBe(2);
    headers(a)[0].click();
    expect(built).toHaveBeenCalledTimes(1);
  });

  it('moves between headers with Up, Down, Home and End unless arrowKeys is off', async () => {
    let a!: Accordion;
    const s = reactive({ keys: true });
    page(
      <Accordion ref={(x: Accordion) => (a = x)} arrowKeys={() => s.keys}>
        <AccordionItem title="A" />
        <AccordionItem title="B" enabled={false} />
        <AccordionItem title="C" />
      </Accordion>,
    );
    await settle();
    const [ha, , hc] = headers(a);
    ha.focus();
    expect(press('ArrowDown')).toBe(true);
    expect(document.activeElement).toBe(hc);
    press('ArrowDown');
    expect(document.activeElement).toBe(ha);
    press('End');
    expect(document.activeElement).toBe(hc);
    press('Home');
    expect(document.activeElement).toBe(ha);
    press('ArrowUp');
    expect(document.activeElement).toBe(hc);
    s.keys = false;
    await settle();
    expect(press('ArrowDown')).toBe(false);
  });

  it('opens an item with its access key', async () => {
    let a!: Accordion;
    page(
      <Accordion ref={(x: Accordion) => (a = x)}>
        <AccordionItem title="&Shipping" />
        <AccordionItem title="&Payment" />
      </Accordion>,
    );
    await settle();
    press('p', { altKey: true });
    expect(open(a)).toEqual([false, true]);
    expect(document.activeElement).toBe(headers(a)[1]);
  });

  it('follows every prop given as a function', async () => {
    const s = reactive({
      level: 3,
      regions: 'auto' as boolean | 'auto',
      variant: 'list' as 'list' | 'flush',
      size: 'md' as 'md' | 'lg',
      chevron: 'end' as 'end' | 'start',
      title: 'One',
      hint: '',
      expanded: false,
      visible: true,
    });
    let a!: Accordion;
    page(
      <Accordion
        ref={(x: Accordion) => (a = x)}
        headingLevel={() => s.level}
        regions={() => s.regions}
        variant={() => s.variant}
        size={() => s.size}
        chevron={() => s.chevron}
      >
        <AccordionItem title={() => s.title} hint={() => s.hint} expanded={() => s.expanded} />
        <AccordionItem title="Two" visible={() => s.visible} />
      </Accordion>,
    );
    await settle();
    Object.assign(s, { level: 4, regions: false, variant: 'flush', size: 'lg', chevron: 'start', title: 'Uno', hint: 'Help', expanded: true });
    await settle();
    const item = a.items[0];
    expect(item.headerElement.parentElement!.getAttribute('aria-level')).toBe('4');
    expect(item.regionElement.hasAttribute('role')).toBe(false);
    expect(item.regionElement.hasAttribute('aria-labelledby')).toBe(false);
    expect({ ...a.element.dataset }).toMatchObject({ variant: 'flush', size: 'lg', chevron: 'start' });
    expect(item.headerElement.textContent).toBe('Uno');
    expect(item.headerElement.title).toBe('Help');
    expect(item.expanded).toBe(true);
    s.visible = false;
    await settle();
    expect(a.items[1].visible).toBe(false);
  });

  it('drops region roles when there are many items', async () => {
    const a = new Accordion();
    for (let i = 0; i < 7; i++) a.add(new AccordionItem({ title: `Item ${i}` }));
    page(a);
    expect(a.items[0].regionElement.hasAttribute('role')).toBe(false);
    a.remove(a.items[6]);
    expect(a.items[0].regionElement.getAttribute('role')).toBe('region');
  });

  it('disables everything inside with enabled', async () => {
    const a = new Accordion();
    a.add(new AccordionItem({ title: 'A' }));
    page(a);
    a.enabled = false;
    expect(headers(a)[0].disabled).toBe(true);
    headers(a)[0].click();
    expect(open(a)).toEqual([false]);
  });
});
