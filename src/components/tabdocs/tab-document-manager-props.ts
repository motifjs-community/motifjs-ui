import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { TabsActivation } from '../tabs/tabs-activation';
import type { ContentLifetime } from './content-lifetime';
import type { DocumentActivatedEventArgs } from './document-activated-event-args';
import type { DocumentActivatingEventArgs } from './document-activating-event-args';
import type { DocumentChangedEventArgs } from './document-changed-event-args';
import type { DocumentChangingEventArgs } from './document-changing-event-args';
import type { DocumentClosedEventArgs } from './document-closed-event-args';
import type { DocumentClosingEventArgs } from './document-closing-event-args';
import type { DocumentMovedEventArgs } from './document-moved-event-args';
import type { DocumentMovingEventArgs } from './document-moving-event-args';
import type { DocumentOpenedEventArgs } from './document-opened-event-args';
import type { DocumentOpeningEventArgs } from './document-opening-event-args';
import type { GroupLockedEventArgs } from './group-locked-event-args';
import type { GroupLockingEventArgs } from './group-locking-event-args';
import type { GroupSplitEventArgs } from './group-split-event-args';
import type { GroupSplittingEventArgs } from './group-splitting-event-args';
import type { LayoutChangedEventArgs } from './layout-changed-event-args';
import type { LayoutChangingEventArgs } from './layout-changing-event-args';
import type { PinnedTabSize } from './pinned-tab-size';
import type { TabAfterClose } from './tab-after-close';
import type { TabCloseButton } from './tab-close-button';
import type { TabContentFactory } from './tab-content-factory';
import type { TabDocumentKeys } from './tab-document-keys';
import type { TabKeyPreset } from './tab-key-preset';
import type { TabListScope } from './tab-list-scope';
import type { TabMenuCommand } from './tab-menu-command';
import type { TabContextMenuEventArgs } from './tab-context-menu-event-args';
import type { TabCopyModifier } from './tab-copy-modifier';
import type { TabDragEndedEventArgs } from './tab-drag-ended-event-args';
import type { TabDragStartingEventArgs } from './tab-drag-starting-event-args';
import type { TabDropEventArgs } from './tab-drop-event-args';
import type { TabDropSide } from './tab-drop-side';
import type { TabDroppedEventArgs } from './tab-dropped-event-args';
import type { TabNewDocument } from './tab-new-document';
import type { TabOpenPosition } from './tab-open-position';
import type { TabShowDescription } from './tab-show-description';
import type { TabSize } from './tab-size';
import type { TabToolbarItems } from './tab-toolbar-items';

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
  /** The split, maximize and "…" buttons and the lock mark in each group's toolbar. Default `true`. */
  groupActions?: Bind<boolean>;
  /** The app's own buttons in each group's toolbar, before the built-in ones. */
  toolbarItems?: TabToolbarItems;
  /** A double click on a tab maximizes its group, or restores the groups (a preview tab is kept open instead). Default `true`. */
  maximizeOnDoubleClick?: Bind<boolean>;
  /** Documents opened with `preview` replace the group's preview tab until they are kept. `false` opens every one to stay. Default `true`. */
  previewTabs?: Bind<boolean>;
  /** Default `'normal'`. */
  pinnedTabSize?: Bind<PinnedTabSize>;
  /** Pinned tabs in a row of their own above the others. Default `false`. */
  pinnedTabsOnSeparateRow?: Bind<boolean>;
  /** Pinned tabs show a close button too (they always show the pin mark). Default `false`. */
  closeButtonOnPinned?: Bind<boolean>;
  /** Close all, close others, close to the right or left and close saved leave pinned tabs open. Default `true`. */
  keepPinned?: Bind<boolean>;
  /** Default `'fit'`. */
  tabSize?: Bind<TabSize>;
  /** The narrowest a tab gets when tabs shrink (`shrink`, `fixed`, and pinned tabs that shrink), in pixels. Default 80. */
  tabMinWidth?: Bind<number>;
  /** The widest a tab gets in `fit` and `shrink`, in pixels; 0 for no limit but the title's. Default 0. */
  tabMaxWidth?: Bind<number>;
  /** The width of every tab in `fixed`, in pixels. Default 160. */
  tabFixedWidth?: Bind<number>;
  /** Tabs that do not fit go on to more rows instead of scrolling. Default `false`. */
  wrapTabs?: Bind<boolean>;
  /** Buttons at the end of a strip that scroll it when the tabs do not fit (the wheel scrolls it too). Default `true`. */
  scrollButtons?: Bind<boolean>;
  /** When a tab shows its document's description. Default `'duplicates'`. */
  showDescription?: Bind<TabShowDescription>;
  /** The "…" button that lists the group's documents. Default `true`. */
  openList?: Bind<boolean>;
  /** Which documents the "…" list shows. Default `'group'`. */
  openListScope?: Bind<TabListScope>;
  /** Which documents the recently used list shows. Default `'group'`. */
  recentListScope?: Bind<TabListScope>;
  /** How many activated documents `goBack` remembers; 0 turns it off. Default 50. */
  historySize?: Bind<number>;
  /** How many closed documents `reopenClosed` remembers; 0 turns it off. Default 10. */
  closedHistorySize?: Bind<number>;
  /** The context menus of tabs and of the empty strip. Default `true`. */
  contextMenu?: Bind<boolean>;
  /** Built-in context menu items to leave out: `{ copyTitle: false }`. */
  menuItems?: Bind<Partial<Record<TabMenuCommand, boolean>>>;
  /** Makes a new document: a double click on the empty strip and the strip menu use it. */
  newDocument?: TabNewDocument | null;
  /** The same document may be open in several groups, each copy with content of its own. A document's own value wins. Default `false`. */
  allowDuplicate?: Bind<boolean>;
  /** Splitting with a document copies it into the new group when it may be open twice; otherwise it moves. Default `true`. */
  splitCopies?: Bind<boolean>;
  /** Tabs can be dragged (a document's own `allowDrag` wins). Default `true`. */
  allowDrag?: Bind<boolean>;
  /** Whole groups can be dragged by the empty part of their bar. Default `true`. */
  allowDragGroups?: Bind<boolean>;
  /** A handle at the start of each group's toolbar to drag the group by, also when its tabs fill the bar; a click on it starts "Move group to…". Default `false`. */
  groupDragHandle?: Bind<boolean>;
  /** Where a drop on a group's content may go: into it (`center`) or beside it; a group's own `dropSides` wins. Default all five. */
  dropSides?: Bind<readonly TabDropSide[]>;
  /** How deep the edge zones of a group's content are: pixels, or a share such as `'25%'`. Default `'33%'`. */
  dropEdgeSize?: Bind<number | string>;
  /** A drop at an edge of the whole layout opens a new group along that edge. Default `true`. */
  layoutEdgeDrop?: Bind<boolean>;
  /** How deep the band along the layout's edges is, in pixels. Default 16. */
  layoutEdgeSize?: Bind<number>;
  /** How far the pointer moves, in pixels, before a press becomes a drag. Default 5. */
  dragThreshold?: Bind<number>;
  /** How long a finger or a pen rests on a tab, in milliseconds, before it drags it (a swipe before that scrolls the strip). Default 500. */
  longPressDelay?: Bind<number>;
  /** Resting on a tab of another group while dragging activates it. Default `true`. */
  dragHoverActivate?: Bind<boolean>;
  /** How long, in milliseconds. Default 750. */
  dragHoverDelay?: Bind<number>;
  /** A tab dropped among the pinned ones is pinned, and one dropped among the others unpinned; `false` keeps each on its side. Default `true`. */
  pinOnDrag?: Bind<boolean>;
  /** The key held while dropping that opens a copy (when the document may be open twice). Default `'auto'`: Ctrl, Option on Apple platforms. */
  copyModifier?: Bind<TabCopyModifier>;
  /** Managers with the same name take each other's documents and groups by drag. Default `null`: only this one. */
  dragGroup?: Bind<string | null>;
  /** A copy of the tab follows the pointer. Default `true`. */
  dragGhost?: Bind<boolean>;
  /** A strip scrolls while a drag is near its ends. Default `true`. */
  dragAutoScroll?: Bind<boolean>;
  /** Which keys the manager starts with. Default `'auto'`. */
  keyPreset?: Bind<TabKeyPreset>;
  /** Changes some keys; the rest keep the preset's. */
  keys?: Bind<Partial<TabDocumentKeys>>;
  /** Texts for this manager only, over `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** Changes are announced to screen readers (opened, closed, pinned…). Default `true`. */
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
  onKeeping?: (e: DocumentChangingEventArgs) => void;
  onKept?: (e: DocumentChangedEventArgs) => void;
  onPinning?: (e: DocumentChangingEventArgs) => void;
  onPinned?: (e: DocumentChangedEventArgs) => void;
  onUnpinning?: (e: DocumentChangingEventArgs) => void;
  onUnpinned?: (e: DocumentChangedEventArgs) => void;
  onLocking?: (e: GroupLockingEventArgs) => void;
  onLocked?: (e: GroupLockedEventArgs) => void;
  onUnlocking?: (e: GroupLockingEventArgs) => void;
  onUnlocked?: (e: GroupLockedEventArgs) => void;
  onContextMenuOpening?: (e: TabContextMenuEventArgs) => void;
  onDragStarting?: (e: TabDragStartingEventArgs) => void;
  onDragOver?: (e: TabDropEventArgs) => void;
  onDropping?: (e: TabDropEventArgs) => void;
  onDropped?: (e: TabDroppedEventArgs) => void;
  onDragEnded?: (e: TabDragEndedEventArgs) => void;
}
