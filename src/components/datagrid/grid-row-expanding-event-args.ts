import type { EventArgs } from '@motifx/core';

/**
 * Occurs before a group or a row's details (`masterDetail`) open or close, by the user or
 * programmatically. Set `cancel = true` to prevent it. `kind` indicates which: a group's `key` holds the
 * group values from the top level down to it, and a row's `key` is the row's key.
 */
export type GridRowExpandingEventArgs = EventArgs &
  ({ readonly kind: 'group'; readonly key: readonly unknown[]; readonly row?: undefined } | { readonly kind: 'detail'; readonly key: unknown; readonly row: unknown });
