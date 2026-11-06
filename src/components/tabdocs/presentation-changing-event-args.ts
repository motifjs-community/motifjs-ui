import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresentationKind } from './tab-presentation-kind';

/**
 * Occurs before the presentation changes. Set `cancel = true` to keep the current one until the width or
 * the setting changes again.
 */
export interface PresentationChangingEventArgs extends EventArgs {
  from: TabPresentationKind;
  to: TabPresentationKind;
  /** The manager's width, in pixels. */
  width: number;
  source: TabDocumentManager;
}
