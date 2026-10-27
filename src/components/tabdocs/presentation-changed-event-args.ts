import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresentationKind } from './tab-presentation-kind';

export interface PresentationChangedEventArgs {
  from: TabPresentationKind;
  to: TabPresentationKind;
  width: number;
  source: TabDocumentManager;
}
