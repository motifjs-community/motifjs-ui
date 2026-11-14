// The measuring layer: the one place the kit reads layout (sizes, places, scroll, computed style), watches sizes and
// sight, and writes scrolls. Every function here takes components; reads run before writes, in rounds per window
// (rounds.ts). Other files import this index only (tests/measure-boundary.test.ts).

export type { Box } from './box';
export type { HitCover } from './hit-cover';
export type { HitOptions } from './hit-options';
export type { LayoutChange } from './layout-change';
export type { LayoutOptions } from './layout-options';
export type { Page } from './page';
export type { Point } from './point';
export type { Rect } from './rect';
export type { RevealOptions } from './reveal-options';
export type { RevealRange } from './reveal-range';
export type { ScrollMotion } from './scroll-motion';
export type { ScrollPlace } from './scroll-place';
export type { Size } from './size';
export type { SizeBox } from './size-box';
export type { Viewport } from './viewport-rect';
export { everyFrame } from './every-frame';
export { afterDrawn } from './drawn';
export { componentAt, shareAlong, visibleRectOf } from './hits';
export { lengthOf, probeLengths } from './lengths';
export { onLookChange } from './look';
export { mediaOf, onMedia } from './media';
export { afterStyle, hasMotion, transitionTime } from './motion';
export { onLayout } from './on-layout';
export { boxOf, canMeasure, holderOf, isInPage, isRendered, isRtl, pageBackgroundOf, pageOf, rectOf, sameWindow, scrollOf, styleOf } from './read';
export { isMeasurePending, measure, measureNow, readAgain, whenMeasured } from './rounds';
export { keepScroll, reveal, scrollBy, scrollerOf, scrollerUnder, scrollIntoView, scrollTo } from './scroll';
export { textSizes, textWidths } from './text-widths';
export { viewportOf } from './viewport';
