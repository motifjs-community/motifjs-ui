import { Component, type ComponentBase } from '@motifx/core';

/** Reactive updates flush on a microtask; await this before asserting on the DOM. */
export const tick = () => Promise.resolve();

/** Builds a component and attaches it to document.body, the way an app would mount it. */
export function mount<T extends ComponentBase>(component: T): T {
  component.build();
  document.body.appendChild(component.element as Node);
  return component;
}

/** Mounts a fresh host div and adds the given children; dispose it in afterEach. */
export function mountHost(...children: ComponentBase[]): Component<HTMLDivElement> {
  const host = mount(new Component<HTMLDivElement>('div'));
  host.controls.add(...children);
  return host;
}
