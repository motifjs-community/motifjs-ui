import type { ComponentBase } from '@motifx/core';

/**
 * Draws the content of a row instead of its text. It can return a cleanup function.
 *
 * The host goes with its row (drawn again, or the tree gone; a closed row's rows stay drawn), with what was added to
 * it, so a template that only adds components needs no cleanup. The cleanup is for what lives outside the host (a
 * subscription, a timer); it is given to the host and runs once as the host goes, after what the host held.
 *
 * @param host The place the content goes in: add your components to its `controls`, or give it a text.
 */
export type TreeViewItemTemplate<T> = (item: T, host: ComponentBase<HTMLElement>) => (() => void) | void;
