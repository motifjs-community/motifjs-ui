// Below and after the pointer, so it never covers what is under it.
const OFFSET = 14;

/** How a copy shown with `showAt` follows the pointer. */
interface Follow {
  /** Where its top left corner sits from the pointer. */
  offset: { x: number; y: number };
  /** The axis it may move along. */
  direction: 'both' | 'vertical' | 'horizontal';
  /** Kept inside this box. */
  bounds: DOMRect | null;
  /** Where it started, for the axis it may not move along. */
  start: { left: number; top: number };
}

/**
 * The picture of something dragged (a header, a chip, a row, a tab): a copy of it next to the
 * pointer while it moves, marked with what a drop would do there (`data-target`). It lives inside
 * the element `root` gives, so it shows above a modal window that element sits in; its place is
 * measured from where it starts, so a moved or scaled window around it does not throw it off. The
 * component styles it through `className` and `data-kind`.
 */
export class DragGhost {
  private el: HTMLDivElement | null = null;
  private origin = { left: 0, top: 0 };
  private follow: Follow | null = null;

  constructor(
    private readonly root: () => HTMLElement,
    private readonly enabled: () => boolean,
    private readonly className: string,
  ) {}

  /** Whether a copy is shown. */
  get shown(): boolean {
    return !!this.el;
  }

  /** Starts showing a copy of `source`, as wide and as tall as it is, after the pointer. */
  show(source: HTMLElement, x: number, y: number, kind: string): void {
    this.open(this.copyOf(source), kind, this.root());
    this.move(x, y, 'none');
  }

  /**
   * Starts showing `content` (a copy, or a drag template) with its top left corner at `offset`
   * from the pointer, in `root`; it moves along `direction` only and stays in `bounds`.
   */
  showAt(content: Node, kind: string, x: number, y: number, options: { offset: { x: number; y: number }; root?: HTMLElement | null; direction?: Follow['direction']; bounds?: DOMRect | null }): void {
    this.open(content, kind, options.root ?? this.root());
    if (!this.el) return;
    this.follow = { offset: options.offset, direction: options.direction ?? 'both', bounds: options.bounds ?? null, start: { left: x - options.offset.x, top: y - options.offset.y } };
    this.move(x, y, 'none');
  }

  /** Follows the pointer; `target` says what dropping here would do. */
  move(x: number, y: number, target: string): void {
    const el = this.el;
    if (!el) return;
    let left = x + OFFSET;
    let top = y + OFFSET;
    const f = this.follow;
    if (f) {
      left = f.direction === 'vertical' ? f.start.left : x - f.offset.x;
      top = f.direction === 'horizontal' ? f.start.top : y - f.offset.y;
      if (f.bounds) {
        const b = f.bounds;
        left = Math.max(b.left, Math.min(b.right - el.offsetWidth, left));
        top = Math.max(b.top, Math.min(b.bottom - el.offsetHeight, top));
      }
    }
    el.style.transform = `translate(${Math.round(left - this.origin.left)}px, ${Math.round(top - this.origin.top)}px)`;
    if (el.dataset.target !== target) el.dataset.target = target;
  }

  hide(): void {
    this.el?.remove();
    this.el = null;
    this.follow = null;
  }

  /** A copy that looks the same and is nothing else: no ids, no Tab stops, not dragged-looking. */
  copyOf(source: HTMLElement, sized = true): HTMLElement {
    const box = source.getBoundingClientRect();
    const copy = source.cloneNode(true) as HTMLElement;
    for (const node of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
      node.removeAttribute('id');
      node.removeAttribute('tabindex');
      node.removeAttribute('data-dragging');
      for (const name of node.getAttributeNames()) if (name.startsWith('aria-')) node.removeAttribute(name);
    }
    if (sized && box.width) copy.style.inlineSize = `${Math.round(box.width)}px`;
    if (sized && box.height) copy.style.blockSize = `${Math.round(box.height)}px`;
    return copy;
  }

  private open(content: Node, kind: string, root: HTMLElement) {
    this.hide();
    if (!this.enabled()) return;
    const el = root.ownerDocument.createElement('div');
    el.className = this.className;
    el.dataset.kind = kind;
    el.setAttribute('aria-hidden', 'true');
    // A copy of a button is still a button: nothing in it takes focus.
    el.inert = true;
    el.append(content);
    root.append(el);
    const r = el.getBoundingClientRect();
    this.origin = { left: r.left, top: r.top };
    this.el = el;
  }
}
