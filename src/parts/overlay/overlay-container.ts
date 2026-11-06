import type { ComponentBase } from '@motifx/core';

/** What an overlay opens over: an element or a component's element, or `null` for the whole page. */
export type OverlayContainer = HTMLElement | ComponentBase | null;
