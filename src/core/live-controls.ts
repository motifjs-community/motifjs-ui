import type { ComponentBase } from '@motifx/core';
import type { Control } from './control';

// The Controls alive now, so the focus layer and the keys can ask the component model what they need: which control
// an event started in, which windows are open, which controls set a tab index. A control is added when it is made and
// leaves when it is disposed.

const live = new Set<Control>();
const indexed = new Set<Control>();

/** @internal Called by every Control once it is made; it leaves when it is disposed. */
export function addLiveControl(control: Control): void {
  live.add(control);
  control.motif.setDisposable(() => {
    live.delete(control);
    indexed.delete(control);
  });
}

/** The Controls alive now, in the order they were made. */
export function liveControls(): ReadonlySet<Control> {
  return live;
}

/** Whether `component` is a Control alive now. */
export function isLiveControl(component: ComponentBase | null | undefined): component is Control {
  return !!component && live.has(component as Control);
}

/** @internal Notes a Control's `tabIndex`: containers ask whether a control inside them has one other than 0. */
export function noteTabIndex(control: Control, index: number): void {
  if (index) indexed.add(control);
  else indexed.delete(control);
}

/** The Controls whose `tabIndex` is not 0. */
export function controlsWithTabIndex(): ReadonlySet<Control> {
  return indexed;
}
