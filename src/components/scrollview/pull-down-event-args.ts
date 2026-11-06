import type { ScrollView } from './ScrollView';

/** The arguments of `onPullDown`. Load the new data, then call `release()` or set `promise` to close the indicator. */
export interface PullDownEventArgs {
    /** Ends the refresh. */
    release: () => void;
    /** A promise to wait for. The refresh ends when it settles. */
    promise?: Promise<unknown>;
    source: ScrollView;
}
