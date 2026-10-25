import type { GridBuiltInActions } from './grid-built-in-actions';

/** The name of an action the grid has ready. */
export type BuiltInAction = keyof GridBuiltInActions<unknown>;
