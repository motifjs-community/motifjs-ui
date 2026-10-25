import { data } from '@motifx-community/data';
import { describe, expect, it } from 'vitest';
import { RowSelection } from './RowSelection';

const entry = (k: number): [string, unknown] => [String(k), k];

describe('RowSelection', () => {
  it('selects rows one by one and tells every change', () => {
    const sel = new RowSelection();
    const told: number[] = [];
    sel.onChanged((s) => told.push(s.keys.length));
    sel.set(...entry(1), true);
    sel.toggle(...entry(2));
    sel.set(...entry(2), true);
    expect(sel.isSelected('1') && sel.isSelected('2')).toBe(true);
    expect(sel.snapshot()).toEqual({ all: false, keys: [1, 2], except: [], filter: null });
    expect(told).toEqual([1, 2]);
    sel.only(...entry(3), 5);
    expect(sel.snapshot().keys).toEqual([3]);
    expect(sel.anchor).toBe(5);
  });

  it('keeps "all" as a state: the filter and the rows taken out', () => {
    const sel = new RowSelection();
    const filter = data.where('city', '=', 'Ankara');
    sel.selectAll(filter);
    expect(sel.isSelected('anything')).toBe(true);
    sel.set(...entry(7), false);
    expect(sel.snapshot()).toEqual({ all: true, keys: [], except: [7], filter });
    expect(sel.count(100)).toBe(99);
    expect(sel.size).toBe(1);
    sel.set(...entry(7), true);
    expect(sel.count(100)).toBe(100);
  });

  it('extends a range from the anchor onto what was selected before it', () => {
    const sel = new RowSelection();
    sel.set(...entry(1), true);
    sel.setAnchor(4);
    sel.extend([entry(4), entry(5), entry(6)]);
    expect(sel.snapshot().keys).toEqual([1, 4, 5, 6]);
    // A shorter range drops what the longer one added, not what was there before.
    sel.extend([entry(4), entry(5)]);
    expect(sel.snapshot().keys).toEqual([1, 4, 5]);
  });

  it('drops "all" when the filter changes, keeps rows picked one by one', () => {
    const sel = new RowSelection();
    sel.set(...entry(1), true);
    sel.filterChanged();
    expect(sel.snapshot().keys).toEqual([1]);
    sel.selectAll(null);
    sel.filterChanged();
    expect(sel.empty).toBe(true);
    expect(sel.all).toBe(false);
  });

  it('replaces the selection with given keys, and stays quiet when they are the same', () => {
    const sel = new RowSelection();
    let told = 0;
    sel.onChanged(() => told++);
    sel.replace([entry(1), entry(2)]);
    sel.replace([entry(2), entry(1)]);
    expect(told).toBe(1);
    sel.clear();
    sel.clear();
    expect(told).toBe(2);
  });
});
