/**
 * Rows or columns of a `Grid`: CSS-like sizes (`'auto 1fr 2fr 120'`, where a bare number is in pixels,
 * `*` is `1fr` and `2*` is `2fr`), the same sizes as a list, or a number of equal tracks.
 */
export type GridTracks = string | number | readonly (string | number)[];
