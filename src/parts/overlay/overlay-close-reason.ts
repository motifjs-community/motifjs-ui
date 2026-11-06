/**
 * Why an overlay closed: by code, Escape, a click on the scrim, a swipe, the browser's back action, its close
 * button, or its owner being disposed.
 */
export type OverlayCloseReason = 'code' | 'escape' | 'scrim' | 'swipe' | 'back' | 'button' | 'owner';
