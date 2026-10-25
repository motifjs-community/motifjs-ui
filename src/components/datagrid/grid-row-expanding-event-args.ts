import type { EventArgs } from '@motifx/core';

/**
 * A group, or a row's details (`masterDetail`), is about to open or close, by the user or from code;
 * `cancel` keeps it as it is. `kind` tells which: a group's `key` is the values of the groups from the
 * top level down to it, a row's is the row's key.
 */
export type GridRowExpandingEventArgs = EventArgs &
  ({ readonly kind: 'group'; readonly key: readonly unknown[]; readonly row?: undefined } | { readonly kind: 'detail'; readonly key: unknown; readonly row: unknown });
