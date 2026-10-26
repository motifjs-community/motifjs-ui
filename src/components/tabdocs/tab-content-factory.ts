import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';

/** Makes the content of a document that brings none of its own, usually by its `type`. */
export type TabContentFactory = (document: TabDocument) => ComponentBase | null | undefined;
