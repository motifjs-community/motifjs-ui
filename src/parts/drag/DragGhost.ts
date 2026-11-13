import { Component, type ComponentBase } from '@motifx/core';
import { boxOf, rectOf } from '../../core/measure';
import { isDocument } from '../../core/node-kind';
import { placeOnPage } from '../../core/page-layer';
import { css, mark, put } from '../../core/part-writes';

// Below and after the pointer, so it never covers what is under it.
const OFFSET = 14;

/** How a copy shown with `showAt` follows the pointer. */
interface Follow {
  /** Where its top left corner sits from the pointer. */
  offset: { x: number; y: number };
  /** The axis it may move along. */
  direction: 'both' | 'vertical' | 'horizontal';
  /** Kept inside this box. */
  bounds: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'> | null;
  /** Where it started, for the axis it may not move along. */
  start: { left: number; top: number };
}

/**
 * The image of something dragged (a header, a chip, a row, a tab): a copy next to the pointer
 * while it moves, marked with what a drop would do there (`data-target`). It is shown in the place
 * `root` gives: a component (inside a modal window that holds it, it appears above that window),
 * or the page of a document. Its position is measured from where it starts, so a moved or scaled
 * window around it does not offset it. The component styles it through `className` and `data-kind`.
 * The copy, or a drag template, is shown in a box that is a component, a child of that place.
 */
export class DragGhost {
  /** The box shown, a component holding the copy; `null` while none is shown. */
  private box: Component<HTMLDivElement> | null = null;
  private origin = { left: 0, top: 0 };
  private follow: Follow | null = null;

  constructor(
    /** Where the copy is shown: a component, or the page of a document. */
    private readonly root: () => ComponentBase | Document,
    private readonly enabled: () => boolean,
    private readonly className: string,
  ) {}

  /** Indicates whether a copy is shown. */
  get shown(): boolean {
    return !!this.box;
  }

  /** Starts showing a copy of the part `source`, at the same width and height, that follows the pointer. */
  show(source: ComponentBase, x: number, y: number, kind: string): void {
    this.open(this.copyPart(source), kind, this.root());
    this.move(x, y, 'none');
  }

  /**
   * Starts showing `content` (a copy, or a drag template, as a part) with its top left corner at
   * `offset` from the pointer, in `root` (a component, or the page of a document). It moves along
   * `direction` only and stays in `bounds`.
   */
  showAt(content: ComponentBase, kind: string, x: number, y: number, options: { offset: { x: number; y: number }; root?: ComponentBase | Document | null; direction?: Follow['direction']; bounds?: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'> | null }): void {
    this.open(content, kind, options.root ?? this.root());
    if (!this.box) return;
    this.follow = { offset: options.offset, direction: options.direction ?? 'both', bounds: options.bounds ?? null, start: { left: x - options.offset.x, top: y - options.offset.y } };
    this.move(x, y, 'none');
  }

  /** Follows the pointer. `target` reports what dropping here would do. */
  move(x: number, y: number, target: string): void {
    const box = this.box;
    if (!box) return;
    let left = x + OFFSET;
    let top = y + OFFSET;
    const f = this.follow;
    if (f) {
      left = f.direction === 'vertical' ? f.start.left : x - f.offset.x;
      top = f.direction === 'horizontal' ? f.start.top : y - f.offset.y;
      if (f.bounds) {
        const b = f.bounds;
        const size = boxOf(box);
        left = Math.max(b.left, Math.min(b.right - size.offsetWidth, left));
        top = Math.max(b.top, Math.min(b.bottom - size.offsetHeight, top));
      }
    }
    css(box, 'transform', `translate(${Math.round(left - this.origin.left)}px, ${Math.round(top - this.origin.top)}px)`);
    put(box, 'data-target', target);
  }

  hide(): void {
    const box = this.box;
    this.box = null;
    // The box goes with what it holds.
    if (box?.parent) box.parent.controls.remove(box);
    else if (box && !box.isDisposed) void box.dispose({ skipLeaveTransition: true });
    this.follow = null;
  }

  /** A visual copy of the part `source`, as a component: no ids, no Tab stops and no dragged appearance. */
  copyPart(source: ComponentBase, sized = true): Component<HTMLElement> {
    const box = rectOf(source);
    // browser object read: allowed exception
    const copy = new Component<HTMLElement>(plainCopy(source.element as HTMLElement));
    if (sized && box.width) css(copy, 'inline-size', `${Math.round(box.width)}px`);
    if (sized && box.height) css(copy, 'block-size', `${Math.round(box.height)}px`);
    return copy;
  }

  private open(content: ComponentBase, kind: string, root: ComponentBase | Document) {
    this.hide();
    if (!this.enabled()) {
      if (!content.isDisposed) void content.dispose({ skipLeaveTransition: true });
      return;
    }
    const box = new Component<HTMLDivElement>('div');
    box.class.add(this.className);
    box.attr.add({ 'data-kind': kind, 'aria-hidden': 'true' });
    // A copy of a button is still a button: nothing in it takes focus.
    mark(box, 'inert', true);
    // The box holds the copy, and it goes with the box.
    box.controls.add(content);
    if (isDocument(root)) placeOnPage(root, box);
    else root.controls.add(box);
    this.box = box;
    const r = rectOf(box);
    this.origin = { left: r.left, top: r.top };
  }
}

/** A deep copy of `source` with nothing that gives it a role: no ids, no Tab stops, no ARIA and no dragged mark. */
function plainCopy(source: HTMLElement): HTMLElement {
  // browser object read: allowed exception
  const copy = source.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
    node.removeAttribute('id');
    node.removeAttribute('tabindex');
    node.removeAttribute('data-dragging');
    for (const name of node.getAttributeNames()) if (name.startsWith('aria-')) node.removeAttribute(name);
  }
  return copy;
}
