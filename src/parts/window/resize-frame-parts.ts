import type { Component } from '@motifx/core';
import type { WindowEdge } from './window-edge';

/** A window's resize frame with its handles, each kept by the side or corner it resizes. */
export interface ResizeFrameParts {
  frame: Component<HTMLDivElement>;
  handles: ReadonlyMap<WindowEdge, Component<HTMLDivElement>>;
}
