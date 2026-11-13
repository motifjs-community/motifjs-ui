import type { ComponentBase } from '@motifx/core';

/**
 * Draws the content of a row instead of its text. It can return a cleanup function.
 *
 * @param host The place the content goes in: add your components to its `controls`, or give it a text.
 */
export type TreeViewItemTemplate<T> = (item: T, host: ComponentBase<HTMLElement>) => (() => void) | void;
