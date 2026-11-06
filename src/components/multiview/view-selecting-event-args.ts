import type { EventArgs } from '@motifx/core';
import type { MultiView } from './MultiView';
import type { View } from './View';

/** Provides data for the event that occurs before the visible view changes. Set `cancel = true` to keep it. */
export interface ViewSelectingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** `null` when there was no view. */
    fromView: View | null;
    toView: View;
    /** `true` for a swipe, and `false` for a programmatic change. */
    byUser: boolean;
    source: MultiView;
    event?: Event;
}
