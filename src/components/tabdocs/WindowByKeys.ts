import { untracked } from '@motifx/core';
import { isChord } from '../../core/keyboard';
import { mark, put } from '../../core/part-writes';
import { onWindow } from '../../core/window-events';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabRect } from './tab-rect';
import type { TabWindow } from './TabWindow';

/**
 * A floating window moved and resized from the keyboard: the arrow keys move it, with Shift they
 * make it narrower, wider, shorter or taller, a step (`resizeStep`) at a time. Enter keeps it
 * there, Escape puts it back; a click anywhere keeps it too.
 */
export class WindowByKeys {
  private current: { window: TabWindow; start: TabRect; stop: () => void } | null = null;

  constructor(private readonly manager: TabDocumentManager) {}

  /** The window being moved, `null` when none is. */
  get window(): TabWindow | null {
    return this.current?.window ?? null;
  }

  start(w: TabWindow): boolean {
    const m = this.manager;
    if (this.current || w.isMaximized || !m.windowChanging('moveWindow', w, true)) return false;
    const key = (e: KeyboardEvent) => untracked(() => this.key(e));
    const away = () => untracked(() => this.end(true));
    const stops = [onWindow(m.element, 'keydown', key, true), onWindow(m.element, 'pointerdown', away, true), onWindow(m.element, 'blur', away)];
    this.current = {
      window: w,
      start: { ...w.rect },
      stop: () => {
        for (const stop of stops) stop();
      },
    };
    mark(w.part, 'data-keys', true);
    m.sayText(m.textOf('tabDocsWindowKeys'));
    return true;
  }

  /** Keeps the window where it is now (`keep`), or puts it back. */
  end(keep: boolean): boolean {
    const c = this.current;
    if (!c) return false;
    this.current = null;
    c.stop();
    const w = c.window;
    put(w.part, 'data-keys', null);
    if (!keep) w.place(c.start);
    const r = w.rect;
    const resized = r.width !== c.start.width || r.height !== c.start.height;
    this.manager.windowChanged(resized ? 'resizeWindow' : 'moveWindow', w, true);
    if (!keep) this.manager.announceCanceled();
    return true;
  }

  private key(e: KeyboardEvent): void {
    const c = this.current;
    if (!c) return;
    const m = this.manager;
    const keys = m.keys;
    const step = m.resizeStep;
    const r = c.window.rect;
    let next: TabRect | null = null;
    if (isChord(keys.windowLeft, e)) next = { ...r, x: r.x - step };
    else if (isChord(keys.windowRight, e)) next = { ...r, x: r.x + step };
    else if (isChord(keys.windowUp, e)) next = { ...r, y: r.y - step };
    else if (isChord(keys.windowDown, e)) next = { ...r, y: r.y + step };
    else if (isChord(keys.windowNarrower, e)) next = { ...r, width: r.width - step };
    else if (isChord(keys.windowWider, e)) next = { ...r, width: r.width + step };
    else if (isChord(keys.windowShorter, e)) next = { ...r, height: r.height - step };
    else if (isChord(keys.windowTaller, e)) next = { ...r, height: r.height + step };
    else if (isChord(keys.windowDone, e)) this.end(true);
    else if (isChord(keys.windowCancel, e)) this.end(false);
    else return;
    e.preventDefault();
    e.stopPropagation();
    if (!next) return;
    const min = c.window.minSize();
    c.window.place({ ...next, width: Math.max(min.w, next.width), height: Math.max(min.h, next.height) });
    m.keepWindowInView(c.window);
  }
}
