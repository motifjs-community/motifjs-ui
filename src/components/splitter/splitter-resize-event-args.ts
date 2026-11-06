import type { Splitter } from './Splitter';

/** A handle moved. `handle` is its index, between panes `handle` and `handle + 1`, and `sizes` are the current pixels. */
export interface SplitterResizeEventArgs {
    handle: number;
    sizes: number[];
    /** `true` when a drag or a key moved it, `false` when it moved programmatically. */
    byUser: boolean;
    source: Splitter;
    event?: Event;
}
