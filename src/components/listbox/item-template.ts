import type { ComponentBase } from '@motifx/core';

/**
 * Draws an item instead of its text. It can return a cleanup function.
 *
 * The host is the drawing's own: it goes when the item is drawn again or its list goes, with what was added to it,
 * so a template that only adds components needs no cleanup. The cleanup is for what lives outside the host (a
 * subscription, a timer); it is given to the host and runs once as the host goes, after what the host held.
 *
 * @param host The place the item goes in: add your components to its `controls`, or give it a text.
 */
export type ItemTemplate<T> = (item: T, host: ComponentBase<HTMLElement>) => (() => void) | void;
