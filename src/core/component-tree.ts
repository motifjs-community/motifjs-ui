import type { ComponentBase } from '@motifx/core';

// Questions about where a component stands in the component tree, answered from `parent` and `controls` alone.

/** Whether `part` is `ancestor` or inside it. */
export function isWithin(part: ComponentBase, ancestor: ComponentBase): boolean {
  for (let c: ComponentBase | null = part; c; c = c.parent) if (c === ancestor) return true;
  return false;
}

/** How many components stand above `part`. */
export function treeDepth(part: ComponentBase): number {
  let depth = 0;
  for (let c = part.parent; c; c = c.parent) depth++;
  return depth;
}

/**
 * Orders two components as the tree lists them: a parent before its children, children in the order of `controls`.
 * Components of different trees keep the order they came in (0).
 */
export function compareTreeOrder(a: ComponentBase, b: ComponentBase): number {
  const pa = pathOf(a);
  const pb = pathOf(b);
  if (pa.root !== pb.root) return 0;
  for (let i = 0; i < Math.min(pa.steps.length, pb.steps.length); i++) {
    if (pa.steps[i] !== pb.steps[i]) return pa.steps[i] - pb.steps[i];
  }
  return pa.steps.length - pb.steps.length;
}

/** The root above `part` and the index of each component on the way down from it. */
function pathOf(part: ComponentBase): { root: ComponentBase; steps: number[] } {
  const steps: number[] = [];
  let c = part;
  while (c.parent) {
    steps.unshift(c.parent.controls.items.indexOf(c));
    c = c.parent;
  }
  return { root: c, steps };
}
