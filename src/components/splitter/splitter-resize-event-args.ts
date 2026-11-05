import type { Splitter } from './Splitter';

/** A handle moved: `handle` is its index (between the panes `handle` and `handle + 1`), `sizes` the panes' pixels now. */
export interface SplitterResizeEventArgs {
    handle: number;
    sizes: number[];
    /** By a drag or a key, else programmatically. */
    byUser: boolean;
    source: Splitter;
    event?: Event;
}
