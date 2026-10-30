import type { ComponentBase } from '@motifx/core';

/**
 * Runs `run` whenever `component.reState()` (or one of a component it sits in) is called: one of its bindings that
 * does nothing but that. For a component that reads what it was given through models of its own. Returns what stops it.
 */
export function onReState(component: ComponentBase, run: () => void): () => void {
  let stopped = false;
  const binding = {
    propertyName: 'reState',
    dataSource: run,
    activate() {},
    deactivate() {},
    reActivate() {
      if (!stopped) run();
    },
  };
  component.bindings.add(binding);
  return () => {
    stopped = true;
    component.bindings.remove(binding);
  };
}
