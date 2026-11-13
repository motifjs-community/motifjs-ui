import { givenField, givenList, givenValue } from '../../core/given-field';
import { itemsAlong, keyOf, partsOf } from '../item-tree/item-paths';
import { ordered } from '../item-tree/ordered';
import type { ItemLayoutOptions } from './item-layout-options';
import type { LayoutAddedItem } from './layout-added-item';
import type { LayoutCustomization } from './layout-customization';
import type { LayoutNode } from './layout-node';

interface Entry<I> {
  id: string;
  key: string;
  item: I;
  added: boolean;
  separator: boolean;
}

/** Where an item the user adds goes: after an item, before one, else at the end. */
interface AddAt<I> {
  after?: LayoutNode<I> | null;
  before?: LayoutNode<I> | null;
}

/**
 * The items of a component as the user arranged them: the items given, with what the user hid, ordered, moved, renamed
 * and added. It works on a tree (a menu bar's menus) or a flat list (a toolbar). Nothing given is changed; an item the
 * user changed is drawn as a copy. Each change returns a new customization object, which the owner keeps.
 */
export class ItemLayout<I extends object, C extends LayoutCustomization> {
  options: ItemLayoutOptions<I, C>;
  /** The groups and separators of the user's own, kept by id so that each stays the same object. */
  own = new Map<string, I>();
  drawnNodes = new WeakMap<I, LayoutNode<I>>();

  constructor(options: ItemLayoutOptions<I, C>) {
    this.options = options;
  }

  get custom(): C {
    return this.options.custom();
  }

  /** Whether the user changed nothing the layout keeps: the items are drawn as given. */
  get untouched(): boolean {
    const c = this.custom;
    return !c.hidden?.length && !c.added?.length && [c.order, c.moves, c.texts].every((map) => !map || !Object.keys(map).length);
  }

  /** The items of the top, or of the group `parent`, hidden ones included. */
  childrenOf(parent: LayoutNode<I> | null): LayoutNode<I>[] {
    const c = this.custom;
    const field = this.options.childrenField;
    const parentId = parent?.id ?? '';
    const moves = c.moves ?? {};
    const entries: Entry<I>[] = [];
    const given = parent ? (field ? givenList(givenField<readonly I[] | undefined>(parent.item, field)) : []) : givenList(this.options.items());
    given.forEach((item, i) => {
      const key = keyOf(item, i);
      const id = parentId ? `${parentId}/${key}` : key;
      if (moves[id] === undefined || moves[id] === parentId) entries.push({ id, key, item, added: false, separator: false });
    });
    for (const [id, to] of Object.entries(moves)) {
      if (to !== parentId || entries.some((e) => e.id === id)) continue;
      const item = this.original(id);
      if (item) entries.push({ id, key: partsOf(id).pop()!, item, added: false, separator: false });
    }
    for (const a of c.added ?? []) {
      if (a.parent !== parentId) continue;
      const item = this.addedItem(a);
      if (item) entries.push({ id: a.id, key: a.command ?? a.id, item, added: true, separator: !!a.separator });
    }
    return ordered(entries, c.order?.[parentId], (e) => e.key).map((e) => this.node(e, parentId, parent?.path ?? ''));
  }

  /** Every item, hidden ones included, from the top down. */
  all(): LayoutNode<I>[] {
    const out: LayoutNode<I>[] = [];
    const walk = (nodes: LayoutNode<I>[]) => {
      for (const node of nodes) {
        out.push(node);
        if (node.holds) walk(node.children());
      }
    };
    walk(this.childrenOf(null));
    return out;
  }

  find(id: string): LayoutNode<I> | null {
    return this.all().find((node) => node.id === id) ?? null;
  }

  /** The item drawn as `item`, or given as `item`. */
  nodeOf(item: I): LayoutNode<I> | null {
    return this.drawnNodes.get(item) ?? this.all().find((node) => node.item === item || node.drawn === item) ?? null;
  }

  /** The items of the top or of a group the user can move among: the shown ones, or all when `hiddenToo`. */
  siblingsOf(node: LayoutNode<I>, hiddenToo: boolean): LayoutNode<I>[] {
    const parent = node.parent ? this.find(node.parent) : null;
    return this.childrenOf(parent).filter((n) => hiddenToo || !n.hidden);
  }

  canMove(node: LayoutNode<I>, step: 1 | -1, hiddenToo: boolean): boolean {
    if (node.fixed) return false;
    const siblings = this.siblingsOf(node, hiddenToo);
    const next = siblings[siblings.findIndex((n) => n.id === node.id) + step];
    return !!next && !next.fixed;
  }

  // The changes: each returns the new customization, or `null` when nothing can change.

  shown(node: LayoutNode<I>, on: boolean): C | null {
    // Already so, fixed, or a separator of the user's own (it is removed, not hidden): nothing to change.
    if (node.fixed || node.separator || node.hidden === !on) return null;
    const hidden = (this.custom.hidden ?? []).filter((id) => id !== node.id);
    return { ...this.custom, hidden: on ? hidden : [...hidden, node.id] };
  }

  /** One place earlier or later among the siblings; the ones left out keep their places. */
  moved(node: LayoutNode<I>, step: 1 | -1, hiddenToo: boolean): C | null {
    if (!this.canMove(node, step, hiddenToo)) return null;
    const among = this.siblingsOf(node, hiddenToo);
    const next = among[among.findIndex((n) => n.id === node.id) + step];
    const keys = this.siblingsOf(node, true).map((n) => n.key);
    const a = keys.indexOf(node.key);
    const b = keys.indexOf(next.key);
    [keys[a], keys[b]] = [keys[b], keys[a]];
    return { ...this.custom, order: { ...(this.custom.order ?? {}), [node.parent]: keys } };
  }

  /** Whether `node` can go into the group `target` (`null` for the top). */
  canMoveInto(node: LayoutNode<I>, target: LayoutNode<I> | null): boolean {
    if (node.fixed || (!node.added && !this.original(node.id))) return false;
    if (target && (!target.holds || target.id === node.id || target.path.startsWith(`${node.path}/`))) return false;
    if ((target?.id ?? '') === node.parent) return false;
    return !this.childrenOf(target).some((n) => n.key === node.key);
  }

  movedInto(node: LayoutNode<I>, target: LayoutNode<I> | null): C | null {
    if (!this.canMoveInto(node, target)) return null;
    const c = this.custom;
    const to = target?.id ?? '';
    // It goes to the end of the group.
    const order = { ...(c.order ?? {}), [to]: [...this.childrenOf(target).map((n) => n.key), node.key] };
    if (node.added) return { ...c, order, added: (c.added ?? []).map((a) => (a.id === node.id ? { ...a, parent: to } : a)) };
    const moves = { ...(c.moves ?? {}) };
    const home = partsOf(node.id).slice(0, -1).join('/');
    if (to === home) delete moves[node.id];
    else moves[node.id] = to;
    return { ...c, order, moves };
  }

  renamed(node: LayoutNode<I>, text: string): C | null {
    if (node.separator) return null;
    const c = this.custom;
    const texts = { ...(c.texts ?? {}) };
    if (node.added && this.own.get(node.id) === node.item) {
      // A group of the user's own keeps its name in `added`.
      return { ...c, added: (c.added ?? []).map((a) => (a.id === node.id ? { ...a, text } : a)) };
    }
    if (text === givenField<string | undefined>(node.item, 'text')) delete texts[node.id];
    else texts[node.id] = text;
    return { ...c, texts };
  }

  /**
   * Adds a command (`command`), a group of the user's own (`text`, in a tree) or a separator (`separator`, when the owner
   * draws them) to the group `target`: after `at.after`, before `at.before`, else at the end.
   */
  addedTo(target: LayoutNode<I> | null, what: { command?: string; text?: string; separator?: boolean }, at: AddAt<I> = {}): { custom: C; id: string } | null {
    if (target && !target.holds) return null;
    if (what.separator && !this.options.separator) return null;
    if (what.text !== undefined && !this.options.childrenField) return null;
    const c = this.custom;
    const used = (c.added ?? []).map((a) => Number(a.id.slice(5)) || 0);
    const id = `user:${Math.max(0, ...used) + 1}`;
    const key = what.command ?? id;
    const siblings = this.childrenOf(target);
    if (siblings.some((n) => n.key === key)) return null;
    if (what.command !== undefined && !this.options.commands().some((cmd) => String(givenValue(cmd, 'key')) === what.command)) return null;
    const parent = target?.id ?? '';
    const keys = siblings.map((n) => n.key);
    const index = at.after ? keys.indexOf(at.after.key) + 1 : at.before ? keys.indexOf(at.before.key) : keys.length;
    keys.splice(index < 0 ? keys.length : index, 0, key);
    const entry: LayoutAddedItem = { id, parent, ...what };
    const next: C = { ...c, added: [...(c.added ?? []), entry], order: { ...(c.order ?? {}), [parent]: keys } };
    return { custom: next, id };
  }

  /** Takes away an item the user added, with what the user added in it; items of the app in it go back home. */
  removed(node: LayoutNode<I>): C | null {
    if (!node.added) return null;
    const c = this.custom;
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

  /** Undoes what the user changed on the item and inside it: it is shown, named and placed as given. */
  reset(node: LayoutNode<I>): C {
    const c = this.custom;
    const mine = (id: string) => id === node.id || id.startsWith(`${node.id}/`);
    return {
      ...c,
      hidden: (c.hidden ?? []).filter((id) => !mine(id)),
      texts: Object.fromEntries(Object.entries(c.texts ?? {}).filter(([id]) => !mine(id))),
      order: Object.fromEntries(Object.entries(c.order ?? {}).filter(([id]) => !mine(id))),
      moves: Object.fromEntries(Object.entries(c.moves ?? {}).filter(([id]) => !mine(id))),
    };
  }

  private node(e: Entry<I>, parentId: string, parentPath: string): LayoutNode<I> {
    const c = this.custom;
    const field = this.options.childrenField;
    const fixed = givenField(e.item, 'customizable') === false;
    const holds = !!field && !e.separator && givenValue(e.item, field) !== undefined;
    const node: LayoutNode<I> = {
      id: e.id,
      key: e.key,
      path: parentPath ? `${parentPath}/${e.key}` : e.key,
      parent: parentId,
      item: e.item,
      drawn: e.item,
      hidden: !fixed && !e.separator && (c.hidden ?? []).includes(e.id),
      fixed,
      added: e.added,
      separator: e.separator,
      holds,
      children: () => this.childrenOf(node),
    };
    const text = c.texts?.[e.id];
    const dress = this.options.dressed?.(node) ?? null;
    if (text !== undefined || dress || (holds && !this.untouched)) {
      const copy = { ...e.item, ...(dress ?? {}) } as Record<string, unknown>;
      if (text !== undefined) copy.text = text;
      if (holds) copy[field!] = () => node.children().filter((n) => !n.hidden).map((n) => n.drawn);
      node.drawn = copy as I;
    }
    this.drawnNodes.set(node.drawn, node);
    return node;
  }

  /** An item of the app by its place in the items given. */
  private original(id: string): I | null {
    const parts = partsOf(id);
    const field = this.options.childrenField;
    if (!field && parts.length > 1) return null;
    return (itemsAlong(this.options.items(), parts, () => field) as I[] | null)?.[parts.length - 1] ?? null;
  }

  private addedItem(a: LayoutAddedItem): I | null {
    if (a.command !== undefined) return this.options.commands().find((cmd) => String(givenValue(cmd, 'key')) === a.command) ?? null;
    let item = this.own.get(a.id);
    if (a.separator) {
      if (!this.options.separator) return null;
      if (!item) this.own.set(a.id, (item = this.options.separator(a.id)));
      return item;
    }
    const field = this.options.childrenField;
    if (!field) return null;
    if (!item) this.own.set(a.id, (item = { key: a.id, text: '', [field]: [] } as unknown as I));
    (item as Record<string, unknown>).text = a.text ?? '';
    return item;
  }
}
