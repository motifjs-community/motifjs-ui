/**
 * A height a bottom sheet stops at: `'peek'` (a strip, `sheet.peek-height`), `'half'` (half the available
 * space), `'full'` (the available space minus a gap at the top), `'fit'` (the height of its content, up to
 * full), a number of pixels, or a percentage of the available space such as `'40%'`.
 */
export type BottomSheetDetent = 'peek' | 'half' | 'full' | 'fit' | number | `${number}%`;
