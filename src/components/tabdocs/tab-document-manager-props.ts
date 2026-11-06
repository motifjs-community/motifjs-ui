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
import type { DocumentShowingEventArgs } from './document-showing-event-args';
import type { DocumentShownEventArgs } from './document-shown-event-args';
import type { GroupLockedEventArgs } from './group-locked-event-args';
import type { GroupLockingEventArgs } from './group-locking-event-args';
import type { GroupSplitEventArgs } from './group-split-event-args';
import type { GroupSplittingEventArgs } from './group-splitting-event-args';
import type { LayoutChangedEventArgs } from './layout-changed-event-args';
import type { LayoutChangingEventArgs } from './layout-changing-event-args';
import type { PinnedTabSize } from './pinned-tab-size';
import type { TabAfterClose } from './tab-after-close';
import type { TabBarButton } from './tab-bar-button';
import type { TabBarButtonSize } from './tab-bar-button-size';
import type { TabCloseButton } from './tab-close-button';
import type { TabContentFactory } from './tab-content-factory';
import type { TabDocumentKeys } from './tab-document-keys';
import type { TabKeyPreset } from './tab-key-preset';
import type { TabListScope } from './tab-list-scope';
import type { TabMenuCommand } from './tab-menu-command';
import type { TabContextMenuEventArgs } from './tab-context-menu-event-args';
import type { TabCopyModifier } from './tab-copy-modifier';
import type { TabAutoHiddenEventArgs } from './tab-auto-hidden-event-args';
import type { TabAutoHidingEventArgs } from './tab-auto-hiding-event-args';
import type { TabDockGuideKind } from './tab-dock-guide-kind';
import type { TabDockSide } from './tab-dock-side';
import type { TabDockedEventArgs } from './tab-docked-event-args';
import type { TabDockingEventArgs } from './tab-docking-event-args';
import type { TabFloatedEventArgs } from './tab-floated-event-args';
import type { TabFloatingEventArgs } from './tab-floating-event-args';
import type { TabSlideEventArgs } from './tab-slide-event-args';
import type { TabWindowClosedEventArgs } from './tab-window-closed-event-args';
import type { TabWindowClosingEventArgs } from './tab-window-closing-event-args';
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
import type { TabErrorEventArgs } from './tab-error-event-args';
import type { TabNewWindowCloseAction } from './tab-new-window-close-action';
import type { TabNewWindowFallback } from './tab-new-window-fallback';
import type { TabNewWindowTitle } from './tab-new-window-title';
import type { TabOpenWindow } from './tab-open-window';
import type { TabRestoreWindows } from './tab-restore-windows';
import type { TabWindowOpenedEventArgs } from './tab-window-opened-event-args';
import type { TabWindowOpeningEventArgs } from './tab-window-opening-event-args';
import type { ContextMenuPresentation } from '../contextmenu/context-menu-presentation';
import type { PresentationChangedEventArgs } from './presentation-changed-event-args';
import type { PresentationChangingEventArgs } from './presentation-changing-event-args';
import type { TabDockPresentation } from './tab-dock-presentation';
import type { TabPresentation } from './tab-presentation';
import type { TabNarrowBars } from './tab-narrow-bars';
import type { TabTabletWhen } from './tab-tablet-when';

/** Props of `TabDocumentManager`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface TabDocumentManagerProps extends ControlProps {
  /** Names the manager, making it a `region` landmark. This is the same property as `text`. */
  label?: Bind<string>;
  /** Which tabs show a close button. A document with `closable: false` shows none. The default is `'always'`. */
  closeButton?: Bind<TabCloseButton>;
  /** When content is created and how long it lives. A document's own value takes precedence. The default is `'keep'`. */
  contentLifetime?: Bind<ContentLifetime>;
  /** Closes a group when it has no documents left. The last group never closes. The default is `true`. */
  closeEmptyGroups?: Bind<boolean>;
  /** Where `open` places a tab when no `index` is given. The default is `'afterActive'`. */
  openPosition?: Bind<TabOpenPosition>;
  /** Which tab becomes active when the active tab closes. The default is `'recent'`. */
  afterClose?: Bind<TabAfterClose>;
  /**
   * With `'auto'`, the arrow keys in a strip also activate the tab they reach. With `'manual'`, Enter
   * or Space activates it. The default is `'auto'`.
   */
  activation?: Bind<TabsActivation>;
  /** The minimum width of a group, in pixels. The default is 160. */
  minGroupWidth?: Bind<number>;
  /** The minimum height of a group, in pixels. The default is 100. */
  minGroupHeight?: Bind<number>;
  /** How far a splitter key moves a splitter, in pixels. The default is 10. */
  resizeStep?: Bind<number>;
  /** Shows the split, maximize and "…" buttons and the lock mark in each group's toolbar. The default is `true`. */
  groupActions?: Bind<boolean>;
  /** Application buttons in each group's toolbar, placed before the built-in buttons. */
  toolbarItems?: TabToolbarItems;
  /**
   * Double-clicking a tab maximizes its group or restores the groups. On a preview tab, it keeps the
   * tab open instead. The default is `true`.
   */
  maximizeOnDoubleClick?: Bind<boolean>;
  /**
   * Documents opened with `preview` replace the group's preview tab until they are kept. With `false`,
   * every document opens as a regular tab. The default is `true`.
   */
  previewTabs?: Bind<boolean>;
  /** How wide pinned tabs are. The default is `'normal'`. */
  pinnedTabSize?: Bind<PinnedTabSize>;
  /** Places pinned tabs on their own row, above the others. The default is `false`. */
  pinnedTabsOnSeparateRow?: Bind<boolean>;
  /** Shows a close button on pinned tabs, next to the pin mark they always show. The default is `false`. */
  closeButtonOnPinned?: Bind<boolean>;
  /**
   * Keeps pinned tabs open with Close All, Close Others, Close to the Right or Left, and Close Saved.
   * The default is `true`.
   */
  keepPinned?: Bind<boolean>;
  /** How wide tabs are. The default is `'fit'`. */
  tabSize?: Bind<TabSize>;
  /**
   * The minimum width of a tab when tabs shrink (`shrink`, `fixed`, and shrinking pinned tabs), in
   * pixels. The default is 80.
   */
  tabMinWidth?: Bind<number>;
  /**
   * The maximum width of a tab in `fit` and `shrink`, in pixels. 0 leaves only the title's own limit.
   * The default is 0.
   */
  tabMaxWidth?: Bind<number>;
  /** The width of every tab in `fixed`, in pixels. The default is 160. */
  tabFixedWidth?: Bind<number>;
  /** Tabs that do not fit continue on more rows instead of scrolling. The default is `false`. */
  wrapTabs?: Bind<boolean>;
  /**
   * Shows buttons at the end of a strip that scroll it when the tabs do not fit. The wheel also scrolls
   * it. Without them, a thin scrollbar appears while the pointer is over the strip, and the "…" button
   * shows how many tabs are not visible. Applies to document groups and new windows. The default is `true`.
   */
  scrollButtons?: Bind<boolean>;
  /**
   * Shows a strip with a single document as a title (icon, title, marks and close button) instead of a
   * tab. Applies to document groups and new windows. The default is `false`.
   */
  singleTabTitle?: Bind<boolean>;
  /**
   * The built-in buttons that stay in a group's toolbar. The others, and application buttons that can
   * move (`overflow` is not `'never'`), move into the "…" menu above its list of documents. `'all'`
   * keeps every button, and a narrow toolbar collapses them into its own menu. Applies to document
   * groups and new windows. The default is `'all'`.
   */
  barButtons?: Bind<readonly TabBarButton[] | 'all'>;
  /**
   * The size of a group's toolbar buttons. `'small'` makes the built-in buttons small squares of about
   * 24 pixels. Applies to document groups and new windows. The default is `'normal'`.
   */
  barButtonSize?: Bind<TabBarButtonSize>;
  /**
   * `scrollButtons` for the strips of dock areas and floating windows. An area's or window's own
   * `scrollButtons` takes precedence. The default is `false`.
   */
  compactScrollButtons?: Bind<boolean>;
  /**
   * `tabSize` for dock areas and floating windows. Tabs shrink to `compactTabMinWidth` before the strip
   * scrolls. The default is `'shrink'`.
   */
  compactTabSize?: Bind<TabSize>;
  /** `tabMinWidth` for dock areas and floating windows, in pixels. The default is 64. */
  compactTabMinWidth?: Bind<number>;
  /** `singleTabTitle` for dock areas and floating windows. The default is `true`. */
  compactSingleTabTitle?: Bind<boolean>;
  /**
   * `barButtons` for dock areas and floating windows. With `'auto'`, a dock area keeps its pin and the
   * close button of its active document (`['autoHide', 'close']`), and a floating window keeps its own
   * close button (`['closeWindow']`), which closes its documents and hides those that can only be
   * hidden. A list applies as it is to both. The default is `'auto'`.
   */
  compactBarButtons?: Bind<readonly TabBarButton[] | 'all' | 'auto'>;
  /**
   * `barButtonSize` for dock areas and floating windows. An area's or window's own `barButtonSize`
   * takes precedence. The default is `'small'`.
   */
  compactBarButtonSize?: Bind<TabBarButtonSize>;
  /** When a tab shows its document's description. The default is `'duplicates'`. */
  showDescription?: Bind<TabShowDescription>;
  /** Shows the "…" button that lists the group's documents. The default is `true`. */
  openList?: Bind<boolean>;
  /** Which documents the "…" list shows. The default is `'group'`. */
  openListScope?: Bind<TabListScope>;
  /** Which documents the recently used list shows. The default is `'group'`. */
  recentListScope?: Bind<TabListScope>;
  /** The number of activated documents `goBack` remembers. 0 disables the history. The default is 50. */
  historySize?: Bind<number>;
  /** The number of closed documents `reopenClosed` remembers. 0 disables it. The default is 10. */
  closedHistorySize?: Bind<number>;
  /** Shows the context menus of tabs and of the empty strip. The default is `true`. */
  contextMenu?: Bind<boolean>;
  /** Built-in context menu items to omit: `{ copyTitle: false }`. */
  menuItems?: Bind<Partial<Record<TabMenuCommand, boolean>>>;
  /** Creates a new document when the empty strip is double-clicked, and for the strip menu. */
  newDocument?: TabNewDocument | null;
  /**
   * Allows the same document to be open in several groups, each copy with its own content. A document's
   * own value takes precedence. The default is `false`.
   */
  allowDuplicate?: Bind<boolean>;
  /**
   * When splitting with a document that can be open twice, opens a copy in the new group. Otherwise,
   * the document moves there. The default is `true`.
   */
  splitCopies?: Bind<boolean>;
  /** Allows tabs to be dragged. A document's own `allowDrag` takes precedence. The default is `true`. */
  allowDrag?: Bind<boolean>;
  /** Allows groups to be dragged by the empty part of their bar. The default is `true`. */
  allowDragGroups?: Bind<boolean>;
  /**
   * Adds a handle at the start of each group's toolbar for dragging the group, even when its tabs fill
   * the bar. Clicking it starts "Move group to…". The default is `false`.
   */
  groupDragHandle?: Bind<boolean>;
  /**
   * The positions a drop on a group's content can take: into it (`center`) or beside it. A group's own
   * `dropSides` takes precedence. The default is all five.
   */
  dropSides?: Bind<readonly TabDropSide[]>;
  /** The depth of the edge zones of a group's content, in pixels or as a share such as `'25%'`. The default is `'33%'`. */
  dropEdgeSize?: Bind<number | string>;
  /** Allows a drop at an edge of the whole layout to open a new group along that edge. The default is `true`. */
  layoutEdgeDrop?: Bind<boolean>;
  /** The depth of the band along the layout's edges, in pixels. The default is 16. */
  layoutEdgeSize?: Bind<number>;
  /** The distance in pixels the pointer must move before a press becomes a drag. The default is 5. */
  dragThreshold?: Bind<number>;
  /**
   * How long, in milliseconds, a finger or pen must rest on a tab before dragging it. A swipe before
   * that scrolls the strip. The default is 500.
   */
  longPressDelay?: Bind<number>;
  /** Pausing on a tab of another group while dragging activates it. The default is `true`. */
  dragHoverActivate?: Bind<boolean>;
  /** How long the pause must last, in milliseconds. The default is 750. */
  dragHoverDelay?: Bind<number>;
  /**
   * A tab dropped among the pinned tabs becomes pinned, and a tab dropped among the others becomes
   * unpinned. `false` keeps each tab on its side. The default is `true`.
   */
  pinOnDrag?: Bind<boolean>;
  /**
   * The key held while dropping to open a copy, when the document can be open twice. The default is
   * `'auto'`, which is Ctrl, or Option on Apple platforms.
   */
  copyModifier?: Bind<TabCopyModifier>;
  /**
   * Managers with the same name accept each other's dragged documents and groups. The default is
   * `null`, which accepts drags from this manager only.
   */
  dragGroup?: Bind<string | null>;
  /** Shows a copy of the tab under the pointer. The default is `true`. */
  dragGhost?: Bind<boolean>;
  /** Scrolls a strip while a drag is near its ends. The default is `true`. */
  dragAutoScroll?: Bind<boolean>;
  /**
   * Allows documents and groups to float in their own windows in the page. A document's own `allowFloat`
   * takes precedence. The default is `true`.
   */
  allowFloat?: Bind<boolean>;
  /**
   * Allows documents and groups to move to the dock areas around the documents. A document's own
   * `allowDock` takes precedence. The default is `true`.
   */
  allowDock?: Bind<boolean>;
  /** The dock areas documents can move to. A document's own `dockSides` takes precedence. The default is all four. */
  dockSides?: Bind<readonly TabDockSide[]>;
  /**
   * Allows dock areas to collapse to the manager's edge. A document with `allowAutoHide: false` keeps
   * its area open. The default is `true`.
   */
  allowAutoHide?: Bind<boolean>;
  /**
   * Allows documents to be hidden (`hide`, the "Hide" command, and the close button of a dock area for
   * a document that cannot be closed) and shown again in their previous place. A document's own
   * `allowHide` takes precedence. The default is `true`.
   */
  allowHide?: Bind<boolean>;
  /** The initial size of a floating window. `null` uses the size of its original group. The default is `null`. */
  floatingWindowSize?: Bind<{ width: number; height: number } | null>;
  /**
   * Keeps floating windows inside the viewport when they are moved or resized, or when the page gets
   * smaller. The default is `true`.
   */
  keepFloatingInView?: Bind<boolean>;
  /** Closes a floating window when its last document closes. The default is `true`. */
  closeEmptyWindows?: Bind<boolean>;
  /** Double-clicking the empty part of a floating window's strip docks it back. The default is `true`. */
  dockOnDoubleClick?: Bind<boolean>;
  /**
   * The initial size of a new dock area on each side, in pixels or as a share such as `'25%'`. The
   * default is `{ left: 240, right: 240, top: 160, bottom: 200 }`.
   */
  dockAreaSize?: Bind<Partial<Record<TabDockSide, number | string>>>;
  /** The minimum size of a dock area, in pixels. The default is 120. */
  dockAreaMinSize?: Bind<number>;
  /**
   * Resting the pointer on a collapsed area's title slides it out after `autoHideDelay`. When disabled,
   * only a click or a key slides it out. The default is `true`.
   */
  autoHideHover?: Bind<boolean>;
  /**
   * How long, in milliseconds, the pointer rests on a title before its area slides out, or stays away
   * before it slides back. The default is 500.
   */
  autoHideDelay?: Bind<number>;
  /**
   * Shows dock guides while dragging, over the group under the pointer and at the manager's edges. A
   * drop away from them and from the strips floats. When disabled, a drop on a group's content uses its
   * edge zones, and a drop outside the manager floats. The default is `false`.
   */
  dockGuides?: Bind<boolean>;
  /** Which dock guides appear. The default is both: `['group', 'edges']`. */
  dockGuideKinds?: Bind<readonly TabDockGuideKind[]>;
  /**
   * Allows documents, groups and floating windows to move into new browser windows. A document's own
   * `allowNewWindow` takes precedence. The default is `true`.
   */
  allowNewWindow?: Bind<boolean>;
  /** The page a new window opens, on the page's own origin. The default is `'about:blank'`. */
  newWindowUrl?: Bind<string>;
  /**
   * A new window's title, or a function that returns it. `{title}` is the title of its active document
   * and `{page}` is the page title. The default is `'{title} – {page}'`.
   */
  newWindowTitle?: Bind<TabNewWindowTitle>;
  /** The initial size of a new window. `null` uses the size of what moves into it. The default is `null`. */
  newWindowSize?: Bind<{ width: number; height: number } | null>;
  /**
   * What happens when the browser blocks a new window: `'float'` opens a floating window instead, and
   * `'none'` leaves the target in place. The default is `'float'`.
   */
  newWindowFallback?: Bind<TabNewWindowFallback>;
  /**
   * Whether a new window's documents return to the main window (`'back'`) or close (`'close'`) when it
   * closes. `onWindowClosing` can change this. The default is `'back'`.
   */
  newWindowCloseAction?: Bind<TabNewWindowCloseAction>;
  /** How `loadLayout` restores saved new windows. The default is `'float'`. */
  restoreWindows?: Bind<TabRestoreWindows>;
  /** Opens the browser window a document moves into. The default is `window.open`. */
  openWindow?: TabOpenWindow | null;
  /**
   * Dragging past the edge of the browser window opens a new window there, and dragging past the edge
   * of a new window returns the item to the main window. The default is `true`.
   */
  dragOutToNewWindow?: Bind<boolean>;
  /** Which keys the manager starts with. The default is `'auto'`. */
  keyPreset?: Bind<TabKeyPreset>;
  /** Changes specific keys, and the others keep the preset's values. */
  keys?: Bind<Partial<TabDocumentKeys>>;
  /** Strings for this manager only, which override `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** Announces changes such as opened, closed and pinned to screen readers. The default is `true`. */
  announce?: Bind<boolean>;
  /** Creates the content of a document that does not provide its own. */
  factory?: Bind<TabContentFactory | null>;
  /**
   * How the layout is presented: based on the manager's own width with `'auto'` (below `phoneWidth` as
   * on a phone, below `tabletWidth` as on a tablet, otherwise as on a desktop), or always the same way.
   * The layout itself and what it saves stay the same, and only where items appear changes. The default
   * is `'auto'`.
   */
  presentation?: Bind<TabPresentation>;
  /**
   * Below this width of the manager, in pixels, `'auto'` uses the tablet presentation on touch screens
   * (see `tabletWhen`). The default is 1024.
   */
  tabletWidth?: Bind<number>;
  /**
   * Below this width of the manager, in pixels, `'auto'` uses the phone presentation regardless of the
   * pointer type. The default is 560: phones are 360–430 pixels wide, and a manager of about 590 beside
   * a desktop page's side column stays in the desktop presentation.
   */
  phoneWidth?: Bind<number>;
  /**
   * When `'auto'` uses the tablet presentation. With `'touch'`, it applies below `tabletWidth` on a
   * screen whose pointer is a finger, and a mouse keeps the desktop presentation. With `'width'`, it
   * applies below `tabletWidth` regardless of the pointer type. The default is `'touch'`.
   */
  tabletWhen?: Bind<TabTabletWhen>;
  /**
   * The appearance of the document group bars on a tablet or phone: `'compact'` uses the `compact…`
   * settings, as in dock areas, and `'documents'` keeps the desktop bar. The default is `'compact'`.
   */
  narrowBars?: Bind<TabNarrowBars>;
  /**
   * How dock areas appear on a phone: in a bottom sheet, a drawer from their edge, or not at all. An
   * area's own `phoneDockMode` takes precedence. The default is `'sheet'`.
   */
  phoneDockMode?: Bind<TabDockPresentation>;
  /**
   * How dock areas appear on a tablet. `'auto'` uses a drawer for the sides and top, and a sheet for
   * the bottom. An area's own `tabletDockMode` takes precedence. The default is `'auto'`.
   */
  tabletDockMode?: Bind<TabDockPresentation>;
  /** On a tablet or phone, swiping in from an edge opens the dock area there as a drawer. The default is `true`. */
  edgeSwipe?: Bind<boolean>;
  /**
   * On a phone, the browser's back action (Android's back button, the back gesture) goes back through
   * the documents once no sheet or list is open. The default is `true`.
   */
  backButton?: Bind<boolean>;
  /**
   * How tab menus appear. `null` uses an action sheet on a phone, a sheet for touch on a tablet, and a
   * menu in the desktop presentation. The default is `null`.
   */
  menuPresentation?: Bind<ContextMenuPresentation | null>;
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
  onFloating?: (e: TabFloatingEventArgs) => void;
  onFloated?: (e: TabFloatedEventArgs) => void;
  onDocking?: (e: TabDockingEventArgs) => void;
  onDocked?: (e: TabDockedEventArgs) => void;
  onAutoHiding?: (e: TabAutoHidingEventArgs) => void;
  onAutoHidden?: (e: TabAutoHiddenEventArgs) => void;
  onHiding?: (e: DocumentChangingEventArgs) => void;
  onHidden?: (e: DocumentChangedEventArgs) => void;
  onShowing?: (e: DocumentShowingEventArgs) => void;
  onShown?: (e: DocumentShownEventArgs) => void;
  onSlideChanging?: (e: TabSlideEventArgs) => void;
  onSlideChanged?: (e: TabSlideEventArgs) => void;
  onWindowClosing?: (e: TabWindowClosingEventArgs) => void;
  onWindowClosed?: (e: TabWindowClosedEventArgs) => void;
  onWindowOpening?: (e: TabWindowOpeningEventArgs) => void;
  onWindowOpened?: (e: TabWindowOpenedEventArgs) => void;
  onError?: (e: TabErrorEventArgs) => void;
  onPresentationChanging?: (e: PresentationChangingEventArgs) => void;
  onPresentationChanged?: (e: PresentationChangedEventArgs) => void;
}
