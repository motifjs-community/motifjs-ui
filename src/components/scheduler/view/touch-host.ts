import type { ViewKind } from '../model/view-kind';

/** What the finger gestures use of their scheduler. */
export interface TouchHost {
  root(): HTMLElement;
  /** The view's scroll box. */
  scroller(): HTMLElement | null;
  kind(): ViewKind;
  /** An appointment is being moved or resized. */
  dragging(): boolean;
  swipeNavigation(): boolean;
  pinchZoom(): boolean;
  rtl(): boolean;
  zoom(): number;
  /** Two fingers are about to change the zoom; `false` when that is refused. */
  zoomChanging(from: number, to: number): boolean;
  setZoom(zoom: number): void;
  zoomChanged(from: number, to: number): void;
  /** A swipe goes on (`x` pixels, toward the next days or the previous ones), or is over (`x` null). */
  swiping(x: number | null, next: boolean, ready: boolean): void;
  step(by: number): void;
}
