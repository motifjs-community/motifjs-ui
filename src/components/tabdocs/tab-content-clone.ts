import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';

/** Creates the content of a document's second copy, open in another group. */
export type TabContentClone = (copy: TabDocument) => ComponentBase | null;
