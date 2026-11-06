import type { SashOwner } from './sash-owner';
import type { TabDocumentManager } from './TabDocumentManager';

const SASHES = new WeakMap<Element, SplitSash>();

/**
 * The splitter between two neighbors of a split, or between a dock area and the documents (the
 * ARIA window splitter pattern): the pointer drags it, the keys move it (see the manager's `keys`),
 * a double click evens a split's sizes or gives a dock area its first size again.
 */
export class SplitSash {
  readonly element: HTMLDivElement;
  private drag: { pointer: number; from: number; sizes: number[] } | null = null;

  /** The splitter whose element this is. */
  static of(element: Element | null): SplitSash | null {
    return (element && SASHES.get(element)) ?? null;
  }

  constructor(
    readonly split: SashOwner,
    private readonly manager: TabDocumentManager,
  ) {
    const el = (this.element = manager.element.ownerDocument.createElement('div'));
    el.className = 'mx-tabdocs__sash';
    el.tabIndex = 0;
    el.setAttribute('role', 'separator');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    el.addEventListener('pointerdown', (e) => this.start(e));
    el.addEventListener('pointermove', (e) => this.move(e));
    el.addEventListener('pointerup', (e) => this.end(e));
    el.addEventListener('pointercancel', (e) => this.end(e));
    el.addEventListener('dblclick', () => split.resetSizes());
    SASHES.set(el, this);
  }

  /** The index of the child before it. */
  get index(): number {
    return this.split.sashIndex(this);
  }

  private start(e: PointerEvent): void {
    if (e.button !== 0 || !this.manager.isEnabled || !this.manager.beginResize(this.split)) return;
    e.preventDefault();
    this.element.focus({ preventScroll: true });
    this.element.setPointerCapture?.(e.pointerId);
    this.drag = { pointer: e.pointerId, from: this.position(e), sizes: [...this.split.sizes] };
    this.manager.element.toggleAttribute('data-resizing', true);
  }

  private move(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    this.split.sizes = [...drag.sizes];
    this.split.resizeBy(this.index, this.position(e) - drag.from);
  }

  private end(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    this.drag = null;
    this.element.releasePointerCapture?.(e.pointerId);
    this.manager.element.removeAttribute('data-resizing');
    this.manager.endResize(e.type === 'pointerup', this.split);
  }

  /** Where the pointer is along the split, growing in the reading direction. */
  private position(e: PointerEvent): number {
    if (this.split.orientation === 'vertical') return e.clientY;
    return this.split.rtl ? -e.clientX : e.clientX;
  }
}
