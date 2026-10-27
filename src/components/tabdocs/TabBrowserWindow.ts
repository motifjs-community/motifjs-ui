import { Application, createSignal, effect, untracked } from '@motifx/core';
import { registerControl } from '../../core/control-map';
import { mirrorPage } from '../../core/mirror-page';
import { nextId } from '../../core/next-id';
import { connectDocument } from '../../core/page-documents';
import { DropMarks } from './DropMarks';
import type { LayoutItem } from './layout-item';
import { noteOffset } from './screen-offsets';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/**
 * A browser window of a `TabDocumentManager`, opened by `moveToNewWindow`: it holds groups as the
 * documents' area does (split, resized and dragged the same way), with the page's look, the
 * manager's keys and menus. Its title follows its active document. When it is closed its documents
 * go back to the main window, or close (`newWindowCloseAction`). The manager makes and closes these
 * windows; the methods here go through it, with its events.
 */
export class TabBrowserWindow {
  /** The browser window. */
  readonly window: Window;
  /** The manager's look in that window, filling it: the groups are laid out in it. */
  readonly element: HTMLDivElement;
  /** @internal The top of its layout. */
  root: LayoutItem | null = null;
  /** @internal Where its documents go back to: the group they came from. */
  home: TabGroup | null = null;
  /** @internal What a drag shows in this window. */
  readonly marks: DropMarks;
  /** @internal Its announcements: a screen reader reads those of the window it is in. */
  readonly live: HTMLDivElement;
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
    if (!doc.head) doc.documentElement.prepend(doc.createElement('head'));
    if (!doc.body) doc.documentElement.append(doc.createElement('body'));
    const page = owner.element.ownerDocument;
    // The app's window manager mirrors the page's styles and says when the window closes; without an app the kit does both.
    const handle = attachTo(view, () => untracked(() => this.closedByBrowser()));
    this.stops.push(connectDocument(doc), handle ? () => {} : mirrorPage(page, doc));
    const el = (this.element = doc.createElement('div'));
    el.className = 'mx-tabdocs mx-tabdocs__page';
    el.id = nextId('tabdocs-page');
    el.setAttribute('role', 'main');
    // It stands for the manager in that window: its keys hold for what is in it (the splitters too).
    registerControl(el, owner);
    const live = (this.live = doc.createElement('div'));
    live.className = 'mx-tabdocs__live';
    live.setAttribute('aria-live', 'polite');
    el.append(live);
    doc.body.append(el);
    this.marks = new DropMarks(el);
    const front = () => (this.focusedAt = performance.now());
    front();
    const gone = () => untracked(() => this.closedByBrowser());
    const note = (e: PointerEvent) => noteOffset(view, e);
    view.addEventListener('focus', front);
    if (!handle) view.addEventListener('pagehide', gone);
    doc.addEventListener('pointermove', note, { capture: true, passive: true });
    doc.addEventListener('pointerdown', note, { capture: true, passive: true });
    this.stops.push(() => {
      view.removeEventListener('focus', front);
      view.removeEventListener('pagehide', gone);
      doc.removeEventListener('pointermove', note, true);
      doc.removeEventListener('pointerdown', note, true);
    });
    // The title follows the active document.
    this.stops.push(
      effect(() => {
        const title = owner.windowTitleOf(this);
        untracked(() => {
          if (doc.title !== title) doc.title = title;
        });
      }),
    );
  }

  get manager(): TabDocumentManager {
    return this.owner;
  }
  /** Its place and size on the screen, in pixels (the browser tells no change of place: read it when needed). */
  get rect(): TabRect {
    const v = this.window;
    return { x: v.screenX, y: v.screenY, width: v.outerWidth, height: v.outerHeight };
  }
  /** Its groups, in layout order. Reactive. */
  get groups(): readonly TabGroup[] {
    return this.owner.groups.filter((g) => g.browserWindow === this);
  }
  /** Reactive. */
  get documents(): readonly TabDocument[] {
    return this.groups.flatMap((g) => g.documents);
  }
  /** The group used last in it. Reactive. */
  get activeGroup(): TabGroup | null {
    const group = this.active.value;
    return group && group.browserWindow === this ? group : (this.groups[0] ?? null);
  }
  /** The active document of its group used last; its title is the window's. Reactive. */
  get activeDocument(): TabDocument | null {
    return this.activeGroup?.activeDocument ?? null;
  }
  /** Its place among the manager's `browserWindows`. Reactive. */
  get index(): number {
    return this.owner.browserWindows.indexOf(this);
  }

  /** Brings its documents back to the main window, where they came from; the window closes. */
  moveToMainWindow(): boolean {
    return this.owner.moveToMainWindow(this);
  }

  /** Closes it: its documents go back to the main window or close, as `newWindowCloseAction` (or `onWindowClosing`) says. */
  close(): Promise<boolean> {
    return this.owner.closeWindow(this);
  }

  /** Brings it to the front and focuses what had focus in it last. */
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
    this.element.remove();
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

/** Gives the window to the app's window manager; `null` when there is no app or it refuses the window. */
function attachTo(view: Window, closing: () => void): object | null {
  try {
    return Application.main?.windows.attach(view, { styles: 'live', closeWhenEmpty: false, onClosing: (e) => e.reason !== 'page' && closing() }) ?? null;
  } catch {
    return null;
  }
}
