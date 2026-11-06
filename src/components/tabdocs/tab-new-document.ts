import type { TabDocument } from './TabDocument';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabGroup } from './TabGroup';

/** Creates a new document for a group, from a double-click on the empty strip or the strip menu. `null` creates none. */
export type TabNewDocument = (group: TabGroup) => TabDocument | TabDocumentOptions | null | undefined;
