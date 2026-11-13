import { untracked, type ComponentBase } from '@motifx/core';
import { focusOn } from '../../core/focus';
import type { MenuItem } from '../../parts/menu/menu-item';
import { ActionSheet } from '../actionsheet/ActionSheet';
import { ContextMenu } from '../contextmenu/ContextMenu';
import type { ContextMenuOpeningEventArgs } from '../contextmenu/context-menu-opening-event-args';
import type { ContextMenuTarget } from '../contextmenu/context-menu-target';
import type { TabContextMenuEventArgs } from './tab-context-menu-event-args';
import type { TabDockSide } from './tab-dock-side';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabMenuCommand } from './tab-menu-command';
import type { UiStrings } from '../../core/ui-strings';

const TEXTS: Record<TabMenuCommand, keyof UiStrings> = {
  close: 'close',
  hide: 'tabDocsHide',
  showHidden: 'tabDocsShowHidden',
  closeOthers: 'tabDocsCloseOthers',
  closeRight: 'tabDocsCloseRight',
  closeLeft: 'tabDocsCloseLeft',
  closeSaved: 'tabDocsCloseSaved',
  closeAll: 'tabDocsCloseAll',
  keepOpen: 'tabDocsKeepOpen',
  pin: 'tabDocsPin',
  unpin: 'tabDocsUnpin',
  splitUp: 'tabDocsSplitUp',
  splitDown: 'tabDocsSplitDown',
  splitLeft: 'tabDocsSplitLeft',
  splitRight: 'tabDocsSplitRight',
  moveNext: 'tabDocsMoveNext',
  movePrevious: 'tabDocsMovePrevious',
  moveTo: 'tabDocsMoveTo',
  moveGroupTo: 'tabDocsMoveGroupTo',
  copyTitle: 'tabDocsCopyTitle',
  newDocument: 'tabDocsNewDocument',
  reopenClosed: 'tabDocsReopenClosed',
  lock: 'tabDocsLock',
  unlock: 'tabDocsUnlock',
  float: 'tabDocsFloat',
  dock: 'tabDocsDock',
  dockLeft: 'tabDocsDockLeft',
  dockRight: 'tabDocsDockRight',
  dockTop: 'tabDocsDockTop',
  dockBottom: 'tabDocsDockBottom',
  autoHide: 'tabDocsAutoHide',
  maximizeWindow: 'tabDocsMaximizeWindow',
  closeWindow: 'tabDocsCloseWindow',
  newWindow: 'tabDocsNewWindow',
  mainWindow: 'tabDocsMainWindow',
};

const SIDES = ['Left', 'Right', 'Top', 'Bottom'] as const;

/** One built-in item: its command, whether it can be chosen now, the key shown with it, a text other than its own. */
type Entry = [TabMenuCommand, boolean?, string?, (keyof UiStrings)?];

/**
 * The context menus of a manager: one for a tab, one for the empty strip. Built each time one
 * opens, for that document and group; the manager's `onContextMenuOpening` may change them. A new
 * browser window has a menu of its own: its events do not reach the manager's element.
 */
export class TabMenus {
  readonly menu: ContextMenu;
  private readonly others = new Set<ContextMenu>();
  /** The action sheet a phone shows a document's commands in (from its title, or its row in the list). */
  private sheet: ActionSheet | null = null;
  /** What a menu opened by `openAt` is for: an opening made by code has no event that tells. */
  private given: Pick<TabDragSubject, 'document' | 'group'> | null = null;

  constructor(private readonly manager: TabDocumentManager) {
    this.menu = this.create(manager);
  }

  /** Gives the strips under `root` (a new window's) the menus; returns the function that takes them off. */
  attach(root: ContextMenuTarget): () => void {
    const menu = this.create(root);
    this.others.add(menu);
    return () => {
      this.others.delete(menu);
      if (!menu.isDisposed) void menu.dispose();
    };
  }

  /** Opens the menu of a tab's document, or of a group's strip without one, at a point: a long press let go where it started. */
  openAt(subject: Pick<TabDragSubject, 'document' | 'group'>, x: number, y: number, source: ComponentBase): boolean {
    this.given = subject;
    try {
      return this.menu.open({ x, y }, source);
    } finally {
      this.given = null;
    }
  }

  private create(target: ContextMenuTarget): ContextMenu {
    // A sheet on a phone, a sheet for a finger on a tablet, a menu on a desktop (or as `menuPresentation` says).
    const menu = new ContextMenu({ target, presentation: () => this.manager.menuPresentationNow });
    menu.onOpening((e) => untracked(() => this.opening(e, menu)));
    this.manager.controls.add(menu);
    return menu;
  }

  /** The items of a tab's menu. */
  forTab(doc: TabDocument, group: TabGroup): MenuItem[] {
    const m = this.manager;
    const keys = m.keys;
    const tabs = group.documents;
    const at = tabs.indexOf(doc);
    const keep = m.keepPinned;
    const closable = (d: TabDocument) => d.closable && !(keep && d.pinned);
    return this.build(
      [
        [
          ['close', doc.closable, keys.closeTab[0]],
          // A document that cannot close may be hidden.
          doc.closable ? null : ['hide', m.mayCloseOrHide(doc), keys.hide[0]],
          ['closeOthers', tabs.some((d) => d !== doc && closable(d))],
          ['closeRight', tabs.slice(at + 1).some(closable)],
          ['closeLeft', tabs.slice(0, at).some(closable)],
          ['closeSaved', tabs.some((d) => !d.dirty && closable(d)), keys.closeSavedTabs[0]],
          ['closeAll', tabs.some(closable), keys.closeAllTabs[0]],
        ],
        [['copyTitle']],
        [doc.preview ? ['keepOpen', true, keys.keepOpen[0]] : null, [doc.pinned ? 'unpin' : 'pin', true, keys.togglePin[0]]],
        [['splitUp'], ['splitDown'], ['splitLeft'], ['splitRight', true, keys.splitRight[0]]],
        // "Move to…" points at the groups on the screen: a phone shows one, its list moves documents instead.
        [['moveNext', true, keys.moveToNextGroup[0]], ['movePrevious', true, keys.moveToPreviousGroup[0]], m.currentPresentation === 'phone' ? null : ['moveTo', m.mayDrag(doc), keys.moveTo[0]]],
        this.dockEntries({ document: doc, group, manager: m, copy: false }),
      ],
      group,
      doc,
    );
  }

  /** Float, dock back, dock to each side, auto hide: for a document, a group or (in a window) the window. */
  private dockEntries(subject: TabDragSubject): (Entry | null)[] {
    const m = this.manager;
    const keys = m.keys;
    const { document: doc, group } = subject;
    const w = group.window;
    const area = group.dockArea;
    const alone = !!area && area.groups.length === 1 && (!doc || group.documents.length === 1);
    const entries: (Entry | null)[] = [
      w ? ['dock', true, doc ? keys.dock[0] : undefined] : null,
      ['float', m.maySubject(subject, 'float'), doc ? keys.float[0] : undefined],
      ...SIDES.map((name): Entry => {
        const side = name.toLowerCase() as TabDockSide;
        return [`dock${name}`, m.maySubject(subject, side) && !(alone && area?.side === side), doc ? keys[`dock${name}`][0] : undefined];
      }),
      area ? ['autoHide', m.mayAutoHide(area), keys.toggleAutoHide[0], area.autoHidden ? 'tabDocsAutoHideOff' : 'tabDocsAutoHide'] : null,
      // In a floating window, the strip's command moves the whole window. A phone has no windows beside the page.
      m.currentPresentation === 'phone' ? null : ['newWindow', m.mayNewWindow(subject), doc ? keys.moveToNewWindow[0] : undefined, !doc && w ? 'tabDocsWindowToNewWindow' : undefined],
      group.browserWindow ? ['mainWindow', true, doc ? keys.moveToMainWindow[0] : undefined] : null,
    ];
    return entries;
  }

  /** The items of the empty strip's menu. */
  forStrip(group: TabGroup): MenuItem[] {
    const m = this.manager;
    const keys = m.keys;
    const keep = m.keepPinned;
    const closable = (d: TabDocument) => d.closable && !(keep && d.pinned);
    const tabs = group.documents;
    return this.build(
      [
        [m.newDocument ? ['newDocument'] : null, ['reopenClosed', m.closedDocuments.length > 0, keys.reopenClosed[0]]],
        [
          ['closeAll', tabs.some(closable), keys.closeAllTabs[0]],
          ['closeSaved', tabs.some((d) => !d.dirty && closable(d)), keys.closeSavedTabs[0]],
        ],
        [[group.locked ? 'unlock' : 'lock'], m.hiddenDocuments.length ? ['showHidden'] : null],
        [['splitRight', true, keys.splitRight[0]], ['splitDown'], ['moveGroupTo', m.allowDragGroups && m.dragPeers().some((p) => p.groups.some((g) => g !== group))]],
        this.dockEntries({ document: null, group, manager: m, copy: false }),
        group.window
          ? [
              ['maximizeWindow', true, keys.maximizeWindow[0], group.window.isMaximized ? 'tabDocsRestoreWindow' : 'tabDocsMaximizeWindow'],
              ['closeWindow', true, keys.closeWindow[0]],
            ]
          : [],
      ],
      group,
      null,
    );
  }

  /** A document's commands in an action sheet, asking `onContextMenuOpening` first as a tab's menu does. */
  openSheet(doc: TabDocument, group: TabGroup, byKeyboard: boolean, returnFocus: ComponentBase | null): boolean {
    const m = this.manager;
    if (!m.contextMenu) return false;
    const args: TabContextMenuEventArgs = { document: doc, group, items: this.forTab(doc, group), byKeyboard, cancel: false, source: m };
    m.contextMenuOpening(args);
    if (args.cancel) return false;
    if (!this.sheet) {
      this.sheet = new ActionSheet({ container: m });
      this.sheet.class.add('mx-tabdocs__menu-sheet');
      m.controls.add(this.sheet);
    }
    const sheet = this.sheet;
    sheet.title = doc.title;
    sheet.items = args.items;
    // Focus waits on what opened the sheet: the sheet gives it back there when it closes.
    if (returnFocus) focusOn(returnFocus, { preventScroll: true });
    return sheet.open(byKeyboard);
  }

  dispose(): void {
    for (const menu of [this.menu, ...this.others]) if (!menu.isDisposed) void menu.dispose();
    this.others.clear();
    if (this.sheet && !this.sheet.isDisposed) void this.sheet.dispose();
    this.sheet = null;
  }

  private build(sections: (Entry | null)[][], group: TabGroup, doc: TabDocument | null): MenuItem[] {
    const m = this.manager;
    const shown = m.menuItems;
    const items: MenuItem[] = [];
    for (const section of sections) {
      const entries = section.filter((entry): entry is Entry => !!entry && shown[entry[0]] !== false);
      entries.forEach(([command, enabled, shortcut, text], i) => {
        const item: MenuItem = {
          text: m.textOf(text ?? TEXTS[command]),
          enabled: enabled ?? true,
          shortcut: shortcut ?? '',
          beginGroup: i === 0 && items.length > 0,
          data: command,
        };
        // "Show hidden" opens a list of the hidden documents.
        if (command === 'showHidden') item.items = m.hiddenItems();
        else item.click = () => m.runCommand(command, group, doc);
        items.push(item);
      });
    }
    return items;
  }

  private opening(e: ContextMenuOpeningEventArgs, menu: ContextMenu): void {
    const m = this.manager;
    const subject = this.given ?? this.subjectOf(e.event);
    if (!m.contextMenu || !subject) {
      e.cancel = true;
      return;
    }
    const { document: doc, group } = subject;
    const args: TabContextMenuEventArgs = {
      document: doc,
      group,
      items: doc ? this.forTab(doc, group) : this.forStrip(group),
      byKeyboard: e.byKeyboard,
      cancel: false,
      source: m,
    };
    m.contextMenuOpening(args);
    menu.label = doc ? doc.title : m.textOf('tabDocsGroup', { n: m.groups.indexOf(group) + 1 });
    e.items = args.items;
    e.cancel = args.cancel;
  }

  /** What a right click or the menu key is on: a tab, or a strip's empty room; `null` elsewhere. */
  private subjectOf(e: Event): Pick<TabDragSubject, 'document' | 'group'> | null {
    const strip = this.manager.groups.find((g) => g.motif.isEventFrom(e));
    if (!strip) return null;
    // On a tablet a strip may show tabs of groups folded into it: the menu is the tab's own group's.
    const tab = strip.stripTabOfEvent(e);
    if (tab) return { document: tab.document, group: tab.group ?? strip };
    return strip.isStripSpaceEvent(e) ? { document: null, group: strip } : null;
  }
}
