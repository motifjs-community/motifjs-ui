/**
 * A height a bottom sheet stops at: `'peek'` (a strip, `sheet.peek-height`), `'half'` (half the room),
 * `'full'` (the room but a gap at the top), `'fit'` (as tall as its content, up to full), a number
 * of pixels, or a share of the room such as `'40%'`.
 */
export type BottomSheetDetent = 'peek' | 'half' | 'full' | 'fit' | number | `${number}%`;
