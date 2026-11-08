import { givenField } from '../../core/given-field';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemMerge } from '../../parts/menu/menu-item-merge';
import type { MenuItemMergeAt } from '../../parts/menu/menu-item-merge-at';
import type { MenuBar } from './MenuBar';
import type { MenuNode } from './menu-node';
import type { MergedItem } from './merged-item';

/** The merged item each drawn item stands for, so that a click or the user's change reaches the bar it comes from. */
export const mergedOf = new WeakMap<MenuItem, MergedItem>();

/** An item of a bar as merged, with its shown children; `prefix` names the item after its bar. */
export function mergedFrom(node: MenuNode, owner: MenuBar, prefix = ''): MergedItem {
  const merged: MergedItem = {
    name: node.key,
    key: prefix + node.key,
    item: node.item,
    drawn: node.drawn,
    owner,
    node,
    holds: node.holds,
    children: () => (node.holds ? node.children().filter((n) => !n.hidden).map((n) => mergedFrom(n, owner)) : []),
  };
  mergedOf.set(node.drawn, merged);
  return merged;
}

/** One level: the main bar's items, then the items of each merged bar in turn, each by its `merge` and `mergeAt`. */
export function mergedLevel(base: readonly MergedItem[], adds: readonly (readonly MergedItem[])[]): MergedItem[] {
  const out = [...base];
  for (const list of adds) {
    for (const merged of list) {
      const rule = givenField<MenuItemMerge | undefined>(merged.item, 'merge') ?? 'auto';
      if (rule === 'none') continue;
      const at = out.findIndex((x) => x.name === merged.name);
      if (rule === 'remove') {
        if (at >= 0) out.splice(at, 1);
      } else if (rule === 'replace' && at >= 0) {
        out[at] = merged;
      } else if (rule === 'auto' && at >= 0 && out[at].holds && merged.holds) {
        out[at] = joined(out[at], merged);
      } else {
        out.splice(placeOf(givenField<MenuItemMergeAt | undefined>(merged.item, 'mergeAt'), out), 0, merged);
      }
    }
  }
  return out;
}

/** Two items with menus as one: the first one's item, with the items of both menus merged. */
function joined(first: MergedItem, second: MergedItem): MergedItem {
  const children = () => mergedLevel(first.children(), [second.children()]);
  const drawn: MenuItem = { ...first.drawn, items: () => children().map((m) => m.drawn) };
  const merged: MergedItem = { ...first, drawn, children };
  mergedOf.set(drawn, merged);
  return merged;
}

function placeOf(at: MenuItemMergeAt | undefined, list: readonly MergedItem[]): number {
  if (typeof at === 'number') return Math.max(0, Math.min(at, list.length));
  if (at && 'before' in at) {
    const i = list.findIndex((x) => x.name === String(at.before));
    return i < 0 ? list.length : i;
  }
  if (at && 'after' in at) {
    const i = list.findIndex((x) => x.name === String(at.after));
    return i < 0 ? list.length : i + 1;
  }
  return list.length;
}
