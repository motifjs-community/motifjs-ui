/**
 * When a bar with `mergeInto` merges into its main bar: while it is shown (`shown`), while focus is in its place
 * (`focus`), or only by `merge()` and `unmerge()` (`manual`).
 */
export type MenuBarMergeWhen = 'shown' | 'focus' | 'manual';
