/**
 * How a view renders its content: `'standard'` renders every cell and row, `'virtual'` renders only
 * the visible ones and a few on each side, and `'auto'` switches to virtual above about 2,000 cells.
 */
export type ScrollingMode = 'auto' | 'standard' | 'virtual';
