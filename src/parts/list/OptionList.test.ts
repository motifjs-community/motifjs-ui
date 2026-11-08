import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
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

  it('shows a row that failed to load as failed, and a press or Enter on it loads it again', () => {
    const list = mount(new OptionList<Item>());
    const retried = vi.fn();
    list.setSource({ count: 3, at: (i) => (i === 0 ? { text: 'Ada' } : undefined), failedAt: (i) => i === 2, retryFailed: retried });
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

  it('says a list that failed to load failed, not that it is empty, and loads it again on a press or Enter', () => {
    const list = mount(new OptionList<Item>());
    const retried = vi.fn();
    list.emptyText = () => 'Nothing here';
    list.setSource({ count: 0, at: () => undefined, failedAt: (i) => i === undefined, retryFailed: retried });
    const empty = list.element.querySelector<HTMLElement>('.mx-list__empty')!;
    expect(empty.textContent).toBe('Could not load. Retry');
    expect(empty.hasAttribute('data-failed')).toBe(true);
    empty.click();
    expect(list.handleKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true);
    expect(retried).toHaveBeenCalledTimes(2);
    list.setSource({ count: 0, at: () => undefined });
    expect(list.element.querySelector('.mx-list__empty')!.textContent).toBe('Nothing here');
    list.dispose();
  });
});
