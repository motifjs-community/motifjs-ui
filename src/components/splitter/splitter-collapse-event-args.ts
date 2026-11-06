import type { EventArgs } from '@motifx/core';
import type { SplitPane } from './SplitPane';
import type { Splitter } from './Splitter';

/** A pane is about to be collapsed (`collapsed: true`) or expanded. Set `cancel = true` to keep the current state. */
export interface SplitterCollapseEventArgs extends EventArgs {
    pane: SplitPane;
    index: number;
    collapsed: boolean;
    /** `true` when a button on the handle or Enter on it did this, `false` when it was done programmatically. */
    byUser: boolean;
    source: Splitter;
    event?: Event;
}
