import type { TabDocument } from './TabDocument';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabGroup } from './TabGroup';

/** Makes a new document for a group: a double click on the empty strip, or the strip menu. `null` makes none. */
export type TabNewDocument = (group: TabGroup) => TabDocument | TabDocumentOptions | null | undefined;
