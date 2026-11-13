import type { Component, ComponentBase } from '@motifx/core';
import { loose } from '../../core/draw-parts';
import type { Rect } from '../../core/measure';
import { css, kept } from '../../core/part-writes';

/**
 * What a drag shows for a manager: the translucent area a drop would take, and the mark between
 * two tabs where a tab would go. Both sit in the manager's element, fixed in the viewport above its
 * floating windows; the area glides from place to place (the motion tokens, so reduced motion
 * makes it jump).
 */
export class DropMarks {
  private readonly area: Component<HTMLDivElement>;
  private readonly mark: Component<HTMLDivElement>;

  /** `host`: the manager, or a new window's part; the marks are its children while they show. */
  constructor(private readonly host: ComponentBase) {
    this.area = loose<HTMLDivElement>('div', 'mx-tabdocs__drop');
    this.mark = loose<HTMLDivElement>('div', 'mx-tabdocs__insert');
    for (const part of [this.area, this.mark]) {
      kept(part, false);
      part.attr.add({ 'aria-hidden': 'true' });
    }
  }

  /** Shows the area and the mark (viewport boxes); `null` hides one. */
  show(area: Rect | null, mark: Rect | null): void {
    this.place(this.area, area);
    this.place(this.mark, mark);
  }

  hide(): void {
    this.show(null, null);
  }

  private place(part: Component<HTMLDivElement>, box: Rect | null): void {
    // Gone with the host (the manager, a closed window's part): nothing is left to show.
    if (part.isDisposed) return;
    if (!box) {
      kept(part, false);
      return;
    }
    if (part.parent !== this.host) this.host.controls.add(part);
    // Shown again, it is put back in the page: it starts where it is, with no style to glide from.
    kept(part, true);
    // Fixed in the viewport, so it shows over a floating window outside the manager too.
    css(part, 'left', `${Math.round(box.left)}px`);
    css(part, 'top', `${Math.round(box.top)}px`);
    // A line (no width) takes its width from the style, centred on the place.
    css(part, 'width', box.width ? `${Math.round(box.width)}px` : '');
    css(part, 'height', `${Math.round(box.height)}px`);
  }
}
