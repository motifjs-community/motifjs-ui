import type { GhostTarget } from './ghost-target';

// Below and after the pointer, so it never covers what is under it.
const OFFSET = 14;

/**
 * The picture of a dragged header or chip: a copy of it, as wide as it is, next to the pointer while
 * it moves, marked with what a drop would do there. It lives inside the grid, so it shows above a
 * modal window the grid sits in; its place is measured from where it starts, so a moved or scaled
 * window around the grid does not throw it off.
 */
export class DragGhost {
  private el: HTMLDivElement | null = null;
  private origin = { left: 0, top: 0 };

  constructor(
    private readonly root: () => HTMLElement,
    private readonly enabled: () => boolean,
  ) {}

  /** Starts showing a copy of `source` (a header cell or a chip) under the pointer. */
  show(source: HTMLElement, x: number, y: number): void {
    this.hide();
    if (!this.enabled()) return;
    const el = document.createElement('div');
    el.className = 'mx-data-grid__ghost';
    el.dataset.kind = source.classList.contains('mx-data-grid__chip') ? 'chip' : 'header';
    el.setAttribute('aria-hidden', 'true');
    el.append(this.copy(source));
    this.root().append(el);
    const r = el.getBoundingClientRect();
    this.origin = { left: r.left, top: r.top };
    this.el = el;
    this.move(x, y, 'none');
  }

  /** Follows the pointer; `target` says what dropping here would do. */
  move(x: number, y: number, target: GhostTarget): void {
    const el = this.el;
    if (!el) return;
    el.style.transform = `translate(${Math.round(x - this.origin.left + OFFSET)}px, ${Math.round(y - this.origin.top + OFFSET)}px)`;
    if (el.dataset.target !== target) el.dataset.target = target;
  }

  hide(): void {
    this.el?.remove();
    this.el = null;
  }

  /** A copy that looks the same and is nothing else: no ids, no Tab stops, not dragged-looking. */
  private copy(source: HTMLElement): HTMLElement {
    const box = source.getBoundingClientRect();
    const copy = source.cloneNode(true) as HTMLElement;
    for (const node of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
      node.removeAttribute('id');
      node.removeAttribute('tabindex');
      node.removeAttribute('data-dragging');
      for (const name of node.getAttributeNames()) if (name.startsWith('aria-')) node.removeAttribute(name);
    }
    if (box.width) copy.style.inlineSize = `${Math.round(box.width)}px`;
    if (box.height) copy.style.blockSize = `${Math.round(box.height)}px`;
    return copy;
  }
}
