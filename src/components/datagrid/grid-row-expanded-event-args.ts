/**
 * Occurs after a group or a row's details (`masterDetail`) open or close, by the user or
 * programmatically. See `GridRowExpandingEventArgs`.
 */
export type GridRowExpandedEventArgs =
  | { readonly kind: 'group'; readonly key: readonly unknown[]; readonly row?: undefined }
  | { readonly kind: 'detail'; readonly key: unknown; readonly row: unknown };
