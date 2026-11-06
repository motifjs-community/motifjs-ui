import type { MultiView } from './MultiView';
import type { View } from './View';

/** Provides data for the event that occurs after the visible view changes. */
export interface ViewSelectionChangedEventArgs {
    index: number;
    /** `null` when there is no view. */
    view: View | null;
    previous: number;
    /** `true` for a swipe, and `false` for a programmatic change. */
    byUser: boolean;
    source: MultiView;
}
