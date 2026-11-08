import { givenField, givenList, givenValue } from '../../core/given-field';
import { itemsAlong, keyOf, partsOf } from '../../parts/item-tree/item-paths';
import { ordered } from '../../parts/item-tree/ordered';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuBarAddedItem } from './menu-bar-added-item';
import type { MenuBarCustomization } from './menu-bar-customization';
import type { MenuNode } from './menu-node';

interface Entry {
  id: string;
  key: string;
  item: MenuItem;
  added: boolean;
}

/**
 * The items of a `MenuBar` as the user arranged them: the items given, with what the user hid, ordered, moved, renamed
 * and added. Nothing given is changed; a menu the user changed is drawn as a copy. The changes are new customization
 * objects, which the bar keeps.
 */
export class MenuLayout {
  items: () => readonly MenuItem[];
  commands: () => readonly MenuItem[];
  custom: () => MenuBarCustomization;
  /** The menus of the user's own, kept by id so that an open one stays the same object. */
  menus = new Map<string, MenuItem>();
  drawnNodes = new WeakMap<MenuItem, MenuNode>();

  constructor(items: () => readonly MenuItem[], commands: () => readonly MenuItem[], custom: () => MenuBarCustomization) {
    this.items = items;
    this.commands = commands;
    this.custom = custom;
  }

  /** Whether the user changed nothing: the items are drawn as given. */
  get untouched(): boolean {
    const c = this.custom();
    return !c.hidden?.length && !c.added?.length && [c.order, c.moves, c.texts].every((map) => !map || !Object.keys(map).length);
  }

  /** The items of the bar, or of the menu of `parent`, hidden ones included. */
  childrenOf(parent: MenuNode | null): MenuNode[] {
    const c = this.custom();
    const parentId = parent?.id ?? '';
    const moves = c.moves ?? {};
    const entries: Entry[] = [];
    const given = parent ? givenList(givenField<readonly MenuItem[] | undefined>(parent.item, 'items')) : givenList(this.items());
    given.forEach((item, i) => {
      const key = keyOf(item, i);
      const id = parentId ? `${parentId}/${key}` : key;
      if (moves[id] === undefined || moves[id] === parentId) entries.push({ id, key, item, added: false });
    });
    for (const [id, to] of Object.entries(moves)) {
      if (to !== parentId || entries.some((e) => e.id === id)) continue;
      const item = this.original(id);
      if (item) entries.push({ id, key: partsOf(id).pop()!, item, added: false });
    }
    for (const a of c.added ?? []) {
      if (a.parent !== parentId) continue;
      const item = this.addedItem(a);
      if (item) entries.push({ id: a.id, key: a.command ?? a.id, item, added: true });
    }
    return ordered(entries, c.order?.[parentId], (e) => e.key).map((e) => this.node(e, parentId, parent?.path ?? ''));
  }

  /** Every item, hidden ones included, from the bar down. */
  all(): MenuNode[] {
    const out: MenuNode[] = [];
    const walk = (nodes: MenuNode[]) => {
      for (const node of nodes) {
        out.push(node);
        if (node.holds) walk(node.children());
      }
    };
    walk(this.childrenOf(null));
    return out;
  }

  find(id: string): MenuNode | null {
    return this.all().find((node) => node.id === id) ?? null;
  }

  /** The item drawn as `item`, or given as `item`. */
  nodeOf(item: MenuItem): MenuNode | null {
    return this.drawnNodes.get(item) ?? this.all().find((node) => node.item === item || node.drawn === item) ?? null;
  }

  /** The items of the bar or of a menu the user can move among: the shown ones, or all when `hiddenToo`. */
  siblingsOf(node: MenuNode, hiddenToo: boolean): MenuNode[] {
    const parent = node.parent ? this.find(node.parent) : null;
    return this.childrenOf(parent).filter((n) => hiddenToo || !n.hidden);
  }

  canMove(node: MenuNode, step: 1 | -1, hiddenToo: boolean): boolean {
    if (node.fixed) return false;
    const siblings = this.siblingsOf(node, hiddenToo);
    const next = siblings[siblings.findIndex((n) => n.id === node.id) + step];
    return !!next && !next.fixed;
  }

  // The changes: each returns the new customization, or `null` when nothing can change.

  shown(node: MenuNode, on: boolean): MenuBarCustomization | null {
    // Already so, or fixed: nothing to change.
    if (node.fixed || node.hidden === !on) return null;
    const hidden = (this.custom().hidden ?? []).filter((id) => id !== node.id);
    return { ...this.custom(), hidden: on ? hidden : [...hidden, node.id] };
  }

  /** One place earlier or later among the siblings; the ones left out keep their places. */
  moved(node: MenuNode, step: 1 | -1, hiddenToo: boolean): MenuBarCustomization | null {
    if (!this.canMove(node, step, hiddenToo)) return null;
    const among = this.siblingsOf(node, hiddenToo);
    const next = among[among.findIndex((n) => n.id === node.id) + step];
    const keys = this.siblingsOf(node, true).map((n) => n.key);
    const a = keys.indexOf(node.key);
    const b = keys.indexOf(next.key);
    [keys[a], keys[b]] = [keys[b], keys[a]];
    return { ...this.custom(), order: { ...(this.custom().order ?? {}), [node.parent]: keys } };
  }

  /** Whether `node` can go into the menu `target` (`null` for the bar). */
  canMoveInto(node: MenuNode, target: MenuNode | null): boolean {
    if (node.fixed || (!node.added && !this.original(node.id))) return false;
    if (target && (!target.holds || target.id === node.id || target.path.startsWith(`${node.path}/`))) return false;
    if ((target?.id ?? '') === node.parent) return false;
    return !this.childrenOf(target).some((n) => n.key === node.key);
  }

  movedInto(node: MenuNode, target: MenuNode | null): MenuBarCustomization | null {
    if (!this.canMoveInto(node, target)) return null;
    const c = this.custom();
    const to = target?.id ?? '';
    // It goes to the end of the menu.
    const order = { ...(c.order ?? {}), [to]: [...this.childrenOf(target).map((n) => n.key), node.key] };
    if (node.added) return { ...c, order, added: (c.added ?? []).map((a) => (a.id === node.id ? { ...a, parent: to } : a)) };
    const moves = { ...(c.moves ?? {}) };
    const home = partsOf(node.id).slice(0, -1).join('/');
    if (to === home) delete moves[node.id];
    else moves[node.id] = to;
    return { ...c, order, moves };
  }

  renamed(node: MenuNode, text: string): MenuBarCustomization | null {
    const c = this.custom();
    const texts = { ...(c.texts ?? {}) };
    if (node.added && this.menus.get(node.id) === node.item) {
      // A menu of the user's own keeps its name in `added`.
      return { ...c, added: (c.added ?? []).map((a) => (a.id === node.id ? { ...a, text } : a)) };
    }
    if (text === givenField<string | undefined>(node.item, 'text')) delete texts[node.id];
    else texts[node.id] = text;
    return { ...c, texts };
  }

  /** Adds a command of `commands`, or a menu of the user's own (`text`), to the menu `target`, after `after`. */
  addedTo(target: MenuNode | null, what: { command?: string; text?: string }, after: MenuNode | null): { custom: MenuBarCustomization; id: string } | null {
    if (target && !target.holds) return null;
    const c = this.custom();
    const used = (c.added ?? []).map((a) => Number(a.id.slice(5)) || 0);
    const id = `user:${Math.max(0, ...used) + 1}`;
    const key = what.command ?? id;
    const siblings = this.childrenOf(target);
    if (siblings.some((n) => n.key === key)) return null;
    if (what.command !== undefined && !this.commands().some((cmd) => String(givenValue(cmd, 'key')) === what.command)) return null;
    const parent = target?.id ?? '';
    // After `after`, else at the end of the menu.
    const keys = siblings.map((n) => n.key);
    keys.splice(after ? keys.indexOf(after.key) + 1 : keys.length, 0, key);
    const next: MenuBarCustomization = { ...c, added: [...(c.added ?? []), { id, parent, ...what }], order: { ...(c.order ?? {}), [parent]: keys } };
    return { custom: next, id };
  }

  /** Takes away an item the user added, with what the user added in it; items of the app in it go back home. */
  removed(node: MenuNode): MenuBarCustomization | null {
    if (!node.added) return null;
    const c = this.custom();
    const gone = new Set([node.id]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const a of c.added ?? []) {
        if (!gone.has(a.id) && gone.has(a.parent)) {
          gone.add(a.id);
          grew = true;
        }
      }
    }
    const moves = Object.fromEntries(Object.entries(c.moves ?? {}).filter(([, to]) => !gone.has(to)));
    const keep = (id: string) => !gone.has(id) && !gone.has(id.split('/')[0]);
    return {
      ...c,
      added: (c.added ?? []).filter((a) => !gone.has(a.id)),
      moves,
      hidden: (c.hidden ?? []).filter(keep),
      texts: Object.fromEntries(Object.entries(c.texts ?? {}).filter(([id]) => keep(id))),
      order: Object.fromEntries(Object.entries(c.order ?? {}).filter(([id]) => keep(id))),
    };
  }

  /** Undoes what the user changed on the item and in its menu: it is shown, named and placed as given. */
  reset(node: MenuNode): MenuBarCustomization {
    const c = this.custom();
    const mine = (id: string) => id === node.id || id.startsWith(`${node.id}/`);
    return {
      ...c,
      hidden: (c.hidden ?? []).filter((id) => !mine(id)),
      texts: Object.fromEntries(Object.entries(c.texts ?? {}).filter(([id]) => !mine(id))),
      order: Object.fromEntries(Object.entries(c.order ?? {}).filter(([id]) => !mine(id))),
      moves: Object.fromEntries(Object.entries(c.moves ?? {}).filter(([id]) => !mine(id))),
    };
  }

  private node(e: Entry, parentId: string, parentPath: string): MenuNode {
    const c = this.custom();
    const fixed = givenField(e.item, 'customizable') === false;
    const holds = givenValue(e.item, 'items') !== undefined;
    const node: MenuNode = {
      id: e.id,
      key: e.key,
      path: parentPath ? `${parentPath}/${e.key}` : e.key,
      parent: parentId,
      item: e.item,
      drawn: e.item,
      hidden: !fixed && (c.hidden ?? []).includes(e.id),
      fixed,
      added: e.added,
      holds,
      children: () => this.childrenOf(node),
    };
    const text = c.texts?.[e.id];
    if (text !== undefined || (holds && !this.untouched)) {
      const copy: MenuItem = { ...e.item };
      if (text !== undefined) copy.text = text;
      if (holds) copy.items = () => node.children().filter((n) => !n.hidden).map((n) => n.drawn);
      node.drawn = copy;
    }
    this.drawnNodes.set(node.drawn, node);
    return node;
  }

  /** An item of the app by its place in the items given. */
  private original(id: string): MenuItem | null {
    const parts = partsOf(id);
    return (itemsAlong(this.items(), parts, () => 'items')?.[parts.length - 1] as MenuItem | undefined) ?? null;
  }

  private addedItem(a: MenuBarAddedItem): MenuItem | null {
    if (a.command !== undefined) return this.commands().find((cmd) => String(givenValue(cmd, 'key')) === a.command) ?? null;
    let menu = this.menus.get(a.id);
    if (!menu) this.menus.set(a.id, (menu = { key: a.id, text: '', items: [] }));
    menu.text = a.text ?? '';
    return menu;
  }
}
