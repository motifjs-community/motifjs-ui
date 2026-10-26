import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { TabsActivation } from '../tabs/tabs-activation';
import type { ContentLifetime } from './content-lifetime';
import type { DocumentActivatedEventArgs } from './document-activated-event-args';
import type { DocumentActivatingEventArgs } from './document-activating-event-args';
import type { DocumentClosedEventArgs } from './document-closed-event-args';
import type { DocumentClosingEventArgs } from './document-closing-event-args';
import type { DocumentMovedEventArgs } from './document-moved-event-args';
import type { DocumentMovingEventArgs } from './document-moving-event-args';
import type { DocumentOpenedEventArgs } from './document-opened-event-args';
import type { DocumentOpeningEventArgs } from './document-opening-event-args';
import type { GroupSplitEventArgs } from './group-split-event-args';
import type { GroupSplittingEventArgs } from './group-splitting-event-args';
import type { LayoutChangedEventArgs } from './layout-changed-event-args';
import type { LayoutChangingEventArgs } from './layout-changing-event-args';
import type { TabAfterClose } from './tab-after-close';
import type { TabCloseButton } from './tab-close-button';
import type { TabContentFactory } from './tab-content-factory';
import type { TabDocumentKeys } from './tab-document-keys';
import type { TabOpenPosition } from './tab-open-position';

/** Props of `TabDocumentManager`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface TabDocumentManagerProps extends ControlProps {
  /** Names the manager: it becomes a `region` landmark. The same property as `text`. */
  label?: Bind<string>;
  /** Default `'always'`; a document with `closable: false` shows none. */
  closeButton?: Bind<TabCloseButton>;
  /** Default `'keep'`; a document's own `contentLifetime` wins. */
  contentLifetime?: Bind<ContentLifetime>;
  /** A group left without documents closes (never the last one). Default `true`. */
  closeEmptyGroups?: Bind<boolean>;
  /** Default `'afterActive'`. */
  openPosition?: Bind<TabOpenPosition>;
  /** Which tab becomes active when the active one closes. Default `'recent'`. */
  afterClose?: Bind<TabAfterClose>;
  /** `'auto'`: the arrow keys in a strip also activate the tab; `'manual'`: Enter or Space does. Default `'auto'`. */
  activation?: Bind<TabsActivation>;
  /** The smallest width of a group, in pixels. Default 160. */
  minGroupWidth?: Bind<number>;
  /** The smallest height of a group, in pixels. Default 100. */
  minGroupHeight?: Bind<number>;
  /** How far a splitter key moves a splitter, in pixels. Default 10. */
  resizeStep?: Bind<number>;
  /** The split and maximize buttons at the end of each strip. Default `true`. */
  groupActions?: Bind<boolean>;
  /** A double click on a tab maximizes its group, or restores the groups. Default `true`. */
  maximizeOnDoubleClick?: Bind<boolean>;
  /** Changes some keys; the rest keep `TabDocumentManager.defaultKeys`. */
  keys?: Bind<Partial<TabDocumentKeys>>;
  /** Texts for this manager only, over `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** Changes are announced to screen readers (opened, closed, moved…). Default `true`. */
  announce?: Bind<boolean>;
  /** Makes the content of documents that bring none. */
  factory?: Bind<TabContentFactory | null>;
  onOpening?: (e: DocumentOpeningEventArgs) => void;
  onOpened?: (e: DocumentOpenedEventArgs) => void;
  onClosing?: (e: DocumentClosingEventArgs) => void;
  onClosed?: (e: DocumentClosedEventArgs) => void;
  onDocumentActivating?: (e: DocumentActivatingEventArgs) => void;
  onDocumentActivated?: (e: DocumentActivatedEventArgs) => void;
  onMoving?: (e: DocumentMovingEventArgs) => void;
  onMoved?: (e: DocumentMovedEventArgs) => void;
  onSplitting?: (e: GroupSplittingEventArgs) => void;
  onSplit?: (e: GroupSplitEventArgs) => void;
  onLayoutChanging?: (e: LayoutChangingEventArgs) => void;
  onLayoutChanged?: (e: LayoutChangedEventArgs) => void;
}
