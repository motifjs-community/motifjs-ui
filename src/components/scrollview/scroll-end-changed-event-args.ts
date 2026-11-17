import type { ScrollView } from './ScrollView';

/** The arguments of `onAtEndChanged`. */
export interface ScrollEndChangedEventArgs {
    /** `true` when the view came to the end of its content, `false` when it left it. */
    atEnd: boolean;
    source: ScrollView;
}
