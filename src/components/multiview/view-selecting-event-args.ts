import type { EventArgs } from '@motifx/core';
import type { MultiView } from './MultiView';
import type { View } from './View';

/** The view in sight is about to change. `cancel = true` keeps the one there. */
export interface ViewSelectingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** `null` when there was none. */
    fromView: View | null;
    toView: View;
    /** By a swipe, else from code. */
    byUser: boolean;
    source: MultiView;
    event?: Event;
}
