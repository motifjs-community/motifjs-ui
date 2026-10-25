/**
 * Rows or columns of a `Grid`: CSS-like sizes (`'auto 1fr 2fr 120'`, a bare number is pixels,
 * `*` is `1fr` and `2*` is `2fr`), the same as a list, or a number of equal tracks.
 */
export type GridTracks = string | number | readonly (string | number)[];
