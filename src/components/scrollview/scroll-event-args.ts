import type { ScrollView } from './ScrollView';

/** The content moved: where it stands now. */
export interface ScrollEventArgs {
    top: number;
    left: number;
    source: ScrollView;
}
