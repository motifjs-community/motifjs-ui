import { describe, expect, it } from 'vitest';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuBarCustomization } from './menu-bar-customization';
import { MenuLayout } from './MenuLayout';
import type { MenuNode } from './menu-node';

const ITEMS: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'paste', text: '&Paste' }] },
  { key: 'help', text: '&Help', customizable: false, items: [{ key: 'about', text: '&About' }] },
];
const COMMANDS: MenuItem[] = [{ key: 'print', text: '&Print' }];

function layout(start: MenuBarCustomization = {}) {
  const s = { custom: start };
  const l = new MenuLayout(() => ITEMS, () => COMMANDS, () => s.custom);
  const apply = (next: MenuBarCustomization | null) => {
    expect(next).not.toBeNull();
    s.custom = next!;
  };
  const tree = (nodes: MenuNode[] = l.childrenOf(null)): unknown[] =>
    nodes.filter((n) => !n.hidden).map((n) => (n.holds ? { [String(n.drawn.text)]: tree(n.children()) } : String(n.drawn.text)));
  return { s, l, apply, tree, find: (id: string) => l.find(id)! };
}

describe('MenuLayout', () => {
  it('draws the items as given while the user changed nothing', () => {
    const { l } = layout();
    expect(l.untouched).toBe(true);
    expect(l.childrenOf(null).map((n) => n.drawn)).toEqual(ITEMS);
  });

  it('moves an item to another menu and keeps its name there; home again undoes the move', () => {
    const { s, l, apply, tree, find } = layout();
    apply(l.movedInto(find('edit/paste'), find('file')));
    expect(s.custom.moves).toEqual({ 'edit/paste': 'file' });
    expect(tree()).toEqual([{ '&File': ['&New', '&Save', '&Paste'] }, { '&Edit': ['&Undo'] }, { '&Help': ['&About'] }]);
    expect(find('edit/paste').path).toBe('file/paste');
    apply(l.shown(find('edit/paste'), false));
    expect(tree()[0]).toEqual({ '&File': ['&New', '&Save'] });
    apply(l.shown(find('edit/paste'), true));
    apply(l.movedInto(find('edit/paste'), find('edit')));
    expect(s.custom.moves).toEqual({});
  });

  it('refuses what cannot be: a fixed item, into itself, a key the menu already has', () => {
    const { l, find } = layout();
    expect(l.canMoveInto(find('help'), find('file'))).toBe(false);
    expect(l.canMoveInto(find('file'), find('file'))).toBe(false);
    expect(l.canMoveInto(find('file/new'), find('file'))).toBe(false);
    expect(l.canMove(find('edit'), 1, true)).toBe(false);
    expect(l.addedTo(find('file'), { command: 'nothing' }, null)).toBeNull();
  });

  it('adds commands and menus of the user, names them, and takes them away with what is in them', () => {
    const { s, l, apply, tree, find } = layout();
    const menu = l.addedTo(null, { text: 'Tools' }, find('edit'))!;
    apply(menu.custom);
    expect(menu.id).toBe('user:1');
    const print = l.addedTo(find('user:1'), { command: 'print' }, null)!;
    apply(print.custom);
    apply(l.movedInto(find('file/save'), find('user:1')));
    apply(l.renamed(find('user:1'), 'My tools'));
    apply(l.renamed(find('file/new'), 'New file'));
    expect(tree()).toEqual([{ '&File': ['New file'] }, { '&Edit': ['&Undo', '&Paste'] }, { 'My tools': ['&Print', '&Save'] }, { '&Help': ['&About'] }]);
    apply(l.removed(find('user:1')));
    expect(s.custom.added).toEqual([]);
    expect(s.custom.moves).toEqual({});
    expect(tree()[0]).toEqual({ '&File': ['New file', '&Save'] });
    apply(l.reset(find('file')));
    expect(tree()[0]).toEqual({ '&File': ['&New', '&Save'] });
  });

  it('moves among the shown items, the hidden ones keeping their places', () => {
    const { s, l, apply, find } = layout({ hidden: ['file/save'] });
    expect(l.canMove(find('file/new'), 1, false)).toBe(false);
    expect(l.canMove(find('file/new'), 1, true)).toBe(true);
    apply(l.moved(find('file/new'), 1, true));
    expect(s.custom.order).toEqual({ file: ['save', 'new'] });
  });
});
