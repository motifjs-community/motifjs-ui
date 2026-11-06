import type { BuiltInAction } from './built-in-action';
import type { GridAction } from './grid-action';

/** An entry of the `actions` prop: an action, or the name of a built-in action. */
export type GridActionItem<T> = GridAction<T> | BuiltInAction;
