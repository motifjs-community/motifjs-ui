import { describe, expect, it } from 'vitest';
import type { MenuItem } from '../menu/menu-item';
import { ItemLayout } from './ItemLayout';
import type { LayoutCustomization } from './layout-customization';
import type { LayoutNode } from './layout-node';

const ITEMS: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'paste', text: '&Paste' }] },
  { key: 'help', text: '&Help', customizable: false, items: [{ key: 'about', text: '&About' }] },
];
const COMMANDS: MenuItem[] = [{ key: 'print', text: '&Print' }];

function layout(start: LayoutCustomization = {}) {
  const s = { custom: start };
  const l = new ItemLayout<MenuItem, LayoutCustomization>({ items: () => ITEMS, commands: () => COMMANDS, custom: () => s.custom, childrenField: 'items' });
  const apply = (next: LayoutCustomization | null) => {
    expect(next).not.toBeNull();
    s.custom = next!;
  };
  const tree = (nodes: LayoutNode<MenuItem>[] = l.childrenOf(null)): unknown[] =>
    nodes.filter((n) => !n.hidden).map((n) => (n.holds ? { [String(n.drawn.text)]: tree(n.children()) } : String(n.drawn.text)));
  return { s, l, apply, tree, find: (id: string) => l.find(id)! };
}

describe('ItemLayout as a tree', () => {
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
    expect(l.addedTo(find('file'), { command: 'nothing' })).toBeNull();
    expect(l.addedTo(null, { separator: true })).toBeNull();
  });

  it('adds commands and menus of the user, names them, and takes them away with what is in them', () => {
    const { s, l, apply, tree, find } = layout();
    const menu = l.addedTo(null, { text: 'Tools' }, { after: find('edit') })!;
    apply(menu.custom);
    expect(menu.id).toBe('user:1');
    const print = l.addedTo(find('user:1'), { command: 'print' })!;
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

interface Tool {
  key?: string;
  text?: string;
  type?: string;
  customizable?: boolean;
  display?: string;
}

const TOOLS: Tool[] = [{ key: 'new', text: 'New' }, { key: 'open', text: 'Open' }, { key: 'save', text: 'Save' }, { key: 'help', text: 'Help', customizable: false }];
const TOOL_COMMANDS: Tool[] = [{ key: 'print', text: 'Print' }];

describe('ItemLayout as a flat list', () => {
  function flat(start: LayoutCustomization & { display?: Record<string, string> } = {}) {
    const s = { custom: start };
    const l = new ItemLayout<Tool, typeof start>({
      items: () => TOOLS,
      commands: () => TOOL_COMMANDS,
      custom: () => s.custom,
      childrenField: null,
      separator: (id) => ({ key: id, type: 'separator' }),
      dressed: (node) => (s.custom.display?.[node.id] ? { display: s.custom.display[node.id] } : null),
    });
    const apply = (next: typeof start | null) => {
      expect(next).not.toBeNull();
      s.custom = next!;
    };
    const row = () => l.childrenOf(null).filter((n) => !n.hidden).map((n) => (n.separator ? '|' : `${n.drawn.text}${n.drawn.display ? `:${n.drawn.display}` : ''}`));
    return { s, l, apply, row, find: (id: string) => l.find(id)! };
  }

  it('adds commands and separators before or after an item, and removes them', () => {
    const { s, l, apply, row, find } = flat();
    const bar = l.addedTo(null, { separator: true }, { before: find('save') })!;
    apply(bar.custom);
    apply(l.addedTo(null, { command: 'print' }, { after: find('save') })!.custom);
    expect(row()).toEqual(['New', 'Open', '|', 'Save', 'Print', 'Help']);
    expect(l.shown(find(bar.id), false)).toBeNull();
    expect(l.renamed(find(bar.id), 'x')).toBeNull();
    expect(l.addedTo(null, { text: 'Group' })).toBeNull();
    apply(l.removed(find(bar.id)));
    expect(row()).toEqual(['New', 'Open', 'Save', 'Print', 'Help']);
    expect(s.custom.added?.map((a) => a.command)).toEqual(['print']);
  });

  it('hides, moves and renames items; the owner’s own changes dress the drawn copy; the items given stay as they are', () => {
    const { l, apply, row, find, s } = flat();
    apply(l.shown(find('open'), false));
    apply(l.moved(find('save'), -1, false));
    apply(l.renamed(find('new'), 'Create'));
    s.custom = { ...s.custom, display: { save: 'icon' } };
    expect(row()).toEqual(['Save:icon', 'Create', 'Help']);
    expect(l.canMove(find('save'), 1, false)).toBe(true);
    // The fixed item at the end: nothing moves past it.
    expect(l.canMove(find('new'), 1, false)).toBe(false);
    expect(TOOLS[0].text).toBe('New');
    expect(l.movedInto(find('save'), find('new'))).toBeNull();
  });
});
