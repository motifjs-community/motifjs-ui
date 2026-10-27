import { Component, type ComponentBase } from '@motifx/core';

/** Reactive updates flush on a microtask; await this before asserting on the DOM. */
export const tick = () => Promise.resolve();

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
