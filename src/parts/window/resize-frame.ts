import type { Component } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import type { ResizeFrameParts } from './resize-frame-parts';
import type { WindowEdge } from './window-edge';

const EDGES: readonly WindowEdge[] = ['top', 'bottom', 'start', 'end', 'top-start', 'top-end', 'bottom-start', 'bottom-end'];

/** The frame of a window's resize handles, not placed yet: one handle part per side and corner, each with its `data-edge` for the styles and kept by its edge for the caller. */
export function resizeFrame(frameClass: string, handleClass: string): ResizeFrameParts {
  const frame = loose<HTMLDivElement>('div', frameClass);
  frame.attr.add({ 'aria-hidden': 'true' });
  const handles = new Map<WindowEdge, Component<HTMLDivElement>>();
  for (const edge of EDGES) {
    const handle = part<HTMLDivElement>(frame, 'div', handleClass);
    handle.attr.add({ 'data-edge': edge });
    handles.set(edge, handle);
  }
  return { frame, handles };
}
