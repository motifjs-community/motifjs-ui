import type { GridValuesResult } from '../grid-values-result';

/** Asks for a part of a column's values; `search` is the text of the list's search box. */
export type ValueLoader = (request: { search: string; skip: number; take: number; signal: AbortSignal }) => Promise<GridValuesResult>;
