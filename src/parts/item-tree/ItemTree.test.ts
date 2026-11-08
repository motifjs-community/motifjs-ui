import { describe, expect, it } from 'vitest';
import { ItemTree } from './ItemTree';

interface Node {
    key?: string;
    text: string;
    items?: Node[];
}

function tree(start: Node[]) {
    const s = { items: start, applied: 0 };
    const t = new ItemTree<Node>(() => 'items', () => s.items, next => {
        s.items = next;
        s.applied++;
    });
    return { s, t };
}

const texts = (list: readonly Node[] | undefined) => (list ?? []).map(n => n.text);

describe('ItemTree', () => {
    it('adds, removes, updates and finds by key or position, without changing what was given', () => {
        const recent: Node = { text: 'Recent', items: [{ text: 'a.txt' }] };
        const given: Node[] = [{ key: 'file', text: 'File', items: [{ key: 'new', text: 'New' }, recent] }, { key: 'help', text: 'Help' }];
        const frozen = JSON.stringify(given);
        const { s, t } = tree(given);
        expect(t.find('file/1/0')).toEqual({ text: 'a.txt' });
        expect(t.add('file/1', { text: 'b.txt' })).toBe(true);
        expect(t.update('file/new', { text: 'New…' })).toBe(true);
        expect(t.remove('help')).toBe(true);
        expect(JSON.stringify(given)).toBe(frozen);
        expect(texts(s.items)).toEqual(['File']);
        expect(texts(s.items[0].items)).toEqual(['New…', 'Recent']);
        expect(texts(s.items[0].items![1].items)).toEqual(['a.txt', 'b.txt']);
        expect(s.items[0].items![1]).not.toBe(recent);
        expect(s.items[0].items![1].items![0]).toBe(recent.items![0]);
    });

    it('says false when nothing changed', () => {
        const { s, t } = tree([{ key: 'file', text: 'File' }]);
        expect(t.remove('nope')).toBe(false);
        expect(t.update('file/x', { text: 'x' })).toBe(false);
        expect(t.add('nope', { text: 'x' })).toBe(false);
        expect(t.move('file', 0, 'file')).toBe(false);
        expect(s.applied).toBe(0);
    });

    it('moves in its list and to another list, keyless targets included', () => {
        const { s, t } = tree([{ text: 'A' }, { text: 'B' }, { text: 'C', items: [{ text: 'c1' }] }]);
        expect(t.move('0', 2)).toBe(true);
        expect(texts(s.items)).toEqual(['B', 'C', 'A']);
        // Taking B out shifts C from 1 to 0: B still lands in C's menu.
        expect(t.move('0', 0, '1')).toBe(true);
        expect(texts(s.items)).toEqual(['C', 'A']);
        expect(texts(s.items[0].items)).toEqual(['B', 'c1']);
        expect(t.move('0/0', 1, '')).toBe(true);
        expect(texts(s.items)).toEqual(['C', 'B', 'A']);
    });

    it('holds the changes between beginUpdate and endUpdate', () => {
        const { s, t } = tree([{ key: 'a', text: 'A' }]);
        t.beginUpdate();
        t.add('', { key: 'b', text: 'B' });
        t.update('b', { text: 'B!' });
        expect(s.applied).toBe(0);
        expect(texts(t.current as Node[])).toEqual(['A', 'B!']);
        t.endUpdate();
        expect(s.applied).toBe(1);
        expect(texts(s.items)).toEqual(['A', 'B!']);
    });
});
