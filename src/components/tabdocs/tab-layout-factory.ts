import type { ComponentBase } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabLayoutDocument } from './tab-layout-document';

/**
 * Makes a saved document again for `loadLayout`, usually by its `type`: the document itself, the
 * options to make it with (over the saved ones), or only its content. `null` leaves it out.
 */
export type TabLayoutFactory = (saved: TabLayoutDocument) => TabDocument | TabDocumentOptions | ComponentBase | null | undefined;
