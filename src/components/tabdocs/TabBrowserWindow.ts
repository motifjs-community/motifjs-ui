import { Application, createSignal, untracked, type AppWindow, type Component } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { standFor } from '../../core/focus';
import { onDocument, onWindow } from '../../core/window-events';
import { mirrorPage } from '../../core/mirror-page';
import { nextId } from '../../core/next-id';
import { connectDocument, noteWindowRoot, windowOf } from '../../core/page-documents';
import { placeOnPage } from '../../core/page-layer';
import { DropMarks } from './DropMarks';
import type { LayoutItem } from './layout-item';
import { noteOffset } from './screen-offsets';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';
import { dropPart, layoutPart } from './place-node';

// New-window module: window plumbing (the window, its readiness, document.title, the mirrored page) is an allowed exception.

/**
 * A browser window of a `TabDocumentManager`, opened by `moveToNewWindow`. It holds groups as the
 * document area does (split, resized and dragged in the same way), with the page's appearance and
 * the manager's keys and menus. Its title follows its active document. When it closes, its documents
 * return to the main window or close (`newWindowCloseAction`). The manager creates and closes these
 * windows, and the methods here call the manager and raise its events.
 */
export class TabBrowserWindow {
  /** The browser window. */
  readonly window: Window;
  /** The manager's part in that window, which fills it and contains the groups. */
  readonly part: Component<HTMLDivElement>;
  /** @internal The top of its layout. */
  root: LayoutItem | null = null;
  /** @internal Where its documents go back to: the group they came from. */
  home: TabGroup | null = null;
  /** @internal What a drag shows in this window. */
  readonly marks: DropMarks;
  /** @internal Its announcements: a screen reader reads those of the window it is in. */
  readonly livePart: Component<HTMLDivElement>;
  /** @internal When it last had focus: the window in front comes last in `browserWindows`. */
  focusedAt = 0;
  private readonly active = createSignal<TabGroup | null>(null);
  private readonly stops: (() => void)[] = [];
  private gone = false;

  constructor(
    private readonly owner: TabDocumentManager,
    view: Window,
  ) {
    
    this.window = view;
    const doc = view.document;
    // A blank window may have no head or body yet: the page itself, not a part, so made here as the browser would.
    if (!doc.head) doc.documentElement.prepend(doc.createElement('head'));
    if (!doc.body) doc.documentElement.append(doc.createElement('body'));
    const page = windowOf(owner)?.document;
    // The app's window manager mirrors the page's styles and says when the window closes; without an app the kit does both.
    const handle = attachTo(view, () => untracked(() => this.closedByBrowser()));
    this.stops.push(connectDocument(doc), handle || !page ? () => {} : mirrorPage(page, doc));
    this.part = loose<HTMLDivElement>('div', 'mx-tabdocs mx-tabdocs__page');
    this.part.attr.add({ id: nextId('tabdocs-page'), role: 'main' });
    layoutPart(this.part);
    // It stands for the manager in that window: its keys hold for what is in it (the splitters too).
    this.stops.push(standFor(this.part, owner));
    this.livePart = part<HTMLDivElement>(this.part, 'div', 'mx-tabdocs__live');
    this.livePart.attr.add({ 'aria-live': 'polite' });
    // It goes into that window's body as a component: the app's, when the app has the window; else the one the kit's
    // menus and popups of that document go into (placeOnPage), noted as that window's so its keys and windows stack there.
    if (handle) handle.host.controls.add(this.part);
    else {
      placeOnPage(doc, this.part);
      this.stops.push(noteWindowRoot(this.part.parent!, view));
    }
    this.marks = new DropMarks(this.part);
    const front = () => (this.focusedAt = performance.now());
    front();
    const note = (e: PointerEvent) => noteOffset(view, e);
    // The browser window and its page are no components: listened to here, through the part placed in it, let go with the window.
    this.stops.push(onWindow(this.part, 'focus', front), onDocument(this.part, 'pointermove', note, true), onDocument(this.part, 'pointerdown', note, true));
    if (!handle) this.stops.push(onWindow(this.part, 'pagehide', () => untracked(() => this.closedByBrowser())));
    // The title follows the active document.
    this.part.bindings.watch(() => {
      const title = owner.windowTitleOf(this);
      untracked(() => {
        if (doc.title !== title) doc.title = title;
      });
    });
  }

  get manager(): TabDocumentManager {
    return this.owner;
  }
  /** Its position and size on the screen, in pixels. Browsers do not report moves, so read it when needed. */
  get rect(): TabRect {
    const v = this.window;
    return { x: v.screenX, y: v.screenY, width: v.outerWidth, height: v.outerHeight };
  }
  /** Its groups, in layout order. Reactive. */
  get groups(): readonly TabGroup[] {
    return this.owner.groups.filter((g) => g.browserWindow === this);
  }
  /** The documents of its groups. Reactive. */
  get documents(): readonly TabDocument[] {
    return this.groups.flatMap((g) => g.documents);
  }
  /** The most recently used group in it. Reactive. */
  get activeGroup(): TabGroup | null {
    const group = this.active.value;
    return group && group.browserWindow === this ? group : (this.groups[0] ?? null);
  }
  /** The active document of its most recently used group, which sets the window's title. Reactive. */
  get activeDocument(): TabDocument | null {
    return this.activeGroup?.activeDocument ?? null;
  }
  /** Its position in the manager's `browserWindows`. Reactive. */
  get index(): number {
    return this.owner.browserWindows.indexOf(this);
  }

  /** Returns its documents to their original place in the main window, and the window closes. */
  moveToMainWindow(): boolean {
    return this.owner.moveToMainWindow(this);
  }

  /**
   * Closes it. Its documents return to the main window or close, according to `newWindowCloseAction`
   * or `onWindowClosing`.
   */
  close(): Promise<boolean> {
    return this.owner.closeWindow(this);
  }

  /** Brings it to the front and sets focus on what last had focus in it. */
  focus(): boolean {
    return this.owner.focusWindow(this);
  }

  // Called by the manager.

  /** @internal */
  markActive(group: TabGroup): void {
    this.active.value = group;
  }

  /** @internal Whether the browser window is still there. */
  get isOpen(): boolean {
    return !this.gone && !this.window.closed;
  }

  /** @internal Closes the browser window, without a word to the manager. */
  dispose(): void {
    this.gone = true;
    for (const stop of this.stops.splice(0)) stop();
    dropPart(this.part);
    try {
      if (!this.window.closed) this.window.close();
    } catch {
      // A window the app gave (`openWindow`) may refuse.
    }
  }

  private closedByBrowser(): void {
    if (this.gone) return;
    this.owner.browserWindowClosed(this);
  }
}

/** Gives the window to the app's window manager and returns its handle; `null` when there is no app or it refuses the window. */
function attachTo(view: Window, closing: () => void): AppWindow | null {
  try {
    return Application.main?.windows.attach(view, { styles: 'live', closeWhenEmpty: false, onClosing: (e) => e.reason !== 'page' && closing() }) ?? null;
  } catch {
    return null;
  }
}
