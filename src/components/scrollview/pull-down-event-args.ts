import type { ScrollView } from './ScrollView';

/** The content was pulled down and let go: load what is new, then `release()` (or set `promise`) and the indicator goes. */
export interface PullDownEventArgs {
    /** Ends the refresh. */
    release: () => void;
    /** Set it to wait: the refresh ends when it settles. */
    promise?: Promise<unknown>;
    source: ScrollView;
}
