import type { EventArgs } from '@motifx/core';
import type { Resizable } from './Resizable';
import type { ResizeEdge } from './resizable-props';

/** The resize event arguments: the edge and the size in pixels. When a resize starts, `cancel = true` keeps the size. */
export interface ResizeEventArgs extends EventArgs {
    edge: ResizeEdge;
    width: number;
    height: number;
    /** `true` when a handle or a key changed the size, `false` when the props did. */
    byUser: boolean;
    source: Resizable;
    event?: Event;
}
