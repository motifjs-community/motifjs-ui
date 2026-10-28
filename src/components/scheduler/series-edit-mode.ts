import type { SeriesScope } from './model/series-scope';

/** What a change to an occurrence of a series reaches: the user is asked (`'ask'`), or always the same. */
export type SeriesEditMode = 'ask' | SeriesScope;
