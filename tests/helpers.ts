import { Component, type ComponentBase } from '@motifx/core';
import { isMeasurePending, whenMeasured } from '../src/core/measure';

/** Reactive updates flush on a microtask; await this before asserting on the DOM. */
export const tick = () => Promise.resolve();

const macrotask = () => new Promise<void>((done) => setTimeout(done, 0));

/**
 * Waits for the work started to be over, not for a time: `turns` timer turns (loads, timers, the microtasks between
 * them), then, while the measuring layer still has work in the window, its next run and the turns again. A timer turn
 * lasts 15 ms on Windows and under 1 ms on Linux: the measuring frame must not be left to the clock.
 */
export async function settled(turns = 6, owner?: ComponentBase): Promise<void> {
  const root = owner && !owner.isDisposed ? owner : pageRoot();
  for (let i = 0; i < 20; i++) {
    for (let t = 0; t < turns; t++) await macrotask();
    if (!isMeasurePending(root)) return;
    await whenMeasured(root);
  }
}

/** The page's body as a root of the component tree: what is placed under it is in the document, and mounts. */
let page: Component<HTMLElement> | null = null;
function pageRoot(): Component<HTMLElement> {
  if (!page || page.isDisposed || page.element !== document.body) {
    page = new Component<HTMLElement>(document.body);
    // A wrapper places its children only once it is built.
    page.build();
  }
  return page;
}

/** Builds a component and places it in the page under the body's root, the way an app would mount it. */
export function mount<T extends ComponentBase>(component: T): T {
  component.build();
  pageRoot().controls.add(component);
  return component;
}

/** Mounts a fresh host div and adds the given children; dispose it in afterEach. */
export function mountHost(...children: ComponentBase[]): Component<HTMLDivElement> {
  const host = mount(new Component<HTMLDivElement>('div'));
  host.controls.add(...children);
  return host;
}
