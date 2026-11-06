import type { SeriesScope } from './model/series-scope';

/** What a change to an occurrence of a series applies to: `'ask'` prompts the user, or always the same scope. */
export type SeriesEditMode = 'ask' | SeriesScope;
