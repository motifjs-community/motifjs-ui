import type { ScrollView } from './ScrollView';

/** The arguments of `onScrolled`: the current scroll position. */
export interface ScrollEventArgs {
    top: number;
    left: number;
    source: ScrollView;
}
