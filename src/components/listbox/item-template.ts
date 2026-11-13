import type { ComponentBase } from '@motifx/core';

/**
 * Draws an item instead of its text. It can return a cleanup function.
 *
 * @param host The place the item goes in: add your components to its `controls`, or give it a text.
 */
export type ItemTemplate<T> = (item: T, host: ComponentBase<HTMLElement>) => (() => void) | void;
