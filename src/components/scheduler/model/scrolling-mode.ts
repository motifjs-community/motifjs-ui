/**
 * How a view builds what it shows: `'standard'` every cell and row, `'virtual'` only what is in
 * view (and a little on each side), `'auto'` virtual once the cells pass a few thousand.
 */
export type ScrollingMode = 'auto' | 'standard' | 'virtual';
