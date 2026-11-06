import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';

/** Creates the content of a document that does not provide its own, usually by its `type`. */
export type TabContentFactory = (document: TabDocument) => ComponentBase | null | undefined;
