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
});
