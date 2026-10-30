import type { ComponentBase } from '@motifx/core';
import { PropBinding } from './prop-binding';

/**
 * Follows `read` with one of `component`'s bindings and hands each value to `write`: now, then by itself when `read`
 * reads reactive data, and again on the component's `reState()` (plain data), each time the value is not the one
 * handed last. Returns what stops it.
 */
export function follow<T>(component: ComponentBase, name: string, read: () => T, write: (value: T) => void): () => void {
  const binding = new PropBinding(name, read, write as (value: unknown) => void);
  // A binding starts when the component is built; until then the value is the one read here.
  if (!component.isBuilt) binding.prime();
  component.bindings.add(binding);
  return () => {
    binding.release();
    component.bindings.remove(binding);
  };
}
