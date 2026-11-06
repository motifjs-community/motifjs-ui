import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * Occurs before a document closes. Set `cancel = true` to keep it open, or set `promise` to prompt
 * first, for example to save changes. The document closes when the promise resolves to `true`.
 */
export interface DocumentClosingEventArgs extends EventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  byUser: boolean;
  /**
   * Indicates that no other copy of the document stays open (see `allowDuplicate`). Prompt about
   * unsaved changes only then.
   */
  lastCopy: boolean;
  promise?: Promise<boolean>;
  source: TabDocumentManager;
}
