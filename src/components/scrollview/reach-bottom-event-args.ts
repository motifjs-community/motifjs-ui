import type { ScrollView } from './ScrollView';

/** The content was scrolled near its end: load more, then `release()` (or set `promise`) and the indicator goes. */
export interface ReachBottomEventArgs {
    /** Ends the loading; `done = true` says there is no more and the view stops asking. */
    release: (done?: boolean) => void;
    /** Set it to wait: the loading ends when it settles. */
    promise?: Promise<unknown>;
    source: ScrollView;
}
