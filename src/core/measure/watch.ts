import type { ComponentBase } from '@motifx/core';
import type { LayoutChange } from './layout-change';
import { onLookChange } from './look';
import { observe, observeSight } from './observers';
import { listenPage } from './page-events';
import { canMeasure, sizeOf } from './read';
import { measure, queueNotice } from './rounds';
import type { Size } from './size';
import type { SizeBox } from './size-box';
import { listenViewport } from './viewport';
import type { Watcher } from './watcher';
import type { WindowBound } from './window-bound';

/** One `onLayout`: what it listens to in the target's window, and the callback it tells. */
export class Watch implements WindowBound {
  private undo: (() => void) | null = null;
  private stopped = false;
  private told = false;
  private missed = false;
  /** For `size`: the last size told. */
  private size: Size | null = null;
  /** For `sight`: whether it was in sight when last told. */
  private seen: boolean | null = null;
  private readonly stopHearing: (() => void) | null;
  /**
   * The size the layer reads itself where the window has no size observer (a test document): the first one, and the one
   * after each arrival. Where it has one, the observer tells them, after the browser laid the target out: read in a
   * round, they would lay the page out there and then, before what the round writes is laid out once more.
   */
  private readonly readSize = (): Size => sizeOf(this.target, this.box);
  private readonly takeSize = (size: Size): void => this.resized(size, true);

  constructor(
    private readonly target: ComponentBase,
    private readonly watchers: readonly Watcher[],
    private readonly change: LayoutChange,
    private readonly box: SizeBox,
    private readonly changed: (value: unknown) => void,
    private readonly except: ComponentBase | undefined,
  ) {
    this.stopHearing = change === 'look' ? onLookChange(target, () => this.heard()) : null;
  }

  attach(): void {
    if (this.stopped) return;
    this.detach();
    const target = this.target;
    if (this.change === 'size') {
      this.undo = observe(target, this.box, (size) => this.resized(size, false));
      if (!canMeasure(target)) measure(target, this.readSize, this.takeSize);
    } else if (this.change === 'sight') {
      this.undo = observeSight(target, (seen) => this.sighted(seen));
    } else if (this.change === 'page') {
      this.undo = listenPage(target, 'resize', () => this.heard());
    } else if (this.change === 'scroll') {
      this.undo = listenPage(target, 'scroll', () => this.heard(), this.except);
    } else if (this.change === 'viewport') {
      this.undo = listenViewport(target, () => this.heard());
    }
  }

  detach(): void {
    this.undo?.();
    this.undo = null;
  }

  arrived(moved: boolean): void {
    if (this.stopped || this.change === 'sight') return;
    if (this.change === 'size') {
      // Shown again or moved: the observer tells its size once the browser laid it out there.
      if (!canMeasure(this.target)) measure(this.target, this.readSize, this.takeSize);
      return;
    }
    // A look is told the first time, after a move into another window, and when it changed while away.
    if (this.change === 'look' && this.told && !moved && !this.missed) return;
    this.missed = false;
    this.tell(undefined);
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.detach();
    this.stopHearing?.();
    for (const watcher of this.watchers) watcher.release(this);
  }

  private heard(): void {
    if (this.stopped) return;
    const watcher = this.watchers[0];
    if (watcher.isActive && watcher.isPlaced) this.tell(undefined);
    else this.missed = true;
  }

  private resized(size: Size, read: boolean): void {
    if (this.stopped) return;
    const last = this.size;
    // The same size again (a move to another parent, the observer's first report after the layer's own read).
    if (last && Math.abs(last.width - size.width) < 0.5 && Math.abs(last.height - size.height) < 0.5) return;
    // Read before the browser laid it out: its size observer tells once it has.
    if (read && !last && !size.width && !size.height && canMeasure(this.target)) return;
    this.size = size;
    this.tell(size);
  }

  private sighted(seen: boolean): void {
    if (this.stopped || seen === this.seen) return;
    this.seen = seen;
    this.tell(seen);
  }

  private tell(value: unknown): void {
    this.told = true;
    queueNotice(this.target, this, () => {
      if (!this.stopped) this.changed(value);
    });
  }
}
