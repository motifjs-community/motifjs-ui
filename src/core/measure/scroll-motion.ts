/**
 * How a scroll moves: at once (`instant`, the default), smoothly unless the design system's motion is off (`smooth`), or
 * as the page's CSS `scroll-behavior` says (`auto`).
 */
export type ScrollMotion = 'instant' | 'smooth' | 'auto';
