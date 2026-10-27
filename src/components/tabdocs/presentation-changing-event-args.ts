import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresentationKind } from './tab-presentation-kind';

/** The manager is about to show its layout another way; `cancel = true` keeps the way it is (until the width or the setting changes again). */
export interface PresentationChangingEventArgs extends EventArgs {
  from: TabPresentationKind;
  to: TabPresentationKind;
  /** The manager's width, in pixels. */
  width: number;
  source: TabDocumentManager;
}
