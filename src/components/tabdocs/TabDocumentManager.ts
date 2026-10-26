import { ComponentBase, effect, Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { deepActiveElement } from '../../core/focus';
import { fillTemplate } from '../../core/fill-template';
import { functionValue } from '../../core/function-value';
import { addShortcut } from '../../core/keyboard';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { TabsActivation } from '../tabs/tabs-activation';
import type { ContentLifetime } from './content-lifetime';
import type { DocumentActivatedEventArgs } from './document-activated-event-args';
import type { DocumentActivatingEventArgs } from './document-activating-event-args';
import type { DocumentChangedEventArgs } from './document-changed-event-args';
import type { DocumentChangingEventArgs } from './document-changing-event-args';
import type { DocumentClosedEventArgs } from './document-closed-event-args';
import type { DocumentClosingEventArgs } from './document-closing-event-args';
import { DocumentList } from './DocumentList';
import type { DocumentMovedEventArgs } from './document-moved-event-args';
import type { DocumentMovingEventArgs } from './document-moving-event-args';
import type { DocumentOpenedEventArgs } from './document-opened-event-args';
import type { DocumentOpeningEventArgs } from './document-opening-event-args';
import { DocumentTab } from './DocumentTab';
import { DropMarks } from './DropMarks';
import type { GroupLockedEventArgs } from './group-locked-event-args';
import type { GroupLockingEventArgs } from './group-locking-event-args';
import type { GroupSplitEventArgs } from './group-split-event-args';
import type { GroupSplittingEventArgs } from './group-splitting-event-args';
import type { LayoutChangedEventArgs } from './layout-changed-event-args';
import type { LayoutChangingEventArgs } from './layout-changing-event-args';
import type { LayoutItem } from './layout-item';
import { LayoutDropTarget } from './LayoutDropTarget';
import { MoveByKeys } from './MoveByKeys';
import type { PinnedTabSize } from './pinned-tab-size';
import { placeNode } from './place-node';
import type { SplitDirection } from './split-direction';
import type { TabAfterClose } from './tab-after-close';
import type { TabCloseButton } from './tab-close-button';
import type { TabContentFactory } from './tab-content-factory';
import type { TabContextMenuEventArgs } from './tab-context-menu-event-args';
import type { TabCopyModifier } from './tab-copy-modifier';
import { TabDocument } from './TabDocument';
import type { TabDocumentKeys } from './tab-document-keys';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabDocumentOptions } from './tab-document-options';
import { TabDrag } from './TabDrag';
import type { TabDragEndedEventArgs } from './tab-drag-ended-event-args';
import type { TabDragStartingEventArgs } from './tab-drag-starting-event-args';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropEventArgs } from './tab-drop-event-args';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropSide } from './tab-drop-side';
import type { TabDropTarget } from './tab-drop-target';
import type { TabDroppedEventArgs } from './tab-dropped-event-args';
import { TabGroup } from './TabGroup';
import { BROWSER_KEYS, DESKTOP_KEYS } from './tab-keys';
import type { TabKeyPreset } from './tab-key-preset';
import type { TabLayout } from './tab-layout';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabLayoutDocument } from './tab-layout-document';
import type { TabLayoutFactory } from './tab-layout-factory';
import type { TabLayoutGroup } from './tab-layout-group';
import type { TabLayoutNode } from './tab-layout-node';
import type { TabListScope } from './tab-list-scope';
import type { TabMenuCommand } from './tab-menu-command';
import { TabMenus } from './TabMenus';
import type { TabNewDocument } from './tab-new-document';
import type { TabOpenOptions } from './tab-open-options';
import type { TabOpenPosition } from './tab-open-position';
import type { TabShowDescription } from './tab-show-description';
import type { TabSize } from './tab-size';
import { TabSplit } from './TabSplit';
import type { TabToolbarItems } from './tab-toolbar-items';
import { AutoHideStrip } from './AutoHideStrip';
import { DockDropTarget } from './DockDropTarget';
import { keepScroll } from './keep-scroll';
import type { TabAutoHiddenEventArgs } from './tab-auto-hidden-event-args';
import type { TabAutoHidingEventArgs } from './tab-auto-hiding-event-args';
import { TabDockArea } from './TabDockArea';
import type { TabDockGuideKind } from './tab-dock-guide-kind';
import type { TabDockSide } from './tab-dock-side';
import type { TabDockedEventArgs } from './tab-docked-event-args';
import type { TabDockingEventArgs } from './tab-docking-event-args';
import type { TabFloatedEventArgs } from './tab-floated-event-args';
import type { TabFloatingEventArgs } from './tab-floating-event-args';
import type { TabLayoutArea } from './tab-layout-area';
import type { TabLayoutWindow } from './tab-layout-window';
import type { TabRect } from './tab-rect';
import type { TabSlideEventArgs } from './tab-slide-event-args';
import { TabWindow } from './TabWindow';
import type { TabWindowClosedEventArgs } from './tab-window-closed-event-args';
import type { TabWindowClosingEventArgs } from './tab-window-closing-event-args';
import { WindowByKeys } from './WindowByKeys';
import { SplitSash } from './SplitSash';
import type { SashOwner } from './sash-owner';

const OWN = [
  'closeButton',
  'contentLifetime',
  'closeEmptyGroups',
  'openPosition',
  'afterClose',
  'activation',
  'minGroupWidth',
  'minGroupHeight',
  'resizeStep',
  'groupActions',
  'maximizeOnDoubleClick',
  'previewTabs',
  'pinnedTabSize',
  'pinnedTabsOnSeparateRow',
  'closeButtonOnPinned',
  'keepPinned',
  'tabSize',
  'tabMinWidth',
  'tabMaxWidth',
  'tabFixedWidth',
  'wrapTabs',
  'scrollButtons',
  'showDescription',
  'openList',
  'openListScope',
  'recentListScope',
  'historySize',
  'closedHistorySize',
  'contextMenu',
  'menuItems',
  'allowDuplicate',
  'splitCopies',
  'allowDrag',
  'allowDragGroups',
  'groupDragHandle',
  'dropSides',
  'dropEdgeSize',
  'layoutEdgeDrop',
  'layoutEdgeSize',
  'dragThreshold',
  'longPressDelay',
  'dragHoverActivate',
  'dragHoverDelay',
  'pinOnDrag',
  'copyModifier',
  'dragGroup',
  'dragGhost',
  'dragAutoScroll',
  'allowFloat',
  'allowDock',
  'dockSides',
  'allowAutoHide',
  'floatingWindowSize',
  'keepFloatingInView',
  'closeEmptyWindows',
  'dockOnDoubleClick',
  'dockAreaSize',
  'dockAreaMinSize',
  'autoHideHover',
  'autoHideDelay',
  'dockGuides',
  'dockGuideKinds',
  'keyPreset',
  'keys',
  'texts',
  'announce',
] as const;

/** Callbacks: stored as they are given. */
const CALLBACKS = ['newDocument', 'toolbarItems'] as const;

/** Props the strip's look follows. */
const STRIP = ['tabSize', 'pinnedTabSize', 'pinnedTabsOnSeparateRow', 'wrapTabs', 'scrollButtons', 'tabMinWidth', 'tabMaxWidth', 'tabFixedWidth'] as const;

const NO_GROUPS: readonly TabGroup[] = [];
const NO_DOCUMENTS: readonly TabDocument[] = [];
const ALL_SIDES: readonly TabDropSide[] = ['center', 'left', 'right', 'up', 'down'];
const DOCK_SIDES: readonly TabDockSide[] = ['left', 'right', 'top', 'bottom'];
const GUIDE_KINDS: readonly TabDockGuideKind[] = ['group', 'edges'];
const AREA_SIZES: Readonly<Record<TabDockSide, number | string>> = { left: 240, right: 240, top: 160, bottom: 200 };
const NO_WINDOWS: readonly TabWindow[] = [];
const NO_AREAS: readonly TabDockArea[] = [];

/** What holds a layout tree: a floating window, a dock area, or the documents' area (`null`). */
type Host = TabWindow | TabDockArea | null;

/** Every manager on the page: a drag finds the managers of its `dragGroup` here. */
const MANAGERS = new Set<TabDocumentManager>();

/** A closed document `reopenClosed` can open again, and where it was. */
interface Closed {
  document: TabDocument;
  group: TabGroup;
  index: number;
}

interface Parts {
  root: LayoutItem | null;
  tabs: Map<TabDocument, DocumentTab>;
  /** The groups, the one used last first. */
  recentGroups: TabGroup[];
  maximized: TabGroup | null;
  /** What maximizing hid. */
  hidden: HTMLElement[];
  live: HTMLDivElement;
  keyStops: (() => void)[];
  /** The documents activated, in order; `at` is the current one. */
  history: TabDocument[];
  at: number;
  /** Going back or forward: the activation is not a new step. */
  travelling: boolean;
  closed: Closed[];
  menus: TabMenus | null;
  openList: DocumentList | null;
  recentList: DocumentList | null;
  drag: TabDrag | null;
  moveKeys: MoveByKeys | null;
  marks: DropMarks;
  layoutTarget: LayoutDropTarget | null;
  /** Asked in order, the first answer wins; the layout's own target is last. */
  targets: TabDropTarget[];
  /** Where the last drop put the document (or the group's documents), for `onDropped`. */
  dropResult: { group: TabGroup | null; document: TabDocument | null } | null;
  /** The dock areas by side, and the order they nest in (the outermost first). */
  areas: Map<TabDockSide, TabDockArea>;
  order: TabDockSide[];
  /** The floating windows, in the order they were made. */
  windows: TabWindow[];
  dockTarget: DockDropTarget | null;
  windowKeys: WindowByKeys | null;
  /** Watches the manager's size: a dock area sized by a share follows it. */
  sizeWatch: ResizeObserver | null;
  /** The folded area slid out now: how it was opened, and what closes it. */
  slide: { area: TabDockArea; hover: boolean; stop: () => void } | null;
  /** Why the windows a change leaves empty go: they were docked. */
  windowGone: 'docked' | null;
  /** The windows `closeWindow` is closing the documents of. */
  closingWindows: Set<TabWindow>;
  floating: Emitter<TabFloatingEventArgs>;
  floated: Emitter<TabFloatedEventArgs>;
  docking: Emitter<TabDockingEventArgs>;
  docked: Emitter<TabDockedEventArgs>;
  autoHiding: Emitter<TabAutoHidingEventArgs>;
  autoHidden: Emitter<TabAutoHiddenEventArgs>;
  slideChanging: Emitter<TabSlideEventArgs>;
  slideChanged: Emitter<TabSlideEventArgs>;
  windowClosing: Emitter<TabWindowClosingEventArgs>;
  windowClosed: Emitter<TabWindowClosedEventArgs>;
  opening: Emitter<DocumentOpeningEventArgs>;
  opened: Emitter<DocumentOpenedEventArgs>;
  closing: Emitter<DocumentClosingEventArgs>;
  closed_: Emitter<DocumentClosedEventArgs>;
  activating: Emitter<DocumentActivatingEventArgs>;
  activated: Emitter<DocumentActivatedEventArgs>;
  moving: Emitter<DocumentMovingEventArgs>;
  moved: Emitter<DocumentMovedEventArgs>;
  splitting: Emitter<GroupSplittingEventArgs>;
  split: Emitter<GroupSplitEventArgs>;
  layoutChanging: Emitter<LayoutChangingEventArgs>;
  layoutChanged: Emitter<LayoutChangedEventArgs>;
  keeping: Emitter<DocumentChangingEventArgs>;
  kept: Emitter<DocumentChangedEventArgs>;
  pinning: Emitter<DocumentChangingEventArgs>;
  pinned: Emitter<DocumentChangedEventArgs>;
  unpinning: Emitter<DocumentChangingEventArgs>;
  unpinned: Emitter<DocumentChangedEventArgs>;
  locking: Emitter<GroupLockingEventArgs>;
  locked: Emitter<GroupLockedEventArgs>;
  unlocking: Emitter<GroupLockingEventArgs>;
  unlocked: Emitter<GroupLockedEventArgs>;
  menuOpening: Emitter<TabContextMenuEventArgs>;
  dragStarting: Emitter<TabDragStartingEventArgs>;
  dragOver: Emitter<TabDropEventArgs>;
  dropping: Emitter<TabDropEventArgs>;
  dropped: Emitter<TabDroppedEventArgs>;
  dragEnded: Emitter<TabDragEndedEventArgs>;
}

const PARTS = Symbol('mx.tab-document-manager');

/**
 * Documents in tabs, in groups that split side by side and one under the other, as code editors
 * have them. A document's content is any component; it is moved, never made again, when its tab
 * moves to another group. Tabs can be previews, pinned, coloured and counted; each group has a
 * list of its documents, every tab and the strip a context menu, and the recently used documents
 * are a key away. Every user action is also a method, asks first (`on…ing`, cancelable) and
 * reports after (`on…ed`). The layout saves to JSON and loads back.
 *
 * @example
 * <TabDocumentManager label="Editor" style="block-size: 30rem" ref={(m: TabDocumentManager) => (this.docs = m)} />
 *
 * this.docs.open(new TabDocument({ title: 'Orders', content: () => new OrderGrid() }), { preview: true });
 * this.docs.split(this.docs.activeGroup!, 'right', this.docs.findDocument('report')!);
 * localStorage.layout = JSON.stringify(this.docs.saveLayout());
 */
export class TabDocumentManager extends FocusContainer<HTMLDivElement, TabDocumentManagerProps> {
  /** The keys a manager in a browser tab starts with: keys the browser lets the page have. */
  static readonly browserKeys: Readonly<TabDocumentKeys> = BROWSER_KEYS;
  /** The keys of a desktop editor, for an installed app (`keyPreset: 'desktop'`). */
  static readonly desktopKeys: Readonly<TabDocumentKeys> = DESKTOP_KEYS;

  constructor(props?: IBaseProp<TabDocumentManagerProps>) {
    super('div', props);
    const own = (this.props ?? {}) as TabDocumentManagerProps;
    const parts = this.parts;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.factory !== undefined) this.bindProperty('factory', functionValue(own.factory));
    for (const name of CALLBACKS) if (own[name] !== undefined) this.setProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    const events: [keyof TabDocumentManagerProps, (handler: never) => unknown][] = [
      ['onOpening', this.onOpening],
      ['onOpened', this.onOpened],
      ['onClosing', this.onClosing],
      ['onClosed', this.onClosed],
      ['onDocumentActivating', this.onDocumentActivating],
      ['onDocumentActivated', this.onDocumentActivated],
      ['onMoving', this.onMoving],
      ['onMoved', this.onMoved],
      ['onSplitting', this.onSplitting],
      ['onSplit', this.onSplit],
      ['onLayoutChanging', this.onLayoutChanging],
      ['onLayoutChanged', this.onLayoutChanged],
      ['onKeeping', this.onKeeping],
      ['onKept', this.onKept],
      ['onPinning', this.onPinning],
      ['onPinned', this.onPinned],
      ['onUnpinning', this.onUnpinning],
      ['onUnpinned', this.onUnpinned],
      ['onLocking', this.onLocking],
      ['onLocked', this.onLocked],
      ['onUnlocking', this.onUnlocking],
      ['onUnlocked', this.onUnlocked],
      ['onContextMenuOpening', this.onContextMenuOpening],
      ['onDragStarting', this.onDragStarting],
      ['onDragOver', this.onDragOver],
      ['onDropping', this.onDropping],
      ['onDropped', this.onDropped],
      ['onDragEnded', this.onDragEnded],
      ['onFloating', this.onFloating],
      ['onFloated', this.onFloated],
      ['onDocking', this.onDocking],
      ['onDocked', this.onDocked],
      ['onAutoHiding', this.onAutoHiding],
      ['onAutoHidden', this.onAutoHidden],
      ['onSlideChanging', this.onSlideChanging],
      ['onSlideChanged', this.onSlideChanged],
      ['onWindowClosing', this.onWindowClosing],
      ['onWindowClosed', this.onWindowClosed],
    ];
    for (const [name, subscribe] of events) if (own[name]) subscribe(own[name] as never);

    this.observeProperty<number | undefined>('minGroupWidth', () => this.renderMinSizes());
    this.observeProperty<number | undefined>('minGroupHeight', () => this.renderMinSizes());
    for (const name of STRIP) this.observeProperty(name, () => this.renderStrip());
    this.observeProperty('keys', () => this.registerKeys());
    this.observeProperty('keyPreset', () => this.registerKeys());
    this.observeProperty<string>('text', (label) => {
      if (label) {
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-label', label);
      } else {
        this.element.removeAttribute('role');
        this.element.removeAttribute('aria-label');
      }
    });

    this.ensureRoot();
    parts.menus = new TabMenus(this);
    parts.layoutTarget = new LayoutDropTarget(this);
    parts.targets.push(parts.layoutTarget);
    parts.dockTarget = new DockDropTarget(this);
    parts.targets.unshift(parts.dockTarget);
    parts.drag = new TabDrag(this);
    parts.moveKeys = new MoveByKeys(this, parts.drag);
    parts.windowKeys = new WindowByKeys(this);
    this.observeProperty('dockAreaSize', () => this.renderDock());
    this.observeProperty('dockAreaMinSize', () => this.renderDock());
    this.watchSize();
    MANAGERS.add(this);
    // Built later than made: core has just put the groups at the root, back into their splits.
    this.motif.on('x:built', () => untracked(() => this.renderTree()));
    const stopTexts = effect(() => {
      void uiLocale.strings;
      void this.getProperty('texts');
      void this.groups;
      untracked(() => this.renderTexts());
    });
    this.motif.setDisposable(() => {
      stopTexts();
      MANAGERS.delete(this);
      parts.moveKeys?.end(false);
      parts.windowKeys?.end(false);
      parts.drag?.cancel(true);
      parts.slide?.stop();
      parts.slide = null;
      parts.sizeWatch?.disconnect();
      parts.dockTarget?.dispose();
      for (const stop of parts.keyStops.splice(0)) stop();
      for (const [doc, tab] of parts.tabs) {
        doc.placeIn(null, null);
        tab.dispose();
      }
      parts.tabs.clear();
      parts.closed = [];
      parts.history = [];
      this.disposeSplits(parts.root);
      for (const area of parts.areas.values()) {
        this.disposeSplits(area.root);
        area.strip?.dispose();
        area.dispose();
      }
      for (const w of parts.windows) {
        this.disposeSplits(w.root);
        w.dispose();
      }
      parts.areas.clear();
      parts.windows = [];
      parts.menus?.dispose();
      parts.openList?.dispose();
      parts.recentList?.dispose();
      for (const emitter of [
        parts.opening,
        parts.opened,
        parts.closing,
        parts.closed_,
        parts.activating,
        parts.activated,
        parts.moving,
        parts.moved,
        parts.splitting,
        parts.split,
        parts.layoutChanging,
        parts.layoutChanged,
        parts.keeping,
        parts.kept,
        parts.pinning,
        parts.pinned,
        parts.unpinning,
        parts.unpinned,
        parts.locking,
        parts.locked,
        parts.unlocking,
        parts.unlocked,
        parts.menuOpening,
        parts.dragStarting,
        parts.dragOver,
        parts.dropping,
        parts.dropped,
        parts.dragEnded,
        parts.floating,
        parts.floated,
        parts.docking,
        parts.docked,
        parts.autoHiding,
        parts.autoHidden,
        parts.slideChanging,
        parts.slideChanged,
        parts.windowClosing,
        parts.windowClosed,
      ]) {
        emitter.dispose();
      }
    });
  }

  // Properties (see TabDocumentManagerProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get closeButton(): TabCloseButton {
    return this.getProperty<TabCloseButton | undefined>('closeButton') ?? 'always';
  }
  set closeButton(value: Bind<TabCloseButton>) {
    this.assignProperty('closeButton', value);
  }
  get contentLifetime(): ContentLifetime {
    return this.getProperty<ContentLifetime | undefined>('contentLifetime') ?? 'keep';
  }
  set contentLifetime(value: Bind<ContentLifetime>) {
    this.assignProperty('contentLifetime', value);
  }
  get closeEmptyGroups(): boolean {
    return this.getProperty<boolean | undefined>('closeEmptyGroups') ?? true;
  }
  set closeEmptyGroups(value: Bind<boolean>) {
    this.assignProperty('closeEmptyGroups', value, Boolean);
  }
  get openPosition(): TabOpenPosition {
    return this.getProperty<TabOpenPosition | undefined>('openPosition') ?? 'afterActive';
  }
  set openPosition(value: Bind<TabOpenPosition>) {
    this.assignProperty('openPosition', value);
  }
  get afterClose(): TabAfterClose {
    return this.getProperty<TabAfterClose | undefined>('afterClose') ?? 'recent';
  }
  set afterClose(value: Bind<TabAfterClose>) {
    this.assignProperty('afterClose', value);
  }
  get activation(): TabsActivation {
    return this.getProperty<TabsActivation | undefined>('activation') ?? 'auto';
  }
  set activation(value: Bind<TabsActivation>) {
    this.assignProperty('activation', value);
  }
  get minGroupWidth(): number {
    return this.getProperty<number | undefined>('minGroupWidth') ?? 160;
  }
  set minGroupWidth(value: Bind<number>) {
    this.assignProperty('minGroupWidth', value, (v) => Math.max(0, Number(v) || 0));
  }
  get minGroupHeight(): number {
    return this.getProperty<number | undefined>('minGroupHeight') ?? 100;
  }
  set minGroupHeight(value: Bind<number>) {
    this.assignProperty('minGroupHeight', value, (v) => Math.max(0, Number(v) || 0));
  }
  get resizeStep(): number {
    return this.getProperty<number | undefined>('resizeStep') ?? 10;
  }
  set resizeStep(value: Bind<number>) {
    this.assignProperty('resizeStep', value, (v) => Math.max(1, Number(v) || 1));
  }
  get groupActions(): boolean {
    return this.getProperty<boolean | undefined>('groupActions') ?? true;
  }
  set groupActions(value: Bind<boolean>) {
    this.assignProperty('groupActions', value, Boolean);
  }
  get toolbarItems(): TabToolbarItems | null {
    return this.getProperty<TabToolbarItems | null | undefined>('toolbarItems') ?? null;
  }
  set toolbarItems(value: TabToolbarItems | null) {
    this.setProperty('toolbarItems', value);
  }
  get maximizeOnDoubleClick(): boolean {
    return this.getProperty<boolean | undefined>('maximizeOnDoubleClick') ?? true;
  }
  set maximizeOnDoubleClick(value: Bind<boolean>) {
    this.assignProperty('maximizeOnDoubleClick', value, Boolean);
  }
  get previewTabs(): boolean {
    return this.getProperty<boolean | undefined>('previewTabs') ?? true;
  }
  set previewTabs(value: Bind<boolean>) {
    this.assignProperty('previewTabs', value, Boolean);
  }
  get pinnedTabSize(): PinnedTabSize {
    return this.getProperty<PinnedTabSize | undefined>('pinnedTabSize') ?? 'normal';
  }
  set pinnedTabSize(value: Bind<PinnedTabSize>) {
    this.assignProperty('pinnedTabSize', value);
  }
  get pinnedTabsOnSeparateRow(): boolean {
    return this.getProperty<boolean | undefined>('pinnedTabsOnSeparateRow') ?? false;
  }
  set pinnedTabsOnSeparateRow(value: Bind<boolean>) {
    this.assignProperty('pinnedTabsOnSeparateRow', value, Boolean);
  }
  get closeButtonOnPinned(): boolean {
    return this.getProperty<boolean | undefined>('closeButtonOnPinned') ?? false;
  }
  set closeButtonOnPinned(value: Bind<boolean>) {
    this.assignProperty('closeButtonOnPinned', value, Boolean);
  }
  get keepPinned(): boolean {
    return this.getProperty<boolean | undefined>('keepPinned') ?? true;
  }
  set keepPinned(value: Bind<boolean>) {
    this.assignProperty('keepPinned', value, Boolean);
  }
  get tabSize(): TabSize {
    return this.getProperty<TabSize | undefined>('tabSize') ?? 'fit';
  }
  set tabSize(value: Bind<TabSize>) {
    this.assignProperty('tabSize', value);
  }
  get tabMinWidth(): number {
    return this.getProperty<number | undefined>('tabMinWidth') ?? 80;
  }
  set tabMinWidth(value: Bind<number>) {
    this.assignProperty('tabMinWidth', value, (v) => Math.max(0, Number(v) || 0));
  }
  get tabMaxWidth(): number {
    return this.getProperty<number | undefined>('tabMaxWidth') ?? 0;
  }
  set tabMaxWidth(value: Bind<number>) {
    this.assignProperty('tabMaxWidth', value, (v) => Math.max(0, Number(v) || 0));
  }
  get tabFixedWidth(): number {
    return this.getProperty<number | undefined>('tabFixedWidth') ?? 160;
  }
  set tabFixedWidth(value: Bind<number>) {
    this.assignProperty('tabFixedWidth', value, (v) => Math.max(0, Number(v) || 0));
  }
  get wrapTabs(): boolean {
    return this.getProperty<boolean | undefined>('wrapTabs') ?? false;
  }
  set wrapTabs(value: Bind<boolean>) {
    this.assignProperty('wrapTabs', value, Boolean);
  }
  get scrollButtons(): boolean {
    return this.getProperty<boolean | undefined>('scrollButtons') ?? true;
  }
  set scrollButtons(value: Bind<boolean>) {
    this.assignProperty('scrollButtons', value, Boolean);
  }
  get showDescription(): TabShowDescription {
    return this.getProperty<TabShowDescription | undefined>('showDescription') ?? 'duplicates';
  }
  set showDescription(value: Bind<TabShowDescription>) {
    this.assignProperty('showDescription', value);
  }
  get openList(): boolean {
    return this.getProperty<boolean | undefined>('openList') ?? true;
  }
  set openList(value: Bind<boolean>) {
    this.assignProperty('openList', value, Boolean);
  }
  get openListScope(): TabListScope {
    return this.getProperty<TabListScope | undefined>('openListScope') ?? 'group';
  }
  set openListScope(value: Bind<TabListScope>) {
    this.assignProperty('openListScope', value);
  }
  get recentListScope(): TabListScope {
    return this.getProperty<TabListScope | undefined>('recentListScope') ?? 'group';
  }
  set recentListScope(value: Bind<TabListScope>) {
    this.assignProperty('recentListScope', value);
  }
  get historySize(): number {
    return this.getProperty<number | undefined>('historySize') ?? 50;
  }
  set historySize(value: Bind<number>) {
    this.assignProperty('historySize', value, (v) => Math.max(0, Math.floor(Number(v) || 0)));
  }
  get closedHistorySize(): number {
    return this.getProperty<number | undefined>('closedHistorySize') ?? 10;
  }
  set closedHistorySize(value: Bind<number>) {
    this.assignProperty('closedHistorySize', value, (v) => Math.max(0, Math.floor(Number(v) || 0)));
  }
  get contextMenu(): boolean {
    return this.getProperty<boolean | undefined>('contextMenu') ?? true;
  }
  set contextMenu(value: Bind<boolean>) {
    this.assignProperty('contextMenu', value, Boolean);
  }
  get menuItems(): Partial<Record<TabMenuCommand, boolean>> {
    return this.getProperty<Partial<Record<TabMenuCommand, boolean>> | undefined>('menuItems') ?? {};
  }
  set menuItems(value: Bind<Partial<Record<TabMenuCommand, boolean>>>) {
    this.assignProperty('menuItems', value);
  }
  get newDocument(): TabNewDocument | null {
    return this.getProperty<TabNewDocument | null | undefined>('newDocument') ?? null;
  }
  set newDocument(value: TabNewDocument | null) {
    this.setProperty('newDocument', value);
  }
  get allowDuplicate(): boolean {
    return this.getProperty<boolean | undefined>('allowDuplicate') ?? false;
  }
  set allowDuplicate(value: Bind<boolean>) {
    this.assignProperty('allowDuplicate', value, Boolean);
  }
  get splitCopies(): boolean {
    return this.getProperty<boolean | undefined>('splitCopies') ?? true;
  }
  set splitCopies(value: Bind<boolean>) {
    this.assignProperty('splitCopies', value, Boolean);
  }
  get allowDrag(): boolean {
    return this.getProperty<boolean | undefined>('allowDrag') ?? true;
  }
  set allowDrag(value: Bind<boolean>) {
    this.assignProperty('allowDrag', value, Boolean);
  }
  get allowDragGroups(): boolean {
    return this.getProperty<boolean | undefined>('allowDragGroups') ?? true;
  }
  set allowDragGroups(value: Bind<boolean>) {
    this.assignProperty('allowDragGroups', value, Boolean);
  }
  get groupDragHandle(): boolean {
    return this.getProperty<boolean | undefined>('groupDragHandle') ?? false;
  }
  set groupDragHandle(value: Bind<boolean>) {
    this.assignProperty('groupDragHandle', value, Boolean);
  }
  get layoutEdgeDrop(): boolean {
    return this.getProperty<boolean | undefined>('layoutEdgeDrop') ?? true;
  }
  set layoutEdgeDrop(value: Bind<boolean>) {
    this.assignProperty('layoutEdgeDrop', value, Boolean);
  }
  get layoutEdgeSize(): number {
    return this.getProperty<number | undefined>('layoutEdgeSize') ?? 16;
  }
  set layoutEdgeSize(value: Bind<number>) {
    this.assignProperty('layoutEdgeSize', value, (v) => Math.max(0, Number(v) || 0));
  }
  get dragThreshold(): number {
    return this.getProperty<number | undefined>('dragThreshold') ?? 5;
  }
  set dragThreshold(value: Bind<number>) {
    this.assignProperty('dragThreshold', value, (v) => Math.max(0, Number(v) || 0));
  }
  get longPressDelay(): number {
    return this.getProperty<number | undefined>('longPressDelay') ?? 500;
  }
  set longPressDelay(value: Bind<number>) {
    this.assignProperty('longPressDelay', value, (v) => Math.max(0, Number(v) || 0));
  }
  get dragHoverActivate(): boolean {
    return this.getProperty<boolean | undefined>('dragHoverActivate') ?? true;
  }
  set dragHoverActivate(value: Bind<boolean>) {
    this.assignProperty('dragHoverActivate', value, Boolean);
  }
  get dragHoverDelay(): number {
    return this.getProperty<number | undefined>('dragHoverDelay') ?? 750;
  }
  set dragHoverDelay(value: Bind<number>) {
    this.assignProperty('dragHoverDelay', value, (v) => Math.max(0, Number(v) || 0));
  }
  get pinOnDrag(): boolean {
    return this.getProperty<boolean | undefined>('pinOnDrag') ?? true;
  }
  set pinOnDrag(value: Bind<boolean>) {
    this.assignProperty('pinOnDrag', value, Boolean);
  }
  get dragGhost(): boolean {
    return this.getProperty<boolean | undefined>('dragGhost') ?? true;
  }
  set dragGhost(value: Bind<boolean>) {
    this.assignProperty('dragGhost', value, Boolean);
  }
  get dragAutoScroll(): boolean {
    return this.getProperty<boolean | undefined>('dragAutoScroll') ?? true;
  }
  set dragAutoScroll(value: Bind<boolean>) {
    this.assignProperty('dragAutoScroll', value, Boolean);
  }
  get allowFloat(): boolean {
    return this.getProperty<boolean | undefined>('allowFloat') ?? true;
  }
  set allowFloat(value: Bind<boolean>) {
    this.assignProperty('allowFloat', value, Boolean);
  }
  get allowDock(): boolean {
    return this.getProperty<boolean | undefined>('allowDock') ?? true;
  }
  set allowDock(value: Bind<boolean>) {
    this.assignProperty('allowDock', value, Boolean);
  }
  get dockSides(): readonly TabDockSide[] {
    return this.getProperty<readonly TabDockSide[] | undefined>('dockSides') ?? DOCK_SIDES;
  }
  set dockSides(value: Bind<readonly TabDockSide[]>) {
    this.assignProperty('dockSides', value);
  }
  get allowAutoHide(): boolean {
    return this.getProperty<boolean | undefined>('allowAutoHide') ?? true;
  }
  set allowAutoHide(value: Bind<boolean>) {
    this.assignProperty('allowAutoHide', value, Boolean);
  }
  get floatingWindowSize(): { width: number; height: number } | null {
    return this.getProperty<{ width: number; height: number } | null | undefined>('floatingWindowSize') ?? null;
  }
  set floatingWindowSize(value: Bind<{ width: number; height: number } | null>) {
    this.assignProperty('floatingWindowSize', value);
  }
  get keepFloatingInView(): boolean {
    return this.getProperty<boolean | undefined>('keepFloatingInView') ?? true;
  }
  set keepFloatingInView(value: Bind<boolean>) {
    this.assignProperty('keepFloatingInView', value, Boolean);
  }
  get closeEmptyWindows(): boolean {
    return this.getProperty<boolean | undefined>('closeEmptyWindows') ?? true;
  }
  set closeEmptyWindows(value: Bind<boolean>) {
    this.assignProperty('closeEmptyWindows', value, Boolean);
  }
  get dockOnDoubleClick(): boolean {
    return this.getProperty<boolean | undefined>('dockOnDoubleClick') ?? true;
  }
  set dockOnDoubleClick(value: Bind<boolean>) {
    this.assignProperty('dockOnDoubleClick', value, Boolean);
  }
  /** The size a new dock area of each side starts with: pixels, or a share such as `'25%'`. */
  get dockAreaSize(): Readonly<Record<TabDockSide, number | string>> {
    return { ...AREA_SIZES, ...this.getProperty<Partial<Record<TabDockSide, number | string>> | undefined>('dockAreaSize') };
  }
  set dockAreaSize(value: Bind<Partial<Record<TabDockSide, number | string>>>) {
    this.assignProperty('dockAreaSize', value);
  }
  get dockAreaMinSize(): number {
    return this.getProperty<number | undefined>('dockAreaMinSize') ?? 120;
  }
  set dockAreaMinSize(value: Bind<number>) {
    this.assignProperty('dockAreaMinSize', value, (v) => Math.max(0, Number(v) || 0));
  }
  get autoHideHover(): boolean {
    return this.getProperty<boolean | undefined>('autoHideHover') ?? true;
  }
  set autoHideHover(value: Bind<boolean>) {
    this.assignProperty('autoHideHover', value, Boolean);
  }
  get autoHideDelay(): number {
    return this.getProperty<number | undefined>('autoHideDelay') ?? 500;
  }
  set autoHideDelay(value: Bind<number>) {
    this.assignProperty('autoHideDelay', value, (v) => Math.max(0, Number(v) || 0));
  }
  get dockGuides(): boolean {
    return this.getProperty<boolean | undefined>('dockGuides') ?? false;
  }
  set dockGuides(value: Bind<boolean>) {
    this.assignProperty('dockGuides', value, Boolean);
  }
  get dockGuideKinds(): readonly TabDockGuideKind[] {
    return this.getProperty<readonly TabDockGuideKind[] | undefined>('dockGuideKinds') ?? GUIDE_KINDS;
  }
  set dockGuideKinds(value: Bind<readonly TabDockGuideKind[]>) {
    this.assignProperty('dockGuideKinds', value);
  }
  get dropSides(): readonly TabDropSide[] {
    return this.getProperty<readonly TabDropSide[] | undefined>('dropSides') ?? ALL_SIDES;
  }
  set dropSides(value: Bind<readonly TabDropSide[]>) {
    this.assignProperty('dropSides', value);
  }
  get dropEdgeSize(): number | string {
    return this.getProperty<number | string | undefined>('dropEdgeSize') ?? '33%';
  }
  set dropEdgeSize(value: Bind<number | string>) {
    this.assignProperty('dropEdgeSize', value);
  }
  get copyModifier(): TabCopyModifier {
    return this.getProperty<TabCopyModifier | undefined>('copyModifier') ?? 'auto';
  }
  set copyModifier(value: Bind<TabCopyModifier>) {
    this.assignProperty('copyModifier', value);
  }
  get dragGroup(): string | null {
    return this.getProperty<string | null | undefined>('dragGroup') ?? null;
  }
  set dragGroup(value: Bind<string | null>) {
    this.assignProperty('dragGroup', value);
  }
  get keyPreset(): TabKeyPreset {
    return this.getProperty<TabKeyPreset | undefined>('keyPreset') ?? 'auto';
  }
  set keyPreset(value: Bind<TabKeyPreset>) {
    this.assignProperty('keyPreset', value);
  }
  /** The keys in use: the preset's with the `keys` prop over them. Reactive. */
  get keys(): TabDocumentKeys {
    const preset = this.keyPreset;
    const desktop = preset === 'desktop' || (preset === 'auto' && runsInstalled(this.element.ownerDocument.defaultView));
    return { ...(desktop ? DESKTOP_KEYS : BROWSER_KEYS), ...this.getProperty<Partial<TabDocumentKeys> | undefined>('keys') };
  }
  set keys(value: Bind<Partial<TabDocumentKeys>>) {
    this.assignProperty('keys', value);
  }
  get texts(): Partial<UiStrings> {
    return this.getProperty<Partial<UiStrings> | undefined>('texts') ?? {};
  }
  set texts(value: Bind<Partial<UiStrings>>) {
    this.assignProperty('texts', value);
  }
  get announce(): boolean {
    return this.getProperty<boolean | undefined>('announce') ?? true;
  }
  set announce(value: Bind<boolean>) {
    this.assignProperty('announce', value, Boolean);
  }
  get factory(): TabContentFactory | null {
    return this.getProperty<TabContentFactory | null | undefined>('factory') ?? null;
  }
  set factory(value: Bind<TabContentFactory | null>) {
    this.assignProperty('factory', functionValue(value));
  }

  /** The groups, in layout order (left to right, top to bottom). Reactive. */
  get groups(): readonly TabGroup[] {
    return this.getProperty<readonly TabGroup[] | undefined>('groups') ?? NO_GROUPS;
  }
  /** Every open document, group by group. Reactive. */
  get documents(): readonly TabDocument[] {
    return this.groups.flatMap((g) => g.documents);
  }
  /** The group that has focus, or had it last. Reactive. */
  get activeGroup(): TabGroup | null {
    return this.getProperty<TabGroup | null | undefined>('activeGroup') ?? null;
  }
  /** The active group's active document. Reactive. */
  get activeDocument(): TabDocument | null {
    return this.activeGroup?.activeDocument ?? null;
  }
  /** The maximized group, `null` when none is. Reactive. */
  get maximizedGroup(): TabGroup | null {
    return this.getProperty<TabGroup | null | undefined>('maximizedGroup') ?? null;
  }
  /** The open documents of every group, the one activated last first. Reactive. */
  get recentDocuments(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('recentDocuments') ?? NO_DOCUMENTS;
  }
  /** The closed documents `reopenClosed` can open again, the one closed last first. Reactive. */
  get closedDocuments(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('closedDocuments') ?? NO_DOCUMENTS;
  }
  /** Whether `goBack` has somewhere to go. Reactive. */
  get canGoBack(): boolean {
    return !!this.getProperty<boolean>('canGoBack');
  }
  /** Reactive. */
  get canGoForward(): boolean {
    return !!this.getProperty<boolean>('canGoForward');
  }
  /** What is being dragged now (or moved with "Move to…"), `null` when nothing is. Reactive. */
  get dragging(): TabDragSubject | null {
    return this.getProperty<TabDragSubject | null | undefined>('dragging') ?? null;
  }
  /** The floating windows, the one at the back first. Reactive. */
  get floatingWindows(): readonly TabWindow[] {
    return this.getProperty<readonly TabWindow[] | undefined>('floatingWindows') ?? NO_WINDOWS;
  }
  /** The dock areas, the outermost first. Reactive. */
  get dockAreas(): readonly TabDockArea[] {
    return this.getProperty<readonly TabDockArea[] | undefined>('dockAreas') ?? NO_AREAS;
  }
  /** The dock area of a side, `null` when nothing is docked there. Reactive. */
  dockArea(side: TabDockSide): TabDockArea | null {
    return this.dockAreas.find((a) => a.side === side) ?? null;
  }
  /** The drop targets, asked in order: the dock guides and floating first, the built-in one (strips, groups, the layout's edges) last. */
  get dropTargets(): readonly TabDropTarget[] {
    return this.parts.targets;
  }

  // Events.

  /** A document is about to open; cancelable, `group` and `index` may be changed. */
  get onOpening(): MotifEvent<DocumentOpeningEventArgs> {
    return this.parts.opening.event;
  }
  get onOpened(): MotifEvent<DocumentOpenedEventArgs> {
    return this.parts.opened.event;
  }
  /** A document is about to close; cancelable, or `e.promise` asks first. */
  get onClosing(): MotifEvent<DocumentClosingEventArgs> {
    return this.parts.closing.event;
  }
  get onClosed(): MotifEvent<DocumentClosedEventArgs> {
    return this.parts.closed_.event;
  }
  /** A tab is about to become its group's active one; cancelable. */
  get onDocumentActivating(): MotifEvent<DocumentActivatingEventArgs> {
    return this.parts.activating.event;
  }
  /** A group's active tab, or the active group, changed. */
  get onDocumentActivated(): MotifEvent<DocumentActivatedEventArgs> {
    return this.parts.activated.event;
  }
  /** A document is about to move; cancelable. */
  get onMoving(): MotifEvent<DocumentMovingEventArgs> {
    return this.parts.moving.event;
  }
  get onMoved(): MotifEvent<DocumentMovedEventArgs> {
    return this.parts.moved.event;
  }
  /** A group is about to be split; cancelable. */
  get onSplitting(): MotifEvent<GroupSplittingEventArgs> {
    return this.parts.splitting.event;
  }
  get onSplit(): MotifEvent<GroupSplitEventArgs> {
    return this.parts.split.event;
  }
  /** A group is about to close, be resized, maximized or restored, or a layout to load; cancelable. */
  get onLayoutChanging(): MotifEvent<LayoutChangingEventArgs> {
    return this.parts.layoutChanging.event;
  }
  /** Groups were added, closed, resized, maximized or restored. */
  get onLayoutChanged(): MotifEvent<LayoutChangedEventArgs> {
    return this.parts.layoutChanged.event;
  }
  /** A preview tab is about to be kept open; cancelable. */
  get onKeeping(): MotifEvent<DocumentChangingEventArgs> {
    return this.parts.keeping.event;
  }
  get onKept(): MotifEvent<DocumentChangedEventArgs> {
    return this.parts.kept.event;
  }
  /** A document is about to be pinned; cancelable. */
  get onPinning(): MotifEvent<DocumentChangingEventArgs> {
    return this.parts.pinning.event;
  }
  get onPinned(): MotifEvent<DocumentChangedEventArgs> {
    return this.parts.pinned.event;
  }
  /** A document is about to be unpinned; cancelable. */
  get onUnpinning(): MotifEvent<DocumentChangingEventArgs> {
    return this.parts.unpinning.event;
  }
  get onUnpinned(): MotifEvent<DocumentChangedEventArgs> {
    return this.parts.unpinned.event;
  }
  /** A group is about to be locked; cancelable. */
  get onLocking(): MotifEvent<GroupLockingEventArgs> {
    return this.parts.locking.event;
  }
  get onLocked(): MotifEvent<GroupLockedEventArgs> {
    return this.parts.locked.event;
  }
  /** A group is about to be unlocked; cancelable. */
  get onUnlocking(): MotifEvent<GroupLockingEventArgs> {
    return this.parts.unlocking.event;
  }
  get onUnlocked(): MotifEvent<GroupLockedEventArgs> {
    return this.parts.unlocked.event;
  }
  /** The context menu of a tab or of the empty strip is about to open; change `items`, or cancel. */
  get onContextMenuOpening(): MotifEvent<TabContextMenuEventArgs> {
    return this.parts.menuOpening.event;
  }
  /** A tab or a group is about to be dragged, or moved with "Move to…"; cancelable. */
  get onDragStarting(): MotifEvent<TabDragStartingEventArgs> {
    return this.parts.dragStarting.event;
  }
  /** The drag is over a place: change the place, or `cancel` to refuse it. Outside every manager it comes refused. */
  get onDragOver(): MotifEvent<TabDropEventArgs> {
    return this.parts.dragOver.event;
  }
  /** The drag is about to drop; change the place, or cancel to keep everything where it is. */
  get onDropping(): MotifEvent<TabDropEventArgs> {
    return this.parts.dropping.event;
  }
  /** A drop was made (after the `moved`, `split`… events of what it did). */
  get onDropped(): MotifEvent<TabDroppedEventArgs> {
    return this.parts.dropped.event;
  }
  /** A drag is over, dropped or not. */
  get onDragEnded(): MotifEvent<TabDragEndedEventArgs> {
    return this.parts.dragEnded.event;
  }

  /** A document or a group is about to float in a window; `rect` may be changed; cancelable. */
  get onFloating(): MotifEvent<TabFloatingEventArgs> {
    return this.parts.floating.event;
  }
  get onFloated(): MotifEvent<TabFloatedEventArgs> {
    return this.parts.floated.event;
  }
  /** A document, a group or a window is about to be docked; `side` and `size` may be changed; cancelable. */
  get onDocking(): MotifEvent<TabDockingEventArgs> {
    return this.parts.docking.event;
  }
  get onDocked(): MotifEvent<TabDockedEventArgs> {
    return this.parts.docked.event;
  }
  /** A dock area is about to fold to its edge (`on`) or come back; cancelable. */
  get onAutoHiding(): MotifEvent<TabAutoHidingEventArgs> {
    return this.parts.autoHiding.event;
  }
  get onAutoHidden(): MotifEvent<TabAutoHiddenEventArgs> {
    return this.parts.autoHidden.event;
  }
  /** A folded dock area is about to slide out (`open`) or back; cancelable. */
  get onSlideChanging(): MotifEvent<TabSlideEventArgs> {
    return this.parts.slideChanging.event;
  }
  get onSlideChanged(): MotifEvent<TabSlideEventArgs> {
    return this.parts.slideChanged.event;
  }
  /** A floating window is about to close with its documents; cancelable. */
  get onWindowClosing(): MotifEvent<TabWindowClosingEventArgs> {
    return this.parts.windowClosing.event;
  }
  /** A floating window is gone: closed, docked, or left empty. */
  get onWindowClosed(): MotifEvent<TabWindowClosedEventArgs> {
    return this.parts.windowClosed.event;
  }

  // Documents.

  /**
   * Opens a document (or makes one from options) in a group: the active one by default, never a
   * locked one. A document that is already open is activated, or copied into the group when it may
   * be open twice (`allowDuplicate`). A preview replaces the group's preview tab. Returns `null`
   * when `onOpening` cancels.
   */
  open(document: TabDocument | TabDocumentOptions, options: TabOpenOptions = {}): TabDocument | null {
    return untracked(() => this.openDocument(document, options, false));
  }

  /** Closes a document as its close button does; resolves `false` when it stays open. */
  close(document: TabDocument): Promise<boolean> {
    return untracked(() => this.closeDocument(document, false));
  }

  /**
   * Closes the documents of a group, or of every group; resolves `false` when some stay open.
   * Pinned documents stay while `keepPinned` is on, unless `pinned` is `true`.
   */
  closeAll(group?: TabGroup, pinned?: boolean): Promise<boolean> {
    return this.closeMany(untracked(() => [...(group ? group.documents : this.documents)]), pinned, false);
  }

  /** Closes the other documents of the document's group. */
  closeOthers(document: TabDocument): Promise<boolean> {
    return this.closeMany(untracked(() => (document.group?.documents ?? []).filter((d) => d !== document)), undefined, false);
  }

  /** Closes the documents after (or before) this one in its group. */
  closeToRight(document: TabDocument): Promise<boolean> {
    return this.closeMany(untracked(() => this.sideOf(document, 1)), undefined, false);
  }

  closeToLeft(document: TabDocument): Promise<boolean> {
    return this.closeMany(untracked(() => this.sideOf(document, -1)), undefined, false);
  }

  /** Closes the documents of a group (or of every group) that have no unsaved changes. */
  closeSaved(group?: TabGroup): Promise<boolean> {
    return this.closeMany(untracked(() => (group ? group.documents : this.documents).filter((d) => !d.dirty)), undefined, false);
  }

  /** Makes a document its group's active one, and its group the active group. */
  activate(document: TabDocument, focus = false): boolean {
    return untracked(() => {
      if (document.manager === this && document.dockArea?.autoHidden && this.parts.slide?.area !== document.dockArea) this.slideOut(document, false, false);
      return this.activateDocument(document, focus, false);
    });
  }

  /** Activates the next tab of a group (the active group by default), around the end. */
  activateNext(group?: TabGroup | null, focus = false): boolean {
    return untracked(() => this.step(group ?? this.activeGroup, 1, focus, false));
  }

  activatePrevious(group?: TabGroup | null, focus = false): boolean {
    return untracked(() => this.step(group ?? this.activeGroup, -1, focus, false));
  }

  /** Moves a document to `index` of `group` (another group, or its own). Pinned documents stay before the others. */
  move(document: TabDocument, group: TabGroup, index?: number): boolean {
    return untracked(() => this.moveDocument(document, group, index, false));
  }

  /**
   * Moves a document to the next or previous group, or to the group on that side of its own; its
   * group splits that way when there is none.
   */
  moveToGroup(document: TabDocument, which: 'next' | 'previous' | SplitDirection): boolean {
    return untracked(() => this.moveToGroupBy(document, which, false));
  }

  /** Moves a document a place along its strip (`-1` towards the start), not past the pinned or the other tabs. */
  moveInGroup(document: TabDocument, by: number): boolean {
    return untracked(() => this.moveInGroupBy(document, by, false));
  }

  /** Makes a preview tab stay open. */
  keep(document: TabDocument): boolean {
    return untracked(() => this.keepBy(document, false));
  }

  /** Pins a document: its tab goes to the end of the pinned ones, at the start of the strip. */
  pin(document: TabDocument): boolean {
    return untracked(() => this.pinBy(document, true, false));
  }

  /** Unpins a document: its tab becomes the first of the others. */
  unpin(document: TabDocument): boolean {
    return untracked(() => this.pinBy(document, false, false));
  }

  /** Opens the document closed last again, where it was. `null` when there is none to open. */
  reopenClosed(): TabDocument | null {
    return untracked(() => this.reopenBy(false));
  }

  /** Activates the document activated before the current one, in whatever group. */
  goBack(): boolean {
    return untracked(() => this.travel(-1, false));
  }

  goForward(): boolean {
    return untracked(() => this.travel(1, false));
  }

  /** Makes a new document with `newDocument` and opens it in a group (the active one by default). */
  openNew(group?: TabGroup): TabDocument | null {
    return untracked(() => this.openNewBy(group ?? this.activeGroup, false));
  }

  /** Copies a document's title to the clipboard. */
  async copyTitle(document: TabDocument): Promise<boolean> {
    const clipboard = this.element.ownerDocument.defaultView?.navigator.clipboard;
    if (!clipboard) return false;
    try {
      await clipboard.writeText(untracked(() => document.title));
      return true;
    } catch {
      return false;
    }
  }

  findDocument(id: string): TabDocument | null {
    return untracked(() => this.documents.find((d) => d.id === id && !d.original) ?? this.documents.find((d) => d.id === id) ?? null);
  }

  /** The content made for a document, `null` while it is not built. */
  contentOf(document: TabDocument): ComponentBase | null {
    return this.parts.tabs.get(document)?.contentComponent ?? null;
  }

  // Groups.

  /**
   * Opens a new group beside `group`, or along that edge of the whole layout when `group` is `null`;
   * `document` moves into it, or a copy of it opens there when it may be open twice and `splitCopies`
   * is on. Returns the new group, `null` when `onSplitting` cancels.
   */
  split(group: TabGroup | null, direction: SplitDirection, document?: TabDocument): TabGroup | null {
    return untracked(() => this.splitGroup(group, direction, document ?? null, false));
  }

  /**
   * Moves a whole group with its documents: beside another group (`left`, `right`, `up`, `down`),
   * into it (`center`: its documents join that group), or along an edge of the layout (`target`
   * `null`). Nothing is made again.
   */
  moveGroup(group: TabGroup, target: TabGroup | null, side: TabDropSide): boolean {
    return untracked(() => this.moveGroupBy(group, target, side, false));
  }

  /** Closes the documents of a group, then the group (the last group stays, empty). */
  closeGroup(group: TabGroup): Promise<boolean> {
    return untracked(() => this.closeGroupBy(group, false));
  }

  /** Makes a group (or the n-th one, from 0) active and focuses what had focus in it last. */
  focusGroup(group: TabGroup | number): boolean {
    return untracked(() => {
      const target = typeof group === 'number' ? this.groups[group] : group;
      if (!target || !this.groups.includes(target)) return false;
      this.useGroup(target, false);
      if (target.restoreFocus()) return true;
      target.activeTab?.header.focus();
      return !!target.activeTab;
    });
  }

  /** Locks a group: documents opened without naming a group go elsewhere. */
  lock(group: TabGroup): boolean {
    return untracked(() => this.lockBy(group, true, false));
  }

  unlock(group: TabGroup): boolean {
    return untracked(() => this.lockBy(group, false, false));
  }

  /** Gives a group all the room; the others stay as they are, out of sight. */
  maximizeGroup(group: TabGroup): boolean {
    return untracked(() => this.maximizeBy(group, false));
  }

  /** Shows every group again after `maximizeGroup`. */
  restoreGroups(): boolean {
    return untracked(() => this.restoreBy(false));
  }

  /** Gives every group of every split the same size. */
  evenSizes(): boolean {
    return untracked(() => this.evenSizesBy(null, false));
  }

  /** Sets a group's size along its split: pixels, or a share such as `'30%'`. The neighbour after it (before it, for the last) gives or takes the room. */
  resizeGroup(group: TabGroup, size: number | string): boolean {
    return untracked(() => {
      const split = group.parentSplit;
      if (!split || !this.layoutChanging('resize', group, false)) return false;
      const i = split.children.indexOf(group);
      const next = i + 1 < split.children.length;
      if (typeof size === 'string' && size.trim().endsWith('%')) {
        const j = next ? i + 1 : i - 1;
        const pair = split.sizes[i] + split.sizes[j];
        const share = Math.min(Math.max(parseFloat(size) / 100, 0), pair);
        split.sizes[i] = share;
        split.sizes[j] = pair - share;
        split.render();
      } else {
        const room = split.room();
        const delta = Number(size) - split.sizes[i] * room;
        if (!room || !split.resizeBy(next ? i : i - 1, next ? delta : -delta)) return false;
      }
      this.layoutChanged('resize', group, false);
      return true;
    });
  }

  // Drag and drop.

  /**
   * "Move to…": the keys choose where a document (or a whole group) goes, with the drop areas of a
   * drag shown and each place announced; Enter moves it there, Escape leaves it.
   */
  showMoveTo(target: TabDocument | TabGroup): boolean {
    return untracked(() => {
      const keys = this.parts.moveKeys;
      if (!keys || keys.isOn || this.dragging || !this.isEnabled) return false;
      let subject: TabDragSubject | null = null;
      if (target instanceof TabGroup) {
        if (this.groups.includes(target) && this.allowDragGroups) subject = { document: null, group: target, manager: this, copy: false };
      } else if (target.manager === this && target.group && this.mayDrag(target)) {
        subject = { document: target, group: target.group, manager: this, copy: false };
      }
      const tab = subject?.document ? this.parts.tabs.get(subject.document) : null;
      return !!subject && keys.start(subject, tab?.header ?? null);
    });
  }

  /** Stops a drag or "Move to…" under way; everything goes back where it was. */
  cancelDrag(): boolean {
    return untracked(() => {
      const parts = this.parts;
      if (parts.moveKeys?.isOn) {
        parts.moveKeys.end(false);
        return true;
      }
      if (!parts.drag?.subject) return false;
      parts.drag.cancel();
      return true;
    });
  }

  /** Adds a drop target, asked before the built-in one (at `index` of `dropTargets`). Returns the function that removes it. */
  addDropTarget(target: TabDropTarget, index = 0): () => void {
    const list = this.parts.targets;
    list.splice(Math.max(0, Math.min(index, list.length - 1)), 0, target);
    return () => {
      const at = list.indexOf(target);
      if (at >= 0 && target !== this.parts.layoutTarget && target !== this.parts.dockTarget) list.splice(at, 1);
    };
  }

  // Floating windows and dock areas.

  /**
   * Moves a document, or a whole group, into a floating window of its own at `rect` (by default
   * the size of the group it comes from, beside it). Returns the window, `null` when it may not
   * float or `onFloating` cancels.
   */
  float(target: TabDocument | TabGroup, rect?: TabRect): TabWindow | null {
    return untracked(() => {
      const doc = target instanceof TabDocument ? target : null;
      const group = doc ? doc.group : (target as TabGroup);
      if (!group || (doc && doc.manager !== this)) return null;
      return this.floatBy(doc, group, rect ?? null, false);
    });
  }

  /**
   * Docks a document, a group or a whole floating window into the dock area of `side` (made at
   * `size`, else `dockAreaSize`, when there is none), or, without a side, puts it back where it was
   * docked before it floated. A document not open yet opens there.
   */
  dock(target: TabDocument | TabGroup | TabWindow, side?: TabDockSide | null, size?: number | string): boolean {
    return untracked(() => this.dockBy(target, side ?? null, size ?? null, false));
  }

  /** Folds a dock area (or a document's) to the manager's edge, where only its tab titles stay; `false` brings it back. */
  autoHide(target: TabDockArea | TabDocument, on = true): boolean {
    return untracked(() => {
      const area = target instanceof TabDockArea ? target : target.dockArea;
      return !!area && area.manager === this && this.autoHideBy(area, on, false);
    });
  }

  /** Slides a folded dock area out over the documents, with `document` shown. */
  showAutoHidden(document: TabDocument): boolean {
    return untracked(() => this.slideOut(document, false, false));
  }

  /** Slides the folded area that is out back to its edge. */
  hideAutoHidden(): boolean {
    return untracked(() => this.slideBack(false));
  }

  /** Moves a floating window: `x` from the left of the viewport, `y` from the top. */
  moveWindow(window: TabWindow, x: number, y: number): boolean {
    return untracked(() => {
      if (!this.parts.windows.includes(window) || !this.windowChanging('moveWindow', window, false)) return false;
      const r = window.rect;
      window.place({ ...r, x, y });
      this.keepWindowInView(window);
      this.windowChanged('moveWindow', window, false);
      return true;
    });
  }

  resizeWindow(window: TabWindow, width: number, height: number): boolean {
    return untracked(() => {
      if (!this.parts.windows.includes(window) || !this.windowChanging('resizeWindow', window, false)) return false;
      const min = window.minSize();
      window.place({ ...window.rect, width: Math.max(min.w, width), height: Math.max(min.h, height) });
      this.keepWindowInView(window);
      this.windowChanged('resizeWindow', window, false);
      return true;
    });
  }

  /** Gives a floating window the whole page; `restoreWindow` gives it its place back. */
  maximizeWindow(window: TabWindow): boolean {
    return untracked(() => this.maximizeWindowBy(window, true, false));
  }

  restoreWindow(window: TabWindow): boolean {
    return untracked(() => this.maximizeWindowBy(window, false, false));
  }

  /** Closes a floating window with its documents (each one asks through `onClosing`); resolves `false` when one stays open. */
  closeWindow(window: TabWindow): Promise<boolean> {
    return untracked(() => this.closeWindowBy(window, false));
  }

  /** Brings a floating window to the front and focuses what had focus in it last. */
  focusWindow(window: TabWindow): boolean {
    return untracked(() => {
      if (!this.parts.windows.includes(window)) return false;
      window.bringToFront();
      const group = this.parts.recentGroups.find((g) => g.window === window) ?? this.hostGroups(window)[0];
      return !!group && this.focusGroup(group);
    });
  }

  /** Sets a dock area's size: pixels, or a share of the manager such as `'25%'`. */
  resizeDockArea(area: TabDockArea, size: number | string, byUser = false): boolean {
    return untracked(() => {
      if (!this.parts.areas.has(area.side) || this.parts.areas.get(area.side) !== area) return false;
      if (!this.layoutChanging('resizeArea', null, byUser, null, area)) return false;
      area.setSize(size);
      this.renderDock();
      this.layoutChanged('resizeArea', null, byUser, null, area);
      return true;
    });
  }

  /** Moves focus to the next part (`-1`: the previous one): the documents, each dock area that is not folded, each floating window. */
  focusPart(by: 1 | -1 = 1): boolean {
    return untracked(() => this.focusPartBy(by));
  }

  // Lists.

  /** Opens a group's list of open documents (its "…" button): searchable, with commands under it. */
  showOpenList(group?: TabGroup | null): boolean {
    return untracked(() => {
      const target = group ?? this.activeGroup;
      if (!target) return false;
      const all = this.openListScope === 'all';
      const docs = all ? this.documents : target.documents;
      const list = (this.parts.openList ??= new DocumentList(this, 'open'));
      const anchor = target.moreButton ?? target.listElement.parentElement!;
      const commands: MenuItem[] = [
        { text: this.textOf('tabDocsCloseAll'), click: () => void this.closeMany([...target.documents], undefined, true) },
        { text: this.textOf('tabDocsCloseSaved'), click: () => void this.closeMany(target.documents.filter((d) => !d.dirty), undefined, true) },
        {
          text: this.textOf(target.locked ? 'tabDocsUnlock' : 'tabDocsLock'),
          beginGroup: true,
          click: () => this.lockBy(target, !target.locked, true),
        },
      ];
      list.open(anchor, docs, Math.max(0, docs.indexOf(target.activeDocument!)), commands);
      return true;
    });
  }

  /** Opens the list of recently used documents with the next one (or the last one, `-1`) highlighted. */
  showRecentList(by: 1 | -1 = 1, event: KeyboardEvent | null = null): boolean {
    return untracked(() => {
      const group = this.activeGroup;
      if (!group) return false;
      const used = this.recentDocuments;
      const docs = this.recentListScope === 'all' ? [...used, ...this.documents.filter((d) => !used.includes(d))] : group.recentDocuments;
      if (!docs.length) return false;
      const list = (this.parts.recentList ??= new DocumentList(this, 'recent'));
      const start = docs.length < 2 ? 0 : by === 1 ? 1 : docs.length - 1;
      list.open(group.listElement.parentElement!, docs, start, [], event);
      return true;
    });
  }

  // Layout as JSON.

  /** The layout as plain JSON: the tree of splits and groups, each document's `id`, `type`, `title`, `state` and flags. */
  saveLayout(): TabLayout {
    return untracked(() => {
      const groups = this.groups;
      const layout: TabLayout = {
        version: 2,
        root: this.writeNode(this.parts.root!),
        activeGroup: Math.max(0, groups.indexOf(this.activeGroup!)),
        maximizedGroup: this.parts.maximized ? groups.indexOf(this.parts.maximized) : null,
      };
      const areas = this.orderedAreas().filter((a) => a.root);
      if (areas.length) {
        layout.areas = areas.map((a) => {
          const saved: TabLayoutArea = { side: a.side, size: a.size, root: this.writeNode(a.root!) };
          if (a.autoHidden) saved.autoHide = true;
          return saved;
        });
      }
      const windows = this.floatingWindows.filter((w) => w.root);
      if (windows.length) {
        layout.windows = windows.map((w) => {
          const saved: TabLayoutWindow = { rect: { ...w.rect }, root: this.writeNode(w.root!) };
          if (w.isMaximized) saved.maximized = true;
          const back = w.lastDock.group ? groups.indexOf(w.lastDock.group) : -1;
          if (w.lastDock.side || back >= 0) saved.dock = { side: w.lastDock.side, group: back >= 0 ? back : null };
          return saved;
        });
      }
      return layout;
    });
  }

  /**
   * Puts a saved layout back in place of the current one, whose documents close without asking.
   * `factory` makes each document again (by its `type`); without it a document is made from what
   * was saved and its content comes from the manager's `factory`. A document saved twice comes
   * back as a copy of the first one.
   */
  loadLayout(layout: TabLayout, factory?: TabLayoutFactory): boolean {
    return untracked(() => {
      if (!layout?.root || !this.layoutChanging('load', null, false)) return false;
      const parts = this.parts;
      if (parts.maximized) this.unmaximize();
      this.stopSlide();
      for (const [doc, tab] of parts.tabs) {
        doc.placeIn(null, null);
        tab.dispose();
      }
      parts.tabs.clear();
      const old = parts.root;
      const oldGroups = [...this.groups];
      const oldAreas = [...parts.areas.values()];
      const oldWindows = [...parts.windows];
      parts.areas.clear();
      parts.order = [];
      parts.windows = [];
      const made = new Map<string, TabDocument>();
      const root = this.readNode(layout.root, factory, made);
      if (old) placeNode(this.element, root.element, old.element);
      this.setRoot(root);
      this.disposeSplits(old);
      for (const saved of layout.areas ?? []) {
        if (!saved?.root || !DOCK_SIDES.includes(saved.side) || parts.areas.has(saved.side)) continue;
        const area = this.createArea(saved.side, saved.size ?? this.dockAreaSize[saved.side]);
        this.setHostRoot(area, this.readNode(saved.root, factory, made));
        if (saved.autoHide) area.markFolded(true);
      }
      const windows: [TabWindow, TabLayoutWindow][] = [];
      for (const saved of layout.windows ?? []) {
        if (!saved?.root) continue;
        const w = this.createWindow(saved.rect ?? this.floatRect(null, null));
        this.setHostRoot(w, this.readNode(saved.root, factory, made));
        if (saved.maximized) w.markMaximized(true);
        windows.push([w, saved]);
      }
      for (const area of oldAreas) {
        this.disposeSplits(area.root);
        area.strip?.dispose();
        area.dispose();
      }
      for (const w of oldWindows) {
        this.disposeSplits(w.root);
        w.dispose();
      }
      for (const group of oldGroups) this.controls.remove(group);
      parts.recentGroups = [];
      parts.history = [];
      parts.at = -1;
      parts.closed = [];
      this.renderHistory();
      this.setProperty('activeGroup', null);
      this.renderTree();
      this.renderLists();
      const groups = this.groups;
      for (const [w, saved] of windows) {
        const side = saved.dock?.side;
        w.lastDock = { side: side && DOCK_SIDES.includes(side) ? side : null, group: groups[saved.dock?.group ?? -1] ?? null };
      }
      this.useGroup(groups[layout.activeGroup] ?? groups[0], false);
      const maximized = layout.maximizedGroup === null ? undefined : groups[layout.maximizedGroup];
      if (maximized) this.maximizeBy(maximized, false, true);
      this.layoutChanged('load', null, false);
      return true;
    });
  }

  override focus(): boolean {
    const group = this.activeGroup;
    return !!group && this.focusGroup(group);
  }

  protected override get focusElement(): HTMLElement {
    const parts = (this as unknown as { [PARTS]?: Parts })[PARTS];
    const group = parts?.recentGroups[0];
    return group?.activeTab?.header ?? this.element;
  }

  // Called by the groups, tabs, lists and menus.

  /** @internal A text for this manager: `texts` first, then `uiLocale`. Reactive. */
  textOf(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const t = this.texts[key] ?? uiLocale.strings[key];
    return values ? fillTemplate(t, values) : t;
  }

  /** @internal The key that closes a focused tab, as `aria-keyshortcuts` writes it. Reactive. */
  closeKeyHint(): string | null {
    const chord = this.keys.closeFocusedTab[0];
    return chord ? chord.replace(/\bCtrl\b/gi, 'Control') : null;
  }

  /** @internal Whether a tab shows its document's description now. Reactive. */
  showsDescription(document: TabDocument): boolean {
    const mode = this.showDescription;
    if (mode !== 'duplicates') return mode === 'always';
    const title = document.title;
    const root = document.original ?? document;
    return this.documents.some((d) => (d.original ?? d) !== root && d.title === title);
  }

  /** @internal Makes the content of a document. */
  makeContent(document: TabDocument): ComponentBase | null {
    const source = document.content;
    if (typeof source === 'function') return source(document) ?? null;
    if (source) return source;
    return this.factory?.(document) ?? null;
  }

  /** @internal Whether the content can be made again after it was let go. */
  canRemake(document: TabDocument): boolean {
    return typeof document.content === 'function' || (!document.content && !!this.factory);
  }

  /** @internal A tab's title, icon or close button changed: keep the active tab in sight. */
  tabChanged(tab: DocumentTab): void {
    const group = tab.group;
    if (group?.activeTab) group.reveal(group.activeTab);
    group?.queueOverflow();
  }

  /** @internal A tab's document was pinned or unpinned: its tab moves to its side of the strip. */
  pinChanged(tab: DocumentTab): void {
    const group = tab.group;
    if (!group) return;
    group.arrange();
    group.reveal(tab);
  }

  /** @internal A preview document got unsaved changes: it stays. */
  keepByChange(document: TabDocument): void {
    queueMicrotask(() => untracked(() => document.preview && this.keepBy(document, false)));
  }

  /** @internal Focus came into a group. */
  groupFocused(group: TabGroup): void {
    untracked(() => this.useGroup(group, true));
  }

  /** @internal */
  activateByUser(document: TabDocument): void {
    untracked(() => this.activateDocument(document, false, true));
  }

  /** @internal A document chosen in a list: activated and focused. */
  activateFromList(document: TabDocument): void {
    if (document.manager === this) this.activateDocument(document, true, true);
  }

  /** @internal */
  closeByUser(document: TabDocument): Promise<boolean> {
    return untracked(() => this.closeDocument(document, true));
  }

  /** @internal */
  unpinByUser(document: TabDocument): void {
    untracked(() => this.pinBy(document, false, true));
  }

  /** @internal */
  unlockByUser(group: TabGroup): void {
    untracked(() => this.lockBy(group, false, true));
  }

  /** @internal The split button and key: the active document goes along when it is not the group's only one, or a copy of it. */
  splitByUser(group: TabGroup, direction: SplitDirection): void {
    untracked(() => {
      const active = group.activeDocument;
      const doc = active && (group.documents.length > 1 || this.copiesOnSplit(active)) ? active : null;
      const made = this.splitGroup(group, direction, doc, true);
      if (made) this.focusGroup(made);
    });
  }

  /** @internal */
  toggleMaximizeByUser(group: TabGroup): void {
    untracked(() => (this.parts.maximized === group ? this.restoreBy(true) : this.maximizeBy(group, true)));
  }

  /** @internal A double click keeps a preview tab, else maximizes its group or restores the groups. */
  tabDoubleClicked(group: TabGroup, document: TabDocument): void {
    untracked(() => {
      if (document.preview) this.keepBy(document, true);
      else if (this.maximizeOnDoubleClick) this.toggleMaximizeByUser(group);
    });
  }

  /** @internal A double click on the empty strip makes a new document there; in a floating window it docks the window back. */
  stripDoubleClicked(group: TabGroup): void {
    untracked(() => {
      const w = group.window;
      if (w && this.dockOnDoubleClick) this.dockBy(w, null, null, true);
      else this.openNewBy(group, true);
    });
  }

  /** @internal */
  contextMenuOpening(e: TabContextMenuEventArgs): void {
    this.parts.menuOpening.fire(e);
  }

  /** @internal */
  get dropMarks(): DropMarks {
    return this.parts.marks;
  }

  /** @internal */
  get layoutTarget(): LayoutDropTarget {
    return this.parts.layoutTarget!;
  }

  /** @internal */
  get dockDropTarget(): DockDropTarget {
    return this.parts.dockTarget!;
  }

  /** @internal The top of the layout tree. */
  get rootItem(): LayoutItem | null {
    return this.parts.root;
  }

  /** @internal This manager and the others of its `dragGroup` on the same page: where its drags may drop. */
  dragPeers(): TabDocumentManager[] {
    const name = untracked(() => this.dragGroup);
    if (!name) return [this];
    const page = this.element.ownerDocument;
    const others = [...MANAGERS].filter((m) => m !== this && !m.isDisposed && m.element.isConnected && m.element.ownerDocument === page && untracked(() => m.dragGroup) === name);
    return [this, ...others];
  }

  /** @internal Whether a manager outside this one's `dragGroup` (or one of its windows) is under a point: a drop there is refused, it does not float. */
  foreignAt(x: number, y: number): boolean {
    const page = this.element.ownerDocument;
    const peers = this.dragPeers();
    return [...MANAGERS].some(
      (m) =>
        !peers.includes(m) &&
        !m.isDisposed &&
        m.element.isConnected &&
        m.element.ownerDocument === page &&
        (contains(m.element.getBoundingClientRect(), x, y) || m.parts.windows.some((w) => contains(w.element.getBoundingClientRect(), x, y))),
    );
  }

  /** @internal Whether the user may drag a document: its own `allowDrag`, else the manager's. */
  mayDrag(document: TabDocument): boolean {
    return untracked(() => this.isEnabled && (document.allowDrag ?? this.allowDrag));
  }

  /** @internal Whether a drop with the copy key may open a copy of the document. */
  mayCopyDocument(document: TabDocument | null): boolean {
    return !!document && untracked(() => this.mayCopy(document));
  }

  /** @internal Where a document dropped into a group (not among its tabs) goes. */
  insertIndexFor(group: TabGroup): number {
    return untracked(() => this.insertIndex(group));
  }

  /** @internal */
  dragStarting(e: TabDragStartingEventArgs): void {
    this.parts.dragStarting.fire(e);
  }

  /** @internal */
  dragStarted(subject: TabDragSubject): void {
    this.setProperty('dragging', subject);
  }

  /** @internal */
  dragOver(e: TabDropEventArgs): void {
    this.parts.dragOver.fire(e);
  }

  /** @internal */
  dropping(e: TabDropEventArgs): void {
    this.parts.dropping.fire(e);
  }

  /** @internal The drop was made: `onDropped`, with where it ended up. */
  dropped(place: TabDropPlace, subject: TabDragSubject, byKeyboard: boolean): void {
    const owner = place.manager ?? this;
    const result = owner.parts.dropResult;
    owner.parts.dropResult = null;
    const doc = result ? result.document : subject.document;
    const group = result?.group ?? place.group;
    const index = doc && group ? group.documents.indexOf(doc) : place.index;
    this.parts.dropped.fire({ ...place, group, index, document: doc, from: subject.group, copy: subject.copy, byKeyboard, source: this });
  }

  /** @internal */
  dragEnded(e: TabDragEndedEventArgs): void {
    this.setProperty('dragging', null);
    this.parts.dragEnded.fire(e);
  }

  /** @internal */
  announceCanceled(): void {
    this.say('tabDocsDragCanceled');
  }

  /** @internal Resting on a tab while dragging activates it. */
  activateFromDrag(document: TabDocument): void {
    untracked(() => this.activateDocument(document, false, true));
  }

  /** @internal A canceled drag gives the active group back. */
  useGroupFromDrag(group: TabGroup): void {
    untracked(() => this.groups.includes(group) && this.useGroup(group, true));
  }

  /** @internal A long press let go without moving: the tab's menu at that point. */
  openContextMenuAt(source: HTMLElement, x: number, y: number): void {
    this.parts.menus?.menu.open({ x, y }, source);
  }

  /** @internal The group next to `group` on that side, `null` when it is at that edge of the layout. */
  neighbourOf(group: TabGroup, direction: SplitDirection): TabGroup | null {
    const orientation = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
    const step = direction === 'right' || direction === 'down' ? 1 : -1;
    for (let node: LayoutItem = group; node.parentSplit; node = node.parentSplit) {
      const split: TabSplit = node.parentSplit;
      if (split.orientation !== orientation) continue;
      const next = split.children[split.children.indexOf(node) + step];
      if (next) return this.nearestGroup(next, direction);
    }
    return null;
  }

  /** @internal The group at an edge of the layout (the one used last, when several are). */
  edgeGroup(side: SplitDirection): TabGroup | null {
    const root = this.parts.root;
    const back: Record<SplitDirection, SplitDirection> = { left: 'right', right: 'left', up: 'down', down: 'up' };
    return root ? this.nearestGroup(root, back[side]) : null;
  }

  /**
   * @internal Makes a drop the built-in target found, through the methods of what it does (and
   * their events): a move or a copy into a strip or a group, a split, a group moved or merged.
   */
  dropAt(place: TabDropPlace, drag: TabDragSubject): boolean {
    return untracked(() => {
      const parts = this.parts;
      parts.dropResult = null;
      if (place.target === 'float') return this.dropFloat(place, drag);
      if (place.target === 'dock-area') {
        const target = drag.window ?? drag.document ?? drag.group;
        const ok = !!place.dockSide && drag.manager === this && this.dockBy(target, place.dockSide, null, true);
        if (ok) parts.dropResult = { group: this.activeGroup, document: drag.document };
        return ok;
      }
      const group = place.group && this.groups.includes(place.group) ? place.group : null;
      const side = place.side;
      const kind = place.target === 'dock-guide' ? 'group' : place.target;
      if (drag.window) return this.dropWindow(drag.window, group, kind === 'strip' ? place.index : undefined, kind === 'strip' ? 'center' : side, kind === 'edge');
      if (kind === 'strip' && group) return this.dropInto(drag, group, place.index, true);
      if (kind === 'group' && group && side === 'center') return this.dropInto(drag, group, undefined, false);
      const edge = kind === 'edge';
      if (!side || side === 'center' || (!edge && !(kind === 'group' && group))) return false;
      return this.dropBeside(drag, edge ? null : group, side);
    });
  }

  /** A drag let go away from every guide and strip: what was dragged floats there; a window moved stays where it is. */
  private dropFloat(place: TabDropPlace, drag: TabDragSubject): boolean {
    const parts = this.parts;
    if (drag.window) {
      this.windowChanged('moveWindow', drag.window, true);
      parts.dropResult = { group: drag.group, document: null };
      return true;
    }
    if (drag.manager !== this) return false;
    const w = this.floatBy(drag.document, drag.group, place.rect ?? null, true);
    if (w) parts.dropResult = { group: this.hostGroups(w)[0] ?? null, document: drag.document };
    return !!w;
  }

  /**
   * A whole window dropped on a strip or into a group (`center`: its documents join that group),
   * beside a group, or along an edge of the documents' area (`edge`): docked there, it closes.
   */
  private dropWindow(w: TabWindow, group: TabGroup | null, index: number | undefined, side: TabDropSide | null, edge: boolean): boolean {
    const parts = this.parts;
    if (!parts.windows.includes(w) || !w.root || (!group && !edge) || !side || (edge && side === 'center')) return false;
    if (group && group.window === w) return false;
    const e: TabDockingEventArgs = { document: null, group: null, window: w, side: null, size: null, byUser: true, cancel: false, source: this };
    parts.docking.fire(e);
    if (e.cancel) return false;
    const active = parts.recentGroups.find((g) => g.window === w)?.activeDocument ?? null;
    let into: TabGroup;
    parts.windowGone = 'docked';
    try {
      if (side === 'center' && group) {
        let at = index ?? group.tabs.length;
        for (const g of this.hostGroups(w)) {
          for (const d of [...g.documents]) if (this.moveDocument(d, group, at, true)) at = group.documents.indexOf(d) + 1;
        }
        if (active?.group === group) this.activateDocument(active, false, true);
        into = group;
      } else {
        const item = w.root;
        into = (active?.group && active.group.window === w ? active.group : null) ?? groupsIn(item)[0];
        this.restoreForChange();
        this.takeOut(item);
        if (group) this.insertBeside(group, item, side as SplitDirection);
        else this.insertAtEdge(item, side as SplitDirection);
        this.renderTree();
      }
      this.dropEmptyHosts(true);
    } finally {
      parts.windowGone = null;
    }
    this.useGroup(into, true);
    parts.dropResult = { group: into, document: null };
    parts.docked.fire({ document: null, group: into, area: into.dockArea, side: into.dockArea?.side ?? null, byUser: true, source: this });
    this.layoutChanged('dock', into, true, null, into.dockArea);
    this.say('tabDocsDockedBack', { title: this.textOf('tabDocsGroup', { n: this.groups.indexOf(into) + 1 }), n: this.groups.indexOf(into) + 1 });
    return true;
  }

  /** @internal Moves a document into a group of another manager: its tab, panel and content go along, nothing is made again. */
  moveAcross(doc: TabDocument, group: TabGroup, index: number | undefined, byUser: boolean): boolean {
    const parts = this.parts;
    const tab = parts.tabs.get(doc);
    const from = tab?.group;
    const target = group.manager;
    if (!tab || !from || target === this || !target.groups.includes(group)) return false;
    const fromIndex = from.tabs.indexOf(tab);
    const toIndex = Math.max(0, Math.min(index ?? target.insertIndexFor(group), group.tabs.length));
    const e: DocumentMovingEventArgs = { document: doc, from, fromIndex, to: group, toIndex, byUser, cancel: false, source: this };
    parts.moving.fire(e);
    if (e.cancel) return false;
    const opening = target.receiving(doc, target.groups.includes(e.to) ? e.to : group, e.toIndex, byUser);
    if (!opening) return false;
    const focus = deepActiveElement();
    const hadFocus = !!focus && (tab.header.contains(focus) || tab.panel.element.contains(focus));
    this.restoreForChange();
    const wasActive = from.activeTab === tab;
    const next = wasActive ? this.nextAfterClose(from, tab) : null;
    from.removeTab(tab);
    parts.tabs.delete(doc);
    this.forget(doc);
    if (wasActive) {
      from.showTab(next);
      if (next) this.fireActivated(next.document, doc, from, byUser);
    }
    target.receive(tab, opening, hadFocus);
    parts.moved.fire({ document: doc, from, fromIndex, to: opening.group, toIndex: opening.group.tabs.indexOf(tab), byUser, source: this });
    this.closeIfEmpty(from, byUser);
    return true;
  }

  /** @internal Another manager is about to give this one a document: `onOpening` here may refuse it, or place it elsewhere. */
  receiving(doc: TabDocument, group: TabGroup, index: number, byUser: boolean): DocumentOpeningEventArgs | null {
    const e: DocumentOpeningEventArgs = { document: doc, group, index, active: true, byUser, cancel: false, source: this };
    this.parts.opening.fire(e);
    if (e.cancel) return null;
    if (!this.groups.includes(e.group)) e.group = group;
    return e;
  }

  /** @internal Takes in the tab another manager let go of. */
  receive(tab: DocumentTab, e: DocumentOpeningEventArgs, focus: boolean): void {
    const doc = tab.document;
    const group = e.group;
    this.restoreForChange();
    tab.moveTo(this);
    this.parts.tabs.set(doc, tab);
    group.addTab(tab, e.index);
    doc.placeIn(this, group);
    this.parts.opened.fire({ document: doc, group, index: group.tabs.indexOf(tab), byUser: e.byUser, source: this });
    if (e.active || !group.activeTab) this.activateDocument(doc, false, e.byUser);
    else tab.show(false);
    if (doc.preview) this.keepBy(doc, e.byUser);
    this.say('tabDocsMoved', { title: doc.title, n: this.groups.indexOf(group) + 1 });
    if (focus) tab.header.focus();
  }

  /** @internal What a context menu item does, as the user. */
  runCommand(command: TabMenuCommand, group: TabGroup, document: TabDocument | null): void {
    untracked(() => {
      const doc = document;
      switch (command) {
        case 'close':
          if (doc) void this.closeDocument(doc, true);
          break;
        case 'closeOthers':
          if (doc) void this.closeMany(group.documents.filter((d) => d !== doc), undefined, true);
          break;
        case 'closeRight':
        case 'closeLeft':
          if (doc) void this.closeMany(this.sideOf(doc, command === 'closeRight' ? 1 : -1), undefined, true);
          break;
        case 'closeSaved':
          void this.closeMany(group.documents.filter((d) => !d.dirty), undefined, true);
          break;
        case 'closeAll':
          void this.closeMany([...group.documents], undefined, true);
          break;
        case 'keepOpen':
          if (doc) this.keepBy(doc, true);
          break;
        case 'pin':
        case 'unpin':
          if (doc) this.pinBy(doc, command === 'pin', true);
          break;
        case 'splitUp':
        case 'splitDown':
        case 'splitLeft':
        case 'splitRight': {
          const direction = command.slice(5).toLowerCase() as SplitDirection;
          const made = doc ? this.splitGroup(group, direction, doc, true) : null;
          if (doc) {
            if (made) this.focusGroup(made);
          } else {
            this.splitByUser(group, direction);
          }
          break;
        }
        case 'moveNext':
        case 'movePrevious':
          if (doc) this.moveToGroupBy(doc, command === 'moveNext' ? 'next' : 'previous', true);
          break;
        case 'moveTo':
          if (doc) this.showMoveTo(doc);
          break;
        case 'moveGroupTo':
          this.showMoveTo(group);
          break;
        case 'copyTitle':
          if (doc) void this.copyTitle(doc);
          break;
        case 'newDocument':
          this.openNewBy(group, true);
          break;
        case 'reopenClosed':
          this.reopenBy(true);
          break;
        case 'lock':
        case 'unlock':
          this.lockBy(group, command === 'lock', true);
          break;
        case 'float':
          this.floatBy(doc, group, null, true);
          break;
        case 'dock':
          this.dockBy(doc ?? group.window ?? group, null, null, true);
          break;
        case 'dockLeft':
        case 'dockRight':
        case 'dockTop':
        case 'dockBottom':
          this.dockBy(doc ?? group, command.slice(4).toLowerCase() as TabDockSide, null, true);
          break;
        case 'autoHide':
          this.toggleAutoHideByUser(group);
          break;
        case 'maximizeWindow':
          this.toggleWindowMaximizeByUser(group);
          break;
        case 'closeWindow':
          this.closeWindowByUser(group);
          break;
      }
    });
  }

  /** @internal Evens one split (a splitter's double click), or all of them. */
  evenSizesBy(split: TabSplit | null, byUser: boolean): boolean {
    if (!this.layoutChanging('evenSizes', null, byUser)) return false;
    const each = (item: LayoutItem | null) => {
      if (!(item instanceof TabSplit)) return;
      item.even();
      item.render();
      if (!split) item.children.forEach(each);
    };
    each(split ?? this.parts.root);
    this.layoutChanged('evenSizes', null, byUser);
    return true;
  }

  /** @internal A splitter is about to move under the pointer or the keys. */
  beginResize(owner?: SashOwner): boolean {
    return owner instanceof TabDockArea ? this.layoutChanging('resizeArea', null, true, null, owner) : this.layoutChanging('resize', null, true);
  }

  /** @internal */
  endResize(moved: boolean, owner?: SashOwner): void {
    if (!moved) return;
    if (owner instanceof TabDockArea) this.layoutChanged('resizeArea', null, true, null, owner);
    else this.layoutChanged('resize', null, true);
  }

  // Opening and closing.

  private openDocument(source: TabDocument | TabDocumentOptions, options: TabOpenOptions, byUser: boolean): TabDocument | null {
    this.ensureRoot();
    let doc = source instanceof TabDocument ? source : new TabDocument(source);
    const named = options.group && this.groups.includes(options.group) ? options.group : null;
    if (doc.manager === this) {
      const where = named ?? this.targetGroup();
      const root = doc.original ?? doc;
      const here = where.documents.find((d) => (d.original ?? d) === root);
      const copy = !here && where !== doc.group && this.mayCopy(doc) ? doc.makeCopy() : null;
      if (!copy) {
        const shown = here ?? doc;
        this.activateDocument(shown, !!options.focus, byUser);
        if (options.preview === false && shown.preview) this.keepBy(shown, byUser);
        return shown;
      }
      doc = copy;
    } else if (doc.isOpen) {
      return null;
    }
    let group = named ?? this.targetGroup();
    if (!named && group.locked && this.groups.length > 1) {
      // Every group is locked: a new one opens beside the active group.
      group = this.splitGroup(group, 'right', null, byUser) ?? group;
    }
    const preview = (options.preview ?? doc.preview) && this.previewTabs;
    if (doc.preview !== preview) doc.preview = preview;
    if (options.pinned !== undefined) doc.pinned = options.pinned;
    const replaced = preview ? group.tabs.find((t) => t.document.preview) : undefined;
    const e: DocumentOpeningEventArgs = {
      document: doc,
      group,
      index: options.index ?? (replaced ? group.tabs.indexOf(replaced) : this.insertIndex(group)),
      active: options.active ?? true,
      byUser,
      cancel: false,
      source: this,
    };
    this.parts.opening.fire(e);
    if (e.cancel) return null;
    group = this.groups.includes(e.group) ? e.group : group;
    const tab = this.insertTab(doc, group, e.index);
    this.parts.opened.fire({ document: doc, group, index: group.tabs.indexOf(tab), byUser, source: this });
    this.say('tabDocsOpened', { title: doc.title });
    if (e.active || !group.activeTab) this.activateDocument(doc, !!options.focus, byUser);
    const old = preview ? group.tabs.find((t) => t !== tab && t.document.preview) : undefined;
    if (old) this.replacePreview(old.document, byUser);
    return doc;
  }

  /** A new preview took the place of the group's old one: it closes, unless `onClosing` keeps it (then it stays for good). */
  private replacePreview(doc: TabDocument, byUser: boolean): void {
    const tab = this.parts.tabs.get(doc);
    const group = tab?.group;
    if (!tab || !group) return;
    const e: DocumentClosingEventArgs = { document: doc, group, index: group.tabs.indexOf(tab), byUser, lastCopy: this.isLastCopy(doc), cancel: false, source: this };
    this.parts.closing.fire(e);
    if (e.cancel || e.promise) this.keepBy(doc, byUser);
    else this.finishClose(doc, byUser);
  }

  private insertTab(doc: TabDocument, group: TabGroup, index: number): DocumentTab {
    const tab = new DocumentTab(doc, this);
    this.parts.tabs.set(doc, tab);
    group.addTab(tab, index);
    doc.placeIn(this, group);
    tab.prepare();
    return tab;
  }

  private closeDocument(doc: TabDocument, byUser: boolean): Promise<boolean> {
    const tab = this.parts.tabs.get(doc);
    const group = tab?.group;
    if (!tab || !group || (byUser && (!doc.closable || !this.isEnabled))) return Promise.resolve(false);
    const e: DocumentClosingEventArgs = { document: doc, group, index: group.tabs.indexOf(tab), byUser, lastCopy: this.isLastCopy(doc), cancel: false, source: this };
    this.parts.closing.fire(e);
    if (e.cancel) return Promise.resolve(false);
    if (!e.promise) return Promise.resolve(this.finishClose(doc, byUser));
    return e.promise.then(
      (ok) => !!ok && untracked(() => this.finishClose(doc, byUser)),
      () => false,
    );
  }

  /** Closes documents one after the other; pinned ones stay while `keepPinned` is on (unless `pinned`). */
  private async closeMany(docs: readonly TabDocument[], pinned: boolean | undefined, byUser: boolean): Promise<boolean> {
    const keep = untracked(() => !(pinned ?? !this.keepPinned));
    let all = true;
    for (const doc of docs) {
      if (keep && untracked(() => doc.pinned)) continue;
      if (!(await untracked(() => this.closeDocument(doc, byUser)))) all = false;
    }
    return all;
  }

  /** The documents after (`1`) or before (`-1`) one in its group. */
  private sideOf(doc: TabDocument, side: 1 | -1): TabDocument[] {
    const docs = doc.group?.documents ?? [];
    const at = docs.indexOf(doc);
    return at < 0 ? [] : side === 1 ? docs.slice(at + 1) : docs.slice(0, at);
  }

  private finishClose(doc: TabDocument, byUser: boolean): boolean {
    const parts = this.parts;
    const tab = parts.tabs.get(doc);
    const group = tab?.group;
    if (!tab || !group) return false;
    const index = group.tabs.indexOf(tab);
    const focus = deepActiveElement();
    const focusOnTab = !!focus && tab.header.contains(focus);
    const hadFocus = focusOnTab || (!!focus && tab.panel.element.contains(focus));
    const wasActive = group.activeTab === tab;
    const next = wasActive ? this.nextAfterClose(group, tab) : null;
    group.removeTab(tab);
    parts.tabs.delete(doc);
    doc.placeIn(null, null);
    tab.dispose();
    this.remember(doc, group, index);
    if (wasActive) group.showTab(next);
    parts.closed_.fire({ document: doc, group, index, byUser, source: this });
    if (wasActive && next) this.fireActivated(next.document, doc, group, byUser);
    this.say('tabDocsClosed', { title: doc.title });
    const removed = !group.tabs.length && this.removable(group);
    if (removed) {
      this.removeGroup(group);
      this.layoutChanged('closeGroup', group, byUser);
    }
    if (hadFocus) {
      const target = removed ? this.activeGroup : group;
      const active = target?.activeTab;
      if (active && focusOnTab && !removed) active.header.focus();
      else if (active) active.focusContent();
      else target?.restoreFocus();
    }
    return true;
  }

  /** A document left this manager: it leaves the history and the recently used list. */
  private forget(doc: TabDocument): void {
    const parts = this.parts;
    const before = parts.history.slice(0, parts.at + 1).filter((d) => d !== doc).length;
    parts.history = parts.history.filter((d) => d !== doc);
    parts.at = Math.min(before - 1, parts.history.length - 1);
    this.setProperty(
      'recentDocuments',
      this.recentDocuments.filter((d) => d !== doc),
    );
    this.renderHistory();
  }

  /** A closed document leaves the history, and is kept for `reopenClosed` when its content can be made again. */
  private remember(doc: TabDocument, group: TabGroup, index: number): void {
    const parts = this.parts;
    this.forget(doc);
    const size = this.closedHistorySize;
    if (size > 0 && (this.canRemake(doc) || !!doc.original)) {
      if (doc.preview) doc.preview = false;
      parts.closed = [{ document: doc, group, index }, ...parts.closed.filter((c) => c.document !== doc)].slice(0, size);
    }
    this.renderHistory();
  }

  private reopenBy(byUser: boolean): TabDocument | null {
    const parts = this.parts;
    while (parts.closed.length) {
      const { document, group, index } = parts.closed.shift()!;
      this.renderHistory();
      if (document.isOpen) continue;
      const where = this.groups.includes(group) && !group.locked ? group : undefined;
      const opened = this.openDocument(document, { group: where, index: where ? index : undefined, focus: byUser }, byUser);
      if (opened) return opened;
    }
    return null;
  }

  /** The tab that becomes active when `tab`, the active one, closes. */
  private nextAfterClose(group: TabGroup, tab: DocumentTab): DocumentTab | null {
    const tabs = group.tabs;
    const at = tabs.indexOf(tab);
    const how = this.afterClose;
    if (how === 'left') return tabs[at - 1] ?? tabs[at + 1] ?? null;
    if (how === 'right') return tabs[at + 1] ?? tabs[at - 1] ?? null;
    return group.recentTabs.find((t) => t !== tab) ?? null;
  }

  private activateDocument(doc: TabDocument, focus: boolean, byUser: boolean): boolean {
    const tab = this.parts.tabs.get(doc);
    const group = tab?.group;
    if (!tab || !group) return false;
    const before = this.activeDocument;
    const previous = group.activeTab;
    if (previous !== tab) {
      const e: DocumentActivatingEventArgs = { document: doc, previous: previous?.document ?? null, group, byUser, cancel: false, source: this };
      this.parts.activating.fire(e);
      if (e.cancel) return false;
      group.showTab(tab);
    }
    this.useGroup(group, byUser, false);
    if (previous !== tab || before !== doc) this.fireActivated(doc, previous !== tab ? (previous?.document ?? null) : before, group, byUser);
    if (focus) tab.focusContent();
    return true;
  }

  private fireActivated(doc: TabDocument | null, previous: TabDocument | null, group: TabGroup, byUser: boolean): void {
    if (doc && doc === this.activeDocument) this.visited(doc);
    this.parts.activated.fire({ document: doc, previous, group, byUser, source: this });
  }

  /** The manager's active document changed: it heads the recently used list and is a new step in the history. */
  private visited(doc: TabDocument): void {
    const parts = this.parts;
    this.setProperty('recentDocuments', [doc, ...this.recentDocuments.filter((d) => d !== doc)]);
    if (parts.travelling || parts.history[parts.at] === doc) return;
    const size = this.historySize;
    parts.history = [...parts.history.slice(0, parts.at + 1), doc].slice(-Math.max(size, 1));
    parts.at = parts.history.length - 1;
    if (!size) {
      parts.history = [];
      parts.at = -1;
    }
    this.renderHistory();
  }

  private travel(by: 1 | -1, byUser: boolean): boolean {
    const parts = this.parts;
    const to = parts.at + by;
    const doc = parts.history[to];
    if (!doc) return false;
    parts.travelling = true;
    try {
      if (!this.activateDocument(doc, byUser, byUser)) return false;
    } finally {
      parts.travelling = false;
    }
    parts.at = to;
    this.renderHistory();
    return true;
  }

  private renderHistory(): void {
    const parts = this.parts;
    this.setProperty('canGoBack', parts.at > 0);
    this.setProperty('canGoForward', parts.at < parts.history.length - 1);
    this.setProperty(
      'closedDocuments',
      parts.closed.map((c) => c.document),
    );
  }

  /** Activates the tab `by` places from the active one, around the ends. */
  private step(group: TabGroup | null, by: number, focus: boolean, byUser: boolean): boolean {
    const tabs = group?.tabs ?? [];
    if (!group || tabs.length < 2) return false;
    const at = group.activeTab ? tabs.indexOf(group.activeTab) : -1;
    const next = tabs[(at + by + tabs.length) % tabs.length];
    return this.activateDocument(next.document, focus, byUser);
  }

  private moveDocument(doc: TabDocument, group: TabGroup, index: number | undefined, byUser: boolean): boolean {
    const parts = this.parts;
    const tab = parts.tabs.get(doc);
    const from = tab?.group;
    if (!tab || !from || !this.groups.includes(group)) return false;
    const fromIndex = from.tabs.indexOf(tab);
    const last = from === group ? group.tabs.length - 1 : group.tabs.length;
    const toIndex = Math.max(0, Math.min(index ?? (from === group ? fromIndex : this.insertIndex(group)), last));
    if (from === group && toIndex === fromIndex) return true;
    const e: DocumentMovingEventArgs = { document: doc, from, fromIndex, to: group, toIndex, byUser, cancel: false, source: this };
    parts.moving.fire(e);
    if (e.cancel) return false;
    const focus = deepActiveElement();
    const hadFocus = !!focus && (tab.header.contains(focus) || tab.panel.element.contains(focus));
    if (from === group) {
      group.moveTab(tab, Math.max(0, Math.min(e.toIndex, last)));
    } else {
      this.restoreForChange();
      const wasActive = from.activeTab === tab;
      const next = wasActive ? this.nextAfterClose(from, tab) : null;
      from.removeTab(tab);
      if (wasActive) from.showTab(next);
      group.addTab(tab, e.toIndex);
      doc.placeIn(this, group);
      const before = this.activeDocument;
      group.showTab(tab);
      this.useGroup(group, byUser, false);
      this.fireActivated(doc, before, group, byUser);
      this.closeIfEmpty(from, byUser);
    }
    parts.moved.fire({ document: doc, from, fromIndex, to: group, toIndex: group.tabs.indexOf(tab), byUser, source: this });
    if (from !== group) this.say('tabDocsMoved', { title: doc.title, n: this.groups.indexOf(group) + 1 });
    if (doc.preview) this.keepBy(doc, byUser);
    if (hadFocus) tab.header.focus();
    return true;
  }

  private moveToGroupBy(doc: TabDocument, which: 'next' | 'previous' | SplitDirection, byUser: boolean): boolean {
    const from = doc.group;
    if (!from || doc.manager !== this) return false;
    const groups = this.groups;
    const inOrder = which === 'next' || which === 'previous';
    const target = inOrder ? groups[groups.indexOf(from) + (which === 'next' ? 1 : -1)] : this.neighbourOf(from, which);
    if (target) {
      const ok = this.moveDocument(doc, target, undefined, byUser);
      if (ok && byUser) this.focusGroup(target);
      return ok;
    }
    const side: SplitDirection = which === 'next' ? 'right' : which === 'previous' ? 'left' : which;
    const made = this.splitGroup(from, side, doc, byUser, false);
    if (made && byUser) this.focusGroup(made);
    return !!made;
  }

  private moveInGroupBy(doc: TabDocument, by: number, byUser: boolean): boolean {
    const group = doc.group;
    if (!group || doc.manager !== this || !by) return false;
    const docs = group.documents;
    const at = docs.indexOf(doc);
    const pinned = docs.filter((d) => d.pinned).length;
    const [low, high] = doc.pinned ? [0, pinned - 1] : [pinned, docs.length - 1];
    const to = Math.max(low, Math.min(high, at + by));
    return to !== at && this.moveDocument(doc, group, to, byUser);
  }

  /** A drop into a group: among its tabs at `index` (`strip`), or where `openPosition` says. */
  private dropInto(drag: TabDragSubject, group: TabGroup, index: number | undefined, strip: boolean): boolean {
    const source = drag.manager;
    const doc = drag.document;
    if (!doc) {
      // A whole group: its documents join this one.
      const moved = source === this ? this.mergeGroup(drag.group, group, index, true) : this.takeGroup(drag.group, group, index);
      if (moved) this.parts.dropResult = { group, document: null };
      return moved;
    }
    const copy = drag.copy && source.mayCopyDocument(doc);
    const pin = strip && index !== undefined && this.pinOnDrag ? pinAt(group, doc, index) : null;
    const root = doc.original ?? doc;
    const had = group.documents.find((d) => (d.original ?? d) === root);
    let result: TabDocument | null;
    if (copy) {
      result = this.openDocument(source === this ? doc : doc.makeCopy(), { group, index }, true);
    } else if (source === this) {
      if (pin !== null && doc.pinned !== pin) this.pinBy(doc, pin, true);
      result = this.moveDocument(doc, group, index, true) ? doc : null;
    } else {
      result = source.moveAcross(doc, group, index, true) ? doc : null;
    }
    if (!result) return false;
    if (pin !== null && result.pinned !== pin && result.group === group) {
      this.pinBy(result, pin, true);
      if (index !== undefined) this.moveDocument(result, group, index, true);
    }
    if (copy && !had) this.say('tabDocsCopied', { title: result.title, n: this.groups.indexOf(group) + 1 });
    this.parts.dropResult = { group: result.group, document: result };
    return true;
  }

  /** A drop beside a group, or along an edge of the layout (`group` `null`): a new group there. */
  private dropBeside(drag: TabDragSubject, group: TabGroup | null, side: SplitDirection): boolean {
    const source = drag.manager;
    const doc = drag.document;
    if (source === this && !doc) {
      const moved = this.moveGroupBy(drag.group, group, side, true);
      if (moved) this.parts.dropResult = { group: drag.group, document: null };
      return moved;
    }
    const copy = !!doc && drag.copy && source.mayCopyDocument(doc);
    if (source === this && doc) {
      const made = this.splitGroup(group, side, doc, true, copy);
      if (!made) return false;
      const result = made.documents[0] ?? null;
      if (copy && result && result !== doc) this.say('tabDocsCopied', { title: result.title, n: this.groups.indexOf(made) + 1 });
      this.parts.dropResult = { group: made, document: result };
      return true;
    }
    // From another manager: a new group here, then the document (or the group's documents) into it.
    const made = this.splitGroup(group, side, null, true);
    if (!made) return false;
    let result: TabDocument | null = null;
    let moved: boolean;
    if (!doc) moved = this.takeGroup(drag.group, made, undefined);
    else {
      result = copy ? this.openDocument(doc.makeCopy(), { group: made }, true) : source.moveAcross(doc, made, 0, true) ? doc : null;
      moved = !!result;
      if (copy && result) this.say('tabDocsCopied', { title: result.title, n: this.groups.indexOf(made) + 1 });
    }
    if (!moved) {
      this.closeMovedGroup(made, true);
      return false;
    }
    this.parts.dropResult = { group: made, document: result };
    return true;
  }

  /** A group of another manager dropped into one of this: its documents come over, its active one stays active. */
  private takeGroup(group: TabGroup, into: TabGroup, index: number | undefined): boolean {
    const source = group.manager;
    const active = group.activeDocument;
    let at = index ?? into.tabs.length;
    let moved = false;
    for (const doc of [...group.documents]) {
      if (!source.moveAcross(doc, into, at, true)) continue;
      moved = true;
      at = into.documents.indexOf(doc) + 1;
    }
    if (active?.group === into) this.activateDocument(active, false, true);
    if (source.groups.includes(group)) source.closeMovedGroup(group, true);
    return moved;
  }

  /** A group's documents join another group of this manager, and it closes. */
  private mergeGroup(group: TabGroup, into: TabGroup, index: number | undefined, byUser: boolean): boolean {
    if (group === into || !this.groups.includes(group) || !this.groups.includes(into)) return false;
    if (!this.layoutChanging('move', group, byUser)) return false;
    const active = group.activeDocument;
    let at = index ?? into.tabs.length;
    for (const doc of [...group.documents]) {
      if (this.moveDocument(doc, into, at, byUser)) at = into.documents.indexOf(doc) + 1;
    }
    if (active?.group === into) this.activateDocument(active, false, byUser);
    this.closeMovedGroup(group, byUser);
    this.layoutChanged('move', into, byUser);
    this.say('tabDocsGroupMoved', { n: this.groups.indexOf(into) + 1 });
    return true;
  }

  private moveGroupBy(group: TabGroup, target: TabGroup | null, side: TabDropSide, byUser: boolean): boolean {
    if (!this.groups.includes(group) || target === group || (target && !this.groups.includes(target))) return false;
    if (side === 'center') return !!target && this.mergeGroup(group, target, undefined, byUser);
    if (this.groups.length < 2 || !this.layoutChanging('move', group, byUser)) return false;
    this.restoreForChange();
    const gone = this.takeOut(group);
    if (target) this.insertBeside(target, group, side);
    else this.insertAtEdge(group, side);
    this.renderTree();
    for (const split of gone) split.dispose();
    this.useGroup(group, byUser);
    this.layoutChanged('move', group, byUser);
    this.say('tabDocsGroupMoved', { n: this.groups.indexOf(group) + 1 });
    return true;
  }

  /** A group the last document left closes when `closeEmptyGroups` says so (never the last group). */
  private closeIfEmpty(group: TabGroup, byUser: boolean): void {
    if (!group.tabs.length && this.groups.includes(group) && this.removable(group)) this.closeMovedGroup(group, byUser);
  }

  /** @internal A group whose documents all went elsewhere closes (never the documents' last group). */
  closeMovedGroup(group: TabGroup, byUser: boolean): void {
    if (group.tabs.length || !this.groups.includes(group) || !this.closable(group)) return;
    this.removeGroup(group);
    this.layoutChanged('closeGroup', group, byUser);
  }

  /** The group of `item` nearest to where one comes from going `direction`; across that way, the one used last. */
  private nearestGroup(item: LayoutItem, direction: SplitDirection): TabGroup {
    if (item instanceof TabGroup) return item;
    const along = item.orientation === (direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical');
    if (along) return this.nearestGroup(direction === 'right' || direction === 'down' ? item.children[0] : item.children[item.children.length - 1], direction);
    const recent = this.parts.recentGroups;
    const rank = (child: LayoutItem) => Math.min(...groupsIn(child).map((g) => (recent.includes(g) ? recent.indexOf(g) : Infinity)));
    const pick = [...item.children].sort((a, b) => rank(a) - rank(b))[0];
    return this.nearestGroup(pick, direction);
  }

  private keepBy(doc: TabDocument, byUser: boolean): boolean {
    const group = doc.group;
    if (!group || doc.manager !== this || !doc.preview) return false;
    const e: DocumentChangingEventArgs = { document: doc, group, byUser, cancel: false, source: this };
    this.parts.keeping.fire(e);
    if (e.cancel) return false;
    doc.preview = false;
    this.parts.kept.fire({ document: doc, group, byUser, source: this });
    this.say('tabDocsKept', { title: doc.title });
    return true;
  }

  private pinBy(doc: TabDocument, on: boolean, byUser: boolean): boolean {
    const tab = this.parts.tabs.get(doc);
    const group = tab?.group;
    if (!tab || !group) return false;
    if (doc.pinned === on) return true;
    const e: DocumentChangingEventArgs = { document: doc, group, byUser, cancel: false, source: this };
    (on ? this.parts.pinning : this.parts.unpinning).fire(e);
    if (e.cancel) return false;
    if (on && doc.preview) doc.preview = false;
    doc.pinned = on;
    this.pinChanged(tab);
    (on ? this.parts.pinned : this.parts.unpinned).fire({ document: doc, group, byUser, source: this });
    this.say(on ? 'tabDocsPinned' : 'tabDocsUnpinned', { title: doc.title });
    return true;
  }

  private lockBy(group: TabGroup, on: boolean, byUser: boolean): boolean {
    if (!this.groups.includes(group)) return false;
    if (group.locked === on) return true;
    const e: GroupLockingEventArgs = { group, byUser, cancel: false, source: this };
    (on ? this.parts.locking : this.parts.unlocking).fire(e);
    if (e.cancel) return false;
    group.locked = on;
    this.renderTexts();
    (on ? this.parts.locked : this.parts.unlocked).fire({ group, byUser, source: this });
    this.say(on ? 'tabDocsLocked' : 'tabDocsUnlocked', { n: this.groups.indexOf(group) + 1 });
    return true;
  }

  private openNewBy(group: TabGroup | null, byUser: boolean): TabDocument | null {
    const make = this.newDocument;
    if (!group || !make || !this.groups.includes(group)) return null;
    const made = make(group);
    return made ? this.openDocument(made, { group, focus: byUser }, byUser) : null;
  }

  /** Whether a document may get a copy in another group with content of its own. */
  private mayCopy(doc: TabDocument): boolean {
    const allowed = doc.allowDuplicate ?? this.allowDuplicate;
    return allowed && doc.canCopy(!!this.factory);
  }

  private copiesOnSplit(doc: TabDocument): boolean {
    return this.splitCopies && this.mayCopy(doc);
  }

  private isLastCopy(doc: TabDocument): boolean {
    const root = doc.original ?? doc;
    return !this.documents.some((d) => d !== doc && (d.original ?? d) === root);
  }

  /** Where `open` puts a document without a group: the active group, else the one used last that is not locked. */
  private targetGroup(): TabGroup {
    const parts = this.parts;
    const active = this.activeGroup;
    const open = (g: TabGroup) => !g.locked && !g.dockArea;
    if (active && open(active)) return active;
    return parts.recentGroups.find(open) ?? this.groups.find(open) ?? active ?? this.groups[0];
  }

  private insertIndex(group: TabGroup): number {
    const position = this.openPosition;
    if (position === 'start') return 0;
    if (position === 'end' || !group.activeTab) return group.tabs.length;
    return group.tabs.indexOf(group.activeTab) + 1;
  }

  // Groups.

  /** The first group, made on first need: a `ref` callback may call a method before the constructor is done. */
  private ensureRoot(): void {
    if (this.parts.root) return;
    const first = this.createGroup();
    this.setRoot(first);
    this.renderTree();
    this.useGroup(first, false);
  }

  private createGroup(): TabGroup {
    const group = new TabGroup(this);
    this.sizeGroup(group);
    this.controls.add(group);
    return group;
  }

  /**
   * A new group beside `group`, or along an edge of the whole layout (`null`). `copy`: a copy of the
   * document opens in it (when it can be copied); else the document moves there.
   */
  private splitGroup(group: TabGroup | null, direction: SplitDirection, doc: TabDocument | null, byUser: boolean, copy = !!doc && this.copiesOnSplit(doc)): TabGroup | null {
    const parts = this.parts;
    if (group && !this.groups.includes(group)) return null;
    const document = doc && parts.tabs.has(doc) ? doc : null;
    const e: GroupSplittingEventArgs = { group, direction, document, copy: !!document && copy, byUser, cancel: false, source: this };
    parts.splitting.fire(e);
    if (e.cancel) return null;
    this.restoreForChange();
    const made = this.createGroup();
    if (group) this.insertBeside(group, made, direction);
    else this.insertAtEdge(made, direction);
    this.renderTree();
    let copied: TabDocument | null = null;
    if (document && e.copy && document.canCopy(!!this.factory)) {
      copied = this.openDocument(document.makeCopy(), { group: made, pinned: document.pinned || undefined }, byUser);
    } else if (document) {
      this.moveDocument(document, made, 0, byUser);
    }
    this.useGroup(made, byUser);
    parts.split.fire({ group, newGroup: made, direction, document, copy: copied, byUser, source: this });
    this.layoutChanged('split', made, byUser);
    this.say('tabDocsSplit', { n: this.groups.indexOf(made) + 1 });
    return made;
  }

  private async closeGroupBy(group: TabGroup, byUser: boolean): Promise<boolean> {
    if (!this.groups.includes(group) || !this.layoutChanging('closeGroup', group, byUser)) return false;
    for (const doc of [...group.documents]) {
      if (!(await this.closeDocument(doc, byUser))) return false;
    }
    if (this.groups.includes(group) && this.closable(group)) {
      untracked(() => {
        this.removeGroup(group);
        this.layoutChanged('closeGroup', group, byUser);
      });
    }
    return true;
  }

  /** Takes an empty group out of the layout; a window or a dock area left without groups goes too. */
  private removeGroup(group: TabGroup): void {
    const parts = this.parts;
    const host = this.hostOf(group);
    if (host === undefined || (host === null && !group.parentSplit)) return;
    if (parts.maximized) this.unmaximize();
    const hadFocus = group.focusWithin;
    const gone = this.takeOut(group);
    parts.recentGroups = parts.recentGroups.filter((g) => g !== group);
    group.disposeTabs();
    this.controls.remove(group);
    this.renderTree();
    for (const split of gone) split.dispose();
    this.dropEmptyHosts(false);
    if (this.activeGroup === group) {
      this.setProperty('activeGroup', null);
      const next = parts.recentGroups[0] ?? this.groups[0];
      if (next) this.useGroup(next, false);
    }
    if (hadFocus) this.activeGroup?.restoreFocus();
    // A window or a dock area that went with it says so itself.
    if (!host || host.root) this.say('tabDocsGroupClosed');
  }

  /**
   * Takes an item out of the tree; a split left with one child gives its place to it. Returns the
   * splits that are gone, to dispose once the tree is in place again (what they held moves out first).
   */
  private takeOut(item: LayoutItem): TabSplit[] {
    const parent = item.parentSplit;
    if (!parent) {
      this.detachRoot(item);
      return [];
    }
    parent.remove(item);
    if (parent.children.length !== 1) return [];
    const only = parent.children[0];
    const outer = parent.parentSplit;
    if (outer && only instanceof TabSplit && only.orientation === outer.orientation) {
      // Same direction as the split around it: its children join that split.
      const at = outer.children.indexOf(parent);
      const share = outer.sizes[at];
      outer.children.splice(at, 1, ...only.children);
      outer.sizes.splice(at, 1, ...only.sizes.map((s) => s * share));
      for (const child of only.children) child.parentSplit = outer;
      return [only, parent];
    }
    parent.remove(only);
    this.replaceNode(parent, only);
    return [parent];
  }

  /** Puts `item` beside `target` in the tree, on the `direction` side; they share `target`'s room. */
  private insertBeside(target: LayoutItem, item: LayoutItem, direction: SplitDirection): void {
    const orientation = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
    const after = direction === 'right' || direction === 'down';
    const parent = target.parentSplit;
    if (parent && parent.orientation === orientation) {
      const at = parent.children.indexOf(target);
      const half = parent.sizes[at] / 2;
      parent.sizes[at] = half;
      parent.children.splice(after ? at + 1 : at, 0, item);
      parent.sizes.splice(after ? at + 1 : at, 0, half);
      item.parentSplit = parent;
    } else {
      const branch = new TabSplit(this, orientation);
      this.replaceNode(target, branch);
      branch.children = after ? [target, item] : [item, target];
      branch.sizes = [0.5, 0.5];
      target.parentSplit = item.parentSplit = branch;
    }
  }

  /** Puts `item` along an edge of the whole layout. */
  private insertAtEdge(item: LayoutItem, direction: SplitDirection): void {
    const root = this.parts.root!;
    const orientation = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
    const after = direction === 'right' || direction === 'down';
    if (root instanceof TabSplit && root.orientation === orientation) root.insert(item, after ? root.children.length : 0);
    else this.insertBeside(root, item, direction);
  }

  /** Puts `next` where `node` is in the tree and on the page. */
  private replaceNode(node: LayoutItem, next: LayoutItem): void {
    const holder = node.element.parentElement;
    if (holder) placeNode(holder, next.element, node.element);
    const parent = node.parentSplit;
    if (parent) parent.replace(node, next);
    else this.setHostRoot(this.hostOf(node) ?? null, next);
  }

  /** The top of a tree leaves its window or dock area, which is left empty; the documents' area gets an empty group in its place. */
  private detachRoot(item: LayoutItem): void {
    const host = this.hostOf(item);
    if (host === undefined) return;
    if (host) {
      host.root = null;
      return;
    }
    const fresh = this.createGroup();
    this.setRoot(fresh);
  }

  /** What holds the tree `item` is in: a window, a dock area, the documents' area (`null`), or `undefined` when it is in none. */
  private hostOf(item: LayoutItem): Host | undefined {
    let top = item;
    while (top.parentSplit) top = top.parentSplit;
    const parts = this.parts;
    if (top === parts.root) return null;
    return parts.windows.find((w) => w.root === top) ?? [...parts.areas.values()].find((a) => a.root === top);
  }

  /** The groups of a window, a dock area or the documents' area (`null`), in layout order. */
  private hostGroups(host: Host): TabGroup[] {
    const root = host ? host.root : this.parts.root;
    return root ? groupsIn(root) : [];
  }

  private setHostRoot(host: Host, item: LayoutItem): void {
    if (!host) {
      this.setRoot(item);
      return;
    }
    host.root = item;
    item.parentSplit = null;
    placeRoot(host instanceof TabWindow ? host.body : host.element, item);
  }

  /** Puts `item` along an edge of a window or a dock area (`null`: the documents' area). */
  private insertAtHostEdge(host: Host, item: LayoutItem, direction: SplitDirection): void {
    const root = host ? host.root : this.parts.root;
    if (!root) {
      this.setHostRoot(host, item);
      return;
    }
    const orientation = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
    const after = direction === 'right' || direction === 'down';
    if (root instanceof TabSplit && root.orientation === orientation) root.insert(item, after ? root.children.length : 0);
    else this.insertBeside(root, item, direction);
  }

  private setRoot(item: LayoutItem): void {
    this.parts.root = item;
    item.parentSplit = null;
    placeNode(this.element, item.element, this.element.firstChild);
    item.element.style.flex = '1 1 0px';
  }

  /**
   * Puts every split's children in place, and writes down the groups in layout order: the
   * documents' first, then each dock area's, then each floating window's.
   */
  private renderTree(): void {
    // A browser without moveBefore drops focus from what it moves: it goes back.
    const focus = deepActiveElement();
    const groups: TabGroup[] = [];
    const visit = (item: LayoutItem, host: Host, title: TabGroup | null) => {
      if (item instanceof TabSplit) {
        item.render();
        item.children.forEach((child) => visit(child, host, title));
      } else {
        groups.push(item);
        item.placeIn(host instanceof TabWindow ? host : null, host instanceof TabDockArea ? host : null, item === title);
      }
    };
    const parts = this.parts;
    const root = parts.root;
    if (root) {
      placeNode(this.element, root.element, this.element.firstChild);
      visit(root, null, null);
    }
    for (const area of this.orderedAreas()) {
      if (!area.root) continue;
      placeRoot(area.element, area.root);
      visit(area.root, area, null);
    }
    for (const w of parts.windows) {
      if (!w.root) continue;
      placeRoot(w.body, w.root);
      visit(w.root, w, titleGroup(w.root));
    }
    this.setProperty('groups', groups);
    this.renderDock();
    this.renderTexts();
    if (focus && focus.isConnected && this.element.contains(focus) && deepActiveElement() !== focus) focus.focus({ preventScroll: true });
  }

  // Floating windows and dock areas.

  private createWindow(rect: TabRect): TabWindow {
    const w = new TabWindow(this, rect);
    this.parts.windows.push(w);
    this.element.append(w.element);
    w.bringToFront();
    this.keepWindowInView(w);
    this.renderLists();
    return w;
  }

  /** A window made for a move that did not happen goes without a word. */
  private discardWindow(w: TabWindow): void {
    const parts = this.parts;
    for (const g of this.hostGroups(w)) {
      parts.recentGroups = parts.recentGroups.filter((r) => r !== g);
      this.controls.remove(g);
    }
    w.root = null;
    parts.windows = parts.windows.filter((x) => x !== w);
    w.dispose();
    this.renderTree();
    this.renderLists();
  }

  /** A window is gone: emptied, docked, or closed with its documents. */
  private removeWindow(w: TabWindow, reason: TabWindowClosedEventArgs['reason'], byUser: boolean): void {
    const parts = this.parts;
    const at = parts.windows.indexOf(w);
    if (at < 0) return;
    const hadFocus = !!deepActiveElement() && w.element.contains(deepActiveElement());
    if (parts.windowKeys?.window === w) parts.windowKeys.end(false);
    parts.windows.splice(at, 1);
    if (w.root) this.disposeSplits(w.root);
    w.dispose();
    this.renderLists();
    parts.windowClosed.fire({ window: w, reason, byUser, source: this });
    this.layoutChanged('closeWindow', null, byUser, w);
    if (reason !== 'docked') this.say('tabDocsWindowClosed');
    if (hadFocus) this.activeGroup?.restoreFocus();
  }

  private createArea(side: TabDockSide, size: number | string): TabDockArea {
    const parts = this.parts;
    const area = new TabDockArea(this, side, size);
    parts.areas.set(side, area);
    parts.order.push(side);
    area.strip = new AutoHideStrip(this, area);
    this.element.append(area.element, area.sash.element, area.strip.element);
    this.renderLists();
    return area;
  }

  private removeArea(area: TabDockArea): void {
    const parts = this.parts;
    if (parts.areas.get(area.side) !== area) return;
    if (parts.slide?.area === area) this.stopSlide();
    parts.areas.delete(area.side);
    parts.order = parts.order.filter((s) => s !== area.side);
    if (area.root) this.disposeSplits(area.root);
    area.strip?.dispose();
    area.dispose();
    this.renderLists();
    this.renderDock();
  }

  /** Windows and dock areas left without groups go. */
  private dropEmptyHosts(byUser: boolean): void {
    const parts = this.parts;
    for (const w of [...parts.windows]) if (!w.root) this.removeWindow(w, parts.windowGone ?? (parts.closingWindows.has(w) ? 'closed' : 'empty'), byUser);
    for (const area of [...parts.areas.values()]) if (!area.root) this.removeArea(area);
  }

  private orderedAreas(): TabDockArea[] {
    const parts = this.parts;
    return parts.order.map((side) => parts.areas.get(side)!).filter(Boolean);
  }

  /** The reactive lists: the dock areas in their order, the windows back to front. */
  private renderLists(): void {
    this.setProperty('dockAreas', this.orderedAreas());
    this.setProperty('floatingWindows', [...this.parts.windows].sort((a, b) => zOf(a) - zOf(b)));
  }

  /** @internal A window came to the front. */
  windowRaised(): void {
    untracked(() => this.renderLists());
  }

  /**
   * @internal Places the dock areas, their splitters and the strips of folded ones around the
   * documents, the outermost first: each takes its side of the room the ones before it left.
   */
  renderDock(): void {
    const parts = (this as unknown as { [PARTS]?: Parts })[PARTS];
    if (!parts) return;
    untracked(() => {
      // Grid lines: column 4 and row 4 are the documents, 2 and 6 the areas, 3 and 5 their splitters, 1 and 7 the strips.
      const r = { c0: 2, c1: 7, r0: 2, r1: 7 };
      for (const area of this.orderedAreas()) {
        const folded = area.autoHidden;
        const px = Math.round(area.pixels());
        const across = area.orientation === 'horizontal';
        const style = area.element.style;
        style.setProperty(across ? 'inline-size' : 'block-size', `${px}px`);
        style.removeProperty(across ? 'block-size' : 'inline-size');
        let box: number[];
        let sash: number[] | null = null;
        if (area.side === 'left') {
          box = folded ? [r.r0, r.c0, r.r1, 5] : [r.r0, 2, r.r1, 3];
          if (!folded) (sash = [r.r0, 3, r.r1, 4]), (r.c0 = 4);
        } else if (area.side === 'right') {
          box = folded ? [r.r0, 4, r.r1, r.c1] : [r.r0, 6, r.r1, 7];
          if (!folded) (sash = [r.r0, 5, r.r1, 6]), (r.c1 = 5);
        } else if (area.side === 'top') {
          box = folded ? [r.r0, r.c0, 5, r.c1] : [2, r.c0, 3, r.c1];
          if (!folded) (sash = [3, r.c0, 4, r.c1]), (r.r0 = 4);
        } else {
          box = folded ? [4, r.c0, r.r1, r.c1] : [6, r.c0, 7, r.c1];
          if (!folded) (sash = [5, r.c0, 6, r.c1]), (r.r1 = 5);
        }
        style.gridArea = box.join(' / ');
        const sashEl = area.sash.element;
        sashEl.hidden = !sash;
        if (sash) sashEl.style.gridArea = sash.join(' / ');
        const room = area.room();
        sashEl.setAttribute('aria-orientation', across ? 'vertical' : 'horizontal');
        sashEl.setAttribute('aria-valuenow', String(room > 0 ? Math.round((px / room) * 100) : 0));
        sashEl.setAttribute('aria-controls', area.element.id);
        sashEl.setAttribute('aria-label', this.textOf('tabDocsResizeArea', { area: this.textOf(AREA_TEXTS[area.side]) }));
        area.element.setAttribute('aria-label', this.textOf(AREA_TEXTS[area.side]));
      }
    });
  }

  /** @internal A dock area's size kept between its smallest and what leaves the documents their smallest. */
  clampAreaSize(area: TabDockArea, px: number): number {
    const min = this.dockAreaMinSize;
    const room = area.room();
    if (!(room > 0)) return Math.max(min, px);
    const across = area.orientation === 'horizontal';
    const others = this.orderedAreas()
      .filter((a) => a !== area && !a.autoHidden && a.orientation === area.orientation)
      .reduce((sum, a) => sum + Math.min(a.rawPixels(), room), 0);
    const keep = across ? this.minGroupWidth : this.minGroupHeight;
    return Math.max(min, Math.min(px, room - others - keep));
  }

  /** A dock area sized by a share follows the manager's size. */
  private watchSize(): void {
    const view = this.element.ownerDocument.defaultView;
    if (!view || typeof view.ResizeObserver !== 'function') return;
    const parts = this.parts;
    let size = '';
    parts.sizeWatch = new view.ResizeObserver(() => {
      const box = this.element.getBoundingClientRect();
      const now = `${Math.round(box.width)}x${Math.round(box.height)}`;
      if (now === size) return;
      size = now;
      if (parts.areas.size) this.renderDock();
    });
    parts.sizeWatch.observe(this.element);
  }

  /** @internal A window kept inside the viewport (when `keepFloatingInView` is on), at least its strip in reach. */
  keepWindowInView(w: TabWindow): void {
    if (!this.keepFloatingInView || w.isMaximized) return;
    const room = w.room();
    if (!(room.w > 0 && room.h > 0)) return;
    const r = w.rect;
    const width = Math.min(r.width, room.w);
    const height = Math.min(r.height, room.h);
    const x = Math.min(Math.max(0, r.x), room.w - width);
    const y = Math.min(Math.max(0, r.y), room.h - height);
    if (x !== r.x || y !== r.y || width !== r.width || height !== r.height) w.place({ x, y, width, height });
  }

  /** Where a window floated from `group` opens: at `at` (the pointer), else beside the group; as large as the group, or `floatingWindowSize`. */
  private floatRect(group: TabGroup | null, at: { x: number; y: number } | null): TabRect {
    const box = group?.element.getBoundingClientRect();
    const size = this.floatingWindowSize;
    const width = size?.width ?? (box && box.width > 0 ? box.width : 480);
    const height = size?.height ?? (box && box.height > 0 ? box.height : 320);
    if (at) return { x: at.x - Math.min(48, width / 4), y: at.y - 16, width, height };
    if (box && box.width > 0) return { x: box.x + 32, y: box.y + 32, width, height };
    const view = this.element.ownerDocument.documentElement;
    return { x: Math.max(0, (view.clientWidth - width) / 2), y: Math.max(0, (view.clientHeight - height) / 3), width, height };
  }

  /** Whether the user and the code may float a document: its own `allowFloat`, else the manager's. */
  private mayFloat(doc: TabDocument): boolean {
    return this.isEnabled && (doc.allowFloat ?? this.allowFloat);
  }

  /** Whether a document may go to a dock area (of `side`). */
  private mayDock(doc: TabDocument, side: TabDockSide | null): boolean {
    if (!(doc.allowDock ?? this.allowDock)) return false;
    return !side || (doc.dockSides ?? this.dockSides).includes(side);
  }

  /** @internal Whether what is dragged may float, or (with `side`) go to that dock area. */
  maySubject(drag: TabDragSubject, side: TabDockSide | 'float'): boolean {
    return untracked(() => {
      const docs = drag.window ? drag.window.documents : drag.document ? [drag.document] : drag.group.documents;
      if (side === 'float') {
        if (!this.isEnabled || drag.window) return false;
        if (!drag.document && this.hostGroups(drag.group.window).length === 1 && drag.group.window) return false;
        return docs.length ? docs.every((d) => this.mayFloat(d)) : this.allowFloat;
      }
      return docs.length ? docs.every((d) => this.mayDock(d, side)) : this.allowDock && this.dockSides.includes(side);
    });
  }

  /** @internal Whether a dock area may fold: the manager's `allowAutoHide`, and none of its documents says no. */
  mayAutoHide(area: TabDockArea): boolean {
    return this.allowAutoHide && area.documents.every((d) => d.allowAutoHide !== false);
  }

  /** @internal Whether a group may be maximized: one of the documents' groups, when there are two or more. */
  canMaximize(group: TabGroup): boolean {
    return !group.window && !group.dockArea && this.groups.filter((g) => !g.window && !g.dockArea).length > 1;
  }

  /** Whether a group left without documents goes: never the documents' last one; a window's last one when `closeEmptyWindows` says so; a dock area's last one, with the area. */
  private removable(group: TabGroup): boolean {
    const host = this.hostOf(group);
    if (host === undefined) return false;
    const alone = this.hostGroups(host).length < 2;
    if (host === null) return !alone && this.closeEmptyGroups;
    if (host instanceof TabWindow) return alone ? this.closeEmptyWindows : this.closeEmptyGroups;
    return alone || this.closeEmptyGroups;
  }

  /** Whether a group may close: any but the documents' last one. */
  private closable(group: TabGroup): boolean {
    const host = this.hostOf(group);
    return host !== undefined && (host !== null || this.hostGroups(null).length > 1);
  }

  /** @internal The top group under a point of the viewport: in the front window there, the slid out area, then the rest. */
  groupAt(x: number, y: number, skip: TabWindow | null = null): TabGroup | null {
    for (const w of this.windowsFrontFirst()) {
      if (w === skip || !contains(w.element.getBoundingClientRect(), x, y)) continue;
      return this.hostGroups(w).find((g) => contains(g.element.getBoundingClientRect(), x, y)) ?? null;
    }
    const open = this.parts.slide?.area;
    if (open && contains(open.element.getBoundingClientRect(), x, y)) {
      return this.hostGroups(open).find((g) => contains(g.element.getBoundingClientRect(), x, y)) ?? null;
    }
    for (const g of this.groups) {
      if (g.window || g.dockArea?.autoHidden || g.element.closest('[hidden]')) continue;
      if (contains(g.element.getBoundingClientRect(), x, y)) return g;
    }
    return null;
  }

  /** @internal The windows, the front one first. */
  windowsFrontFirst(): TabWindow[] {
    return [...this.parts.windows].sort((a, b) => zOf(b) - zOf(a));
  }

  /** @internal Where a drag let go away from every guide and strip lands: a window at the pointer (for a window moved, where it is); `null` when it may not float. */
  floatPlace(drag: TabDragSubject, x?: number, y?: number): TabDropPlace | null {
    if (drag.window) return { target: 'float', manager: this, group: null, index: -1, side: null, rect: drag.window.rect };
    if (drag.manager !== this || !this.maySubject(drag, 'float')) return null;
    const at = x === undefined || y === undefined ? null : { x, y };
    return { target: 'float', manager: this, group: null, index: -1, side: null, rect: this.floatRect(drag.group, at) };
  }

  /** @internal The room a document or group docked on `side` would take: the area there, or a band of its size. */
  dockAreaBox(side: TabDockSide): DOMRect {
    const area = this.parts.areas.get(side);
    if (area && !area.autoHidden) return area.element.getBoundingClientRect();
    const box = this.element.getBoundingClientRect();
    const across = side === 'left' || side === 'right';
    const raw = this.dockAreaSize[side];
    const text = String(raw).trim();
    const length = across ? box.width : box.height;
    const px = Math.min(length / 2, text.endsWith('%') ? (length * parseFloat(text)) / 100 : Number(raw) || 0);
    const start = (side === 'left') !== isRtl(this.element);
    if (side === 'top') return new DOMRect(box.left, box.top, box.width, px);
    if (side === 'bottom') return new DOMRect(box.left, box.bottom - px, box.width, px);
    return start ? new DOMRect(box.left, box.top, px, box.height) : new DOMRect(box.right - px, box.top, px, box.height);
  }

  private floatBy(doc: TabDocument | null, group: TabGroup, rect: TabRect | null, byUser: boolean, at: { x: number; y: number } | null = null): TabWindow | null {
    const parts = this.parts;
    if (!this.groups.includes(group) || (doc && doc.group !== group)) return null;
    if (!this.maySubject({ document: doc, group, manager: this, copy: false }, 'float')) return null;
    const host = this.hostOf(group);
    // A document alone in a window floats already.
    if (doc && host instanceof TabWindow && group.documents.length === 1 && this.hostGroups(host).length === 1) return null;
    const e: TabFloatingEventArgs = { document: doc, group, rect: rect ?? this.floatRect(group, at), byUser, cancel: false, source: this };
    parts.floating.fire(e);
    if (e.cancel || !this.groups.includes(group)) return null;
    this.restoreForChange();
    const w = this.createWindow(e.rect);
    const back = host instanceof TabDockArea ? host.side : null;
    let into: TabGroup;
    if (doc) {
      into = this.createGroup();
      this.setHostRoot(w, into);
      this.renderTree();
      // It goes back into its group, or (once that is gone) beside where it was.
      w.lastDock = { side: back, group };
      if (!this.moveDocument(doc, into, 0, byUser)) {
        this.discardWindow(w);
        return null;
      }
    } else {
      w.lastDock = { side: back, group: this.nearGroup(group) };
      const gone = this.takeOut(group);
      this.setHostRoot(w, group);
      this.renderTree();
      for (const split of gone) split.dispose();
      this.dropEmptyHosts(byUser);
      into = group;
    }
    if (w.lastDock.group === into) w.lastDock.group = null;
    this.useGroup(into, byUser);
    w.bringToFront();
    parts.floated.fire({ document: doc, group: into, window: w, byUser, source: this });
    this.layoutChanged('float', into, byUser, w);
    this.say('tabDocsFloated', { title: doc ? doc.title : this.textOf('tabDocsGroup', { n: this.groups.indexOf(into) + 1 }) });
    if (byUser) this.focusGroup(into);
    return w;
  }

  /** A group near `group` that stays where it is: its neighbour, else the documents' active one. */
  private nearGroup(group: TabGroup): TabGroup | null {
    const host = this.hostOf(group);
    const own = host === undefined ? [] : this.hostGroups(host).filter((g) => g !== group);
    return own[0] ?? this.parts.recentGroups.find((g) => g !== group && !g.window && !g.dockArea) ?? null;
  }

  private dockBy(target: TabDocument | TabGroup | TabWindow, side: TabDockSide | null, size: number | string | null, byUser: boolean): boolean {
    const parts = this.parts;
    const doc = target instanceof TabDocument ? target : null;
    const w = target instanceof TabWindow ? target : (doc ? doc.group : (target as TabGroup))?.window ?? null;
    const group = target instanceof TabWindow ? null : doc ? doc.group : (target as TabGroup);
    // A document not open yet opens in the dock area.
    const fresh = !!doc && !doc.isOpen;
    if (fresh ? !side : target instanceof TabWindow ? !parts.windows.includes(target) || !target.root : !group || !this.groups.includes(group) || (doc && doc.manager !== this)) return false;
    if (!side && !w) return false;
    const subject: TabDragSubject = { document: doc, group: group ?? this.hostGroups(w)[0], manager: this, copy: false, window: target instanceof TabWindow ? target : null };
    if (side && !this.maySubject(subject, side)) return false;
    if (side && group?.dockArea?.side === side && (!doc || group.documents.length === 1) && !w) return false;
    const e: TabDockingEventArgs = { document: doc, group: target instanceof TabWindow ? null : group, window: w, side, size, byUser, cancel: false, source: this };
    parts.docking.fire(e);
    if (e.cancel) return false;
    if (e.side && e.side !== side && !this.maySubject(subject, e.side)) return false;
    this.restoreForChange();
    parts.windowGone = 'docked';
    let into: TabGroup | null;
    try {
      into = e.side ? this.dockInto(target, e.side, e.size, byUser) : this.dockBack(target, w!, byUser);
      this.dropEmptyHosts(byUser);
    } finally {
      parts.windowGone = null;
    }
    if (!into) return false;
    const area = into.dockArea;
    this.useGroup(into, byUser);
    parts.docked.fire({ document: doc, group: into, area, side: area?.side ?? null, byUser, source: this });
    this.layoutChanged('dock', into, byUser, null, area);
    const title = doc ? doc.title : this.textOf('tabDocsGroup', { n: this.groups.indexOf(into) + 1 });
    if (area) this.say('tabDocsDocked', { title, area: this.textOf(AREA_TEXTS[area.side]) });
    else this.say('tabDocsDockedBack', { title, n: this.groups.indexOf(into) + 1 });
    if (byUser && !area?.autoHidden) this.focusGroup(into);
    return true;
  }

  /** Into the dock area of `side`: a document joins its group used last, a group or a window's layout goes along its long side. */
  private dockInto(target: TabDocument | TabGroup | TabWindow, side: TabDockSide, size: number | string | null, byUser: boolean): TabGroup | null {
    const parts = this.parts;
    let area = parts.areas.get(side) ?? null;
    const made = !area;
    if (!area) area = this.createArea(side, size ?? this.dockAreaSize[side]);
    const along: SplitDirection = area.orientation === 'horizontal' ? 'down' : 'right';
    if (target instanceof TabDocument) {
      const existing = !made ? (parts.recentGroups.find((g) => g.dockArea === area) ?? this.hostGroups(area)[0]) : null;
      let into = existing;
      if (!into) {
        into = this.createGroup();
        this.setHostRoot(area, into);
        this.renderTree();
      }
      const ok = target.manager === this ? this.moveDocument(target, into, undefined, byUser) : !!this.openDocument(target, { group: into }, byUser);
      if (!ok) {
        if (made) {
          area.root = null;
          this.controls.remove(into);
          this.removeArea(area);
        }
        return null;
      }
      return into;
    }
    const item = target instanceof TabWindow ? target.root! : target;
    const active = target instanceof TabWindow ? (parts.recentGroups.find((g) => g.window === target) ?? groupsIn(item)[0]) : target;
    const gone = this.takeOut(item);
    if (made) this.setHostRoot(area, item);
    else this.insertAtHostEdge(area, item, along);
    this.renderTree();
    for (const split of gone) split.dispose();
    return active;
  }

  /** Back where it was docked before it floated: into that group, else that dock area, else the documents' active group. */
  private dockBack(target: TabDocument | TabGroup | TabWindow, w: TabWindow, byUser: boolean): TabGroup | null {
    const back = w.lastDock;
    const into = back.group && this.groups.includes(back.group) && back.group.window !== w ? back.group : null;
    if (!into && back.side) return this.dockInto(target, back.side, null, byUser);
    const to = into ?? this.targetGroupOutside(w);
    if (!to) return null;
    if (target instanceof TabDocument) return this.moveDocument(target, to, undefined, byUser) ? to : null;
    const groups = target instanceof TabWindow ? this.hostGroups(w) : [target];
    const active = target instanceof TabWindow ? this.parts.recentGroups.find((g) => g.window === w)?.activeDocument : target.activeDocument;
    for (const g of groups) {
      let at = to.tabs.length;
      for (const d of [...g.documents]) if (this.moveDocument(d, to, at, byUser)) at = to.documents.indexOf(d) + 1;
    }
    if (active?.group === to) this.activateDocument(active, false, byUser);
    return to;
  }

  /** The documents' group a window's documents go to: the one used last, not in a window or a dock area. */
  private targetGroupOutside(w: TabWindow): TabGroup | null {
    return this.parts.recentGroups.find((g) => !g.window && !g.dockArea && !g.locked) ?? this.hostGroups(null)[0] ?? null;
  }

  private autoHideBy(area: TabDockArea, on: boolean, byUser: boolean): boolean {
    const parts = this.parts;
    if (parts.areas.get(area.side) !== area) return false;
    if (area.autoHidden === on) return true;
    if (on && !this.mayAutoHide(area)) return false;
    const e: TabAutoHidingEventArgs = { area, on, byUser, cancel: false, source: this };
    parts.autoHiding.fire(e);
    if (e.cancel) return false;
    const focus = deepActiveElement();
    const hadFocus = !!focus && area.element.contains(focus);
    if (parts.slide?.area === area) this.stopSlide();
    area.markFolded(on);
    this.renderDock();
    parts.autoHidden.fire({ area, on, byUser, source: this });
    this.layoutChanged('autoHide', null, byUser, null, area);
    this.say(on ? 'tabDocsAutoHidden' : 'tabDocsAutoHideShown', { area: this.textOf(AREA_TEXTS[area.side]) });
    if (on && hadFocus) {
      const next = parts.recentGroups.find((g) => g.dockArea !== area) ?? this.hostGroups(null)[0];
      if (next) this.focusGroup(next);
    } else if (!on && byUser) {
      const group = parts.recentGroups.find((g) => g.dockArea === area) ?? this.hostGroups(area)[0];
      if (group) this.focusGroup(group);
    }
    return true;
  }

  /** Slides a folded area out with `doc` shown; `hover`: the pointer rests on its title, focus stays. */
  private slideOut(doc: TabDocument, byUser: boolean, hover: boolean): boolean {
    const parts = this.parts;
    const area = doc.manager === this ? doc.dockArea : null;
    if (!area || !area.autoHidden) return false;
    if (parts.slide?.area === area) {
      if (!hover) parts.slide.hover = false;
      if (doc.group?.activeDocument !== doc) this.activateDocument(doc, false, byUser);
      if (byUser && !hover) this.parts.tabs.get(doc)?.focusContent();
      return true;
    }
    const e: TabSlideEventArgs = { area, document: doc, open: true, byUser, cancel: false, source: this };
    parts.slideChanging.fire(e);
    if (e.cancel) return false;
    this.stopSlide();
    area.markOpen(true);
    this.renderDock();
    this.activateDocument(doc, false, byUser);
    parts.slide = { area, hover, stop: this.watchSlide(area) };
    parts.slideChanged.fire({ area, document: doc, open: true, byUser, cancel: false, source: this });
    this.say('tabDocsSlidOut', { title: doc.title });
    if (byUser && !hover) this.parts.tabs.get(doc)?.focusContent();
    return true;
  }

  private slideBack(byUser: boolean, focusStrip = false): boolean {
    const parts = this.parts;
    const slide = parts.slide;
    if (!slide) return false;
    const area = slide.area;
    const e: TabSlideEventArgs = { area, document: null, open: false, byUser, cancel: false, source: this };
    parts.slideChanging.fire(e);
    if (e.cancel) return false;
    const focus = deepActiveElement();
    const hadFocus = !!focus && area.element.contains(focus);
    this.stopSlide();
    parts.slideChanged.fire({ area, document: null, open: false, byUser, cancel: false, source: this });
    if (hadFocus || focusStrip) {
      if (!(focusStrip && area.strip?.focusActive())) {
        const next = parts.recentGroups.find((g) => g.dockArea !== area) ?? this.hostGroups(null)[0];
        next?.restoreFocus();
      }
    }
    return true;
  }

  /** Closes the slid out area without asking (it is going away, or another one slides out). */
  private stopSlide(): void {
    const parts = this.parts;
    const slide = parts.slide;
    if (!slide) return;
    parts.slide = null;
    slide.stop();
    slide.area.markOpen(false);
    this.renderDock();
  }

  /**
   * While an area is slid out: a press outside it, Escape in it, or focus leaving it closes it. A
   * menu or a popup opened from it (the tab's menu, a list) counts as inside.
   */
  private watchSlide(area: TabDockArea): () => void {
    const doc = this.element.ownerDocument;
    const inside = (node: EventTarget | null) =>
      node instanceof Node && (area.element.contains(node) || !!area.strip?.element.contains(node) || !!(node instanceof Element && node.closest('.mx-popup')));
    const press = (e: Event) => {
      if (!inside(e.target)) untracked(() => this.slideBack(true));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || !inside(e.target)) return;
      e.preventDefault();
      untracked(() => this.slideBack(true, true));
    };
    const leave = (e: FocusEvent) => {
      // Focus going to the page around, not to the area's own strip.
      if (e.relatedTarget && !inside(e.relatedTarget)) untracked(() => this.slideBack(true));
    };
    doc.addEventListener('pointerdown', press, true);
    area.element.addEventListener('keydown', key);
    area.element.addEventListener('focusout', leave);
    return () => {
      doc.removeEventListener('pointerdown', press, true);
      area.element.removeEventListener('keydown', key);
      area.element.removeEventListener('focusout', leave);
    };
  }

  /** @internal The pointer left a title and the area it slid out by resting on it: it slides back, unless focus went in. */
  slideHoverEnded(area: TabDockArea): void {
    untracked(() => {
      const slide = this.parts.slide;
      const focus = deepActiveElement();
      if (slide?.area === area && slide.hover && !(focus && area.element.contains(focus))) this.slideBack(true);
    });
  }

  /** @internal A title in a folded area's strip was chosen. */
  slideByUser(doc: TabDocument, hover: boolean): void {
    untracked(() => {
      const slide = this.parts.slide;
      // A click on the title of the document shown closes it again.
      if (!hover && slide && !slide.hover && slide.area === doc.dockArea && doc.group?.activeDocument === doc) this.slideBack(true, true);
      else this.slideOut(doc, true, hover);
    });
  }

  /** @internal The area slid out now. */
  get slidArea(): TabDockArea | null {
    return this.parts.slide?.area ?? null;
  }

  private maximizeWindowBy(w: TabWindow, on: boolean, byUser: boolean): boolean {
    if (!this.parts.windows.includes(w)) return false;
    if (w.isMaximized === on) return true;
    const change = on ? 'maximizeWindow' : 'restoreWindow';
    if (!this.windowChanging(change, w, byUser)) return false;
    w.markMaximized(on);
    if (!on) this.keepWindowInView(w);
    w.bringToFront();
    this.windowChanged(change, w, byUser);
    this.say(on ? 'tabDocsWindowMaximized' : 'tabDocsWindowRestored');
    return true;
  }

  private async closeWindowBy(w: TabWindow, byUser: boolean): Promise<boolean> {
    const parts = this.parts;
    if (!parts.windows.includes(w)) return false;
    const e: TabWindowClosingEventArgs = { window: w, byUser, cancel: false, source: this };
    parts.windowClosing.fire(e);
    if (e.cancel) return false;
    parts.closingWindows.add(w);
    try {
      for (const doc of untracked(() => [...w.documents])) {
        if (!(await untracked(() => this.closeDocument(doc, byUser)))) return false;
      }
    } finally {
      parts.closingWindows.delete(w);
    }
    untracked(() => {
      if (!parts.windows.includes(w)) return;
      // Its empty groups (closeEmptyWindows off, or groups kept empty) go with it.
      const groups = this.hostGroups(w);
      w.root = null;
      for (const g of groups) {
        parts.recentGroups = parts.recentGroups.filter((r) => r !== g);
        g.disposeTabs();
        this.controls.remove(g);
      }
      this.renderTree();
      if (this.activeGroup && groups.includes(this.activeGroup)) {
        this.setProperty('activeGroup', null);
        const next = parts.recentGroups[0] ?? this.groups[0];
        if (next) this.useGroup(next, false);
      }
      this.removeWindow(w, 'closed', byUser);
    });
    return true;
  }

  private focusPartBy(by: 1 | -1): boolean {
    const parts = this.parts;
    const hosts: Host[] = [null, ...this.orderedAreas().filter((a) => a.root && !a.autoHidden), ...this.windowsFrontFirst().reverse().filter((w) => w.root)];
    if (hosts.length < 2) return false;
    const focus = deepActiveElement();
    const current = this.activeGroup ? this.hostOf(this.activeGroup) : null;
    let at = hosts.indexOf(current === undefined ? null : current);
    if (focus && !this.element.contains(focus)) at = by === 1 ? -1 : 0;
    const next = hosts[(at + by + hosts.length) % hosts.length];
    if (next instanceof TabWindow) return this.focusWindow(next);
    const group = parts.recentGroups.find((g) => this.hostOf(g) === next) ?? this.hostGroups(next)[0];
    return !!group && this.focusGroup(group);
  }

  /** @internal The pin of a group in a dock area. */
  toggleAutoHideByUser(group: TabGroup): void {
    untracked(() => {
      const area = group.dockArea;
      if (area) this.autoHideBy(area, !area.autoHidden, true);
    });
  }

  /** @internal */
  toggleWindowMaximizeByUser(group: TabGroup): void {
    untracked(() => {
      const w = group.window;
      if (w) this.maximizeWindowBy(w, !w.isMaximized, true);
    });
  }

  /** @internal */
  closeWindowByUser(group: TabGroup): void {
    const w = untracked(() => group.window);
    if (w) void this.closeWindowBy(w, true);
  }

  /** @internal "Move window…" from the keys. */
  moveWindowByKeys(group: TabGroup | null): boolean {
    const w = group?.window;
    return !!w && !!this.parts.windowKeys?.start(w);
  }

  private disposeSplits(item: LayoutItem | null): void {
    if (!(item instanceof TabSplit)) return;
    item.children.forEach((c) => this.disposeSplits(c));
    item.dispose();
  }

  /** Makes a group the active one. */
  private useGroup(group: TabGroup, byUser: boolean, report = true): void {
    const parts = this.parts;
    const previous = this.activeGroup;
    if (previous === group) return;
    if (parts.maximized && parts.maximized !== group) this.restoreForChange();
    const before = previous?.activeDocument ?? null;
    previous?.markActive(false);
    group.markActive(true);
    parts.recentGroups = [group, ...parts.recentGroups.filter((g) => g !== group)];
    this.setProperty('activeGroup', group);
    const now = group.activeDocument;
    if (report && now !== before) this.fireActivated(now, before, group, byUser);
  }

  private maximizeBy(group: TabGroup, byUser: boolean, quiet = false): boolean {
    const parts = this.parts;
    if (!this.groups.includes(group) || !this.canMaximize(group)) return false;
    if (parts.maximized === group) return true;
    if (!quiet && !this.layoutChanging('maximize', group, byUser)) return false;
    if (parts.maximized) this.unmaximize();
    for (let node: LayoutItem = group; node.parentSplit; node = node.parentSplit) {
      node.element.style.flex = '1 1 0px';
      for (const el of node.parentSplit.element.children) {
        if (el !== node.element && !(el as HTMLElement).hidden) {
          (el as HTMLElement).hidden = true;
          parts.hidden.push(el as HTMLElement);
        }
      }
    }
    parts.maximized = group;
    group.markMaximized(true);
    this.element.toggleAttribute('data-maximized', true);
    this.setProperty('maximizedGroup', group);
    this.useGroup(group, byUser);
    if (!quiet) {
      this.layoutChanged('maximize', group, byUser);
      this.say('tabDocsMaximized', { n: this.groups.indexOf(group) + 1 });
    }
    return true;
  }

  private restoreBy(byUser: boolean): boolean {
    const group = this.parts.maximized;
    if (!group || !this.layoutChanging('restore', group, byUser)) return false;
    this.unmaximize();
    this.layoutChanged('restore', group, byUser);
    this.say('tabDocsRestored');
    return true;
  }

  /** Another group is used, split or closed: a maximized group gives the room back first. */
  private restoreForChange(): void {
    const group = this.parts.maximized;
    if (!group) return;
    this.unmaximize();
    this.layoutChanged('restore', group, false);
  }

  private unmaximize(): void {
    const parts = this.parts;
    for (const el of parts.hidden.splice(0)) el.hidden = false;
    parts.maximized?.markMaximized(false);
    parts.maximized = null;
    this.element.removeAttribute('data-maximized');
    this.setProperty('maximizedGroup', null);
    this.renderTree();
  }

  private layoutChanging(change: TabLayoutChange, group: TabGroup | null, byUser: boolean, window: TabWindow | null = null, area: TabDockArea | null = null): boolean {
    const e: LayoutChangingEventArgs = { change, group, window, area, byUser, cancel: false, source: this };
    this.parts.layoutChanging.fire(e);
    return !e.cancel;
  }

  private layoutChanged(change: TabLayoutChange, group: TabGroup | null, byUser: boolean, window: TabWindow | null = null, area: TabDockArea | null = null): void {
    this.parts.layoutChanged.fire({ change, group, window, area, byUser, source: this });
  }

  /** @internal A floating window is about to move, be resized…: `onLayoutChanging` may stop it. */
  windowChanging(change: TabLayoutChange, window: TabWindow, byUser: boolean): boolean {
    return this.layoutChanging(change, null, byUser, window);
  }

  /** @internal */
  windowChanged(change: TabLayoutChange, window: TabWindow, byUser: boolean): void {
    this.layoutChanged(change, null, byUser, window);
  }

  // Layout as JSON.

  private writeNode(item: LayoutItem): TabLayoutNode {
    if (item instanceof TabSplit) {
      return { kind: 'split', orientation: item.orientation, sizes: [...item.sizes], children: item.children.map((c) => this.writeNode(c)) };
    }
    const tabs = item.tabs;
    const documents = tabs.map((t): TabLayoutDocument => {
      const doc = t.document;
      const saved: TabLayoutDocument = { id: doc.id, type: doc.type, title: doc.title };
      if (doc.state !== undefined) saved.state = doc.state;
      if (doc.pinned) saved.pinned = true;
      if (doc.preview) saved.preview = true;
      return saved;
    });
    const group: TabLayoutGroup = { kind: 'group', documents, active: item.activeTab ? tabs.indexOf(item.activeTab) : -1, recent: item.recentTabs.map((t) => tabs.indexOf(t)) };
    if (item.locked) group.locked = true;
    if (!item.allowDrop) group.allowDrop = false;
    if (item.dropSides) group.dropSides = [...item.dropSides];
    return group;
  }

  private readNode(node: TabLayoutNode, factory: TabLayoutFactory | undefined, made: Map<string, TabDocument>): LayoutItem {
    if (node.kind === 'split') {
      const children = (node.children ?? []).map((c) => this.readNode(c, factory, made));
      if (children.length === 1) return children[0];
      const split = new TabSplit(this, node.orientation === 'vertical' ? 'vertical' : 'horizontal');
      const given = node.sizes?.length === children.length ? node.sizes.map((s) => Math.max(0, Number(s) || 0)) : [];
      const total = given.reduce((a, b) => a + b, 0);
      split.children = children;
      split.sizes = total > 0 ? given.map((s) => s / total) : children.map(() => 1 / children.length);
      for (const child of children) child.parentSplit = split;
      if (!children.length) {
        const group = this.createGroup();
        split.children = [group];
        split.sizes = [1];
        group.parentSplit = split;
      }
      return split;
    }
    const group = this.createGroup();
    if (node.locked) group.locked = true;
    if (node.allowDrop === false) group.allowDrop = false;
    if (node.dropSides) group.dropSides = node.dropSides;
    for (const saved of node.documents ?? []) {
      const first = made.get(saved.id);
      const doc = first && first.canCopy(!!this.factory) ? first.makeCopy() : this.restoreDocument(saved, factory);
      if (!doc || doc.isOpen) continue;
      if (first) {
        doc.pinned = !!saved.pinned;
        doc.preview = !!saved.preview;
      } else {
        made.set(saved.id, doc);
      }
      this.insertTab(doc, group, group.tabs.length);
    }
    const active = group.tabs[node.active] ?? group.tabs[0];
    if (active) group.showTab(active);
    if (node.recent) group.restoreRecent(node.recent);
    return group;
  }

  private restoreDocument(saved: TabLayoutDocument, factory: TabLayoutFactory | undefined): TabDocument | null {
    const base: TabDocumentOptions = { id: saved.id, type: saved.type, title: saved.title, state: saved.state, pinned: saved.pinned, preview: saved.preview };
    if (!factory) return new TabDocument(base);
    const made = factory(saved);
    if (!made) return null;
    if (made instanceof TabDocument) return made;
    if (made instanceof ComponentBase) return new TabDocument({ ...base, content: made });
    return new TabDocument({ ...base, ...made });
  }

  // Keys.

  private registerKeys(): void {
    const parts = this.parts;
    for (const stop of parts.keyStops.splice(0)) stop();
    const keys = untracked(() => this.keys);
    const add = (chord: string, run: (e: KeyboardEvent) => boolean) => {
      try {
        parts.keyStops.push(addShortcut(chord, (e) => untracked(() => run(e)), { scope: this }));
      } catch {
        // A chord without a key is left out.
      }
    };
    const each = (name: keyof TabDocumentKeys, run: (e: KeyboardEvent) => boolean) => {
      for (const chord of keys[name] ?? []) add(chord, run);
    };
    const withActive = (run: (doc: TabDocument, group: TabGroup) => void) => () => {
      const doc = this.activeDocument;
      if (doc && doc.group) run(doc, doc.group);
      return !!doc;
    };
    each('nextTab', (e) => this.stepByKey(1, e));
    each('previousTab', (e) => this.stepByKey(-1, e));
    each(
      'closeTab',
      withActive((doc) => void this.closeDocument(doc, true)),
    );
    each('closeAllTabs', () => !!this.activeGroup && (void this.closeMany([...this.activeGroup.documents], undefined, true), true));
    each('closeSavedTabs', () => !!this.activeGroup && (void this.closeMany(this.activeGroup.documents.filter((d) => !d.dirty), undefined, true), true));
    for (const chord of keys.focusGroup ?? []) {
      for (let n = 1; n <= 9; n++) add(chord.replace('{n}', String(n)), () => this.focusGroup(n - 1));
    }
    each('splitRight', () => {
      const group = this.activeGroup;
      if (group) this.splitByUser(group, 'right');
      return !!group;
    });
    each('recentNext', (e) => this.recentKey(1, e));
    each('recentPrevious', (e) => this.recentKey(-1, e));
    each('goBack', () => this.travel(-1, true));
    each('goForward', () => this.travel(1, true));
    each('reopenClosed', () => !!this.reopenBy(true));
    each(
      'keepOpen',
      withActive((doc) => this.keepBy(doc, true)),
    );
    each(
      'togglePin',
      withActive((doc) => this.pinBy(doc, !doc.pinned, true)),
    );
    each('showOpenList', () => this.showOpenList());
    each('stripNext', (e) => this.stripKey(e, 1));
    each('stripPrevious', (e) => this.stripKey(e, -1));
    each('stripFirst', (e) => this.stripKey(e, 'first'));
    each('stripLast', (e) => this.stripKey(e, 'last'));
    each('closeFocusedTab', (e) => {
      const tab = this.tabAt(e.target);
      if (!tab) return false;
      void this.closeDocument(tab.document, true);
      return true;
    });
    const withTab = (run: (doc: TabDocument) => boolean) => (e: KeyboardEvent) => {
      const doc = this.tabAt(e.target)?.document ?? this.activeDocument;
      return !!doc && doc.manager === this && (run(doc), true);
    };
    each(
      'moveTabLeft',
      withTab((doc) => this.moveInGroupBy(doc, -1, true)),
    );
    each(
      'moveTabRight',
      withTab((doc) => this.moveInGroupBy(doc, 1, true)),
    );
    each(
      'moveToNextGroup',
      withTab((doc) => this.moveToGroupBy(doc, 'next', true)),
    );
    each(
      'moveToPreviousGroup',
      withTab((doc) => this.moveToGroupBy(doc, 'previous', true)),
    );
    for (const side of ['Left', 'Right', 'Up', 'Down'] as const) {
      each(
        `moveToGroup${side}`,
        withTab((doc) => this.moveToGroupBy(doc, side.toLowerCase() as SplitDirection, true)),
      );
    }
    each(
      'moveTo',
      withTab((doc) => this.showMoveTo(doc)),
    );
    each(
      'float',
      withTab((doc) => !!this.floatBy(doc, doc.group!, null, true)),
    );
    each(
      'dock',
      withTab((doc) => this.dockBy(doc, null, null, true)),
    );
    for (const side of ['Left', 'Right', 'Top', 'Bottom'] as const) {
      each(
        `dock${side}`,
        withTab((doc) => this.dockBy(doc, side.toLowerCase() as TabDockSide, null, true)),
      );
    }
    each(
      'toggleAutoHide',
      withTab((doc) => {
        const area = doc.dockArea;
        return !!area && this.autoHideBy(area, !area.autoHidden, true);
      }),
    );
    each('nextPart', () => this.focusPartBy(1));
    each('previousPart', () => this.focusPartBy(-1));
    each('moveWindow', () => this.moveWindowByKeys(this.activeGroup));
    each('maximizeWindow', () => {
      const w = this.activeGroup?.window;
      return !!w && (this.maximizeWindowBy(w, !w.isMaximized, true), true);
    });
    each('closeWindow', () => {
      const w = this.activeGroup?.window;
      if (w) void this.closeWindowBy(w, true);
      return !!w;
    });
    each('resizeSmaller', (e) => this.sashKey(e, -1));
    each('resizeLarger', (e) => this.sashKey(e, 1));
    each('resizeMin', (e) => this.sashKey(e, Number.NEGATIVE_INFINITY));
    each('resizeMax', (e) => this.sashKey(e, Number.POSITIVE_INFINITY));
  }

  /** The recent list's key: opens the list, or walks it while it is open. */
  private recentKey(by: 1 | -1, e: KeyboardEvent): boolean {
    const list = this.parts.recentList;
    if (list?.isOpen) {
      list.walk(by);
      return true;
    }
    return this.showRecentList(by, e);
  }

  /** The tab of this manager (not of one inside it) whose header is `target`. */
  private tabAt(target: EventTarget | null): DocumentTab | undefined {
    const header = target instanceof Element ? target.closest('.mx-tabdocs__tab') : null;
    if (!header) return undefined;
    for (const tab of this.parts.tabs.values()) if (tab.header === header) return tab;
    return undefined;
  }

  private stepByKey(by: number, e: KeyboardEvent): boolean {
    const group = this.activeGroup;
    if (!group || group.tabs.length < 2) return false;
    const inStrip = !!this.tabAt(e.target);
    if (!this.step(group, by, !inStrip, true)) return true;
    if (inStrip) group.activeTab?.header.focus();
    return true;
  }

  private stripKey(e: KeyboardEvent, to: 1 | -1 | 'first' | 'last'): boolean {
    const tab = this.tabAt(e.target);
    const group = tab?.group;
    if (!tab || !group) return false;
    const tabs = group.tabs;
    const at = tabs.indexOf(tab);
    let by = to;
    // Right to left, the arrows point the other way.
    if (typeof by === 'number' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const view = this.element.ownerDocument.defaultView;
      if (view?.getComputedStyle(group.listElement).direction === 'rtl') by = -by as 1 | -1;
    }
    const next = by === 'first' ? tabs[0] : by === 'last' ? tabs[tabs.length - 1] : tabs[(at + by + tabs.length) % tabs.length];
    if (!next) return true;
    next.header.focus();
    if (this.activation === 'auto') this.activateDocument(next.document, false, true);
    return true;
  }

  private sashKey(e: KeyboardEvent, by: number): boolean {
    const target = e.target instanceof Element ? e.target.closest('.mx-tabdocs__sash') : null;
    const sash = SplitSash.of(target);
    if (!sash) return false;
    const owner = sash.split;
    if (!this.beginResize(owner)) return true;
    const rtl = owner.orientation === 'horizontal' && owner.rtl && (e.key === 'ArrowLeft' || e.key === 'ArrowRight');
    // Home and End: as far as it goes, the same for a split and a dock area.
    const step = Number.isFinite(by) ? by * this.resizeStep : by * 1e6;
    owner.resizeBy(sash.index, rtl ? -step : step);
    this.endResize(true, owner);
    return true;
  }

  // Rendering.

  private renderTexts(): void {
    this.groups.forEach((group, i) => group.renderTexts(i + 1));
    const each = (item: LayoutItem | null) => {
      if (!(item instanceof TabSplit)) return;
      item.renderSashes();
      item.children.forEach(each);
    };
    each(this.parts.root);
    this.parts.windows.forEach((w, i) => {
      w.element.setAttribute('aria-label', this.textOf('tabDocsWindow', { n: i + 1 }));
      each(w.root);
    });
    for (const area of this.parts.areas.values()) each(area.root);
  }

  private renderMinSizes(): void {
    for (const group of untracked(() => this.groups)) this.sizeGroup(group);
  }

  /**
   * The sizes the props give a group and its tabs. Written on each group, not on the root, whose
   * inline style is the app's to set (`style.cssText`).
   */
  private sizeGroup(group: TabGroup): void {
    const style = group.element.style;
    const max = this.peekProperty<number>('tabMaxWidth') ?? 0;
    style.setProperty('--_min-width', `${this.peekProperty<number>('minGroupWidth') ?? 160}px`);
    style.setProperty('--_min-height', `${this.peekProperty<number>('minGroupHeight') ?? 100}px`);
    style.setProperty('--_tab-min', `${this.peekProperty<number>('tabMinWidth') ?? 80}px`);
    style.setProperty('--_tab-fixed', `${this.peekProperty<number>('tabFixedWidth') ?? 160}px`);
    if (max > 0) style.setProperty('--_tab-max', `${max}px`);
    else style.removeProperty('--_tab-max');
  }

  /** The strip's look: how tabs are sized, where pinned ones go, wrapping and scroll buttons. */
  private renderStrip(): void {
    const el = this.element;
    const data = el.dataset;
    data.tabSize = this.peekProperty<TabSize>('tabSize') ?? 'fit';
    data.pinnedSize = this.peekProperty<PinnedTabSize>('pinnedTabSize') ?? 'normal';
    el.toggleAttribute('data-pinned-row', !!this.peekProperty('pinnedTabsOnSeparateRow'));
    el.toggleAttribute('data-wrap', !!this.peekProperty('wrapTabs'));
    el.toggleAttribute('data-scroll-buttons', this.peekProperty('scrollButtons') !== false);
    for (const group of untracked(() => this.groups)) {
      this.sizeGroup(group);
      group.queueOverflow();
    }
  }

  /** A polite announcement for screen readers. */
  private say(key: keyof UiStrings, values?: Record<string, unknown>): void {
    this.sayText(this.textOf(key, values));
  }

  /** @internal */
  sayText(text: string): void {
    if (!this.announce) return;
    const live = this.parts.live;
    live.textContent = '';
    queueMicrotask(() => (live.textContent = text));
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const el = this.element;
    el.classList.add('mx-tabdocs');
    const live = el.ownerDocument.createElement('div');
    live.className = 'mx-tabdocs__live';
    live.setAttribute('aria-live', 'polite');
    el.append(live);
    const parts: Parts = {
      root: null,
      tabs: new Map(),
      recentGroups: [],
      maximized: null,
      hidden: [],
      live,
      keyStops: [],
      history: [],
      at: -1,
      travelling: false,
      closed: [],
      menus: null,
      openList: null,
      recentList: null,
      drag: null,
      moveKeys: null,
      marks: new DropMarks(el),
      layoutTarget: null,
      targets: [],
      dropResult: null,
      areas: new Map(),
      order: [],
      windows: [],
      dockTarget: null,
      windowKeys: null,
      sizeWatch: null,
      slide: null,
      windowGone: null,
      closingWindows: new Set(),
      floating: new Emitter(),
      floated: new Emitter(),
      docking: new Emitter(),
      docked: new Emitter(),
      autoHiding: new Emitter(),
      autoHidden: new Emitter(),
      slideChanging: new Emitter(),
      slideChanged: new Emitter(),
      windowClosing: new Emitter(),
      windowClosed: new Emitter(),
      opening: new Emitter(),
      opened: new Emitter(),
      closing: new Emitter(),
      closed_: new Emitter(),
      activating: new Emitter(),
      activated: new Emitter(),
      moving: new Emitter(),
      moved: new Emitter(),
      splitting: new Emitter(),
      split: new Emitter(),
      layoutChanging: new Emitter(),
      layoutChanged: new Emitter(),
      keeping: new Emitter(),
      kept: new Emitter(),
      pinning: new Emitter(),
      pinned: new Emitter(),
      unpinning: new Emitter(),
      unpinned: new Emitter(),
      locking: new Emitter(),
      locked: new Emitter(),
      unlocking: new Emitter(),
      unlocked: new Emitter(),
      menuOpening: new Emitter(),
      dragStarting: new Emitter(),
      dragOver: new Emitter(),
      dropping: new Emitter(),
      dropped: new Emitter(),
      dragEnded: new Emitter(),
    };
    return parts;
  }
}

/** The groups of a branch of the layout, in order. */
function groupsIn(item: LayoutItem): TabGroup[] {
  return item instanceof TabSplit ? item.children.flatMap(groupsIn) : [item];
}

/** The group whose strip is a window's title: the one at its top end corner. */
function titleGroup(item: LayoutItem): TabGroup {
  if (item instanceof TabGroup) return item;
  return titleGroup(item.orientation === 'horizontal' ? item.children[item.children.length - 1] : item.children[0]);
}

/** The top of a window's or a dock area's tree, filling what holds it. */
function placeRoot(holder: HTMLElement, item: LayoutItem): void {
  placeNode(holder, item.element, holder.firstChild);
  item.element.style.flex = '1 1 0px';
}

/** A window's place in the page's window stack. */
function zOf(w: TabWindow): number {
  return Number(w.element.style.getPropertyValue('--_mx-z')) || 0;
}

function contains(box: DOMRect, x: number, y: number): boolean {
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
}

function isRtl(el: Element): boolean {
  const view = el.ownerDocument.defaultView;
  return !!view && view.getComputedStyle(el).direction === 'rtl';
}

/** The name of each side's dock area. */
const AREA_TEXTS: Record<TabDockSide, keyof UiStrings> = {
  left: 'tabDocsAreaLeft',
  right: 'tabDocsAreaRight',
  top: 'tabDocsAreaTop',
  bottom: 'tabDocsAreaBottom',
};

/**
 * Dropped at `index` of a strip: whether the document lands among the pinned tabs (`true`), among
 * the others (`false`), or on the border between them (`null`: it stays as it is).
 */
function pinAt(group: TabGroup, doc: TabDocument, index: number): boolean | null {
  const pinned = group.tabs.filter((t) => t.document !== doc && t.document.pinned).length;
  return index < pinned ? true : index > pinned ? false : null;
}

/** Whether the page runs as an installed app, where the browser leaves the editor keys to it. */
function runsInstalled(view: Window | null): boolean {
  return !!view?.matchMedia?.('(display-mode: standalone), (display-mode: window-controls-overlay)').matches;
}
