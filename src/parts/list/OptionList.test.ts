import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick } from '../../../tests/helpers';
import { OptionList } from './OptionList';

type Item = { text: string };

const items = (n: number): Item[] => Array.from({ length: n }, (_, i) => ({ text: `Item ${i}` }));

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('OptionList', () => {
  it('joins typed letters into one search within typingDelay (default 600 ms)', () => {
    vi.useFakeTimers();
    const list = new OptionList<Item>();
    list.setItems([{ text: 'Ada' }, { text: 'Bob' }, { text: 'Bea' }]);
    expect(list.typeAhead('b')).toBe(1);
    vi.advanceTimersByTime(500);
    expect(list.typeAhead('e')).toBe(2);
    list.typingDelay = 100;
    vi.advanceTimersByTime(200);
    expect(list.typeAhead('a')).toBe(0);
  });

  it('draws extraRows rows beyond the visible ones in a long list (default 6)', async () => {
    const list = mount(new OptionList<Item>());
    list.setItems(items(500));
    await new Promise((r) => setTimeout(r, 20));
    const drawn = () => list.element.querySelectorAll('[role="option"]').length;
    const plain = drawn();
    list.extraRows = 1;
    list.setItems(items(400));
    await new Promise((r) => setTimeout(r, 20));
    expect(drawn()).toBe(plain - 5);
    list.dispose();
  });

  it('keeps the rows of the items that stay when fewer items leave the list scrolled past its end', async () => {
    const list = mount(new OptionList<Item>());
    const all = items(500);
    list.setItems(all);
    await new Promise((r) => setTimeout(r, 20));
    list.move('last');
    await tick();
    const option = (text: string) => [...list.element.querySelectorAll('[role="option"]')].find((o) => o.textContent === text);
    const last = option('Item 499');
    expect(last).toBeDefined();
    list.setItems(all.slice(380));
    await tick();
    expect(option('Item 499')).toBe(last);
    list.dispose();
  });

  it('shows a row that failed to load as failed, and a press or Enter on it loads it again', async () => {
    const list = mount(new OptionList<Item>());
    const retried = vi.fn();
    list.setSource({ count: 3, at: (i) => (i === 0 ? { text: 'Ada' } : undefined), failedAt: (i) => i === 2, retryFailed: retried });
    await tick();
    const rows = list.element.querySelectorAll<HTMLElement>('[role="option"]');
    expect(rows[1].hasAttribute('data-loading')).toBe(true);
    expect(rows[2].hasAttribute('data-failed')).toBe(true);
    expect(rows[2].hasAttribute('aria-busy')).toBe(false);
    expect(rows[2].textContent).toBe('Could not load. Retry');
    rows[2].click();
    expect(retried).toHaveBeenCalledTimes(1);
    list.setActive(2);
    expect(list.handleKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true);
    expect(retried).toHaveBeenCalledTimes(2);
    list.dispose();
  });

  it('says a list that failed to load failed, not that it is empty, and loads it again on a press or Enter', async () => {
    const list = mount(new OptionList<Item>());
    const retried = vi.fn();
    list.emptyText = () => 'Nothing here';
    list.setSource({ count: 0, at: () => undefined, failedAt: (i) => i === undefined, retryFailed: retried });
    await tick();
    const empty = list.element.querySelector<HTMLElement>('.mx-list__empty')!;
    expect(empty.textContent).toBe('Could not load. Retry');
    expect(empty.hasAttribute('data-failed')).toBe(true);
    empty.click();
    expect(list.handleKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true);
    expect(retried).toHaveBeenCalledTimes(2);
    list.setSource({ count: 0, at: () => undefined });
    await tick();
    expect(list.element.querySelector('.mx-list__empty')!.textContent).toBe('Nothing here');
    list.dispose();
  });

  it('keeps the option of an item given again and changes what it shows in place', async () => {
    const list = mount(new OptionList<Item>());
    const ada = { text: 'Ada' };
    const bob = { text: 'Bob' };
    let chosen: Item | null = null;
    list.isSelected = (item) => item === chosen;
    list.setItems([ada, bob]);
    await tick();
    const row = list.element.querySelector('[role="option"]')!;
    ada.text = 'Ada L.';
    chosen = ada;
    list.setItems([{ text: 'Cy' }, ada]);
    await tick();
    const rows = list.element.querySelectorAll('[role="option"]');
    expect(rows[1]).toBe(row);
    expect(row.textContent).toBe('Ada L.');
    expect(row.getAttribute('aria-selected')).toBe('true');
    expect(row.id).toBe(list.idOf(1));
    list.setActive(1, false);
    await tick();
    expect(row.hasAttribute('data-active')).toBe(true);
    list.dispose();
  });
});
