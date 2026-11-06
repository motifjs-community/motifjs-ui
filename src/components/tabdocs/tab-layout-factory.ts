import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabLayoutDocument } from './tab-layout-document';

/**
 * Recreates a saved document for `loadLayout`, usually by its `type`. Returns the document itself, the
 * options to create it with (which override the saved ones), or only its content. `null` omits it.
 */
export type TabLayoutFactory = (saved: TabLayoutDocument) => TabDocument | TabDocumentOptions | ComponentBase | null | undefined;
