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
import type { GroupLockedEventArgs } from './group-locked-event-args';
import type { GroupLockingEventArgs } from './group-locking-event-args';
import type { GroupSplitEventArgs } from './group-split-event-args';
import type { GroupSplittingEventArgs } from './group-splitting-event-args';
import type { LayoutChangedEventArgs } from './layout-changed-event-args';
import type { LayoutChangingEventArgs } from './layout-changing-event-args';
import type { LayoutItem } from './layout-item';
import type { PinnedTabSize } from './pinned-tab-size';
import { placeNode } from './place-node';
import type { SplitDirection } from './split-direction';
import type { TabAfterClose } from './tab-after-close';
import type { TabCloseButton } from './tab-close-button';
import type { TabContentFactory } from './tab-content-factory';
import type { TabContextMenuEventArgs } from './tab-context-menu-event-args';
import { TabDocument } from './TabDocument';
import type { TabDocumentKeys } from './tab-document-keys';
import type { TabDocumentManagerProps } from './tab-document-manager-props';
import type { TabDocumentOptions } from './tab-document-options';
import { TabGroup } from './TabGroup';
import { BROWSER_KEYS, DESKTOP_KEYS } from './tab-keys';
import type { TabKeyPreset } from './tab-key-preset';
import type { TabLayout } from './tab-layout';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabLayoutDocument } from './tab-layout-document';
import type { TabLayoutFactory } from './tab-layout-factory';
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
      for (const stop of parts.keyStops.splice(0)) stop();
      for (const [doc, tab] of parts.tabs) {
        doc.placeIn(null, null);
        tab.dispose();
      }
      parts.tabs.clear();
      parts.closed = [];
      parts.history = [];
      this.disposeSplits(parts.root);
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
    return untracked(() => this.activateDocument(document, focus, false));
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

  /** Moves a document to the next or previous group, splitting its group when there is none that way. */
  moveToGroup(document: TabDocument, which: 'next' | 'previous'): boolean {
    return untracked(() => this.moveToGroupBy(document, which, false));
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
   * Opens a new group beside `group`; `document` moves into it, or a copy of it opens there when it
   * may be open twice and `splitCopies` is on. Returns the new group, `null` when `onSplitting` cancels.
   */
  split(group: TabGroup, direction: SplitDirection, document?: TabDocument): TabGroup | null {
    return untracked(() => this.splitGroup(group, direction, document ?? null, false));
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
      return {
        version: 1,
        root: this.writeNode(this.parts.root!),
        activeGroup: Math.max(0, groups.indexOf(this.activeGroup!)),
        maximizedGroup: this.parts.maximized ? groups.indexOf(this.parts.maximized) : null,
      };
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
      for (const [doc, tab] of parts.tabs) {
        doc.placeIn(null, null);
        tab.dispose();
      }
      parts.tabs.clear();
      const old = parts.root;
      const oldGroups = [...this.groups];
      const root = this.readNode(layout.root, factory, new Map());
      if (old) placeNode(this.element, root.element, old.element);
      this.setRoot(root);
      this.disposeSplits(old);
      for (const group of oldGroups) this.controls.remove(group);
      parts.recentGroups = [];
      parts.history = [];
      parts.at = -1;
      parts.closed = [];
      this.renderHistory();
      this.setProperty('activeGroup', null);
      this.renderTree();
      const groups = this.groups;
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

  /** @internal A double click on the empty strip makes a new document there. */
  stripDoubleClicked(group: TabGroup): void {
    untracked(() => this.openNewBy(group, true));
  }

  /** @internal */
  contextMenuOpening(e: TabContextMenuEventArgs): void {
    this.parts.menuOpening.fire(e);
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
  beginResize(): boolean {
    return this.layoutChanging('resize', null, true);
  }

  /** @internal */
  endResize(moved: boolean): void {
    if (moved) this.layoutChanged('resize', null, true);
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
    const removed = !group.tabs.length && this.closeEmptyGroups && this.groups.length > 1;
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

  /** A closed document leaves the history, and is kept for `reopenClosed` when its content can be made again. */
  private remember(doc: TabDocument, group: TabGroup, index: number): void {
    const parts = this.parts;
    const before = parts.history.slice(0, parts.at + 1).filter((d) => d !== doc).length;
    parts.history = parts.history.filter((d) => d !== doc);
    parts.at = Math.min(before - 1, parts.history.length - 1);
    this.setProperty(
      'recentDocuments',
      this.recentDocuments.filter((d) => d !== doc),
    );
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
      if (!from.tabs.length && this.closeEmptyGroups && this.groups.length > 1) {
        this.removeGroup(from);
        this.layoutChanged('closeGroup', from, byUser);
      }
    }
    parts.moved.fire({ document: doc, from, fromIndex, to: group, toIndex: group.tabs.indexOf(tab), byUser, source: this });
    if (from !== group) this.say('tabDocsMoved', { title: doc.title, n: this.groups.indexOf(group) + 1 });
    if (doc.preview) this.keepBy(doc, byUser);
    if (hadFocus) tab.header.focus();
    return true;
  }

  private moveToGroupBy(doc: TabDocument, which: 'next' | 'previous', byUser: boolean): boolean {
    const from = doc.group;
    if (!from || doc.manager !== this) return false;
    const groups = this.groups;
    const target = groups[groups.indexOf(from) + (which === 'next' ? 1 : -1)];
    if (target) {
      const ok = this.moveDocument(doc, target, undefined, byUser);
      if (ok && byUser) this.focusGroup(target);
      return ok;
    }
    const made = this.splitGroup(from, which === 'next' ? 'right' : 'left', doc, byUser, false);
    if (made && byUser) this.focusGroup(made);
    return !!made;
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
    if (active && !active.locked) return active;
    return parts.recentGroups.find((g) => !g.locked) ?? this.groups.find((g) => !g.locked) ?? active ?? this.groups[0];
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
    this.controls.add(group);
    return group;
  }

  /** `copy`: a copy of the document opens in the new group (when it can be copied); else it moves there. */
  private splitGroup(group: TabGroup, direction: SplitDirection, doc: TabDocument | null, byUser: boolean, copy = !!doc && this.copiesOnSplit(doc)): TabGroup | null {
    const parts = this.parts;
    if (!this.groups.includes(group)) return null;
    const document = doc && parts.tabs.has(doc) ? doc : null;
    const e: GroupSplittingEventArgs = { group, direction, document, copy: !!document && copy, byUser, cancel: false, source: this };
    parts.splitting.fire(e);
    if (e.cancel) return null;
    this.restoreForChange();
    const orientation = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
    const after = direction === 'right' || direction === 'down';
    const made = this.createGroup();
    const parent = group.parentSplit;
    if (parent && parent.orientation === orientation) {
      const at = parent.children.indexOf(group);
      const half = parent.sizes[at] / 2;
      parent.sizes[at] = half;
      parent.children.splice(after ? at + 1 : at, 0, made);
      parent.sizes.splice(after ? at + 1 : at, 0, half);
      made.parentSplit = parent;
    } else {
      const branch = new TabSplit(this, orientation);
      this.replaceNode(group, branch);
      branch.children = after ? [group, made] : [made, group];
      branch.sizes = [0.5, 0.5];
      group.parentSplit = made.parentSplit = branch;
    }
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
    if (this.groups.includes(group) && this.groups.length > 1) {
      untracked(() => {
        this.removeGroup(group);
        this.layoutChanged('closeGroup', group, byUser);
      });
    }
    return true;
  }

  /** Takes an empty group out of the layout; a split left with one child gives its place to it. */
  private removeGroup(group: TabGroup): void {
    const parts = this.parts;
    const parent = group.parentSplit;
    if (!parent) return;
    if (parts.maximized) this.unmaximize();
    const hadFocus = group.focusWithin;
    parent.remove(group);
    if (parent.children.length === 1) {
      const only = parent.children[0];
      const outer = parent.parentSplit;
      if (outer && only instanceof TabSplit && only.orientation === outer.orientation) {
        // Same direction as the split around it: its children join that split.
        const at = outer.children.indexOf(parent);
        const share = outer.sizes[at];
        outer.children.splice(at, 1, ...only.children);
        outer.sizes.splice(at, 1, ...only.sizes.map((s) => s * share));
        for (const child of only.children) child.parentSplit = outer;
        this.renderTree();
        only.dispose();
        parent.dispose();
      } else {
        parent.remove(only);
        this.replaceNode(parent, only);
        parent.dispose();
      }
    }
    parts.recentGroups = parts.recentGroups.filter((g) => g !== group);
    group.disposeTabs();
    this.controls.remove(group);
    this.renderTree();
    if (this.activeGroup === group) {
      this.setProperty('activeGroup', null);
      const next = parts.recentGroups[0] ?? this.groups[0];
      if (next) this.useGroup(next, false);
    }
    if (hadFocus) this.activeGroup?.restoreFocus();
    this.say('tabDocsGroupClosed');
  }

  /** Puts `next` where `node` is in the tree and on the page. */
  private replaceNode(node: LayoutItem, next: LayoutItem): void {
    const host = node.element.parentElement;
    if (host) placeNode(host, next.element, node.element);
    const parent = node.parentSplit;
    if (parent) parent.replace(node, next);
    else this.setRoot(next);
  }

  private setRoot(item: LayoutItem): void {
    this.parts.root = item;
    item.parentSplit = null;
    placeNode(this.element, item.element, this.element.firstChild);
    item.element.style.flex = '1 1 0px';
  }

  /** Puts every split's children in place, and writes down the groups in layout order. */
  private renderTree(): void {
    // A browser without moveBefore drops focus from what it moves: it goes back.
    const focus = deepActiveElement();
    const groups: TabGroup[] = [];
    const visit = (item: LayoutItem) => {
      if (item instanceof TabSplit) {
        item.render();
        item.children.forEach(visit);
      } else {
        groups.push(item);
      }
    };
    const root = this.parts.root;
    if (root) {
      placeNode(this.element, root.element, this.element.firstChild);
      visit(root);
    }
    this.setProperty('groups', groups);
    this.renderTexts();
    if (focus && focus.isConnected && this.element.contains(focus) && deepActiveElement() !== focus) focus.focus({ preventScroll: true });
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
    if (!this.groups.includes(group) || this.groups.length < 2) return false;
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

  private layoutChanging(change: TabLayoutChange, group: TabGroup | null, byUser: boolean): boolean {
    const e: LayoutChangingEventArgs = { change, group, byUser, cancel: false, source: this };
    this.parts.layoutChanging.fire(e);
    return !e.cancel;
  }

  private layoutChanged(change: TabLayoutChange, group: TabGroup | null, byUser: boolean): void {
    this.parts.layoutChanged.fire({ change, group, byUser, source: this });
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
    const group = { kind: 'group' as const, documents, active: item.activeTab ? tabs.indexOf(item.activeTab) : -1, recent: item.recentTabs.map((t) => tabs.indexOf(t)) };
    return item.locked ? { ...group, locked: true } : group;
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
    const split = target ? this.findSplit(target) : null;
    if (!split || !target) return false;
    const index = [...split.element.children].filter((el) => el.classList.contains('mx-tabdocs__sash')).indexOf(target);
    if (!this.beginResize()) return true;
    const rtl = split.orientation === 'horizontal' && split.rtl && (e.key === 'ArrowLeft' || e.key === 'ArrowRight');
    const step = Number.isFinite(by) ? by * this.resizeStep : by;
    split.resizeBy(index, rtl ? -step : step);
    this.endResize(true);
    return true;
  }

  private findSplit(sash: Element): TabSplit | null {
    const look = (item: LayoutItem | null): TabSplit | null => {
      if (!(item instanceof TabSplit)) return null;
      if (sash.parentElement === item.element) return item;
      for (const child of item.children) {
        const found = look(child);
        if (found) return found;
      }
      return null;
    };
    return look(this.parts.root);
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
  }

  private renderMinSizes(): void {
    const style = this.element.style;
    style.setProperty('--_min-width', `${this.peekProperty<number>('minGroupWidth') ?? 160}px`);
    style.setProperty('--_min-height', `${this.peekProperty<number>('minGroupHeight') ?? 100}px`);
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
    const max = this.peekProperty<number>('tabMaxWidth') ?? 0;
    el.style.setProperty('--_tab-min', `${this.peekProperty<number>('tabMinWidth') ?? 80}px`);
    el.style.setProperty('--_tab-fixed', `${this.peekProperty<number>('tabFixedWidth') ?? 160}px`);
    if (max > 0) el.style.setProperty('--_tab-max', `${max}px`);
    else el.style.removeProperty('--_tab-max');
    for (const group of untracked(() => this.groups)) group.queueOverflow();
  }

  /** A polite announcement for screen readers. */
  private say(key: keyof UiStrings, values?: Record<string, unknown>): void {
    if (!this.announce) return;
    const live = this.parts.live;
    const text = this.textOf(key, values);
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
    };
    return parts;
  }
}

/** Whether the page runs as an installed app, where the browser leaves the editor keys to it. */
function runsInstalled(view: Window | null): boolean {
  return !!view?.matchMedia?.('(display-mode: standalone), (display-mode: window-controls-overlay)').matches;
}
