import type { EventArgs } from '@motifx/core';
import type { Resizable } from './Resizable';
import type { ResizeEdge } from './resizable-props';

/** A resize begins (`cancel = true` keeps the size), goes on, or ended: the edge it is from and the size in pixels. */
export interface ResizeEventArgs extends EventArgs {
    edge: ResizeEdge;
    width: number;
    height: number;
    /** By a handle or a key, else from the props. */
    byUser: boolean;
    source: Resizable;
    event?: Event;
}
