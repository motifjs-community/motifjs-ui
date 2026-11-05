import type { EventArgs } from '@motifx/core';
import type { SplitPane } from './SplitPane';
import type { Splitter } from './Splitter';

/** A pane is about to be hidden (`collapsed: true`) or shown again; `cancel = true` leaves it as it is. */
export interface SplitterCollapseEventArgs extends EventArgs {
    pane: SplitPane;
    index: number;
    collapsed: boolean;
    /** By a button on the handle or Enter on it, else programmatically. */
    byUser: boolean;
    source: Splitter;
    event?: Event;
}
