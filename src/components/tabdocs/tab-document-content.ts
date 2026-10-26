import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';

/** A document's content: a component, or a function that makes it (called again after `dispose`). */
export type TabDocumentContent = ComponentBase | ((document: TabDocument) => ComponentBase | null);
