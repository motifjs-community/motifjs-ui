import type { MultiView } from './MultiView';
import type { View } from './View';

/** The view in sight changed. */
export interface ViewSelectionChangedEventArgs {
    index: number;
    /** `null` when there is none. */
    view: View | null;
    previous: number;
    /** By a swipe, else programmatically. */
    byUser: boolean;
    source: MultiView;
}
