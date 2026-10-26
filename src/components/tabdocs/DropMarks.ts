/**
 * What a drag shows for a manager: the translucent area a drop would take, and the mark between
 * two tabs where a tab would go. Both sit in the manager's element, fixed in the viewport above its
 * floating windows; the area glides from place to place (the motion tokens, so reduced motion
 * makes it jump).
 */
export class DropMarks {
  private readonly area: HTMLDivElement;
  private readonly mark: HTMLDivElement;

  constructor(private readonly root: HTMLElement) {
    const doc = root.ownerDocument;
    this.area = doc.createElement('div');
    this.area.className = 'mx-tabdocs__drop';
    this.mark = doc.createElement('div');
    this.mark.className = 'mx-tabdocs__insert';
    for (const el of [this.area, this.mark]) {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    }
  }

  /** Shows the area and the mark (viewport boxes); `null` hides one. */
  show(area: DOMRect | null, mark: DOMRect | null): void {
    this.place(this.area, area);
    this.place(this.mark, mark);
  }

  hide(): void {
    this.show(null, null);
  }

  private place(el: HTMLDivElement, box: DOMRect | null): void {
    if (!box) {
      el.hidden = true;
      return;
    }
    if (!el.isConnected) this.root.append(el);
    const fresh = el.hidden;
    // Shown again: it starts where it is, it does not glide in from where it was last.
    if (fresh) el.setAttribute('data-instant', '');
    el.hidden = false;
    // Fixed in the viewport, so it shows over a floating window outside the manager too.
    const style = el.style;
    style.left = `${Math.round(box.left)}px`;
    style.top = `${Math.round(box.top)}px`;
    // A line (no width) takes its width from the style, centred on the place.
    style.width = box.width ? `${Math.round(box.width)}px` : '';
    style.height = `${Math.round(box.height)}px`;
    if (fresh) {
      void el.offsetWidth;
      el.removeAttribute('data-instant');
    }
  }
}
