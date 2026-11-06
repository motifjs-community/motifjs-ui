import type { ScrollView } from './ScrollView';

/** The arguments of `onReachBottom`. Load more data, then call `release()` or set `promise` to close the indicator. */
export interface ReachBottomEventArgs {
    /** Ends the loading. `done = true` signals that there is no more data, and the view stops requesting. */
    release: (done?: boolean) => void;
    /** A promise to wait for. The loading ends when it settles. */
    promise?: Promise<unknown>;
    source: ScrollView;
}
